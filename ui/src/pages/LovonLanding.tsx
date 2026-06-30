/**
 * Lovon Teams — public marketing landing page.
 *
 * Replaces the bare auth page when an unauthenticated visitor lands on
 * the root URL. Modeled on paperclip.ing's structure (hero, quickstart,
 * features, providers, cost, governance, FAQ, footer) with the
 * NFT-style visual language (dark base, bold typography, neon emerald
 * accents, violet brand) and Lovon Teams copy.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github, BookOpen, Sparkles, Zap, Shield, Users, BarChart3, Network, FileText, Bot, Check, ChevronDown } from "lucide-react";

const navLinks = [
  { label: "Docs", href: "https://github.com/fjosmoreno/lovon-teams#readme" },
  { label: "GitHub", href: "https://github.com/fjosmoreno/lovon-teams" },
];

const heroStats = [
  { value: "$0", label: "to start" },
  { value: "8", label: "free providers" },
  { value: "MIT", label: "open source" },
];

const providers = [
  { name: "Gemini Free", note: "Google AI Studio" },
  { name: "Groq Free", note: "Llama · Mixtral" },
  { name: "GitHub Models", note: "GPT-4o · Claude · Llama" },
  { name: "Cloudflare AI", note: "Workers AI" },
  { name: "Hugging Face", note: "Inference API" },
  { name: "Cohere Trial", note: "Command R+" },
  { name: "Mistral Free", note: "La Plateforme" },
  { name: "OpenRouter", note: "Free models" },
];

const features = [
  {
    icon: Bot,
    title: "Bring Your Own Agent",
    body: "Any agent, any runtime, one org chart. If it can receive a heartbeat, it's hired.",
  },
  {
    icon: Network,
    title: "Org Chart",
    body: "Hierarchies, roles, reporting lines. Your agents have a boss, a title, and a job description.",
  },
  {
    icon: Sparkles,
    title: "Goal Alignment",
    body: "Every task traces back to the mission. Agents know what to do and why.",
  },
  {
    icon: BarChart3,
    title: "Cost Control",
    body: "Monthly budgets per agent. When they hit the limit, they stop. No runaway costs.",
  },
  {
    icon: FileText,
    title: "Ticket System",
    body: "Every conversation traced. Every decision explained. Full tool-call tracing and audit log.",
  },
  {
    icon: Shield,
    title: "Governance",
    body: "You're in charge. Approve hires, override strategy, pause or terminate any agent — at any time.",
  },
];

const threeSteps = [
  { num: "01", title: "Define the goal.", body: "\"Build the #1 AI note-taking app to $1mm ARR.\"" },
  { num: "02", title: "Hire the team.", body: "CEO, CTO, engineers, designers, marketers — any agent, any free-tier provider." },
  { num: "03", title: "Approve and run.", body: "Review the CEO's strategy. Set budgets. Hit go. Monitor from the dashboard." },
];

const sampleAgents = [
  { role: "CEO", provider: "Gemini Free" },
  { role: "CMO", provider: "Groq Free" },
  { role: "CTO", provider: "GitHub Models" },
  { role: "COO", provider: "Cloudflare AI" },
  { role: "Frontend Eng", provider: "Gemini Free" },
  { role: "Backend Eng", provider: "Groq Free" },
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
    text: "Lovon Teams finally let me start an agent company without paying for Claude first. The free providers actually work.",
  },
  {
    name: "Diego R.",
    handle: "@diegor",
    text: "Same control plane as the paid tools, but I'm running my CEO on Groq's free tier. Zero spend, full features.",
  },
  {
    name: "Aline S.",
    handle: "@alines",
    text: "The org chart + goal alignment makes a real difference. My agents know the why, not just the what.",
  },
  {
    name: "Pedro M.",
    handle: "@pedrom",
    text: "Open source, MIT, self-hosted, free-tier providers. It's everything Linear forgot to ship for agents.",
  },
  {
    name: "Júlia T.",
    handle: "@juliat",
    text: "Started with Gemini Free, now mix Groq for fast and Gemini Pro for complex. Lovon Teams makes that trivial.",
  },
  {
    name: "Rafael O.",
    handle: "@rafaelo",
    text: "The cost control is the killer feature. Each agent has a budget, and they actually stop when it runs out.",
  },
];

const faqItems = [
  {
    q: "How is Lovon Teams different from Paperclip?",
    a: "Lovon Teams is a fork of Paperclip with first-class support for free-tier AI providers (Groq, GitHub Models, Cloudflare Workers AI, Hugging Face, Cohere, Mistral, OpenRouter, plus Google's free Gemini tier). Same control plane, $0 to start.",
  },
  {
    q: "Can I use my existing agents?",
    a: "Yes. Lovon Teams is unopinionated about agent runtimes. Your agents can be Gemini CLI, Claude Code, OpenClaw bots, Python scripts, shell commands, HTTP webhooks — anything that can receive a heartbeat. Adapters connect Lovon Teams to whatever you use.",
  },
  {
    q: "What happens when an agent hits its budget?",
    a: "At 100% utilization the agent auto-pauses and new tasks are blocked. Soft warning at 80%. As the board you can override the limit at any time.",
  },
  {
    q: "Is Lovon Teams really free?",
    a: "The Lovon Teams software is MIT-licensed open source. Running it on free-tier providers costs $0. If you later upgrade a single agent to a paid model (e.g. Claude Sonnet for the CEO), you only pay that one provider's list price.",
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

function classNames(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

function Section({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={classNames("relative px-6 py-20 lg:py-28", className)}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-300">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.6)]" aria-hidden="true" />
      {children}
    </div>
  );
}

function H2({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={classNames("text-balance text-3xl font-extrabold leading-[1.1] tracking-tight md:text-5xl", className)}>
      {children}
    </h2>
  );
}

function TerminalMock({ children, label = "~/lovon-teams" }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 shadow-2xl backdrop-blur">
      <div className="flex items-center gap-1.5 border-b border-white/5 bg-white/[0.02] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-3 font-mono text-[11px] text-slate-500">{label}</span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-slate-200">
        {children}
      </pre>
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
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-base font-semibold md:text-lg">{q}</span>
        <ChevronDown
          className={classNames(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180 text-emerald-400",
          )}
        />
      </button>
      {open && <p className="pb-5 pr-8 text-sm leading-relaxed text-slate-400 md:text-base">{a}</p>}
    </div>
  );
}

export function LovonLanding() {
  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#0a0a1a] text-slate-100"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 20% 0%, rgba(124, 58, 237, 0.25), transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(34, 197, 94, 0.18), transparent 60%)",
      }}
    >
      {/* Glow accents */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden="true" />

      {/* Top nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-emerald-400 font-bold text-slate-950">
            L
          </div>
          <span className="font-mono text-sm tracking-[0.24em] text-slate-200">LOVON TEAMS</span>
        </a>
        <nav className="flex items-center gap-6 text-sm text-slate-300">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noreferrer noopener"
              className="cursor-pointer hover:text-slate-100"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/auth"
            className="cursor-pointer text-slate-200 underline-offset-4 hover:text-slate-100 hover:underline"
          >
            Sign in
          </a>
          <Button asChild>
            <a href="/auth?mode=signup">Get started</a>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <Section className="pt-12 pb-24 text-center">
        <Eyebrow>Beta · Free providers ready</Eyebrow>
        <h1 className="mx-auto max-w-4xl text-balance text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
          A team of agents.{" "}
          <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-emerald-300 bg-clip-text text-transparent">
            For every person.
          </span>{" "}
          <span className="block text-slate-300">Starting at $0.</span>
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-pretty text-lg text-slate-300 md:text-xl">
          Lovon Teams is the app people use to run a company of AI agents.
          Open source, self-hosted, and built to start on free-tier providers
          with no upfront spend.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="/auth?mode=signup"
            className="cursor-pointer"
          >
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
        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-6">
          {heroStats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-mono text-3xl font-bold text-emerald-300 md:text-4xl">{s.value}</div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-widest text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Quickstart terminal */}
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
                className="cursor-pointer inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
              >
                <Github className="h-4 w-4" /> Star on GitHub
              </a>
              <a
                href="https://github.com/fjosmoreno/lovon-teams#readme"
                target="_blank"
                rel="noreferrer noopener"
                className="cursor-pointer inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
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

      {/* Testimonials */}
      <Section className="py-16">
        <div className="mb-10 text-center">
          <Eyebrow>Social proof</Eyebrow>
          <H2>Loved by builders.</H2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.handle}
              className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur transition hover:border-emerald-400/30"
            >
              <blockquote className="text-sm leading-relaxed text-slate-200">"{t.text}"</blockquote>
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

      {/* 3 steps */}
      <Section className="py-20">
        <div className="mb-10 text-center">
          <Eyebrow>How it works</Eyebrow>
          <H2>
            Manage business goals,
            <br />
            not pull requests.
          </H2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {threeSteps.map((s) => (
            <div key={s.num} className="rounded-2xl border border-white/5 bg-white/[0.03] p-7 backdrop-blur">
              <div className="font-mono text-xs text-emerald-400">{s.num}</div>
              <h3 className="mt-3 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Features */}
      <Section className="py-20">
        <div className="mb-10 text-center">
          <Eyebrow>Features</Eyebrow>
          <H2>Everything you need to run a team of agents.</H2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur transition hover:border-violet-400/30 hover:bg-white/[0.05]"
            >
              <f.icon className="h-6 w-6 text-emerald-400" />
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Providers */}
      <Section className="py-20">
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
              className="rounded-xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur transition hover:border-emerald-400/30"
            >
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.6)]" aria-hidden="true" />
                <span className="text-sm font-semibold">{p.name}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{p.note}</p>
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
            <div className="mt-6 divide-y divide-white/5 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur">
              {sampleAgents.map((a) => (
                <div key={a.role} className="flex items-center justify-between gap-4 px-5 py-3">
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
                    <tr key={b.role}>
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
              className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center font-mono text-sm uppercase tracking-widest text-emerald-300 backdrop-blur"
            >
              {verb}
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section className="py-20">
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
          Hire a team of agents.
          <br />
          <span className="bg-gradient-to-r from-emerald-300 to-violet-300 bg-clip-text text-transparent">
            In one command.
          </span>
        </H2>
        <TerminalMock label="~/lovon-teams">
{`$ npx lovon-teams onboard --yes

✓ Lovon Teams running at http://localhost:3100`}
        </TerminalMock>
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