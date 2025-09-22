// Purpose: Shared panel and stat bar UI primitives used across screens for layout and status display.
// Editing: Agora usa apenas classes do Tailwind, sem dependencia do index.css legado.
// Dependencies: Requer framer-motion para animar barras de status.

import React from "react";
import { motion } from "framer-motion";

const MotionDiv = motion.div;

export function Panel({ title, subtitle, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 backdrop-blur ${className}`}>
      {title && <h2 className="text-xl font-bold mb-1">{title}</h2>}
      {subtitle && <p className="text-sm text-neutral-400 mb-3">{subtitle}</p>}
      {children}
    </div>
  );
}

export function StatBar({ value = 0, max = 100, label, type = "hp" }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  const grad = type === "chakra" ? "from-sky-600 to-sky-500" : "from-rose-600 to-rose-500";

  return (
    <div>
      {label && (
        <div className="flex items-end justify-between mb-1">
          <small className="text-neutral-300">{label}</small>
          <small className="text-neutral-400 tabular-nums">
            {value}/{max}
          </small>
        </div>
      )}
      <div className="h-3 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
        <MotionDiv
          className={`h-full bg-gradient-to-r ${grad}`}
          style={{ width: `${pct}%` }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
      </div>
    </div>
  );
}