import type { AdapterConfigFieldsProps } from "../types";
import {
  DraftInput,
  Field,
  InlineField,
} from "../../components/agent-config-primitives";
import {
  LovonApiKeyField,
} from "../../components/lovon-onboarding/LovonApiKeyField";
import { getProviderMeta } from "../../components/lovon-onboarding/lovon-providers";

const inputClass =
  "w-full rounded-md border border-border px-2.5 py-1.5 bg-transparent outline-none text-sm font-mono placeholder:text-muted-foreground/40";
const selectClass = inputClass;

const MODEL_OPTIONS: Array<{ id: string; label: string }> = [
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile (recommended)" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant (fast)" },
  { id: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
  { id: "gemma2-9b-it", label: "Gemma 2 9B" },
];

export function LovonGroqFreeConfigFields({
  isCreate,
  values,
  set,
  config,
  eff,
  mark,
}: AdapterConfigFieldsProps) {
  // CreateConfigValues is a closed interface — we read/write custom fields
  // (apiKey, temperature, max_tokens) through a widened Record. The host UI
  // persists the resulting object verbatim into adapterConfig.
  const v = (values ?? {}) as Record<string, unknown>;

  const model = isCreate
    ? (typeof v.model === "string" ? v.model : "llama-3.3-70b-versatile")
    : eff<string>("adapterConfig", "model", "llama-3.3-70b-versatile");

  const apiKey = isCreate
    ? (typeof v.apiKey === "string" ? v.apiKey : "")
    : eff<string>("adapterConfig", "apiKey", "");

  const temperature = isCreate
    ? (typeof v.temperature === "number" ? v.temperature : 0.7)
    : eff<number>("adapterConfig", "temperature", 0.7);

  const maxTokens = isCreate
    ? (typeof v.max_tokens === "number" ? v.max_tokens : 4096)
    : eff<number>("adapterConfig", "max_tokens", 4096);

  const setField = (key: string, value: unknown) => {
    if (isCreate && set && values) {
      set({ [key]: value } as Partial<typeof values>);
    } else {
      mark("adapterConfig", key, value);
    }
  };

  // Resolve provider metadata from the central registry so the "Get key"
  // link stays in sync if we change the URL in one place.
  const groqMeta = getProviderMeta("lovon_groq_free");

  return (
    <>
      <Field
        label="Model"
        hint="Which Groq model this agent will run. Default is Llama 3.3 70B Versatile."
      >
        <select
          className={selectClass}
          value={model}
          onChange={(e) => setField("model", e.target.value)}
        >
          {MODEL_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </Field>

      {groqMeta ? (
        <LovonApiKeyField
          provider={groqMeta}
          value={apiKey}
          onCommit={(next) => setField("apiKey", next)}
        />
      ) : (
        <Field
          label="Groq API key"
          hint="Free API key from https://console.groq.com. Leave blank to fall back to GROQ_API_KEY."
        >
          <DraftInput
            value={apiKey}
            onCommit={(next) => setField("apiKey", next)}
            placeholder="gsk_..."
            type="password"
            className={inputClass}
          />
        </Field>
      )}

      <div className="grid grid-cols-2 gap-3">
        <InlineField label="Temperature" hint="0.0 = deterministic, 1.0 = creative">
          <DraftInput
            value={String(temperature)}
            onCommit={(v) => {
              const n = Number(v);
              if (Number.isFinite(n)) setField("temperature", n);
            }}
            type="number"
            className={inputClass}
          />
        </InlineField>

        <InlineField label="Max tokens" hint="Cap on the response length per call">
          <DraftInput
            value={String(maxTokens)}
            onCommit={(v) => {
              const n = Number(v);
              if (Number.isFinite(n) && n > 0) setField("max_tokens", n);
            }}
            type="number"
            className={inputClass}
          />
        </InlineField>
      </div>
    </>
  );
}
