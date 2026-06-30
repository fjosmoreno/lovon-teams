import { Navigate, Outlet, Route, Routes, useLocation, useParams } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { Layout } from "./components/Layout";
import { ConferenceRoomChatGate } from "./components/ConferenceRoomChatGate";
import { PipelinesExperimentalGate } from "./components/PipelinesExperimentalGate";
import { OnboardingWizardVariant } from "./components/OnboardingWizardVariant";
import { CloudAccessGate } from "./components/CloudAccessGate";
import { Dashboard } from "./pages/Dashboard";
import { DashboardLive } from "./pages/DashboardLive";
import { Companies } from "./pages/Companies";
import { Agents } from "./pages/Agents";
import { AgentDetail } from "./pages/AgentDetail";
import { Projects } from "./pages/Projects";
import { ProjectDetail } from "./pages/ProjectDetail";
import { ProjectWorkspaceDetail } from "./pages/ProjectWorkspaceDetail";
import { Workspaces } from "./pages/Workspaces";
import { Issues } from "./pages/Issues";
import { Search } from "./pages/Search";
import { IssueDetail } from "./pages/IssueDetail";
import { IssueChatLongThreadPerf } from "./pages/IssueChatLongThreadPerf";
import { Routines } from "./pages/Routines";
import { Learnings, PipelineItemDetail, PipelineItemLegacyRedirect, Pipelines, ReviewQueue } from "./pages/Pipelines";
import { PipelineSettings } from "./pages/PipelineSettings";
import { RoutineDetail } from "./pages/RoutineDetail";
import { UserProfile } from "./pages/UserProfile";
import { ExecutionWorkspaceDetail } from "./pages/ExecutionWorkspaceDetail";
import { Goals } from "./pages/Goals";
import { Artifacts } from "./pages/Artifacts";
import { GoalDetail } from "./pages/GoalDetail";
import { Approvals } from "./pages/Approvals";
import { ApprovalDetail } from "./pages/ApprovalDetail";
import { Costs } from "./pages/Costs";
import { Activity } from "./pages/Activity";
import { Inbox } from "./pages/Inbox";
import { BoardChat } from "./pages/BoardChat";
import { CompanySettings } from "./pages/CompanySettings";
import { CompanyEnvironments } from "./pages/CompanyEnvironments";
import { CloudUpstream } from "./pages/CloudUpstream";
import { CloudUpstreamUxLab } from "./pages/CloudUpstreamUxLab";
import { BootstrapSetupUxLab } from "./pages/BootstrapSetupUxLab";
import { CompanySettingsPluginPage } from "./pages/CompanySettingsPluginPage";
import { CompanyAccess, CompanyAccessLegacyRoute } from "./pages/CompanyAccess";
import { CompanyInvites } from "./pages/CompanyInvites";
import { CompanySkills } from "./pages/CompanySkills";
import { Secrets } from "./pages/Secrets";
import { CompanyExport } from "./pages/CompanyExport";
import { CompanyImport } from "./pages/CompanyImport";
import { DesignGuide } from "./pages/DesignGuide";
import { InstanceGeneralSettings } from "./pages/InstanceGeneralSettings";
import { InstanceAccess } from "./pages/InstanceAccess";
import { InstanceSettings } from "./pages/InstanceSettings";
import { InstanceExperimentalSettings } from "./pages/InstanceExperimentalSettings";
import { ProfileSettings } from "./pages/ProfileSettings";
import { PluginManager } from "./pages/PluginManager";
import { PluginSettings } from "./pages/PluginSettings";
import { AdapterManager } from "./pages/AdapterManager";
import { PluginPage } from "./pages/PluginPage";
import { LovonLanding } from "./pages/LovonLanding";
import { OrgChart } from "./pages/OrgChart";
import { NewAgent } from "./pages/NewAgent";
import { AuthPage } from "./pages/Auth";
import { BoardClaimPage } from "./pages/BoardClaim";
import { CliAuthPage } from "./pages/CliAuth";
import { InviteLandingPage } from "./pages/InviteLanding";
import { JoinRequestQueue } from "./pages/JoinRequestQueue";
import { NotFoundPage } from "./pages/NotFound";
import { useCompany } from "./context/CompanyContext";
import { useDialogActions, useDialogState } from "./context/DialogContext";
import { loadLastInboxTab } from "./lib/inbox";
import {
  isOnboardingWizardActive,
  shouldRedirectCompanylessRouteToOnboarding,
} from "./lib/onboarding-route";
import { normalizeRememberedInstanceSettingsPath } from "./lib/instance-settings";
import { ArrowRight } from "lucide-react";

function boardRoutes() {
  return (
    <>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="dashboard/live" element={<DashboardLive />} />
      <Route path="onboarding" element={<OnboardingRoutePage />} />
      <Route path="companies" element={<Companies />} />
      <Route path="company/settings" element={<CompanySettings />} />
      <Route path="company/settings/environments" element={<Navigate to="/company/settings/instance/environments" replace />} />
      <Route path="company/settings/cloud-upstream" element={<CloudUpstream />} />
      <Route path="company/settings/members" element={<CompanyAccess />} />
      <Route path="company/settings/access" element={<CompanyAccessLegacyRoute />} />
      <Route path="company/settings/cloud-upstream" element={<CloudUpstream />} />
      <Route path="company/settings/invites" element={<CompanyInvites />} />
      <Route path="company/export/*" element={<CompanyExport />} />
      <Route path="company/import" element={<CompanyImport />} />
      <Route path="company/settings/secrets" element={<Secrets />} />
      <Route path="company/settings/instance" element={<Navigate to="general" replace />} />
      <Route path="company/settings/instance/profile" element={<ProfileSettings />} />
      <Route path="company/settings/instance/general" element={<InstanceGeneralSettings />} />
      <Route path="company/settings/instance/environments" element={<CompanyEnvironments />} />
      <Route path="company/settings/instance/access" element={<InstanceAccess />} />
      <Route path="company/settings/instance/heartbeats" element={<InstanceSettings />} />
      <Route path="company/settings/instance/experimental" element={<InstanceExperimentalSettings />} />
      <Route path="company/settings/instance/plugins" element={<PluginManager />} />
      <Route path="company/settings/instance/plugins/:pluginId" element={<PluginSettings />} />
      <Route path="company/settings/instance/adapters" element={<AdapterManager />} />
      <Route path="company/settings/:settingsRoutePath/*" element={<CompanySettingsPluginPage />} />
      <Route path="skills/*" element={<CompanySkills />} />
      <Route path="settings" element={<LegacySettingsRedirect />} />
      <Route path="settings/*" element={<LegacySettingsRedirect />} />
      <Route path="plugins/:pluginId" element={<PluginPage />} />
      <Route path="org" element={<OrgChart />} />
      <Route path="agents" element={<Navigate to="/agents/all" replace />} />
      <Route path="agents/all" element={<Agents />} />
      <Route path="agents/active" element={<Agents />} />
      <Route path="agents/paused" element={<Agents />} />
      <Route path="agents/error" element={<Agents />} />
      <Route path="agents/new" element={<NewAgent />} />
      <Route path="agents/:agentId" element={<AgentDetail />} />
      <Route path="agents/:agentId/:tab" element={<AgentDetail />} />
      <Route path="agents/:agentId/runs/:runId" element={<AgentDetail />} />
      <Route path="projects" element={<Projects />} />
      <Route path="projects/:projectId" element={<ProjectDetail />} />
      <Route path="projects/:projectId/overview" element={<ProjectDetail />} />
      <Route path="projects/:projectId/issues" element={<ProjectDetail />} />
      <Route path="projects/:projectId/issues/:filter" element={<ProjectDetail />} />
      <Route path="projects/:projectId/workspaces/:workspaceId" element={<ProjectWorkspaceDetail />} />
      <Route path="projects/:projectId/workspaces" element={<ProjectDetail />} />
      <Route path="projects/:projectId/configuration" element={<ProjectDetail />} />
      <Route path="projects/:projectId/budget" element={<ProjectDetail />} />
      <Route path="workspaces" element={<Workspaces />} />
      <Route path="issues" element={<Issues />} />
      <Route path="search" element={<Search />} />
      <Route path="issues/all" element={<Navigate to="/issues" replace />} />
      <Route path="issues/active" element={<Navigate to="/issues" replace />} />
      <Route path="issues/backlog" element={<Navigate to="/issues" replace />} />
      <Route path="issues/done" element={<Navigate to="/issues" replace />} />
      <Route path="issues/recent" element={<Navigate to="/issues" replace />} />
      <Route path="issues/:issueId" element={<IssueDetail />} />
      {import.meta.env.DEV ? (
        <Route path="tests/perf/long-thread" element={<IssueChatLongThreadPerf />} />
      ) : null}
      <Route path="routines" element={<Routines />} />
      <Route
        path="review-queue"
        element={<PipelinesExperimentalGate><ReviewQueue /></PipelinesExperimentalGate>}
      />
      <Route
        path="learnings"
        element={<PipelinesExperimentalGate><Learnings /></PipelinesExperimentalGate>}
      />
      <Route
        path="pipelines"
        element={<PipelinesExperimentalGate><Pipelines /></PipelinesExperimentalGate>}
      />
      <Route
        path="pipelines/:pipelineId"
        element={<PipelinesExperimentalGate><Pipelines /></PipelinesExperimentalGate>}
      />
      <Route
        path="pipelines/:pipelineId/add"
        element={<PipelinesExperimentalGate><Pipelines /></PipelinesExperimentalGate>}
      />
      <Route
        path="pipelines/:pipelineId/settings"
        element={<PipelinesExperimentalGate><PipelineSettings /></PipelinesExperimentalGate>}
      />
      <Route
        path="pipelines/:pipelineId/items/:caseId"
        element={<PipelinesExperimentalGate><PipelineItemDetail /></PipelinesExperimentalGate>}
      />
      <Route
        path="pipelines/:pipelineId/cases/:caseId"
        element={<PipelinesExperimentalGate><PipelineItemLegacyRedirect /></PipelinesExperimentalGate>}
      />
      <Route path="routines/:routineId" element={<RoutineDetail />} />
      <Route path="routines/:routineId/:section" element={<RoutineDetail />} />
      <Route path="execution-workspaces/:workspaceId" element={<ExecutionWorkspaceDetail />} />
      <Route path="execution-workspaces/:workspaceId/services" element={<ExecutionWorkspaceDetail />} />
      <Route path="execution-workspaces/:workspaceId/configuration" element={<ExecutionWorkspaceDetail />} />
      <Route path="execution-workspaces/:workspaceId/runtime-logs" element={<ExecutionWorkspaceDetail />} />
      <Route path="execution-workspaces/:workspaceId/issues" element={<ExecutionWorkspaceDetail />} />
      <Route path="execution-workspaces/:workspaceId/routines" element={<ExecutionWorkspaceDetail />} />
      <Route path="goals" element={<Goals />} />
      <Route path="goals/:goalId" element={<GoalDetail />} />
      <Route path="artifacts" element={<Artifacts />} />
      <Route path="approvals" element={<Navigate to="/approvals/pending" replace />} />
      <Route path="approvals/pending" element={<Approvals />} />
      <Route path="approvals/all" element={<Approvals />} />
      <Route path="approvals/:approvalId" element={<ApprovalDetail />} />
      <Route path="costs" element={<Costs />} />
      <Route path="activity" element={<Activity />} />
      {/* Conference Room Chat surfaces (PAP-136/PAP-137): routes stay
          registered but redirect to the company home while the experimental
          flag is off. The board-level `artifacts` mount below is the new
          conference-room one; the master-level mount above it still serves
          `/artifacts` in both modes. */}
      <Route element={<ConferenceRoomChatGate />}>
        <Route path="board-chat" element={<BoardChat />} />
        <Route path="artifacts" element={<Artifacts />} />
      </Route>
      <Route path="inbox" element={<InboxRootRedirect />} />
      <Route path="inbox/mine" element={<Inbox />} />
      <Route path="inbox/recent" element={<Inbox />} />
      <Route path="inbox/unread" element={<Inbox />} />
      <Route path="inbox/blocked" element={<Inbox />} />
      <Route path="inbox/all" element={<Inbox />} />
      <Route path="inbox/requests" element={<JoinRequestQueue />} />
      <Route path="inbox/new" element={<Navigate to="/inbox/mine" replace />} />
      <Route path="u/:userSlug" element={<UserProfile />} />
      <Route path="design-guide" element={<DesignGuide />} />
      <Route path="instance/settings/adapters" element={<AdapterManager />} />
      <Route path=":pluginRoutePath/*" element={<PluginPage />} />
      <Route path="*" element={<NotFoundPage scope="board" />} />
    </>
  );
}

function InboxRootRedirect() {
  return <Navigate to={`/inbox/${loadLastInboxTab()}`} replace />;
}

function LegacySettingsRedirect() {
  const location = useLocation();
  const { companies, selectedCompany, loading } = useCompany();
  const { companyPrefix } = useParams<{ companyPrefix?: string }>();

  if (loading) {
    return <div className="mx-auto max-w-xl py-10 text-sm text-muted-foreground">Loading...</div>;
  }

  const targetCompany =
    (companyPrefix
      ? companies.find((company) => company.issuePrefix.toUpperCase() === companyPrefix.toUpperCase())
      : null) ??
    selectedCompany ??
    companies[0] ??
    null;

  if (!targetCompany) {
    if (
      shouldRedirectCompanylessRouteToOnboarding({
        pathname: location.pathname,
        hasCompanies: false,
      })
    ) {
      return <Navigate to="/onboarding" replace />;
    }
    return <NoCompaniesStartPage />;
  }

  const normalizedPath = normalizeRememberedInstanceSettingsPath(
    `${location.pathname}${location.search}${location.hash}`,
  );

  return (
    <Navigate
      to={`/${targetCompany.issuePrefix}${normalizedPath}`}
      replace
    />
  );
}

function OnboardingRoutePage() {
  const { companies } = useCompany();
  const { openOnboarding } = useDialogActions();
  const { onboardingOpen, onboardingRouteDismissed } = useDialogState();
  const { companyPrefix } = useParams<{ companyPrefix?: string }>();

  // The OnboardingWizard auto-opens on this route (and can also be opened
  // explicitly). While it is showing it covers the whole screen, so the
  // launcher card below must not stay interactive behind it — otherwise users
  // can tab/click through to the form behind the modal (PAP-52). The launcher
  // only needs to render as a re-entry point once the wizard is dismissed.
  if (isOnboardingWizardActive({ onboardingOpen, routeDismissed: onboardingRouteDismissed })) {
    return null;
  }
  const matchedCompany = companyPrefix
    ? companies.find((company) => company.issuePrefix.toUpperCase() === companyPrefix.toUpperCase()) ?? null
    : null;

  const title = matchedCompany
    ? `Add another agent to ${matchedCompany.name}`
    : companies.length > 0
      ? "Create another company"
      : "Create your first company";
  const description = matchedCompany
    ? "Run onboarding again to add an agent and a starter task for this company."
    : companies.length > 0
      ? "Run onboarding again to create another company and seed its first agent."
      : "Get started by creating a company and your first agent.";

  return (
    <div className="mx-auto max-w-xl py-10">
      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-4">
          <Button
            onClick={() =>
              matchedCompany
                ? openOnboarding({ initialStep: 2, companyId: matchedCompany.id })
                : openOnboarding()
            }
          >
            {matchedCompany ? "Add Agent" : "Start Onboarding"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CompanyRootRedirect() {
  const { companies, selectedCompany, loading } = useCompany();
  const location = useLocation();

  if (loading) {
    return <div className="mx-auto max-w-xl py-10 text-sm text-muted-foreground">Loading...</div>;
  }

  const targetCompany = selectedCompany ?? companies[0] ?? null;
  if (!targetCompany) {
    if (
      shouldRedirectCompanylessRouteToOnboarding({
        pathname: location.pathname,
        hasCompanies: false,
      })
    ) {
      return <Navigate to="/onboarding" replace />;
    }
    return <NoCompaniesStartPage />;
  }

  return <Navigate to={`/${targetCompany.issuePrefix}/dashboard`} replace />;
}

function UnprefixedBoardRedirect() {
  const location = useLocation();
  const { companies, selectedCompany, loading } = useCompany();

  if (loading) {
    return <div className="mx-auto max-w-xl py-10 text-sm text-muted-foreground">Loading...</div>;
  }

  const targetCompany = selectedCompany ?? companies[0] ?? null;
  if (!targetCompany) {
    if (
      shouldRedirectCompanylessRouteToOnboarding({
        pathname: location.pathname,
        hasCompanies: false,
      })
    ) {
      return <Navigate to="/onboarding" replace />;
    }
    return <NoCompaniesStartPage />;
  }

  return (
    <Navigate
      to={`/${targetCompany.issuePrefix}${location.pathname}${location.search}${location.hash}`}
      replace
    />
  );
}

function NoCompaniesStartPage() {
  const { openOnboarding } = useDialogActions();
  const { t } = useTranslation();

  // Lovon Teams — landing page for first-time users.
  // Dark + bold + neon accent style (similar to NFT / crypto hero pages).
  const freeProviders = [
    { id: "gemini",   name: "Gemini Free",     note: "Google AI Studio" },
    { id: "groq",     name: "Groq Free",       note: "Llama · Mixtral" },
    { id: "gh-models", name: "GitHub Models",  note: "GPT-4o · Claude · Llama" },
    { id: "cloudflare", name: "Cloudflare AI", note: "Workers AI" },
    { id: "hf",       name: "Hugging Face",    note: "Inference API" },
    { id: "cohere",   name: "Cohere Trial",    note: "Command R+" },
    { id: "mistral",  name: "Mistral Free",    note: "La Plateforme" },
    { id: "openrouter", name: "OpenRouter",    note: "Free models" },
  ];

  return (
    <div
      className="relative isolate min-h-screen overflow-hidden bg-[#0a0a1a] text-slate-100"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 20% 0%, rgba(124, 58, 237, 0.25), transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(34, 197, 94, 0.18), transparent 60%)",
      }}
    >
      {/* Glow accents */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden="true" />

      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-12 lg:px-10">
        {/* Top bar */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-emerald-400 font-bold text-slate-950">
              L
            </div>
            <span className="font-mono text-sm tracking-[0.24em] text-slate-300">LOVON TEAMS</span>
          </div>
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-emerald-300">
            Beta · Free tier ready
          </span>
        </header>

        {/* Hero */}
        <section className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <h1 className="max-w-3xl text-balance text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            Run an{" "}
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-emerald-300 bg-clip-text text-transparent">
              AI-agent company
            </span>{" "}
            starting at{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-emerald-300">$0</span>
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-1 w-full rounded bg-gradient-to-r from-emerald-400 to-violet-400"
              />
            </span>
            .
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-base text-slate-300 md:text-lg">
            Lovon Teams is the control plane for orchestrating teams of AI agents.
            Hire a CEO, a CTO, engineers, designers — any agent, any free-tier provider —
            and watch them run your business around the clock.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => openOnboarding()}
              className="group h-12 rounded-full bg-emerald-500 px-7 font-semibold text-slate-950 shadow-[0_0_40px_-10px_rgba(34,197,94,0.6)] transition hover:bg-emerald-400"
            >
              Start free
              <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
            </Button>
            <a
              href="https://github.com/fjosmoreno/lovon-teams"
              target="_blank"
              rel="noreferrer noopener"
              className="cursor-pointer text-sm text-slate-300 underline-offset-4 hover:text-slate-100 hover:underline"
            >
              See the code on GitHub
            </a>
          </div>

          <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-slate-500">
            No credit card · 8 free providers · MIT licensed
          </p>
        </section>

        {/* Provider grid */}
        <section className="pb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-[0.24em] text-slate-400">
              Lovon Free Providers
            </h2>
            <span className="font-mono text-[11px] text-slate-500">
              Powered by community free tiers · Swap providers anytime
            </span>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {freeProviders.map((p) => (
              <li
                key={p.id}
                className="group rounded-xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur transition hover:border-emerald-400/30 hover:bg-white/[0.05]"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.6)]" aria-hidden="true" />
                  <span className="text-sm font-semibold text-slate-100">{p.name}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{p.note}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 pt-6 text-xs text-slate-500">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <span>
              Lovon Teams · open-source under MIT · derived from{" "}
              <a
                href="https://github.com/paperclipai/paperclip"
                target="_blank"
                rel="noreferrer noopener"
                className="cursor-pointer text-slate-300 underline-offset-4 hover:text-slate-100 hover:underline"
              >
                Paperclip
              </a>
            </span>
            <span className="font-mono uppercase tracking-widest">
              v0.1 · {new Date().getFullYear()}
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export function App() {
  return (
    <>
      <Routes>
        <Route path="auth" element={<AuthPage />} />
        <Route path="welcome" element={<LovonLanding />} />
        <Route path="board-claim/:token" element={<BoardClaimPage />} />
        <Route path="cli-auth/:id" element={<CliAuthPage />} />
        <Route path="invite/:token" element={<InviteLandingPage />} />
        <Route path="tests/perf/long-thread" element={<IssueChatLongThreadPerf />} />
        <Route path="ux-lab/cloud-upstream" element={<CloudUpstreamUxLab />} />
        <Route path="ux-lab/bootstrap-setup" element={<BootstrapSetupUxLab />} />

        <Route element={<CloudAccessGate />}>
          <Route index element={<CompanyRootRedirect />} />
          <Route path="onboarding" element={<OnboardingRoutePage />} />
          <Route path="instance" element={<LegacySettingsRedirect />} />
          <Route path="instance/settings" element={<LegacySettingsRedirect />} />
          <Route path="instance/settings/*" element={<LegacySettingsRedirect />} />
          <Route path="companies" element={<UnprefixedBoardRedirect />} />
          <Route path="issues" element={<UnprefixedBoardRedirect />} />
          <Route path="issues/:issueId" element={<UnprefixedBoardRedirect />} />
          <Route path="routines" element={<UnprefixedBoardRedirect />} />
          <Route path="routines/:routineId" element={<UnprefixedBoardRedirect />} />
          <Route path="review-queue" element={<UnprefixedBoardRedirect />} />
          <Route path="learnings" element={<UnprefixedBoardRedirect />} />
          <Route path="pipelines" element={<UnprefixedBoardRedirect />} />
          <Route path="pipelines/:pipelineId" element={<UnprefixedBoardRedirect />} />
          <Route path="pipelines/:pipelineId/add" element={<UnprefixedBoardRedirect />} />
          <Route path="pipelines/:pipelineId/settings" element={<UnprefixedBoardRedirect />} />
          <Route path="pipelines/:pipelineId/items/:caseId" element={<UnprefixedBoardRedirect />} />
          <Route path="pipelines/:pipelineId/cases/:caseId" element={<UnprefixedBoardRedirect />} />
          <Route path="artifacts" element={<UnprefixedBoardRedirect />} />
          <Route path="u/:userSlug" element={<UnprefixedBoardRedirect />} />
          <Route path="skills/*" element={<UnprefixedBoardRedirect />} />
          <Route path="settings" element={<LegacySettingsRedirect />} />
          <Route path="settings/*" element={<LegacySettingsRedirect />} />
          <Route path="agents" element={<UnprefixedBoardRedirect />} />
          <Route path="agents/new" element={<UnprefixedBoardRedirect />} />
          <Route path="agents/:agentId" element={<UnprefixedBoardRedirect />} />
          <Route path="agents/:agentId/:tab" element={<UnprefixedBoardRedirect />} />
          <Route path="agents/:agentId/runs/:runId" element={<UnprefixedBoardRedirect />} />
          <Route path="projects" element={<UnprefixedBoardRedirect />} />
          <Route path="projects/:projectId" element={<UnprefixedBoardRedirect />} />
          <Route path="projects/:projectId/overview" element={<UnprefixedBoardRedirect />} />
          <Route path="projects/:projectId/issues" element={<UnprefixedBoardRedirect />} />
          <Route path="projects/:projectId/issues/:filter" element={<UnprefixedBoardRedirect />} />
          <Route path="projects/:projectId/workspaces" element={<UnprefixedBoardRedirect />} />
          <Route path="projects/:projectId/workspaces/:workspaceId" element={<UnprefixedBoardRedirect />} />
          <Route path="projects/:projectId/configuration" element={<UnprefixedBoardRedirect />} />
          <Route path="workspaces" element={<UnprefixedBoardRedirect />} />
          <Route path="execution-workspaces/:workspaceId" element={<UnprefixedBoardRedirect />} />
          <Route path="execution-workspaces/:workspaceId/services" element={<UnprefixedBoardRedirect />} />
          <Route path="execution-workspaces/:workspaceId/configuration" element={<UnprefixedBoardRedirect />} />
          <Route path="execution-workspaces/:workspaceId/runtime-logs" element={<UnprefixedBoardRedirect />} />
          <Route path="execution-workspaces/:workspaceId/issues" element={<UnprefixedBoardRedirect />} />
          <Route path="execution-workspaces/:workspaceId/routines" element={<UnprefixedBoardRedirect />} />
          <Route path=":companyPrefix" element={<Layout />}>
            {boardRoutes()}
          </Route>
          <Route path="*" element={<NotFoundPage scope="global" />} />
        </Route>
      </Routes>
      <OnboardingWizardVariant />
    </>
  );
}
