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
    rule: 'local-next/no-next-document-in-app',
    bad: 'import Document from "next/document";',
  },
];

for (const item of cases) {
  test(`installed ESLint configuration blocks ${item.rule}`, async () => {
    assert.deepEqual(await lint(item.bad), [item.rule]);
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
