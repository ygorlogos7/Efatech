"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function RedefinirSenhaPage() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!token) {
      setError("Token invalido.");
      return;
    }

    if (senha !== confirmacao) {
      setError("As senhas nao coincidem.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, senha }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || "Nao foi possivel redefinir a senha.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setSenha("");
      setConfirmacao("");
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
          Redefinir senha
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Digite sua nova senha para continuar.
        </p>

        {success && (
          <p className="mb-4 rounded-md bg-green-100 p-3 text-sm text-green-700">
            Senha alterada com sucesso. Voce ja pode fazer login.
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            required
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            placeholder="Nova senha"
            className="w-full rounded-[10px] border border-[var(--color-border-color)] bg-[#fcfcfc] px-4 py-3 text-black focus:outline-none focus:border-[var(--color-primary-green)]"
          />
          <input
            type="password"
            required
            value={confirmacao}
            onChange={(event) => setConfirmacao(event.target.value)}
            placeholder="Confirmar nova senha"
            className="w-full rounded-[10px] border border-[var(--color-border-color)] bg-[#fcfcfc] px-4 py-3 text-black focus:outline-none focus:border-[var(--color-primary-green)]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[30px] bg-[var(--color-primary-green)] p-3 font-bold text-white transition-colors hover:bg-[var(--color-hover-green)] disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link href="/login" className="text-sm text-gray-500 hover:text-[var(--color-primary-green)] hover:underline">
            Ir para login
          </Link>
        </div>
      </div>
    </main>
  );
}
