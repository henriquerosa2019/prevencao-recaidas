import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const FELLOWSHIPS = ["AA", "NA", "DASA", "Al-Anon", "Grupo de Apoio Online", "Outro"];
const MEETING_TYPES = [
  "TemÃ¡tica",
  "Depoimento",
  "Estudo de Literatura",
  "Passos",
  "ReuniÃ£o de NegÃ³cios",
  "Festiva",
];
const SERVICES = ["CafÃ©", "RecepÃ§Ã£o", "Leitura de Literatura", "Secretariado"];

function nowLocalDatetime() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function Reunioes() {
  const [meetingDate, setMeetingDate] = useState(nowLocalDatetime());
  const [fellowship, setFellowship] = useState(FELLOWSHIPS[0]);
  const [groupName, setGroupName] = useState("");
  const [meetingType, setMeetingType] = useState(MEETING_TYPES[0]);
  const [services, setServices] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [historico, setHistorico] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    carregarHistorico();
  }, []);

  async function carregarHistorico() {
    setCarregando(true);
    const { data, error } = await supabase
      .from("meeting_logs")
      .select("*")
      .order("meeting_date", { ascending: false });
    if (error) console.error("Erro ao carregar reuniÃµes:", error);
    else setHistorico(data || []);
    setCarregando(false);
  }

  function toggleService(s: string) {
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function handleSalvar() {
    setSalvando(true);
    try {
      const { error } = await supabase.from("meeting_logs").insert([
        {
          meeting_date: new Date(meetingDate).toISOString(),
          fellowship,
          group_name: groupName.trim() || null,
          meeting_type: meetingType,
          service: services.length ? services.join(", ") : null,
          notes: notes.trim() || null,
        },
      ]);
      if (error) throw error;

      toast({
        title: "âœ… ReuniÃ£o registrada",
        description: "Sua presenÃ§a foi salva com sucesso!",
        duration: 4000,
      });
      setGroupName("");
      setServices([]);
      setNotes("");
      setMeetingDate(nowLocalDatetime());
      carregarHistorico();
    } catch (err: any) {
      console.error("Erro ao salvar reuniÃ£o:", err.message || err);
      toast({
        title: "Erro ao salvar",
        description: "Verifique as permissÃµes no Supabase (RLS).",
        duration: 5000,
      });
    } finally {
      setSalvando(false);
    }
  }

  const contadores = useMemo(() => {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const inicioAno = new Date(agora.getFullYear(), 0, 1);
    const mes = historico.filter((h) => new Date(h.meeting_date) >= inicioMes).length;
    const ano = historico.filter((h) => new Date(h.meeting_date) >= inicioAno).length;
    return { mes, ano, total: historico.length };
  }, [historico]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white shadow border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{contadores.mes}</p>
          <p className="text-xs text-gray-500 mt-1">Este mÃªs</p>
        </div>
        <div className="rounded-xl bg-white shadow border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{contadores.ano}</p>
          <p className="text-xs text-gray-500 mt-1">Este ano</p>
        </div>
        <div className="rounded-xl bg-white shadow border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{contadores.total}</p>
          <p className="text-xs text-gray-500 mt-1">Total registrado</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold">âœï¸ Registrar ReuniÃ£o</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Data e hora</label>
            <input
              type="datetime-local"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Irmandade</label>
            <select
              value={fellowship}
              onChange={(e) => setFellowship(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            >
              {FELLOWSHIPS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do grupo</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Ex: Grupo EsperanÃ§a"
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de reuniÃ£o</label>
            <select
              value={meetingType}
              onChange={(e) => setMeetingType(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            >
              {MEETING_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">ServiÃ§o realizado</label>
          <div className="flex flex-wrap gap-3">
            {SERVICES.map((s) => (
              <label key={s} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={services.includes(s)}
                  onChange={() => toggleService(s)}
                />
                {s}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ObservaÃ§Ãµes</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="O que essa reuniÃ£o te trouxe hoje?"
            className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <Button
          onClick={handleSalvar}
          disabled={salvando}
          className={`w-full py-3 rounded-lg text-white font-semibold transition ${
            salvando ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {salvando ? "Salvando..." : "Salvar ReuniÃ£o"}
        </Button>
      </div>

      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">ðŸ“‹ HistÃ³rico de ReuniÃµes</h2>
        {carregando ? (
          <p className="text-center text-gray-500 py-4">Carregando...</p>
        ) : historico.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Nenhuma reuniÃ£o registrada ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Data</th>
                  <th className="py-2 pr-4">Irmandade</th>
                  <th className="py-2 pr-4">Grupo</th>
                  <th className="py-2 pr-4">Tipo</th>
                  <th className="py-2">ServiÃ§o</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((h) => (
                  <tr key={h.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {new Date(h.meeting_date).toLocaleString("pt-BR", {
                        timeZone: "America/Sao_Paulo",
                      })}
                    </td>
                    <td className="py-2 pr-4">{h.fellowship}</td>
                    <td className="py-2 pr-4">{h.group_name || "â€”"}</td>
                    <td className="py-2 pr-4">{h.meeting_type || "â€”"}</td>
                    <td className="py-2 text-gray-600">{h.service || "â€”"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
