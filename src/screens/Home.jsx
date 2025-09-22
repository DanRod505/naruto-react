// Purpose: Landing screen offering context and entry point into character selection and changelog.
// Editing: Update copy or layout with Tailwind utility classes; keep onStart and onChangelog wired to the app router state.
// Dependencies: Uses Button component. Rendered by src/App.jsx when route === "home".

import React from "react";
import Button from "../components/Button";

export default function Home({ onStart, onChangelog }) {
  return (
    <div className="min-h-[620px] w-full max-w-3xl mx-auto p-6">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
        <h2 className="text-2xl font-bold mb-4">Naruto Battle Sandbox</h2>

        <div className="space-y-4 text-neutral-300">
          <p>
            Bem-vindo! Este projeto é um protótipo modular em React para
            experimentar batalhas por turno no universo de Naruto.
          </p>
          <div>
            <h3 className="text-lg font-semibold text-neutral-100 mb-1">
              Getting Started
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>
                <button
                  onClick={onStart}
                  className="text-emerald-400 hover:text-emerald-300 transition"
                >
                  Ir para Seleção de Personagens →
                </button>
              </li>
              <li>
                <button
                  onClick={onChangelog}
                  className="text-emerald-400 hover:text-emerald-300 transition"
                >
                  Ver Changelog do Projeto →
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="solid" onClick={onStart}>
            Começar Agora
          </Button>
          <Button
            as="a"
            variant="ghost"
            href="https://vitejs.dev/"
            target="_blank"
            rel="noreferrer"
          >
            Sobre Vite
          </Button>
        </div>
      </div>
    </div>
  );
}
