import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

/**
 * Escuta alertas gerados automaticamente no Supabase
 * e exibe notificações visuais no app.
 */
export function useAlertsListener() {
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel("alerts_log")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alerts_log",
        },
        (payload) => {
          const alert = payload.new;

          // Mensagem 1️⃣ — comportamento repetido
          toast({
            title: "⚠️ Atenção!",
            description: `Você está repetindo essa atitude por estas razões: ${alert.note}`,
            variant: "destructive", // vermelho
            duration: 3000, // 3 segundos
          });

          // Mensagem 2️⃣ — plano de ação
          setTimeout(() => {
            toast({
              title: "💡 Plano de Prevenção",
              description: alert.prevention_plan || 
                "Evite esse comportamento o mais rápido possível. Se preciso, peça ajuda!",
              variant: "default", // azul neutro
              duration: 6000,
            });
          }, 3500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
