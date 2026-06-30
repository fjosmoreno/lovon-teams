/**
 * Central registry of free-tier Lovon provider metadata, used by
 * LovonApiKeyField and the home-page install quickstart to keep "get key"
 * links and env-var fallbacks consistent everywhere they appear.
 *
 * When you add a new free adapter, add an entry here — the UI will pick it up.
 */

export type ProviderMeta = {
  id: string;
  label: string;
  keyUrl: string;
  keyPrefixRegex?: RegExp;
  keyHint?: string;
  envVar?: string;
  testEndpoint?: string;
  notes?: string;
};

export const LOVON_FREE_PROVIDERS: ProviderMeta[] = [
  {
    id: "lovon_groq_free",
    label: "Groq",
    keyUrl: "https://console.groq.com/keys",
    keyPrefixRegex: /^gsk_[A-Za-z0-9_-]{20,}$/,
    keyHint: "starts with `gsk_`",
    envVar: "GROQ_API_KEY",
    testEndpoint: "https://api.groq.com/openai/v1/models",
    notes: "Free tier · Llama 3.3 70B / 3.1 8B / Mixtral / Gemma. ~30 req/s.",
  },
  {
    id: "gemini_local",
    label: "Gemini",
    keyUrl: "https://aistudio.google.com/apikey",
    keyPrefixRegex: /^AIza[A-Za-z0-9_-]{30,}$/,
    keyHint: "starts with `AIza`",
    envVar: "GEMINI_API_KEY",
    testEndpoint:
      "https://generativelanguage.googleapis.com/v1beta/models?key=test",
    notes: "Free tier · Gemini 2.0 Flash. 15 RPM, 1500 RPD.",
  },
  {
    id: "github_models",
    label: "GitHub Models",
    keyUrl: "https://github.com/settings/personal-access-tokens",
    keyPrefixRegex: /^(ghp_|github_pat_|gho_)[A-Za-z0-9]{20,}$/,
    keyHint: "starts with `github_pat_` or `ghp_`",
    envVar: "GITHUB_TOKEN",
    notes: "Free with GitHub account · GPT-4o, Claude 3.5, Llama. 50 req/day.",
  },
  {
    id: "cloudflare_ai",
    label: "Cloudflare AI",
    keyUrl: "https://dash.cloudflare.com/profile/api-tokens",
    keyPrefixRegex: /^[A-Za-z0-9_-]{30,}$/,
    keyHint: "≥30 chars (no fixed prefix)",
    envVar: "CLOUDFLARE_API_TOKEN",
    notes: "Free tier · Workers AI. 10k neurons/day.",
  },
  {
    id: "huggingface",
    label: "Hugging Face",
    keyUrl: "https://huggingface.co/settings/tokens",
    keyPrefixRegex: /^hf_[A-Za-z0-9]{20,}$/,
    keyHint: "starts with `hf_`",
    envVar: "HF_TOKEN",
    notes: "Free tier · Inference API. Many open models.",
  },
  {
    id: "cohere_trial",
    label: "Cohere",
    keyUrl: "https://dashboard.cohere.com/api-keys",
    keyPrefixRegex: /^[A-Za-z0-9_-]{30,}$/,
    keyHint: "≥30 chars",
    envVar: "COHERE_API_KEY",
    notes: "Trial tier · Command R+. 1000 req/mo.",
  },
  {
    id: "mistral_free",
    label: "Mistral",
    keyUrl: "https://console.mistral.ai/api-keys/",
    keyPrefixRegex: /^[A-Za-z0-9]{20,}$/,
    keyHint: "≥20 chars",
    envVar: "MISTRAL_API_KEY",
    notes: "Free tier · Mistral 7B / Mixtral. 5 req/s.",
  },
  {
    id: "openrouter_free",
    label: "OpenRouter",
    keyUrl: "https://openrouter.ai/keys",
    keyPrefixRegex: /^sk-or-[A-Za-z0-9_-]{20,}$/,
    keyHint: "starts with `sk-or-`",
    envVar: "OPENROUTER_API_KEY",
    notes: "Free models · Auto-routes to many providers.",
  },
];

export function getProviderMeta(id: string): ProviderMeta | undefined {
  return LOVON_FREE_PROVIDERS.find((p) => p.id === id);
}
