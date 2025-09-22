// Purpose: Simple router coordinating home, selection, battle, and changelog with a global nav.
// Editing: Keep route handling in one place; ensure fighters exist before rendering Battle.

import React, { useState } from "react";
import "./styles/index.css";
import Nav from "./components/Nav";
import Home from "./screens/Home";
import Select from "./screens/Select";
import Battle from "./screens/Battle";
import Changelog from "./screens/Changelog";
import { cloneFighter } from "./systems/battleEngine";

// Importa a versão diretamente do package.json
import pkg from "../package.json"

export default function App() {
  const [route, setRoute] = useState("home"); // home | select | fight | changelog
  const [fighters, setFighters] = useState(null); // { p1, p2 }

  const canFight = Boolean(fighters?.p1 && fighters?.p2);
  const version = `v${pkg.version}`;

  const go = (next) => {
    // Se tentar ir para "fight" sem lutadores, redireciona para "select"
    if (next === "fight" && !canFight) return setRoute("select");
    setRoute(next);
  };

  return (
    <div>
      <Nav route={route} onNav={go} canFight={canFight} version={version} />

      {route === "home" && (
        <Home onStart={() => go("select")} onChangelog={() => go("changelog")} />
      )}

      {route === "select" && (
        <Select
          onStart={(p1, p2) => {
            setFighters({ p1: cloneFighter(p1), p2: cloneFighter(p2) });
            go("fight");
          }}
          onBack={() => go("home")}
        />
      )}

      {route === "changelog" && <Changelog version={version} onBack={() => go("home")} />}

      {route === "fight" && canFight && (
        <Battle
          initialP1={fighters.p1}
          initialP2={fighters.p2}
          onBack={() => go("select")}
        />
      )}
    </div>
  );
}
