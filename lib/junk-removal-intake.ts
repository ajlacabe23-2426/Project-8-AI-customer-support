/**
 * Synthetic/non-persistent triage for a junk-removal pilot.
 * No customer identity, appointment, price, service availability, or licensing claim.
 * Callers must validate tenant ownership before writing any real intake.
 */
export type JunkRemovalIntakeOutcome = Readonly<{
  kind: 'needs_details' | 'requires_special_handling_review' | 'ready_for_human_estimate';
  missing: readonly string[];
  reviewReasons: readonly string[];
  followUpPermitted: boolean;
  automaticQuotePermitted: false;
}>;

const JOB_TYPES = new Set(['single_item', 'multiple_items', 'partial_cleanout', 'full_cleanout']);
const LOAD_SIZES = new Set(['small', 'medium', 'large']);
const ACCESS = new Set(['curbside', 'ground_floor', 'stairs']);
const CATEGORIES = new Set(['furniture', 'appliances', 'electronics', 'yard_debris', 'construction', 'general_household']);
const REVIEW_CATEGORIES = new Set(['appliances', 'electronics', 'construction']);

export function assessJunkRemovalIntake(value: unknown): JunkRemovalIntakeOutcome {
  const input: Record<string, unknown> = value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
  const missing: string[] = [];
  const reviewReasons: string[] = [];
  const zip = input.zipCode;
  if (typeof zip !== 'string' || !/^\d{5}$/.test(zip)) missing.push('zip_code');
  if (typeof input.jobType !== 'string' || !JOB_TYPES.has(input.jobType)) missing.push('job_type');
  if (typeof input.loadSize !== 'string' || !LOAD_SIZES.has(input.loadSize)) missing.push('load_size');
  if (typeof input.access !== 'string' || !ACCESS.has(input.access)) missing.push('access');

  const categories = input.categories;
  if (!Array.isArray(categories) || categories.length === 0 || categories.length > 12 ||
      categories.some(category => typeof category !== 'string' || !CATEGORIES.has(category))) {
    missing.push('item_categories');
  } else if (categories.some(category => REVIEW_CATEGORIES.has(category))) {
    reviewReasons.push('SPECIAL_DISPOSAL_REQUIREMENTS_UNVERIFIED');
  }
  if (input.possibleRestrictedMaterials === true) {
    reviewReasons.push('RESTRICTED_MATERIALS_REQUIRE_OPERATOR_REVIEW');
  } else if (input.possibleRestrictedMaterials !== false) {
    missing.push('restricted_materials_confirmation');
  }
  if (input.access === 'stairs') reviewReasons.push('STAIR_ACCESS_REQUIRES_MANUAL_PLANNING');

  return {
    kind: reviewReasons.length > 0 ? 'requires_special_handling_review'
      : missing.length > 0 ? 'needs_details' : 'ready_for_human_estimate',
    missing,
    reviewReasons,
    followUpPermitted: input.communicationConsent === true && input.optedOut !== true,
    automaticQuotePermitted: false,
  };
}
