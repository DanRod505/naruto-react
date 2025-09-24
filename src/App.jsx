// src/App.jsx
// Purpose: App container with safe-area handling and route coordination (home, select, fight, changelog).
// Editing: Update routes/screens here; AppShell wraps everything with safe-area support for mobile.
// Dependencies: AppShell, Nav, Home, Select, Battle, Changelog, cloneFighter.

import React, { useState } from "react"
import Nav from "./components/Nav"
import Home from "./screens/Home"
import Select from "./screens/Select"
import Battle from "./screens/Battle"
import Changelog from "./screens/Changelog"
import { cloneFighter } from "./systems/battleEngine"
import AppShell from "./components/AppShell"
import { SfxProvider } from "./hooks/useSfx" // ⬅️ novo: provider de áudio

// Importa a versão diretamente do package.json
import pkg from "../package.json"

export default function App() {
  const [route, setRoute] = useState("home") // home | select | fight | changelog
  const [fighters, setFighters] = useState(null) // { p1, p2 }

  const canFight = Boolean(fighters?.p1 && fighters?.p2)
  const version = `v${pkg.version}`

  // Navegação padrão (cliques na Nav): impede 'fight' sem lutadores.
  const go = (next) => {
    if (next === "fight" && !canFight) return setRoute("select")
    setRoute(next)
  }

  return (
    <SfxProvider>
      <AppShell
        header={<Nav route={route} onNav={go} canFight={canFight} version={version} />}
        footer={<div className="text-xs opacity-70 text-center">{version}</div>}
      >
        {route === "home" && (
          <Home onStart={() => go("select")} onChangelog={() => go("changelog")} />
        )}

        {route === "select" && (
          <Select
            onStart={(p1, p2) => {
              // 1) Salva os lutadores
              setFighters({ p1: cloneFighter(p1), p2: cloneFighter(p2) })
              // 2) Vai DIRETO para a batalha
              setRoute("fight")
            }}
            onBack={() => go("home")}
          />
        )}

        {route === "changelog" && (
          <Changelog version={version} onBack={() => go("home")} />
        )}

        {route === "fight" && canFight && (
          <Battle
            initialP1={fighters.p1}
            initialP2={fighters.p2}
            onBack={() => go("select")}
          />
        )}
      </AppShell>
    </SfxProvider>
  )
}
