import { Routes, Route, Navigate } from "react-router-dom";
import Abertura from "./pages/Abertura";
import Dashboard from "./pages/Dashboard";
import Registrar from "./pages/Registrar";
import Config from "./pages/Config";
import { useAlertsListener } from "@/hooks/useAlertsListener";

export default function App() {
  // 🔥 ativa o monitoramento de alertas em todas as páginas
  useAlertsListener();

  return (
    <Routes>
      {/* 🟦 Tela inicial com mensagens motivacionais */}
      <Route path="/" element={<Abertura />} />

      {/* 🟩 Dashboard principal */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* 🟨 Página de registro */}
      <Route path="/registrar" element={<Registrar />} />

      {/* ⚙️ Página de configurações */}
      <Route path="/config" element={<Config />} />

      {/* 🚪 Fallback de segurança */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
