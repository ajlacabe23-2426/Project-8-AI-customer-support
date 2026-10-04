import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const BLOCKING_SEVERITIES = new Set(["high", "critical"]);
const TEMPORARY_EXCEPTION = {
  advisory: "GHSA-VFJ7-8CJW-P6XM",
  expiresAt: "2026-10-18T00:00:00.000Z",
  packages: new Set([
    "braces",
    "micromatch",
    "fast-glob",
    "@next/eslint-plugin-next",
    "eslint-config-next",
  ]),
};

function advisoryIdFromVia(via) {
  if (!via || typeof via !== "object") return null;
  const text = [via.url, via.title, via.name].filter((v) => typeof v === "string").join(" ");
  return text.match(/GHSA-[a-z0-9-]+/i)?.[0]?.toUpperCase() ?? null;
}

function collectRootAdvisories(packageName, vulnerabilities, seen = new Set()) {
  if (seen.has(packageName)) return new Set(["CYCLE"]);
  const vulnerability = vulnerabilities[packageName];
  if (!vulnerability) return new Set(["UNKNOWN"]);

  const nextSeen = new Set(seen);
  nextSeen.add(packageName);
  const advisories = new Set();

  for (const via of vulnerability.via ?? []) {
    if (typeof via === "string") {
      for (const advisory of collectRootAdvisories(via, vulnerabilities, nextSeen)) {
        advisories.add(advisory);
      }
    } else {
      advisories.add(advisoryIdFromVia(via) ?? "UNKNOWN");
    }
  }
  return advisories.size > 0 ? advisories : new Set(["UNKNOWN"]);
}

function allNodesAreDevOnly(vulnerability, packageLock) {
  const nodes = vulnerability.nodes ?? [];
  return Array.isArray(nodes) &&
    nodes.length > 0 &&
    nodes.every((node) => packageLock.packages?.[node]?.dev === true);
}

export function evaluateAuditPolicy(auditReport, packageLock, now = new Date()) {
  const vulnerabilities = auditReport?.vulnerabilities ?? {};
  const blocking = Object.entries(vulnerabilities).filter(([, v]) =>
    BLOCKING_SEVERITIES.has(v?.severity),
  );

  const allowed = [];
  const denied = [];
  const expired = now >= new Date(TEMPORARY_EXCEPTION.expiresAt);

  for (const [packageName, vulnerability] of blocking) {
    const advisories = [...collectRootAdvisories(packageName, vulnerabilities)];
    const sameAdvisory =
      advisories.length > 0 &&
      advisories.every((id) => id === TEMPORARY_EXCEPTION.advisory);
    const knownPackage = TEMPORARY_EXCEPTION.packages.has(packageName);
    const devOnly = allNodesAreDevOnly(vulnerability, packageLock);

    if (!expired && sameAdvisory && knownPackage && devOnly) {
      allowed.push({ packageName, severity: vulnerability.severity, advisories });
      continue;
    }

    denied.push({
      packageName,
      severity: vulnerability.severity,
      advisories,
      reason: expired
        ? "temporary exception expired"
        : !sameAdvisory
          ? "advisory is not the approved exception"
          : !knownPackage
            ? "package is outside the approved dependency chain"
            : "affected package-lock node is not dev-only",
    });
  }

  return {
    pass: denied.length === 0,
    allowed,
    denied,
    exception: TEMPORARY_EXCEPTION,
  };
}

function runAudit() {
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(
    npm,
    ["audit", "--audit-level=high", "--package-lock-only", "--json"],
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
  );

  if (result.error) {
    console.error(`Dependency audit could not start: ${result.error.message}`);
    process.exit(2);
  }

  if (!result.stdout?.trim()) {
    console.error("Dependency audit returned no JSON report.");
    if (result.stderr?.trim()) console.error(result.stderr.trim());
    process.exit(2);
  }

  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    console.error("Dependency audit returned invalid JSON.");
    process.exit(2);
  }

  const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
  const evaluation = evaluateAuditPolicy(report, lock);

  for (const finding of evaluation.allowed) {
    console.warn(
      `Temporary dev-only dependency exception: ${finding.packageName} ${evaluation.exception.advisory} expires ${evaluation.exception.expiresAt}`,
    );
  }

  if (!evaluation.pass) {
    console.error("Dependency security policy failed:");
    for (const finding of evaluation.denied) {
      console.error(
        `- ${finding.packageName} (${finding.severity}): ${finding.reason}; roots=${finding.advisories.join(",")}`,
      );
    }
    process.exit(1);
  }

  console.log(
    `Dependency security policy passed: ${evaluation.allowed.length} narrowly scoped temporary finding(s) accepted; every other high/critical finding remains blocking.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runAudit();
}
