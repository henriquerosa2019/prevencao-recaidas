import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <p className="text-xl text-muted-foreground">Página não encontrada</p>
          <p className="text-sm text-muted-foreground">
            O endereço que você tentou acessar não existe.
          </p>
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button asChild variant="default">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Ir para o Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" onClick={() => window.history.back()}>
            <a>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
