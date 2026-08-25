// src/lib/anniversaryGate.ts
//
// 🎟️ Cálculo de marcos/aniversários de sobriedade — usado tanto pelas fichas
// de padrinho/madrinha/afilhado(a) (src/pages/Aniversarios.tsx) quanto pelo
// aniversário do próprio usuário logado (src/pages/Abertura.tsx).
//
// Marco = data-base + intervalo de calendário (não dias corridos): "6 meses"
// é 6 meses de calendário depois da data de ingresso, do jeito que a
// comunidade conta — não 180 dias corridos.

export type Milestone = { key: string; label: string };

// Opções do dropdown de ficha/marco — mesma lista dos produtos da Central de
// Serviços (401-A a 405), sem os valores em R$.
export const FICHA_MILESTONES: Milestone[] = [
  { key: "ingresso", label: "Ingresso" },
  { key: "3m", label: "3 meses" },
  { key: "6m", label: "6 meses" },
  { key: "9m", label: "9 meses" },
  { key: "1a", label: "1 ano" },
  { key: "2a", label: "2 anos" },
  { key: "3a", label: "3 anos" },
  { key: "4a", label: "4 anos" },
  { key: "5a", label: "5 anos" },
];

export const PERSON_ROLES: Milestone[] = [
  { key: "afilhado", label: "Afilhado" },
  { key: "afilhada", label: "Afilhada" },
  { key: "padrinho", label: "Padrinho" },
  { key: "madrinha", label: "Madrinha" },
];

export function roleLabel(key: string): string {
  return PERSON_ROLES.find((r) => r.key === key)?.label || key;
}

// Marcos verificados automaticamente pelo app (independente do que foi
// escolhido manualmente no formulário) para saber se "hoje" é aniversário.
const MARCOS_MESES: { meses: number; label: string }[] = [
  { meses: 3, label: "3 meses" },
  { meses: 6, label: "6 meses" },
  { meses: 9, label: "9 meses" },
];
const MAX_ANOS_VERIFICADOS = 60; // depois de 5 anos não há ficha oficial, mas ainda vale comemorar

function mesmaData(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function parseDataLocal(dataISO: string | null | undefined): Date | null {
  if (!dataISO) return null;
  const d = new Date(`${dataISO}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

// Retorna o rótulo do marco (ex.: "6 meses", "2 anos") que `dataBaseISO`
// completa exatamente em `hoje`, ou null se hoje não for um marco.
export function marcoDeHoje(dataBaseISO: string | null | undefined, hoje: Date = new Date()): string | null {
  const base = parseDataLocal(dataBaseISO);
  if (!base) return null;

  for (const m of MARCOS_MESES) {
    const alvo = new Date(base);
    alvo.setMonth(alvo.getMonth() + m.meses);
    if (mesmaData(alvo, hoje)) return m.label;
  }

  for (let anos = 1; anos <= MAX_ANOS_VERIFICADOS; anos++) {
    const alvo = new Date(base);
    alvo.setFullYear(alvo.getFullYear() + anos);
    if (mesmaData(alvo, hoje)) return `${anos} ${anos === 1 ? "ano" : "anos"}`;
  }

  return null;
}

// Data efetiva de sobriedade do usuário logado: se houver recaída registrada
// depois da data de início, a contagem reinicia a partir da recaída mais
// recente — é a partir dela que o próprio aniversário passa a ser calculado.
export function dataEfetivaSobriedade(
  sobrietyStartDate: string | null | undefined,
  ultimaRecaidaISO: string | null | undefined
): string | null {
  if (!sobrietyStartDate) return ultimaRecaidaISO || null;
  if (!ultimaRecaidaISO) return sobrietyStartDate;
  return ultimaRecaidaISO > sobrietyStartDate ? ultimaRecaidaISO : sobrietyStartDate;
}
