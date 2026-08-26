// src/pages/Abertura.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";   // ✅ Importação adicionada
import { useAuth } from "@/lib/authContext";
import { marcoDeHoje, dataEfetivaSobriedade, roleLabel } from "@/lib/anniversaryGate";
import { montarSaudacao, nomeParaSaudacao } from "@/lib/saudacao";

export default function Abertura() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [parabens, setParabens] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState<string | null>(null);

  // 👋 Saudação conforme a hora do dia (veja src/lib/saudacao.ts)
  const saudacao = montarSaudacao(
    nomeParaSaudacao(displayName, (user?.user_metadata as any)?.full_name, user?.email)
  );

  // ✅ Mensagens padrão (fallback)
  const mensagensPadrao = [
    "Viva um dia de cada vez.",
    "O importante é continuar tentando.",
    "Você é mais forte do que pensa.",
    "Só por hoje, escolha a serenidade.",
    "Aceite o que não pode mudar e mude o que pode.",
    "A fé é o primeiro passo, mesmo quando você não vê toda a escada.",
    "Oração do 3º Passo - Anônimo: Pai Celestial, tome minha vontade e minha vida, oriente-me em minha recuperação; mostre-me como viver!",
  ];

  useEffect(() => {
    async function carregarMensagem() {
      try {
        const { data, error } = await supabase
          .from("motivational_messages")
          .select("message");

        if (error) throw error;

        const todas = data?.map((d: any) => d.message) ?? mensagensPadrao;
        const aleatoria = todas[Math.floor(Math.random() * todas.length)];
        setMensagem(aleatoria);
      } catch {
        const aleatoria =
          mensagensPadrao[Math.floor(Math.random() * mensagensPadrao.length)];
        setMensagem(aleatoria);
      } finally {
        setLoading(false);
      }
    }

    carregarMensagem();

    // ✅ Redirecionar após 10 s
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  // 🎉 Verifica, a cada login, se o próprio usuário ou algum
  // padrinho/madrinha/afilhado(a) cadastrado está completando um marco hoje.
  useEffect(() => {
    if (!user) return;

    async function verificarAniversarios() {
      const hoje = new Date();
      const mensagens: string[] = [];

      const { data: fichas } = await supabase
        .from("sponsor_anniversaries")
        .select("person_role, person_name, event_date")
        .eq("user_id", user!.id);

      (fichas || []).forEach((f: any) => {
        const marco = marcoDeHoje(f.event_date, hoje);
        if (marco) {
          mensagens.push(`🎉 ${f.person_name} (${roleLabel(f.person_role)}) está completando ${marco} hoje!`);
        }
      });

      const [{ data: config }, { data: ultimaRecaida }] = await Promise.all([
        supabase
          .from("user_config")
          .select("sobriety_start_date, display_name")
          .eq("user_id", user!.id)
          .limit(1)
          .maybeSingle(),
        supabase
          .from("relapses")
          .select("relapse_date")
          .eq("user_id", user!.id)
          .order("relapse_date", { ascending: false })
          .limit(1),
      ]);

      setDisplayName(config?.display_name || null);

      const dataEfetiva = dataEfetivaSobriedade(
        config?.sobriety_start_date || null,
        ultimaRecaida?.[0]?.relapse_date || null
      );
      const marcoProprio = marcoDeHoje(dataEfetiva, hoje);
      if (marcoProprio) {
        mensagens.push(`🎉 Parabéns! Você está completando ${marcoProprio} de recuperação hoje!`);
      }

      setParabens(mensagens);
    }

    verificarAniversarios();
  }, [user]);

  return (
    <div className="aurora-shell aurora-grid-noise flex flex-col items-center justify-between h-screen text-center p-6">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.p
            key="carregando"
            className="text-lg"
            style={{ color: "var(--aurora-muted-foreground)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Carregando mensagens...
          </motion.p>
        ) : (
          <motion.div
            key="mensagem"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 1 }}
            className="max-w-lg flex-1 flex flex-col justify-center"
          >
            {/* 👋 Boas-vindas conforme a hora do dia */}
            <div className="mb-8">
              <h1 className="aurora-font-display aurora-text-glow text-3xl font-bold leading-tight md:text-4xl">
                {saudacao.titulo}
              </h1>
              <p
                className="mt-3 text-xl font-medium md:text-2xl"
                style={{ color: "var(--aurora-primary)" }}
              >
                {saudacao.subtitulo}
              </p>
            </div>

            {parabens.length > 0 && (
              <div
                className="aurora-glass-strong rounded-2xl p-4 mb-6 space-y-2"
                style={{ boxShadow: "var(--aurora-shadow-glow)" }}
              >
                {parabens.map((msg, i) => (
                  <p key={i} className="text-sm font-medium aurora-text-glow-soft">
                    {msg}
                  </p>
                ))}
              </div>
            )}

            <h2 className="text-xl font-display font-semibold mb-3" style={{ color: "var(--aurora-muted-foreground)" }}>Mensagem do Dia</h2>
            <p className="text-lg italic mb-8" style={{ color: "var(--aurora-foreground)" }}>{mensagem}</p>

            <Button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-2 rounded-lg shadow"
              style={{ backgroundImage: "var(--aurora-gradient)", color: "var(--aurora-primary-foreground)" }}
            >
              Pular Abertura
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Footer agora aparece também na abertura */}
      <Footer />
    </div>
  );
}
