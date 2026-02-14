"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface RequestActionsProps {
  id: string;
  status: string;
}

export function RequestActions({ id, status }: RequestActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleStatus(newStatus: "approved" | "rejected") {
    setLoading(newStatus);
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  }

  if (status !== "pending") {
    return null;
  }

  return (
    <div className="flex gap-3 border-t border-zinc-200 pt-6">
      <button
        type="button"
        onClick={() => handleStatus("approved")}
        disabled={!!loading}
        className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading === "approved" ? "Processando..." : "Aprovar"}
      </button>
      <button
        type="button"
        onClick={() => handleStatus("rejected")}
        disabled={!!loading}
        className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        {loading === "rejected" ? "Processando..." : "Rejeitar"}
      </button>
    </div>
  );
}
