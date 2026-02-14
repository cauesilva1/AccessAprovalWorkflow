import { getUserProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { InviteForm } from "./InviteForm";

export default async function AdminPage() {
  const profile = await getUserProfile();
  if (!profile) redirect("/login");
  if (profile.role.hierarchy_level !== 4) {
    redirect("/dashboard");
  }

  const [roles, sectors, users] = await Promise.all([
    prisma.role.findMany({ orderBy: { hierarchy_level: "asc" } }),
    prisma.sector.findMany(),
    prisma.user.findMany({
      include: { role: true, sector: true },
      orderBy: { email: "asc" },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-zinc-900">Admin</h1>
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-800">Invite user</h2>
          <InviteForm roles={roles} sectors={sectors} />
        </section>
        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-800">Users</h2>
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
            {users.map((u) => (
              <li key={u.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium text-zinc-900">{u.email}</p>
                  <p className="text-sm text-zinc-500">
                    {u.role.name} · {u.sector.name}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
