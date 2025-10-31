import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts";
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
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl shadow-sm border border-gray-200 bg-white p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold mb-3">{title}</h2>
      {children}
      {footer ? <div className="mt-3 text-sm text-gray-600">{footer}</div> : null}
    </div>
  );
}

export default function UrgeDashboardMVP() {
  const [periodo, setPeriodo] = useState("14d");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  const lineData = useMemo(() => {
    const agrupado: Record<string, number[]> = {};
    data.forEach((d) => {
      const dataLocal = new Date(d.created_at).toLocaleDateString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      });
      agrupado[dataLocal] = agrupado[dataLocal] || [];
      agrupado[dataLocal].push(d.intensity);
    });
    return Object.entries(agrupado)
      .map(([dStr, intensidades]) => ({
        data: dStr,
        intensidade: parseFloat(
          (intensidades.reduce((a, b) => a + b, 0) / intensidades.length).toFixed(1)
        ),
      }))
      .sort((a, b) => {
        const da = a.data.split("/").reverse().join("-");
        const db = b.data.split("/").reverse().join("-");
        return da.localeCompare(db);
      });
  }, [data]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-200 z-10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold">MVP — Prevenção de Recaída</h1>
          <div className="flex gap-2 text-sm">
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
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 gap-6">
        {loading ? (
          <p className="text-center text-gray-500">Carregando dados...</p>
        ) : (
          <>
            {/* 📊 Pareto geral */}
            <Card title={`Pareto dos Gatilhos (${periodo})`}>
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paretoData} margin={{ bottom: 40 }}>
                    <XAxis
                      dataKey="gatilho"
                      tick={{ fontSize: 12, dy: 10 }}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={90}
                    />
                    <YAxis />
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

            {/* 🔥 Heatmap com mini-Pareto no hover */}
            <Card title={`Mapa de Calor de Desejos (${periodo})`}>
              <div className="overflow-x-auto">
                <div className="min-w-[700px] relative" ref={heatmapWrapRef}>
                  <div className="grid grid-cols-[56px_repeat(24,minmax(16px,1fr))] gap-1">
                    <div />
                    {Array.from({ length: 24 }, (_, i) => (
                      <div
                        key={`h-${i}`}
                        className="text-[10px] text-gray-500 text-center"
                      >
                        {i}
                      </div>
                    ))}
                    {heatmapData.map((row, rIdx) => (
                      <React.Fragment key={`r-${rIdx}`}>
                        <div className="text-[10px] text-gray-600 h-6 flex items-center">
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
                                height: "24px",
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
                  {(() => {
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
                    return max > 0 ? `${diaCrit} ${horaCrit}` : "-";
                  })()}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {(() => {
                    let max = 0;
                    heatmapData.forEach((row) =>
                      row.forEach((val) => {
                        if (val > max) max = val;
                      })
                    );
                    return max > 0
                      ? `Intensidade média ${max.toFixed(1)}`
                      : "Aguardando dados";
                  })()}
                </p>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
