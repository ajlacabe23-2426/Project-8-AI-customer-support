/**
 * Project 6 qualification/lifecycle behavior, ported without database or provider side effects.
 *
 * Contract: project6-leadflow-v1/app/scoring.py and app/lifecycle.py at integration baseline.
 * Not the same as Project 8's anonymous-message intent score (lib/leads.ts).
 * Only apply to an explicitly collected and validated qualification record.
 */
export type QualificationRoute = 'qualified' | 'nurture' | 'needs-info';
export type QualificationPriority = 'high' | 'medium' | 'low';
export type LeadLifecycleState =
  | 'received' | 'awaiting-information' | 'ready-for-review' | 'qualified'
  | 'nurture' | 'awaiting-owner-action' | 'ready-to-schedule'
  | 'scheduled' | 'closed' | 'suppressed';

export type QualifiedIntake = Readonly<{
  phone?: string | null;
  source: string;
  service: string;
  estimatedValue: number | null;
  timelineDays: number | null;
  budgetConfirmed: boolean;
  decisionMaker: boolean;
  notes?: string | null;
  communicationConsent: boolean;
  optedOut: boolean;
}>;

export type QualificationResult = Readonly<{
  score: number;
  routing: QualificationRoute;
  priority: QualificationPriority;
  nextAction: 'human-priority-review' | 'schedule-discovery' | 'request-missing-info' | 'nurture-follow-up';
  breakdown: Readonly<Record<'opportunity_value' | 'timeline' | 'budget_confirmed' | 'decision_maker' | 'completeness', number>>;
  missingInformation: readonly ('estimated_value' | 'timeline_days')[];
}>;

function requireValidIntake(lead: QualifiedIntake): void {
  if (lead.estimatedValue !== null && (!Number.isFinite(lead.estimatedValue) || lead.estimatedValue < 0)) {
    throw new Error('Invalid estimated value');
  }
  if (lead.timelineDays !== null && (!Number.isInteger(lead.timelineDays) || lead.timelineDays < 1 || lead.timelineDays > 3650)) {
    throw new Error('Invalid timeline days');
  }
  if (lead.communicationConsent && lead.optedOut) {
    throw new Error('Consent and opt-out cannot both be true');
  }
  if (typeof lead.source !== 'string' || !lead.source.trim() || typeof lead.service !== 'string' || !lead.service.trim()) {
    throw new Error('Source and service are required');
  }
}

export function qualifyLead(lead: QualifiedIntake): QualificationResult {
  requireValidIntake(lead);
  const value = lead.estimatedValue;
  const days = lead.timelineDays;
  const opportunityValue = value === null ? 0 : value >= 10000 ? 30 : value >= 5000 ? 22 : value >= 2000 ? 15 : 8;
  const timeline = days === null ? 0 : days <= 7 ? 25 : days <= 30 ? 18 : days <= 90 ? 10 : 4;
  const completeness = [
    !!lead.phone,
    !!lead.source,
    !!lead.service,
    value !== null,
    !!lead.notes,
  ].filter(Boolean).length * 3;
  const breakdown = {
    opportunity_value: opportunityValue,
    timeline,
    budget_confirmed: lead.budgetConfirmed ? 15 : 0,
    decision_maker: lead.decisionMaker ? 15 : 0,
    completeness,
  };
  const score = Object.values(breakdown).reduce((total, points) => total + points, 0);
  const missingInformation: ('estimated_value' | 'timeline_days')[] = [];
  if (value === null) missingInformation.push('estimated_value');
  if (days === null) missingInformation.push('timeline_days');
  const routing: QualificationRoute = missingInformation.length > 0 ? 'needs-info' : score >= 70 ? 'qualified' : 'nurture';
  const priority: QualificationPriority = score >= 85 ? 'high' : score >= 60 ? 'medium' : 'low';
  const nextAction = priority === 'high' && routing === 'qualified'
    ? 'human-priority-review'
    : routing === 'qualified' ? 'schedule-discovery'
    : routing === 'needs-info' ? 'request-missing-info'
    : 'nurture-follow-up';
  return { score, routing, priority, nextAction, breakdown, missingInformation };
}

export const ALLOWED_TRANSITIONS: Readonly<Record<LeadLifecycleState, readonly LeadLifecycleState[]>> = {
  'received': ['awaiting-information', 'qualified', 'nurture', 'suppressed'],
  'awaiting-information': ['ready-for-review', 'closed', 'suppressed'],
  'ready-for-review': ['qualified', 'nurture', 'closed', 'suppressed'],
  'qualified': ['awaiting-owner-action', 'ready-to-schedule', 'closed', 'suppressed'],
  'nurture': ['ready-for-review', 'closed', 'suppressed'],
  'awaiting-owner-action': ['ready-to-schedule', 'closed', 'suppressed'],
  'ready-to-schedule': ['scheduled', 'closed', 'suppressed'],
  'scheduled': ['closed'],
  'closed': [],
  'suppressed': [],
};

export function initialLifecycleState(lead: QualifiedIntake, result: QualificationResult): LeadLifecycleState {
  if (lead.optedOut) return 'suppressed';
  if (result.routing === 'needs-info') return 'awaiting-information';
  return result.routing;
}

export function initialTransitionReason(lead: QualifiedIntake, result: QualificationResult): string {
  return lead.optedOut ? 'policy.opted-out' : 'qualification.' + result.routing;
}

/** Returns false on idempotent no-op; throws on prohibited or unknown transition. */
export function validateLifecycleTransition(from: LeadLifecycleState, to: LeadLifecycleState): boolean {
  if (!Object.prototype.hasOwnProperty.call(ALLOWED_TRANSITIONS, from) ||
      !Object.prototype.hasOwnProperty.call(ALLOWED_TRANSITIONS, to)) {
    throw new Error('Unknown lifecycle state');
  }
  if (from === to) return false;
  if (!ALLOWED_TRANSITIONS[from].includes(to)) {
    throw new Error('Lifecycle transition is not allowed');
  }
  return true;
}
