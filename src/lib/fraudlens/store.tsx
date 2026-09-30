import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeTransaction, type AnalysisResult } from "./analyze.functions";
import { SAMPLES } from "./engine";

type Ok = Extract<AnalysisResult, { ok: true }>;
type Ctx = {
  raw: string;
  setRaw: (s: string) => void;
  result: Ok | null;
  error: Extract<AnalysisResult, { ok: false }>["error"] | null;
  running: boolean;
  run: (raw?: string) => Promise<void>;
  clear: () => void;
};
const C = createContext<Ctx | null>(null);
const KEY = "fraudlens:last";

export function FraudLensProvider({ children }: { children: ReactNode }) {
  const analyze = useServerFn(analyzeTransaction);
  const [raw, setRaw] = useState(JSON.stringify(SAMPLES.suspicious.txn, null, 2));
  const [result, setResult] = useState<Ok | null>(null);
  const [error, setError] = useState<Ctx["error"]>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    try {
      const s = sessionStorage.getItem(KEY);
      if (s) {
        const p = JSON.parse(s);
        setResult(p.result);
        setRaw(p.raw);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const run = useCallback(
    async (override?: string) => {
      const input = override ?? raw;
      if (override !== undefined) setRaw(override);
      setRunning(true);
      setError(null);
      try {
        const r = await analyze({ data: { raw: input } });
        if (r.ok) {
          setResult(r);
          sessionStorage.setItem(KEY, JSON.stringify({ result: r, raw: input }));
        } else setError(r.error);
      } catch (e) {
        setError({
          title: "Analysis could not be completed.",
          message: "The FraudLens service did not respond. Please try again.",
          details: [String((e as Error)?.message ?? e)],
        });
      } finally {
        setRunning(false);
      }
    },
    [raw, analyze],
  );

  const clear = () => {
    setResult(null);
    setError(null);
    sessionStorage.removeItem(KEY);
  };

  return (
    <C.Provider value={{ raw, setRaw, result, error, running, run, clear }}>{children}</C.Provider>
  );
}

export function useFraudLens() {
  const c = useContext(C);
  if (!c) throw new Error("useFraudLens outside provider");
  return c;
}
