import {describe, expect, it} from 'vitest';
import {assessJunkRemovalIntake} from './junk-removal-intake';

const sample = {
  zipCode: '61701', jobType: 'multiple_items', loadSize: 'medium',
  access: 'ground_floor', categories: ['furniture'], possibleRestrictedMaterials: false,
  communicationConsent: false, optedOut: false,
};

describe('junk-removal pilot intake: isolated, human-reviewed classification', () => {
  it('routes complete standard requests for an estimate reviewed by a person, never an automatic price', () => {
    expect(assessJunkRemovalIntake(sample)).toEqual({
      kind: 'ready_for_human_estimate', missing: [], reviewReasons: [],
      followUpPermitted: false, automaticQuotePermitted: false,
    });
  });
  it('withholds readiness for missing and invalid fields', () => {
    const result = assessJunkRemovalIntake({...sample, zipCode: 'oops', access: 'unknown', categories: []});
    expect(result.kind).toBe('needs_details');
    expect(result.missing).toEqual(['zip_code', 'access', 'item_categories']);
    expect(assessJunkRemovalIntake(null).kind).toBe('needs_details');
  });
  it('always requires special handling review for flagged materials', () => {
    const result = assessJunkRemovalIntake({...sample, possibleRestrictedMaterials: true});
    expect(result.kind).toBe('requires_special_handling_review');
    expect(result.reviewReasons).toContain('RESTRICTED_MATERIALS_REQUIRE_OPERATOR_REVIEW');
    expect(result.automaticQuotePermitted).toBe(false);
  });
  it('never automatically accepts appliance, electronics or construction disposal or stairs', () => {
    for (const categories of [['appliances'], ['electronics'], ['construction']]) {
      expect(assessJunkRemovalIntake({...sample, categories}).kind).toBe('requires_special_handling_review');
    }
    expect(assessJunkRemovalIntake({...sample, access: 'stairs'}).kind).toBe('requires_special_handling_review');
  });
  it('does not infer permission to contact from an inquiry or opt-out', () => {
    expect(assessJunkRemovalIntake({...sample, communicationConsent: true}).followUpPermitted).toBe(true);
    expect(assessJunkRemovalIntake({...sample, communicationConsent: 'yes'}).followUpPermitted).toBe(false);
    expect(assessJunkRemovalIntake({...sample, communicationConsent: true, optedOut: true}).followUpPermitted).toBe(false);
  });
  it('returns no raw customer-provided text or personally identifying fields', () => {
    const result = assessJunkRemovalIntake({...sample, notes: 'private customer text', email: 'not-shared@example.test'});
    expect(JSON.stringify(result)).not.toContain('private customer text');
    expect(JSON.stringify(result)).not.toContain('not-shared@example.test');
  });
});
