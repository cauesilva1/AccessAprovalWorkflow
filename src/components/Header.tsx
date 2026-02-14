import Link from "next/link";
import { HeaderAuth } from "./HeaderAuth";

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
        <HeaderAuth />
      </div>
    </header>
  );
}
