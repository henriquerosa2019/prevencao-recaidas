import { createContext, useContext, useState, ReactNode } from "react";

// 📱 Estado compartilhado do painel lateral em modo "gaveta" (celular/tablet
// estreito): o Header expõe o botão de hambúrguer que abre a gaveta, e o
// Sidebar consome esse estado para se posicionar como overlay deslizante.
// Em telas md+ (tablet largo/PC) o Sidebar volta ao layout fixo normal e
// esse estado simplesmente não é usado.

type SidebarMenuContextType = {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
};

const SidebarMenuContext = createContext<SidebarMenuContextType | undefined>(undefined);

export function SidebarMenuProvider({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <SidebarMenuContext.Provider value={{ mobileOpen, setMobileOpen }}>
      {children}
    </SidebarMenuContext.Provider>
  );
}

export function useSidebarMenu() {
  const ctx = useContext(SidebarMenuContext);
  if (!ctx) throw new Error("useSidebarMenu deve ser usado dentro de um SidebarMenuProvider");
  return ctx;
}
