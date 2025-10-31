import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Layout/Header";
import EthicsMessage from "@/components/EthicsMessage";
import UrgeDashboardMVP from "@/UrgeDashboardMVP";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard de Cravings</h2>
          <p className="text-muted-foreground">
            Visualize seus padrões e gatilhos para fortalecer sua recuperação.
          </p>
        </div>

        <EthicsMessage />

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Seus Gráficos de Análise</CardTitle>
            <CardDescription>
              Análise dos registros de cravings, gatilhos e intensidades.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Inclui o dashboard MVP completo */}
            <UrgeDashboardMVP />
          </CardContent>
        </Card>

        {/* 🔹 Botão de atalho para registrar craving */}
        <div className="flex justify-center pt-6">
          <Button
            onClick={() => navigate("/registrar")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow"
          >
            Registrar Novo Craving
          </Button>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
