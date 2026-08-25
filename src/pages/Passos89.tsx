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
const STATUS_COLOR: Record<string, React.CSSProperties> = {
  em_preparacao: { backgroundColor: "oklch(0.75 0.15 85 / 20%)", color: "oklch(0.88 0.13 85)" },
  pronto: { backgroundColor: "oklch(0.78 0.15 205 / 20%)", color: "oklch(0.88 0.1 205)" },
  concluido: { backgroundColor: "oklch(0.7 0.17 150 / 20%)", color: "oklch(0.85 0.15 150)" },
};

export default function Passos89() {
  const [person, setPerson] = useState("");
  const [harmDescription, setHarmDescription] = useState("");
  const [sponsorSuggestions, setSponsorSuggestions] = useState("");
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
          sponsor_suggestions: sponsorSuggestions.trim() || null,
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
      setSponsorSuggestions("");
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
      <div className="aurora-glass rounded-3xl p-6 space-y-4">
        <h2 className="text-xl font-display font-bold aurora-text-glow">🤝 8º e 9º Passo — Lista de Reparação</h2>
        <p className="text-sm text-muted-foreground">
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
            className="w-full rounded-lg border border-border bg-secondary/60 p-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Dano causado</label>
          <textarea
            rows={3}
            value={harmDescription}
            onChange={(e) => setHarmDescription(e.target.value)}
            placeholder="Descreva brevemente o que aconteceu..."
            className="w-full rounded-lg border border-border bg-secondary/60 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sugestões do Padrinho/Madrinha</label>
          <textarea
            rows={3}
            value={sponsorSuggestions}
            onChange={(e) => setSponsorSuggestions(e.target.value)}
            placeholder="O que seu padrinho/madrinha sugeriu sobre essa reparação..."
            className="w-full rounded-lg border border-border bg-secondary/60 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
              className="w-full rounded-lg border border-border bg-secondary/60 p-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data planejada</label>
            <input
              type="date"
              value={plannedDate}
              onChange={(e) => setPlannedDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary/60 p-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <Button
          onClick={handleSalvar}
          disabled={salvando}
          className="w-full py-3 rounded-lg font-semibold transition"
        >
          {salvando ? "Salvando..." : "Adicionar à Lista"}
        </Button>
      </div>

      <div className="aurora-glass rounded-3xl p-6">
        <h2 className="text-xl font-display font-bold aurora-text-glow mb-4">📋 Minha Lista de Reparação</h2>
        {carregando ? (
          <p className="text-center text-muted-foreground py-4">Carregando...</p>
        ) : itens.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Nenhum item registrado ainda.</p>
        ) : (
          <div className="space-y-3">
            {itens.map((item) => (
              <div
                key={item.id}
                className="aurora-glass rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.person}</p>
                    <span
                      className="text-[10px] uppercase tracking-wide rounded-full px-2 py-0.5"
                      style={STATUS_COLOR[item.status]}
                    >
                      {STATUS_LABEL[item.status]}
                    </span>
                  </div>
                  {item.harm_description && (
                    <p className="text-sm text-muted-foreground mt-1">{item.harm_description}</p>
                  )}
                  {item.sponsor_suggestions && (
                    <p
                      className="text-sm mt-2 rounded-lg p-2"
                      style={{
                        backgroundColor: "var(--aurora-secondary)",
                        border: "1px solid var(--aurora-border)",
                        color: "var(--aurora-foreground)",
                      }}
                    >
                      <strong style={{ color: "var(--aurora-primary)" }}>💡 Sugestões do Padrinho/Madrinha:</strong>{" "}
                      {item.sponsor_suggestions}
                    </p>
                  )}
                  {item.reparation_type && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Reparação: {item.reparation_type}
                    </p>
                  )}
                  {item.planned_date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Planejado para{" "}
                      {new Date(`${item.planned_date}T00:00:00`).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                  {item.completed_at && (
                    <p className="text-xs mt-1" style={{ color: "oklch(0.75 0.15 150)" }}>
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
