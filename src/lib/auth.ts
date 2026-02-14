import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type UserProfile = {
  id: string;
  auth_user_id: string;
  email: string;
  name: string | null;
  role_id: string;
  sector_id: string;
  role: { name: string; hierarchy_level: number };
  sector: { name: string };
};

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  let profile = await prisma.user.findUnique({
    where: { auth_user_id: authUser.id },
    include: { role: true, sector: true },
  });

  if (!profile) {
    const metadata = authUser.user_metadata as {
      role_id?: string;
      sector_id?: string;
      name?: string;
    };

    const roleId = metadata?.role_id;
    const sectorId = metadata?.sector_id;

    if (!roleId || !sectorId) {
      return null;
    }

    profile = await prisma.user.create({
      data: {
        auth_user_id: authUser.id,
        email: authUser.email!,
        name: metadata?.name ?? authUser.email?.split("@")[0],
        role_id: roleId,
        sector_id: sectorId,
      },
      include: { role: true, sector: true },
    });
  }

  return profile as UserProfile;
}
