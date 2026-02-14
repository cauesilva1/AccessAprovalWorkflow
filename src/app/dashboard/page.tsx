import { Suspense } from "react";
import { DashboardWithModal } from "@/components/DashboardWithModal";
import type { RequestItem } from "@/types/request";

async function getRequests(): Promise<RequestItem[]> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/requests`, {
    cache: "no-store",
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
    error = "Não foi possível carregar as solicitações.";
  }

  return (
    <Suspense fallback={<div className="animate-pulse">Carregando...</div>}>
      <DashboardWithModal requests={requests} error={error} />
    </Suspense>
  );
}
