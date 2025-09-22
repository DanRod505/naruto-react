// Purpose: Displays fighter information with animated bars and badges inside the battle view.
// Editing: Update layout or motion variants carefully; keep dimensions aligned with Battle screen grid.
// Dependencies: framer-motion, Tailwind. Espera que cada fighter tenha `sprite` (string) em vez de `emoji`.

import React from "react";
import { motion } from "framer-motion";

const MotionDiv = motion.div;

export function FighterCard({ fighter, side, active }) {
  const hpPct = fighter.hp / fighter.maxHP;
  const chakraPct = fighter.chakra / fighter.maxChakra;
  const badge =
    side === "left"
      ? "bg-orange-500/20 border-orange-500/30"
      : "bg-sky-500/20 border-sky-500/30";

  return (
    <div
      className={`relative rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900/70 to-neutral-950 p-4 ${
        side === "left" ? "items-start" : "items-end"
      }`}
    >
      {/* header: avatar + nome + badge */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900">
          {fighter.sprite ? (
            <img
              src={fighter.sprite}
              alt={fighter.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-neutral-800" />
          )}
        </div>
        <div>
          <div className="text-lg font-bold leading-tight">{fighter.name}</div>
          <div
            className={`mt-1 inline-flex items-center gap-2 text-[10px] px-2 py-0.5 rounded-full border ${badge}`}
          >
            <span>{side === "left" ? "Você" : "Adversário"}</span>
            {active && <PulseDot />}
          </div>
        </div>
      </div>

      {/* showcase: sprite grande com FX de fundo */}
      <div className="relative mt-4 h-36 rounded-xl bg-neutral-900/60 border border-neutral-800 overflow-hidden flex items-center justify-center">
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
        />
        {fighter.sprite ? (
          <img
            src={fighter.sprite}
            alt={fighter.name}
            className={`max-h-32 object-contain ${
              side === "left" ? "translate-x-[-6px]" : "translate-x-[6px]"
            }`}
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-neutral-900" />
        )}
      </div>

      {/* barras */}
      <div className="mt-4 space-y-2">
        <Bar label="HP" value={fighter.hp} max={fighter.maxHP} pct={hpPct} kind="hp" />
        <Bar
          label="Chakra"
          value={fighter.chakra}
          max={fighter.maxChakra}
          pct={chakraPct}
          kind="chakra"
        />
      </div>
    </div>
  );
}

function Bar({ label, value, max, pct, kind }) {
  const color =
    kind === "hp" ? "from-rose-600 to-rose-500" : "from-sky-600 to-sky-500";

  return (
    <div>
      <div className="flex items-end justify-between mb-1">
        <span className="text-xs text-neutral-300">{label}</span>
        <span className="text-xs tabular-nums text-neutral-400">
          {value} / {max}
        </span>
      </div>
      <div className="h-3 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${color}`}
          style={{ width: `${Math.round(pct * 100)}%` }}
          initial={false}
          animate={{ width: `${Math.round(pct * 100)}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
      </div>
    </div>
  );
}

function PulseDot() {
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/70"></span>
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
    </span>
  );
}

export default FighterCard;
