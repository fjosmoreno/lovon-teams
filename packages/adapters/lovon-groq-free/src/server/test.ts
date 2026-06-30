/**
 * Lovon Teams · Groq Free — environment test.
 *
 * Checks for the GROQ_API_KEY (env or config), then probes the Groq /v1/models
 * endpoint to confirm the key is valid and the network can reach Groq.
 */
import type {
  AdapterEnvironmentCheck,
  AdapterEnvironmentTestContext,
  AdapterEnvironmentTestResult,
} from "@paperclipai/adapter-utils";

function readNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function resolveApiKey(ctx: AdapterEnvironmentTestContext): string | null {
  const configEnv = (ctx.config.env as Record<string, unknown> | undefined) ?? {};
  return (
    readNonEmptyString(process.env.GROQ_API_KEY) ??
    readNonEmptyString(configEnv.GROQ_API_KEY) ??
    readNonEmptyString(ctx.config.apiKey) ??
    readNonEmptyString(ctx.config.api_key)
  );
}

async function probeLive(apiKey: string): Promise<AdapterEnvironmentCheck> {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (response.ok) {
      return {
        code: "groq_api_probe",
        level: "info",
        message: `Groq API reachable (HTTP ${response.status})`,
        detail: "Listed available models successfully.",
      };
    }
    const errorText = await response.text().catch(() => response.statusText);
    return {
      code: "groq_api_probe_failed",
      level: response.status === 401 || response.status === 403 ? "error" : "warn",
      message: `Groq API probe returned ${response.status} ${response.statusText}`,
      detail: errorText.slice(0, 280),
      hint:
        response.status === 401 || response.status === 403
          ? "The GROQ_API_KEY was rejected. Verify the key at https://console.groq.com."
          : "Transient upstream error — the agent may still succeed on the next heartbeat.",
    };
  } catch (err) {
    return {
      code: "groq_api_probe_unreachable",
      level: "warn",
      message: `Could not reach Groq API: ${err instanceof Error ? err.message : String(err)}`,
      hint: "This may be a transient network issue or a corporate proxy blocking api.groq.com.",
    };
  }
}

export async function testEnvironment(
  ctx: AdapterEnvironmentTestContext,
): Promise<AdapterEnvironmentTestResult> {
  const checks: AdapterEnvironmentCheck[] = [];
  const apiKey = resolveApiKey(ctx);

  if (!apiKey) {
    checks.push({
      code: "groq_api_key_missing",
      level: "error",
      message: "GROQ_API_KEY is not set",
      hint: "Get a free key at https://console.groq.com and either set the GROQ_API_KEY env var or paste it into the adapter config.",
    });
  } else {
    checks.push({
      code: "groq_api_key",
      level: "info",
      message: "GROQ_API_KEY found",
      detail: "Probing Groq API...",
    });
    checks.push(await probeLive(apiKey));
  }

  const status: AdapterEnvironmentTestResult["status"] = checks.some(
    (c) => c.level === "error",
  )
    ? "fail"
    : checks.some((c) => c.level === "warn")
      ? "warn"
      : "pass";

  return {
    adapterType: "lovon_groq_free",
    status,
    checks,
    testedAt: new Date().toISOString(),
  };
}