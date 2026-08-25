import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Config() {
  const [periodo, setPeriodo] = useState("7d");
  const [ativarAlertas, setAtivarAlertas] = useState(true);
  const [plano, setPlano] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [padrinhoWhatsapp, setPadrinhoWhatsapp] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [abrindoWhatsapp, setAbrindoWhatsapp] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 🔹 Carrega a configuração existente (sem exigir user_id)
  useEffect(() => {
    async function carregarConfig() {
      try {
        const { data, error } = await supabase
          .from("user_config")
          .select(
            "default_period, alerts_enabled, prevention_plan, sobriety_start_date, sponsor_whatsapp"
          )
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setPeriodo(data.default_period || "7d");
          setAtivarAlertas(data.alerts_enabled ?? true);
          setPlano(data.prevention_plan || "");
          setDataInicio(data.sobriety_start_date || "");
          setPadrinhoWhatsapp(data.sponsor_whatsapp || "");
        }
      } catch (err) {
        console.warn("Nenhuma configuração encontrada ainda.");
      }
    }
    carregarConfig();
  }, []);

  // 📱 Normaliza número de WhatsApp brasileiro (aceita com ou sem DDI/símbolos)
  function normalizarWhatsapp(numero: string) {
    const apenasDigitos = numero.replace(/\D/g, "");
    if (!apenasDigitos) return "";
    if (apenasDigitos.startsWith("55") && apenasDigitos.length >= 12) {
      return apenasDigitos;
    }
    return `55${apenasDigitos}`;
  }

  // 📱 Salva o número (se necessário) e abre o WhatsApp imediatamente
  async function handleAdicionarPadrinho() {
    const numeroLimpo = normalizarWhatsapp(padrinhoWhatsapp);
    if (!numeroLimpo || numeroLimpo.length < 12) {
      toast({
        title: "Número inválido",
        description: "Digite um número de WhatsApp válido com DDD (ex: 11 91234-5678).",
        duration: 4000,
      });
      return;
    }

    setAbrindoWhatsapp(true);
    try {
      const { data: existente } = await supabase
        .from("user_config")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existente) {
        await supabase
          .from("user_config")
          .update({ sponsor_whatsapp: numeroLimpo, updated_at: new Date().toISOString() })
          .eq("id", existente.id);
      } else {
        await supabase
          .from("user_config")
          .insert([{ sponsor_whatsapp: numeroLimpo, created_at: new Date().toISOString() }]);
      }
    } catch (err) {
      console.error("Erro ao salvar contato do padrinho/madrinha:", err);
    } finally {
      setAbrindoWhatsapp(false);
    }

    window.open(`https://wa.me/${numeroLimpo}`, "_blank");
  }

  // 🔹 Salvar ou atualizar configuração
  async function handleSalvar() {
    setSalvando(true);
    setSalvo(false);
    try {
      // Verifica se já existe um registro
      const { data: existente } = await supabase
        .from("user_config")
        .select("id")
        .limit(1)
        .maybeSingle();

      const numeroLimpo = padrinhoWhatsapp ? normalizarWhatsapp(padrinhoWhatsapp) : null;

      if (existente) {
        const { error } = await supabase
          .from("user_config")
          .update({
            default_period: periodo,
            alerts_enabled: ativarAlertas,
            prevention_plan: plano.trim(),
            sobriety_start_date: dataInicio || null,
            sponsor_whatsapp: numeroLimpo,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existente.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_config").insert([
          {
            default_period: periodo,
            alerts_enabled: ativarAlertas,
            prevention_plan: plano.trim(),
            sobriety_start_date: dataInicio || null,
            sponsor_whatsapp: numeroLimpo,
            created_at: new Date().toISOString(),
          },
        ]);
        if (error) throw error;
      }

      setSalvo(true);
      toast({
        title: "✅ Configurações salvas",
        description: "Seu plano de prevenção foi salvo com sucesso!",
        duration: 4000,
      });
    } catch (err: any) {
      console.error("Erro ao salvar config:", err.message || err);
      toast({
        title: "Erro ao salvar",
        description: "Verifique as permissões no Supabase (RLS).",
        duration: 5000,
      });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <div className="max-w-3xl mx-auto aurora-glass rounded-3xl p-6 mt-6 space-y-8">
        {/* 🔗 Navegação */}
        <div className="flex justify-between mb-4">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            🏠 Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate("/registros")}>
            ✍️ Registrar Desejo
          </Button>
        </div>

        {/* Data de início da recuperação */}
        <section className="aurora-glass rounded-lg p-4">
          <h2 className="text-xl font-display font-bold aurora-text-glow mb-2">🏆 Sua Data de Início</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Usada para calcular seu contador de dias limpo no Dashboard.
          </p>
          <label className="block text-sm font-medium mb-1 text-foreground">
            Data em que você começou sua recuperação
          </label>
          <input
            type="date"
            value={dataInicio}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary/60 p-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </section>

        {/* Preferências */}
        <section>
          <h2 className="text-xl font-display font-bold aurora-text-glow mb-2">Preferências do Dashboard</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Configure como os gráficos são exibidos por padrão.
          </p>

          <label className="block text-sm font-medium text-foreground">Período padrão dos gráficos</label>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary/60 p-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-4"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="14d">Últimos 14 dias</option>
            <option value="30d">Últimos 30 dias</option>
          </select>

          <label className="flex items-center gap-2 mb-6">
            <input
              type="checkbox"
              checked={ativarAlertas}
              onChange={(e) => setAtivarAlertas(e.target.checked)}
              className="accent-primary"
            />
            <span className="text-sm text-foreground">Ativar alertas e lembretes</span>
          </label>
        </section>

        {/* Plano de Prevenção */}
        <section>
          <h2 className="text-xl font-display font-bold aurora-text-glow mb-2">Plano de Prevenção</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Liste ações que ajudam você a lidar com cravings.
          </p>
          <textarea
            rows={5}
            value={plano}
            onChange={(e) => setPlano(e.target.value)}
            placeholder="Exemplo: Ligar para meu padrinho, respirar fundo, orar, escrever, etc."
            className="w-full rounded-lg border border-border bg-secondary/60 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Este plano ficará disponível rapidamente quando você mais precisar (inclusive no
            botão de emergência).
          </p>
        </section>

        {/* 📱 Contato Padrinho/Madrinha */}
        <section className="aurora-glass rounded-lg p-4">
          <h2 className="text-lg font-display font-bold aurora-text-glow mb-2">📱 Padrinho/Madrinha</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Salve o WhatsApp do seu padrinho ou madrinha para falar com ele(a) rapidamente em
            momentos de fissura.
          </p>
          <label className="block text-sm font-medium mb-1 text-foreground">Número de WhatsApp</label>
          <input
            type="tel"
            value={padrinhoWhatsapp}
            onChange={(e) => setPadrinhoWhatsapp(e.target.value)}
            placeholder="Ex: (11) 91234-5678"
            className="w-full rounded-lg border border-border bg-secondary/60 p-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-3"
          />
          <Button
            onClick={handleAdicionarPadrinho}
            disabled={abrindoWhatsapp}
            className="w-full py-2.5 rounded-lg font-semibold"
          >
            {abrindoWhatsapp ? "Salvando..." : "💬 Adicionar Contato Padrinho/Madrinha"}
          </Button>
        </section>

        {/* Sobre seus dados */}
        <section className="aurora-glass rounded-lg p-4">
          <p className="font-medium aurora-text-glow-soft mb-1" style={{ color: "var(--aurora-primary)" }}>ℹ️ Sobre seus dados</p>
          <p className="text-sm text-muted-foreground">
            Todos os seus registros estão armazenados de forma segura e confiável, sob a proteção
            da LGPD (Lei Geral de Proteção de Dados), e nunca são compartilhados.
          </p>
        </section>

        {/* Botão salvar */}
        <div className="space-y-2">
          <Button
            onClick={handleSalvar}
            disabled={salvando}
            className="w-full py-3 rounded-lg font-semibold transition"
          >
            {salvando ? "Salvando..." : "Salvar Configurações"}
          </Button>

          {salvo && (
            <p
              className="text-center text-sm font-medium"
              style={{ color: "oklch(0.85 0.15 150)" }}
            >
              ✅ Configurações salvas com sucesso!
            </p>
          )}
        </div>
      </div>
    </>
  );
}
