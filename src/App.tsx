// src/App.tsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Abertura from "./pages/Abertura";
import Registrar from "./pages/Registrar";
import Config from "./pages/Config";
import UrgeDashboardMVP from "./UrgeDashboardMVP";
import Reunioes from "./pages/Reunioes";
import Passos45 from "./pages/Passos45";
import Passos89 from "./pages/Passos89";
import HistoricoGatilhos from "./pages/HistoricoGatilhos";
import Login from "./pages/Login";

import Sidebar from "./components/Sidebar";
import Header from "./components/Layout/Header";
import Footer from "./components/Footer";
import SosButton from "./components/SosButton";
import { SosProvider } from "./lib/sosContext";
import { SidebarMenuProvider } from "./lib/sidebarContext";
import { AuthProvider, useAuth } from "./lib/authContext";

// 🔐 Miolo do app — só é renderizado depois que sabemos se há sessão ou não.
// Sem sessão: só a tela de login/cadastro existe, qualquer outra rota
// redireciona para lá. Com sessão: o app funciona como antes, e "/login"
// deixa de fazer sentido (redireciona para a Abertura).
function AppShell() {
  const location = useLocation();
  const { session, loading } = useAuth();

  const isAbertura = location.pathname === "/";

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        style={{ color: "var(--aurora-muted-foreground)" }}
      >
        Carregando...
      </div>
    );
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <SidebarMenuProvider>
      <SosProvider>
        <div className="flex min-h-screen bg-background aurora-grid-noise">
          {/* ✅ Esconde Sidebar na abertura */}
          {!isAbertura && <Sidebar />}

          <div className="flex min-w-0 flex-1 flex-col">
            {/* ✅ Esconde header na abertura */}
            {!isAbertura && <Header />}

            <main className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden">
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

              {/* ✅ Minhas Reuniões */}
              <Route path="/reunioes" element={<Reunioes />} />

              {/* ✅ Histórico de Gatilhos */}
              <Route path="/historico-gatilhos" element={<HistoricoGatilhos />} />

              {/* ✅ Passos 4º/5º e 8º/9º */}
              <Route path="/passos-4-5" element={<Passos45 />} />
              <Route path="/passos-8-9" element={<Passos89 />} />

              {/* ✅ Já logado — /login não faz sentido, manda pra Abertura */}
              <Route path="/login" element={<Navigate to="/" replace />} />

              {/* ✅ fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </main>

            {/* ✅ Rodapé visível apenas fora da abertura */}
            {!isAbertura && <Footer />}
          </div>

          {/* ✅ Botão de emergência global (SOS) */}
          {!isAbertura && <SosButton />}
        </div>
      </SosProvider>
    </SidebarMenuProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
