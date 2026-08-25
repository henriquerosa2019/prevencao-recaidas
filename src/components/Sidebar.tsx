// src/components/Sidebar.tsx
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  LineChart,
  ClipboardList,
  Heart,
  ThumbsUp,
  Phone,
  PhoneCall,
  Settings,
  LogOut,
  Users,
  BookOpen,
  HeartHandshake,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  History,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSos } from "@/lib/sosContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// 🎨 Painel lateral redesenhado no Lovable — paleta "Aurora Recovery"
// (azuis/violetas futuristas, vidro fosco e brilho neon). As cores vêm das
// variáveis --aurora-* definidas em index.css, isoladas do design system
// padrão do app (--background, --primary etc.) para não alterar o visual
// das demais telas — só o painel lateral (sempre visível) ganha este tema.

function Item({
  to,
  icon: Icon,
  children,
  collapsed,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  collapsed?: boolean;
}) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <NavLink
      to={to}
      title={collapsed ? String(children) : undefined}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all
        ${collapsed ? "justify-center px-0" : ""}
        ${active ? "aurora-text-glow-soft" : "hover:bg-white/5"}`}
      style={{
        backgroundColor: active ? "var(--aurora-sidebar-accent)" : undefined,
        color: active ? "var(--aurora-sidebar-foreground)" : "var(--aurora-muted-foreground)",
        boxShadow: active ? "var(--aurora-shadow-glow)" : undefined,
      }}
    >
      <Icon
        className="h-4 w-4 shrink-0"
        style={{ color: active ? "var(--aurora-violet)" : undefined }}
      />
      {!collapsed && <span className="truncate">{children}</span>}
    </NavLink>
  );
}

function ItemEmBreve({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex cursor-not-allowed items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm opacity-50"
      style={{ color: "var(--aurora-muted-foreground)" }}
    >
      <span className="flex items-center gap-2 truncate">
        <Icon className="h-4 w-4" style={{ color: "var(--aurora-muted-foreground)" }} />
        <span className="truncate">{children}</span>
      </span>
      <span
        className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide"
        style={{ borderColor: "var(--aurora-border)" }}
      >
        Em breve
      </span>
    </div>
  );
}

export default function Sidebar() {
  const { setOpen } = useSos();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const armazenado = localStorage.getItem("sidebar-collapsed");
      if (armazenado !== null) return armazenado === "1";
    } catch {
      // localStorage indisponível — segue para o padrão abaixo
    }
    // Sem preferência salva: começa encolhido em telas pequenas (celular)
    return typeof window !== "undefined" && window.innerWidth < 768;
  });

  useEffect(() => {
    try {
      localStorage.setItem("sidebar-collapsed", collapsed ? "1" : "0");
    } catch {
      // localStorage indisponível — ignora
    }
  }, [collapsed]);

  return (
    <aside
      className={`aurora-font-display relative z-20 ${
        collapsed ? "w-16" : "w-64"
      } shrink-0 flex flex-col backdrop-blur-xl transition-all duration-200`}
      style={{
        backgroundColor: "var(--aurora-sidebar)",
        borderRight: "1px solid var(--aurora-sidebar-border)",
        color: "var(--aurora-sidebar-foreground)",
      }}
    >
      <div className="p-4 flex-1 overflow-y-auto">
        {/* Cabeçalho: clique para encolher/expandir o painel lateral */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expandir menu" : "Encolher menu"}
          className={`w-full flex items-center mb-4 rounded-xl transition hover:bg-white/5 ${
            collapsed ? "justify-center p-2" : "justify-between p-1"
          }`}
        >
          <span className={`flex items-center gap-3 ${collapsed ? "" : ""}`}>
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl aurora-gradient-bg"
              style={{ boxShadow: "var(--aurora-shadow-glow-strong)" }}
            >
              <Heart className="h-4 w-4" style={{ color: "var(--aurora-primary-foreground)" }} />
            </span>
            {!collapsed && (
              <span className="text-left font-sans">
                <span className="block truncate text-sm font-bold aurora-text-glow font-display">
                  Prevenção de Recaídas
                </span>
                <span className="block truncate text-xs" style={{ color: "var(--aurora-muted-foreground)" }}>
                  Seu caminho de recuperação
                </span>
              </span>
            )}
          </span>
          {!collapsed && (
            <ChevronLeft className="h-4 w-4 shrink-0" style={{ color: "var(--aurora-muted-foreground)" }} />
          )}
          {collapsed && (
            <ChevronRight className="absolute right-1 top-1 h-3.5 w-3.5" style={{ color: "var(--aurora-muted-foreground)" }} />
          )}
        </button>

        <nav className="space-y-1 font-sans">
          <Item to="/dashboard" icon={Home} collapsed={collapsed}>Dashboard</Item>
          <Item to="/registros" icon={LineChart} collapsed={collapsed}>Registros de Fissuras</Item>
          <Item to="/historico-gatilhos" icon={History} collapsed={collapsed}>Histórico de Gatilhos</Item>
          <Item to="/plano" icon={ClipboardList} collapsed={collapsed}>Plano de Prevenção</Item>
          <Item to="/reunioes" icon={Users} collapsed={collapsed}>Minhas Reuniões</Item>
          <Item to="/passos-4-5" icon={BookOpen} collapsed={collapsed}>4º/5º Passo</Item>
          <Item to="/passos-8-9" icon={HeartHandshake} collapsed={collapsed}>8º/9º Passo</Item>

          {/* Botão de emergência via Sidebar (abre o mesmo modal do botão flutuante) */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            title={collapsed ? "Telefones Urgentes" : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/5 ${
              collapsed ? "justify-center px-0" : ""
            }`}
            style={{ color: "oklch(0.72 0.19 25)" }}
          >
            <PhoneCall className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">Telefones Urgentes</span>}
          </button>

          {/* Itens futuros (ocultos quando o painel está encolhido) */}
          {!collapsed && (
            <div className="mt-3">
              <Accordion type="single" collapsible>
                <AccordionItem value="12passos" className="border-none">
                  <AccordionTrigger
                    className="rounded-xl px-3 py-2 text-sm hover:bg-white/5 hover:no-underline [&>svg]:hidden"
                    style={{ color: "var(--aurora-muted-foreground)" }}
                  >
                    <span className="flex items-center gap-2">
                      <Heart className="h-4 w-4" style={{ color: "var(--aurora-muted-foreground)" }} />
                      12 Passos
                    </span>
                    <ChevronDown
                      className="h-4 w-4 ml-auto transition-transform"
                      style={{ color: "var(--aurora-muted-foreground)" }}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <div className="pl-2 space-y-1">
                      <ItemEmBreve icon={Heart}>12 Passos - AA</ItemEmBreve>
                      <ItemEmBreve icon={Heart}>12 Passos - NA</ItemEmBreve>
                      <ItemEmBreve icon={Heart}>12 Passos - DASA</ItemEmBreve>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <ItemEmBreve icon={ThumbsUp}>Feedbacks Positivos</ItemEmBreve>
              <ItemEmBreve icon={Phone}>Linhas de Ajuda</ItemEmBreve>
            </div>
          )}
        </nav>
      </div>

      <div className="p-4 font-sans" style={{ borderTop: "1px solid var(--aurora-sidebar-border)" }}>
        <div className="space-y-1">
          <Item to="/config" icon={Settings} collapsed={collapsed}>Configurações</Item>
          <button
            type="button"
            title={collapsed ? "Sair" : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-white/5 ${
              collapsed ? "justify-center px-0" : ""
            }`}
            style={{ color: "var(--aurora-muted-foreground)" }}
            onClick={() => alert("Sair (em breve)")}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
