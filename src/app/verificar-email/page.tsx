"use client";

import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Info, Loader2 } from "lucide-react";

function VerificarEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Link invalido. Solicite um novo e-mail de confirmacao.");
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          setStatus("error");
          setMessage(data.error || "Nao foi possivel confirmar o e-mail.");
          return;
        }

        setStatus("success");
        setMessage(
          data.alreadyVerified
            ? "Este e-mail ja estava confirmado. Voce ja pode entrar."
            : "E-mail confirmado com sucesso!",
        );
      } catch {
        setStatus("error");
        setMessage("Erro de conexao. Tente novamente.");
      }
    })();
  }, [token]);

  return (
    <div className="bg-white pt-[25px] px-[40px] pb-[40px] rounded-[15px] shadow-[0_10px_30px_rgba(46,150,95,0.1)]">
      <h2 className="text-center text-[var(--color-text-dark)] text-[22px] font-semibold mb-[25px]">
        Confirmacao de e-mail
      </h2>

      {status === "loading" && (
        <div className="flex flex-col items-center gap-3 text-gray-600 py-6">
          <Loader2 className="animate-spin text-[var(--color-primary-green)]" size={32} />
          <p>Validando seu link...</p>
        </div>
      )}

      {status === "success" && (
        <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4 flex items-center gap-2 text-sm">
          <CheckCircle2 size={16} /> {message}
        </div>
      )}

      {status === "error" && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 flex items-center gap-2 text-sm">
          <Info size={16} /> {message}
        </div>
      )}

      <div className="text-center mt-4 flex flex-col gap-2">
        <Link
          href="/login?verified=1"
          className="text-[var(--color-primary-green)] font-bold hover:underline text-sm"
        >
          Ir para o login
        </Link>
        {status === "error" && (
          <Link
            href="/reenviar-confirmacao"
            className="text-gray-500 hover:underline text-xs"
          >
            Reenviar e-mail de confirmacao
          </Link>
        )}
      </div>
    </div>
  );
}

export default function VerificarEmailPage() {
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
        <Suspense
          fallback={
            <div className="bg-white p-10 rounded-[15px] text-center text-gray-500">
              Carregando...
            </div>
          }
        >
          <VerificarEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
