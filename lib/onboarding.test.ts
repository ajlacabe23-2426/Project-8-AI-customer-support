import {describe,expect,it} from 'vitest';
import {setupStatus} from './onboarding';

describe('honest onboarding evidence',()=>{
  it('does not claim install, human handoff, or production readiness from configuration',()=>{
    const result=setupStatus({workspaceName:'Demo company',allowedOrigins:['https://example.test'],knowledgeCount:10});
    expect(result.preparatoryStepsComplete).toBe(true);
    expect(result.widgetVerified).toBe(false);
    expect(result.productionApproved).toBe(false);
    expect(result.steps.map(step=>step.complete)).toEqual([true,true,true,false]);
  });
  it('distinguishes empty knowledge and origins',()=>{
    const result=setupStatus({workspaceName:'Demo',allowedOrigins:[],knowledgeCount:0});
    expect(result.preparatoryStepsComplete).toBe(false);
    expect(result.steps.map(step=>step.complete)).toEqual([true,false,false,false]);
  });
});
