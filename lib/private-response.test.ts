import {describe,expect,it} from 'vitest';
import {privateJson} from './private-response';

describe('private owner-console responses',()=>{
  it('prevents caching successful responses containing tenant data',async()=>{
    const response=privateJson({leads:[{contact_email:'example@invalid.test'}]},{status:200});
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.json()).toEqual({leads:[{contact_email:'example@invalid.test'}]});
  });

  it('prevents caching unauthorized and failed responses',async()=>{
    for(const status of [400,401,403,404,503]){
      const response=privateJson({error:'Unavailable'},{status});
      expect(response.status).toBe(status);
      expect(response.headers.get('Cache-Control')).toBe('no-store');
    }
  });

  it('overrides accidental cacheable headers without dropping unrelated headers',()=>{
    const response=privateJson({ok:true},{headers:{'Cache-Control':'public, max-age=3600','X-Review-Test':'present'}});
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('X-Review-Test')).toBe('present');
  });
});
