import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/authContext";
import {
  Heart,
  PlayCircle,
  Users,
  Moon,
  CalendarX,
  PartyPopper,
  MessageCircle,
  Angry,
  House,
} from "lucide-react";

const gatilhos = [
  { id: "sex", label: "Sexo", icon: Heart, color: "text-red-500" },
  { id: "pornography", label: "Pornografia", icon: PlayCircle, color: "text-red-400" },
  { id: "bar", label: "Ambiente de Festa / Bar", icon: PartyPopper, color: "text-orange-500" },
  { id: "social", label: "Redes Sociais", icon: MessageCircle, color: "text-yellow-500" },
  { id: "social_pressure", label: "Influência de Amigos / Grupo", icon: Users, color: "text-blue-500" },
  { id: "anger", label: "Raiva", icon: Angry, color: "text-purple-500" },
  { id: "loneliness", label: "Solidão", icon: House, color: "text-purple-400" },
  { id: "tiredness", label: "Cansaço", icon: Moon, color: "text-yellow-600" },
  { id: "night", label: "Noite/Insônia", icon: Moon, color: "text-indigo-500" },
  { id: "absence_meetings", label: "Ausência de Reuniões", icon: CalendarX, color: "text-orange-400" },
  { id: "not_study_program", label: "Distanciamento do Programa", icon: CalendarX, color: "text-orange-700" },
];

export default function Registrar() {
  const [gatilhoSelecionado, setGatilhoSelecionado] = useState<string | null>(null);
  const [intensidade, setIntensidade] = useState(5);
  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  // 🔹 Verifica padrão de risco e dispara alerta
  async function verificarPadraoDeRisco(trigger: string) {
    if (!user) return;
    const agora = new Date();
    const inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0);
    const fim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59);

    console.log("🔍 Verificando padrões de risco entre:", inicio.toISOString(), "→", fim.toISOString());

    const { data: eventos, error } = await supabase
      .from("urge_events")
      .select("id, trigger, note, intensity, created_at")
      .eq("user_id", user.id)
      .eq("trigger", trigger)
      .gte("created_at", inicio.toISOString())
      .lte("created_at", fim.toISOString())
      .gte("intensity", 8)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("❌ Erro ao buscar eventos:", error.message);
      return;
    }

    console.log(`🧩 Foram encontrados ${eventos?.length || 0} eventos críticos hoje para '${trigger}'`);

    if (!eventos || eventos.length < 2) {
      console.log("ℹ️ Ainda não atingiu o padrão de risco (mínimo 2 eventos).");
      return;
    }

    // Busca o plano de prevenção do usuário
    const { data: config } = await supabase
      .from("user_config")
      .select("prevention_plan")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    const plano = config?.prevention_plan?.trim() || null;
    const notas = eventos.map((e) => e.note).filter((n) => n && n !== "EMPTY");
    const media =
      eventos.reduce((acc, e) => acc + (e.intensity || 0), 0) / eventos.length;

    // Grava alerta no Supabase
    const { error: insertError } = await supabase.from("alerts_log").insert([
      {
        user_id: user.id,
        trigger,
        intensity: Math.round(media),
        note: notas.join(" | ") || "Desejos intensos repetidos",
        message: plano
          ? `Você registrou desejos intensos repetidos. Relembre seu plano: ${plano}`
          : "Padrão de risco detectado. Evite o comportamento e busque apoio.",
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      console.error("❌ Erro ao inserir alerta:", insertError.message);
    } else {
      console.log("✅ ALERTA GRAVADO COM SUCESSO no alerts_log!");
    }

    // Toast visual
    toast({
      title: "⚠️ Padrão de Risco Detectado",
      description:
        (notas.length
          ? `Você registrou desejos intensos repetidos hoje relacionados a:\n${notas.join(
              "\n"
            )}\n\n`
          : "") +
        (plano
          ? `👉 Relembre seu plano:\n${plano}`
          : "Evite o comportamento o mais rápido possível e busque ajuda."),
      duration: 10000,
    });

    // Som leve de alerta
    try {
      const audio = new Audio("/sounds/alert.mp3");
      audio.volume = 0.4;
      await audio.play();
    } catch (err) {
      console.warn("🎧 Som de alerta não pôde ser reproduzido:", err);
    }
  }

  // 🔹 Salva o registro
  async function handleSalvar() {
    if (!user) return;
    if (intensidade >= 8 && observacao.trim().length < 15) {
      alert("Por favor, descreva sua observação (mínimo de 15 caracteres).");
      return;
    }
    if (!gatilhoSelecionado) {
      alert("Selecione um gatilho antes de salvar.");
      return;
    }

    setSalvando(true);

    try {
      const { error } = await supabase.from("urge_events").insert([
        {
          user_id: user.id,
          trigger: gatilhoSelecionado,
          intensity: intensidade,
          note: observacao.trim() || "EMPTY",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setMensagem("✅ Registro salvo com sucesso!");
      setGatilhoSelecionado(null);
      setIntensidade(5);
      setObservacao("");

      if (intensidade >= 8) {
        await verificarPadraoDeRisco(gatilhoSelecionado);
      }
    } catch (err: any) {
      console.error("Erro ao salvar:", err.message);
      setMensagem("❌ Erro ao salvar registro.");
    } finally {
      setSalvando(false);
    }
  }

  // 🔹 Render
  return (
    <>
      <div className="max-w-3xl mx-auto aurora-glass rounded-3xl p-6 mt-6 space-y-6">
        <div>
          <h2 className="text-3xl font-display font-bold aurora-text-glow tracking-tight mb-1">Registrar Desejo</h2>
          <p className="text-muted-foreground mb-4">
            Identifique e registre seus gatilhos para reconhecer padrões.
          </p>
          <div className="w-full h-[2px] aurora-gradient-bg mb-4" />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Importante:</strong> Os dados deste aplicativo são pessoais e confidenciais. Em crise,
              ligue <strong className="text-foreground">188</strong> (CVV – Brasil).
            </p>
            <div
              className="text-sm aurora-glass rounded-lg p-2 mt-2 md:mt-0"
              style={{ color: "var(--aurora-foreground)" }}
            >
              <strong>📞 Linha de Ajuda AA:</strong> +55 (11) 3229-3611
            </div>
          </div>
        </div>

        {/* Gatilhos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {gatilhos.map((g) => {
            const Icon = g.icon;
            const ativo = gatilhoSelecionado === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setGatilhoSelecionado(g.id)}
                className={`p-3 border rounded-xl flex flex-col items-center justify-center transition-all ${
                  ativo
                    ? "border-transparent shadow"
                    : "border-border bg-secondary/40 hover:bg-secondary/60"
                }`}
                style={
                  ativo
                    ? {
                        backgroundImage: "var(--aurora-gradient)",
                        color: "var(--aurora-primary-foreground)",
                        boxShadow: "var(--aurora-shadow-glow)",
                      }
                    : undefined
                }
              >
                <Icon size={24} className={`${ativo ? "text-white" : g.color} mb-1`} />
                <span className="text-xs text-center">{g.label}</span>
              </button>
            );
          })}
        </div>

        {/* Intensidade */}
        <div className="relative">
          <label className="font-medium text-sm block mb-1 text-foreground">Intensidade: {intensidade}/10</label>
          {intensidade >= 8 && (
            <p
              className="absolute -top-6 right-0 font-semibold text-sm"
              style={{ color: "oklch(0.72 0.19 25)" }}
            >
              Atenção, busque ajuda assim que possível!!!
            </p>
          )}
          <input
            type="range"
            min="1"
            max="10"
            value={intensidade}
            onChange={(e) => setIntensidade(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background:
                "linear-gradient(to right, #ffffff 0%, #fff8cc 16%, #ffe066 32%, #ff9f1c 56%, #b30000 80%, #000000 100%)",
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Fraco</span>
            <span>Moderado</span>
            <span>Intenso</span>
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="font-medium text-sm block mb-1 text-foreground">
            Observações {intensidade >= 8 && <span style={{ color: "oklch(0.72 0.19 25)" }}>(obrigatório)</span>}
          </label>
          <textarea
            rows={3}
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="O que você estava fazendo? Como se sentia? O que ajudou ou não ajudou?"
            className={`w-full rounded-lg border bg-secondary/60 p-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
              intensidade >= 8 && observacao.trim().length < 15
                ? "border-red-400 focus:ring-red-400"
                : "border-border focus:ring-ring"
            }`}
          />
        </div>

        {/* Botão */}
        <button
          onClick={handleSalvar}
          disabled={salvando}
          className={`w-full py-3 rounded-lg font-semibold transition ${
            salvando ? "cursor-not-allowed opacity-60" : ""
          }`}
          style={{
            backgroundImage: "var(--aurora-gradient)",
            color: "var(--aurora-primary-foreground)",
          }}
        >
          {salvando ? "Salvando..." : "Salvar Desejo"}
        </button>

        {mensagem && <p className="text-center mt-3 text-sm font-medium text-foreground">{mensagem}</p>}
      </div>

      <footer className="max-w-3xl mx-auto text-center mt-8 mb-10 aurora-glass rounded-2xl p-4">
        <p className="text-base font-display font-semibold aurora-text-glow-soft">💡 Dica</p>
        <p className="text-sm text-muted-foreground mt-1">
          Registrar seus desejos ajuda você a identificar padrões e antecipar situações de risco.{" "}
          <strong className="text-foreground">Quanto mais você registra, mais clareza terá sobre seus gatilhos pessoais.</strong>
        </p>
      </footer>
    </>
  );
}
