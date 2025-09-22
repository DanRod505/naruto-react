// Purpose: Character selection screen for choosing player and opponent before a battle begins.
// Editing: Uses local sprites (character.sprite). Keep validation so both fighters are chosen before starting.
// Dependencies: Loads CHARACTER_LIBRARY from src/data/characters.js and passes picks to src/App.jsx.

import React, { useState } from "react";
import { CHARACTER_LIBRARY } from "../data/characters";

export default function Select({ onStart, onBack }) {
  const [p1Sel, setP1Sel] = useState(null);
  const [p2Sel, setP2Sel] = useState(null);

  function start() {
    if (p1Sel && p2Sel) onStart(p1Sel, p2Sel);
  }

  return (
    <div className="min-h-[620px] w-full max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Seleção de Personagens</h1>
          <span className="text-xs text-neutral-400">Escolha o seu ninja e o adversário</span>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-800 text-sm transition"
          >
            Voltar
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SelectPanel title="Você" value={p1Sel} onChange={setP1Sel} />
        <SelectPanel
          title="Adversário"
          value={p2Sel}
          onChange={setP2Sel}
          disallowKey={p1Sel?.key}
        />
      </div>

      <div className="mt-6 flex items-center justify-center">
        <button
          onClick={start}
          disabled={!p1Sel || !p2Sel}
          className={`px-5 py-2 rounded-2xl border transition ${
            !p1Sel || !p2Sel
              ? "border-neutral-800 bg-neutral-900/50 text-neutral-500 cursor-not-allowed"
              : "border-emerald-700 bg-emerald-900/40 hover:bg-emerald-900/60"
          }`}
        >
          Iniciar Batalha
        </button>
      </div>
    </div>
  );
}

function SelectPanel({ title, value, onChange, disallowKey }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 backdrop-blur">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold">{title}</h2>
        <span className="text-xs text-neutral-400">
          {value ? value.name : "Nenhum selecionado"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {CHARACTER_LIBRARY.map((character) => {
          const disabled = disallowKey && character.key === disallowKey;
          const active = value?.key === character.key;

          return (
            <button
              key={character.key}
              disabled={disabled}
              onClick={() => !disabled && onChange(character)}
              className={`relative rounded-xl border px-3 py-3 text-left transition ${
                active
                  ? "border-emerald-600 bg-emerald-900/30"
                  : disabled
                  ? "border-neutral-900 bg-neutral-900/40 text-neutral-500 cursor-not-allowed"
                  : "border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800"
              }`}
              title={character.name}
            >
              {/* Área de sprite */}
              <div className="h-24 w-full rounded-md overflow-hidden border border-neutral-800 bg-neutral-900 flex items-center justify-center">
                {character.sprite ? (
                  <img
                    src={character.sprite}
                    alt={character.name}
                    className="max-h-20 object-contain"
                    loading="lazy"
                  />
                ) : (
                  <FallbackMonogram name={character.name} />
                )}
              </div>

              <div className="mt-2 font-semibold text-sm leading-tight">
                {character.name}
              </div>
              <div className="mt-1 text-[10px] text-neutral-400">
                HP {character.maxHP} — Chakra {character.maxChakra}
              </div>
            </button>
          );
        })}
      </div>

      {value && (
        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
          <h3 className="font-semibold text-sm">Técnicas</h3>
          <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {value.techniques.map((tech) => (
              <li
                key={tech.id}
                className="rounded-lg border border-neutral-800 bg-neutral-900/70 px-2 py-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{tech.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                    {tech.kind}
                  </span>
                </div>
                <div className="text-neutral-300 mt-0.5">{tech.desc}</div>
                <div className="mt-1 text-[11px] text-neutral-400">
                  Dano {tech.power} — Chakra {tech.cost}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Fallback monogram caso não exista sprite */
function FallbackMonogram({ name = "" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="h-full w-full flex items-center justify-center bg-neutral-800 text-neutral-300 text-lg font-bold">
      {initials}
    </div>
  );
}
