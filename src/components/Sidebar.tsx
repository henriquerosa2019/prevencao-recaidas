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
  History,
} from "lucide-react";
import React from "react";
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
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <NavLink
      to={to}
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition
        ${active
          ? "bg-blue-100 text-blue-700"
          : "text-gray-700 hover:bg-gray-100"}`}
    >
      <Icon className={`h-4 w-4 ${active ? "text-blue-700" : "text-gray-500"}`} />
      <span className="truncate">{children}</span>
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

  return (
    <aside className="w-64 shrink-0 border-r bg-white/90 backdrop-blur flex flex-col">
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="mb-4">
          <h1 className="text-lg font-semibold">Prevenção de Recaídas</h1>
          <p className="text-xs text-gray-500">Seu caminho de recuperação</p>
        </div>

        <nav className="space-y-1">
          <Item to="/dashboard" icon={Home}>Dashboard</Item>
          <Item to="/registros" icon={LineChart}>Registros de Fissuras</Item>
          <Item to="/historico-gatilhos" icon={History}>Histórico de Gatilhos</Item>
          <Item to="/plano" icon={ClipboardList}>Plano de Prevenção</Item>
          <Item to="/reunioes" icon={Users}>Minhas Reuniões</Item>
          <Item to="/passos-4-5" icon={BookOpen}>4º/5º Passo</Item>
          <Item to="/passos-8-9" icon={HeartHandshake}>8º/9º Passo</Item>

          {/* Botão de emergência via Sidebar (abre o mesmo modal do botão flutuante) */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
          >
            <PhoneCall className="h-4 w-4 text-red-500" />
            <span className="truncate">Telefones Urgentes</span>
          </button>

          {/* Itens futuros */}
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
        </nav>
      </div>

      <div className="border-t p-4">
        <div className="space-y-1">
          <Item to="/config" icon={Settings}>Configurações</Item>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-100"
            onClick={() => alert("Sair (em breve)")}
          >
            <LogOut className="h-4 w-4 text-gray-500" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
