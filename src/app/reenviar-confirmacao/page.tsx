"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Info } from "lucide-react";

type ApiResponse = {
  success: boolean;
  error?: string;
  message?: string;
  pending?: boolean;
  alreadyVerified?: boolean;
  emailSent?: boolean;
  verifyLink?: string;
  mailError?: string;
};

export default function ReenviarConfirmacaoPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data: ApiResponse = await res.json();

      if (!res.ok) {
        setError(data.error || "Nao foi possivel reenviar.");
        return;
      }

      setResult(data);
    } catch {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen m-0 p-0 font-sans bg-[var(--color-bg-page)]">
      <div className="w-full max-w-[440px] p-2.5">
        <div className="text-center mb-1.5 flex justify-center">
          <Image
            src="/images/logo_efatech.png"
            alt="Efatech"
            width={280}
            height={85}
            priority
            className="w-[280px] h-auto max-w-full"
          />
        </div>

        <div className="bg-white pt-[25px] px-[40px] pb-[40px] rounded-[15px] shadow-[0_10px_30px_rgba(46,150,95,0.1)]">
          <h2 className="text-center text-[var(--color-text-dark)] text-[22px] font-semibold mb-[25px]">
            Reenviar confirmacao
          </h2>

          {result?.success && (
            <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4 text-sm space-y-2">
              <p className="flex items-center gap-2 font-medium">
                <CheckCircle2 size={16} />
                {result.message ??
                  "Se o e-mail estiver cadastrado e pendente, enviamos um novo link."}
              </p>
              {result.verifyLink && !result.emailSent && (
                <>
                  <p className="text-xs text-amber-900">
                    O e-mail nao chegou? Use este atalho so em desenvolvimento:
                  </p>
                  <a
                    href={result.verifyLink}
                    className="block break-all font-bold text-[var(--color-primary-green)] hover:underline"
                  >
                    Confirmar sem abrir o e-mail (dev)
                  </a>
                </>
              )}
              {result.mailError && (
                <p className="text-xs text-amber-900">
                  Resend: {result.mailError}
                </p>
              )}
              {result.alreadyVerified && (
                <Link href="/login" className="underline font-semibold">
                  Ir para o login
                </Link>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 flex items-center gap-2 text-sm">
              <Info size={16} /> {error}
            </div>
          )}

          {!result?.success && (
            <form onSubmit={handleSubmit}>
              <div className="mb-[15px] text-left">
                <label className="block text-[14px] text-[var(--color-text-gray)] mb-[5px]">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full py-[12px] px-[16px] border border-[var(--color-border-color)] rounded-[10px] text-[15px] text-black bg-[#fcfcfc] focus:outline-none focus:border-[var(--color-primary-green)]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full text-white p-[14px] rounded-[30px] text-[16px] font-bold ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[var(--color-primary-green)] hover:bg-[var(--color-hover-green)]"
                }`}
              >
                {isLoading ? "Enviando..." : "Reenviar link"}
              </button>
            </form>
          )}

          <div className="text-center mt-6">
            <Link
              href="/login"
              className="text-[13px] text-gray-500 hover:text-[var(--color-primary-green)] hover:underline"
            >
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
