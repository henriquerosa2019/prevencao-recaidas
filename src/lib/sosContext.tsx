import { createContext, useContext, useState, ReactNode } from "react";

type SosContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SosContext = createContext<SosContextType | undefined>(undefined);

export function SosProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <SosContext.Provider value={{ open, setOpen }}>
      {children}
    </SosContext.Provider>
  );
}

export function useSos() {
  const ctx = useContext(SosContext);
  if (!ctx) throw new Error("useSos deve ser usado dentro de um SosProvider");
  return ctx;
}
