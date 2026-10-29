import {describe,it,expect} from 'vitest';
import {visitorWidgetAllowed} from './service-controls';

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
