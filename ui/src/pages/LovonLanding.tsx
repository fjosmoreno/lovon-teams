/**
 * Lovon Teams — public marketing landing page (v2).
 *
 * Designed with guidance from ui-ux-pro-max and inspired by the
 * Behance NFT Crypto Projects reference the user provided. The page
 * is a dark NFT-style landing with:
 *   - Aurora/gradient mesh background (animated)
 *   - Glassmorphism cards
 *   - Bento grid features
 *   - 3D-feel floating hero with avatar grid
 *   - Smooth CSS animations (150-300ms, transform/opacity only)
 *   - Space Grotesk + DM Sans typography (Google Fonts)
 *
 * Mounted at /welcome as a PUBLIC route (no auth required, no
 * CloudAccessGate wrapper).
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Github,
  BookOpen,
  Sparkles,
  Zap,
  Shield,
  Users,
  BarChart3,
  Network,
  FileText,
  Bot,
  Check,
  ChevronDown,
  Star,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                              DESIGN TOKENS                                 */
/* -------------------------------------------------------------------------- */

const colors = {
  bg: "#07070d",
  bgAlt: "#0c0c1a",
  violet: "#7c3aed",
  emerald: "#22c55e",
  amber: "#f59e0b",
  text: "#f1f5f9",
  textMuted: "#94a3b8",
  border: "rgba(255, 255, 255, 0.08)",
  cardBg: "rgba(255, 255, 255, 0.03)",
};

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Providers", href: "#providers" },
  { label: "How it works", href: "#how" },
  { label: "FAQ", href: "#faq" },
];

const heroStats = [
  { value: "$0", label: "to start" },
  { value: "8", label: "free providers" },
  { value: "60s", label: "to first agent" },
  { value: "MIT", label: "open source" },
];

const providers = [
  { name: "Gemini Free", note: "Google AI Studio", tag: "Recommended" },
  { name: "Groq Free", note: "Llama · Mixtral", tag: "Fastest" },
  { name: "GitHub Models", note: "GPT-4o · Claude · Llama", tag: "Devs" },
  { name: "Cloudflare AI", note: "Workers AI", tag: "Edge" },
  { name: "Hugging Face", note: "Inference API", tag: "Open" },
  { name: "Cohere Trial", note: "Command R+", tag: "RAG" },
  { name: "Mistral Free", note: "La Plateforme", tag: "EU" },
  { name: "OpenRouter", note: "Free models", tag: "Aggregator" },
];

const features = [
  {
    icon: Bot,
    title: "Bring Your Own Agent",
    body: "Any agent, any runtime, one org chart. If it can receive a heartbeat, it's hired.",
    className: "md:col-span-2 md:row-span-2",
    accent: "violet" as const,
  },
  {
    icon: Network,
    title: "Org Chart",
    body: "Hierarchies, roles, reporting lines.",
    className: "",
    accent: "emerald" as const,
  },
  {
    icon: Sparkles,
    title: "Goal Alignment",
    body: "Every task traces back to the mission.",
    className: "",
    accent: "amber" as const,
  },
  {
    icon: BarChart3,
    title: "Cost Control",
    body: "Per-agent budgets. Auto-pause at 100%.",
    className: "",
    accent: "emerald" as const,
  },
  {
    icon: FileText,
    title: "Ticket System",
    body: "Full tool-call tracing and audit log.",
    className: "",
    accent: "violet" as const,
  },
  {
    icon: Shield,
    title: "Governance",
    body: "Approve hires, override strategy, pause anytime.",
    className: "md:col-span-2",
    accent: "amber" as const,
  },
];

const threeSteps = [
  { num: "01", title: "Define the goal.", body: '"Build the #1 AI note-taking app to $1mm ARR."' },
  { num: "02", title: "Hire the team.", body: "CEO, CTO, engineers, marketers — any free-tier provider." },
  { num: "03", title: "Approve and run.", body: "Review the CEO's strategy. Set budgets. Hit go." },
];

const sampleAgents = [
  { role: "CEO", provider: "Gemini Free", initial: "C" },
  { role: "CMO", provider: "Groq Free", initial: "M" },
  { role: "CTO", provider: "GitHub Models", initial: "T" },
  { role: "COO", provider: "Cloudflare AI", initial: "O" },
  { role: "Frontend", provider: "Gemini Free", initial: "F" },
  { role: "Backend", provider: "Groq Free", initial: "B" },
];

const budgetRows = [
  { role: "CEO", used: "$0", cap: "$60" },
  { role: "CMO", used: "$0", cap: "$40" },
  { role: "CTO", used: "$0", cap: "$50" },
  { role: "COO", used: "$0", cap: "$30" },
  { role: "Frontend Eng", used: "$0", cap: "$30" },
  { role: "Backend Eng", used: "$0", cap: "$30" },
];

const testimonials = [
  {
    name: "Marina C.",
    handle: "@marinac",
    text: "Lovon Teams finally let me start an agent company without paying for Claude first.",
  },
  {
    name: "Diego R.",
    handle: "@diegor",
    text: "Same control plane as the paid tools, but I'm running my CEO on Groq's free tier.",
  },
  {
    name: "Aline S.",
    handle: "@alines",
    text: "The org chart + goal alignment makes a real difference. My agents know the why.",
  },
];

const faqItems = [
  {
    q: "How is Lovon Teams different from Paperclip?",
    a: "Lovon Teams is a fork of Paperclip with first-class support for free-tier AI providers (Groq, GitHub Models, Cloudflare Workers AI, Hugging Face, Cohere, Mistral, OpenRouter, plus Google's free Gemini tier). Same control plane, $0 to start.",
  },
  {
    q: "Can I use my existing agents?",
    a: "Yes. Lovon Teams is unopinionated about agent runtimes. Your agents can be Gemini CLI, Claude Code, OpenClaw bots, Python scripts, shell commands, HTTP webhooks — anything that can receive a heartbeat.",
  },
  {
    q: "What happens when an agent hits its budget?",
    a: "At 100% utilization the agent auto-pauses and new tasks are blocked. Soft warning at 80%. As the board you can override the limit at any time.",
  },
  {
    q: "Is Lovon Teams really free?",
    a: "The Lovon Teams software is MIT-licensed open source. Running it on free-tier providers costs $0. If you later upgrade a single agent to a paid model, you only pay that one provider's list price.",
  },
  {
    q: "Do I need to install any local CLI?",
    a: "No. The Lovon Free providers (Groq, GitHub Models, Cloudflare, etc.) are REST APIs — you just paste an API key. Only the legacy Gemini CLI adapter requires @google/gemini-cli installed locally.",
  },
  {
    q: "Can I run multiple companies?",
    a: "Yes. A single Lovon Teams instance runs unlimited companies with complete data isolation. Useful for separate ventures, parallel experiments, or templating org configs.",
  },
];

/* -------------------------------------------------------------------------- */
/*                              SMALL HELPERS                                  */
/* -------------------------------------------------------------------------- */

function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

function accentRing(accent: "violet" | "emerald" | "amber"): string {
  if (accent === "emerald") return "before:bg-emerald-400/30 hover:border-emerald-400/30";
  if (accent === "amber") return "before:bg-amber-400/30 hover:border-amber-400/30";
  return "before:bg-violet-400/30 hover:border-violet-400/30";
}

function accentText(accent: "violet" | "emerald" | "amber"): string {
  if (accent === "emerald") return "text-emerald-400";
  if (accent === "amber") return "text-amber-400";
  return "text-violet-400";
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-300">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.8)]" aria-hidden="true" />
      {children}
    </div>
  );
}

function H2({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-balance text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl", className)}>
      {children}
    </h2>
  );
}

function Section({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("relative px-6 py-24 lg:py-32", className)}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function TerminalMock({
  children,
  label = "~/lovon-teams",
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 shadow-[0_30px_80px_-20px_rgba(124,58,237,0.4)] backdrop-blur transition-shadow duration-300 hover:shadow-[0_30px_80px_-10px_rgba(124,58,237,0.6)]">
      <div className="flex items-center gap-1.5 border-b border-white/5 bg-white/[0.02] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-3 font-mono text-[11px] text-slate-500">{label}</span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-slate-200">{children}</pre>
    </div>
  );
}

function FaqItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left transition-colors hover:text-emerald-300"
      >
        <span className="text-base font-semibold md:text-lg">{q}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300",
            open && "rotate-180 text-emerald-400",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300",
          open ? "grid-rows-[1fr] opacity-100 pb-5 pr-8" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden text-sm leading-relaxed text-slate-400 md:text-base">{a}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              AVATAR GRID                                   */
/* -------------------------------------------------------------------------- */

/* SVG-based 3D-feel avatar orb. No external images required. */
function AvatarOrb({ initial, hue }: { initial: string; hue: number }) {
  const grad = `conic-gradient(from ${hue}deg, #7c3aed, #22c55e, #f59e0b, #7c3aed)`;
  return (
    <div className="relative aspect-square w-full">
      <div
        className="absolute inset-[6%] rounded-[28%] blur-md opacity-70"
        style={{ background: grad }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-[8%] rounded-[26%] shadow-[inset_0_-8px_20px_rgba(0,0,0,0.45),inset_0_6px_14px_rgba(255,255,255,0.18)]"
        style={{ background: grad }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] md:text-3xl">
          {initial}
        </span>
      </div>
    </div>
  );
}

function HeroAvatarGrid() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-12 rounded-full bg-violet-500/20 blur-3xl" aria-hidden="true" />
      <div className="absolute -inset-20 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden="true" />
      <div className="relative grid grid-cols-3 gap-3 md:gap-4">
        {sampleAgents.map((a, i) => (
          <div
            key={a.role}
            className="transition-transform duration-300 hover:scale-105 hover:z-10"
            style={{ transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (i + 1)}deg)` }}
          >
            <AvatarOrb initial={a.initial} hue={i * 60} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              PAGE                                          */
/* -------------------------------------------------------------------------- */

export function LovonLanding() {
  // Inject Google Fonts (Space Grotesk + DM Sans) and keyframes once.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("lovon-landing-fonts")) return;
    const link = document.createElement("link");
    link.id = "lovon-landing-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.id = "lovon-landing-keyframes";
    style.textContent = `
      @keyframes lovon-aurora {
        0%   { transform: translate3d(0,0,0) scale(1); }
        50%  { transform: translate3d(2%, -1%, 0) scale(1.05); }
        100% { transform: translate3d(0,0,0) scale(1); }
      }
      @keyframes lovon-pulse {
        0%, 100% { opacity: 0.6; }
        50%      { opacity: 1; }
      }
      @keyframes lovon-float {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-8px); }
      }
      body { font-family: 'DM Sans', system-ui, -apple-system, sans-serif; }
      h1, h2, h3 { font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif; }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div
      className="relative min-h-screen overflow-hidden text-slate-100"
      style={{ backgroundColor: colors.bg }}
    >
      {/* Aurora background layer */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 15% 0%, rgba(124, 58, 237, 0.30), transparent 60%), radial-gradient(ellipse 60% 50% at 85% 10%, rgba(245, 158, 11, 0.18), transparent 60%), radial-gradient(ellipse 60% 50% at 50% 100%, rgba(34, 197, 94, 0.18), transparent 60%)",
          animation: "lovon-aurora 18s ease-in-out infinite",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl"
        aria-hidden="true"
        style={{ animation: "lovon-pulse 8s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl"
        aria-hidden="true"
        style={{ animation: "lovon-pulse 10s ease-in-out infinite 2s" }}
      />

      {/* Top nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-emerald-400 font-bold text-slate-950 shadow-[0_0_24px_-6px_rgba(124,58,237,0.6)]">
            L
          </div>
          <span className="font-mono text-sm tracking-[0.24em] text-slate-200">LOVON TEAMS</span>
        </a>
        <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} className="cursor-pointer transition-colors hover:text-slate-100">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="/auth"
            className="cursor-pointer text-sm text-slate-300 transition-colors hover:text-slate-100"
          >
            Sign in
          </a>
          <a href="/auth?mode=signup" className="cursor-pointer">
            <Button
              size="sm"
              className="rounded-full bg-emerald-500 px-4 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Get started
            </Button>
          </a>
        </div>
      </header>

      {/* Hero — split layout: copy on left, avatar grid on right */}
      <Section className="pt-8 pb-20 md:pt-16">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <Eyebrow>Beta · Free providers ready</Eyebrow>
            <h1 className="text-balance text-5xl font-extrabold leading-[1.02] tracking-tight md:text-7xl">
              A team of agents.{" "}
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-emerald-300 bg-clip-text text-transparent">
                For every person.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-pretty text-lg text-slate-300 md:text-xl">
              Lovon Teams is the app people use to run a company of AI agents.
              Open source, self-hosted, and built to start on free-tier providers
              with no upfront spend.
            </p>
            <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row">
              <a href="/auth?mode=signup" className="cursor-pointer">
                <Button
                  size="lg"
                  className="group h-12 rounded-full bg-emerald-500 px-7 font-semibold text-slate-950 shadow-[0_0_40px_-10px_rgba(34,197,94,0.6)] transition hover:bg-emerald-400"
                >
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                </Button>
              </a>
              <a
                href="https://github.com/fjosmoreno/lovon-teams"
                target="_blank"
                rel="noreferrer noopener"
                className="cursor-pointer inline-flex h-12 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-medium text-slate-200 backdrop-blur transition hover:bg-white/10"
              >
                <Github className="h-4 w-4" />
                Star on GitHub
              </a>
            </div>
            <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              {heroStats.map((s) => (
                <div key={s.label}>
                  <dt className="font-mono text-3xl font-bold text-emerald-300 md:text-4xl">{s.value}</dt>
                  <dd className="mt-1 font-mono text-[11px] uppercase tracking-widest text-slate-500">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <HeroAvatarGrid />
          </div>
        </div>
      </Section>

      {/* Quickstart */}
      <Section className="py-12">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <Eyebrow>Quickstart</Eyebrow>
            <H2>From <code className="text-emerald-300">npx</code> to a running agent company in 60 seconds.</H2>
            <p className="mt-5 text-slate-300">
              Open source. Self-hosted. The interactive setup walks you through database
              configuration, auth, and starting your first agent team — all on free-tier
              providers, no API spend required.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://github.com/fjosmoreno/lovon-teams"
                target="_blank"
                rel="noreferrer noopener"
                className="cursor-pointer inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
              >
                <Github className="h-4 w-4" /> Star on GitHub
              </a>
              <a
                href="https://github.com/fjosmoreno/lovon-teams#readme"
                target="_blank"
                rel="noreferrer noopener"
                className="cursor-pointer inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
              >
                <BookOpen className="h-4 w-4" /> Read the docs →
              </a>
            </div>
          </div>
          <TerminalMock label="~/lovon-teams">
{`$ npx lovon-teams onboard --yes

› Detected embedded PostgreSQL — bootstrapping…
› Created instance at ~/.lovon-teams/instances/default
› Generated board claim URL
› Picked 8 free providers, 0 paid

✓ Lovon Teams is running at http://localhost:3100
✓ Open the URL above to create your first admin.`}
          </TerminalMock>
        </div>
      </Section>

      {/* 3 steps */}
      <Section id="how" className="py-20">
        <div className="mb-10 text-center">
          <Eyebrow>How it works</Eyebrow>
          <H2>Manage business goals, not pull requests.</H2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {threeSteps.map((s) => (
            <div
              key={s.num}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-7 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/[0.05]"
            >
              <div
                className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-500/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              />
              <div className="relative">
                <div className="font-mono text-xs text-emerald-400">{s.num}</div>
                <h3 className="mt-3 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Providers */}
      <Section id="providers" className="py-20">
        <div className="mb-10 text-center">
          <Eyebrow>Model-agnostic</Eyebrow>
          <H2>Free providers ready on day one.</H2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Lovon Teams ships with adapters for 8 free-tier AI providers.
            No credit card. No paid tier. Start on free, upgrade per-agent when you outgrow it.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {providers.map((p, i) => (
            <div
              key={p.name}
              className={cn(
                "group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur transition-all duration-300",
                "hover:-translate-y-0.5 hover:border-emerald-400/30 hover:bg-white/[0.05]",
              )}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: "radial-gradient(ellipse 100% 80% at 50% 0%, rgba(34,197,94,0.15), transparent 60%)",
                }}
                aria-hidden="true"
              />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-semibold">{p.name}</span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  {p.tag}
                </span>
              </div>
              <p className="relative mt-1 text-xs text-slate-400">{p.note}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Features — bento grid */}
      <Section id="features" className="py-20">
        <div className="mb-10 text-center">
          <Eyebrow>Features</Eyebrow>
          <H2>Everything you need to run a team of agents.</H2>
        </div>
        <div className="grid auto-rows-[180px] grid-cols-1 gap-4 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur",
                "before:absolute before:inset-0 before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-300 before:content-['']",
                "hover:before:opacity-100",
                accentRing(f.accent),
                f.className,
              )}
            >
              <div className="relative flex h-full flex-col">
                <f.icon className={cn("h-7 w-7", accentText(f.accent))} />
                <h3 className="mt-4 text-lg font-semibold md:text-xl">{f.title}</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Sample org + budget */}
      <Section className="py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <Eyebrow>Sample org</Eyebrow>
            <H2>Mix and match providers per agent.</H2>
            <p className="mt-4 text-slate-400">
              Each agent picks its own provider. Fast agents run on Groq, complex ones on Gemini,
              structured work on GitHub Models. You set the mix.
            </p>
            <div className="mt-6 divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur">
              {sampleAgents.map((a) => (
                <div
                  key={a.role}
                  className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-violet-300" />
                    <span className="text-sm font-medium">{a.role}</span>
                  </div>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 font-mono text-[11px] text-emerald-300">
                    {a.provider}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Eyebrow>Cost control</Eyebrow>
            <H2>Know what every agent costs.</H2>
            <p className="mt-4 text-slate-400">
              Per-agent budgets. Auto-pause at 100%. Track spend per task, per project, per goal.
            </p>
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10 bg-white/[0.02] text-left font-mono text-[11px] uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Agent</th>
                    <th className="px-5 py-3 text-right">Used</th>
                    <th className="px-5 py-3 text-right">Cap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {budgetRows.map((b) => (
                    <tr key={b.role} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-5 py-2.5 text-slate-200">{b.role}</td>
                      <td className="px-5 py-2.5 text-right font-mono text-slate-400">{b.used}</td>
                      <td className="px-5 py-2.5 text-right font-mono text-slate-300">{b.cap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Section>

      {/* Testimonials */}
      <Section className="py-20">
        <div className="mb-10 text-center">
          <Eyebrow>Loved by builders</Eyebrow>
          <H2>What people are saying.</H2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.handle}
              className="group rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/30"
            >
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                ))}
              </div>
              <blockquote className="mt-3 text-sm leading-relaxed text-slate-200">"{t.text}"</blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/40 to-emerald-400/40 font-bold text-slate-100">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="font-mono text-[11px] text-slate-500">{t.handle}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* Governance */}
      <Section className="py-20">
        <div className="mb-8 text-center">
          <Eyebrow>Governance</Eyebrow>
          <H2>You're in charge.</H2>
        </div>
        <p className="mx-auto max-w-3xl text-center text-lg text-slate-300">
          Approve hires. Approve strategy. Override anything. You operate as the board of
          directors. Agents can't hire new agents without your approval. The CEO can't
          execute a strategy you haven't reviewed. Pause, resume, reassign, terminate —
          at any time.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-5">
          {["Pause", "Resume", "Override", "Reassign", "Terminate"].map((verb) => (
            <div
              key={verb}
              className="cursor-pointer rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center font-mono text-sm uppercase tracking-widest text-emerald-300 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/30 hover:bg-emerald-400/5"
            >
              {verb}
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" className="py-20">
        <div className="mb-10 text-center">
          <Eyebrow>FAQ</Eyebrow>
          <H2>Frequently asked questions.</H2>
        </div>
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/5 bg-white/[0.03] px-6 backdrop-blur">
          {faqItems.map((it, idx) => (
            <FaqItem key={it.q} q={it.q} a={it.a} defaultOpen={idx === 0} />
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <Section className="py-24 text-center">
        <H2 className="mx-auto max-w-3xl">
          Hire a team of agents.{" "}
          <span className="bg-gradient-to-r from-emerald-300 to-violet-300 bg-clip-text text-transparent">
            In one command.
          </span>
        </H2>
        <div className="mx-auto mt-10 max-w-2xl">
          <TerminalMock>
{`$ npx lovon-teams onboard --yes

✓ Lovon Teams running at http://localhost:3100`}
          </TerminalMock>
        </div>
        <p className="mt-8 text-sm text-slate-400">
          Open source. Self-hosted. MIT licensed. No account required.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="https://github.com/fjosmoreno/lovon-teams" target="_blank" rel="noreferrer noopener" className="cursor-pointer">
            <Button size="lg" className="h-12 rounded-full bg-emerald-500 px-7 font-semibold text-slate-950 hover:bg-emerald-400">
              <Github className="mr-2 h-4 w-4" /> Star on GitHub
            </Button>
          </a>
          <a href="https://github.com/fjosmoreno/lovon-teams#readme" target="_blank" rel="noreferrer noopener" className="cursor-pointer">
            <Button size="lg" variant="outline" className="h-12 rounded-full border-white/15 bg-white/5 px-6 text-slate-200 hover:bg-white/10">
              <BookOpen className="mr-2 h-4 w-4" /> Read the docs →
            </Button>
          </a>
        </div>
      </Section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 px-6 py-10 text-sm text-slate-500">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-emerald-400 text-xs font-bold text-slate-950">
              L
            </div>
            <span className="font-mono tracking-[0.24em] text-slate-300">LOVON TEAMS</span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="https://github.com/fjosmoreno/lovon-teams" className="cursor-pointer hover:text-slate-300">GitHub</a>
            <a href="https://github.com/fjosmoreno/lovon-teams/blob/master/LICENSE" className="cursor-pointer hover:text-slate-300">License</a>
            <a href="https://github.com/fjosmoreno/lovon-teams/blob/master/NOTICE" className="cursor-pointer hover:text-slate-300">NOTICE</a>
            <a href="https://github.com/paperclipai/paperclip" className="cursor-pointer hover:text-slate-300">Upstream Paperclip</a>
          </div>
          <div className="font-mono text-[11px] uppercase tracking-widest">
            © {new Date().getFullYear()} Lovon Teams · MIT
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LovonLanding;