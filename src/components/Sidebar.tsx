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
  Award,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSos } from "@/lib/sosContext";
import { useSidebarMenu } from "@/lib/sidebarContext";
import { useAuth } from "@/lib/authContext";
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
  onClick,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <NavLink
      to={to}
      onClick={onClick}
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
  const { mobileOpen, setMobileOpen } = useSidebarMenu();
  const { signOut } = useAuth();
  const location = useLocation();

  // 🖥️ "collapsed" só controla o modo ícone-only em telas md+ (tablet/PC).
  // No celular o painel vira uma gaveta (overlay) sempre em largura total —
  // não precisa mais do truque antigo de "começar encolhido se a tela for
  // pequena", porque agora o celular tem seu próprio mecanismo (gaveta +
  // botão de hambúrguer no Header) em vez de dividir espaço com o conteúdo.
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const armazenado = localStorage.getItem("sidebar-collapsed");
      if (armazenado !== null) return armazenado === "1";
    } catch {
      // localStorage indisponível — segue para o padrão abaixo
    }
    return false;
  });

  useEffect(() => {
    try {
      localStorage.setItem("sidebar-collapsed", collapsed ? "1" : "0");
    } catch {
      // localStorage indisponível — ignora
    }
  }, [collapsed]);

  // 📱 Fecha a gaveta automaticamente ao navegar para outra tela.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  // 📱 Trava o scroll do fundo enquanto a gaveta está aberta no celular.
  useEffect(() => {
    if (mobileOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [mobileOpen]);

  // No celular a gaveta sempre mostra os rótulos por completo — o modo
  // "ícone apenas" só existe em telas md+ (onde o painel fica fixo/inline).
  const iconOnly = collapsed && !mobileOpen;

  function toggleTopButton() {
    // Em telas de celular (a gaveta é controlada pelo hambúrguer/backdrop),
    // este mesmo botão funciona como "fechar". Em md+ ele encolhe/expande.
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileOpen(false);
    } else {
      setCollapsed((c) => !c);
    }
  }

  return (
    <>
      {/* 📱 Fundo escurecido atrás da gaveta — só existe no celular/tablet
          estreito (md:hidden) e fecha o menu ao ser tocado. */}
      {mobileOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`aurora-font-display fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col overflow-hidden backdrop-blur-xl transition-transform duration-300 ease-out
          md:relative md:inset-auto md:z-20 md:max-w-none md:translate-x-0 md:shrink-0 md:transition-[width] md:duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "md:w-16" : "md:w-64"}`}
        style={{
          backgroundColor: "var(--aurora-sidebar)",
          borderRight: "1px solid var(--aurora-sidebar-border)",
          color: "var(--aurora-sidebar-foreground)",
        }}
      >
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Cabeçalho: encolhe/expande em md+, fecha a gaveta no celular */}
          <button
            type="button"
            onClick={toggleTopButton}
            title={iconOnly ? "Expandir menu" : "Encolher menu"}
            className={`w-full flex items-center mb-4 rounded-xl transition hover:bg-white/5 ${
              iconOnly ? "justify-center p-2" : "justify-between p-1"
            }`}
          >
            <span className="flex items-center gap-3">
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl aurora-gradient-bg"
                style={{ boxShadow: "var(--aurora-shadow-glow-strong)" }}
              >
                <Heart className="h-4 w-4" style={{ color: "var(--aurora-primary-foreground)" }} />
              </span>
              {!iconOnly && (
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
            {/* Fechar (X) — só no celular, onde este botão fecha a gaveta */}
            <X className="h-4 w-4 shrink-0 md:hidden" style={{ color: "var(--aurora-muted-foreground)" }} />
            {/* Encolher/expandir — só em md+ */}
            {!iconOnly && (
              <ChevronLeft className="hidden h-4 w-4 shrink-0 md:block" style={{ color: "var(--aurora-muted-foreground)" }} />
            )}
            {iconOnly && (
              <ChevronRight className="absolute right-1 top-1 hidden h-3.5 w-3.5 md:block" style={{ color: "var(--aurora-muted-foreground)" }} />
            )}
          </button>

          <nav className="space-y-1 font-sans">
            <Item to="/dashboard" icon={Home} collapsed={iconOnly}>Dashboard</Item>
            <Item to="/registros" icon={LineChart} collapsed={iconOnly}>Registros de Fissuras</Item>
            <Item to="/historico-gatilhos" icon={History} collapsed={iconOnly}>Histórico de Gatilhos</Item>
            <Item to="/plano" icon={ClipboardList} collapsed={iconOnly}>Plano de Prevenção</Item>
            <Item to="/reunioes" icon={Users} collapsed={iconOnly}>Minhas Reuniões</Item>
            <Item to="/aniversarios" icon={Award} collapsed={iconOnly}>Aniversários/Fichas</Item>
            <Item to="/passos-4-5" icon={BookOpen} collapsed={iconOnly}>4º/5º Passo</Item>
            <Item to="/passos-8-9" icon={HeartHandshake} collapsed={iconOnly}>8º/9º Passo</Item>

            {/* Botão de emergência via Sidebar (abre o mesmo modal do botão flutuante) */}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setOpen(true);
              }}
              title={iconOnly ? "Telefones Urgentes" : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/5 ${
                iconOnly ? "justify-center px-0" : ""
              }`}
              style={{ color: "oklch(0.72 0.19 25)" }}
            >
              <PhoneCall className="h-4 w-4 shrink-0" />
              {!iconOnly && <span className="truncate">Telefones Urgentes</span>}
            </button>

            {/* Itens futuros (ocultos quando o painel está em modo ícone) */}
            {!iconOnly && (
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
            <Item to="/config" icon={Settings} collapsed={iconOnly}>Configurações</Item>
            <button
              type="button"
              title={iconOnly ? "Sair" : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-white/5 ${
                iconOnly ? "justify-center px-0" : ""
              }`}
              style={{ color: "var(--aurora-muted-foreground)" }}
              onClick={() => {
                setMobileOpen(false);
                signOut();
              }}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!iconOnly && <span>Sair</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
