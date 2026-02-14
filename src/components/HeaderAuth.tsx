import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getUserProfile } from "@/lib/auth";

export async function HeaderAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
      >
        Sign in
      </Link>
    );
  }

  const profile = await getUserProfile();

  return (
    <nav className="flex items-center gap-6">
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
        New Request
      </Link>
      {profile?.role.hierarchy_level === 4 && (
        <Link
          href="/admin"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          Admin
        </Link>
      )}
      <form action="/auth/logout" method="POST">
        <button
          type="submit"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          Sign out
        </button>
      </form>
    </nav>
  );
}
