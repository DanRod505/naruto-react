// src/components/FXLayer.jsx
// Purpose: Efeitos visuais leves para feedback de ataque/carga na batalha.
// API: <FXLayer from="p1"|"p2" kind="attack"|"charge" />
// Obs.: Mantém integração esperada pelo Battle.jsx. Animações curtas e só com transform/opacity.

import React from "react"
import { motion, useReducedMotion } from "framer-motion"

const MotionDiv = motion.div

export default function FXLayer({ from, kind }) {
  const prefersReduce = useReducedMotion()
  const isLeft = from === "p1" || from === "left"
  const dir = isLeft ? 1 : -1

  const dur = prefersReduce ? 0.15 : 0.35
  const durCharge = prefersReduce ? 0.35 : 0.9

  if (kind === "charge") {
    // Pulso de energia + pequenas faíscas
    return (
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* glow */}
        <MotionDiv
          className={`absolute ${isLeft ? "left-10" : "right-10"} bottom-14 h-24 w-24 rounded-full bg-emerald-400/10 border border-emerald-500/30 blur-[2px]`}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.6, 1.05, 0.92, 1.08, 1], opacity: [0, 1, 1, 1, 0.6] }}
          transition={{ duration: durCharge }}
        />
        {/* faíscas */}
        {[0, 1, 2].map((i) => (
          <MotionDiv
            key={i}
            className="absolute h-2 w-2 rounded-full bg-emerald-300/80"
            style={{
              [isLeft ? "left" : "right"]: "60px",
              bottom: `${52 + i * 10}px`,
            }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -12 - i * 4, opacity: [0, 1, 0] }}
            transition={{ duration: prefersReduce ? 0.25 : 0.5, delay: i * 0.06 }}
          />
        ))}
      </div>
    )
  }

  // kind === "attack"  — traço rápido + flash de impacto
  const startX = isLeft ? 120 : -120
  const midX = startX + 180 * dir
  const endX = midX + 120 * dir

  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      {/* traço */}
      <MotionDiv
        className="absolute top-1/2 h-1.5 rounded-full"
        style={{
          width: 90,
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 100%)",
          left: "50%",
          transformOrigin: "center",
        }}
        initial={{ x: startX, y: -16, opacity: 0, rotate: isLeft ? -2 : 2, scaleX: 0.9 }}
        animate={{ x: [startX, midX, endX], opacity: [0, 1, 0.15] }}
        transition={{ duration: dur, ease: "easeInOut" }}
      />

      {/* flash de impacto no lado do defensor */}
      <MotionDiv
        className={`absolute ${isLeft ? "right-16" : "left-16"} top-1/2 h-16 w-16 rounded-full`}
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,255,255,0.35), rgba(255,255,255,0.12), transparent 70%)",
          filter: "blur(1px)",
        }}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.6, 1.1, 1], opacity: [0, 1, 0] }}
        transition={{ duration: dur }}
      />
    </div>
  )
}
