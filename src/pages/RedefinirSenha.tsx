// src/pages/RedefinirSenha.tsx
//
// 🔑 Tela de redefinição de senha. Só aparece quando o usuário chega pelo
// link de "Esqueci minha senha" enviado por e-mail (veja authContext.tsx —
// recoveryMode). Depois de definir a nova senha, ele já fica logado
// normalmente e é levado para a tela inicial.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/authContext";

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clearRecoveryMode } = useAuth();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (novaSenha.length < 6) {
      toast({ title: "A senha precisa ter pelo menos 6 caracteres.", duration: 3000 });
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast({ title: "As senhas não coincidem.", duration: 3000 });
      return;
    }

    setEnviando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) throw error;
      toast({ title: "✅ Senha redefinida com sucesso!", duration: 4000 });
      clearRecoveryMode();
      navigate("/");
    } catch (err: any) {
      toast({
        title: "Ops",
        description: err?.message || "Não foi possível redefinir a senha. Tente novamente.",
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
            <KeyRound className="h-6 w-6" style={{ color: "var(--aurora-primary-foreground)" }} />
          </span>
          <h1 className="aurora-font-display aurora-text-glow text-xl font-bold">Nova senha</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--aurora-muted-foreground)" }}>
            Escolha uma nova senha para sua conta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Nova senha</label>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                autoComplete="new-password"
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
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Confirmar nova senha</label>
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

          <Button type="submit" disabled={enviando} className="w-full py-2.5 rounded-lg font-semibold">
            {enviando ? "Aguarde..." : "Redefinir senha"}
          </Button>
        </form>
      </div>
    </div>
  );
}
