import { NextResponse } from "next/server";
import { getUserProfile } from "@/lib/auth";

export async function GET() {
  const profile = await getUserProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    sector: profile.sector,
  });
}
