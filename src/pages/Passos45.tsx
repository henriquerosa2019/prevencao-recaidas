import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function Passos45() {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [step5Date, setStep5Date] = useState("");
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
      .from("step_inventory_45")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error("Erro ao carregar inventário:", error);
    else setItens(data || []);
    setCarregando(false);
  }

  async function handleSalvar() {
    if (!subject.trim()) {
      toast({ title: "Informe o assunto/ressentimento antes de salvar.", duration: 3000 });
      return;
    }
    setSalvando(true);
    try {
      const { error } = await supabase.from("step_inventory_45").insert([
        {
          subject: subject.trim(),
          description: description.trim() || null,
          step5_scheduled_at: step5Date || null,
        },
      ]);
      if (error) throw error;

      toast({
        title: "✅ Item registrado",
        description: "Adicionado ao seu inventário moral.",
        duration: 4000,
      });
      setSubject("");
      setDescription("");
      setStep5Date("");
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

  async function marcarConcluido(id: string) {
    const { error } = await supabase
      .from("step_inventory_45")
      .update({ status: "concluido", completed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      console.error(error);
      toast({ title: "Erro ao atualizar item", duration: 4000 });
      return;
    }
    toast({ title: "🙌 5º Passo marcado como concluído!", duration: 4000 });
    carregarItens();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="aurora-glass rounded-3xl p-6 space-y-4">
        <h2 className="text-xl font-display font-bold aurora-text-glow">📖 4º e 5º Passo — Inventário Moral</h2>
        <p className="text-sm text-muted-foreground">
          Registre ressentimentos, medos e questões a trabalhar. Quando estiver pronto,
          marque o item como concluído ao fazer seu 5º Passo.
        </p>

        <div>
          <label className="block text-sm font-medium mb-1">
            Assunto / Ressentimento
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ex: Ressentimento com meu pai"
            className="w-full rounded-lg border border-border bg-secondary/60 p-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva a situação, a causa e como isso te afeta..."
            className="w-full rounded-lg border border-border bg-secondary/60 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Data prevista para o 5º Passo (opcional)
          </label>
          <input
            type="date"
            value={step5Date}
            onChange={(e) => setStep5Date(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary/60 p-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <Button
          onClick={handleSalvar}
          disabled={salvando}
          className="w-full py-3 rounded-lg font-semibold transition"
        >
          {salvando ? "Salvando..." : "Adicionar ao Inventário"}
        </Button>
      </div>

      <div className="aurora-glass rounded-3xl p-6">
        <h2 className="text-xl font-display font-bold aurora-text-glow mb-4">📋 Meu Inventário</h2>
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
                    <p className="font-medium">{item.subject}</p>
                    <span
                      className="text-[10px] uppercase tracking-wide rounded-full px-2 py-0.5"
                      style={
                        item.status === "concluido"
                          ? { backgroundColor: "oklch(0.7 0.17 150 / 20%)", color: "oklch(0.85 0.15 150)" }
                          : { backgroundColor: "oklch(0.75 0.15 85 / 20%)", color: "oklch(0.88 0.13 85)" }
                      }
                    >
                      {item.status === "concluido" ? "Concluído" : "Aberto"}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  )}
                  {item.step5_scheduled_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      5º Passo previsto:{" "}
                      {new Date(`${item.step5_scheduled_at}T00:00:00`).toLocaleDateString(
                        "pt-BR"
                      )}
                    </p>
                  )}
                  {item.completed_at && (
                    <p className="text-xs mt-1" style={{ color: "oklch(0.75 0.15 150)" }}>
                      Concluído em{" "}
                      {new Date(item.completed_at).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
                {item.status !== "concluido" && (
                  <Button
                    variant="outline"
                    onClick={() => marcarConcluido(item.id)}
                    className="shrink-0"
                  >
                    Marcar 5º Passo Concluído
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
