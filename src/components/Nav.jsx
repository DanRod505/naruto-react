// Purpose: Global navigation header, responsive for mobile (touch-friendly).
// Editing: Pass `version` via props (ex: "v0.3.4") from App.
// Dependencies: Tailwind for layout; AudioToggle for SFX control.

import React from "react"
import AudioToggle from "./AudioToggle"

export default function Nav({ route, onNav, canFight, version = "v0.3.4" }) {
  const base =
    "px-3 py-2 rounded-xl border transition text-sm sm:text-base min-w-[72px] text-center"
  const active = "border-emerald-700 bg-emerald-900/40 text-emerald-200"
  const idle =
    "border-neutral-700 bg-neutral-900/40 hover:bg-neutral-800 text-neutral-200"
  const disabled =
    "border-neutral-900 bg-neutral-900/40 text-neutral-500 cursor-not-allowed"

  return (
    <nav className="sticky top-0 z-20 backdrop-blur bg-neutral-950/70 border-b border-neutral-900">
      <div className="max-w-6xl mx-auto px-3 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {/* título / logo */}
        <div className="font-bold tracking-tight text-base sm:text-lg">
          Naruto Battle Sandbox
        </div>

        {/* navegação + versão + áudio */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => onNav("home")}
            className={`${base} ${route === "home" ? active : idle}`}
          >
            Home
          </button>

          <button
            onClick={() => onNav("select")}
            className={`${base} ${route === "select" ? active : idle}`}
          >
            Seleção
          </button>

          <button
            onClick={() => canFight && onNav("fight")}
            className={`${base} ${
              route === "fight" ? active : canFight ? idle : disabled
            }`}
            disabled={!canFight}
            title={canFight ? "" : "Escolha os lutadores na Seleção"}
          >
            Batalha
          </button>

          <button
            onClick={() => onNav("changelog")}
            className={`${base} ${route === "changelog" ? active : idle}`}
          >
            Changelog
          </button>

          {/* empurra os itens da direita quando couber em linha */}
          <div className="ml-auto flex items-center gap-2">
            <AudioToggle size="sm" withSlider />
            <span
              className="text-[10px] px-2 py-0.5 rounded-full border border-neutral-700 bg-neutral-900/50 text-neutral-300"
              title="Versão do protótipo"
            >
              {version}
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}
