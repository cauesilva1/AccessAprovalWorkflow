"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { NewRequestModal } from "./NewRequestModal";
import type { RequestItem } from "@/types/request";

interface DashboardWithModalProps {
  requests: RequestItem[];
  error: string | null;
  groupBySector?: boolean;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
  };
  const labels: Record<string, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        styles[status] ?? "bg-zinc-100 text-zinc-700"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}

function RequestList({
  requests,
  StatusBadge,
}: {
  requests: RequestItem[];
  StatusBadge: React.FC<{ status: string }>;
}) {
  return (
    <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
      {requests.map((req) => (
        <li key={req.id}>
          <Link
            href={`/requests/${req.id}`}
            className="block p-4 hover:bg-zinc-50"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="font-medium text-zinc-900">{req.title}</h2>
                {req.requester && (
                  <p className="text-xs text-zinc-500">
                    {req.requester.email} · {req.requester.role.name} ·{" "}
                    {req.requester.sector.name}
                  </p>
                )}
                {req.ai_summary ? (
                  <p className="mt-1 rounded bg-amber-50 px-2 py-1 text-sm text-amber-900">
                    {req.ai_summary}
                  </p>
                ) : (
                  <p className="mt-1 text-sm italic text-zinc-400">No summary</p>
                )}
              </div>
              <StatusBadge status={req.status} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function RequestListBySector({
  requests,
  StatusBadge,
}: {
  requests: RequestItem[];
  StatusBadge: React.FC<{ status: string }>;
}) {
  const bySector = requests.reduce<Record<string, RequestItem[]>>((acc, req) => {
    const sector = req.requester?.sector?.name ?? "No sector";
    if (!acc[sector]) acc[sector] = [];
    acc[sector].push(req);
    return acc;
  }, {});

  const sectors = Object.keys(bySector).sort();

  return (
    <div className="space-y-8">
      {sectors.map((sector) => (
        <section key={sector}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {sector}
          </h2>
          <RequestList requests={bySector[sector]} StatusBadge={StatusBadge} />
        </section>
      ))}
    </div>
  );
}

export function DashboardWithModal({
  requests,
  error,
  groupBySector = false,
}: DashboardWithModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showModal = searchParams.get("open") === "new";

  const openModal = useCallback(() => {
    router.push("/dashboard?open=new");
  }, [router]);

  const closeModal = useCallback(() => {
    router.push("/dashboard");
    router.refresh();
  }, [router]);

  return (
    <>
      <div>
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
          <button
            type="button"
            onClick={openModal}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            New Request
          </button>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-12 text-center text-zinc-600">
            No requests yet.{" "}
            <button
              type="button"
              onClick={openModal}
              className="font-medium text-zinc-900 underline hover:no-underline"
            >
              Create the first one
            </button>
          </div>
        ) : groupBySector ? (
          <RequestListBySector requests={requests} StatusBadge={StatusBadge} />
        ) : (
          <RequestList requests={requests} StatusBadge={StatusBadge} />
        )}
      </div>

      <NewRequestModal open={showModal} onClose={closeModal} />
    </>
  );
}
