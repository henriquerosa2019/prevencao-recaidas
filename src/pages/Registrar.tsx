import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import EthicsMessage from "@/components/EthicsMessage";
import {
  Heart,
  Wine,
  Angry,
  Users,
  Smartphone,
  Coffee,
  Moon,
  Home,
} from "lucide-react";

const triggers = [
  { id: "sex", label: "Sexo/Pornografia", icon: Heart },
  { id: "bar", label: "Bar/Festa", icon: Wine },
  { id: "anger", label: "Raiva", icon: Angry },
  { id: "loneliness", label: "Solidão", icon: Home },
  { id: "social", label: "Redes Sociais", icon: Smartphone },
  { id: "tiredness", label: "Cansaço", icon: Coffee },
  { id: "night", label: "Noite/Insônia", icon: Moon },
  { id: "social_pressure", label: "Pressão Social", icon: Users },
];

const Registrar = () => {
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [intensity, setIntensity] = useState([5]);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!selectedTrigger) {
      toast({
        title: "Selecione um gatilho",
        description: "Por favor, escolha qual situação gerou o craving.",
        variant: "destructive",
      });
      return;
    }

    // Aqui você integrará com Supabase
    toast({
      title: "Craving registrado!",
      description: `Gatilho: ${triggers.find(t => t.id === selectedTrigger)?.label}, Intensidade: ${intensity[0]}`,
    });

    // Reset form
    setSelectedTrigger(null);
    setIntensity([5]);
    setNotes("");
  };

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-4xl">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Registrar Craving</h2>
        <p className="text-muted-foreground">
          Identifique e registre seus gatilhos para reconhecer padrões.
        </p>
      </div>

      <EthicsMessage />

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Qual foi o gatilho?</CardTitle>
          <CardDescription>
            Selecione a situação que gerou o desejo de usar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {triggers.map((trigger) => {
              const Icon = trigger.icon;
              const isSelected = selectedTrigger === trigger.id;
              return (
                <Button
                  key={trigger.id}
                  variant={isSelected ? "default" : "outline"}
                  className={`h-auto flex-col gap-2 p-4 transition-all ${
                    isSelected ? "shadow-medium ring-2 ring-primary" : "hover:shadow-soft"
                  }`}
                  onClick={() => setSelectedTrigger(trigger.id)}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs text-center">{trigger.label}</span>
                </Button>
              );
            })}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="intensity">
                Intensidade: <span className="font-bold text-primary">{intensity[0]}</span>/10
              </Label>
              <Slider
                id="intensity"
                min={0}
                max={10}
                step={1}
                value={intensity}
                onValueChange={setIntensity}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Fraco</span>
                <span>Moderado</span>
                <span>Intenso</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="O que você estava fazendo? Como se sentia? O que ajudou ou não ajudou?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full shadow-soft hover:shadow-medium transition-all"
            size="lg"
          >
            Salvar Craving
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-soft border-secondary/30 bg-secondary/5">
        <CardHeader>
          <CardTitle className="text-base">💡 Dica</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Registrar seus cravings ajuda você a identificar padrões e antecipar situações de risco.
            Quanto mais você registra, mais clareza terá sobre seus gatilhos pessoais.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Registrar;
