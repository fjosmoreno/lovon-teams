/**
 * Lovon Teams · Groq Free — server-side adapter.
 *
 * Posts chat completion requests to the Groq REST API and returns the
 * assistant's reply as the run output. Supports **Groq function calling**
 * (https://console.groq.com/docs/tool-use) so the agent can take concrete
 * Paperclip actions (status updates, comments, child issues) instead of
 * just producing narrative plans. When the LLM invokes one of the
 * registered Paperclip tools, the adapter executes it against the local
 * Paperclip control plane using the run's auth token.
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
const MAX_TOOL_ITERATIONS = 4;

type GroqMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content?: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
  name?: string;
};

type GroqTool = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function readNumber(value: unknown, fallback: number): number {
  const n = typeof value === "string" ? Number(value) : typeof value === "number" ? value : NaN;
  return Number.isFinite(n) ? n : fallback;
}

const PAPERCLIP_TOOLS: GroqTool[] = [
  {
    type: "function",
    function: {
      name: "update_issue_status",
      description:
        "Update the issue's status (and optionally its assignee or add a comment). Use this to mark the issue done, send it to in_review with yourself as the current participant, mark it blocked with first-class blockers, or set it back to in_progress. Pick the disposition that matches your conclusion.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["todo", "in_progress", "in_review", "blocked", "done", "cancelled"],
            description: "The new status for the issue.",
          },
          comment: {
            type: "string",
            description:
              "Optional comment to attach to the status change. Required when transitioning to in_review or when requesting changes.",
          },
          assigneeUserId: {
            type: "string",
            description: "Optional user id to assign the issue to (human handoff).",
          },
          executionPolicy: {
            type: "object",
            description:
              "Optional execution policy (review/approval stages). Pass this when transitioning to in_review so the system knows who reviews the work.",
          },
        },
        required: ["status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_comment",
      description:
        "Post a free-form comment to the issue thread without changing its status. Use this to leave durable progress notes, partial findings, or to ask a follow-up question.",
      parameters: {
        type: "object",
        properties: {
          body: {
            type: "string",
            description: "The comment body, in plain text or Markdown.",
          },
        },
        required: ["body"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_child_issue",
      description:
        "Create a follow-up issue under the same project and company. Use this to delegate parallel or long-running work so you can close the current issue without losing context.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Title of the new issue.",
          },
          description: {
            type: "string",
            description: "Markdown description of the new issue's scope.",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high", "critical"],
          },
          assigneeAgentId: {
            type: "string",
            description: "Optional agent id to assign the new issue to.",
          },
        },
        required: ["title"],
      },
    },
  },
];

const TOOL_DISPOSITION_PROMPT = `You are running inside a Paperclip control plane. When you have a concrete next action, you MUST invoke one of the available tools (update_issue_status, add_comment, create_child_issue) instead of just describing the action in prose. The narrative-only recovery prompt loop is bypassed when you call a tool.

Decision rule:
- Task complete? → call update_issue_status with status="done" and a short summary comment.
- Need a human to review your work? → call update_issue_status with status="in_review" and a comment explaining what to verify.
- Cannot proceed without missing info? → call update_issue_status with status="blocked" and a comment naming the unblock owner/action.
- Delegating follow-up? → call create_child_issue for each chunk of delegated work, then either set status="done" if your own scope is complete or status="in_progress" with a resume plan.
- Just want to leave a note? → call add_comment.

A reply that ends with plain text but no tool call is treated as "no disposition" and will trigger a corrective wake. Take the action via tools.`;

interface GroqChatResponse {
  id?: string;
  model?: string;
  choices?: Array<{
    index?: number;
    finish_reason?: string;
    message?: {
      role?: string;
      content?: string | null;
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }>;
    };
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
  const promptTemplate = readString(ctx.config.promptTemplate) ?? DEFAULT_PAPERCLIP_AGENT_PROMPT_TEMPLATE;

  const wakePrompt = renderPaperclipWakePrompt(ctx.context.paperclipWake);
  const renderedPrompt = renderTemplate(promptTemplate, {
    agent: ctx.agent,
    run: { id: ctx.runId },
    context: ctx.context,
  });

  return joinPromptSections([wakePrompt, TOOL_DISPOSITION_PROMPT, renderedPrompt]);
}

interface ToolResult {
  ok: boolean;
  summary: string;
  detail?: unknown;
}

function resolvePaperclipBase(): string | null {
  return (
    readString(process.env.PAPERCLIP_API_URL) ??
    readString(process.env.PAPERCLIP_BASE_URL) ??
    null
  );
}

function resolveIssueId(ctx: AdapterExecutionContext): string | null {
  const wake = ctx.context.paperclipWake as Record<string, unknown> | undefined;
  const wakeIssue = wake?.issue as Record<string, unknown> | undefined;
  return (
    readString(wakeIssue?.id) ??
    readString(ctx.runtime.taskKey) ??
    null
  );
}

function resolveCompanyId(ctx: AdapterExecutionContext): string | null {
  return readString(ctx.agent.companyId);
}

async function callPaperclip(
  ctx: AdapterExecutionContext,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<ToolResult> {
  const base = resolvePaperclipBase();
  const token = readString(ctx.authToken);
  const companyId = resolveCompanyId(ctx);

  if (!base) {
    return {
      ok: false,
      summary: `PAPERCLIP_API_URL not set — adapter cannot reach the control plane to execute ${method} ${path}.`,
    };
  }
  if (!token) {
    return {
      ok: false,
      summary: `No run auth token — cannot authenticate against the control plane.`,
    };
  }
  if (!companyId) {
    return {
      ok: false,
      summary: `No company id on the agent record — cannot scope the call.`,
    };
  }

  try {
    const response = await fetch(`${base.replace(/\/$/, "")}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-Paperclip-Company-Id": companyId,
        Origin: base.replace(/\/$/, ""),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await response.text().catch(() => "");
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }
    }
    if (!response.ok) {
      return {
        ok: false,
        summary: `Control plane ${method} ${path} → HTTP ${response.status}`,
        detail: parsed,
      };
    }
    return {
      ok: true,
      summary: `Control plane ${method} ${path} → HTTP ${response.status}`,
      detail: parsed,
    };
  } catch (err) {
    return {
      ok: false,
      summary: `Control plane ${method} ${path} request failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

async function executeToolCall(
  ctx: AdapterExecutionContext,
  name: string,
  rawArgs: string,
): Promise<ToolResult> {
  let args: Record<string, unknown> = {};
  try {
    const parsed = rawArgs ? JSON.parse(rawArgs) : {};
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      args = parsed as Record<string, unknown>;
    }
  } catch {
    return { ok: false, summary: `Tool ${name} got unparseable arguments: ${rawArgs.slice(0, 200)}` };
  }

  const issueId = resolveIssueId(ctx);
  if (!issueId) {
    return {
      ok: false,
      summary: `Cannot resolve issue id for tool ${name}.`,
    };
  }

  switch (name) {
    case "update_issue_status": {
      const status = readString(args.status);
      if (!status) {
        return { ok: false, summary: "update_issue_status requires a `status` argument" };
      }
      const body: Record<string, unknown> = { status };
      const comment = readString(args.comment);
      if (comment) body.comment = comment;
      if (args.assigneeUserId) body.assigneeUserId = args.assigneeUserId;
      if (args.executionPolicy && typeof args.executionPolicy === "object") {
        body.executionPolicy = args.executionPolicy;
      }
      return callPaperclip(ctx, "PATCH", `/api/issues/${issueId}`, body);
    }
    case "add_comment": {
      const body = readString(args.body);
      if (!body) {
        return { ok: false, summary: "add_comment requires a `body` argument" };
      }
      return callPaperclip(ctx, "POST", `/api/issues/${issueId}/comments`, { body });
    }
    case "create_child_issue": {
      const title = readString(args.title);
      if (!title) {
        return { ok: false, summary: "create_child_issue requires a `title` argument" };
      }
      const body: Record<string, unknown> = {
        title,
        description: readString(args.description) ?? "",
      };
      if (args.priority) body.priority = args.priority;
      if (args.assigneeAgentId) body.assigneeAgentId = args.assigneeAgentId;
      // Inherit parent identifier prefix by linking the new issue to the
      // same project/goal as the source issue.
      const source = await callPaperclip(ctx, "GET", `/api/issues/${issueId}`);
      if (source.ok && source.detail && typeof source.detail === "object") {
        const src = source.detail as Record<string, unknown>;
        if (src.projectId) body.projectId = src.projectId;
        if (src.goalId) body.goalId = src.goalId;
        if (src.companyId) body.companyId = src.companyId;
      }
      return callPaperclip(ctx, "POST", `/api/issues`, body);
    }
    default:
      return { ok: false, summary: `Unknown tool ${name}` };
  }
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
    context: { model, temperature, max_tokens: maxTokens, tools: PAPERCLIP_TOOLS.map((t) => t.function.name) },
  });

  // Try the configured model first, then fall back to the cheap model
  // (llama-3.1-8b-instant, 20k TPM vs 6-12k) if the primary hits a rate
  // limit. We don't bother falling back on non-429 errors (bad request,
  // auth) because those won't be solved by retrying on a smaller model.
  const fallbackModel = "llama-3.1-8b-instant";
  const candidates = model === fallbackModel ? [model] : [model, fallbackModel];

  let lastFailure: RunWithToolsFailure | null = null;
  for (const candidate of candidates) {
    const result = await runWithTools({
      apiKey: apiKey!,
      model: candidate,
      prompt,
      temperature,
      maxTokens,
      ctx,
    });
    if (result.ok) {
      if (candidate !== model) {
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

  return lastFailure!.value;
}

interface RunWithToolsResult {
  ok: true;
  value: AdapterExecutionResult;
}
interface RunWithToolsFailure {
  ok: false;
  reason: "rate_limit" | "other";
  value: AdapterExecutionResult;
}

async function runWithTools(args: {
  apiKey: string;
  model: string;
  prompt: string;
  temperature: number;
  maxTokens: number;
  ctx: AdapterExecutionContext;
}): Promise<RunWithToolsResult | RunWithToolsFailure> {
  const { apiKey, model, prompt, temperature, maxTokens, ctx } = args;
  const messages: GroqMessage[] = [{ role: "user", content: prompt }];
  const toolCallLog: Array<{ name: string; ok: boolean; summary: string }> = [];
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  let finalText = "";
  let finishReason: string | null = null;
  let responseId: string | null = null;
  let responseModel: string | null = model;

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration += 1) {
    const groqResult = await callGroqRaw({
      apiKey,
      model,
      messages,
      tools: PAPERCLIP_TOOLS,
      temperature,
      maxTokens,
    });
    if (!groqResult.ok) {
      return { ok: false, reason: groqResult.reason, value: groqResult.value };
    }
    const choice = groqResult.value.choices?.[0];
    const message = choice?.message;
    if (groqResult.value.usage) {
      totalPromptTokens += groqResult.value.usage.prompt_tokens ?? 0;
      totalCompletionTokens += groqResult.value.usage.completion_tokens ?? 0;
    }
    responseId = groqResult.value.id ?? responseId;
    responseModel = groqResult.value.model ?? responseModel;
    finishReason = choice?.finish_reason ?? finishReason;

    if (message?.content) {
      finalText = message.content;
      await ctx.onLog("stdout", message.content);
    }

    const toolCalls = message?.tool_calls ?? [];
    if (toolCalls.length === 0) {
      break;
    }

    messages.push({
      role: "assistant",
      content: message?.content ?? null,
      tool_calls: toolCalls,
    });

    for (const call of toolCalls) {
      const fnName = call.function.name;
      const fnArgs = call.function.arguments;
      await ctx.onLog(
        "stdout",
        `[lovon-groq-free] tool call: ${fnName}(${fnArgs.slice(0, 240)}${fnArgs.length > 240 ? "…" : ""})\n`,
      );
      const result = await executeToolCall(ctx, fnName, fnArgs);
      toolCallLog.push({ name: fnName, ok: result.ok, summary: result.summary });
      await ctx.onLog(
        "stdout",
        `[lovon-groq-free] tool ${fnName} → ${result.ok ? "ok" : "fail"}: ${result.summary}\n`,
      );
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        name: fnName,
        content: JSON.stringify({ ok: result.ok, summary: result.summary, detail: result.detail ?? null }),
      });
    }
  }

  const usage = {
    inputTokens: totalPromptTokens,
    outputTokens: totalCompletionTokens,
    totalTokens: totalPromptTokens + totalCompletionTokens,
  };

  return {
    ok: true,
    value: {
      exitCode: 0,
      signal: null,
      timedOut: false,
      resultJson: {
        content: finalText,
        model: responseModel,
        finish_reason: finishReason,
        id: responseId,
        toolCalls: toolCallLog,
      },
      usage,
      model: responseModel,
      provider: "groq",
      biller: "lovon_teams",
      billingType: "api",
      summary: toolCallLog.length
        ? `tools: ${toolCallLog.map((t) => `${t.name}=${t.ok ? "ok" : "fail"}`).join(", ")}`
        : finalText.slice(0, 240),
    },
  };
}

async function callGroqRaw(args: {
  apiKey: string;
  model: string;
  messages: GroqMessage[];
  tools: GroqTool[];
  temperature: number;
  maxTokens: number;
}): Promise<
  | { ok: true; value: GroqChatResponse }
  | { ok: false; reason: "rate_limit" | "other"; value: AdapterExecutionResult }
> {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: args.model,
        messages: args.messages,
        tools: args.tools,
        tool_choice: "auto",
        temperature: args.temperature,
        max_tokens: args.maxTokens,
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
    return { ok: true, value: data };
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

// Keep the legacy function exported so older callers that import it
// directly still work (the previous single-shot path used it).
// Silence "unused" warnings for helpers that are imported but only used
// inside the tool path.
void buildPaperclipEnv;