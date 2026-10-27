import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {inspectCheckout} from '../scripts/release-gate.mjs';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
test('repository checkout has release preflight contract but not paid-launch approval',()=>{
  const report=inspectCheckout(root);
  assert.equal(report.status,'CHECKOUT_CONTRACT_PASS',JSON.stringify(report));
  assert.equal(report.productionAuthorized,false);
  assert.equal(report.hostedMigrationsApplied,false);
  assert.equal(report.billingOperationalVerified,false);
  assert.equal(report.customerDataApproved,false);
  assert.equal(report.revenueReadinessProven,false);
});
test('incomplete checkout fails closed rather than implying production readiness',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'release-preflight-'));
  try{
    await mkdir(join(dir,'app'));
    await writeFile(join(dir,'README.md'),'incomplete');
    const report=inspectCheckout(dir);
    assert.equal(report.status,'CHECKOUT_CONTRACT_FAIL');
    assert.ok(report.missingFiles.includes('package.json'));
    assert.equal(report.productionAuthorized,false);
  }finally{await rm(dir,{recursive:true,force:true});}
});
