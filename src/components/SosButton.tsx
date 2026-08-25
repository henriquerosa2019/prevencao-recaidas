import { useEffect, useState } from "react";
import { AlertCircle, Phone, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useSos } from "@/lib/sosContext";

export default function SosButton() {
  const { open, setOpen } = useSos();
  const [plano, setPlano] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let ativo = true;
    supabase
      .from("user_config")
      .select("prevention_plan")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (ativo) setPlano(data?.prevention_plan?.trim() || null);
      });
    return () => {
      ativo = false;
    };
  }, [open]);

  return (
    <>
      {/* Botão flutuante de emergência */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Emergência"
        className="fixed bottom-5 right-5 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 active:scale-95 transition-all animate-pulse"
      >
        <AlertCircle className="h-7 w-7" />
      </button>

      {/* Modal de emergência */}
      {open && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="aurora-glass-strong w-full max-w-sm rounded-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-display font-bold flex items-center gap-2" style={{ color: "oklch(0.72 0.19 25)" }}>
                <AlertCircle className="h-5 w-5" /> Emergência
              </h2>
              <button onClick={() => setOpen(false)} aria-label="Fechar">
                <X className="h-5 w-5" style={{ color: "var(--aurora-muted-foreground)" }} />
              </button>
            </div>

            <p className="text-sm mb-4" style={{ color: "var(--aurora-muted-foreground)" }}>
              Se você está em crise, ligue agora. Você não está sozinho.
            </p>

            <div className="space-y-2">
              <a
                href="tel:188"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-white"
                style={{ backgroundColor: "oklch(0.62 0.24 25)" }}
              >
                <Phone className="h-4 w-4" /> Ligar 188 (CVV)
              </a>
              <a
                href="tel:+551132293611"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border font-semibold hover:bg-white/5"
                style={{ borderColor: "var(--aurora-primary)", color: "var(--aurora-foreground)" }}
              >
                <Phone className="h-4 w-4" /> Linha de Ajuda AA
              </a>
            </div>

            {plano && (
              <div
                className="mt-4 p-3 rounded-lg text-sm"
                style={{
                  backgroundColor: "var(--aurora-secondary)",
                  border: "1px solid var(--aurora-border)",
                  color: "var(--aurora-foreground)",
                }}
              >
                <strong>💡 Lembre-se do seu plano:</strong>
                <p className="mt-1 whitespace-pre-wrap">{plano}</p>
              </div>
            )}

            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full py-2 rounded-lg border text-sm hover:bg-white/5"
              style={{ borderColor: "var(--aurora-border)", color: "var(--aurora-muted-foreground)" }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
