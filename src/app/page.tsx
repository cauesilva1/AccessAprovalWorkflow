import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16 text-center">
      <h1 className="text-3xl font-bold text-zinc-900">
        Internal Approval Workflow
      </h1>
      <p className="max-w-md text-zinc-600">
        Crie solicitações de equipamentos, viagens ou software e acompanhe o
        status das aprovações.
      </p>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Ver Dashboard
        </Link>
        <Link
          href="/dashboard?open=new"
          className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Nova Solicitação
        </Link>
      </div>
    </div>
  );
}
