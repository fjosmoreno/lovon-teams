/**
 * LovonApiKeyField — reusable API key input with "Get key here" link,
 * copy-to-clipboard button, prefix validation, and env-var fallback hint.
 *
 * Designed to lower the friction of entering an API key for free-tier
 * providers: every field points the user to the provider's actual key
 * console in a single click, with the format prefix already filled in
 * the placeholder so users see what they should expect.
 *
 * Replaces raw password inputs scattered across adapter config fields.
 */
import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, KeyRound, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { DraftInput, Field } from "@/components/agent-config-primitives";

export type LovonProviderMeta = {
  /** Stable adapter id (e.g. "lovon_groq_free", "gemini_local"). */
  id: string;
  /** Human-friendly provider label shown in links / hints. */
  label: string;
  /** URL of the provider's API key management console. */
  keyUrl: string;
  /** Optional regex the key must match (e.g. /^gsk_/). */
  keyPrefixRegex?: RegExp;
  /** Human-readable format shown in the hint (e.g. "starts with `gsk_`"). */
  keyHint?: string;
  /** Environment variable name that falls back when the field is blank. */
  envVar?: string;
  /** Optional test endpoint URL; if provided, shows a "Test" button. */
  testEndpoint?: string;
};

const inputClass =
  "w-full rounded-md border border-border px-2.5 py-1.5 pr-20 bg-transparent outline-none text-sm font-mono placeholder:text-muted-foreground/40";

function inferPrefix(re?: RegExp): string | null {
  if (!re) return null;
  // Pull a literal prefix like gsk_ from /^gsk_[A-Za-z0-9]+$/
  const src = re.source.replace(/^\^|\$$/g, "");
  const m = src.match(/^([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

export function LovonApiKeyField({
  provider,
  value,
  onCommit,
  className,
}: {
  provider: LovonProviderMeta;
  value: string;
  onCommit: (next: string) => void;
  className?: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"idle" | "ok" | "fail">("idle");

  useEffect(() => setTestResult("idle"), [value]);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const formatOk =
    !value || !provider.keyPrefixRegex || provider.keyPrefixRegex.test(value);
  const prefix = inferPrefix(provider.keyPrefixRegex);

  const placeholder = prefix ? `${prefix}...` : "paste API key";

  const copyCmd = async () => {
    if (provider.envVar) {
      const cmd =
        provider.envVar === "GITHUB_TOKEN"
          ? `echo "$GITHUB_TOKEN" | pbcopy`
          : `echo "$${provider.envVar}" | pbcopy`;
      try {
        await navigator.clipboard.writeText(cmd);
        setCopied(true);
      } catch {
        /* no-op */
      }
    }
  };

  const testKey = async () => {
    if (!provider.testEndpoint || !value) return;
    setTesting(true);
    setTestResult("idle");
    try {
      const res = await fetch(provider.testEndpoint, {
        method: "GET",
        headers: { Authorization: `Bearer ${value}` },
      });
      setTestResult(res.ok ? "ok" : "fail");
    } catch {
      setTestResult("fail");
    } finally {
      setTesting(false);
    }
  };

  return (
    <Field
      label={`${provider.label} API key`}
      hint={
        provider.envVar
          ? `Leave blank to fall back to $${provider.envVar}.${provider.keyHint ? ` Keys ${provider.keyHint}.` : ""}`
          : provider.keyHint ?? undefined
      }
    >
      <div className={cn("relative", className)}>
        <KeyRound className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
        <DraftInput
          value={value}
          onCommit={onCommit}
          placeholder={placeholder}
          type={revealed ? "text" : "password"}
          autoComplete="off"
          spellCheck={false}
          className={cn(inputClass, "pl-9", !formatOk && "border-red-500/60 focus:border-red-500")}
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            className="cursor-pointer rounded p-1 text-muted-foreground/60 transition hover:bg-white/5 hover:text-foreground"
            aria-label={revealed ? "Hide API key" : "Show API key"}
            title={revealed ? "Hide" : "Show"}
          >
            {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Quick action row */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <a
          href={provider.keyUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 rounded-md border border-cyan-400/30 bg-cyan-400/5 px-2.5 py-1 font-mono text-[11px] text-cyan-300 transition hover:border-cyan-400/60 hover:bg-cyan-400/10"
        >
          <ExternalLink className="h-3 w-3" />
          Get {provider.label} key
        </a>
        {provider.envVar && (
          <button
            type="button"
            onClick={copyCmd}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-muted-foreground transition hover:bg-white/[0.06]"
            title="Copy the command to read this env var into your clipboard (macOS)"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied!" : `Use $${provider.envVar}`}
          </button>
        )}
        {provider.testEndpoint && value && (
          <button
            type="button"
            onClick={testKey}
            disabled={testing || !formatOk}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11px] transition",
              testResult === "ok"
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                : testResult === "fail"
                ? "border-red-400/40 bg-red-400/10 text-red-300"
                : "border-white/10 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06]"
            )}
          >
            {testing ? "Testing…" : testResult === "ok" ? "✓ Connected" : testResult === "fail" ? "✕ Failed" : "Test"}
          </button>
        )}
      </div>
      {!formatOk && (
        <p className="mt-1 font-mono text-[11px] text-red-400">
          Format mismatch — {provider.keyHint ?? `expected key starting with "${prefix}"`}.
        </p>
      )}
    </Field>
  );
}
