import type {JunkRemovalIntakeOutcome} from './junk-removal-intake';

/**
 * A review queue *proposal*, not a persisted task, calendar booking or outbound action.
 * Project 6 Action Center semantics port into Project 8 only after tenant-scoped tests.
 */
export type JunkRemovalOwnerTaskDraft = Readonly<{
  queue: 'human-intake-review';
  action: 'request_missing_details' | 'review_special_handling' | 'prepare_manual_estimate';
  checklist: readonly string[];
  sendAutomatically: false;
  priceAutomatically: false;
  bookAutomatically: false;
  ownerMustConfirm: true;
}>;

export function proposeJunkRemovalOwnerTask(result: JunkRemovalIntakeOutcome): JunkRemovalOwnerTaskDraft {
  if (result.kind === 'requires_special_handling_review') {
    return {
      queue: 'human-intake-review',
      action: 'review_special_handling',
      checklist: [
        ...result.missing.map(key => 'Confirm missing: ' + key),
        ...result.reviewReasons.map(code => 'Review condition: ' + code),
        'Confirm permitted disposal and crew safety before quoting',
      ],
      sendAutomatically: false,
      priceAutomatically: false,
      bookAutomatically: false,
      ownerMustConfirm: true,
    };
  }
  if (result.kind === 'needs_details') {
    return {
      queue: 'human-intake-review',
      action: 'request_missing_details',
      checklist: [
        ...result.missing.map(key => 'Confirm missing: ' + key),
        'Have an operator review how to request missing details',
      ],
      sendAutomatically: false,
      priceAutomatically: false,
      bookAutomatically: false,
      ownerMustConfirm: true,
    };
  }
  return {
    queue: 'human-intake-review',
    action: 'prepare_manual_estimate',
    checklist: [
      'Validate local service coverage and disposal permissions',
      'Confirm actual items, loading effort and equipment needs',
      'Prepare a written estimate for owner approval',
    ],
    sendAutomatically: false,
    priceAutomatically: false,
    bookAutomatically: false,
    ownerMustConfirm: true,
  };
}
