#!/usr/bin/env python3
from __future__ import annotations

import argparse
import fnmatch
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TASK_FILE = ROOT / ".codex" / "CURRENT_TASK.md"
MAX_TASK_BYTES = 12000

ALLOWED_STATUSES = {
    "NO_ACTIVE_TASK",
    "ACTIVE",
    "IMPLEMENTING",
    "VERIFYING",
    "CORRECTIONS_REQUIRED",
    "READY_FOR_AJ",
    "BLOCKED_EXTERNAL",
    "COMPLETE",
}

RISK_ORDER = {"TIER_0": 0, "TIER_1": 1, "TIER_2": 2, "TIER_3": 3}
REQUIRED_SECTIONS = (
    "Objective",
    "Acceptance criteria",
    "Authorized implementation paths",
    "Authorized test paths",
    "Explicit non-goals",
    "Required gates",
)

TIER_3_PATHS = ("supabase/migrations/*", "supabase/migrations/**", "supabase/config.toml")
TIER_2_PATHS = (
    "app/api/*",
    "app/api/**",
    "lib/supabase.*",
    "lib/visitor-session.*",
    "middleware.*",
    ".env.example",
)

class ContractError(RuntimeError):
    pass

def run_git(*args: str) -> str:
    result = subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True)
    if result.returncode != 0:
        raise ContractError(f"git {' '.join(args)} failed: {result.stderr.strip()}")
    return result.stdout

def parse_field(text: str, name: str) -> str:
    match = re.search(rf"(?m)^{re.escape(name)}:\s*(.+?)\s*$", text)
    if not match:
        raise ContractError(f"Missing required field: {name}")
    return match.group(1).strip().strip("`")

def section_body(text: str, heading: str) -> str:
    match = re.search(rf"(?ms)^##\s+{re.escape(heading)}\s*$\n(.*?)(?=^##\s+|\Z)", text)
    if not match or not match.group(1).strip():
        raise ContractError(f"Missing or empty section: ## {heading}")
    return match.group(1).strip()

def parse_paths(body: str, section: str) -> list[str]:
    values = []
    for line in body.splitlines():
        m = re.match(r"^\s*-\s+`([^`]+)`\s*$", line)
        if m:
            values.append(m.group(1).strip())
    if not values:
        raise ContractError(f"## {section} must contain backtick-wrapped path bullets")
    return values

def matches_any(path: str, patterns: list[str] | tuple[str, ...]) -> bool:
    return any(fnmatch.fnmatchcase(path, pattern) for pattern in patterns)

def changed_files(base: str) -> list[str]:
    output = run_git("diff", "--name-only", f"{base}...HEAD")
    return sorted({line.strip() for line in output.splitlines() if line.strip()})

def required_risk(files: list[str]) -> tuple[int, list[str]]:
    tier = 0
    reasons = []
    t3 = [p for p in files if matches_any(p, TIER_3_PATHS)]
    if t3:
        tier = 3
        reasons.append("Tier 3 path(s): " + ", ".join(t3))
    t2 = [p for p in files if matches_any(p, TIER_2_PATHS)]
    if t2:
        tier = max(tier, 2)
        reasons.append("Tier 2 path(s): " + ", ".join(t2))
    return tier, reasons

def validate() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default=None)
    args = parser.parse_args()

    if not TASK_FILE.exists():
        raise ContractError("Missing .codex/CURRENT_TASK.md")
    if TASK_FILE.stat().st_size > MAX_TASK_BYTES:
        raise ContractError("CURRENT_TASK.md is too large; archive history outside the active contract")

    text = TASK_FILE.read_text(encoding="utf-8-sig")
    task_id = parse_field(text, "Task ID")
    title = parse_field(text, "Title")
    status = parse_field(text, "Status")
    risk = parse_field(text, "Risk Tier")
    base_sha = parse_field(text, "Base SHA")

    if not task_id or not title:
        raise ContractError("Task ID and Title must be non-empty")
    if status not in ALLOWED_STATUSES:
        raise ContractError(f"Invalid Status: {status}")
    if risk not in RISK_ORDER:
        raise ContractError(f"Invalid Risk Tier: {risk}")
    if status != "NO_ACTIVE_TASK" and not re.fullmatch(r"[0-9a-fA-F]{40}", base_sha):
        raise ContractError("Base SHA must be a full 40-character commit SHA")

    for heading in REQUIRED_SECTIONS:
        section_body(text, heading)

    impl = parse_paths(section_body(text, "Authorized implementation paths"), "Authorized implementation paths")
    tests = parse_paths(section_body(text, "Authorized test paths"), "Authorized test paths")
    allowed = impl + tests

    if status == "NO_ACTIVE_TASK":
        raise ContractError("Repository-changing validation requires an active task")

    base = args.base or base_sha
    run_git("rev-parse", "--verify", f"{base}^{{commit}}")
    files = changed_files(base)
    if not files:
        raise ContractError("No changed files found")

    unauthorized = [p for p in files if not matches_any(p, allowed)]
    if unauthorized:
        raise ContractError("Changed-file scope violation: " + ", ".join(unauthorized))

    minimum, reasons = required_risk(files)
    if RISK_ORDER[risk] < minimum:
        raise ContractError(
            f"Risk under-classified: declared {risk}, requires at least TIER_{minimum}. "
            + "; ".join(reasons)
        )

    print(f"Task contract PASS: {task_id}")
    print(f"Status: {status}")
    print(f"Risk: {risk}")
    print(f"Diff base: {base}")
    print(f"Changed files: {len(files)}")

if __name__ == "__main__":
    try:
        validate()
    except ContractError as exc:
        print(f"Project 8 task contract FAILED: {exc}", file=sys.stderr)
        sys.exit(1)
