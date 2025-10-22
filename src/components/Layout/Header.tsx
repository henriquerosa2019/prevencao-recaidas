import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, PlusCircle, Settings } from "lucide-react";

const Header = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/95">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Heart className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Prevenção Recaídas</h1>
        </Link>

        <nav className="flex items-center gap-2">
          <Button
            variant={isActive("/") ? "default" : "ghost"}
            size="sm"
            asChild
            className="transition-all"
          >
            <Link to="/">
              <Heart className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>

          <Button
            variant={isActive("/registrar") ? "default" : "ghost"}
            size="sm"
            asChild
            className="transition-all"
          >
            <Link to="/registrar">
              <PlusCircle className="mr-2 h-4 w-4" />
              Registrar
            </Link>
          </Button>

          <Button
            variant={isActive("/config") ? "ghost" : "ghost"}
            size="sm"
            asChild
            className="transition-all"
          >
            <Link to="/config">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
