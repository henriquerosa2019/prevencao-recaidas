// src/App.tsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Abertura from "./pages/Abertura";
import Registrar from "./pages/Registrar";
import Config from "./pages/Config";
import UrgeDashboardMVP from "./UrgeDashboardMVP";

import Sidebar from "./components/Sidebar";
import Header from "./components/Layout/Header";
import Footer from "./components/Footer";

export default function App() {
  const location = useLocation();

  const isAbertura = location.pathname === "/";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ✅ Esconde Sidebar na abertura */}
      {!isAbertura && <Sidebar />}

      <div className="flex-1 flex flex-col">
        {/* ✅ Esconde header na abertura */}
        {!isAbertura && <Header />}

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Routes>
            {/* ✅ Tela inicial com mensagem inspiradora */}
            <Route path="/" element={<Abertura />} />

            {/* ✅ Dashboard principal */}
            <Route path="/dashboard" element={<UrgeDashboardMVP />} />

            {/* ✅ Registros de Fissuras */}
            <Route path="/registros" element={<Registrar />} />

            {/* ✅ Config / Plano */}
            <Route path="/plano" element={<Config />} />
            <Route path="/config" element={<Config />} />

            {/* ✅ fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* ✅ Rodapé visível apenas fora da abertura */}
        {!isAbertura && <Footer />}
      </div>
    </div>
  );
}
