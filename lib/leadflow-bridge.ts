import type {LeadSignal} from './leads';
import {
  initialLifecycleState,
  qualifyLead,
  type QualifiedIntake,
  type QualificationResult,
  type LeadLifecycleState,
} from './leadflow-core';

/**
 * Pure, non-persistent adapter between Project 8's message-intent classifier and
 * Project 6's structured business qualification policy.
 *
 * There is no tenant authorization here: callers MUST derive and authorize
 * workspace/conversation IDs on the server before persisting any result.
 * This module performs no database writes and no customer communication.
 */
export type ReviewedLeadDetails = Readonly<{
  /** Human-confirmed requested service, not inferred from buying-intent words. */
  service: string | null;
  estimatedValue?: number | null;
  timelineDays?: number | null;
  budgetConfirmed?: boolean;
  decisionMaker?: boolean;
  /** Separate affirmative communication permission, never inferred from contact details. */
  communicationConsent?: boolean;
  optedOut?: boolean;
}>;

export type BridgedLead =
  | Readonly<{kind: 'not_a_lead'}>
  | Readonly<{kind: 'needs_service_review'; intent: LeadSignal['intent']; contactSupplied: boolean}>
  | Readonly<{
      kind: 'qualification_evaluated';
      intake: QualifiedIntake;
      qualification: QualificationResult;
      lifecycleState: LeadLifecycleState;
      communicationAllowed: boolean;
      /** The original visitor intent classification is kept separate. */
      visitorIntent: LeadSignal['intent'];
      visitorIntentScore: number;
    }>;

export function prepareLeadForQualification(signal: LeadSignal, details?: ReviewedLeadDetails): BridgedLead {
  if (!signal.shouldCapture || !signal.intent) return {kind: 'not_a_lead'};
  const service = details?.service?.trim() || '';
  if (!service) {
    return {
      kind: 'needs_service_review',
      intent: signal.intent,
      contactSupplied: Boolean(signal.contactEmail || signal.contactPhone),
    };
  }

  // Missing value and timeline are NOT guessed from the visitor's message score.
  // The Project 6 engine will route them to needs-info until independently supplied.
  const intake: QualifiedIntake = {
    phone: signal.contactPhone,
    source: 'website',
    service,
    estimatedValue: details?.estimatedValue ?? null,
    timelineDays: details?.timelineDays ?? null,
    budgetConfirmed: details?.budgetConfirmed === true,
    decisionMaker: details?.decisionMaker === true,
    notes: null, // Never copy raw anonymous chat into structured qualification notes.
    communicationConsent: details?.communicationConsent === true,
    optedOut: details?.optedOut === true,
  };
  const qualification = qualifyLead(intake);
  return {
    kind: 'qualification_evaluated',
    intake,
    qualification,
    lifecycleState: initialLifecycleState(intake, qualification),
    communicationAllowed: intake.communicationConsent && !intake.optedOut,
    visitorIntent: signal.intent,
    visitorIntentScore: signal.score,
  };
}
