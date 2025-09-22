// Purpose: Renders lightweight framer-motion effects for attack and charge feedback in battle scenes.
// Editing: Adjust motion values or gradients carefully to avoid jarring transitions; keep the API {from, kind} stable.
// Dependencies: Used exclusively by src/screens/Battle.jsx and relies on Tailwind utility classes.
import React from "react";
import { motion } from "framer-motion";

const MotionDiv = motion.div;

// Efeitos visuais simples para ataque/carga
export default function FXLayer({ from, kind }) {
  const isLeft = from === "p1";
  const startX = isLeft ? 120 : -120;
  const midX = isLeft ? 280 : -280;
  const direction = isLeft ? 1 : -1;

  if (kind === "charge") {
    return (
      <div className="absolute inset-0">
        <MotionDiv
          className={`absolute ${isLeft ? "left-10" : "right-10"} bottom-12 h-24 w-24 rounded-full bg-emerald-400/10 border border-emerald-500/40 blur-[2px]`}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.6, 1.05, 0.9, 1.1, 1], opacity: [0, 1, 1, 1, 0.6] }}
          transition={{ duration: 0.9 }}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <MotionDiv
        className="absolute top-1/2 h-2 w-2 rounded-full bg-white shadow"
        initial={{ x: isLeft ? 140 : undefined, right: isLeft ? undefined : 140, y: -24, opacity: 0 }}
        animate={{ x: [startX, midX, midX + 120 * direction], opacity: [0, 1, 0.2] }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        style={{ left: isLeft ? undefined : "auto" }}
      />
      <MotionDiv
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0] }}
        transition={{ duration: 0.35 }}
        style={{ background: "radial-gradient(60px 24px at 50% 50%, rgba(255,255,255,0.08), transparent)" }}
      />
    </div>
  );
}