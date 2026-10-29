/** Emergency operator pause for visitor-facing endpoints.
 * Any non-empty, non-false value fails closed rather than silently exposing chat.
 * Pausing does not block signed-in owners from reading retained conversations.
 */
export function visitorWidgetAllowed(value: string | undefined): boolean {
  if(value===undefined || value.trim()==='')return true;
  return ['0','false','off','no'].includes(value.trim().toLowerCase());
}

/** Optional operator-approved pilot roster. Undefined preserves existing local
 * demos; a defined empty, malformed or missing workspace list fails closed.
 * This is a launch gate, not a paid subscription or user-authentication check.
 */
export function pilotWorkspaceAllowed(workspaceId: string, csv: string | undefined): boolean {
  if(csv===undefined)return true;
  const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const entries=csv.split(',').map(x=>x.trim().toLowerCase());
  if(!entries.length || entries.some(x=>!uuid.test(x)))return false;
  return entries.includes(workspaceId.toLowerCase());
}
