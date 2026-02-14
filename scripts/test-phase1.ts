/**
 * Phase 1 tests - Auth & GM
 * Run: npm run test:phase1
 */

import "dotenv/config";
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const GM_EMAIL = process.env.GM_EMAIL ?? "gm@company.com";
const GM_PASSWORD = process.env.GM_PASSWORD ?? "ChangeMe123!";

async function runTests() {
  const results: { name: string; ok: boolean; error?: string }[] = [];

  console.log("\n🧪 Phase 1 Tests - Auth & GM\n");
  console.log("─".repeat(50));

  if (!SUPABASE_URL || !SUPABASE_ANON) {
    console.error("\n❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    process.exit(1);
  }

  // 1. Supabase Auth - Login
  console.log("\n1️⃣  GM Login...");
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: GM_EMAIL,
      password: GM_PASSWORD,
    });

    if (error) {
      results.push({ name: "GM Login", ok: false, error: error.message });
      console.log("   ❌", error.message);
    } else if (data.session) {
      results.push({ name: "GM Login", ok: true });
      console.log("   ✅ OK (user id:", data.user?.id?.slice(0, 8) + "...)");
    } else {
      results.push({ name: "GM Login", ok: false, error: "No session" });
      console.log("   ❌ No session");
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: "GM Login", ok: false, error: msg });
    console.log("   ❌", msg);
  }

  // Summary
  console.log("\n" + "─".repeat(50));
  const passed = results.filter((r) => r.ok).length;
  const total = results.length;
  console.log(`\n📊 ${passed}/${total} tests passed\n`);

  if (passed < total) {
    results.filter((r) => !r.ok).forEach((r) => console.log("  -", r.name, ":", r.error));
    process.exit(1);
  }
}

runTests();
