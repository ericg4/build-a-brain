"use client";

import { useModel } from "@/hooks/useModel";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

export function ModelStatus() {
  const { isReady, error } = useModel();

  return (
    <AnimatePresence>
      {!isReady && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-[var(--border-custom)] bg-[var(--bg)] px-4 py-2 shadow-sm"
        >
          <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
          <span className="text-sm text-[var(--fg-muted)]">
            Loading model...
          </span>
        </motion.div>
      )}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 shadow-sm"
        >
          <span className="text-sm text-red-700">
            Model failed to load. Please refresh.
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
