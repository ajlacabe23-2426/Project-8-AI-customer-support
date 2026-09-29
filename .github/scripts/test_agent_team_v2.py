import importlib.util
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).with_name("validate_task_contract.py")
SPEC = importlib.util.spec_from_file_location("validate_task_contract", MODULE_PATH)
assert SPEC and SPEC.loader
validator = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(validator)

class AgentTeamContractTests(unittest.TestCase):
    def test_expected_states_exist(self):
        self.assertIn("READY_FOR_AJ", validator.ALLOWED_STATUSES)
        self.assertIn("BLOCKED_EXTERNAL", validator.ALLOWED_STATUSES)

    def test_scope_matching(self):
        allowed = ["AGENTS.md", ".codex/**", ".github/scripts/*.py"]
        self.assertTrue(validator.matches_any(".codex/CURRENT_TASK.md", allowed))
        self.assertFalse(validator.matches_any("app/api/chat/route.ts", allowed))

    def test_generic_runtime_paths_are_at_least_tier_one(self):
        tier, _ = validator.required_risk(["app/page.tsx"])
        self.assertEqual(tier, 1)
        tier, _ = validator.required_risk(["lib/leads.ts"])
        self.assertEqual(tier, 1)

    def test_sensitive_paths_raise_tier(self):
        tier, _ = validator.required_risk(["app/api/chat/route.ts"])
        self.assertEqual(tier, 2)
        tier, _ = validator.required_risk(["lib/ai.ts"])
        self.assertEqual(tier, 2)
        tier, _ = validator.required_risk(["supabase/migrations/20260929000100_change.sql"])
        self.assertEqual(tier, 3)

    def test_sensitive_runtime_tokens_escalate_risk(self):
        tier, _ = validator.required_risk(["app/page.tsx"], "+ const value = process.env.SECRET")
        self.assertEqual(tier, 2)
        tier, _ = validator.required_risk(["lib/leads.ts"], "+ security definer")
        self.assertEqual(tier, 3)

    def test_admin_paths_remain_tier_zero(self):
        tier, reasons = validator.required_risk(["AGENTS.md", ".codex/AGENT_CONTRACT.md"])
        self.assertEqual(tier, 0)
        self.assertEqual(reasons, [])

    def test_required_section_rejects_blank(self):
        with self.assertRaises(validator.ContractError):
            validator.section_body("## Objective\n\n## Acceptance criteria\nReady\n", "Objective")

if __name__ == "__main__":
    unittest.main()
