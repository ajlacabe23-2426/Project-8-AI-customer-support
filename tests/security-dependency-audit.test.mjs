import { describe, expect, it } from "vitest";
import { evaluateAuditPolicy } from "../scripts/security/audit-dependencies.mjs";

function report(advisory = "GHSA-vfj7-8cjw-p6xm") {
  return {
    vulnerabilities: {
      braces: {
        severity: "high",
        via: [{ url: `https://github.com/advisories/${advisory}` }],
        nodes: ["node_modules/braces"],
      },
      micromatch: {
        severity: "high",
        via: ["braces"],
        nodes: ["node_modules/micromatch"],
      },
      "fast-glob": {
        severity: "high",
        via: ["micromatch"],
        nodes: ["node_modules/fast-glob"],
      },
      "@next/eslint-plugin-next": {
        severity: "high",
        via: ["fast-glob"],
        nodes: ["node_modules/@next/eslint-plugin-next"],
      },
      "eslint-config-next": {
        severity: "high",
        via: ["@next/eslint-plugin-next"],
        nodes: ["node_modules/eslint-config-next"],
      },
    },
  };
}

function devLock() {
  return {
    packages: {
      "node_modules/braces": { dev: true },
      "node_modules/micromatch": { dev: true },
      "node_modules/fast-glob": { dev: true },
      "node_modules/@next/eslint-plugin-next": { dev: true },
      "node_modules/eslint-config-next": { dev: true },
    },
  };
}

describe("Project 8 dependency audit policy", () => {
  it("allows only the documented unpatched dev-only advisory before expiry", () => {
    const result = evaluateAuditPolicy(report(), devLock(), new Date("2026-10-04T12:00:00Z"));
    expect(result.pass).toBe(true);
    expect(result.allowed).toHaveLength(5);
  });

  it("blocks the same advisory after expiry", () => {
    const result = evaluateAuditPolicy(report(), devLock(), new Date("2026-10-18T00:00:00Z"));
    expect(result.pass).toBe(false);
  });

  it("blocks an unrelated high-severity advisory", () => {
    const result = evaluateAuditPolicy(
      report("GHSA-aaaa-bbbb-cccc"),
      devLock(),
      new Date("2026-10-04T12:00:00Z"),
    );
    expect(result.pass).toBe(false);
  });

  it("blocks the exception if it reaches runtime dependencies", () => {
    const lock = devLock();
    lock.packages["node_modules/braces"] = { dev: false };
    const result = evaluateAuditPolicy(report(), lock, new Date("2026-10-04T12:00:00Z"));
    expect(result.pass).toBe(false);
  });

  it("blocks any additional high or critical advisory", () => {
    const r = report();
    r.vulnerabilities["other-package"] = {
      severity: "critical",
      via: [{ url: "https://github.com/advisories/GHSA-dddd-eeee-ffff" }],
      nodes: ["node_modules/other-package"],
    };
    const lock = devLock();
    lock.packages["node_modules/other-package"] = { dev: true };
    const result = evaluateAuditPolicy(r, lock, new Date("2026-10-04T12:00:00Z"));
    expect(result.pass).toBe(false);
  });
});
