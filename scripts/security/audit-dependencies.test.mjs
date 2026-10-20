import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { evaluateAuditPolicy, parseAuditSubprocess, resolveAuditInvocation } from "./audit-dependencies.mjs";

const cleanReport = {
  auditReportVersion: 2,
  vulnerabilities: {},
  metadata: { vulnerabilities: { low: 0, moderate: 0, high: 0, critical: 0, total: 0 } },
};
const advisory = "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm";
const devReport = {
  vulnerabilities: {
    braces: {
      severity: "high",
      via: [{ url: advisory }],
      nodes: ["node_modules/braces"],
    },
  },
};
const devLock = { packages: { "node_modules/braces": { dev: true } } };

test("cross-platform launcher invokes only node + validated npm-cli.js, no shell", () => {
  for (const [platform, node, cli] of [
    ["win32", "C:\\Program Files\\nodejs\\node.exe", "C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js"],
    ["linux", "/opt/node/bin/node", "/opt/node/lib/node_modules/npm/bin/npm-cli.js"],
  ]) {
    const command = resolveAuditInvocation({ platform, execPath: node, npmExecPath: cli, exists: v => v === cli });
    assert.equal(command.executable, node);
    assert.deepEqual(command.args, [cli, "audit", "--audit-level=high", "--package-lock-only", "--json"]);
  }
  assert.throws(() => resolveAuditInvocation({
    platform: "win32", execPath: "C:\\node\\node.exe",
    npmExecPath: "npm.cmd", exists: () => false,
  }), /npm-cli.js was not found/);
  assert.throws(() => resolveAuditInvocation({
    platform: "linux", execPath: "/bin/node",
    npmExecPath: "/tmp/evil;echo injected.js", exists: (v) => v === "/tmp/evil;echo injected.js",
  }), /npm-cli.js was not found/);
});

test("complete audit reports are accepted for analysis, even when npm exits one for vulnerabilities", () => {
  assert.deepEqual(parseAuditSubprocess({ status: 0, stdout: JSON.stringify(cleanReport) }), cleanReport);
  assert.deepEqual(parseAuditSubprocess({ status: 1, stdout: JSON.stringify(cleanReport) }), cleanReport);
});

test("subprocess and incomplete npm audit output always fail closed", () => {
  const attempts = [
    { error: new Error("spawn EINVAL") },
    { error: Object.assign(new Error("ENOENT"), { code: "ENOENT" }) },
    { status: 2, stdout: JSON.stringify(cleanReport) },
    { status: null, signal: "SIGTERM", stdout: JSON.stringify(cleanReport) },
    { status: 0, stdout: "" },
    { status: 0, stdout: "not json" },
    { status: 0, stdout: JSON.stringify({ error: { code: "ENOAUDIT" } }) },
    { status: 0, stdout: JSON.stringify({ vulnerabilities: {}, metadata: {} }) },
    { status: 0, stdout: JSON.stringify({ auditReportVersion: 2, vulnerabilities: {} }) },
  ];
  for (const attempt of attempts) {
    assert.throws(() => parseAuditSubprocess(attempt), /audit|JSON|report|process/);
  }
});

test("existing policy denies high production risk and expired temporary dev exception", () => {
  const before = evaluateAuditPolicy(devReport, devLock, new Date("2026-10-17T23:59:59Z"));
  assert.equal(before.pass, true);
  assert.deepEqual(before.allowed.map(v => v.packageName), ["braces"]);
  const expired = evaluateAuditPolicy(devReport, devLock, new Date("2026-10-20T12:00:00Z"));
  assert.equal(expired.pass, false);
  assert.match(expired.denied[0].reason, /expired/);
  const prod = evaluateAuditPolicy(devReport, { packages: { "node_modules/braces": { dev: false } } }, new Date("2026-10-17T12:00:00Z"));
  assert.equal(prod.pass, false);
  const wrongAdvisory = evaluateAuditPolicy({ vulnerabilities: { braces: { severity: "high", via: [{ url: "https://github.com/advisories/GHSA-aaaa-bbbb-cccc" }], nodes: ["node_modules/braces"] } } }, devLock, new Date("2026-10-17T12:00:00Z"));
  assert.equal(wrongAdvisory.pass, false);
});

test("real shell-free child process handles success, blocking advisory and abnormal status", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "p8-audit & spaces-"));
  const cli = path.join(root, "npm-cli.js");
  const script = fileURLToPath(new URL("./audit-dependencies.mjs", import.meta.url));
  try {
    fs.writeFileSync(cli, `const mode = process.env.FAKE_AUDIT_MODE;
const clean = ${JSON.stringify(JSON.stringify(cleanReport))};
const high = ${JSON.stringify(JSON.stringify({ ...cleanReport, vulnerabilities: devReport.vulnerabilities, metadata: { vulnerabilities: {high:1,total:1} } }))};
if (mode === "success") { console.log(clean); process.exit(0); }
if (mode === "high") { console.log(high); process.exit(1); }
if (mode === "badexit") { console.log(clean); process.exit(2); }
console.log("invalid"); process.exit(0);
`);
    function check(mode) {
      return spawnSync(process.execPath, [script], {
        cwd: process.cwd(),
        env: { ...process.env, npm_execpath: cli, FAKE_AUDIT_MODE: mode },
        encoding: "utf8", shell: false, windowsHide: true,
      });
    }
    const success = check("success");
    assert.equal(success.status, 0, success.stderr);
    assert.match(success.stdout, /passed/);
    const blocked = check("high");
    assert.equal(blocked.status, 1, blocked.stderr);
    assert.match(blocked.stderr, /expired|failed/);
    const failedAudit = check("badexit");
    assert.equal(failedAudit.status, 2);
    assert.match(failedAudit.stderr, /terminated abnormally/);
    const invalid = check("invalid");
    assert.equal(invalid.status, 2);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
