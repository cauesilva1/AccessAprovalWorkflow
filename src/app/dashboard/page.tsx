import { Suspense } from "react";
import { cookies } from "next/headers";
import { DashboardWithModal } from "@/components/DashboardWithModal";
import type { RequestItem } from "@/types/request";

async function getRequests(): Promise<RequestItem[]> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const cookieStore = await cookies();
  const res = await fetch(`${base}/api/requests`, {
    cache: "no-store",
    headers: {
      Cookie: cookieStore.toString(),
    },
  });
  if (!res.ok) throw new Error("Failed to fetch requests");
  return res.json();
}

export default async function DashboardPage() {
  let requests: RequestItem[] = [];
  let error: string | null = null;

  try {
    requests = await getRequests();
  } catch (e) {
    error = "Failed to load requests.";
  }

  return (
    <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
      <DashboardWithModal requests={requests} error={error} />
    </Suspense>
  );
}
