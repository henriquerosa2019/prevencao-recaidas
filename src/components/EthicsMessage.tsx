import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const EthicsMessage = () => {
  return (
    <Alert className="border-info bg-info/5">
      <AlertCircle className="h-4 w-4 text-info" />
      <AlertDescription className="text-sm text-muted-foreground">
        <strong>Importante:</strong> Os dados deste aplicativo são pessoais e confidenciais.
        Este app não substitui tratamento médico.
        Em crise, ligue <strong>188</strong> (CVV – Brasil).
      </AlertDescription>
    </Alert>
  );
};

export default EthicsMessage;
