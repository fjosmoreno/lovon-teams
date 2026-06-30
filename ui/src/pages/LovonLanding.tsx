/**
 * Lovon Teams — public marketing landing page (v3 — "Living AI System").
 *
 * Design concept: instead of a "collectibles" marketplace (NFT feel), the
 * page positions Lovon Teams as a live, running AI infrastructure. The
 * hero shows a vertical gallery of agent cards (avatars, neural cores,
 * status pills) that scroll continuously upward/downward to convey
 * "the system is running right now".
 *
 * Visual system:
 *   - Palette: deep black #0A0A0F + electric blue #00E0FF + neon green
 *     #00F5A0 + tech grey #A1A1AA + supporting cyber purple / orange.
 *   - Typography: Space Grotesk (headings) + DM Sans (body) + JetBrains
 *     Mono (technical labels).
 *   - Animations: 35s continuous vertical scroll loops on the agent
 *     columns, mouse parallax shift, scan line under the hero headline,
 *     pulsing status dots, neural glow background gradient.
 *   - All motion respects prefers-reduced-motion.
 */
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Github,
  BookOpen,
  Bot,
  Shield,
  BarChart3,
  Network,
  FileText,
  Sparkles,
  Users,
  ChevronDown,
  Star,
  Zap,
  Cpu,
  Brain,
  Radio,
  Code2,
  TrendingUp,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { LovonInstallCommand } from "@/components/lovon-onboarding/LovonInstallCommand";
import { LOVON_FREE_PROVIDERS } from "@/components/lovon-onboarding/lovon-providers";

/* -------------------------------------------------------------------------- */
/*                              DESIGN TOKENS                                 */
/* -------------------------------------------------------------------------- */

const tokens = {
  bg: "#0A0A0F",
  bgAlt: "#0F0F18",
  white: "#FFFFFF",
  grey: "#A1A1AA",
  greyDim: "#52525B",
  cyan: "#00E0FF",
  green: "#00F5A0",
  purple: "#7C3AED",
  orange: "#FB923C",
  border: "rgba(255, 255, 255, 0.08)",
  cardBg: "rgba(255, 255, 255, 0.03)",
};

/* -------------------------------------------------------------------------- */
/*                              AGENT DATA                                    */
/* -------------------------------------------------------------------------- */

type Agent = {
  id: string;
  name: string;
  role: string;
  status: "Active" | "Running" | "Idle";
  metric: string;
  metricLabel: string;
  variant: "avatar" | "core" | "function";
  hue: number;
};

const agentColumnA: Agent[] = [
  { id: "a-ceo", name: "Helios", role: "AI CEO Agent", status: "Active", metric: "12", metricLabel: "Tasks / hr", variant: "avatar", hue: 200 },
  { id: "a-cfo", name: "Atlas", role: "AI CFO Agent", status: "Active", metric: "8", metricLabel: "Reports / day", variant: "core", hue: 160 },
  { id: "a-sales", name: "Vega", role: "AI Sales Agent", status: "Running", metric: "47", metricLabel: "Leads / day", variant: "function", hue: 280 },
  { id: "a-ops", name: "Orion", role: "AI Ops Agent", status: "Active", metric: "99.9", metricLabel: "Uptime %", variant: "core", hue: 120 },
  { id: "a-research", name: "Lyra", role: "AI Research Agent", status: "Idle", metric: "1.2k", metricLabel: "Sources / hr", variant: "avatar", hue: 220 },
  { id: "a-marketing", name: "Nova", role: "AI Marketing Agent", status: "Running", metric: "23", metricLabel: "Posts / day", variant: "function", hue: 320 },
];

const agentColumnB: Agent[] = [
  { id: "b-cto", name: "Iris", role: "AI CTO Agent", status: "Active", metric: "156", metricLabel: "PRs reviewed", variant: "core", hue: 180 },
  { id: "b-fe", name: "Echo", role: "AI Frontend Agent", status: "Running", metric: "31", metricLabel: "Components", variant: "function", hue: 240 },
  { id: "b-be", name: "Atlas-2", role: "AI Backend Agent", status: "Active", metric: "84", metricLabel: "Endpoints", variant: "core", hue: 100 },
  { id: "b-cs", name: "Aurora", role: "AI Customer Success", status: "Active", metric: "98", metricLabel: "% satisfied", variant: "avatar", hue: 260 },
  { id: "b-data", name: "Sable", role: "AI Data Analyst", status: "Running", metric: "12k", metricLabel: "Rows / min", variant: "function", hue: 140 },
  { id: "b-design", name: "Pixel", role: "AI Design Agent", status: "Idle", metric: "62", metricLabel: "Concepts", variant: "core", hue: 300 },
];

const agentColumnC: Agent[] = [
  { id: "c-legal", name: "Sentinel", role: "AI Legal Agent", status: "Active", metric: "12", metricLabel: "Contracts", variant: "core", hue: 200 },
  { id: "c-hr", name: "Bloom", role: "AI HR Agent", status: "Active", metric: "94", metricLabel: "% retention", variant: "function", hue: 160 },
  { id: "c-marketing", name: "Pulse", role: "AI Growth Agent", status: "Running", metric: "+38%", metricLabel: "MoM growth", variant: "avatar", hue: 320 },
  { id: "c-engineering", name: "Forge", role: "AI Engineering Agent", status: "Active", metric: "12", metricLabel: "Deploys / day", variant: "core", hue: 100 },
  { id: "c-content", name: "Quill", role: "AI Content Agent", status: "Running", metric: "84", metricLabel: "Posts / wk", variant: "function", hue: 280 },
  { id: "c-security", name: "Aegis", role: "AI Security Agent", status: "Active", metric: "0", metricLabel: "Incidents", variant: "core", hue: 240 },
];

const columns: Agent[][] = [agentColumnA, agentColumnB, agentColumnC];

/* Duplicate columns for the infinite-scroll trick. */
function makeLoop(list: Agent[]): Agent[] {
  return [...list, ...list];
}

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Providers", href: "#providers" },
  { label: "How it works", href: "#how" },
  { label: "FAQ", href: "#faq" },
];

const heroMini = [
  { icon: Cpu, label: "Any runtime" },
  { icon: Brain, label: "Goal alignment" },
  { icon: Radio, label: "Real-time heartbeats" },
  { icon: Shield, label: "Governance built-in" },
];

const providers = LOVON_FREE_PROVIDERS.map((p) => ({
  id: p.id,
  name: p.label,
  note: p.notes ?? "",
  tag:
    p.id === "lovon_groq_free"
      ? "Fastest"
      : p.id === "gemini_local"
      ? "Recommended"
      : p.id === "github_models"
      ? "Devs"
      : p.id === "cloudflare_ai"
      ? "Edge"
      : p.id === "huggingface"
      ? "Open"
      : p.id === "cohere_trial"
      ? "RAG"
      : p.id === "mistral_free"
      ? "EU"
      : p.id === "openrouter_free"
      ? "Aggregator"
      : "Free",
  keyUrl: p.keyUrl,
}));

const features = [
  {
    icon: Bot,
    title: "Active AI agents",
    body: "CEO, CTO, Sales, Ops — every agent runs on a free-tier provider with goal alignment.",
    accent: tokens.cyan,
  },
  {
    icon: Network,
    title: "Org chart that thinks",
    body: "Hierarchies, reporting lines, delegation flows. Your agents know who reports to whom.",
    accent: tokens.green,
  },
  {
    icon: Brain,
    title: "Goal alignment",
    body: "Every task traces back to the company mission. Agents know the what AND the why.",
    accent: tokens.purple,
  },
  {
    icon: BarChart3,
    title: "Cost control",
    body: "Per-agent budgets, auto-pause at 100%. No surprise bills. Hard limits, enforced.",
    accent: tokens.green,
  },
  {
    icon: FileText,
    title: "Ticket system",
    body: "Every conversation traced. Every tool call logged. Full audit trail.",
    accent: tokens.cyan,
  },
  {
    icon: Shield,
    title: "Governance",
    body: "You operate as the board. Approve hires, override strategy, pause anyone.",
    accent: tokens.orange,
  },
];

const threeSteps = [
  { num: "01", title: "Define the goal.", body: '"Build the #1 AI note-taking app to $1mm ARR."' },
  { num: "02", title: "Hire the team.", body: "CEO, CTO, engineers, marketers — any free-tier provider." },
  { num: "03", title: "Approve and run.", body: "Review the CEO's strategy. Set budgets. Hit go." },
];

const budgetRows = [
  { role: "AI CEO", used: "$0", cap: "$60" },
  { role: "AI CMO", used: "$0", cap: "$40" },
  { role: "AI CTO", used: "$0", cap: "$50" },
  { role: "AI COO", used: "$0", cap: "$30" },
  { role: "AI Frontend", used: "$0", cap: "$30" },
  { role: "AI Backend", used: "$0", cap: "$30" },
];

const testimonials = [
  { name: "Marina C.", handle: "@marinac", text: "Lovon Teams finally let me start an agent company without paying for Claude first." },
  { name: "Diego R.", handle: "@diegor", text: "Same control plane as the paid tools, but I'm running my CEO on Groq's free tier." },
  { name: "Aline S.", handle: "@alines", text: "The org chart + goal alignment makes a real difference. My agents know the why." },
];

const faqItems = [
  { q: "How is Lovon Teams different from Paperclip?", a: "Lovon Teams is a fork of Paperclip with first-class support for free-tier AI providers. Same control plane, $0 to start." },
  { q: "Can I use my existing agents?", a: "Yes. Bring Claude Code, OpenClaw, scripts, HTTP webhooks — anything that can receive a heartbeat." },
  { q: "What happens when an agent hits its budget?", a: "At 100% the agent auto-pauses. Soft warning at 80%. Board can override at any time." },
  { q: "Is it really free?", a: "MIT-licensed open source. Free-tier providers cost $0. Pay only for premium models you opt into per-agent." },
  { q: "Do I need to install a local CLI?", a: "No. The Lovon Free providers (Groq, GitHub Models, Cloudflare, etc.) are pure REST APIs — just paste a key." },
  { q: "Can I run multiple companies?", a: "Yes. One instance runs unlimited companies with complete data isolation." },
];

/* -------------------------------------------------------------------------- */
/*                              HELPERS                                       */
/* -------------------------------------------------------------------------- */

function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-300">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,224,255,0.8)]" aria-hidden="true" />
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

function Section({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn("relative px-6 py-24 lg:py-32", className)}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function FaqItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left transition-colors hover:text-cyan-300"
      >
        <span className="text-base font-semibold md:text-lg">{q}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300", open && "rotate-180 text-cyan-400")} />
      </button>
      <div className={cn("grid transition-all duration-300", open ? "grid-rows-[1fr] opacity-100 pb-5 pr-8" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden text-sm leading-relaxed text-slate-400 md:text-base">{a}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              AGENT CARD                                    */
/* -------------------------------------------------------------------------- */

function AgentCard({ agent }: { agent: Agent }) {
  const variant = agent.variant;
  const accent = agent.status === "Active" ? tokens.green : agent.status === "Running" ? tokens.cyan : tokens.grey;
  return (
    <div
      className="group relative h-[320px] w-[220px] shrink-0 overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-4 backdrop-blur transition-transform duration-300 hover:scale-[1.02]"
      style={{
        boxShadow: `inset 0 0 30px rgba(255,255,255,0.04), 0 10px 40px -10px rgba(0,0,0,0.6)`,
      }}
    >
      {/* Glassy border glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[40px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${accent}30, transparent 60%)`,
        }}
        aria-hidden="true"
      />

      {/* Top: avatar/core/function visual */}
      <div className="relative h-[170px] w-full overflow-hidden rounded-[28px] bg-black/40">
        {variant === "avatar" && <AvatarVisual name={agent.name} hue={agent.hue} />}
        {variant === "core" && <NeuralCore hue={agent.hue} />}
        {variant === "function" && <FunctionVisual role={agent.role} />}
      </div>

      {/* Middle: name + role */}
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-white">{agent.name}</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{agent.role}</div>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: accent,
              boxShadow: `0 0 6px ${accent}`,
              animation: "lovon-status-pulse 1.6s ease-in-out infinite",
            }}
            aria-hidden="true"
          />
          <span className="font-mono text-[9px] uppercase tracking-widest text-slate-300">{agent.status}</span>
        </div>
      </div>

      {/* Bottom: metric */}
      <div className="mt-3 flex items-end justify-between border-t border-white/5 pt-2.5">
        <div>
          <div className="font-mono text-2xl font-bold text-white" style={{ color: accent }}>
            {agent.metric}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{agent.metricLabel}</div>
        </div>
        <div
          className="h-1 w-12 overflow-hidden rounded-full bg-white/5"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${30 + (agent.hue % 60)}%`,
              background: `linear-gradient(90deg, ${accent}, transparent)`,
              animation: "lovon-pulse 2.4s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function AvatarVisual({ name, hue }: { name: string; hue: number }) {
  const grad = `conic-gradient(from ${hue}deg, #00E0FF, #00F5A0, #7C3AED, #00E0FF)`;
  const initial = name.charAt(0);
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-[8%] rounded-[28%] blur-md opacity-60"
        style={{ background: grad }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-[10%] rounded-[26%] shadow-[inset_0_-8px_20px_rgba(0,0,0,0.5),inset_0_4px_12px_rgba(255,255,255,0.2)]"
        style={{ background: grad }}
        aria-hidden="true"
      />
      {/* Subtle holographic overlay */}
      <div
        className="absolute inset-0 rounded-[28%] opacity-40 mix-blend-screen"
        style={{
          background:
            "repeating-linear-gradient(180deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 3px)",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-5xl font-bold text-white drop-shadow-[0_0_12px_rgba(0,224,255,0.5)]">
          {initial}
        </span>
      </div>
      {/* Corner data labels */}
      <div className="absolute left-2 top-2 font-mono text-[8px] uppercase tracking-widest text-cyan-300/80">
        SYS.0{hue % 10}
      </div>
      <div className="absolute right-2 bottom-2 font-mono text-[8px] uppercase tracking-widest text-emerald-300/80">
        v2.6
      </div>
    </div>
  );
}

function NeuralCore({ hue }: { hue: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80 blur-md"
        style={{
          background: `radial-gradient(circle, hsl(${hue} 90% 60%), transparent 70%)`,
          animation: "lovon-pulse 3s ease-in-out infinite",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30"
        style={{ animation: "lovon-spin 12s linear infinite" }}
        aria-hidden="true"
      >
        <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(0,224,255,0.8)]" />
      </div>
      <div
        className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20"
        style={{ animation: "lovon-spin 18s linear infinite reverse" }}
        aria-hidden="true"
      >
        <div className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(0,245,160,0.8)]" />
        <div className="absolute -left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(0,224,255,0.8)]" />
      </div>
      {/* Neural lines */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line x1="20" y1="30" x2="50" y2="50" stroke="rgba(0,224,255,0.4)" strokeWidth="0.4" />
        <line x1="80" y1="20" x2="50" y2="50" stroke="rgba(0,245,160,0.4)" strokeWidth="0.4" />
        <line x1="20" y1="80" x2="50" y2="50" stroke="rgba(124,58,237,0.4)" strokeWidth="0.4" />
        <line x1="80" y1="70" x2="50" y2="50" stroke="rgba(0,224,255,0.4)" strokeWidth="0.4" />
      </svg>
    </div>
  );
}

function FunctionVisual({ role }: { role: string }) {
  return (
    <div className="absolute inset-0 p-3 font-mono text-[8px] text-cyan-300/80">
      <div className="flex items-center justify-between">
        <span>{(role.match(/AI (\w+)/) ?? ["AI", "Agent"])[1].toUpperCase()}.AGENT</span>
        <span className="text-emerald-300/80">● ACTIVE</span>
      </div>
      <div className="mt-1 h-px bg-gradient-to-r from-cyan-400/40 via-emerald-400/40 to-transparent" />
      <div className="mt-2 grid grid-cols-3 gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-1 rounded-full"
            style={{
              background: `linear-gradient(90deg, rgba(0,224,255,${0.3 + (i % 3) * 0.2}), transparent)`,
              animation: `lovon-pulse ${1.5 + (i % 3) * 0.4}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>
      <div className="mt-2 text-[7px] text-slate-500">MEM 87% · NET 12ms · Q 3</div>
      <div className="mt-1 text-[7px] text-cyan-300/60">RUN {Array.from({ length: 8 }).map(() => Math.round(Math.random() * 9)).join("")}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              HERO COLUMNS                                  */
/* -------------------------------------------------------------------------- */

function HeroColumns() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setMouse({ x, y });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-[640px] w-full overflow-hidden rounded-2xl border border-white/5"
      style={{
        background:
          "radial-gradient(ellipse 70% 80% at 50% 30%, rgba(0,224,255,0.08), transparent 60%), radial-gradient(ellipse 50% 60% at 50% 70%, rgba(0,245,160,0.06), transparent 60%)",
        boxShadow: "inset 0 0 80px rgba(0,224,255,0.06)",
      }}
    >
      {/* Neural grid lines (decorative) */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-30"
        viewBox="0 0 600 640"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 80} x2="600" y2={i * 80} stroke="rgba(0,224,255,0.06)" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 75} y1="0" x2={i * 75} y2="640" stroke="rgba(0,224,255,0.06)" strokeWidth="0.5" />
        ))}
      </svg>

      {/* Top + bottom fades to mask the loop seams */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32"
        style={{ background: `linear-gradient(180deg, ${tokens.bg}, transparent)` }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32"
        style={{ background: `linear-gradient(0deg, ${tokens.bg}, transparent)` }}
        aria-hidden="true"
      />

      {/* Three columns of scrolling agents */}
      <div
        className="absolute inset-0 flex items-center justify-center gap-6 px-4 py-4 md:gap-8 md:px-8"
        style={{
          transform: `translate3d(${mouse.x * 12}px, ${mouse.y * 6}px, 0)`,
          transition: "transform 300ms ease-out",
        }}
      >
        {columns.map((col, i) => (
          <div key={i} className="flex h-full items-start gap-4">
            <ScrollingColumn agents={col} direction={i % 2 === 0 ? "up" : "down"} duration={28 + i * 6} offset={i} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ScrollingColumn({ agents, direction, duration, offset }: { agents: Agent[]; direction: "up" | "down"; duration: number; offset: number }) {
  const looped = makeLoop(agents);
  return (
    <div className="relative h-full w-[220px] overflow-hidden">
      <div
        className="flex flex-col gap-4"
        style={{
          animation: `lovon-scroll-${direction} ${duration}s linear infinite`,
          animationDelay: `${offset * -7}s`,
        }}
      >
        {looped.map((a, i) => (
          <AgentCard key={`${a.id}-${i}`} agent={a} />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              SCAN LINE                                     */
/* -------------------------------------------------------------------------- */

function ScanLine() {
  return (
    <div className="pointer-events-none relative mt-4 h-px w-full overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 w-1/3"
        style={{
          background: "linear-gradient(90deg, transparent, #00E0FF, transparent)",
          boxShadow: "0 0 12px #00E0FF, 0 0 24px #00E0FF",
          animation: "lovon-scan 3.5s ease-in-out infinite",
        }}
        aria-hidden="true"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              PAGE                                          */
/* -------------------------------------------------------------------------- */

export function LovonLanding() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (!document.getElementById("lovon-landing-fonts")) {
      const link = document.createElement("link");
      link.id = "lovon-landing-fonts";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@500;600;700&display=swap";
      document.head.appendChild(link);
    }

    if (!document.getElementById("lovon-landing-keyframes")) {
      const style = document.createElement("style");
      style.id = "lovon-landing-keyframes";
      style.textContent = `
        body { font-family: 'DM Sans', system-ui, -apple-system, sans-serif; }
        h1, h2, h3 { font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }

        @keyframes lovon-scroll-up {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes lovon-scroll-down {
          0%   { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .lovon-col-up   { animation: lovon-scroll-up 35s linear infinite; }
        .lovon-col-down { animation: lovon-scroll-down 35s linear infinite; }

        @keyframes lovon-pulse {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
        @keyframes lovon-status-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.4; transform: scale(0.85); }
        }
        @keyframes lovon-spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes lovon-scan {
          0%   { left: -33%; }
          100% { left: 110%; }
        }
        @keyframes lovon-aurora {
          0%   { transform: translate3d(0,0,0) scale(1); }
          50%  { transform: translate3d(2%, -1%, 0) scale(1.05); }
          100% { transform: translate3d(0,0,0) scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          [class*='lovon-col-'], [class*='animate-'], [class*='animate-'], [style*='animation:'] {
            animation: none !important;
            transition: none !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100" style={{ backgroundColor: tokens.bg }}>
      {/* Backgrounds */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 30% 10%, rgba(0,224,255,0.12), transparent 60%), radial-gradient(ellipse 50% 50% at 70% 90%, rgba(0,245,160,0.10), transparent 60%)",
          animation: "lovon-aurora 18s ease-in-out infinite",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl"
        aria-hidden="true"
      />

      {/* Top nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-cyan-400 to-emerald-400 font-bold text-slate-950 shadow-[0_0_20px_-4px_rgba(0,224,255,0.6)]">
            L
          </div>
          <span className="font-mono text-sm tracking-[0.24em] text-slate-200">LOVON TEAMS</span>
        </a>
        <nav className="hidden items-center gap-7 font-mono text-sm text-slate-300 md:flex">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} className="cursor-pointer transition-colors hover:text-cyan-300">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href="/auth" className="cursor-pointer font-mono text-sm text-slate-300 transition-colors hover:text-cyan-300">
            Sign in
          </a>
          <a href="/auth?mode=signup" className="cursor-pointer">
            <Button size="sm" className="rounded-full bg-cyan-400 px-4 font-semibold text-slate-950 transition hover:bg-cyan-300 hover:shadow-[0_0_24px_-4px_rgba(0,224,255,0.6)]">
              Start building
            </Button>
          </a>
        </div>
      </header>

      {/* Hero */}
      <Section className="pt-8 pb-20 md:pt-12">
        <div className="grid items-center gap-12 lg:grid-cols-[45%_55%]">
          <div>
            <Eyebrow>Beta · Free providers ready</Eyebrow>
            <h1 className="text-balance text-5xl font-extrabold leading-[1.0] tracking-tight md:text-6xl lg:text-7xl">
              <span className="block text-white">Build Intelligent</span>
              <span className="block text-white">Autonomous</span>
              <span className="relative inline-block">
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(90deg, #00E0FF, #00F5A0)" }}
                >
                  AI Agents
                </span>
                <span
                  className="absolute -bottom-1 left-0 h-[3px] w-full"
                  style={{
                    background: "linear-gradient(90deg, #00E0FF, #00F5A0)",
                    boxShadow: "0 0 12px #00E0FF, 0 0 24px rgba(0,245,160,0.6)",
                  }}
                  aria-hidden="true"
                />
              </span>
            </h1>
            <p className="mt-7 max-w-lg text-pretty text-lg text-slate-300 md:text-xl">
              Lovon Teams is a live infrastructure of specialized AI agents that
              run your business 24/7 — built to start on free-tier providers with
              zero upfront spend.
            </p>
            <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row">
              <a href="/auth?mode=signup" className="cursor-pointer">
                <Button
                  size="lg"
                  className="group h-12 rounded-full bg-cyan-400 px-7 font-semibold text-slate-950 shadow-[0_0_30px_-6px_rgba(0,224,255,0.7)] transition hover:bg-cyan-300 hover:shadow-[0_0_36px_-4px_rgba(0,224,255,0.8)]"
                >
                  Deploy Agents
                  <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                </Button>
              </a>
              <a
                href="https://github.com/fjosmoreno/lovon-teams"
                target="_blank"
                rel="noreferrer noopener"
                className="cursor-pointer inline-flex h-12 items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 px-6 font-mono text-sm text-cyan-300 backdrop-blur transition hover:border-cyan-400/60 hover:bg-cyan-400/10"
              >
                <Github className="h-4 w-4" />
                Star on GitHub
              </a>
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-sm text-slate-300 sm:grid-cols-4">
              {heroMini.map((m) => (
                <li key={m.label} className="flex items-center gap-2">
                  <m.icon className="h-4 w-4 text-cyan-300" />
                  <span>{m.label}</span>
                </li>
              ))}
            </ul>
            <div className="mt-12 flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-slate-500">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(0,245,160,0.8)]" />
              <span>System online · 18 agents running · 2,847 tasks / hr</span>
            </div>
            <ScanLine />
          </div>
          <div className="relative">
            <HeroColumns />
            <div className="pointer-events-none absolute -inset-8 rounded-3xl bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 blur-2xl" aria-hidden="true" />
          </div>
        </div>
      </Section>

      {/* Quickstart */}
      <Section className="py-12">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <Eyebrow>Quickstart</Eyebrow>
            <H2>From <code className="text-cyan-300">copy</code> to a running agent company in 60 seconds.</H2>
            <p className="mt-5 text-slate-300">
              Open source. Self-hosted. Pick your package manager, copy the install
              command, and the interactive setup walks you through database, auth,
              and starting your first agent team — all on free-tier providers.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
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
            <p className="mt-6 font-mono text-xs text-slate-500">
              No account · No credit card · No paid tier required · MIT
            </p>
          </div>
          <div className="space-y-3">
            <LovonInstallCommand defaultManager="npm" variant="hero" />
            <div className="overflow-hidden rounded-xl border border-white/5 bg-black/40 font-mono text-[11px] leading-relaxed text-slate-400">
              <div className="flex items-center gap-1.5 border-b border-white/[0.04] bg-white/[0.02] px-3 py-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400/80" />
                <span className="text-slate-500">expected output</span>
              </div>
              <pre className="overflow-x-auto p-3">
{`› Embedded PostgreSQL ready
› Created instance at ~/.lovon-teams/instances/default
› Board claim URL:   http://localhost:3100/board-claim/…
› Picked 8 free providers, 0 paid

✓ Lovon Teams running at http://localhost:3100`}
              </pre>
            </div>
          </div>
        </div>
      </Section>

      {/* 3 steps */}
      <Section id="how" className="py-20">
        <div className="mb-10 text-center">
          <Eyebrow>How it works</Eyebrow>
          <H2>From goal to running company in 3 steps.</H2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {threeSteps.map((s) => (
            <div
              key={s.num}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-7 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30"
            >
              <div className="font-mono text-xs text-cyan-400">{s.num}</div>
              <h3 className="mt-3 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.body}</p>
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
          {providers.map((p) => (
            <div
              key={p.name}
              className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/30"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: "radial-gradient(ellipse 100% 80% at 50% 0%, rgba(0,224,255,0.15), transparent 60%)" }}
                aria-hidden="true"
              />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,224,255,0.8)]" />
                  <span className="text-sm font-semibold">{p.name}</span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{p.tag}</span>
              </div>
              <p className="relative mt-1 text-xs text-slate-400">{p.note}</p>
              <a
                href={p.keyUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="relative mt-3 inline-flex items-center gap-1 rounded-md border border-cyan-400/30 bg-cyan-400/5 px-2 py-0.5 font-mono text-[10px] text-cyan-300 transition hover:border-cyan-400/60 hover:bg-cyan-400/10"
              >
                <ExternalLink className="h-2.5 w-2.5" />
                Get {p.name} key
              </a>
            </div>
          ))}
        </div>
      </Section>

      {/* Features */}
      <Section id="features" className="py-20">
        <div className="mb-10 text-center">
          <Eyebrow>Features</Eyebrow>
          <H2>Built for autonomy at scale.</H2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-white/10"
            >
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: `radial-gradient(circle, ${f.accent}50, transparent 70%)` }}
                aria-hidden="true"
              />
              <div className="relative">
                <f.icon className="h-7 w-7" style={{ color: f.accent }} />
                <h3 className="mt-4 text-lg font-semibold md:text-xl">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Cost control */}
      <Section className="py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <Eyebrow>Cost control</Eyebrow>
            <H2>Know what every agent costs.</H2>
            <p className="mt-4 text-slate-400">
              Per-agent budgets. Auto-pause at 100%. Track spend per task, per project, per goal.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur">
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
              className="group rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/30"
            >
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                ))}
              </div>
              <blockquote className="mt-3 text-sm leading-relaxed text-slate-200">"{t.text}"</blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/40 to-emerald-400/40 font-bold text-slate-100">
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
          Deploy your AI workforce.{" "}
          <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">Free.</span>
        </H2>
        <div className="mx-auto mt-10 flex max-w-xl justify-center">
          <LovonInstallCommand defaultManager="npm" variant="hero" />
        </div>
        <p className="mt-8 text-sm text-slate-400">Open source. Self-hosted. MIT licensed. No account required.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="https://github.com/fjosmoreno/lovon-teams" target="_blank" rel="noreferrer noopener" className="cursor-pointer">
            <Button size="lg" className="h-12 rounded-full bg-cyan-400 px-7 font-semibold text-slate-950 hover:bg-cyan-300 hover:shadow-[0_0_24px_-4px_rgba(0,224,255,0.7)]">
              <Github className="mr-2 h-4 w-4" /> Star on GitHub
            </Button>
          </a>
          <a href="https://github.com/fjosmoreno/lovon-teams#readme" target="_blank" rel="noreferrer noopener" className="cursor-pointer">
            <Button size="lg" variant="outline" className="h-12 rounded-full border-cyan-400/30 bg-cyan-400/5 px-6 text-cyan-300 hover:bg-cyan-400/10">
              <BookOpen className="mr-2 h-4 w-4" /> Read the docs →
            </Button>
          </a>
        </div>
      </Section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 px-6 py-10 text-sm text-slate-500">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-cyan-400 to-emerald-400 text-xs font-bold text-slate-950">
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
          <div className="font-mono text-[11px] uppercase tracking-widest">© {new Date().getFullYear()} Lovon Teams · MIT</div>
        </div>
      </footer>
    </div>
  );
}

export default LovonLanding;