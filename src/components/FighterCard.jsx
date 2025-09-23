// src/components/FighterCard.jsx
// Purpose: Displays fighter information with animated bars and badges inside the battle view.
// Editing: Update layout or motion variants carefully; keep dimensions aligned with Battle screen grid.
// Dependencies: framer-motion, Tailwind. Espera que cada fighter tenha `sprite` (string) em vez de `emoji`.

import React, { useState } from "react"
import { motion } from "framer-motion"

const MotionDiv = motion.div

// Garante que o caminho do sprite funcione no mobile (usa /public como base)
function resolveSprite(path) {
  if (!path) return null
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) return path
  const base = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.BASE_URL) || "/"
  return `${base}${path}`.replace(/\/\/+/g, "/")
}

// Fallback simples com monograma
function Monogram({ name = "" }) {
  const initials = name.split(" ").map(s => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
  return (
    <div className="h-full w-full flex items-center justify-center bg-neutral-800 text-neutral-300 text-xs font-bold">
      {initials || "?"}
    </div>
  )
}

export function FighterCard({ fighter, side, active }) {
  const hpPct = fighter.hp / fighter.maxHP
  const chakraPct = fighter.chakra / fighter.maxChakra

  // HP dinâmico: verde (>=60%), amarelo (30–59%), vermelho (<30%)
  const hpClass =
    hpPct >= 0.60 ? "from-emerald-600 to-emerald-500"
    : hpPct >= 0.30 ? "from-amber-500 to-amber-400"
    : "from-rose-600 to-rose-500"

  const badge =
    side === "left"
      ? "bg-orange-500/20 border-orange-500/30"
      : "bg-sky-500/20 border-sky-500/30"

  // controlar erro de imagem (avatar e showcase usam o mesmo estado)
  const [imgOk, setImgOk] = useState(true)
  const spriteSrc = resolveSprite(fighter.sprite)

  return (
    <div
      className={`relative rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900/70 to-neutral-950 p-3 sm:p-4 ${
        side === "left" ? "items-start" : "items-end"
      }`}
    >
      {/* header: avatar + nome + badge */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 sm:h-10 sm:w-10 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900">
          {imgOk && spriteSrc ? (
            <img
              src={spriteSrc}
              alt={fighter.name}
              className="h-full w-full object-contain"
              loading="eager"
              decoding="async"
              onError={() => setImgOk(false)}
            />
          ) : (
            <Monogram name={fighter.name} />
          )}
        </div>

        <div className="min-w-0">
          <div className="font-bold leading-tight text-[clamp(14px,3.6vw,18px)] truncate">
            {fighter.name}
          </div>
          <div
            className={`mt-1 inline-flex items-center gap-2 text-[10px] px-2 py-0.5 rounded-full border ${badge}`}
          >
            <span>{side === "left" ? "Você" : "Adversário"}</span>
            {active && <PulseDot />}
          </div>
        </div>
      </div>

      {/* showcase: sprite grande com FX de fundo (responsivo) */}
      <div className="relative mt-3 sm:mt-4 h-32 sm:h-36 md:h-44 rounded-xl bg-neutral-900/60 border border-neutral-800 overflow-hidden flex items-center justify-center">
        <MotionDiv
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(600px 120px at 10% 30%, rgba(255,255,255,0.06), transparent)",
              "radial-gradient(600px 120px at 90% 70%, rgba(255,255,255,0.06), transparent)",
              "radial-gradient(600px 120px at 10% 30%, rgba(255,255,255,0.06), transparent)",
            ],
          }}
          transition={{ duration: 6, repeat: Infinity }}
          aria-hidden
        />
        {imgOk && spriteSrc ? (
          <img
            src={spriteSrc}
            alt={fighter.name}
            className={`max-h-28 sm:max-h-32 md:max-h-40 object-contain ${
              side === "left" ? "translate-x-[-6px]" : "translate-x-[6px]"
            }`}
            loading="eager"
            decoding="async"
            onError={() => setImgOk(false)}
          />
        ) : (
          <Monogram name={fighter.name} />
        )}
      </div>

      {/* barras */}
      <div className="mt-3 sm:mt-4 space-y-2">
        <Bar
          label="HP"
          value={fighter.hp}
          max={fighter.maxHP}
          pct={hpPct}
          gradientClass={hpClass}
        />
        <Bar
          label="Chakra"
          value={fighter.chakra}
          max={fighter.maxChakra}
          pct={chakraPct}
          gradientClass="from-sky-600 to-sky-500"
        />
      </div>
    </div>
  )
}

function Bar({ label, value, max, pct, gradientClass }) {
  const width = Math.max(0, Math.min(100, Math.round(pct * 100))) // guarda

  return (
    <div>
      <div className="flex items-end justify-between mb-1">
        <span className="text-xs text-neutral-300">{label}</span>
        <span className="text-xs tabular-nums text-neutral-400">
          {value} / {max}
        </span>
      </div>
      <div className="h-3 sm:h-3.5 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${gradientClass}`}
          style={{ width: `${width}%` }}
          initial={false}
          animate={{ width: `${width}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
      </div>
    </div>
  )
}

function PulseDot() {
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/70" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
    </span>
  )
}

export default FighterCard
