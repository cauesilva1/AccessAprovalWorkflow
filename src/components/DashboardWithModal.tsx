"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { NewRequestModal } from "./NewRequestModal";
import type { RequestItem } from "@/types/request";

interface DashboardWithModalProps {
  requests: RequestItem[];
  error: string | null;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
  };
  const labels: Record<string, string> = {
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Rejeitado",
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

export function DashboardWithModal({ requests, error }: DashboardWithModalProps) {
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
            Nova Solicitação
          </button>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-12 text-center text-zinc-600">
            Nenhuma solicitação ainda.{" "}
            <button
              type="button"
              onClick={openModal}
              className="font-medium text-zinc-900 underline hover:no-underline"
            >
              Criar a primeira
            </button>
          </div>
        ) : (
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
                      {req.ai_summary ? (
                        <p className="mt-1 rounded bg-amber-50 px-2 py-1 text-sm text-amber-900">
                          {req.ai_summary}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm italic text-zinc-400">Sem resumo</p>
                      )}
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <NewRequestModal open={showModal} onClose={closeModal} />
    </>
  );
}
