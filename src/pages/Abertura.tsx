// src/pages/Abertura.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";   // ✅ Importação adicionada

export default function Abertura() {
  const navigate = useNavigate();
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
            <h1 className="text-2xl font-display font-semibold mb-4 aurora-text-glow">Mensagem do Dia</h1>
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
