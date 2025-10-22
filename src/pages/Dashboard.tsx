import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import EthicsMessage from "@/components/EthicsMessage";

const Dashboard = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard de Cravings</h2>
        <p className="text-muted-foreground">
          Visualize seus padrões e gatilhos para fortalecer sua recuperação.
        </p>
      </div>

      <EthicsMessage />

      {/* Placeholder para o componente UrgeDashboardMVP.tsx */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Seus Gráficos de Análise</CardTitle>
          <CardDescription>
            Importe aqui o componente UrgeDashboardMVP.tsx com os gráficos Pareto, Linha e Heatmap
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium">Componente UrgeDashboardMVP</p>
              <p className="text-sm text-muted-foreground">
                Substitua este placeholder pelo seu componente existente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Gatilho Mais Comum</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando dados</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Horário Crítico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando dados</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
