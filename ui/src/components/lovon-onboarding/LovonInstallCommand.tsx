/**
 * LovonInstallCommand — interactive "copy me" shell command input for
 * installing Lovon Teams. Switches between npm / pnpm / yarn / bun,
 * shows the matching command, and lets the user copy with one click.
 *
 * Designed for the public landing page at /welcome so visitors can grab
 * the install command without squinting at static terminal mocks.
 */
import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

const COMMANDS: Record<PackageManager, string> = {
  npm: "npm install -g @lovonteams/cli && npx lovon-teams onboard --yes",
  pnpm: "pnpm dlx @lovonteams/cli onboard --yes",
  yarn: "yarn dlx @lovonteams/cli onboard --yes",
  bun: "bun x @lovonteams/cli onboard --yes",
};

const MANAGER_LABELS: Array<{ id: PackageManager; label: string }> = [
  { id: "npm", label: "npm" },
  { id: "pnpm", label: "pnpm" },
  { id: "yarn", label: "yarn" },
  { id: "bun", label: "bun" },
];

export function LovonInstallCommand({
  defaultManager = "npm",
  className,
  variant = "hero",
}: {
  defaultManager?: PackageManager;
  className?: string;
  variant?: "hero" | "compact";
}) {
  const [manager, setManager] = useState<PackageManager>(defaultManager);
  const [copied, setCopied] = useState(false);

  const command = COMMANDS[manager];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const isHero = variant === "hero";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/10 bg-black/85 font-mono shadow-[0_30px_80px_-20px_rgba(0,224,255,0.35)] backdrop-blur",
        isHero ? "max-w-xl" : "",
        className
      )}
    >
      {/* Header: tab row + copy button */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 bg-white/[0.02] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-cyan-300" />
          <div className="flex items-center gap-0.5 rounded-md border border-white/10 bg-white/[0.04] p-0.5">
            {MANAGER_LABELS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setManager(m.id)}
                className={cn(
                  "cursor-pointer rounded px-2 py-0.5 font-mono text-[11px] uppercase tracking-widest transition",
                  manager === m.id
                    ? "bg-cyan-400/15 text-cyan-300 shadow-[inset_0_0_8px_rgba(0,224,255,0.25)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
                aria-pressed={manager === m.id}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={copy}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11px] transition",
            copied
              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
              : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
          )}
          title="Copy command"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
      {/* Command line */}
      <div className="relative">
        <input
          type="text"
          readOnly
          value={command}
          onFocus={(e) => e.target.select()}
          onClick={(e) => e.currentTarget.select()}
          spellCheck={false}
          className={cn(
            "w-full cursor-text bg-transparent px-4 py-3.5 text-[13px] text-slate-100 outline-none",
            "selection:bg-cyan-400/30 selection:text-white"
          )}
          aria-label={`Install Lovon Teams using ${manager}`}
        />
        <span
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 select-none font-mono text-cyan-300 opacity-0"
          aria-hidden="true"
        >
          $
        </span>
      </div>
      {/* Help footer */}
      <div className="flex items-center justify-between gap-2 border-t border-white/[0.04] bg-white/[0.02] px-4 py-1.5 font-mono text-[10.5px] text-slate-500">
        <span className="uppercase tracking-widest">Click input to select · ⌘C to copy</span>
        <span className="opacity-60">requires Node ≥ 20</span>
      </div>
    </div>
  );
}
