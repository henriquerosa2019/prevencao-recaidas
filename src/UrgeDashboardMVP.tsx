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
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileDown } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

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

type ParetoRow = { nome: string; count: number; intensidade: number };
type HeatCellDetail = Record<
  string,
  { count: number; total: number; avg: number }
>;

function Card({
  title,
  children,
  footer,
  onClick,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl shadow-sm border border-gray-200 bg-white p-4 md:p-6 ${
        onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""
      }`}
    >
      <h2 className="text-lg md:text-xl font-semibold mb-3">{title}</h2>
      {children}
      {footer ? <div className="mt-3 text-sm text-gray-600">{footer}</div> : null}
    </div>
  );
}

export default function UrgeDashboardMVP() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState("14d");
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

  const getBarColor = (count: number, max: number) => {
    const ratio = count / max;
    if (ratio > 0.8) return "#7f0000";
    if (ratio > 0.6) return "#c71c1c";
    if (ratio > 0.4) return "#f97316";
    if (ratio > 0.2) return "#fdba74";
    if (ratio > 0.1) return "#fef08a";
    return "#fefce8";
  };

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

  // 📅 Recorrência por dia da semana
  const porDiaSemana = useMemo(() => {
    const counts = Array(7).fill(0);
    data.forEach((d) => {
      const dt = new Date(d.created_at);
      const local = new Date(
        dt.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
      );
      counts[local.getDay()]++;
    });
    return DIAS.map((dia, i) => ({ dia, ocorrencias: counts[i] }));
  }, [data]);

  // 🕐 Recorrência por horário do dia
  const porHorario = useMemo(() => {
    const counts = Array(24).fill(0);
    data.forEach((d) => {
      const dt = new Date(d.created_at);
      const local = new Date(
        dt.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
      );
      counts[local.getHours()]++;
    });
    return counts.map((ocorrencias, i) => ({ hora: `${i}h`, ocorrencias }));
  }, [data]);

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
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-200 z-10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-xl md:text-2xl font-bold">MVP — Prevenção de Recaída</h1>
          <div className="flex gap-2 text-sm items-center flex-wrap">
            {PERIODOS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-3 py-1 rounded-full border ${
                  periodo === p
                    ? "bg-black text-white border-black"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {p.replace("d", " dias")}
              </button>
            ))}
            <button
              onClick={exportarPDF}
              className="px-3 py-1 rounded-full border bg-white hover:bg-gray-100 flex items-center gap-1"
              title="Exportar Relatório Clínico (PDF)"
            >
              <FileDown className="h-4 w-4" />
              Exportar PDF
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 gap-6">
        {/* 🏆 Contador de Sobriedade */}
        {sobrietyCounter ? (
          <div className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white p-5 shadow-sm flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm uppercase tracking-wide opacity-90">
                Você está limpo há
              </p>
              <p className="text-2xl md:text-3xl font-bold">
                🏆 {sobrietyCounter.days} {sobrietyCounter.days === 1 ? "Dia" : "Dias"},{" "}
                {sobrietyCounter.hours} {sobrietyCounter.hours === 1 ? "Hora" : "Horas"} Limpo
              </p>
            </div>
            <p className="text-sm opacity-90 max-w-xs md:text-right">
              Continue firme. Cada dia conta.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500 text-center">
            Defina sua data de início da recuperação em{" "}
            <button
              onClick={() => navigate("/config")}
              className="text-blue-600 underline font-medium"
            >
              Configurações
            </button>{" "}
            para ver seu contador de dias limpo aqui.
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Carregando dados...</p>
        ) : showHistorico ? (
          <div className="rounded-2xl shadow-sm border border-gray-200 bg-white p-4 md:p-6 max-w-3xl mx-auto w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold">
                Histórico de Registros ({periodo})
              </h2>
              <button
                onClick={() => setShowHistorico(false)}
                className="px-3 py-1.5 rounded-full border text-sm bg-white hover:bg-gray-100"
              >
                ← Voltar
              </button>
            </div>
            {data.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhum registro encontrado no período selecionado.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 pr-4">Data/Hora</th>
                      <th className="py-2 pr-4">Gatilho</th>
                      <th className="py-2 pr-4">Intensidade</th>
                      <th className="py-2">Observação</th>
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
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2 pr-4 whitespace-nowrap">
                            {new Date(d.created_at).toLocaleString("pt-BR", {
                              timeZone: "America/Sao_Paulo",
                            })}
                          </td>
                          <td className="py-2 pr-4">
                            {TRADUCOES_GATILHOS[d.trigger] || d.trigger}
                          </td>
                          <td className="py-2 pr-4">{d.intensity}/10</td>
                          <td className="py-2 text-gray-600">
                            {d.note && d.note !== "EMPTY" ? d.note : "—"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* 📊 Gatilhos */}
            <Card
              title={`Gatilhos (${periodo})`}
              onClick={() => setShowHistorico(true)}
              footer={
                <span className="text-xs text-gray-400">
                  Clique para ver o histórico completo de registros
                </span>
              }
            >
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paretoData} margin={{ bottom: 50 }}>
                    <XAxis
                      dataKey="gatilho"
                      tick={{ fontSize: 13, dy: 10, fill: "#374151" }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#374151" }} />
                    <RTooltip />
                    <Bar dataKey="ocorrencias" radius={[6, 6, 0, 0]}>
                      {paretoData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={getBarColor(
                            entry.ocorrencias,
                            Math.max(...paretoData.map((d) => d.ocorrencias))
                          )}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* 📅🕐 Recorrência por Dia da Semana e por Horário */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card title={`Por Dia da Semana (${periodo})`}>
                <div className="h-56 md:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={porDiaSemana} margin={{ bottom: 5 }}>
                      <XAxis
                        dataKey="dia"
                        tick={{ fontSize: 12, fill: "#374151" }}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#374151" }}
                        allowDecimals={false}
                      />
                      <RTooltip />
                      <Bar dataKey="ocorrencias" radius={[6, 6, 0, 0]}>
                        {porDiaSemana.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={getBarColor(
                              entry.ocorrencias,
                              Math.max(
                                1,
                                ...porDiaSemana.map((d) => d.ocorrencias)
                              )
                            )}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title={`Por Horário (${periodo})`}>
                <div className="h-56 md:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={porHorario} margin={{ bottom: 5 }}>
                      <XAxis
                        dataKey="hora"
                        tick={{ fontSize: 10, fill: "#374151" }}
                        interval={1}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#374151" }}
                        allowDecimals={false}
                      />
                      <RTooltip />
                      <Bar dataKey="ocorrencias" radius={[4, 4, 0, 0]}>
                        {porHorario.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={getBarColor(
                              entry.ocorrencias,
                              Math.max(
                                1,
                                ...porHorario.map((d) => d.ocorrencias)
                              )
                            )}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* 🔥 Heatmap com mini-Pareto no hover */}
            <Card title={`Mapa de Calor de Desejos (${periodo})`}>
              <div className="overflow-x-auto">
                <div className="min-w-[860px] relative" ref={heatmapWrapRef}>
                  <div className="grid grid-cols-[60px_repeat(24,minmax(22px,1fr))] gap-1">
                    <div />
                    {Array.from({ length: 24 }, (_, i) => (
                      <div
                        key={`h-${i}`}
                        className="text-[11px] text-gray-600 text-center"
                      >
                        {i}
                      </div>
                    ))}
                    {heatmapData.map((row, rIdx) => (
                      <React.Fragment key={`r-${rIdx}`}>
                        <div className="text-[11px] text-gray-700 h-[30px] flex items-center font-medium">
                          {DIAS[rIdx]}
                        </div>
                        {row.map((v, cIdx) => {
                          const bg =
                            v <= 0
                              ? "#ffffff"
                              : v < 2
                              ? "#fff8cc"
                              : v < 4
                              ? "#ffe066"
                              : v < 6
                              ? "#ff9f1c"
                              : v < 8
                              ? "#ff4d00"
                              : v < 9
                              ? "#b30000"
                              : "#000000";

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
                              style={{
                                backgroundColor: bg,
                                border: "1px solid rgba(255,255,255,0.4)",
                                borderRadius: "3px",
                                height: "30px",
                                cursor: "pointer",
                              }}
                            />
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Tooltip com cabeçalho formatado */}
                  {hover && hover.rows.length > 0 && (
                    <div
                      className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg text-xs max-w-[260px] overflow-hidden"
                      style={{
                        top: Math.max(0, hover.top - 100),
                        left: hover.left,
                      }}
                    >
                      <div className="sticky top-0 bg-blue-50 border-b border-blue-200 px-3 py-1 font-bold text-blue-700 text-[11px]">
                        Dia ({hover.dia}) / {hover.hora}
                      </div>
                      <div className="sticky top-6 bg-blue-50 border-b border-blue-200 px-3 py-1 font-semibold text-blue-700 text-[11px]">
                        Registro&nbsp;&nbsp;&nbsp;&nbsp;Qtde&nbsp;&nbsp;&nbsp;&nbsp;Intensidade
                      </div>
                      <div className="p-3 max-h-[160px] overflow-y-auto">
                        {hover.rows.slice(0, 8).map((r, i) => (
                          <div
                            key={`${r.nome}-${i}`}
                            className="grid grid-cols-3 gap-2 border-b border-gray-100 py-0.5 last:border-0"
                          >
                            <span className="truncate col-span-1">{r.nome}</span>
                            <span className="text-gray-700 text-right col-span-1">
                              {r.count}×
                            </span>
                            <span className="text-gray-600 text-right col-span-1">
                              {r.intensidade}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Legenda e total */}
              <div className="mt-4 flex flex-wrap items-center justify-between text-sm text-gray-600">
                <div>
                  Total de registros nos últimos 30 dias:{" "}
                  <strong>{totalRegistros30d}</strong>
                </div>
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  <span className="text-xs text-gray-500">Menos crítico</span>
                  <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: "#ffffff" }} />
                  <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: "#fff8cc" }} />
                  <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: "#ffe066" }} />
                  <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: "#ff9f1c" }} />
                  <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: "#ff4d00" }} />
                  <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: "#b30000" }} />
                  <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: "#000000" }} />
                  <span className="text-xs text-gray-500">Mais crítico</span>
                </div>
              </div>
            </Card>

            {/* Resumo */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card title="Total de Registros">
                <div className="text-2xl font-bold">{totalRegistros30d}</div>
                <p className="text-xs text-gray-500 mt-1">Últimos 30 dias</p>
              </Card>
              <Card title="Gatilho Mais Comum">
                <div className="text-2xl font-bold">
                  {paretoData.length > 0 ? paretoData[0].gatilho : "-"}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {paretoData.length > 0
                    ? `${paretoData[0].ocorrencias} ocorrências`
                    : "Aguardando dados"}
                </p>
              </Card>
              <Card title="Horário Crítico">
                <div className="text-2xl font-bold">
                  {horarioCritico.max > 0
                    ? `${horarioCritico.diaCrit} ${horarioCritico.horaCrit}`
                    : "-"}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {horarioCritico.max > 0
                    ? `Intensidade média ${horarioCritico.max.toFixed(1)}`
                    : "Aguardando dados"}
                </p>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
