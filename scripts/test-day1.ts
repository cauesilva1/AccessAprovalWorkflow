/**
 * Testes do Dia 1 - Internal Approval Workflow
 *
 * Valida os 3 pilares do Dia 1:
 * 1. Conexão com banco Supabase
 * 2. Migrações/sincronização do schema
 * 3. Chamadas reais à API (POST e GET /api/requests)
 *
 * Pré-requisito: DATABASE_URL configurada no .env
 * Execute: npm run test:day1
 */

import "dotenv/config";
import { execSync } from "node:child_process";
import { prisma } from "../src/lib/prisma";

// Verifica se DATABASE_URL está configurada (não é placeholder)
const dbUrl = process.env.DATABASE_URL ?? "";
if (
  !dbUrl ||
  dbUrl.includes("[YOUR-PASSWORD]") ||
  dbUrl.includes("[PROJECT-REF]")
) {
  console.error("\n❌ DATABASE_URL não configurada ou ainda é placeholder.");
  console.error("   Configure seu .env com a connection string do Supabase.");
  console.error("   Supabase Dashboard > Project Settings > Database\n");
  process.exit(1);
}

async function runTests() {
  const results: { name: string; ok: boolean; error?: string }[] = [];

  console.log("\n🧪 Testes do Dia 1 - Internal Approval Workflow\n");
  console.log("─".repeat(50));

  // ─── 1. Schema / Migrações ───────────────────────────────────────
  console.log("\n1️⃣  Sincronização do schema (prisma db push)...");
  try {
    execSync("npx prisma db push", {
      stdio: "pipe",
      encoding: "utf-8",
    });
    results.push({ name: "Schema sincronizado (db push)", ok: true });
    console.log("   ✅ OK");
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : String(err);
    results.push({ name: "Schema sincronizado (db push)", ok: false, error: msg });
    console.log("   ❌ ERRO:", msg.split("\n").slice(-3).join("\n"));
  }

  // ─── 2. Conexão com o banco ──────────────────────────────────────
  console.log("\n2️⃣  Conexão com banco Supabase...");
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.push({ name: "Conexão com banco", ok: true });
    console.log("   ✅ OK");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: "Conexão com banco", ok: false, error: msg });
    console.log("   ❌ ERRO:", msg);
  }

  // ─── 3. API - POST e GET ─────────────────────────────────────────
  // Tenta chamar a API via fetch (servidor precisa estar rodando)
  // OU chama os handlers diretamente
  console.log("\n3️⃣  Chamadas à API (POST e GET /api/requests)...");
  try {
    const { GET, POST } = await import("../src/app/api/requests/route");

    // POST - criar solicitação
    const postRequest = new Request("http://localhost/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Teste Dia 1 - Equipamento",
        description: "Solicitação de notebook para trabalho remoto. Teste automatizado.",
      }),
    });
    const postResponse = await POST(postRequest as Parameters<typeof POST>[0]);
    const postData = await postResponse.json();

    if (!postResponse.ok) {
      throw new Error(`POST falhou: ${postResponse.status} - ${JSON.stringify(postData)}`);
    }
    if (!postData?.id || !postData?.title) {
      throw new Error(`POST retornou dados inválidos: ${JSON.stringify(postData)}`);
    }

    results.push({ name: "POST /api/requests", ok: true });
    console.log("   ✅ POST OK (id:", postData.id, ")");

    // GET - listar solicitações
    const getResponse = await GET();
    const getData = await getResponse.json();

    if (!getResponse.ok) {
      throw new Error(`GET falhou: ${getResponse.status}`);
    }
    if (!Array.isArray(getData)) {
      throw new Error(`GET não retornou array: ${typeof getData}`);
    }
    const found = getData.find((r: { id: string }) => r.id === postData.id);
    if (!found) {
      throw new Error(`Solicitação criada não encontrada no GET`);
    }

    results.push({ name: "GET /api/requests", ok: true });
    console.log("   ✅ GET OK (", getData.length, "solicitações)");

    // Validação extra - POST com dados inválidos (400)
    const badPostRequest = new Request("http://localhost/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Só título" }), // falta description
    });
    const badPostResponse = await POST(badPostRequest as Parameters<typeof POST>[0]);
    if (badPostResponse.status !== 400) {
      results.push({
        name: "POST validação (400 sem description)",
        ok: false,
        error: `Esperava 400, recebeu ${badPostResponse.status}`,
      });
      console.log("   ⚠️  Validação 400: esperado, mas recebeu", badPostResponse.status);
    } else {
      results.push({ name: "POST validação (400 sem description)", ok: true });
      console.log("   ✅ Validação 400 OK");
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: "Chamadas à API", ok: false, error: msg });
    console.log("   ❌ ERRO:", msg);
  }

  // ─── Resumo ──────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(50));
  const passed = results.filter((r) => r.ok).length;
  const total = results.length;
  console.log(`\n📊 Resultado: ${passed}/${total} testes passaram\n`);

  if (passed < total) {
    console.log("Falhas:");
    results
      .filter((r) => !r.ok)
      .forEach((r) => console.log(`  - ${r.name}: ${r.error ?? "erro"}`));
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
