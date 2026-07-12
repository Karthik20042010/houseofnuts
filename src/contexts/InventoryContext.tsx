import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchInventory, StockMap } from "@/lib/inventory";

interface Ctx {
  stock: StockMap;
  loading: boolean;
  refresh: () => Promise<void>;
}

const InventoryContext = createContext<Ctx | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stock, setStock] = useState<StockMap>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const s = await fetchInventory(true);
    setStock(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInventory()
      .then((s) => setStock(s))
      .finally(() => setLoading(false));
  }, []);

  return (
    <InventoryContext.Provider value={{ stock, loading, refresh }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const c = useContext(InventoryContext);
  if (!c) throw new Error("useInventory must be inside InventoryProvider");
  return c;
};
