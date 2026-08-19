import { useEffect, useState } from "react";

/**
 * False for the first paint after mount (and whenever `key` changes), so grids
 * can show skeletons instead of a blank/half-painted section.
 */
export function useGridReady(key: string | number = "") {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    const id = window.setTimeout(() => setReady(true), 120);
    return () => window.clearTimeout(id);
  }, [key]);

  return ready;
}
