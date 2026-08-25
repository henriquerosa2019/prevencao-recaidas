// src/components/PeriodoButtons.tsx
//
// 🕐 Seletor de período (7/14/30 dias) reutilizado em cada painel do
// Dashboard. Clicar em 14d/30d respeita o período gratuito: enquanto o
// trial não expirou (7 dias a partir da criação da conta — veja
// src/lib/trialGate.ts) o período muda normalmente; quando expirar, mostra
// o aviso e mantém o período atual.

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/authContext";
import { isTrialExpired, TRIAL_EXPIRED_MESSAGE } from "@/lib/trialGate";

const OPCOES = ["7d", "14d", "30d"];

export default function PeriodoButtons({
  value,
  onChange,
  size = "sm",
}: {
  value: string;
  onChange: (periodo: string) => void;
  size?: "sm" | "md";
}) {
  const { toast } = useToast();
  const { user } = useAuth();

  function handleClick(p: string) {
    if (p !== "7d" && isTrialExpired(user?.created_at)) {
      toast({ title: TRIAL_EXPIRED_MESSAGE, duration: 4000 });
      return;
    }
    onChange(p);
  }

  const padding = size === "md" ? "px-4 py-1.5 text-sm" : "px-3 py-1 text-xs";

  return (
    <div
      className="aurora-glass flex shrink-0 gap-1 rounded-full p-1"
      onClick={(e) => e.stopPropagation()}
    >
      {OPCOES.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => handleClick(p)}
          className={`rounded-full font-medium transition-all ${padding}`}
          style={
            value === p
              ? {
                  backgroundImage: "var(--aurora-gradient)",
                  color: "var(--aurora-primary-foreground)",
                  boxShadow: "var(--aurora-shadow-glow-strong)",
                  textShadow: "var(--aurora-text-glow-soft)",
                }
              : { color: "var(--aurora-muted-foreground)" }
          }
        >
          {p.replace("d", " dias")}
        </button>
      ))}
    </div>
  );
}
