import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const STATUS_ORDER = ["em_preparacao", "pronto", "concluido"] as const;
const STATUS_LABEL: Record<string, string> = {
  em_preparacao: "Em Preparação",
  pronto: "Pronto",
  concluido: "Concluído",
};
const STATUS_COLOR: Record<string, string> = {
  em_preparacao: "bg-yellow-100 text-yellow-700",
  pronto: "bg-blue-100 text-blue-700",
  concluido: "bg-green-100 text-green-700",
};

export default function Passos89() {
  const [person, setPerson] = useState("");
  const [harmDescription, setHarmDescription] = useState("");
  const [reparationType, setReparationType] = useState("");
  const [plannedDate, setPlannedDate] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [itens, setItens] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    carregarItens();
  }, []);

  async function carregarItens() {
    setCarregando(true);
    const { data, error } = await supabase
      .from("step_inventory_89")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error("Erro ao carregar lista de reparação:", error);
    else setItens(data || []);
    setCarregando(false);
  }

  async function handleSalvar() {
    if (!person.trim()) {
      toast({ title: "Informe o nome da pessoa antes de salvar.", duration: 3000 });
      return;
    }
    setSalvando(true);
    try {
      const { error } = await supabase.from("step_inventory_89").insert([
        {
          person: person.trim(),
          harm_description: harmDescription.trim() || null,
          reparation_type: reparationType.trim() || null,
          planned_date: plannedDate || null,
        },
      ]);
      if (error) throw error;

      toast({
        title: "✅ Item adicionado",
        description: "Adicionado à sua lista de reparação.",
        duration: 4000,
      });
      setPerson("");
      setHarmDescription("");
      setReparationType("");
      setPlannedDate("");
      carregarItens();
    } catch (err: any) {
      console.error("Erro ao salvar item:", err.message || err);
      toast({
        title: "Erro ao salvar",
        description: "Verifique as permissões no Supabase (RLS).",
        duration: 5000,
      });
    } finally {
      setSalvando(false);
    }
  }

  async function avancarStatus(item: any) {
    const idx = STATUS_ORDER.indexOf(item.status);
    const proximo = STATUS_ORDER[Math.min(idx + 1, STATUS_ORDER.length - 1)];
    const update: any = { status: proximo };
    if (proximo === "concluido") update.completed_at = new Date().toISOString();

    const { error } = await supabase.from("step_inventory_89").update(update).eq("id", item.id);
    if (error) {
      console.error(error);
      toast({ title: "Erro ao atualizar item", duration: 4000 });
      return;
    }
    toast({
      title:
        proximo === "concluido"
          ? "🙌 Reparação concluída!"
          : `Status atualizado para "${STATUS_LABEL[proximo]}"`,
      duration: 3500,
    });
    carregarItens();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold">🤝 8º e 9º Passo — Lista de Reparação</h2>
        <p className="text-sm text-gray-600">
          Liste as pessoas que você prejudicou e o plano para reparar os danos, quando
          possível e sem causar mais mal.
        </p>

        <div>
          <label className="block text-sm font-medium mb-1">Pessoa</label>
          <input
            type="text"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            placeholder="Nome da pessoa prejudicada"
            className="w-full border rounded-lg p-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Dano causado</label>
          <textarea
            rows={3}
            value={harmDescription}
            onChange={(e) => setHarmDescription(e.target.value)}
            placeholder="Descreva brevemente o que aconteceu..."
            className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de reparação</label>
            <input
              type="text"
              value={reparationType}
              onChange={(e) => setReparationType(e.target.value)}
              placeholder="Ex: Pedido de desculpas, reparação financeira..."
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data planejada</label>
            <input
              type="date"
              value={plannedDate}
              onChange={(e) => setPlannedDate(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
        </div>

        <Button
          onClick={handleSalvar}
          disabled={salvando}
          className={`w-full py-3 rounded-lg text-white font-semibold transition ${
            salvando ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {salvando ? "Salvando..." : "Adicionar à Lista"}
        </Button>
      </div>

      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">📋 Minha Lista de Reparação</h2>
        {carregando ? (
          <p className="text-center text-gray-500 py-4">Carregando...</p>
        ) : itens.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Nenhum item registrado ainda.</p>
        ) : (
          <div className="space-y-3">
            {itens.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.person}</p>
                    <span
                      className={`text-[10px] uppercase tracking-wide rounded-full px-2 py-0.5 ${STATUS_COLOR[item.status]}`}
                    >
                      {STATUS_LABEL[item.status]}
                    </span>
                  </div>
                  {item.harm_description && (
                    <p className="text-sm text-gray-600 mt-1">{item.harm_description}</p>
                  )}
                  {item.reparation_type && (
                    <p className="text-xs text-gray-500 mt-1">
                      Reparação: {item.reparation_type}
                    </p>
                  )}
                  {item.planned_date && (
                    <p className="text-xs text-gray-400 mt-1">
                      Planejado para{" "}
                      {new Date(`${item.planned_date}T00:00:00`).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                  {item.completed_at && (
                    <p className="text-xs text-green-600 mt-1">
                      Concluído em {new Date(item.completed_at).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
                {item.status !== "concluido" && (
                  <Button
                    variant="outline"
                    onClick={() => avancarStatus(item)}
                    className="shrink-0"
                  >
                    {item.status === "em_preparacao" ? "Marcar como Pronto" : "Marcar como Concluído"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
