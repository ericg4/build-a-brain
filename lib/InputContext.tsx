"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

interface InputState {
  pixels: Float32Array | null;
  source: "drawn" | "sample" | null;
  sourceDigit?: number;
}

interface InputContextValue extends InputState {
  setInput: (pixels: Float32Array, source: "drawn" | "sample", sourceDigit?: number) => void;
  clearInput: () => void;
}

const InputContext = createContext<InputContextValue | null>(null);

export function InputProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InputState>({
    pixels: null,
    source: null,
  });

  const setInput = useCallback(
    (pixels: Float32Array, source: "drawn" | "sample", sourceDigit?: number) => {
      setState({ pixels, source, sourceDigit });
    },
    []
  );

  const clearInput = useCallback(() => {
    setState({ pixels: null, source: null });
  }, []);

  return (
    <InputContext value={{ ...state, setInput, clearInput }}>
      {children}
    </InputContext>
  );
}

export function useInput() {
  const ctx = useContext(InputContext);
  if (!ctx) throw new Error("useInput must be used within InputProvider");
  return ctx;
}
