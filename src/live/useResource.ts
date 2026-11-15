import { useCallback, useEffect, useRef, useState } from "react";
export function useResource<T>(
  load: () => Promise<T>,
  dependencies: unknown[],
  enabled = true,
) {
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    if (!enabled) return;
    const id = ++generation.current;
    setLoading(true);
    setError(null);
    try {
      const result = await load();
      if (id === generation.current) setValue(result);
    } catch (e) {
      if (id === generation.current)
        setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      if (id === generation.current) setLoading(false);
    }
  }, dependencies.concat(enabled));
  useEffect(() => {
    setValue(null);
    void refresh();
    return () => {
      generation.current++;
    };
  }, [refresh]);
  return { value, error, loading, refresh };
}
