"use client";

import { useState } from "react";

interface Role {
  id: string;
  name: string;
  hierarchy_level: number;
}

interface Sector {
  id: string;
  name: string;
}

interface InviteFormProps {
  roles: Role[];
  sectors: Sector[];
}

export function InviteForm({ roles, sectors }: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "");
  const [sectorId, setSectorId] = useState(sectors[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name || undefined,
          role_id: roleId,
          sector_id: sectorId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to send invite" });
        return;
      }

      setMessage({ type: "success", text: "Invite sent to " + email });
      setEmail("");
      setName("");
    } catch {
      setMessage({ type: "error", text: "Request failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      {message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
        />
      </div>

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-zinc-700">
          Name (optional)
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
        />
      </div>

      <div>
        <label htmlFor="role" className="mb-1 block text-sm font-medium text-zinc-700">
          Role
        </label>
        <select
          id="role"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="sector" className="mb-1 block text-sm font-medium text-zinc-700">
          Sector
        </label>
        <select
          id="sector"
          value={sectorId}
          onChange={(e) => setSectorId(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
        >
          {sectors.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send invite"}
      </button>
    </form>
  );
}
