import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-semibold text-zinc-900 hover:text-zinc-700"
        >
          Approval Workflow
        </Link>
        <nav className="flex gap-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard?open=new"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Nova Solicitação
          </Link>
        </nav>
      </div>
    </header>
  );
}
