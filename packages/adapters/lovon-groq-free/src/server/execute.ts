/**
 * Lovon Teams · Groq Free — server-side adapter.
 *
 * Posts a single chat completion request to the Groq REST API and returns
 * the assistant's reply as the run output. No session continuity (each run
 * is a fresh request) — Groq's free tier is fast enough that this is fine
 * for the MVP.
 */
import type {
  AdapterExecutionContext,
  AdapterExecutionResult,
} from "@paperclipai/adapter-utils";
import {
  DEFAULT_PAPERCLIP_AGENT_PROMPT_TEMPLATE,
  buildPaperclipEnv,
  joinPromptSections,
  renderPaperclipWakePrompt,
  renderTemplate,
} from "@paperclipai/adapter-utils/server-utils";

const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 60_000;

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function readNumber(value: unknown, fallback: number): number {
  const n = typeof value === "string" ? Number(value) : typeof value === "number" ? value : NaN;
  return Number.isFinite(n) ? n : fallback;
}

interface GroqChatResponse {
  id?: string;
  model?: string;
  choices?: Array<{
    index?: number;
    finish_reason?: string;
    message?: { role?: string; content?: string };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

function resolveApiKey(ctx: AdapterExecutionContext): string | null {
  const configEnv = (ctx.config.env as Record<string, unknown> | undefined) ?? {};
  return (
    readString(process.env.GROQ_API_KEY) ??
    readString(configEnv.GROQ_API_KEY) ??
    readString(ctx.config.apiKey) ??
    readString(ctx.config.api_key)
  );
}

function resolveModel(ctx: AdapterExecutionContext): string {
  const configEnv = (ctx.config.env as Record<string, unknown> | undefined) ?? {};
  return (
    readString(process.env.LOVON_GROQ_MODEL) ??
    readString(ctx.config.model) ??
    "llama-3.3-70b-versatile"
  );
}

function resolvePrompt(ctx: AdapterExecutionContext): string {
  // Mirror the upstream gemini_local pattern: build the prompt from the
  // Paperclip wake payload (heartbeat reason + issue context) joined with
  // the agent's configured promptTemplate. Direct ctx.context.prompt is
  // intentionally ignored because Paperclip never sets it — it always
  // routes through paperclipWake + promptTemplate.
  const promptTemplate = readString(ctx.config.promptTemplate) ?? DEFAULT_PAPERCLIP_AGENT_PROMPT_TEMPLATE;

  const wakePrompt = renderPaperclipWakePrompt(ctx.context.paperclipWake);
  const renderedPrompt = renderTemplate(promptTemplate, {
    agent: ctx.agent,
    run: { id: ctx.runId },
    context: ctx.context,
  });

  return joinPromptSections([wakePrompt, renderedPrompt]);
}

export async function execute(
  ctx: AdapterExecutionContext,
): Promise<AdapterExecutionResult> {
  const apiKey = resolveApiKey(ctx);

  if (!apiKey) {
    return {
      exitCode: 1,
      signal: null,
      timedOut: false,
      errorMessage:
        "GROQ_API_KEY not configured. Get a free key at https://console.groq.com and either set the GROQ_API_KEY environment variable or paste it into the adapter config.",
      errorCode: "groq_api_key_missing",
      errorFamily: "transient_upstream",
    };
  }

  const prompt = resolvePrompt(ctx);
  if (!prompt) {
    return {
      exitCode: 1,
      signal: null,
      timedOut: false,
      errorMessage: "Lovon · Groq Free received an empty prompt.",
      errorCode: "empty_prompt",
    };
  }

  const model = resolveModel(ctx);
  const temperature = readNumber(ctx.config.temperature, 0.5);
  // Free-tier TPM is the binding constraint. 1536 output tokens is enough
  // for most agent replies and leaves headroom for input. Pairs with a
  // cheap-model fallback so a 429 on the primary model still completes the
  // run instead of failing the heartbeat.
  const maxTokens = readNumber(ctx.config.max_tokens, 1536);

  await ctx.onMeta?.({
    adapterType: "lovon_groq_free",
    command: "groq-api",
    prompt,
    context: { model, temperature, max_tokens: maxTokens },
  });

  // Try the configured model first, then fall back to the cheap model
  // (llama-3.1-8b-instant, 20k TPM vs 6-12k) if the primary hits a rate
  // limit. We don't bother falling back on non-429 errors (bad request,
  // auth) because those won't be solved by retrying on a smaller model.
  const fallbackModel = "llama-3.1-8b-instant";
  const candidates = model === fallbackModel ? [model] : [model, fallbackModel];

  let lastFailure: Awaited<ReturnType<typeof callGroq>> | null = null;
  for (const candidate of candidates) {
    const result = await callGroq(
      apiKey!,
      candidate,
      prompt,
      temperature,
      maxTokens,
      ctx,
    );
    if (result.ok) {
      if (candidate !== model) {
        // Surface the fallback in stdout so the run log records that
        // the cheap lane was used. Operators auditing the run can see it
        // happened without diving into the adapter metadata.
        await ctx.onLog(
          "stdout",
          `[lovon-groq-free] primary '${model}' rate-limited, served by '${candidate}'\n`,
        );
      }
      return result.value;
    }
    lastFailure = result;
    if (result.reason !== "rate_limit") break;
  }

  // Both models failed. Surface the primary's error verbatim; that has
  // the actual quota counters + retry-after hint the user needs.
  return lastFailure!.value;
}

async function callGroq(
  apiKey: string,
  model: string,
  prompt: string,
  temperature: number,
  maxTokens: number,
  ctx: AdapterExecutionContext,
): Promise<
  | { ok: true; value: AdapterExecutionResult }
  | { ok: false; reason: "rate_limit" | "other"; value: AdapterExecutionResult }
> {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutHandle);

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      const isQuota = response.status === 429 || response.status === 503;
      return {
        ok: false,
        reason: isQuota ? "rate_limit" : "other",
        value: {
          exitCode: 1,
          signal: null,
          timedOut: false,
          errorMessage: `Groq API ${response.status} ${response.statusText}: ${errorText.slice(0, 500)}`,
          errorCode: `groq_http_${response.status}`,
          errorFamily: isQuota ? "transient_upstream" : null,
          retryNotBefore: isQuota
            ? new Date(Date.now() + 30_000).toISOString()
            : null,
        },
      };
    }

    const data = (await response.json()) as GroqChatResponse;
    const text = data.choices?.[0]?.message?.content ?? "";

    if (text) {
      await ctx.onLog("stdout", text);
    }

    const usage = data.usage
      ? {
          inputTokens: data.usage.prompt_tokens ?? 0,
          outputTokens: data.usage.completion_tokens ?? 0,
          totalTokens: data.usage.total_tokens ?? 0,
        }
      : undefined;

    return {
      ok: true,
      value: {
        exitCode: 0,
        signal: null,
        timedOut: false,
        resultJson: {
          content: text,
          model: data.model ?? model,
          finish_reason: data.choices?.[0]?.finish_reason ?? null,
          id: data.id ?? null,
        },
        usage,
        model: data.model ?? model,
        provider: "groq",
        biller: "lovon_teams",
        billingType: "api",
        summary: text.slice(0, 240),
      },
    };
  } catch (err) {
    clearTimeout(timeoutHandle);
    const timedOut = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      reason: "other",
      value: {
        exitCode: 1,
        signal: null,
        timedOut,
        errorMessage: timedOut
          ? `Groq API request timed out after ${REQUEST_TIMEOUT_MS}ms`
          : `Groq API request failed: ${err instanceof Error ? err.message : String(err)}`,
        errorCode: timedOut ? "groq_timeout" : "groq_network_error",
        errorFamily: "transient_upstream",
      },
    };
  }
}