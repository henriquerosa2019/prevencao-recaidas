import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Dashboard } from "@/components/Dashboard";
import { PlaceholderSection } from "@/components/PlaceholderSection";
import { TrendingUp, FileText, Heart, Phone, AlertCircle, Settings, LogOut, Smile } from "lucide-react";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const getSectionTitle = () => {
    const titles: Record<string, string> = {
      dashboard: "Dashboard",
      registros: "Registros de Fissuras",
      prevencao: "Plano de Prevenção",
      aa: "12 Passos - AA",
      na: "12 Passos - NA",
      dasa: "12 Passos - DASA",
      feedbacks: "Feedbacks Positivos",
      linhas: "Linhas de Ajuda",
      emergencia: "Telefones Urgentes",
      configuracoes: "Configurações",
      sair: "Sair",
    };
    return titles[activeSection] || "Dashboard";
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "registros":
        return (
          <PlaceholderSection
            title="Registros de Fissuras"
            description="Registre e acompanhe suas fissuras para identificar padrões e gatilhos"
            icon={TrendingUp}
          />
        );
      case "prevencao":
        return (
          <PlaceholderSection
            title="Plano de Prevenção"
            description="Crie e gerencie suas estratégias de prevenção de recaídas"
            icon={FileText}
          />
        );
      case "aa":
        return (
          <PlaceholderSection
            title="12 Passos - AA"
            description="Acompanhe seu progresso nos 12 Passos do Alcoólicos Anônimos"
            icon={Heart}
          />
        );
      case "na":
        return (
          <PlaceholderSection
            title="12 Passos - NA"
            description="Versão adaptada dos Narcóticos Anônimos"
            icon={Heart}
          />
        );
      case "dasa":
        return (
          <PlaceholderSection
            title="12 Passos - DASA"
            description="Programa para Dependência Afetiva e Sexual Anônimos"
            icon={Heart}
          />
        );
      case "feedbacks":
        return (
          <PlaceholderSection
            title="Feedbacks Positivos"
            description="Registre conquistas, mensagens inspiradoras e momentos de progresso"
            icon={Smile}
          />
        );
      case "linhas":
        return (
          <PlaceholderSection
            title="Linhas de Ajuda"
            description="Contatos de grupos de apoio e atendimentos de suporte"
            icon={Phone}
          />
        );
      case "emergencia":
        return (
          <PlaceholderSection
            title="Telefones Urgentes"
            description="Números de emergência e atendimento imediato"
            icon={AlertCircle}
          />
        );
      case "configuracoes":
        return (
          <PlaceholderSection
            title="Configurações"
            description="Personalize suas preferências e configurações do aplicativo"
            icon={Settings}
          />
        );
      case "sair":
        return (
          <PlaceholderSection
            title="Sair"
            description="Até logo! Volte sempre que precisar de apoio"
            icon={LogOut}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <Header sectionTitle={getSectionTitle()} userName="João Silva" />
      
      <main className="ml-64 pt-16">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
