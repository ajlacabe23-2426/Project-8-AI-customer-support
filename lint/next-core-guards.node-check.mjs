import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { ESLint } from 'eslint';

const eslint = new ESLint({ overrideConfigFile: path.resolve('eslint.config.mjs') });

async function lint(source, file = 'app/__next_core_guard_fixture.tsx') {
  const result = await eslint.lintText(source, { filePath: path.resolve(file) });
  assert.equal(result.length, 1);
  return result[0].messages
    .filter((message) => message.ruleId?.startsWith('local-next/'))
    .map((message) => message.ruleId);
}

const cases = [
  {
    rule: 'local-next/no-raw-img',
    bad: 'const element = <img src="/photo.jpg" alt="example" />;',
  },
  {
    rule: 'local-next/no-internal-html-link',
    bad: 'const element = <a href="/dashboard">Dashboard</a>;',
  },
  {
    rule: 'local-next/no-sync-script',
    bad: 'const element = <script src="/tracker.js" />;',
  },
  {
    rule: 'local-next/no-raw-head',
    bad: 'const element = <head><title>Insecure</title></head>;',
  },
  {
    rule: 'local-next/no-unsafe-blank-target',
    bad: 'const element = <a href="https://example.org" target="_blank">Remote</a>;',
  },
  {
    rule: 'local-next/no-next-document-outside-document',
    bad: 'import Document from "next/document";',
  },
  {
    rule: 'local-next/no-css-link',
    bad: 'const element = <link rel="stylesheet" href="/site.css" />;',
  },
  {
    rule: 'local-next/no-polyfillio-script',
    bad: 'const element = <script src="https://cdn.polyfill.io/v3/polyfill.min.js" async />;',
  },
  {
    rule: 'local-next/no-next-head-in-app',
    bad: 'import Head from "next/head";',
  },
  {
    rule: 'local-next/no-inline-script-without-id',
    bad: 'const element = <Script>{ "inline()" }</Script>;',
  },
  {
    rule: 'local-next/no-beforeinteractive-outside-document',
    file: 'pages/landing.tsx',
    bad: 'const element = <Script src="/early.js" strategy="beforeInteractive" />;',
  },
  {
    rule: 'local-next/no-styled-jsx-in-document',
    file: 'pages/_document.tsx',
    bad: 'const element = <style jsx>{ "h1{color:red}" }</style>;',
  },
  {
    rule: 'local-next/no-next-script-in-head',
    bad: 'const element = <Head><Script src="/analytics.js" /></Head>;',
  },
  {
    rule: 'local-next/no-async-client-component',
    bad: '"use client"; export default async function Page() { return <div />; }',
  },
  {
    rule: 'local-next/no-next-head-in-document',
    file: 'pages/_document.tsx',
    bad: 'import Head from "next/head";',
  },
  {
    rule: 'local-next/no-next-document-outside-document',
    file: 'pages/contact.tsx',
    bad: 'import Document from "next/document";',
  },
];

for (const item of cases) {
  test(`installed ESLint configuration blocks ${item.rule}`, async () => {
    assert.deepEqual(await lint(item.bad, item.file), [item.rule]);
  });
}

test('safe Next.js Link, image and script patterns pass local guards', async () => {
  const content = `import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
export default function Example() {
  return <main>
    <Link href="/dashboard">Dashboard</Link>
    <Image src="/photo.jpg" width={20} height={20} alt="photo" />
    <Script src="/metrics.js" strategy="afterInteractive" />
    <a href="#platform">Jump down</a>
    <a href="https://example.org" target="_blank" rel="noopener noreferrer">Remote</a>
    <script src="/deferred.js" defer />
  </main>;
}`;
  assert.deepEqual(await lint(content), []);
});

test('unsafe internal string-literal expressions remain blocked', async () => {
  assert.deepEqual(await lint('const a = <a href={"/settings"}>Settings</a>;'), ['local-next/no-internal-html-link']);
});

test('do not apply App Router import ban to a legacy pages/_document module', async () => {
  assert.deepEqual(await lint('import Document from "next/document";', 'pages/_document.tsx'), []);
});

test('unknown / dynamic URLs are not assumed to be unsafe static internal links', async () => {
  assert.deepEqual(await lint('const a = <a href={destination}>Open</a>;'), []);
});

test('Next custom guard rejects unsafe polyfill.io via next/script', async () => {
  assert.deepEqual(
    await lint('const element = <Script src={"https://polyfill.io/v3/polyfill.min.js"} />;'),
    ['local-next/no-polyfillio-script'],
  );
});

test('safe external scripts and Next metadata usage avoid new false positives', async () => {
  const source = `import Script from 'next/script';
export const metadata = { title: 'Example' };
export default function Page() {
  return <main>
    <Script src="https://static.example.org/analytics.js" strategy="afterInteractive" />
    <link rel="preconnect" href="https://fonts.gstatic.com" />
  </main>;
}`;
  assert.deepEqual(await lint(source), []);
});

test('legacy pages route is not treated as an App Router next/head import', async () => {
  assert.deepEqual(await lint('import Head from "next/head";', 'pages/example.tsx'), []);
});


test('inline next/script with id passes and inline dangerouslySetInnerHTML without id fails', async () => {
  assert.deepEqual(await lint('const x = <Script id="inline-check">{ "script()" }</Script>;'), []);
  assert.deepEqual(await lint('const x = <Script dangerouslySetInnerHTML={{ __html: "script()" }} />;'),
    ['local-next/no-inline-script-without-id']);
});

test('App Router layout can use beforeInteractive and Pages document may import next/document', async () => {
  assert.deepEqual(await lint('const x = <Script src="/early.js" strategy="beforeInteractive" />;', 'app/layout.tsx'), []);
  assert.deepEqual(await lint('import Document from "next/document";', 'pages/_document.tsx'), []);
  assert.deepEqual(await lint('const x = <Script src="/early.js" strategy="beforeInteractive" />;', 'pages/_document.tsx'), []);
});

test('regular client-side async helper is not treated as an async component', async () => {
  assert.deepEqual(await lint('"use client"; async function loadData() { return 42; }'), []);
});

test('script outside Head and CSS without styled-jsx pass local guards', async () => {
  assert.deepEqual(await lint('const x = <><Head></Head><Script src="/analytics.js" /></>;'), []);
  assert.deepEqual(await lint('const x = <style>{ "p{color:blue}" }</style>;', 'pages/_document.tsx'), []);
});

test('client async uppercase component variables are rejected', async () => {
  assert.deepEqual(await lint('"use client"; const MyWidget = async () => <div />;'),
    ['local-next/no-async-client-component']);
});
