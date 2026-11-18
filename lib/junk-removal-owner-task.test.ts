import {describe, expect, it} from 'vitest';
import {assessJunkRemovalIntake} from './junk-removal-intake';
import {proposeJunkRemovalOwnerTask} from './junk-removal-owner-task';

const complete = {
  zipCode: '61701', jobType: 'single_item', loadSize: 'small',
  access: 'curbside', categories: ['furniture'], possibleRestrictedMaterials: false,
  communicationConsent: false, optedOut: false,
};

describe('junk-removal vertical -> Project 6-style owner action drafting', () => {
  it('proposes only manual estimate preparation for complete standard request', () => {
    const draft = proposeJunkRemovalOwnerTask(assessJunkRemovalIntake(complete));
    expect(draft.action).toBe('prepare_manual_estimate');
    expect(draft.ownerMustConfirm).toBe(true);
    expect(draft.priceAutomatically).toBe(false);
    expect(draft.bookAutomatically).toBe(false);
  });
  it('preserves missing field reasons for operator review', () => {
    const draft = proposeJunkRemovalOwnerTask(assessJunkRemovalIntake({...complete, zipCode: ''}));
    expect(draft.action).toBe('request_missing_details');
    expect(draft.checklist.join(' ')).toContain('zip_code');
    expect(draft.sendAutomatically).toBe(false);
  });
  it('never bypasses special-material review or communicates without an operator', () => {
    const result = assessJunkRemovalIntake({...complete, categories: ['electronics'], communicationConsent: true});
    const draft = proposeJunkRemovalOwnerTask(result);
    expect(draft.action).toBe('review_special_handling');
    expect(draft.checklist.join(' ')).toContain('SPECIAL_DISPOSAL_REQUIREMENTS_UNVERIFIED');
    expect(draft.sendAutomatically).toBe(false);
  });
});
