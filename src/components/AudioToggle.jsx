// src/components/AudioToggle.jsx
// Controle global de áudio (SFX) — botão mute/unmute + slider de volume.
// Uso:
//   import AudioToggle from "../components/AudioToggle";
//   <AudioToggle className="ml-2" size="sm" withSlider />

import React from "react"
import { useSfx } from "../hooks/useSfx"

function cls(...xs) {
  return xs.filter(Boolean).join(" ")
}

export default function AudioToggle({
  className = "",
  size = "md",         // "sm" | "md"
  withSlider = true,   // mostra o controle de volume
  showLabel = false,   // mostra texto "Som" ao lado do ícone
  label = "Som",       // texto do label, se showLabel=true
}) {
  const { enabled, setEnabled, volume, setVolume } = useSfx()

  const sizes = {
    sm: { btn: "h-8 px-2 text-xs rounded-lg", sliderW: "w-16", icon: "text-base" },
    md: { btn: "h-9 px-3 text-sm rounded-lg", sliderW: "w-20", icon: "text-lg" },
  }[size] || { btn: "h-9 px-3 text-sm rounded-lg", sliderW: "w-20", icon: "text-lg" }

  return (
    <div className={cls("flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={() => setEnabled(!enabled)}
        className={cls(
          "bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition",
          sizes.btn
        )}
        aria-pressed={enabled}
        aria-label={enabled ? "Desativar som" : "Ativar som"}
        title={enabled ? "Desativar som" : "Ativar som"}
      >
        <span className={sizes.icon} aria-hidden>
          {enabled ? "🔊" : "🔇"}
        </span>
        {showLabel && <span className="ml-1">{label}</span>}
      </button>

      {withSlider && (
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(e) => setVolume(Number(e.target.value) / 100)}
          className={cls("h-1 accent-emerald-500", sizes.sliderW)}
          title="Volume"
          aria-label="Volume"
        />
      )}
    </div>
  )
}
