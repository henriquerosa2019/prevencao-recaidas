import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import EthicsMessage from "@/components/EthicsMessage";

const Config = () => {
  const [defaultPeriod, setDefaultPeriod] = useState("7");
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [preventionPlan, setPreventionPlan] = useState("");
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Configurações salvas!",
      description: "Suas preferências foram atualizadas com sucesso.",
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-3xl">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Personalize sua experiência no app de prevenção.
        </p>
      </div>

      <EthicsMessage />

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Preferências do Dashboard</CardTitle>
          <CardDescription>
            Configure como os gráficos são exibidos por padrão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="period">Período padrão dos gráficos</Label>
            <Select value={defaultPeriod} onValueChange={setDefaultPeriod}>
              <SelectTrigger id="period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Último dia</SelectItem>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="14">Últimos 14 dias</SelectItem>
                <SelectItem value="21">Últimos 21 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="alerts">Ativar alertas e lembretes</Label>
              <p className="text-sm text-muted-foreground">
                Receba notificações em horários de risco
              </p>
            </div>
            <Switch
              id="alerts"
              checked={alertsEnabled}
              onCheckedChange={setAlertsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Plano de Prevenção</CardTitle>
          <CardDescription>
            Liste ações que ajudam você a lidar com cravings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Exemplos:&#10;- Ligar para meu padrinho&#10;- Fazer 10 respirações profundas&#10;- Sair para caminhar&#10;- Ler meu diário de gratidão&#10;- Assistir uma série"
            value={preventionPlan}
            onChange={(e) => setPreventionPlan(e.target.value)}
            rows={8}
            className="resize-none font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Este plano ficará disponível rapidamente quando você mais precisar
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft border-info/30 bg-info/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-info">ℹ️</span> Sobre seus dados
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Todos os seus registros são criptografados e armazenados de forma segura.
            Apenas você tem acesso aos seus dados.
          </p>
          <p className="text-xs">
            Em desenvolvimento: opção para exportar seus dados ou excluir sua conta.
          </p>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        className="w-full shadow-soft hover:shadow-medium transition-all"
        size="lg"
      >
        Salvar Configurações
      </Button>
    </div>
  );
};

export default Config;
