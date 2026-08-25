// src/pages/Aniversarios.tsx
//
// 🎟️ Aniversários/Fichas — registro de datas de ingresso/troca de ficha de
// padrinho, madrinha e afilhados(as), com histórico ilimitado. O app usa
// essas datas (veja src/lib/anniversaryGate.ts) para descobrir, a cada
// login, quem está completando um marco hoje (Abertura.tsx mostra o aviso).
//
// ⚠️ Recaída — registro pessoal de recaídas do próprio usuário. Uma recaída
// reinicia a contagem de sobriedade (Dashboard e o aniversário do próprio
// usuário passam a contar a partir da recaída mais recente).

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/authContext";
import { FICHA_MILESTONES, PERSON_ROLES, roleLabel } from "@/lib/anniversaryGate";
import { Trash2 } from "lucide-react";

function hojeISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function agoraHHMM() {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
}

function formatarData(dataISO: string) {
  if (!dataISO) return "—";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function Aniversarios() {
  const { toast } = useToast();
  const { user } = useAuth();

  // 🎟️ Fichas/Aniversários
  const [personRole, setPersonRole] = useState(PERSON_ROLES[0].key);
  const [personName, setPersonName] = useState("");
  const [eventDate, setEventDate] = useState(hojeISO());
  const [milestone, setMilestone] = useState(FICHA_MILESTONES[0].key);
  const [salvandoFicha, setSalvandoFicha] = useState(false);
  const [fichas, setFichas] = useState<any[]>([]);
  const [carregandoFichas, setCarregandoFichas] = useState(true);

  // ⚠️ Recaída
  const [relapseDate, setRelapseDate] = useState(hojeISO());
  const [relapseTime, setRelapseTime] = useState(agoraHHMM());
  const [relapseReason, setRelapseReason] = useState("");
  const [salvandoRecaida, setSalvandoRecaida] = useState(false);
  const [recaidas, setRecaidas] = useState<any[]>([]);
  const [carregandoRecaidas, setCarregandoRecaidas] = useState(true);

  useEffect(() => {
    if (user) {
      carregarFichas();
      carregarRecaidas();
    }
  }, [user]);

  async function carregarFichas() {
    if (!user) return;
    setCarregandoFichas(true);
    const { data, error } = await supabase
      .from("sponsor_anniversaries")
      .select("*")
      .eq("user_id", user.id)
      .order("event_date", { ascending: false });
    if (error) console.error("Erro ao carregar fichas:", error);
    else setFichas(data || []);
    setCarregandoFichas(false);
  }

  async function carregarRecaidas() {
    if (!user) return;
    setCarregandoRecaidas(true);
    const { data, error } = await supabase
      .from("relapses")
      .select("*")
      .eq("user_id", user.id)
      .order("relapse_date", { ascending: false });
    if (error) console.error("Erro ao carregar recaídas:", error);
    else setRecaidas(data || []);
    setCarregandoRecaidas(false);
  }

  async function handleSalvarFicha() {
    if (!user) return;
    if (!personName.trim()) {
      toast({ title: "Digite o nome da pessoa.", duration: 3000 });
      return;
    }
    setSalvandoFicha(true);
    try {
      const { error } = await supabase.from("sponsor_anniversaries").insert([
        {
          user_id: user.id,
          person_role: personRole,
          person_name: personName.trim(),
          event_date: eventDate,
          milestone: FICHA_MILESTONES.find((m) => m.key === milestone)?.label || milestone,
        },
      ]);
      if (error) throw error;
      toast({ title: "✅ Ficha registrada", duration: 3000 });
      setPersonName("");
      carregarFichas();
    } catch (err: any) {
      console.error("Erro ao salvar ficha:", err.message || err);
      toast({ title: "Erro ao salvar", description: "Verifique as permissões no Supabase (RLS).", duration: 5000 });
    } finally {
      setSalvandoFicha(false);
    }
  }

  async function handleExcluirFicha(id: string) {
    if (!user) return;
    const { error } = await supabase.from("sponsor_anniversaries").delete().eq("id", id).eq("user_id", user.id);
    if (error) {
      toast({ title: "Erro ao excluir", duration: 4000 });
      return;
    }
    setFichas((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleSalvarRecaida() {
    if (!user) return;
    setSalvandoRecaida(true);
    try {
      const { error } = await supabase.from("relapses").insert([
        {
          user_id: user.id,
          relapse_date: relapseDate,
          relapse_time: relapseTime || null,
          reason: relapseReason.trim() || null,
        },
      ]);
      if (error) throw error;
      toast({
        title: "Recaída registrada",
        description: "Sua contagem de sobriedade foi reiniciada a partir dessa data. Você consegue recomeçar.",
        duration: 6000,
      });
      setRelapseReason("");
      setRelapseDate(hojeISO());
      setRelapseTime(agoraHHMM());
      carregarRecaidas();
    } catch (err: any) {
      console.error("Erro ao salvar recaída:", err.message || err);
      toast({ title: "Erro ao salvar", description: "Verifique as permissões no Supabase (RLS).", duration: 5000 });
    } finally {
      setSalvandoRecaida(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 🎟️ Fichas/Aniversários */}
      <div className="aurora-glass rounded-3xl p-6 space-y-4">
        <h2 className="text-xl font-display font-bold aurora-text-glow">🎟️ Registrar Ficha/Aniversário</h2>
        <p className="text-sm text-muted-foreground">
          Guarde a data de ingresso ou de troca de ficha do seu padrinho, madrinha ou afilhado(a). O
          app avisa automaticamente quando alguém estiver completando um marco.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Padrinho/Madrinha/Afilhado(a)</label>
            <select
              value={personRole}
              onChange={(e) => setPersonRole(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary/60 p-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {PERSON_ROLES.map((r) => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Nome da pessoa"
              className="w-full rounded-lg border border-border bg-secondary/60 p-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Data de Ingresso/Troca de Ficha</label>
            <input
              type="date"
              value={eventDate}
              max={hojeISO()}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary/60 p-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ficha/Tempo de sobriedade</label>
            <select
              value={milestone}
              onChange={(e) => setMilestone(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary/60 p-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {FICHA_MILESTONES.map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <Button onClick={handleSalvarFicha} disabled={salvandoFicha} className="w-full py-2.5 rounded-lg font-semibold">
          {salvandoFicha ? "Salvando..." : "Salvar Ficha"}
        </Button>
      </div>

      <div className="aurora-glass rounded-3xl p-6">
        <h2 className="text-lg font-display font-bold aurora-text-glow mb-4">📋 Histórico de Fichas</h2>
        {carregandoFichas ? (
          <p className="text-center text-muted-foreground py-4">Carregando...</p>
        ) : fichas.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Nenhuma ficha registrada ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 pr-4">Data</th>
                  <th className="py-2 pr-4">Quem</th>
                  <th className="py-2 pr-4">Nome</th>
                  <th className="py-2 pr-4">Ficha</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {fichas.map((f) => (
                  <tr key={f.id} className="border-b border-border last:border-0">
                    <td className="py-2 pr-4 whitespace-nowrap">{formatarData(f.event_date)}</td>
                    <td className="py-2 pr-4">{roleLabel(f.person_role)}</td>
                    <td className="py-2 pr-4">{f.person_name}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{f.milestone}</td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => handleExcluirFicha(f.id)}
                        aria-label="Excluir"
                        className="text-muted-foreground hover:text-destructive transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ⚠️ Recaída */}
      <div className="aurora-glass rounded-3xl p-6 space-y-4" style={{ border: "1px solid oklch(0.62 0.2 25 / 0.4)" }}>
        <h2 className="text-xl font-display font-bold" style={{ color: "oklch(0.72 0.19 25)" }}>⚠️ Recaída</h2>
        <p className="text-sm text-muted-foreground">
          Se você recaiu, registre aqui. Não há julgamento — isso é parte da recuperação. Sua
          contagem de sobriedade (Dashboard e aniversários) passa a valer a partir dessa data.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Recaí dia</label>
            <input
              type="date"
              value={relapseDate}
              max={hojeISO()}
              onChange={(e) => setRelapseDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary/60 p-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hora</label>
            <input
              type="time"
              value={relapseTime}
              onChange={(e) => setRelapseTime(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary/60 p-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Razão/causa da recaída</label>
          <textarea
            rows={3}
            value={relapseReason}
            onChange={(e) => setRelapseReason(e.target.value)}
            placeholder="O que aconteceu?"
            className="w-full rounded-lg border border-border bg-secondary/60 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <Button
          onClick={handleSalvarRecaida}
          disabled={salvandoRecaida}
          className="w-full py-2.5 rounded-lg font-semibold"
          style={{ backgroundColor: "oklch(0.62 0.2 25)", color: "white" }}
        >
          {salvandoRecaida ? "Salvando..." : "Registrar Recaída"}
        </Button>

        {!carregandoRecaidas && recaidas.length > 0 && (
          <div className="pt-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Histórico</p>
            <div className="space-y-1.5">
              {recaidas.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm rounded-lg bg-secondary/40 px-3 py-2">
                  <span>
                    {formatarData(r.relapse_date)}
                    {r.relapse_time ? ` às ${r.relapse_time.slice(0, 5)}` : ""}
                  </span>
                  {r.reason && <span className="text-muted-foreground truncate ml-3 max-w-[60%]">{r.reason}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
