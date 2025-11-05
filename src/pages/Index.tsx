import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Layout/Header";
import UrgeDashboardMVP from "../UrgeDashboardMVP";

export default function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 🔹 Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* 🔹 Área principal */}
      <div className="flex flex-col flex-1">
        {/* Cabeçalho */}
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Título da página */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">
              Dashboard — Prevenção de Recaída
            </h1>
            <p className="text-gray-500 text-sm">
              Visualize seus padrões, gatilhos e intensidades para fortalecer sua recuperação.
            </p>
          </div>

          {/* 🔥 Nosso Dashboard integrado */}
          <section className="bg-white rounded-2xl shadow p-6">
            <UrgeDashboardMVP />
          </section>

          {/* Rodapé */}
          <footer className="mt-8 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Prevenção de Recaída — Todos os direitos reservados.
          </footer>
        </main>
      </div>
    </div>
  );
}
