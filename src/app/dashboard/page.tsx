import { Suspense } from "react";
import { cookies } from "next/headers";
import { DashboardWithModal } from "@/components/DashboardWithModal";
import type { RequestItem } from "@/types/request";

const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function getRequests(): Promise<RequestItem[]> {
  const cookieStore = await cookies();
  const res = await fetch(`${base}/api/requests`, {
    cache: "no-store",
    headers: { Cookie: cookieStore.toString() },
  });
  if (!res.ok) throw new Error("Failed to fetch requests");
  return res.json();
}

async function getMe(): Promise<{ role: { hierarchy_level: number } } | null> {
  const cookieStore = await cookies();
  const res = await fetch(`${base}/api/me`, {
    cache: "no-store",
    headers: { Cookie: cookieStore.toString() },
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function DashboardPage() {
  let requests: RequestItem[] = [];
  let error: string | null = null;
  let groupBySector = false;

  try {
    const [requestsData, me] = await Promise.all([getRequests(), getMe()]);
    requests = requestsData;
    groupBySector = me?.role?.hierarchy_level === 4;
  } catch (e) {
    error = "Failed to load requests.";
  }

  return (
    <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
      <DashboardWithModal
        requests={requests}
        error={error}
        groupBySector={groupBySector}
      />
    </Suspense>
  );
}
