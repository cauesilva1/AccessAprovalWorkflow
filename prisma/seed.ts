import "dotenv/config";
import { resolve } from "path";
// Ensure .env is loaded from project root
import { config } from "dotenv";
config({ path: resolve(process.cwd(), ".env") });
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { createAdminClient } from "../src/lib/supabase/admin";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const GM_EMAIL = process.env.GM_EMAIL ?? "gm@company.com";
const GM_PASSWORD = process.env.GM_PASSWORD ?? "ChangeMe123!";

async function main() {
  const sector = await prisma.sector.upsert({
    where: { name: "General" },
    update: {},
    create: { name: "General" },
  });

  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: "employee" },
      update: {},
      create: { name: "employee", hierarchy_level: 1 },
    }),
    prisma.role.upsert({
      where: { name: "supervisor" },
      update: {},
      create: { name: "supervisor", hierarchy_level: 2 },
    }),
    prisma.role.upsert({
      where: { name: "manager" },
      update: {},
      create: { name: "manager", hierarchy_level: 3 },
    }),
    prisma.role.upsert({
      where: { name: "general_manager" },
      update: {},
      create: { name: "general_manager", hierarchy_level: 4 },
    }),
  ]);

  const gmRole = roles.find((r) => r.name === "general_manager")!;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.log("Skipping GM creation: add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env");
    console.log("Then run: npm run db:seed");
    return;
  }

  const admin = createAdminClient();
  const { data: authUser, error } = await admin.auth.admin.createUser({
    email: GM_EMAIL,
    password: GM_PASSWORD,
    email_confirm: true,
  });

  if (error) {
    if (error.message.includes("already been registered")) {
      const existing = await admin.auth.admin.listUsers();
      const gm = existing.data.users.find((u) => u.email === GM_EMAIL);
      if (gm) {
        await prisma.user.upsert({
          where: { auth_user_id: gm.id },
          update: {},
          create: {
            auth_user_id: gm.id,
            email: GM_EMAIL,
            name: "General Manager",
            role_id: gmRole.id,
            sector_id: sector.id,
          },
        });
        console.log("GM user profile updated");
      }
    } else {
      throw error;
    }
  } else if (authUser.user) {
    await prisma.user.upsert({
      where: { auth_user_id: authUser.user.id },
      update: {},
      create: {
        auth_user_id: authUser.user.id,
        email: GM_EMAIL,
        name: "General Manager",
        role_id: gmRole.id,
        sector_id: sector.id,
      },
    });
    console.log("GM created:", GM_EMAIL);
  }

  console.log("Seed complete. Roles:", roles.map((r) => r.name).join(", "));
  console.log("Sector:", sector.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
