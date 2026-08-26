// src/pages/Login.tsx
//
// 🔐 Tela de login e cadastro — porta de entrada única do app agora que ele
// exige conta. Usa e-mail/senha via Supabase Auth.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Heart } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [modo, setModo] = useState<"login" | "cadastro" | "recuperar">("login");
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [avisoConfirmacao, setAvisoConfirmacao] = useState(false);
  const [avisoRecuperacao, setAvisoRecuperacao] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !senha) {
      toast({ title: "Preencha e-mail e senha.", duration: 3000 });
      return;
    }
    if (modo === "cadastro" && senha !== confirmarSenha) {
      toast({ title: "As senhas não coincidem.", duration: 3000 });
      return;
    }
    if (modo === "cadastro" && senha.length < 6) {
      toast({ title: "A senha precisa ter pelo menos 6 caracteres.", duration: 3000 });
      return;
    }

    setEnviando(true);
    setAvisoConfirmacao(false);
    try {
      if (modo === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: senha,
        });
        if (error) throw error;
        navigate("/");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: senha,
          options: { data: { full_name: nome.trim() || null } },
        });
        if (error) throw error;

        if (data.session) {
          // Confirmação de e-mail desativada neste projeto — sessão já vem pronta.
          toast({ title: "✅ Conta criada com sucesso!", duration: 4000 });
          navigate("/");
        } else {
          // Confirmação de e-mail exigida — precisa clicar no link recebido antes de entrar.
          setAvisoConfirmacao(true);
        }
      }
    } catch (err: any) {
      const msg = err?.message || "Não foi possível concluir. Tente novamente.";
      const traduzido = msg.includes("Invalid login credentials")
        ? "E-mail ou senha incorretos."
        : msg.includes("already registered") || msg.includes("already exists")
        ? "Este e-mail já tem uma conta — tente entrar em vez de cadastrar."
        : msg;
      toast({ title: "Ops", description: traduzido, duration: 5000 });
    } finally {
      setEnviando(false);
    }
  }

  async function handleRecuperar(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Digite seu e-mail.", duration: 3000 });
      return;
    }
    setEnviando(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/`,
      });
      if (error) throw error;
      setAvisoRecuperacao(true);
    } catch (err: any) {
      toast({
        title: "Ops",
        description: err?.message || "Não foi possível enviar o link. Tente novamente.",
        duration: 5000,
      });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="aurora-shell aurora-grid-noise flex min-h-screen items-center justify-center p-4">
      <div className="aurora-glass-strong w-full max-w-sm rounded-3xl p-6 md:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span
            className="mb-3 grid h-12 w-12 place-items-center rounded-2xl aurora-gradient-bg"
            style={{ boxShadow: "var(--aurora-shadow-glow-strong)" }}
          >
            <Heart className="h-6 w-6" style={{ color: "var(--aurora-primary-foreground)" }} />
          </span>
          <h1 className="aurora-font-display aurora-text-glow text-xl font-bold">
            Prevenção de Recaídas
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--aurora-muted-foreground)" }}>
            {modo === "login"
              ? "Entre na sua conta"
              : modo === "cadastro"
              ? "Crie sua conta gratuita"
              : "Recuperar senha"}
          </p>
        </div>

        {avisoConfirmacao ? (
          <div
            className="rounded-2xl p-4 text-center text-sm"
            style={{ border: "1px solid var(--aurora-border)", color: "var(--aurora-foreground)" }}
          >
            Enviamos um link de confirmação para <strong>{email}</strong>. Abra seu e-mail e
            confirme para poder entrar.
            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  setAvisoConfirmacao(false);
                  setModo("login");
                }}
                className="text-sm font-medium underline"
                style={{ color: "var(--aurora-primary)" }}
              >
                Voltar para o login
              </button>
            </div>
          </div>
        ) : avisoRecuperacao ? (
          <div
            className="rounded-2xl p-4 text-center text-sm"
            style={{ border: "1px solid var(--aurora-border)", color: "var(--aurora-foreground)" }}
          >
            Enviamos um link de redefinição de senha para <strong>{email}</strong>. Abra seu e-mail,
            clique no link e escolha uma nova senha.
            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  setAvisoRecuperacao(false);
                  setModo("login");
                }}
                className="text-sm font-medium underline"
                style={{ color: "var(--aurora-primary)" }}
              >
                Voltar para o login
              </button>
            </div>
          </div>
        ) : modo === "recuperar" ? (
          <form onSubmit={handleRecuperar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="voce@exemplo.com"
                className="w-full rounded-lg border border-border bg-secondary/60 p-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <Button type="submit" disabled={enviando} className="w-full py-2.5 rounded-lg font-semibold">
              {enviando ? "Aguarde..." : "Enviar link de redefinição"}
            </Button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setModo("login")}
                className="font-medium underline"
                style={{ color: "var(--aurora-primary)" }}
              >
                Voltar para o login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {modo === "cadastro" && (
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Como devo te chamar?</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  autoComplete="given-name"
                  placeholder="Seu primeiro nome"
                  className="w-full rounded-lg border border-border bg-secondary/60 p-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="voce@exemplo.com"
                className="w-full rounded-lg border border-border bg-secondary/60 p-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  autoComplete={modo === "login" ? "current-password" : "new-password"}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-secondary/60 p-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute inset-y-0 right-0 flex items-center px-3"
                  style={{ color: "var(--aurora-muted-foreground)" }}
                >
                  {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {modo === "login" && (
                <div className="mt-1.5 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setAvisoRecuperacao(false);
                      setModo("recuperar");
                    }}
                    className="text-xs font-medium underline"
                    style={{ color: "var(--aurora-muted-foreground)" }}
                  >
                    Esqueci minha senha
                  </button>
                </div>
              )}
            </div>

            {modo === "cadastro" && (
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Confirmar senha</label>
                <div className="relative">
                  <input
                    type={mostrarConfirmarSenha ? "text" : "password"}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-border bg-secondary/60 p-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmarSenha((v) => !v)}
                    aria-label={mostrarConfirmarSenha ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute inset-y-0 right-0 flex items-center px-3"
                    style={{ color: "var(--aurora-muted-foreground)" }}
                  >
                    {mostrarConfirmarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <Button type="submit" disabled={enviando} className="w-full py-2.5 rounded-lg font-semibold">
              {enviando ? "Aguarde..." : modo === "login" ? "Entrar" : "Criar conta"}
            </Button>

            {modo === "cadastro" && (
              <p className="text-center text-xs" style={{ color: "var(--aurora-muted-foreground)" }}>
                7 dias grátis para experimentar todo o app.
              </p>
            )}
          </form>
        )}

        {!avisoConfirmacao && !avisoRecuperacao && modo !== "recuperar" && (
          <div className="mt-6 text-center text-sm" style={{ color: "var(--aurora-muted-foreground)" }}>
            {modo === "login" ? (
              <>
                Ainda não tem conta?{" "}
                <button
                  type="button"
                  onClick={() => setModo("cadastro")}
                  className="font-medium underline"
                  style={{ color: "var(--aurora-primary)" }}
                >
                  Criar conta grátis
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button
                  type="button"
                  onClick={() => setModo("login")}
                  className="font-medium underline"
                  style={{ color: "var(--aurora-primary)" }}
                >
                  Entrar
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
