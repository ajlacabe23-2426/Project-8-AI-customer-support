/** Emergency operator pause for visitor-facing endpoints.
 * Any non-empty, non-false value fails closed rather than silently exposing chat.
 * Pausing does not block signed-in owners from reading retained conversations.
 */
export function visitorWidgetAllowed(value: string | undefined): boolean {
  if(value===undefined || value.trim()==='')return true;
  return ['0','false','off','no'].includes(value.trim().toLowerCase());
}
