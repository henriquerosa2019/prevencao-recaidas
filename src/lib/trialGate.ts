// src/lib/trialGate.ts
//
// 🔒 Controle do período gratuito de uso do app (preparação para a venda).
//
// Agora que existe login (veja src/lib/authContext.tsx), o período gratuito
// é contado a partir de `user.created_at` — a data em que a conta foi
// criada no Supabase Auth. isTrialExpired() é uma função pura (não depende
// de contexto/hooks) para ser fácil de testar e de chamar tanto dentro de
// componentes quanto dentro de handlers de salvar.
//
// Todos os pontos do app que precisam respeitar o período gratuito (botões
// de período do Dashboard, Plano de Prevenção, 4º/5º e 8º/9º Passo) chamam
// isTrialExpired(user?.created_at) daqui.

export const TRIAL_FREE_DAYS = 7;

export const TRIAL_EXPIRED_MESSAGE = "Seu período gratuito expirou.";

export function isTrialExpired(accountCreatedAt: string | null | undefined): boolean {
  if (!accountCreatedAt) return false; // sem conta carregada ainda — não bloqueia
  const criadaEm = new Date(accountCreatedAt).getTime();
  if (Number.isNaN(criadaEm)) return false;
  const diasDesdeOCadastro = (Date.now() - criadaEm) / 86_400_000;
  return diasDesdeOCadastro > TRIAL_FREE_DAYS;
}
