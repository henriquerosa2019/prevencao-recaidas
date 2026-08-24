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
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition
        ${collapsed ? "justify-center" : ""}
        ${active
          ? "bg-blue-100 text-blue-700"
          : "text-gray-700 hover:bg-gray-100"}`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-blue-700" : "text-gray-500"}`} />
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
    <div className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm text-gray-400 cursor-not-allowed">
      <span className="flex items-center gap-2 truncate">
        <Icon className="h-4 w-4 text-gray-300" />
        <span className="truncate">{children}</span>
      </span>
      <span className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-400 rounded-full px-2 py-0.5 shrink-0">
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
      className={`${
        collapsed ? "w-16" : "w-64"
      } shrink-0 border-r bg-white/90 backdrop-blur flex flex-col transition-all duration-200`}
    >
      <div className="p-4 flex-1 overflow-y-auto">
        {/* Cabeçalho: clique para encolher/expandir o painel lateral */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expandir menu" : "Encolher menu"}
          className={`w-full flex items-center mb-4 rounded-xl hover:bg-gray-100 transition ${
            collapsed ? "justify-center p-2" : "justify-between p-1"
          }`}
        >
          {!collapsed && (
            <span className="text-left">
              <h1 className="text-lg font-semibold leading-tight">Prevenção de Recaídas</h1>
              <p className="text-xs text-gray-500">Seu caminho de recuperação</p>
            </span>
          )}
          {collapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-500 shrink-0" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-500 shrink-0" />
          )}
        </button>

        <nav className="space-y-1">
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
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <PhoneCall className="h-4 w-4 shrink-0 text-red-500" />
            {!collapsed && <span className="truncate">Telefones Urgentes</span>}
          </button>

          {/* Itens futuros (ocultos quando o painel está encolhido) */}
          {!collapsed && (
            <div className="mt-3">
              <Accordion type="single" collapsible>
                <AccordionItem value="12passos" className="border-none">
                  <AccordionTrigger className="rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:no-underline [&>svg]:hidden">
                    <span className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-gray-500" />
                      12 Passos
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400 ml-auto transition-transform" />
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

      <div className="border-t p-4">
        <div className="space-y-1">
          <Item to="/config" icon={Settings} collapsed={collapsed}>Configurações</Item>
          <button
            type="button"
            title={collapsed ? "Sair" : undefined}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-100 ${
              collapsed ? "justify-center" : ""
            }`}
            onClick={() => alert("Sair (em breve)")}
          >
            <LogOut className="h-4 w-4 shrink-0 text-gray-500" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
