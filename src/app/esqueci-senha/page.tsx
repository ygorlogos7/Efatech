"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data?.error || "Nao foi possivel enviar a solicitacao.");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg-page)] p-4">
      <div className="w-full max-w-md rounded-[15px] bg-white p-8 shadow-[0_10px_30px_rgba(46,150,95,0.1)]">
        <h1 className="mb-2 text-center text-2xl font-semibold text-[var(--color-text-dark)]">
          Esqueci minha senha
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Informe seu e-mail para receber o link de redefinicao.
        </p>

        {success && (
          <div className="mb-4 space-y-3 rounded-md bg-green-100 p-3 text-sm text-green-700">
            <p>Se o e-mail existir, o link de redefinicao foi enviado.</p>
            <p className="text-xs text-green-800">
              Confira a caixa de entrada e o spam. O link vale 15 minutos e so pode ser usado uma vez.
            </p>
            <Link href="/login" className="inline-block font-bold text-[var(--color-primary-green)] hover:underline">
              Ir para o login
            </Link>
          </div>
        )}

        {error && (
          <p className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@empresa.com"
              className="w-full rounded-[10px] border border-[var(--color-border-color)] bg-[#fcfcfc] px-4 py-3 text-black focus:outline-none focus:border-[var(--color-primary-green)]"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[30px] bg-[var(--color-primary-green)] p-3 font-bold text-white transition-colors hover:bg-[var(--color-hover-green)] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? "Enviando..." : "Enviar link"}
            </button>
          </form>
        )}

        <div className="mt-5 text-center">
          <Link href="/login" className="text-sm text-gray-500 hover:text-[var(--color-primary-green)] hover:underline">
            Voltar para login
          </Link>
        </div>
      </div>
    </main>
  );
}
