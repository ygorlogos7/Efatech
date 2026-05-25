"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Info, CheckCircle2 } from "lucide-react";
import { registerUser } from "@/actions/auth";

export default function CadastroPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [celular, setCelular] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [devVerifyLink, setDevVerifyLink] = useState<string | null>(null);

  // States for password rules
  const [ruleLength, setRuleLength] = useState(false);
  const [ruleUpperLowerCase, setRuleUpperLowerCase] = useState(false);
  const [ruleNumber, setRuleNumber] = useState(false);
  const [ruleSpecial, setRuleSpecial] = useState(false);

  useEffect(() => {
    setRuleLength(senha.length >= 8);
    setRuleUpperLowerCase(/[A-Z]/.test(senha) && /[a-z]/.test(senha));
    setRuleNumber(/[0-9]/.test(senha));
    setRuleSpecial(/[!@#$%^&*()]/.test(senha));
  }, [senha]);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    const validationResponse = await fetch("/api/auth/validate-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, telefone, email, senha }),
    });

    if (!validationResponse.ok) {
      const validationData = await validationResponse.json();
      setError(validationData?.error || "Dados de cadastro invalidos.");
      setFieldErrors(validationData?.fieldErrors || {});
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("telefone", telefone);
    formData.append("celular", celular);
    formData.append("email", email);
    formData.append("senha", senha);

    const result = await registerUser(formData);

    setIsLoading(false);

    if (result.success) {
      setRegisteredEmail(email);
      setDevVerifyLink(result.verifyLink ?? null);
      setSuccess(true);
    } else {
      setError(result.error || "Ocorreu um erro ao cadastrar.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen m-0 py-8 px-0 font-sans bg-[var(--color-bg-page)]">
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
            Crie sua conta gratuita
          </h2>

          {success && (
            <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4 text-sm font-medium space-y-2">
              <p className="flex items-center gap-2">
                <CheckCircle2 size={16} /> Conta criada!
              </p>
              <p>
                {devVerifyLink ? (
                  <>
                    O e-mail pode nao ter sido entregue (Resend). Use o link abaixo
                    para confirmar:
                  </>
                ) : (
                  <>
                    Enviamos um link de confirmacao para{" "}
                    <strong>{registeredEmail}</strong>. Confirme o e-mail antes de
                    entrar (verifique spam).
                  </>
                )}
              </p>
              {devVerifyLink && (
                <a
                  href={devVerifyLink}
                  className="block break-all text-[var(--color-primary-green)] font-bold hover:underline"
                >
                  Confirmar e-mail agora
                </a>
              )}
              <p className="text-xs text-green-900/80">
                Nao recebeu?{" "}
                <Link href="/reenviar-confirmacao" className="underline font-semibold">
                  Reenviar confirmacao
                </Link>
              </p>
              <Link
                href="/login"
                className="inline-block text-[var(--color-primary-green)] font-bold hover:underline"
              >
                Ir para o login
              </Link>
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 flex items-center gap-2 text-sm font-medium">
              <Info size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleCadastro} className={success ? "hidden" : ""}>
            <div className="mb-[15px] text-left">
              <label className="block text-[14px] text-[var(--color-text-gray)] mb-[5px]">
                Nome completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Seu nome completo"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full py-[12px] px-[16px] border border-[var(--color-border-color)] rounded-[10px] text-[15px] text-black bg-[#fcfcfc] focus:outline-none focus:border-[var(--color-primary-green)] transition-colors"
              />
              {fieldErrors.nome && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.nome}</p>
              )}
            </div>

            <div className="flex flex-wrap -mx-2 mb-[15px]">
              <div className="w-full md:w-1/2 px-2 mb-3 md:mb-0">
                <label className="block text-[14px] text-[var(--color-text-gray)] mb-[5px]">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="(00) 0000-0000"
                  required
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full py-[12px] px-[16px] border border-[var(--color-border-color)] rounded-[10px] text-[15px] text-black bg-[#fcfcfc] focus:outline-none focus:border-[var(--color-primary-green)] transition-colors"
                />
                {fieldErrors.telefone && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.telefone}</p>
                )}
              </div>
              <div className="w-full md:w-1/2 px-2">
                <label className="block text-[14px] text-[var(--color-text-gray)] mb-[5px]">
                  Whatsapp (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="(00) 90000-0000"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  className="w-full py-[12px] px-[16px] border border-[var(--color-border-color)] rounded-[10px] text-[15px] text-black bg-[#fcfcfc] focus:outline-none focus:border-[var(--color-primary-green)] transition-colors"
                />
              </div>
            </div>

            <div className="mb-[15px] text-left">
              <label className="block text-[14px] text-[var(--color-text-gray)] mb-[5px]">
                E-mail <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="exemplo@efatech.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-[12px] px-[16px] border border-[var(--color-border-color)] rounded-[10px] text-[15px] text-black bg-[#fcfcfc] focus:outline-none focus:border-[var(--color-primary-green)] transition-colors"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.email}{" "}
                  {fieldErrors.email.includes("pendente") && (
                    <Link
                      href="/reenviar-confirmacao"
                      className="text-[var(--color-primary-green)] underline"
                    >
                      Reenviar link
                    </Link>
                  )}
                </p>
              )}
            </div>

            <div className="mb-[10px] text-left">
              <label className="block text-[14px] text-[var(--color-text-gray)] mb-[5px]">
                Senha <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Crie uma senha forte"
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
              {fieldErrors.senha && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.senha}</p>
              )}
            </div>

            <div className="text-left mt-[10px] mb-6">
              <p
                className={`text-xs mb-1 transition-colors flex items-center gap-1.5 ${ruleLength ? "text-[var(--color-primary-green)]" : "text-[var(--color-text-gray)]"
                  }`}
              >
                <Info size={12} /> 8 caracteres ou mais
              </p>
              <p
                className={`text-xs mb-1 transition-colors flex items-center gap-1.5 ${ruleUpperLowerCase
                  ? "text-[var(--color-primary-green)]"
                  : "text-[var(--color-text-gray)]"
                  }`}
              >
                <Info size={12} /> Letras maiúsculas e minúsculas
              </p>
              <p 
                className={`text-xs mb-1 transition-colors flex items-center gap-1.5 ${ruleNumber ? "text-[var(--color-primary-green)]" : "text-[var(--color-text-gray)]"
                  }`}
              >
                <Info size={12} /> Pelo menos um número
              </p>
              <p
                className={`text-xs transition-colors flex items-center gap-1.5 ${ruleSpecial ? "text-[var(--color-primary-green)]" : "text-[var(--color-text-gray)]"
                  }`}
              >
                <Info size={12} /> Pelo menos um caractere especial
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white p-[14px] border-none rounded-[30px] text-[16px] font-bold cursor-pointer mt-[10px] transition-colors ${isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[var(--color-primary-green)] hover:bg-[var(--color-hover-green)]"
                }`}
            >
              {isLoading ? "Processando..." : "Cadastrar"}
            </button>
          </form>

          <div className="text-center my-[20px] relative text-[#999] text-[13px] before:content-[''] before:absolute before:top-1/2 before:left-0 before:right-0 before:h-[1px] before:bg-[#eee] before:z-0">
            <span className="bg-white px-[15px] relative z-10">
              Ou cadastrar via
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

          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              Já tem uma conta?{" "}
              <Link
                href="/login"
                className="text-[var(--color-primary-green)] font-bold hover:underline"
              >
                Acessar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
