"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Info } from "lucide-react";
import { loginAction } from "@/actions/auth";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("senha", senha);

    try {
      const response = await loginAction(formData);
      if (response && response.success === false) {
        setError(response.error || "Erro desconhecido");
        setIsLoading(false);
      }
    } catch (e) {
      // Se for NEXT_REDIRECT, o redirect foi feito com sucesso
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
            className="w-[280px] h-auto max-w-full mt-0"
          />
        </div>

        <div className="bg-white pt-[25px] px-[40px] pb-[40px] rounded-[15px] shadow-[0_10px_30px_rgba(46,150,95,0.1)]">
          <h2 className="text-center text-[var(--color-text-dark)] text-[22px] font-semibold mb-[25px]">
            Acesse sua conta
          </h2>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 flex items-center gap-2">
              <Info size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-[15px] text-left">
              <label className="block text-[14px] text-[var(--color-text-gray)] mb-[5px]">
                E-mail ou usuário
              </label>
              <input
                type="email"
                name="email"
                placeholder="Insira seu e-mail de acesso"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-[12px] px-[16px] border border-[var(--color-border-color)] rounded-[10px] text-[15px] text-black bg-[#fcfcfc] focus:outline-none focus:border-[var(--color-primary-green)] transition-colors"
              />
            </div>

            <div className="mb-[15px] text-left">
              <label className="block text-[14px] text-[var(--color-text-gray)] mb-[5px]">
                Senha
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  name="senha"
                  placeholder="Insira sua senha"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full py-[12px] pl-[16px] pr-[45px] border border-[var(--color-border-color)] rounded-[10px] text-[15px] text-black bg-[#fcfcfc] focus:outline-none focus:border-[var(--color-primary-green)] transition-colors z-[1]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-[15px] z-10 p-[10px] text-[#95a5a6] focus:outline-none hover:text-[var(--color-primary-green)] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff size={18} className="text-[var(--color-primary-green)]" />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end mb-2">
              <Link href="#" className="flex justify-end text-[12px] text-gray-500 hover:text-[var(--color-primary-green)] hover:underline">
                Esqueci minha senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white p-[14px] border-none rounded-[30px] text-[16px] font-bold cursor-pointer mt-[10px] transition-colors ${isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[var(--color-primary-green)] hover:bg-[var(--color-hover-green)]"
                }`}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="text-center my-[20px] relative text-[#999] text-[13px] before:content-[''] before:absolute before:top-1/2 before:left-0 before:right-0 before:h-[1px] before:bg-[#eee] before:z-0">
            <span className="bg-white px-[15px] relative z-10">
              Ou acesse via
            </span>
          </div>

          <div className="flex justify-center flex-col gap-3">
            {/* Mockup do form do google - Apenas visual conforme o plano */}
            <button className="flex items-center justify-center gap-3 w-full bg-white border border-[#dadce0] text-[#3c4043] rounded-full py-[10px] px-[16px] font-medium hover:bg-[#f8f9fa] shadow-sm transition-all focus:outline-none ring-offset-1 focus:ring-2 focus:ring-[#4285f4]">
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Continuar com o Google
            </button>
          </div>

          <div className="text-center mt-[15px]">
            <Link
              href="/cadastro"
              className="text-[13px] text-gray-500 hover:text-[var(--color-primary-green)] hover:underline"
            >
              Ainda não tenho conta? Cadastrar-se!
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
