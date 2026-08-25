// src/lib/authContext.tsx
//
// 🔐 Contexto de autenticação do app — usa o Supabase Auth (e-mail/senha) já
// disponível neste projeto Supabase. Envolve o app inteiro: enquanto não há
// sessão, o usuário só consegue ver a tela de login/cadastro (veja App.tsx).
//
// `user.created_at` (data de criação da conta) é o que alimenta o período
// gratuito de 7 dias em src/lib/trialGate.ts.
//
// `recoveryMode` fica true quando o usuário chegou aqui pelo link de
// "Esqueci minha senha" (o Supabase cria uma sessão temporária de
// recuperação e dispara o evento PASSWORD_RECOVERY). Enquanto for true,
// App.tsx mostra a tela de redefinir senha em vez do app normal, mesmo
// já existindo uma "sessão" — porque essa sessão é só para trocar a senha.

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  recoveryMode: boolean;
  clearRecoveryMode: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === "PASSWORD_RECOVERY") setRecoveryMode(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signOut() {
    setRecoveryMode(false);
    await supabase.auth.signOut();
  }

  function clearRecoveryMode() {
    setRecoveryMode(false);
  }

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, loading, recoveryMode, clearRecoveryMode, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return ctx;
}
