/**
 * Build the persisted adapter config from the form values collected by
 * `LovonGroqFreeConfigFields`. Only fields the user actually filled in
 * are sent — the server-side adapter falls back to env vars and defaults
 * for the rest.
 *
 * `CreateConfigValues` is a closed interface so we read custom fields
 * (apiKey, temperature, max_tokens) through a widened Record.
 */
export function buildLovonGroqFreeConfig(
  values: unknown,
): Record<string, unknown> {
  if (!values || typeof values !== "object") return {};
  const v = values as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  if (typeof v.model === "string") out.model = v.model;
  if (typeof v.apiKey === "string" && v.apiKey.trim().length > 0) {
    out.apiKey = v.apiKey.trim();
  }
  if (typeof v.temperature === "number" && Number.isFinite(v.temperature)) {
    out.temperature = v.temperature;
  }
  if (typeof v.max_tokens === "number" && Number.isFinite(v.max_tokens)) {
    out.max_tokens = v.max_tokens;
  }
  return out;
}