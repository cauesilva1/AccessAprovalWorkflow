import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserProfile } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const profile = await getUserProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (profile.role.hierarchy_level !== 4) {
    return NextResponse.json(
      { error: "Only General Manager can invite users" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { email, name, role_id, sector_id } = body;

  if (!email || !role_id || !sector_id) {
    return NextResponse.json(
      { error: "email, role_id, and sector_id are required" },
      { status: 400 }
    );
  }

  try {
    const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const redirectTo = `${origin}/auth/callback`;

    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { role_id, sector_id, name: name ?? email.split("@")[0] },
      redirectTo,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: "Invite sent",
      user_id: data.user?.id,
    });
  } catch (err) {
    console.error("Invite error:", err);
    return NextResponse.json(
      { error: "Failed to send invite" },
      { status: 500 }
    );
  }
}
