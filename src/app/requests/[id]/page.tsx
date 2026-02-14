import Link from "next/link";
import { notFound } from "next/navigation";
import { RequestActions } from "./RequestActions";

const base =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function getRequest(id: string) {
  const res = await fetch(`${base}/api/requests`, { cache: "no-store" });
  if (!res.ok) return null;
  const requests = await res.json();
  return requests.find((r: { id: string }) => r.id === id) ?? null;
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function RequestDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const req = await getRequest(id);

  if (!req) notFound();

  return (
    <div>
      <Link
        href="/dashboard"
        className="mb-6 inline-block text-sm text-zinc-600 hover:text-zinc-900"
      >
        ← Voltar ao Dashboard
      </Link>

      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-zinc-900">{req.title}</h1>
          <StatusBadge status={req.status} />
        </div>

        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Criado em
        </p>
        <p className="mb-6 text-sm text-zinc-600">{formatDate(req.created_at)}</p>

        {req.ai_summary && (
          <>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Resumo (IA)
            </p>
            <p className="mb-6 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {req.ai_summary}
            </p>
          </>
        )}

        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Descrição
        </p>
        <p className="mb-8 whitespace-pre-wrap text-zinc-700">{req.description}</p>

        <RequestActions id={req.id} status={req.status} />
      </div>
    </div>
  );
}
