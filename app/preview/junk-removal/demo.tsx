'use client';

import {useState} from 'react';
import {assessJunkRemovalIntake} from '../../../lib/junk-removal-intake';
import {proposeJunkRemovalOwnerTask} from '../../../lib/junk-removal-owner-task';

const scenarios = {
  standard: {
    label: 'Standard furniture removal',
    input: {
      zipCode: '61701', jobType: 'multiple_items', loadSize: 'medium', access: 'ground_floor',
      categories: ['furniture'], possibleRestrictedMaterials: false, communicationConsent: false, optedOut: false,
    },
  },
  missing: {
    label: 'Incomplete inquiry',
    input: {
      zipCode: '', jobType: 'multiple_items', loadSize: 'medium', access: 'ground_floor',
      categories: ['furniture'], possibleRestrictedMaterials: false, communicationConsent: false, optedOut: false,
    },
  },
  special: {
    label: 'Special disposal + stairs',
    input: {
      zipCode: '61701', jobType: 'partial_cleanout', loadSize: 'large', access: 'stairs',
      categories: ['electronics', 'construction'], possibleRestrictedMaterials: true,
      communicationConsent: true, optedOut: false,
    },
  },
  optedOut: {
    label: 'Customer opts out',
    input: {
      zipCode: '61701', jobType: 'single_item', loadSize: 'small', access: 'curbside',
      categories: ['furniture'], possibleRestrictedMaterials: false, communicationConsent: false, optedOut: true,
    },
  },
} as const;

type ScenarioKey = keyof typeof scenarios;

const cardStyle: React.CSSProperties = {
  background: '#fff', border: '1px solid #dce3df', borderRadius: 15,
  padding: 22, boxShadow: '0 8px 25px rgba(0,0,0,.04)',
};
const smallLabel: React.CSSProperties = {
  color: '#586a63', textTransform: 'uppercase', fontWeight: 800, letterSpacing: 1.3, fontSize: 11,
};

export default function JunkRemovalDemo() {
  const [selected, setSelected] = useState<ScenarioKey>('standard');
  const current = scenarios[selected];
  const result = assessJunkRemovalIntake(current.input);
  const task = proposeJunkRemovalOwnerTask(result);

  return <main style={{minHeight: '100vh', background: '#f2f5f1', color: '#102a24', padding: '32px 18px'}}>
    <div style={{maxWidth: 1080, margin: 'auto'}}>
      <p style={{...smallLabel, marginBottom: 12}}>PROJECT 8 × PROJECT 6 / JUNK REMOVAL VERTICAL</p>
      <h1 style={{fontSize: 'clamp(28px, 5vw, 54px)', lineHeight: 1.1, marginBottom: 14}}>
        From junk-removal inquiry to a human-reviewed next step.
      </h1>
      <p style={{maxWidth: 730, lineHeight: 1.8, color: '#476059'}}>
        This demonstration uses four invented inquiries. It does not collect contact information,
        save data, calculate a price, confirm service coverage, schedule jobs, or message customers.
      </p>
      <div style={{background: '#ebdfbb', padding: 15, borderRadius: 10, fontWeight: 700, marginBottom: 22}}>
        RESEARCH PREVIEW ONLY — NOT A LICENSED HAULING SERVICE, ACTIVE ESTIMATE FORM, OR LIVE CUSTOMER INBOX
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(285px, 1fr))', gap: 18}}>
        <section style={cardStyle} aria-labelledby="example-heading">
          <h2 id="example-heading">1 / Fictional inquiry</h2>
          <p style={{color: '#596d63'}}>Choose a sample to simulate the vertical-specific intake rules.</p>
          <div role="group" aria-label="Fictional sample inquiry" style={{display: 'grid', gap: 9}}>
            {(Object.keys(scenarios) as ScenarioKey[]).map(key =>
              <button key={key} type="button" onClick={() => setSelected(key)}
                aria-pressed={selected === key}
                style={{
                  textAlign: 'left', border: '1px solid ' + (selected === key ? '#1a5d46' : '#e1e8e1'),
                  background: selected === key ? '#ddf0e3' : '#fff',
                  padding: 13, borderRadius: 9, fontWeight: selected === key ? 800 : 600,
                }}>{scenarios[key].label}</button>
            )}
          </div>
          <p style={{...smallLabel, marginTop: 23}}>Synthetic request fields</p>
          <dl style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13}}>
            <div><dt>ZIP-format example</dt><dd style={{margin: 0, fontWeight: 700}}>{current.input.zipCode || 'Not supplied'}</dd></div>
            <div><dt>Load size</dt><dd style={{margin: 0, fontWeight: 700}}>{current.input.loadSize}</dd></div>
            <div><dt>Access</dt><dd style={{margin: 0, fontWeight: 700}}>{current.input.access}</dd></div>
            <div><dt>Item category</dt><dd style={{margin: 0, fontWeight: 700}}>{current.input.categories.join(', ')}</dd></div>
          </dl>
        </section>
        <section style={cardStyle} aria-labelledby="decision-heading">
          <h2 id="decision-heading">2 / Domain precheck</h2>
          <p style={smallLabel}>Decision: {result.kind.replaceAll('_', ' ')}</p>
          <p style={{lineHeight: 1.65}}>This checks completeness and special-handling concerns. It does not use Project 6&apos;s generic consulting-value score as a hauling price or sales probability.</p>
          <h3 style={{fontSize: 15}}>Missing information</h3>
          {result.missing.length ? <ul>{result.missing.map(x => <li key={x}>{x.replaceAll('_', ' ')}</li>)}</ul>
            : <p>No required intake fields missing.</p>}
          <h3 style={{fontSize: 15}}>Operator-review flags</h3>
          {result.reviewReasons.length ? <ul>{result.reviewReasons.map(x => <li key={x}>{x.replaceAll('_', ' ')}</li>)}</ul>
            : <p>No additional policy flags in this fictional record.</p>}
          <p style={{fontSize: 12}}>Communication permission precheck: <strong>{result.followUpPermitted ? 'affirmative, still requires send-time verification' : 'not established'}</strong></p>
        </section>
        <section style={cardStyle} aria-labelledby="task-heading">
          <h2 id="task-heading">3 / Suggested owner task</h2>
          <p style={smallLabel}>{task.action.replaceAll('_', ' ')}</p>
          <p style={{lineHeight: 1.65}}>Project 6-style internal action draft for a future tenant-authenticated Project 8 Action Center.</p>
          <ul style={{paddingLeft: 20, lineHeight: 1.65}}>{task.checklist.map((x, i) => <li key={i}>{x}</li>)}</ul>
          <p style={{marginTop: 18, padding: 12, borderRadius: 9, background: '#f3f6f3'}}>
            No automatic price · No automatic booking · No outbound message · No database write
          </p>
        </section>
      </div>
      <p style={{marginTop: 26, fontSize: 12, color: '#61716a'}}>
        Product architecture: Project 8 owns the eventual authenticated workspace; Project 6 remains a separate
        reference implementation; junk removal is an independent vertical policy. Real operations remain blocked
        until tenancy, consent, permitting, insurance and recovery gates are independently verified.
      </p>
    </div>
  </main>;
}
