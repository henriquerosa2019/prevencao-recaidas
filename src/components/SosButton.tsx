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
            className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Emergência
              </h2>
              <button onClick={() => setOpen(false)} aria-label="Fechar">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Se você está em crise, ligue agora. Você não está sozinho.
            </p>

            <div className="space-y-2">
              <a
                href="tel:188"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                <Phone className="h-4 w-4" /> Ligar 188 (CVV)
              </a>
              <a
                href="tel:+551132293611"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-blue-600 text-blue-700 font-semibold hover:bg-blue-50"
              >
                <Phone className="h-4 w-4" /> Linha de Ajuda AA
              </a>
            </div>

            {plano && (
              <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-900">
                <strong>💡 Lembre-se do seu plano:</strong>
                <p className="mt-1 whitespace-pre-wrap">{plano}</p>
              </div>
            )}

            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-50"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
