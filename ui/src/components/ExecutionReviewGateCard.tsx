/**
 * ExecutionReviewGateCard — inline "Approve / Request changes" banner that
 * appears at the top of an issue when the execution-policy stage is waiting
 * on the current user's decision. Without this, the only way to advance a
 * review/approval gate was to know to PATCH the issue manually with the
 * correct status + comment — which most users wouldn't discover.
 *
 * Visibility rules (all must hold):
 *   - issue.status === "in_review"
 *   - issue.executionState exists
 *   - currentStageType is "review" or "approval"
 *   - executionState.status === "pending" (or "changes_requested" → already shown, no action)
 *   - currentParticipant?.type === "user" and userId matches the signed-in user
 */
import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  IssueExecutionStagePrincipal,
  IssueExecutionStageType,
  IssueExecutionStateStatus,
} from "@paperclipai/shared";
import { DraftTextarea } from "@/components/agent-config-primitives";

type Props = {
  issueId: string;
  status: IssueExecutionStateStatus | null;
  currentStageType: IssueExecutionStageType | null;
  currentStageId: string | null;
  currentParticipant: IssueExecutionStagePrincipal | null;
  currentUserId: string | null;
  isUpdating: boolean;
  onApprove: (comment: string) => void;
  onRequestChanges: (comment: string) => void;
  /** User-facing name for the gate ("Review" / "Approval"). */
  stageLabel: string;
  /** Optional preview text from the agent (last comment body, plan snippet). */
  agentSubmissionPreview?: string | null;
};

const DEFAULT_APPROVE_COMMENT = "LGTM — approved.";
const DEFAULT_REQUEST_CHANGES_COMMENT = "Changes requested.";

function matchParticipant(
  participant: IssueExecutionStagePrincipal | null,
  currentUserId: string | null,
): boolean {
  if (!participant || !currentUserId) return false;
  if (participant.type !== "user") return false;
  return participant.userId === currentUserId;
}

export function ExecutionReviewGateCard({
  issueId,
  status,
  currentStageType,
  currentStageId,
  currentParticipant,
  currentUserId,
  isUpdating,
  onApprove,
  onRequestChanges,
  stageLabel,
  agentSubmissionPreview,
}: Props) {
  const [approveMode, setApproveMode] = useState(false);
  const [changesMode, setChangesMode] = useState(false);
  const [approveComment, setApproveComment] = useState(DEFAULT_APPROVE_COMMENT);
  const [changesComment, setChangesComment] = useState(DEFAULT_REQUEST_CHANGES_COMMENT);

  // Three visibility modes:
  //   1. Policy-driven review/approval stage with the user as the active
  //      participant (the original behavior).
  //   2. NO execution policy configured but the issue is sitting in
  //      in_review waiting on the user — the manual review path that
  //      mirrors Paperclip's "Approve / Request changes" controls.
  //   3. A `changes_requested` state from a prior round of feedback,
  //      where the user can re-review once the agent resubmits.
  const hasPolicyStage =
    status === "pending" &&
    (currentStageType === "review" || currentStageType === "approval") &&
    matchParticipant(currentParticipant, currentUserId);
  // Manual review gate is ONLY the fallback when there is no execution
  // policy configured. When a policy IS configured but the user isn't
  // the current participant (e.g. they're an approver on a later stage
  // while the agent owns the current review stage), we must not show
  // the button — the server would reject the advance. Instead, the
  // user is shown a "waiting for the active participant" hint by the
  // parent page.
  const isManualReviewGate =
    currentStageType === null && currentUserId !== null;
  const visible = hasPolicyStage || isManualReviewGate;

  if (!visible) return null;

  const handleApprove = () => {
    onApprove(approveComment.trim() || DEFAULT_APPROVE_COMMENT);
    setApproveMode(false);
    setChangesMode(false);
  };

  const handleRequestChanges = () => {
    onRequestChanges(changesComment.trim() || DEFAULT_REQUEST_CHANGES_COMMENT);
    setApproveMode(false);
    setChangesMode(false);
  };

  return (
    <div
      role="region"
      aria-label={`${stageLabel} pending your decision`}
      className="overflow-hidden rounded-xl border-2 border-amber-400/50 bg-amber-500/[0.04] backdrop-blur"
      data-issue-id={issueId}
      data-stage-id={currentStageId ?? undefined}
      data-stage-type={currentStageType ?? undefined}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-semibold text-amber-300">{stageLabel} pending — your decision required</span>
            {currentStageId && (
              <span className="font-mono text-[11px] uppercase tracking-widest text-amber-200/60">
                stage {currentStageId}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-amber-100/80">
            {currentStageType
              ? `The agent has handed this task back to you as the ${stageLabel.toLowerCase()} gate. Approve to close it out, or request changes to send it back.`
              : `The agent marked this task ready for review. Approve to mark it done, or request changes to send it back to the agent with feedback.`}
          </p>
          {agentSubmissionPreview && (
            <div className="mt-2 max-h-24 overflow-y-auto rounded-md border border-amber-400/20 bg-black/30 px-3 py-2 text-[12px] text-amber-100/80">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-amber-200/60">
                Latest submission
              </div>
              {agentSubmissionPreview}
            </div>
          )}
        </div>
      </div>

      {/* Action row */}
      <div className="flex flex-wrap items-center gap-2 border-t border-amber-400/20 bg-amber-500/[0.06] px-4 py-3">
        {!approveMode && !changesMode && (
          <>
            <button
              type="button"
              onClick={() => {
                setApproveMode(true);
                setChangesMode(false);
              }}
              disabled={isUpdating}
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-emerald-500 px-4 font-semibold text-slate-950 transition hover:bg-emerald-400 hover:shadow-[0_0_18px_-4px_rgba(16,185,129,0.6)] disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve
            </button>
            <button
              type="button"
              onClick={() => {
                setChangesMode(true);
                setApproveMode(false);
              }}
              disabled={isUpdating}
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-rose-400/40 bg-rose-500/10 px-4 font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-60"
            >
              <XCircle className="h-4 w-4" />
              Request changes
            </button>
            {isUpdating && (
              <span className="ml-2 inline-flex items-center gap-1.5 text-xs text-amber-200/70">
                <Loader2 className="h-3 w-3 animate-spin" />
                Working…
              </span>
            )}
          </>
        )}

        {approveMode && (
          <div className="flex w-full flex-col gap-2">
            <label className="font-mono text-[11px] uppercase tracking-widest text-amber-200/70">
              Approval comment (optional)
            </label>
            <DraftTextarea
              value={approveComment}
              onCommit={(next) => setApproveComment(next)}
              placeholder={DEFAULT_APPROVE_COMMENT}
              minRows={2}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApprove}
                disabled={isUpdating}
                className={cn(
                  "inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-emerald-500 px-5 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60",
                )}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Confirm approval
              </button>
              <button
                type="button"
                onClick={() => setApproveMode(false)}
                disabled={isUpdating}
                className="cursor-pointer text-xs text-amber-200/70 hover:text-amber-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {changesMode && (
          <div className="flex w-full flex-col gap-2">
            <label className="font-mono text-[11px] uppercase tracking-widest text-amber-200/70">
              What needs to change?
            </label>
            <DraftTextarea
              value={changesComment}
              onCommit={(next) => setChangesComment(next)}
              placeholder={DEFAULT_REQUEST_CHANGES_COMMENT}
              minRows={3}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRequestChanges}
                disabled={isUpdating}
                className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-rose-400/40 bg-rose-500/15 px-5 font-semibold text-rose-100 transition hover:bg-rose-500/25 disabled:opacity-60"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Send back with feedback
              </button>
              <button
                type="button"
                onClick={() => setChangesMode(false)}
                disabled={isUpdating}
                className="cursor-pointer text-xs text-amber-200/70 hover:text-amber-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExecutionReviewGateCard;
