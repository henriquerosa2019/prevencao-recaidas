import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Cell,
  Treemap,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Activity, FileDown, Flame, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

// 🎨 Dashboard redesenhado no Lovable — paleta "Aurora Recovery" (azuis e
// violetas futuristas, vidro fosco, brilho neon). As cores usam variáveis
// --aurora-* definidas em index.css, isoladas do design system padrão do
// app — só esta tela e o painel lateral ganham este visual novo.

const PERIODOS = ["7d", "14d", "30d"];
const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const TRADUCOES_GATILHOS: Record<string, string> = {
  sex: "Sexo",
  pornography: "Pornografia",
  bar: "Bar/Festa",
  anger: "Raiva",
  loneliness: "Solidão",
  social: "Redes Sociais",
  tiredness: "Cansaço",
  night: "Noite/Insônia",
  social_pressure: "Influência de Amigos / Grupo",
  absence_meetings: "Ausência de Reuniões",
  not_study_program: "Distanciamento do Programa",
};

// Abreviação de cada gatilho para o mapa de calor (2 letras quando há colisão)
const GATILHO_ABREV: Record<string, string> = {
  "Ausência de Reuniões": "A",
  "Bar/Festa": "B",
  "Cansaço": "C",
  "Distanciamento do Programa": "D",
  "Influência de Amigos / Grupo": "I",
  "Noite/Insônia": "N",
  Pornografia: "P",
  Raiva: "Ra",
  "Redes Sociais": "Re",
  Sexo: "Se",
  Solidão: "So",
};

// Paleta categórica "Aurora Recovery" — mesma usada no redesenho do Lovable
const GATILHO_COR: Record<string, string> = {
  "Ausência de Reuniões": "oklch(0.72 0.15 215)",
  "Bar/Festa": "oklch(0.66 0.22 300)",
  "Cansaço": "oklch(0.62 0.07 268)",
  "Distanciamento do Programa": "oklch(0.58 0.14 268)",
  "Influência de Amigos / Grupo": "oklch(0.74 0.16 190)",
  "Noite/Insônia": "oklch(0.55 0.2 285)",
  Pornografia: "oklch(0.66 0.24 340)",
  Raiva: "oklch(0.7 0.2 20)",
  "Redes Sociais": "oklch(0.64 0.19 258)",
  Sexo: "oklch(0.7 0.21 325)",
  Solidão: "oklch(0.74 0.16 165)",
};

function abrevGatilho(nome: string) {
  return GATILHO_ABREV[nome] || nome.charAt(0).toUpperCase();
}

function corGatilho(nome: string) {
  return GATILHO_COR[nome] || "oklch(0.65 0.1 275)";
}

type ParetoRow = { nome: string; count: number; intensidade: number };
type HeatCellDetail = Record<
  string,
  { count: number; total: number; avg: number }
>;

// ================= Painel (Card) no estilo Aurora =================
function Panel({
  title,
  subtitle,
  footer,
  right,
  className,
  onClick,
  children,
}: {
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section
      onClick={onClick}
      className={cn(
        "aurora-glass relative overflow-hidden rounded-3xl p-5 md:p-6",
        onClick && "cursor-pointer transition-transform duration-200 hover:-translate-y-0.5",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(to right, transparent, var(--aurora-primary), transparent)",
        }}
      />
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="aurora-font-display aurora-text-glow text-base font-semibold md:text-lg">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-xs md:text-sm" style={{ color: "var(--aurora-muted-foreground)" }}>
              {subtitle}
            </p>
          )}
        </div>
        {right}
      </header>
      {children}
      {footer && (
        <p className="mt-4 text-[11px] md:text-xs" style={{ color: "var(--aurora-muted-foreground)" }}>
          {footer}
        </p>
      )}
    </section>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="aurora-glass group relative overflow-hidden rounded-3xl p-5 transition-transform duration-300 hover:-translate-y-1">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full aurora-gradient-bg opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
      />
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide" style={{ color: "var(--aurora-muted-foreground)" }}>
        <Icon className="h-4 w-4" style={{ color: "var(--aurora-primary)" }} />
        {label}
      </div>
      <p className="mt-3 aurora-font-display aurora-text-glow text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs" style={{ color: "var(--aurora-muted-foreground)" }}>{hint}</p>
    </div>
  );
}

export default function UrgeDashboardMVP() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState("7d");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);
  const [sobrietyDate, setSobrietyDate] = useState<string | null>(null);
  const [preventionPlan, setPreventionPlan] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  const [hover, setHover] = useState<{
    top: number;
    left: number;
    dia: string;
    hora: string;
    rows: ParetoRow[];
  } | null>(null);

  const heatmapWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, [periodo]);

  // 🏆 Contador de sobriedade + plano de prevenção (para o resumo/PDF)
  useEffect(() => {
    supabase
      .from("user_config")
      .select("sobriety_start_date, prevention_plan")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setSobrietyDate(data?.sobriety_start_date || null);
        setPreventionPlan(data?.prevention_plan?.trim() || null);
      });
  }, []);

  // Atualiza o contador a cada minuto
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const sobrietyCounter = useMemo(() => {
    if (!sobrietyDate) return null;
    const start = new Date(`${sobrietyDate}T00:00:00`);
    const diffMs = now.getTime() - start.getTime();
    if (isNaN(diffMs) || diffMs < 0) return null;
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    return { days: Math.floor(totalHours / 24), hours: totalHours % 24 };
  }, [sobrietyDate, now]);

  async function fetchData() {
    setLoading(true);
    const dias = parseInt(periodo.replace("d", ""));
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - dias);

    const { data, error } = await supabase
      .from("urge_events")
      .select("created_at, trigger, intensity, note")
      .gte("created_at", dataInicio.toISOString())
      .order("created_at", { ascending: true });

    if (error) console.error("Erro ao buscar dados:", error);
    else setData(data || []);
    setLoading(false);
  }

  const paretoData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((d) => {
      counts[d.trigger] = (counts[d.trigger] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([gatilho, ocorrencias]) => ({
        gatilho: TRADUCOES_GATILHOS[gatilho] || gatilho,
        ocorrencias,
      }))
      .sort((a, b) => b.ocorrencias - a.ocorrencias);
  }, [data]);

  const maxParetoValue = Math.max(1, ...paretoData.map((p) => p.ocorrencias));

  // 🎨 Gradiente azul → violeta → magenta pela intensidade relativa da célula
  // (contagem / máximo). Usado no mapa de árvore.
  const getBarColor = (count: number, max: number) => {
    const ratio = Math.min(1, count / (max || 1));
    return `oklch(${(0.34 + ratio * 0.3).toFixed(3)} ${(0.09 + ratio * 0.14).toFixed(3)} ${(
      268 +
      ratio * 45
    ).toFixed(1)})`;
  };

  // 🎨 Gradiente do mapa de calor pela intensidade média (0–10) — do quase
  // transparente (sem dados) ao magenta vibrante (mais crítico).
  const getHeatColor = (v: number) => {
    if (v <= 0) return "oklch(0.24 0.04 275 / 45%)";
    if (v < 2) return "oklch(0.42 0.11 245 / 70%)";
    if (v < 4) return "oklch(0.5 0.15 262 / 80%)";
    if (v < 6) return "oklch(0.56 0.19 285 / 88%)";
    if (v < 8) return "oklch(0.62 0.23 305 / 94%)";
    if (v < 9) return "oklch(0.66 0.25 330)";
    return "oklch(0.72 0.24 348)";
  };

  const intensidadeMedia = useMemo(
    () =>
      data.length
        ? (data.reduce((s, d) => s + (d.intensity || 0), 0) / data.length).toFixed(1)
        : "—",
    [data]
  );

  const heatmapData = useMemo(() => {
    const matriz = Array.from({ length: 7 }, () => Array(24).fill(0));
    const contagem = Array.from({ length: 7 }, () => Array(24).fill(0));
    const soma = Array.from({ length: 7 }, () => Array(24).fill(0));
    data.forEach((d) => {
      const dt = new Date(d.created_at);
      const local = new Date(
        dt.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
      );
      const dia = local.getDay();
      const hora = local.getHours();
      soma[dia][hora] += d.intensity;
      contagem[dia][hora]++;
    });
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 24; j++) {
        matriz[i][j] = contagem[i][j] ? soma[i][j] / contagem[i][j] : 0;
      }
    }
    return matriz;
  }, [data]);

  const heatmapDetails = useMemo(() => {
    const agg: HeatCellDetail[][] = Array.from({ length: 7 }, () =>
      Array.from({ length: 24 }, () => ({} as HeatCellDetail))
    );
    data.forEach((d) => {
      const dt = new Date(d.created_at);
      const local = new Date(
        dt.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
      );
      const dia = local.getDay();
      const hora = local.getHours();
      const nome = TRADUCOES_GATILHOS[d.trigger] || d.trigger;
      const cell = agg[dia][hora];
      if (!cell[nome]) cell[nome] = { count: 0, total: 0, avg: 0 };
      cell[nome].count += 1;
      cell[nome].total += d.intensity;
      cell[nome].avg = parseFloat((cell[nome].total / cell[nome].count).toFixed(1));
    });
    return agg;
  }, [data]);

  const totalRegistros30d = useMemo(() => {
    const limite = new Date();
    limite.setDate(limite.getDate() - 30);
    return data.filter((d) => new Date(d.created_at) >= limite).length;
  }, [data]);

  // 📅 Recorrência por dia da semana (com lista de gatilhos distintos por dia)
  const porDiaSemana = useMemo(() => {
    const porDia: Record<number, Record<string, number>> = {};
    for (let d = 0; d < 7; d++) porDia[d] = {};
    data.forEach((d) => {
      const dt = new Date(d.created_at);
      const local = new Date(
        dt.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
      );
      const dia = local.getDay();
      const nome = TRADUCOES_GATILHOS[d.trigger] || d.trigger;
      porDia[dia][nome] = (porDia[dia][nome] || 0) + 1;
    });
    return DIAS.map((dia, i) => {
      const entries = Object.entries(porDia[i]).sort((a, b) => b[1] - a[1]);
      const ocorrencias = entries.reduce((s, [, c]) => s + c, 0);
      return { dia, ocorrencias, gatilhos: entries.map(([nome]) => nome) };
    });
  }, [data]);

  // 🕐 Recorrência por horário do dia (com lista de gatilhos distintos por hora)
  const porHorario = useMemo(() => {
    const porHora: Record<number, Record<string, number>> = {};
    for (let h = 0; h < 24; h++) porHora[h] = {};
    data.forEach((d) => {
      const dt = new Date(d.created_at);
      const local = new Date(
        dt.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
      );
      const hora = local.getHours();
      const nome = TRADUCOES_GATILHOS[d.trigger] || d.trigger;
      porHora[hora][nome] = (porHora[hora][nome] || 0) + 1;
    });
    return Array.from({ length: 24 }, (_, i) => {
      const entries = Object.entries(porHora[i]).sort((a, b) => b[1] - a[1]);
      const ocorrencias = entries.reduce((s, [, c]) => s + c, 0);
      return {
        hora: `${i}h`,
        ocorrencias,
        gatilhos: entries.map(([nome]) => nome),
      };
    });
  }, [data]);

  // 🌳 Dados do mapa de árvore "Por Dia da Semana" (só dias com registros)
  const diaTreemapData = useMemo(() => {
    const itens = porDiaSemana.filter((d) => d.ocorrencias > 0);
    const max = Math.max(1, ...itens.map((d) => d.ocorrencias));
    return itens.map((d) => ({
      name: d.dia,
      value: d.ocorrencias,
      gatilhos: d.gatilhos,
      max,
    }));
  }, [porDiaSemana]);

  // 🌳 Dados do mapa de árvore "Por Horário" (só horários com registros)
  const horaTreemapData = useMemo(() => {
    const itens = porHorario.filter((h) => h.ocorrencias > 0);
    const max = Math.max(1, ...itens.map((h) => h.ocorrencias));
    return itens.map((h) => ({
      name: h.hora,
      value: h.ocorrencias,
      gatilhos: h.gatilhos,
      max,
    }));
  }, [porHorario]);

  // 🧮 Estatísticas temporais por gatilho (para os Top 5)
  const gatilhoTemporalStats = useMemo(() => {
    const stats: Record<string, { porDia: number[]; porHora: number[] }> = {};
    data.forEach((d) => {
      const nome = TRADUCOES_GATILHOS[d.trigger] || d.trigger;
      if (!stats[nome])
        stats[nome] = { porDia: Array(7).fill(0), porHora: Array(24).fill(0) };
      const dt = new Date(d.created_at);
      const local = new Date(
        dt.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
      );
      stats[nome].porDia[local.getDay()]++;
      stats[nome].porHora[local.getHours()]++;
    });
    return stats;
  }, [data]);

  // 🏆 Top 5 gatilhos: ocorrências + dia/horário mais frequente de cada um
  const top5Gatilhos = useMemo(() => {
    return paretoData.slice(0, 5).map((p) => {
      const s = gatilhoTemporalStats[p.gatilho] || {
        porDia: Array(7).fill(0),
        porHora: Array(24).fill(0),
      };
      const maxDia = Math.max(...s.porDia);
      const maxHora = Math.max(...s.porHora);
      return {
        gatilho: p.gatilho,
        ocorrencias: p.ocorrencias,
        diaTop: maxDia > 0 ? DIAS[s.porDia.indexOf(maxDia)] : "-",
        horaTop: maxHora > 0 ? `${s.porHora.indexOf(maxHora)}h` : "-",
      };
    });
  }, [paretoData, gatilhoTemporalStats]);

  // ⏰ Horário Crítico dos Top 5: 2 dias e 2 horários mais frequentes de cada gatilho
  const top5Temporal = useMemo(() => {
    return paretoData.slice(0, 5).map((p) => {
      const s = gatilhoTemporalStats[p.gatilho] || {
        porDia: Array(7).fill(0),
        porHora: Array(24).fill(0),
      };
      const dias = s.porDia
        .map((c, i) => ({ label: DIAS[i], c }))
        .filter((x) => x.c > 0)
        .sort((a, b) => b.c - a.c)
        .slice(0, 2)
        .map((x) => `${x.label} (${x.c}x)`);
      const horas = s.porHora
        .map((c, i) => ({ label: `${i}h`, c }))
        .filter((x) => x.c > 0)
        .sort((a, b) => b.c - a.c)
        .slice(0, 2)
        .map((x) => `${x.label} (${x.c}x)`);
      return {
        gatilho: p.gatilho,
        dias: dias.length ? dias.join(", ") : "-",
        horas: horas.length ? horas.join(", ") : "-",
      };
    });
  }, [paretoData, gatilhoTemporalStats]);

  const horarioCritico = useMemo(() => {
    let max = 0,
      diaCrit = "",
      horaCrit = "";
    heatmapData.forEach((row, d) => {
      row.forEach((val, h) => {
        if (val > max) {
          max = val;
          diaCrit = DIAS[d];
          horaCrit = `${h}h`;
        }
      });
    });
    return { max, diaCrit, horaCrit };
  }, [heatmapData]);

  // Estimativa simples de largura de um texto em px, para decidir se cabe numa célula
  // sem precisar medir o DOM — evita texto vazando para fora da célula em telas estreitas.
  function largImg(texto: string, fontSize: number) {
    return texto.length * fontSize * 0.6;
  }

  // 🌳 Conteúdo customizado das células dos mapas de árvore ("Por Dia da Semana" e
  // "Por Horário"): célula arredondada com gradiente azul→violeta→magenta pela
  // intensidade relativa, cabeçalho e nomes de gatilhos em branco (com halo escuro
  // para contraste garantido em qualquer tom de fundo) e um marcador colorido por
  // gatilho. Cada linha de texto só é desenhada quando cabe de fato na largura real
  // da célula, o que mantém o gráfico responsivo do desktop ao celular.
  function TreemapCellContent(props: any) {
    const { x, y, width, height, name, value, gatilhos = [], max } = props;
    if (!width || !height || width <= 0 || height <= 0) return null;
    const ratio = value / (max || 1);
    const fill = `oklch(${(0.34 + ratio * 0.3).toFixed(3)} ${(0.09 + ratio * 0.14).toFixed(
      3
    )} ${(268 + ratio * 45).toFixed(1)})`;

    const pad = 3;
    const rw = Math.max(0, width - pad * 2);
    const rh = Math.max(0, height - pad * 2);

    const headerDisponivel = width - 22;
    const headerTexto = `${name} · ${value}`;
    const showHeader = width > 40 && height > 28 && largImg(headerTexto, 13) <= headerDisponivel;

    const subTexto = `${value} registro${value === 1 ? "" : "s"}`;
    const showSub = showHeader && height > 46 && largImg(subTexto, 11) <= headerDisponivel;

    const linhaAlt = 15;
    const inicioNomes = showSub ? 58 : showHeader ? 40 : 22;
    const gatilhoDisponivel = width - 35;
    const linhasMax = Math.max(0, Math.floor((height - inicioNomes - 8) / linhaAlt));
    const nomesVisiveis: string[] = [];
    for (const g of gatilhos) {
      if (nomesVisiveis.length >= linhasMax) break;
      if (largImg(g, 10) <= gatilhoDisponivel) nomesVisiveis.push(g);
    }

    return (
      <g>
        <rect
          x={x + pad}
          y={y + pad}
          width={rw}
          height={rh}
          rx={14}
          fill={fill}
          stroke="oklch(0.85 0.08 285 / 30%)"
          strokeWidth={1}
        />
        <title>
          {name} · {value} registro{value === 1 ? "" : "s"}
          {gatilhos.length > 0 ? ` · ${gatilhos.join(", ")}` : ""}
        </title>
        {showHeader && (
          <text
            x={x + 14}
            y={y + 22}
            fill="oklch(0.98 0.01 280)"
            fontSize={13}
            fontWeight={700}
            style={{ textShadow: "0 2px 8px rgba(0,0,0,.55)" }}
          >
            {name} · {value}
          </text>
        )}
        {showSub && (
          <text
            x={x + 14}
            y={y + 40}
            fill="oklch(0.9 0.03 285 / 85%)"
            fontSize={11}
            style={{ textShadow: "0 2px 8px rgba(0,0,0,.55)" }}
          >
            {subTexto}
          </text>
        )}
        {nomesVisiveis.map((g, i) => (
          <g key={g}>
            <circle cx={x + 18} cy={y + inicioNomes + i * linhaAlt - 4} r={3.5} fill={corGatilho(g)} />
            <text
              x={x + 27}
              y={y + inicioNomes + i * linhaAlt}
              fill="oklch(0.95 0.02 285 / 92%)"
              fontSize={10}
              style={{ textShadow: "0 2px 6px rgba(0,0,0,.5)" }}
            >
              {g}
            </text>
          </g>
        ))}
      </g>
    );
  }

  // 📄 Exportação do Relatório Clínico em PDF
  function exportarPDF() {
    const doc = new jsPDF();
    const margin = 14;
    let y = 18;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Relatório Clínico – Prevenção de Recaídas", margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Gerado em: ${new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      })}`,
      margin,
      y
    );
    y += 5;
    doc.text(`Período do relatório: últimos ${periodo.replace("d", "")} dias`, margin, y);
    y += 7;

    if (sobrietyCounter) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Tempo em recuperação: ${sobrietyCounter.days} dias, ${sobrietyCounter.hours} horas`,
        margin,
        y
      );
      y += 8;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo do período", margin, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total de registros: ${data.length}`, margin, y);
    y += 5;
    doc.text(
      `Gatilho mais comum: ${paretoData[0]?.gatilho || "-"}${
        paretoData[0] ? ` (${paretoData[0].ocorrencias} ocorrências)` : ""
      }`,
      margin,
      y
    );
    y += 5;
    doc.text(
      `Horário mais crítico: ${
        horarioCritico.max > 0 ? `${horarioCritico.diaCrit} ${horarioCritico.horaCrit}` : "-"
      }`,
      margin,
      y
    );
    y += 8;

    if (preventionPlan) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Plano de Prevenção", margin, y);
      y += 6;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const linhas = doc.splitTextToSize(preventionPlan, 180);
      doc.text(linhas, margin, y);
      y += linhas.length * 5 + 4;
    }

    const linhasTabela = [...data]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((d) => [
        new Date(d.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
        TRADUCOES_GATILHOS[d.trigger] || d.trigger,
        `${d.intensity}/10`,
        d.note && d.note !== "EMPTY" ? d.note : "—",
      ]);

    autoTable(doc, {
      startY: y,
      head: [["Data/Hora", "Gatilho", "Intensidade", "Observação"]],
      body: linhasTabela,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
      margin: { left: margin, right: margin },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || y;
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      "Este relatório contém informações pessoais e confidenciais. Compartilhe apenas com profissionais de saúde autorizados.",
      margin,
      Math.min(finalY + 10, 285)
    );

    doc.save(`relatorio-prevencao-recaidas-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  return (
    <div className="aurora-shell aurora-grid-noise -m-4 min-h-[calc(100vh-1px)] px-4 py-8 md:-m-6 md:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {/* Cabeçalho */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p
              className="flex items-center gap-2 text-xs uppercase tracking-[0.25em]"
              style={{ color: "var(--aurora-muted-foreground)" }}
            >
              <Sparkles className="h-3.5 w-3.5" /> Prevenção à recaída
            </p>
            <h1 className="mt-2 aurora-font-display aurora-text-glow text-3xl font-bold md:text-4xl">
              Painel de Consciência
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="aurora-glass flex gap-1 rounded-full p-1">
              {PERIODOS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriodo(p)}
                  className="rounded-full px-4 py-1.5 text-sm transition-all"
                  style={
                    periodo === p
                      ? {
                          backgroundImage: "var(--aurora-gradient)",
                          color: "var(--aurora-primary-foreground)",
                          boxShadow: "var(--aurora-shadow-glow-strong)",
                          textShadow: "var(--aurora-text-glow-soft)",
                        }
                      : { color: "var(--aurora-muted-foreground)" }
                  }
                >
                  {p.replace("d", " dias")}
                </button>
              ))}
            </div>
            <button
              onClick={exportarPDF}
              className="aurora-glass flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors hover:brightness-125"
              title="Exportar Relatório Clínico (PDF)"
              style={{ color: "var(--aurora-foreground)" }}
            >
              <FileDown className="h-4 w-4" />
              Exportar PDF
            </button>
          </div>
        </header>

        {/* 🏆 Contador de Sobriedade */}
        {sobrietyCounter ? (
          <section className="aurora-glass-strong relative overflow-hidden rounded-3xl p-6 md:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full aurora-gradient-bg opacity-30 blur-3xl"
            />
            <div className="relative flex flex-wrap items-center justify-between gap-6">
              <div>
                <p
                  className="text-xs uppercase tracking-[0.25em]"
                  style={{ color: "var(--aurora-muted-foreground)" }}
                >
                  Você está limpo há
                </p>
                <p className="mt-2 aurora-font-display aurora-text-glow text-4xl font-bold md:text-5xl">
                  {sobrietyCounter.days} {sobrietyCounter.days === 1 ? "dia" : "dias"}
                  <span className="ml-2 text-2xl md:text-3xl" style={{ color: "var(--aurora-muted-foreground)" }}>
                    {sobrietyCounter.hours}h
                  </span>
                </p>
              </div>
              <div
                className="flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{ border: "1px solid var(--aurora-border)" }}
              >
                <Trophy className="h-6 w-6" style={{ color: "var(--aurora-primary)" }} />
                <p className="max-w-[16rem] text-sm" style={{ color: "var(--aurora-foreground)" }}>
                  Continue firme. Cada dia registrado é um dia consciente.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <div
            className="aurora-glass rounded-3xl p-4 text-center text-sm"
            style={{ color: "var(--aurora-muted-foreground)" }}
          >
            Defina sua data de início da recuperação em{" "}
            <button
              onClick={() => navigate("/config")}
              className="font-medium underline"
              style={{ color: "var(--aurora-primary)" }}
            >
              Configurações
            </button>{" "}
            para ver seu contador de dias limpo aqui.
          </div>
        )}

        {loading ? (
          <p className="text-center" style={{ color: "var(--aurora-muted-foreground)" }}>
            Carregando dados...
          </p>
        ) : showHistorico ? (
          <Panel
            title={`Histórico de Registros (${periodo})`}
            right={
              <button
                onClick={() => setShowHistorico(false)}
                className="aurora-glass rounded-full px-3 py-1.5 text-sm"
                style={{ color: "var(--aurora-foreground)" }}
              >
                ← Voltar
              </button>
            }
            className="mx-auto w-full max-w-3xl"
          >
            {data.length === 0 ? (
              <p className="py-8 text-center" style={{ color: "var(--aurora-muted-foreground)" }}>
                Nenhum registro encontrado no período selecionado.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className="text-left text-xs uppercase tracking-wide"
                      style={{ color: "var(--aurora-muted-foreground)" }}
                    >
                      <th className="pb-3 pr-4 font-medium">Data/Hora</th>
                      <th className="pb-3 pr-4 font-medium">Gatilho</th>
                      <th className="pb-3 pr-4 font-medium">Intensidade</th>
                      <th className="pb-3 font-medium">Observação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...data]
                      .sort(
                        (a, b) =>
                          new Date(b.created_at).getTime() -
                          new Date(a.created_at).getTime()
                      )
                      .map((d, i) => (
                        <tr key={i} style={{ borderTop: "1px solid var(--aurora-border)" }}>
                          <td className="py-3 pr-4 whitespace-nowrap">
                            {new Date(d.created_at).toLocaleString("pt-BR", {
                              timeZone: "America/Sao_Paulo",
                            })}
                          </td>
                          <td className="py-3 pr-4">
                            {TRADUCOES_GATILHOS[d.trigger] || d.trigger}
                          </td>
                          <td className="py-3 pr-4">{d.intensity}/10</td>
                          <td className="py-3" style={{ color: "var(--aurora-muted-foreground)" }}>
                            {d.note && d.note !== "EMPTY" ? d.note : "—"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Kpi
                icon={Activity}
                label={`Registros (${periodo})`}
                value={String(data.length)}
                hint="desejos observados"
              />
              <Kpi
                icon={Flame}
                label="Intensidade média"
                value={String(intensidadeMedia)}
                hint="escala de 0 a 10"
              />
              <Kpi
                icon={ShieldCheck}
                label="Gatilho principal"
                value={paretoData[0]?.gatilho ?? "—"}
                hint={paretoData[0] ? `${paretoData[0].ocorrencias} ocorrências` : "sem dados"}
              />
              <Kpi
                icon={Sparkles}
                label="Horário crítico"
                value={
                  horarioCritico.max > 0
                    ? `${horarioCritico.diaCrit} · ${horarioCritico.horaCrit}`
                    : "—"
                }
                hint={horarioCritico.max > 0 ? `intensidade ${horarioCritico.max.toFixed(1)}` : "sem dados"}
              />
            </div>

            {/* 📊 Gatilhos */}
            <Panel
              title={`Gatilhos (${periodo})`}
              subtitle={`${data.length} registros no período`}
              footer="Clique para ver o histórico completo de registros"
              onClick={() => setShowHistorico(true)}
            >
              <div className="h-72 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paretoData} margin={{ bottom: 60, left: -18 }}>
                    <XAxis
                      dataKey="gatilho"
                      tick={{ fontSize: 11, dy: 8, fill: "oklch(0.82 0.04 280)" }}
                      interval={0}
                      angle={-22}
                      textAnchor="end"
                      height={100}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "oklch(0.75 0.04 280)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RTooltip
                      cursor={{ fill: "oklch(0.7 0.1 285 / 10%)" }}
                      contentStyle={{
                        background: "oklch(0.22 0.06 276 / 95%)",
                        border: "1px solid oklch(0.72 0.09 280 / 25%)",
                        borderRadius: 14,
                        color: "oklch(0.98 0.01 280)",
                        boxShadow: "0 20px 50px -20px rgba(0,0,0,.8)",
                      }}
                      labelStyle={{ color: "oklch(0.98 0.01 280)", fontWeight: 600 }}
                      itemStyle={{ color: "oklch(0.98 0.01 280)" }}
                    />
                    <Bar dataKey="ocorrencias" radius={[8, 8, 0, 0]} name="Ocorrências">
                      {paretoData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={corGatilho(entry.gatilho)}
                          fillOpacity={0.35 + 0.65 * (entry.ocorrencias / maxParetoValue)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            {/* 📅 Recorrência por Dia da Semana — Mapa de Árvore */}
            <Panel
              title={`Por Dia da Semana (${periodo})`}
              subtitle={`${data.length} registros no período`}
              footer="O tamanho de cada célula é proporcional ao número de registros do dia."
            >
              <div className="h-[420px] md:h-[520px]">
                {diaTreemapData.length === 0 ? (
                  <div
                    className="flex h-full items-center justify-center rounded-2xl text-center text-sm"
                    style={{ border: "1px dashed var(--aurora-border)", color: "var(--aurora-muted-foreground)" }}
                  >
                    Sem registros no período selecionado.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={diaTreemapData}
                      dataKey="value"
                      nameKey="name"
                      isAnimationActive={false}
                      content={<TreemapCellContent />}
                    />
                  </ResponsiveContainer>
                )}
              </div>
            </Panel>

            {/* 🕐 Recorrência por Horário — Mapa de Árvore */}
            <Panel
              title={`Por Horário (${periodo})`}
              subtitle={`${data.length} registros no período`}
              footer="O tamanho de cada célula é proporcional ao número de registros do horário."
            >
              <div className="h-[420px] md:h-[520px]">
                {horaTreemapData.length === 0 ? (
                  <div
                    className="flex h-full items-center justify-center rounded-2xl text-center text-sm"
                    style={{ border: "1px dashed var(--aurora-border)", color: "var(--aurora-muted-foreground)" }}
                  >
                    Sem registros no período selecionado.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={horaTreemapData}
                      dataKey="value"
                      nameKey="name"
                      isAnimationActive={false}
                      content={<TreemapCellContent />}
                    />
                  </ResponsiveContainer>
                )}
              </div>
            </Panel>

            {/* 🔥 Heatmap com mini-Pareto no hover */}
            <Panel
              title={`Mapa de Calor de Desejos (${periodo})`}
              subtitle={`${data.length} registros no período — passe o mouse para o mini-Pareto`}
            >
              <div className="overflow-x-auto">
                <div className="min-w-[860px] relative" ref={heatmapWrapRef}>
                  <div className="grid grid-cols-[60px_repeat(24,minmax(22px,1fr))] gap-1">
                    <div />
                    {Array.from({ length: 24 }, (_, i) => (
                      <div
                        key={`h-${i}`}
                        className="text-center text-[10px] tabular-nums"
                        style={{ color: "var(--aurora-muted-foreground)" }}
                      >
                        {i}
                      </div>
                    ))}
                    {heatmapData.map((row, rIdx) => (
                      <React.Fragment key={`r-${rIdx}`}>
                        <div
                          className="text-[11px] h-[30px] flex items-center font-medium"
                          style={{ color: "var(--aurora-foreground)" }}
                        >
                          {DIAS[rIdx]}
                        </div>
                        {row.map((v, cIdx) => {
                          const bg = getHeatColor(v);

                          const cellAggCor = heatmapDetails[rIdx][cIdx];
                          const dominanteEntry = Object.entries(cellAggCor).sort(
                            (a, b) =>
                              a[1].count === b[1].count
                                ? b[1].avg - a[1].avg
                                : b[1].count - a[1].count
                          )[0];
                          const nomeDominante = dominanteEntry?.[0];

                          const onEnter: React.MouseEventHandler<HTMLDivElement> = (e) => {
                            const cellAgg = heatmapDetails[rIdx][cIdx];
                            const rows: ParetoRow[] = Object.entries(cellAgg)
                              .map(([nome, v]) => ({
                                nome,
                                count: v.count,
                                intensidade: v.avg,
                              }))
                              .sort((a, b) =>
                                a.count === b.count
                                  ? b.intensidade - a.intensidade
                                  : b.count - a.count
                              );
                            const cellRect =
                              (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                            const wrapRect =
                              heatmapWrapRef.current!.getBoundingClientRect();
                            const top = cellRect.top - wrapRect.top - 8;
                            const left =
                              cellRect.left - wrapRect.left + cellRect.width + 8;
                            setHover({
                              top,
                              left,
                              dia: DIAS[rIdx],
                              hora: `${cIdx}h`,
                              rows,
                            });
                          };

                          return (
                            <div
                              key={`c-${rIdx}-${cIdx}`}
                              onMouseEnter={onEnter}
                              onMouseLeave={() => setHover(null)}
                              className="grid place-items-center transition-transform duration-150 hover:scale-110"
                              style={{
                                backgroundColor: bg,
                                border: "1px solid oklch(0.85 0.08 285 / 20%)",
                                borderRadius: "6px",
                                height: "30px",
                                cursor: "pointer",
                                boxShadow: v >= 6 ? `0 0 14px -2px ${bg}` : undefined,
                              }}
                            >
                              {nomeDominante && (
                                <span
                                  className={v <= 8 ? "aurora-text-glow-soft" : undefined}
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    // 🎨 Contraste garantido pela intensidade da célula (não mais
                                    // pela cor categórica do gatilho): branco até 8, azul escuro
                                    // a partir de 9 — onde o fundo do mapa de calor fica claro/rosa.
                                    color: v <= 8 ? "oklch(0.98 0.01 280)" : "oklch(0.28 0.12 260)",
                                  }}
                                >
                                  {abrevGatilho(nomeDominante)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Tooltip com cabeçalho formatado */}
                  {hover && hover.rows.length > 0 && (
                    <div
                      className="aurora-glass-strong pointer-events-none absolute z-50 max-w-[260px] overflow-hidden rounded-2xl text-xs"
                      style={{
                        top: Math.max(0, hover.top - 100),
                        left: hover.left,
                      }}
                    >
                      <div
                        className="px-3 py-2 font-bold text-[11px] aurora-text-glow"
                        style={{ borderBottom: "1px solid var(--aurora-border)" }}
                      >
                        {hover.dia} · {hover.hora}
                      </div>
                      <div className="p-3 max-h-[160px] overflow-y-auto space-y-1.5">
                        {hover.rows.slice(0, 8).map((r, i) => (
                          <div
                            key={`${r.nome}-${i}`}
                            className="flex items-center gap-2"
                          >
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: corGatilho(r.nome) }}
                            />
                            <span className="truncate" style={{ color: "var(--aurora-foreground)" }}>
                              {r.nome}
                            </span>
                            <span
                              className="ml-auto tabular-nums shrink-0"
                              style={{ color: "var(--aurora-muted-foreground)" }}
                            >
                              {r.count}× · {r.intensidade}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Legenda e total */}
              <div
                className="mt-4 flex flex-wrap items-center justify-between text-sm"
                style={{ color: "var(--aurora-muted-foreground)" }}
              >
                <div>
                  Total de registros nos últimos 30 dias:{" "}
                  <strong style={{ color: "var(--aurora-foreground)" }}>{totalRegistros30d}</strong>
                </div>
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  <span className="text-xs">Menos crítico</span>
                  {[0, 1, 3, 5, 7, 8.5, 10].map((v) => (
                    <div
                      key={v}
                      className="w-4 h-4 rounded-sm"
                      style={{ backgroundColor: getHeatColor(v), border: "1px solid var(--aurora-border)" }}
                    />
                  ))}
                  <span className="text-xs">Mais crítico</span>
                </div>
              </div>

              {/* Legenda das abreviações de gatilhos exibidas no centro de cada célula */}
              <div
                className="mt-3 pt-3 flex flex-wrap gap-x-4 gap-y-1.5"
                style={{ borderTop: "1px solid var(--aurora-border)" }}
              >
                {Object.entries(GATILHO_ABREV).map(([nome, sigla]) => (
                  <div
                    key={nome}
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: "var(--aurora-muted-foreground)" }}
                  >
                    <span
                      className="inline-flex items-center justify-center rounded-full font-bold"
                      style={{
                        width: 16,
                        height: 16,
                        fontSize: 9,
                        color: "oklch(0.98 0.01 280)",
                        backgroundColor: corGatilho(nome),
                      }}
                    >
                      {sigla}
                    </span>
                    {nome}
                  </div>
                ))}
              </div>
            </Panel>

            {/* 🏆 Top 5 — Gatilho Mais Comum */}
            <Panel title={`Gatilho Mais Comum — Top 5 (${periodo})`}>
              {top5Gatilhos.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--aurora-muted-foreground)" }}>
                  Aguardando dados
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        className="text-left text-xs uppercase tracking-wide"
                        style={{ color: "var(--aurora-muted-foreground)" }}
                      >
                        <th className="pb-3 pr-4 font-medium">#</th>
                        <th className="pb-3 pr-4 font-medium">Gatilho</th>
                        <th className="pb-3 pr-4 font-medium">Ocorrências</th>
                        <th className="pb-3 pr-4 font-medium">Dia mais frequente</th>
                        <th className="pb-3 font-medium">Horário mais frequente</th>
                      </tr>
                    </thead>
                    <tbody>
                      {top5Gatilhos.map((g, i) => (
                        <tr key={g.gatilho} style={{ borderTop: "1px solid var(--aurora-border)" }}>
                          <td className="py-3 pr-4" style={{ color: "var(--aurora-muted-foreground)" }}>
                            {i + 1}
                          </td>
                          <td className="py-3 pr-4 font-medium aurora-text-glow-soft">
                            <span className="flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                  backgroundColor: corGatilho(g.gatilho),
                                  boxShadow: `0 0 12px ${corGatilho(g.gatilho)}`,
                                }}
                              />
                              {g.gatilho}
                            </span>
                          </td>
                          <td className="py-3 pr-4 tabular-nums">{g.ocorrencias}×</td>
                          <td className="py-3 pr-4" style={{ color: "var(--aurora-muted-foreground)" }}>
                            {g.diaTop}
                          </td>
                          <td className="py-3" style={{ color: "var(--aurora-muted-foreground)" }}>
                            {g.horaTop}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>

            {/* ⏰ Horário Crítico dos Top 5 */}
            <Panel title={`Horário Crítico — Top 5 (${periodo})`}>
              {top5Temporal.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--aurora-muted-foreground)" }}>
                  Aguardando dados
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        className="text-left text-xs uppercase tracking-wide"
                        style={{ color: "var(--aurora-muted-foreground)" }}
                      >
                        <th className="pb-3 pr-4 font-medium">#</th>
                        <th className="pb-3 pr-4 font-medium">Gatilho</th>
                        <th className="pb-3 pr-4 font-medium">Dias mais críticos</th>
                        <th className="pb-3 font-medium">Horários mais críticos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {top5Temporal.map((g, i) => (
                        <tr key={g.gatilho} style={{ borderTop: "1px solid var(--aurora-border)" }}>
                          <td className="py-3 pr-4" style={{ color: "var(--aurora-muted-foreground)" }}>
                            {i + 1}
                          </td>
                          <td className="py-3 pr-4 font-medium aurora-text-glow-soft">
                            <span className="flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                  backgroundColor: corGatilho(g.gatilho),
                                  boxShadow: `0 0 12px ${corGatilho(g.gatilho)}`,
                                }}
                              />
                              {g.gatilho}
                            </span>
                          </td>
                          <td className="py-3 pr-4" style={{ color: "var(--aurora-muted-foreground)" }}>
                            {g.dias}
                          </td>
                          <td className="py-3" style={{ color: "var(--aurora-muted-foreground)" }}>
                            {g.horas}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>
          </>
        )}
      </div>
    </div>
  );
}
