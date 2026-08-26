// src/lib/saudacao.ts
//
// 👋 Mensagem de boas-vindas da tela de Abertura, variando conforme a hora
// do dia. Função pura (não depende de React) para ficar fácil de testar e de
// reaproveitar em qualquer tela.
//
// Faixas definidas pelo Henrique:
//   06:00 – 12:00  → bom dia
//   12:01 – 18:00  → boa tarde
//   18:01 – 00:00  → boa noite
//   00:01 – 05:59  → madrugada

export type Saudacao = { titulo: string; subtitulo: string };

export function montarSaudacao(nome: string, agora: Date = new Date()): Saudacao {
  const h = agora.getHours();
  const m = agora.getMinutes();
  // Minutos desde a meia-noite deixam as bordas (12:00 x 12:01) exatas.
  const minutos = h * 60 + m;

  const DE_6H = 6 * 60;          // 360  → 06:00
  const ATE_12H = 12 * 60;       // 720  → 12:00
  const ATE_18H = 18 * 60;       // 1080 → 18:00

  if (minutos >= DE_6H && minutos <= ATE_12H) {
    return {
      titulo: `Ei, ${nome}, bom dia!!`,
      subtitulo: "Só por hoje, vamos juntos!!!",
    };
  }

  if (minutos > ATE_12H && minutos <= ATE_18H) {
    return {
      titulo: `Ei, ${nome}, boa tarde!!!`,
      subtitulo: "Vamos fechar o dia, só por hoje!!!",
    };
  }

  if (minutos > ATE_18H) {
    return {
      titulo: `Ei, ${nome}, boa noite!!!`,
      subtitulo: "Bora relaxar e registrar nosso dia??",
    };
  }

  // 00:00 até 05:59
  return {
    titulo: `Ei, ${nome}, madrugando??`,
    subtitulo: "Alguma anotação importante??",
  };
}

// Descobre o melhor nome disponível para cumprimentar a pessoa:
// 1) o nome que ela salvou em Configurações
// 2) o nome informado no cadastro (metadata do Supabase Auth)
// 3) como último recurso, a parte do e-mail antes do @
export function nomeParaSaudacao(
  displayName: string | null | undefined,
  metadataName: string | null | undefined,
  email: string | null | undefined
): string {
  const escolhido = displayName?.trim() || metadataName?.trim() || email?.split("@")[0] || "";
  if (!escolhido) return "amigo(a)";
  // Só o primeiro nome, com a inicial maiúscula.
  const primeiro = escolhido.split(/[\s.]+/)[0];
  return primeiro.charAt(0).toUpperCase() + primeiro.slice(1);
}
