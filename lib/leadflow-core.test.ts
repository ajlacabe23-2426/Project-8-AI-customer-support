import {describe, expect, it} from 'vitest';
import {
  ALLOWED_TRANSITIONS,
  initialLifecycleState,
  initialTransitionReason,
  qualifyLead,
  validateLifecycleTransition,
  type QualifiedIntake,
} from './leadflow-core';

const baseline: QualifiedIntake = {
  phone: '555-0100',
  source: 'website',
  service: 'Automation consulting',
  estimatedValue: 12000,
  timelineDays: 7,
  budgetConfirmed: true,
  decisionMaker: true,
  notes: 'Needs intake and scheduling automation.',
  communicationConsent: true,
  optedOut: false,
};
const intake = (changes: Partial<QualifiedIntake> = {}): QualifiedIntake => ({...baseline, ...changes});

describe('Project 6 parity: qualification policy', () => {
  it('replicates high-value complete-lead 100-point escalation', () => {
    expect(qualifyLead(intake())).toMatchObject({
      score: 100,
      routing: 'qualified',
      priority: 'high',
      nextAction: 'human-priority-review',
      breakdown: {
        opportunity_value: 30, timeline: 25, budget_confirmed: 15,
        decision_maker: 15, completeness: 15,
      },
      missingInformation: [],
    });
  });
  it('routes missing critical fields to needs-info regardless of the remaining score', () => {
    const result = qualifyLead(intake({estimatedValue: null, timelineDays: null}));
    expect(result.routing).toBe('needs-info');
    expect(result.nextAction).toBe('request-missing-info');
    expect(result.missingInformation).toEqual(['estimated_value', 'timeline_days']);
    expect(initialLifecycleState(intake({estimatedValue: null, timelineDays: null}), result)).toBe('awaiting-information');
  });
  it('preserves low-value nurture behavior', () => {
    const result = qualifyLead(intake({
      estimatedValue: 500, timelineDays: 180, budgetConfirmed: false,
      decisionMaker: false, phone: null, notes: null,
    }));
    expect(result.score).toBe(21);
    expect(result.routing).toBe('nurture');
    expect(result.priority).toBe('low');
    expect(result.nextAction).toBe('nurture-follow-up');
    expect(result.score).toBe(Object.values(result.breakdown).reduce((a, b) => a + b, 0));
  });
  it('implements exact value and timeline brackets', () => {
    expect(qualifyLead(intake({estimatedValue: 5000, timelineDays: 30})).breakdown).toMatchObject({
      opportunity_value: 22, timeline: 18,
    });
    expect(qualifyLead(intake({estimatedValue: 2000, timelineDays: 90})).breakdown).toMatchObject({
      opportunity_value: 15, timeline: 10,
    });
  });
  it('is deterministic and bounds invalid input', () => {
    expect(qualifyLead(intake())).toEqual(qualifyLead(intake()));
    expect(() => qualifyLead(intake({estimatedValue: Number.NaN}))).toThrow();
    expect(() => qualifyLead(intake({timelineDays: 0}))).toThrow();
    expect(() => qualifyLead(intake({timelineDays: 1.5}))).toThrow();
    expect(() => qualifyLead(intake({communicationConsent: true, optedOut: true}))).toThrow();
  });
  it('suppresses opted-out intake regardless of qualification', () => {
    const lead = intake({communicationConsent: false, optedOut: true});
    const result = qualifyLead(lead);
    expect(initialLifecycleState(lead, result)).toBe('suppressed');
    expect(initialTransitionReason(lead, result)).toBe('policy.opted-out');
  });
});

describe('Project 6 parity: lifecycle policy', () => {
  it('permits documented edges, no-ops repeated requests, rejects other edges', () => {
    expect(validateLifecycleTransition('received', 'qualified')).toBe(true);
    expect(validateLifecycleTransition('qualified', 'awaiting-owner-action')).toBe(true);
    expect(validateLifecycleTransition('qualified', 'qualified')).toBe(false);
    expect(() => validateLifecycleTransition('closed', 'qualified')).toThrow();
    expect(() => validateLifecycleTransition('suppressed', 'scheduled')).toThrow();
    expect(() => validateLifecycleTransition('received', 'scheduled')).toThrow();
  });
  it('preserves terminal states and all enumerated transition targets', () => {
    expect(ALLOWED_TRANSITIONS.closed).toEqual([]);
    expect(ALLOWED_TRANSITIONS.suppressed).toEqual([]);
    for (const [state, targets] of Object.entries(ALLOWED_TRANSITIONS)) {
      for (const target of targets) {
        expect(validateLifecycleTransition(state as keyof typeof ALLOWED_TRANSITIONS, target)).toBe(true);
      }
    }
  });
});
