// Purpose: Minimal global navigation header with version indicator.
// Editing: Pass `version` via props (ex: "v0.3.0") from App.

import React from "react";

export default function Nav({ route, onNav, canFight, version = "v0.3.0" }) {
  const base = "px-3 py-1.5 rounded-lg border transition text-sm";
  const active = "border-emerald-700 bg-emerald-900/30 text-emerald-200";
  const idle = "border-neutral-700 bg-neutral-900/40 hover:bg-neutral-800 text-neutral-200";
  const disabled = "border-neutral-900 bg-neutral-900/40 text-neutral-500 cursor-not-allowed";

  return (
    <nav className="sticky top-0 z-20 backdrop-blur bg-neutral-950/70 border-b border-neutral-900">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* título / logo */}
        <div className="font-bold tracking-tight">Naruto Battle Sandbox</div>

        {/* links + versão */}
        <div className="flex items-center gap-2">
          <button onClick={() => onNav("home")} className={`${base} ${route === "home" ? active : idle}`}>
            Home
          </button>
          <button onClick={() => onNav("select")} className={`${base} ${route === "select" ? active : idle}`}>
            Seleção
          </button>
          <button
            onClick={() => canFight && onNav("fight")}
            className={`${base} ${route === "fight" ? active : canFight ? idle : disabled}`}
            disabled={!canFight}
            title={canFight ? "" : "Escolha os lutadores na Seleção"}
          >
            Batalha
          </button>
          <button onClick={() => onNav("changelog")} className={`${base} ${route === "changelog" ? active : idle}`}>
            Changelog
          </button>

          {/* indicador de versão (canto direito) */}
          <span
            className="ml-3 text-[10px] px-2 py-0.5 rounded-full border border-neutral-700 bg-neutral-900/50 text-neutral-300"
            title="Versão do protótipo"
          >
            {version}
          </span>
        </div>
      </div>
    </nav>
  );
}
