import { Link, useLocation } from "react-router-dom";
import { Heart, PlusCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "../components/Header";

const Header = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo / título à esquerda */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Heart className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Prevenção Recaídas</h1>
        </Link>

        {/* Botões à direita */}
        <nav className="flex items-center gap-3">
          <Button
            variant={isActive("/dashboard") ? "default" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/dashboard">Dashboard</Link>
          </Button>

          <Button
            variant={isActive("/registrar") ? "default" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/registrar">
              <PlusCircle className="mr-1 h-4 w-4" />
              Registrar
            </Link>
          </Button>

          <Button
            variant={isActive("/config") ? "default" : "ghost"}
            size="sm"
            asChild
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
