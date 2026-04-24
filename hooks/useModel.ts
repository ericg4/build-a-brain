"use client";

import { useEffect, useState } from "react";
import type { InferenceSession } from "onnxruntime-web";
import { loadModel } from "@/lib/inference";

export function useModel() {
  const [session, setSession] = useState<InferenceSession | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadModel()
      .then((s) => {
        setSession(s);
        setIsReady(true);
      })
      .catch((err) => {
        console.error("Failed to load ONNX model:", err);
        setError(err instanceof Error ? err.message : String(err));
      });
  }, []);

  return { session, isReady, error };
}
