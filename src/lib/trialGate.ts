// src/lib/trialGate.ts
//
// 🔒 Controle do período gratuito de uso do app (preparação para a venda).
//
// Hoje o app ainda não tem contas/login — por isso a trava abaixo fica
// sempre DESLIGADA (isTrialExpired() sempre retorna false) e ninguém é
// bloqueado. O contador de 7 dias só passa a valer de verdade quando o
// sistema de login/senha for implementado: nesse momento, troque a lógica
// de isTrialExpired() para calcular a diferença entre hoje e a data de
// criação da conta autenticada (ex.: supabase.auth.getUser() -> created_at)
// e retornar true depois de TRIAL_FREE_DAYS dias corridos.
//
// Todos os pontos do app que precisam respeitar o período gratuito (botões
// de período do Dashboard, Plano de Prevenção, 4º/5º e 8º/9º Passo) já
// chamam isTrialExpired() / TRIAL_EXPIRED_MESSAGE daqui — quando a trava for
// ligada de verdade, ela passa a valer em todos esses lugares de uma vez.

export const TRIAL_FREE_DAYS = 7;

export const TRIAL_EXPIRED_MESSAGE = "Seu período gratuito expirou.";

export function isTrialExpired(): boolean {
  // TODO(login): quando existir autenticação, calcular a partir da data de
  // criação da conta do usuário logado. Ex.:
  //   const criadaEm = new Date(user.created_at);
  //   const dias = (Date.now() - criadaEm.getTime()) / 86_400_000;
  //   return dias > TRIAL_FREE_DAYS;
  return false;
}
