/**
 * Lovon Teams · Groq Free adapter.
 *
 * REST-only adapter for the Groq free tier. No local CLI required — only a
 * GROQ_API_KEY. Uses the OpenAI-compatible /v1/chat/completions endpoint.
 *
 * Upstream: https://console.groq.com (free API key)
 * License: MIT
 * Original concept derived from Paperclip (paperclip.ing), MIT.
 */
import type { AdapterModel, AdapterModelProfileDefinition } from "@paperclipai/adapter-utils";

export const type = "lovon_groq_free";
export const label = "Lovon · Groq Free";

export const DEFAULT_LOVON_GROQ_MODEL = "llama-3.3-70b-versatile";

export const models: AdapterModel[] = [
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile (recommended)" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant (fast)" },
  { id: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
  { id: "gemma2-9b-it", label: "Gemma 2 9B" },
];

export const modelProfiles: AdapterModelProfileDefinition[] = [
  {
    key: "cheap",
    label: "Cheap",
    description: "Use Llama 3.1 8B Instant as the budget lane while preserving the primary model.",
    adapterConfig: { model: "llama-3.1-8b-instant" },
    source: "adapter_default",
  },
];

export const agentConfigurationDoc = `# lovon_groq_free — Lovon Teams · Groq Free

Adapter for the Groq free tier (REST API, no local CLI).

## When to use
- You want fast inference without installing a local agent runtime.
- You have (or can get) a free Groq API key from https://console.groq.com.
- You want Llama / Mixtral / Gemma models without paying for OpenAI or Claude.

## When NOT to use
- You need streaming responses (this MVP adapter is request/response only;
  Lovon Teams will add streaming in a future pass).
- You need a coding-agent loop with shell execution (use gemini_local, claude_local,
  or codex_local for that — they spawn a CLI that handles tools and edits).

## Configuration

- **model** (string, optional): Groq model id. Defaults to \`llama-3.3-70b-versatile\`.
- **apiKey** (string, optional): Groq API key. If omitted, the adapter falls back to
  the \`GROQ_API_KEY\` environment variable.

## Free tier (as of 2026)

| Model | Tokens / minute | Tokens / day |
|---|---|---|
| llama-3.3-70b-versatile | 6,000 | unlimited |
| llama-3.1-8b-instant | 20,000 | unlimited |
| mixtral-8x7b-32768 | 5,000 | unlimited |
| gemma2-9b-it | 15,000 | 14,400 |

Current limits: https://console.groq.com/docs/rate-limits

## Headroom integration

If \`HEADROOM_URL\` is set and \`HEADROOM_ENABLED=1\` in the server environment,
the adapter will route the request through Headroom for caching and prompt
compression. See \`doc/lovon-headroom.md\`.
`;