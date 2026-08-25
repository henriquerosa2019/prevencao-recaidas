// src/pages/HistoricoGatilhos.tsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/authContext";

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

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

const GATILHO_COR: Record<string, string> = {
  "Ausência de Reuniões": "#0284c7",
  "Bar/Festa": "#9333ea",
  "Cansaço": "#64748b",
  "Distanciamento do Programa": "#78350f",
  "Influência de Amigos / Grupo": "#0d9488",
  "Noite/Insônia": "#4338ca",
  Pornografia: "#dc2626",
  Raiva: "#ea580c",
  "Redes Sociais": "#2563eb",
  Sexo: "#db2777",
  Solidão: "#16a34a",
};

function corGatilho(nome: string) {
  return GATILHO_COR[nome] || "#6b7280";
}

export default function HistoricoGatilhos() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroTag, setFiltroTag] = useState("todos");
  const [filtroDia, setFiltroDia] = useState("todos");
  const [filtroIntensidade, setFiltroIntensidade] = useState("todos");
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  async function fetchData() {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("urge_events")
      .select("created_at, trigger, intensity, note")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error("Erro ao buscar histórico de gatilhos:", error);
    else setData(data || []);
    setLoading(false);
  }

  const enriquecidos = useMemo(() => {
    return data.map((d) => {
      const dt = new Date(d.created_at);
      const local = new Date(
        dt.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
      );
      return {
        ...d,
        gatilho: TRADUCOES_GATILHOS[d.trigger] || d.trigger,
        diaSemana: local.getDay(),
      };
    });
  }, [data]);

  const gatilhosDisponiveis = useMemo(() => {
    const nomes = new Set<string>();
    Object.values(TRADUCOES_GATILHOS).forEach((n) => nomes.add(n));
    return Array.from(nomes).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, []);

  const filtrados = useMemo(() => {
    return enriquecidos.filter((d) => {
      if (filtroTag !== "todos" && d.gatilho !== filtroTag) return false;
      if (filtroDia !== "todos" && d.diaSemana !== Number(filtroDia)) return false;
      if (filtroIntensidade !== "todos" && d.intensity !== Number(filtroIntensidade)) return false;
      return true;
    });
  }, [enriquecidos, filtroTag, filtroDia, filtroIntensidade]);

  // 📊 Ranking de gatilhos (sempre do maior para o menor número de ocorrências)
  const ranking = useMemo(() => {
    const counts: Record<string, number> = {};
    filtrados.forEach((d) => {
      counts[d.gatilho] = (counts[d.gatilho] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([gatilho, ocorrencias]) => ({ gatilho, ocorrencias }))
      .sort((a, b) => b.ocorrencias - a.ocorrencias);
  }, [filtrados]);

  const registrosOrdenados = useMemo(() => {
    return [...filtrados].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [filtrados]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-display font-bold aurora-text-glow">📜 Histórico de Gatilhos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Filtre por tipo de gatilho e por dia da semana. O ranking abaixo é sempre
          ordenado do gatilho mais recorrente para o menos recorrente.
        </p>
      </div>

      {/* 🎛️ Filtros */}
      <div className="aurora-glass rounded-3xl p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold mb-1 text-accent">Tag</label>
          <select
            value={filtroTag}
            onChange={(e) => setFiltroTag(e.target.value)}
            className="rounded-lg border border-border bg-secondary/60 p-2 text-sm text-foreground min-w-[220px] focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="todos">Todos os gatilhos</option>
            {gatilhosDisponiveis.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-accent">Dia</label>
          <select
            value={filtroDia}
            onChange={(e) => setFiltroDia(e.target.value)}
            className="rounded-lg border border-border bg-secondary/60 p-2 text-sm text-foreground min-w-[180px] focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="todos">Todos os dias</option>
            {DIAS.map((dia, i) => (
              <option key={dia} value={i}>
                {dia}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-accent">Intensidade</label>
          <select
            value={filtroIntensidade}
            onChange={(e) => setFiltroIntensidade(e.target.value)}
            className="rounded-lg border border-border bg-secondary/60 p-2 text-sm text-foreground min-w-[160px] focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="todos">Todas as intensidades</option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {(filtroTag !== "todos" || filtroDia !== "todos" || filtroIntensidade !== "todos") && (
          <button
            onClick={() => {
              setFiltroTag("todos");
              setFiltroDia("todos");
              setFiltroIntensidade("todos");
            }}
            className="aurora-glass rounded-lg px-3 py-2 text-sm hover:brightness-125 transition"
          >
            Limpar filtros
          </button>
        )}

        <div className="ml-auto text-sm text-muted-foreground">
          {filtrados.length} registro{filtrados.length === 1 ? "" : "s"} encontrado
          {filtrados.length === 1 ? "" : "s"}
        </div>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">Carregando...</p>
      ) : (
        <>
          {/* 🏆 Ranking (maior → menor) */}
          <div className="aurora-glass rounded-3xl p-4 md:p-6">
            <h2 className="text-lg font-display font-semibold mb-3 aurora-text-glow">Ranking de Gatilhos</h2>
            {ranking.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum registro para os filtros selecionados.</p>
            ) : (
              <div className="space-y-2">
                {ranking.map((r, i) => {
                  const max = ranking[0].ocorrencias;
                  return (
                    <div key={r.gatilho} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                      <span className="text-sm w-44 shrink-0 truncate flex items-center gap-1.5">
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ backgroundColor: corGatilho(r.gatilho) }}
                        />
                        {r.gatilho}
                      </span>
                      <div
                        className="flex-1 rounded-full h-3 overflow-hidden"
                        style={{ backgroundColor: "var(--aurora-secondary)" }}
                      >
                        <div
                          className="h-3 rounded-full"
                          style={{
                            width: `${Math.max(4, (r.ocorrencias / max) * 100)}%`,
                            backgroundColor: corGatilho(r.gatilho),
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-10 text-right">
                        {r.ocorrencias}×
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 📋 Registros detalhados */}
          <div className="aurora-glass rounded-3xl p-4 md:p-6">
            <h2 className="text-lg font-display font-semibold mb-3 aurora-text-glow">Registros</h2>
            {registrosOrdenados.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhum registro encontrado para os filtros selecionados.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b border-border">
                      <th className="py-2 pr-4">Data/Hora</th>
                      <th className="py-2 pr-4">Gatilho</th>
                      <th className="py-2 pr-4">Intensidade</th>
                      <th className="py-2">Observação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrosOrdenados.map((d, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="py-2 pr-4 whitespace-nowrap">
                          {new Date(d.created_at).toLocaleString("pt-BR", {
                            timeZone: "America/Sao_Paulo",
                          })}
                        </td>
                        <td className="py-2 pr-4">
                          <span
                            className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                            style={{ backgroundColor: corGatilho(d.gatilho) }}
                          />
                          {d.gatilho}
                        </td>
                        <td className="py-2 pr-4">{d.intensity}/10</td>
                        <td className="py-2 text-muted-foreground">
                          {d.note && d.note !== "EMPTY" ? d.note : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
