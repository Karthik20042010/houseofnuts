import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchInventory, isInventoryHealthy, StockMap } from "@/lib/inventory";

interface Ctx {
  stock: StockMap;
  loading: boolean;
  isOffline: boolean;
  refresh: () => Promise<void>;
}

const InventoryContext = createContext<Ctx | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stock, setStock] = useState<StockMap>({});
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const s = await fetchInventory(true);
    setStock(s);
    setIsOffline(!isInventoryHealthy());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInventory()
      .then((s) => {
        setStock(s);
        setIsOffline(!isInventoryHealthy());
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <InventoryContext.Provider value={{ stock, loading, isOffline, refresh }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const c = useContext(InventoryContext);
  if (!c) throw new Error("useInventory must be inside InventoryProvider");
  return c;
};
