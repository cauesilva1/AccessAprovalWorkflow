"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface NewRequestModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewRequestModal({ open, onClose }: NewRequestModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao criar solicitação");
        return;
      }

      setTitle("");
      setDescription("");
      onClose();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="flex h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="text-xl font-bold text-zinc-900">Nova Solicitação</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Fechar"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-6 overflow-y-auto p-6"
        >
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="modal-title"
              className="mb-1 block text-sm font-medium text-zinc-700"
            >
              Título
            </label>
            <input
              id="modal-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              placeholder="Ex: Solicitação de notebook"
            />
          </div>

          <div className="flex-1">
            <label
              htmlFor="modal-description"
              className="mb-1 block text-sm font-medium text-zinc-700"
            >
              Descrição
            </label>
            <textarea
              id="modal-description"
              required
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-full min-h-[200px] w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              placeholder="Descreva sua solicitação..."
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-zinc-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
