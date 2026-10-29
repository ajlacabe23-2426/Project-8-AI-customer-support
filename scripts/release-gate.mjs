import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const PROJECT="Project 8 AI Customer Support";
const REQUIRED=['README.md','package.json','package-lock.json','app','tests','supabase/migrations'];
const dir=fileURLToPath(new URL('.',import.meta.url));
const ROOT=resolve(dir,'..');

export function inspectCheckout(root=ROOT){
  root=resolve(root);
  const missingFiles=REQUIRED.filter(path=>!existsSync(join(root,path)));
  const pkg=!missingFiles.includes('package.json')
    ?JSON.parse(readFileSync(join(root,'package.json'),'utf8')):null;
  const migrations=existsSync(join(root,'supabase/migrations'))
    ?readdirSync(join(root,'supabase/migrations')).filter(name=>name.endsWith('.sql')):[];
  const workflows=existsSync(join(root,'.github/workflows'))
    ?readdirSync(join(root,'.github/workflows')).filter(name=>/\.ya?ml$/.test(name)):[];
  const checks={
    expectedLayoutPresent:missingFiles.length===0,
    nextAndSupabaseDependenciesPresent:!!(pkg?.dependencies?.next&&pkg?.dependencies?.['@supabase/supabase-js']),
    migrationFilesPresent:migrations.length>0,
    ciWorkflowsPresent:workflows.length>0
  };
  return {
    schema:'portfolio-nextjs-demo-preflight-v1',project:PROJECT,
    status:Object.values(checks).every(Boolean)?'CHECKOUT_CONTRACT_PASS':'CHECKOUT_CONTRACT_FAIL',
    checks,missingFiles,migrationCount:migrations.length,
    workflowCount:workflows.length,
    productionAuthorized:false,hostedMigrationsApplied:false,
    billingOperationalVerified:false,customerDataApproved:false,
    revenueReadinessProven:false,
    nextGates:[
      'Run npm ci, dependency and secret audits, tests, typechecks and production build.',
      'Prove two-account data isolation and real browser acceptance on disposable infrastructure.',
      'Verify hosted migration drift, backup restore, abuse controls and operational monitoring.',
      'Complete legal, privacy, billing and support review before any paid-customer deployment.'
    ]
  };
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try {
    const report=inspectCheckout();
    console.log(JSON.stringify(report,null,2));
    if(report.status!=='CHECKOUT_CONTRACT_PASS')process.exitCode=1;
  }catch(error){
    console.error('Release preflight failed:',error.message);
    process.exitCode=1;
  }
}
