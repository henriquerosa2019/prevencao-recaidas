import { Link, useLocation } from "react-router-dom";
import { Heart, Home, Menu, PlusCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarMenu } from "@/lib/sidebarContext";

const Header = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { setMobileOpen } = useSidebarMenu();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-card/80 shadow-sm backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-2 px-3 sm:px-4 md:px-6">
        {/* ☰ Hambúrguer — só no celular/tablet estreito, abre a gaveta do painel lateral */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
          className="-ml-1 shrink-0 rounded-lg p-2 text-foreground transition hover:bg-secondary/60 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo / título à esquerda */}
        <Link
          to="/dashboard"
          className="flex min-w-0 items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Heart className="h-6 w-6 shrink-0 text-primary" />
          <h1 className="truncate text-base font-display font-semibold text-foreground aurora-text-glow sm:text-xl">
            <span className="sm:hidden">Recaídas</span>
            <span className="hidden sm:inline">Prevenção Recaídas</span>
          </h1>
        </Link>

        {/* Botões à direita — rótulos só aparecem em telas largas (lg+, PC);
            no celular e no tablet ficam só os ícones, pra sobrar espaço pro
            título e pro painel lateral expandido não brigarem por espaço. */}
        <nav className="flex shrink-0 items-center gap-1 lg:gap-3">
          <Button
            variant={isActive("/dashboard") ? "default" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/dashboard">
              <Home className="h-4 w-4 lg:hidden" />
              <span className="hidden lg:inline">Dashboard</span>
            </Link>
          </Button>

          <Button
            variant={isActive("/registros") ? "default" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/registros">
              <PlusCircle className="h-4 w-4 lg:mr-1" />
              <span className="hidden lg:inline">Registrar</span>
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
