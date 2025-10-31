import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/Layout/Header";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Config() {
  const [periodo, setPeriodo] = useState("7d");
  const [ativarAlertas, setAtivarAlertas] = useState(true);
  const [plano, setPlano] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 🔹 Carrega a configuração existente (sem exigir user_id)
  useEffect(() => {
    async function carregarConfig() {
      try {
        const { data, error } = await supabase
          .from("user_config")
          .select("default_period, alerts_enabled, prevention_plan")
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setPeriodo(data.default_period || "7d");
          setAtivarAlertas(data.alerts_enabled ?? true);
          setPlano(data.prevention_plan || "");
        }
      } catch (err) {
        console.warn("Nenhuma configuração encontrada ainda.");
      }
    }
    carregarConfig();
  }, []);

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

      if (existente) {
        const { error } = await supabase
          .from("user_config")
          .update({
            default_period: periodo,
            alerts_enabled: ativarAlertas,
            prevention_plan: plano.trim(),
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
      <Header />

      <div className="max-w-3xl mx-auto bg-white shadow rounded-xl p-6 mt-6 space-y-8">
        {/* 🔗 Navegação */}
        <div className="flex justify-between mb-4">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            🏠 Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate("/registrar")}>
            ✍️ Registrar Desejo
          </Button>
        </div>

        {/* Preferências */}
        <section>
          <h2 className="text-xl font-bold mb-2">Preferências do Dashboard</h2>
          <p className="text-sm text-gray-600 mb-4">
            Configure como os gráficos são exibidos por padrão.
          </p>

          <label className="block text-sm font-medium">Período padrão dos gráficos</label>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm mb-4"
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
            />
            <span className="text-sm">Ativar alertas e lembretes</span>
          </label>
        </section>

        {/* Plano de Prevenção */}
        <section>
          <h2 className="text-xl font-bold mb-2">Plano de Prevenção</h2>
          <p className="text-sm text-gray-600 mb-3">
            Liste ações que ajudam você a lidar com cravings.
          </p>
          <textarea
            rows={5}
            value={plano}
            onChange={(e) => setPlano(e.target.value)}
            placeholder="Exemplo: Ligar para meu padrinho, respirar fundo, orar, escrever, etc."
            className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400"
          />
          <p className="text-xs text-gray-500 mt-2">
            Este plano ficará disponível rapidamente quando você mais precisar.
          </p>
        </section>

        {/* Sobre seus dados */}
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="font-medium text-blue-700 mb-1">ℹ️ Sobre seus dados</p>
          <p className="text-sm text-gray-700">
            Todos os seus registros são armazenados de forma segura localmente no Supabase.
            Nenhum login é necessário nesta versão.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Em breve: opção para exportar e sincronizar com sua conta.
          </p>
        </section>

        {/* Botão salvar */}
        <div className="space-y-2">
          <Button
            onClick={handleSalvar}
            disabled={salvando}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
              salvando ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {salvando ? "Salvando..." : "Salvar Configurações"}
          </Button>

          {salvo && (
            <p className="text-center text-green-600 text-sm font-medium">
              ✅ Configurações salvas com sucesso!
            </p>
          )}
        </div>
      </div>
    </>
  );
}
