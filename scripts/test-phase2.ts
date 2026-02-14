/**
 * Phase 2 tests - Visibility rules
 * Run: npm run test:phase2
 */

import "dotenv/config";
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });

import {
  canViewRequest,
  getRequestsWhereClause,
} from "../src/lib/visibility";
import type { UserProfile } from "../src/lib/auth";

function makeProfile(overrides: Partial<UserProfile>): UserProfile {
  return {
    id: "u1",
    auth_user_id: "auth1",
    email: "test@co.com",
    name: "Test",
    role_id: "r1",
    sector_id: "s1",
    role: { name: "employee", hierarchy_level: 1 },
    sector: { name: "General" },
    ...overrides,
  };
}

function runTests() {
  const results: { name: string; ok: boolean; error?: string }[] = [];

  console.log("\n🧪 Phase 2 Tests - Visibility Rules\n");
  console.log("─".repeat(50));

  // ─── canViewRequest ──────────────────────────────────────
  console.log("\n1️⃣  canViewRequest...");

  const emp = makeProfile({ role: { name: "employee", hierarchy_level: 1 } });
  const sup = makeProfile({ role: { name: "supervisor", hierarchy_level: 2 } });
  const mgr = makeProfile({ role: { name: "manager", hierarchy_level: 3 } });
  const gm = makeProfile({ role: { name: "general_manager", hierarchy_level: 4 } });

  // GM sees all
  if (!canViewRequest(gm, { requester_id: "any", requester: { sector_id: "s2", role: { hierarchy_level: 1 } } })) {
    results.push({ name: "GM sees any request", ok: false, error: "GM should see all" });
  } else {
    results.push({ name: "GM sees any request", ok: true });
  }

  // GM sees legacy (no requester)
  if (!canViewRequest(gm, { requester_id: null })) {
    results.push({ name: "GM sees legacy request", ok: false, error: "GM should see legacy" });
  } else {
    results.push({ name: "GM sees legacy request", ok: true });
  }

  // Employee: only own
  if (!canViewRequest(emp, { requester_id: "u1" })) {
    results.push({ name: "Employee sees own", ok: false });
  } else {
    results.push({ name: "Employee sees own", ok: true });
  }
  if (canViewRequest(emp, { requester_id: "other" })) {
    results.push({ name: "Employee cannot see other", ok: false });
  } else {
    results.push({ name: "Employee cannot see other", ok: true });
  }

  // Supervisor: own + employees same sector
  if (!canViewRequest(sup, { requester_id: "u1" })) {
    results.push({ name: "Supervisor sees own", ok: false });
  } else {
    results.push({ name: "Supervisor sees own", ok: true });
  }
  if (!canViewRequest(sup, {
    requester_id: "e1",
    requester: { sector_id: "s1", role: { hierarchy_level: 1 } },
  })) {
    results.push({ name: "Supervisor sees employee same sector", ok: false });
  } else {
    results.push({ name: "Supervisor sees employee same sector", ok: true });
  }
  if (canViewRequest(sup, {
    requester_id: "e2",
    requester: { sector_id: "s2", role: { hierarchy_level: 1 } },
  })) {
    results.push({ name: "Supervisor cannot see employee other sector", ok: false });
  } else {
    results.push({ name: "Supervisor cannot see employee other sector", ok: true });
  }

  // Manager: same sector
  if (!canViewRequest(mgr, {
    requester_id: "e1",
    requester: { sector_id: "s1", role: { hierarchy_level: 1 } },
  })) {
    results.push({ name: "Manager sees request same sector", ok: false });
  } else {
    results.push({ name: "Manager sees request same sector", ok: true });
  }
  if (canViewRequest(mgr, {
    requester_id: "e2",
    requester: { sector_id: "s2", role: { hierarchy_level: 1 } },
  })) {
    results.push({ name: "Manager cannot see other sector", ok: false });
  } else {
    results.push({ name: "Manager cannot see other sector", ok: true });
  }

  // Legacy: only GM
  if (canViewRequest(emp, { requester_id: null })) {
    results.push({ name: "Employee cannot see legacy", ok: false });
  } else {
    results.push({ name: "Employee cannot see legacy", ok: true });
  }

  // ─── getRequestsWhereClause ──────────────────────────────
  console.log("\n2️⃣  getRequestsWhereClause...");

  const empWhere = getRequestsWhereClause(emp);
  if (JSON.stringify(empWhere) !== '{"requester_id":"u1"}') {
    results.push({ name: "Employee where clause", ok: false, error: String(empWhere) });
  } else {
    results.push({ name: "Employee where clause", ok: true });
  }

  const gmWhere = getRequestsWhereClause(gm);
  if (Object.keys(gmWhere).length !== 0) {
    results.push({ name: "GM where clause (empty)", ok: false });
  } else {
    results.push({ name: "GM where clause (empty)", ok: true });
  }

  const mgrWhere = getRequestsWhereClause(mgr) as { requester?: { sector_id: string } };
  if (mgrWhere.requester?.sector_id !== "s1") {
    results.push({ name: "Manager where clause", ok: false });
  } else {
    results.push({ name: "Manager where clause", ok: true });
  }

  const supWhere = getRequestsWhereClause(sup) as { OR?: unknown[] };
  if (!supWhere.OR || supWhere.OR.length !== 2) {
    results.push({ name: "Supervisor where clause", ok: false });
  } else {
    results.push({ name: "Supervisor where clause", ok: true });
  }

  // Summary
  console.log("\n" + "─".repeat(50));
  const passed = results.filter((r) => r.ok).length;
  const total = results.length;
  console.log(`\n📊 ${passed}/${total} tests passed\n`);

  if (passed < total) {
    results.filter((r) => !r.ok).forEach((r) => console.log("  -", r.name, ":", r.error ?? "failed"));
    process.exit(1);
  }

  console.log("   ✅ All visibility rules OK");
}

runTests();
