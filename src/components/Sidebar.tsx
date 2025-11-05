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
} from "lucide-react";
import React from "react";

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

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r bg-white/90 backdrop-blur">
      <div className="p-4">
        <div className="mb-4">
          <h1 className="text-lg font-semibold">Prevenção de Recaídas</h1>
          <p className="text-xs text-gray-500">Seu caminho de recuperação</p>
        </div>

        <nav className="space-y-1">
          <Item to="/dashboard" icon={Home}>Dashboard</Item>
          <Item to="/registros" icon={LineChart}>Registros de Fissuras</Item>
          <Item to="/plano" icon={ClipboardList}>Plano de Prevenção</Item>

          {/* Itens futuros (mantém visual do menu novo) */}
          <div className="mt-3 space-y-1">
            <Item to="/12passos-aa" icon={Heart}>12 Passos - AA</Item>
            <Item to="/12passos-na" icon={Heart}>12 Passos - NA</Item>
            <Item to="/12passos-dasa" icon={Heart}>12 Passos - DASA</Item>
            <Item to="/feedbacks" icon={ThumbsUp}>Feedbacks Positivos</Item>
            <Item to="/linhas-ajuda" icon={Phone}>Linhas de Ajuda</Item>
            <Item to="/telefones" icon={PhoneCall}>Telefones Urgentes</Item>
          </div>
        </nav>
      </div>

      <div className="mt-auto border-t p-4">
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
