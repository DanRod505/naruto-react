// src/components/FighterCard.jsx
// Purpose: Displays fighter information with animated bars, badges and status chips.
// Dependencies: framer-motion, Tailwind.

import React, { useState } from "react"
import { motion } from "framer-motion"

const MotionDiv = motion.div

function resolveSprite(path) {
  if (!path) return null
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) return path
  const base = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.BASE_URL) || "/"
  return `${base}${path}`.replace(/\/\/+/g, "/")
}

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

  const hpClass =
    hpPct >= 0.60 ? "from-emerald-600 to-emerald-500"
    : hpPct >= 0.30 ? "from-amber-500 to-amber-400"
    : "from-rose-600 to-rose-500"

  const badge =
    side === "left"
      ? "bg-orange-500/20 border-orange-500/30"
      : "bg-sky-500/20 border-sky-500/30"

  const [imgOk, setImgOk] = useState(true)
  const spriteSrc = resolveSprite(fighter.sprite)

  return (
    <div className={`relative rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900/70 to-neutral-950 p-3 sm:p-4 ${side === "left" ? "items-start" : "items-end"}`}>
      {/* header */}
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
          <div className={`mt-1 inline-flex items-center gap-2 text-[10px] px-2 py-0.5 rounded-full border ${badge}`}>
            <span>{side === "left" ? "Você" : "Adversário"}</span>
            {active && <PulseDot />}
          </div>
        </div>
      </div>

      {/* showcase */}
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
            className={`max-h-28 sm:max-h-32 md:max-h-40 object-contain ${side === "left" ? "translate-x-[-6px]" : "translate-x-[6px]"}`}
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
        <Bar label="HP" value={fighter.hp} max={fighter.maxHP} pct={hpPct} gradientClass={hpClass} />
        <Bar label="Chakra" value={fighter.chakra} max={fighter.maxChakra} pct={chakraPct} gradientClass="from-sky-600 to-sky-500" />
      </div>

      {/* chips de status */}
      {Array.isArray(fighter.statuses) && fighter.statuses.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {fighter.statuses.map((s) => (
            <StatusChip key={s.kind} kind={s.kind} duration={s.duration} />
          ))}
        </div>
      )}
    </div>
  )
}

function Bar({ label, value, max, pct, gradientClass }) {
  const width = Math.max(0, Math.min(100, Math.round(pct * 100)))
  return (
    <div>
      <div className="flex items-end justify-between mb-1">
        <span className="text-xs text-neutral-300">{label}</span>
        <span className="text-xs tabular-nums text-neutral-400">{value} / {max}</span>
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

function StatusChip({ kind, duration }) {
  const map = {
    poison: { label: "Veneno", icon: "☠", cls: "border-emerald-700/40 bg-emerald-900/30 text-emerald-200" },
    burn: { label: "Queimadura", icon: "🔥", cls: "border-orange-700/40 bg-orange-900/30 text-orange-200" },
    paralysis: { label: "Paralisia", icon: "⚡", cls: "border-yellow-700/40 bg-yellow-900/30 text-yellow-200" },
    regen: { label: "Regeneração", icon: "➕", cls: "border-sky-700/40 bg-sky-900/30 text-sky-200" },
    shield: { label: "Escudo", icon: "🛡", cls: "border-indigo-700/40 bg-indigo-900/30 text-indigo-200" },
  }
  const meta = map[kind] || { label: kind, icon: "•", cls: "border-neutral-700 bg-neutral-800 text-neutral-200" }
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${meta.cls}`}>
      <span className="mr-1">{meta.icon}</span>
      {meta.label}
      {typeof duration === "number" && <span className="opacity-70"> · {duration}t</span>}
    </span>
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
