import {describe, expect, it} from 'vitest';
import {classifyLead} from './leads';
import {prepareLeadForQualification} from './leadflow-bridge';

describe('Project 8 to Project 6 pure lead bridge', () => {
  it('does not create a qualification candidate for an ordinary support question', () => {
    const signal = classifyLead('What time does your office open?');
    expect(prepareLeadForQualification(signal)).toEqual({kind: 'not_a_lead'});
  });
  it('never equates strong visitor intent and voluntary contact with business qualification or messaging consent', () => {
    const signal = classifyLead('I need a quote. Please email alex@example.com.');
    expect(signal.shouldCapture).toBe(true);
    expect(signal.status).toBe('qualified');
    expect(prepareLeadForQualification(signal)).toEqual({
      kind: 'needs_service_review', intent: 'pricing', contactSupplied: true,
    });
  });
  it('routes reviewed service without opportunity data to needs-info, not automatically qualified', () => {
    const signal = classifyLead('I need a quote. Please email alex@example.com.');
    const bridged = prepareLeadForQualification(signal, {service: 'Roof repair'});
    expect(bridged.kind).toBe('qualification_evaluated');
    if (bridged.kind !== 'qualification_evaluated') throw Error('Unexpected kind');
    expect(bridged.qualification.routing).toBe('needs-info');
    expect(bridged.qualification.missingInformation).toEqual(['estimated_value', 'timeline_days']);
    expect(bridged.lifecycleState).toBe('awaiting-information');
    expect(bridged.communicationAllowed).toBe(false);
    expect(bridged.intake.communicationConsent).toBe(false);
    expect(bridged.intake.notes).toBeNull();
    expect(bridged.visitorIntentScore).toBe(signal.score);
    expect(bridged.qualification.score).not.toBe(signal.score);
  });
  it('can qualify independently documented inputs but still forbids outbound contact without consent', () => {
    const signal = classifyLead('I would like a booking. Call 312-555-0101.');
    const bridged = prepareLeadForQualification(signal, {
      service: 'Repair consultation', estimatedValue: 12000, timelineDays: 7,
      budgetConfirmed: true, decisionMaker: true,
    });
    expect(bridged.kind).toBe('qualification_evaluated');
    if (bridged.kind !== 'qualification_evaluated') throw Error('Unexpected kind');
    expect(bridged.qualification.routing).toBe('qualified');
    expect(bridged.qualification.priority).toBe('high');
    expect(bridged.communicationAllowed).toBe(false);
    expect(bridged.intake.source).toBe('website');
  });
  it('requires distinct explicit consent and makes opt-out terminal', () => {
    const signal = classifyLead('I want a pricing estimate.');
    const agreed = prepareLeadForQualification(signal, {service:'Inspection',communicationConsent:true});
    expect(agreed.kind).toBe('qualification_evaluated');
    if (agreed.kind !== 'qualification_evaluated') throw Error('Unexpected kind');
    expect(agreed.communicationAllowed).toBe(true);
    const rejected = prepareLeadForQualification(signal, {service:'Inspection',optedOut:true});
    expect(rejected.kind).toBe('qualification_evaluated');
    if (rejected.kind !== 'qualification_evaluated') throw Error('Unexpected kind');
    expect(rejected.communicationAllowed).toBe(false);
    expect(rejected.lifecycleState).toBe('suppressed');
    expect(() => prepareLeadForQualification(signal, {
      service:'Inspection',communicationConsent:true,optedOut:true,
    })).toThrow();
  });
});
