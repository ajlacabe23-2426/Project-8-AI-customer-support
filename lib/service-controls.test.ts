import {describe,it,expect} from 'vitest';
import {visitorWidgetAllowed,pilotWorkspaceAllowed} from './service-controls';

describe('visitor widget emergency pause',()=>{
  it('keeps existing unconfigured local-demo behavior',()=>{
    expect(visitorWidgetAllowed(undefined)).toBe(true);
    expect(visitorWidgetAllowed('')).toBe(true);
    expect(visitorWidgetAllowed('0')).toBe(true);
    expect(visitorWidgetAllowed('false')).toBe(true);
  });
  it('fails closed on explicit pauses and invalid values',()=>{
    expect(visitorWidgetAllowed('1')).toBe(false);
    expect(visitorWidgetAllowed('true')).toBe(false);
    expect(visitorWidgetAllowed('yes')).toBe(false);
    expect(visitorWidgetAllowed('unexpected')).toBe(false);
  });
});

describe('explicit pilot workspace approval',()=>{
  const ownerA='c36e90f4-9d75-4446-bbb1-f4c69a365f12';
  const ownerB='50320663-3b23-4f71-85fd-4942dfbb4cbc';
  it('preserves unconfigured local demo yet rejects empty or invalid production roster',()=>{
    expect(pilotWorkspaceAllowed(ownerA,undefined)).toBe(true);
    expect(pilotWorkspaceAllowed(ownerA,'')).toBe(false);
    expect(pilotWorkspaceAllowed(ownerA,'not-a-uuid')).toBe(false);
    expect(pilotWorkspaceAllowed(ownerA,ownerA+',bad')).toBe(false);
  });
  it('only permits exact explicitly listed workspaces',()=>{
    expect(pilotWorkspaceAllowed(ownerA,ownerA)).toBe(true);
    expect(pilotWorkspaceAllowed(ownerB,ownerA)).toBe(false);
    expect(pilotWorkspaceAllowed(ownerB,ownerA+', '+ownerB)).toBe(true);
  });
});
