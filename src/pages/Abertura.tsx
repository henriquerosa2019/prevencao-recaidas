// src/pages/Abertura.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

export default function Abertura() {
  const navigate = useNavigate();
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Mensagens padrão (fallback)
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
          .from("motivational_messages") // ⚙️ Use aqui o nome correto da tabela no seu Supabase
          .select("message");

        if (error) throw error;

        const todas = data?.map((d: any) => d.message) ?? mensagensPadrao;
        const aleatoria = todas[Math.floor(Math.random() * todas.length)];
        setMensagem(aleatoria);
      } catch {
        // fallback em caso de erro (como 400)
        const aleatoria =
          mensagensPadrao[Math.floor(Math.random() * mensagensPadrao.length)];
        setMensagem(aleatoria);
      } finally {
        setLoading(false);
      }
    }

    carregarMensagem();

    // Redirecionar após 10 s
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-center p-6">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.p
            key="carregando"
            className="text-gray-600 text-lg"
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
            className="max-w-lg"
          >
            <h1 className="text-2xl font-semibold mb-4">Mensagem do Dia</h1>
            <p className="text-gray-800 text-lg italic mb-8">{mensagem}</p>
            <Button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
            >
              Pular Abertura
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
