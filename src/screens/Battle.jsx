// Purpose: Orchestrates the turn-based battle loop including player actions, AI turns, and combat log.
// Editing: Keep state updates immutable and memoized hooks stable; adjust animations or log copy as needed.
// Dependencies: Consumes FighterCard, FXLayer, and helpers from src/systems/battleEngine.js plus character data passed by App.
import React, { useCallback, useEffect, useMemo, useState } from "react";
import FighterCard from "../components/FighterCard";
import FXLayer from "../components/FXLayer";
import { clamp, computeDamage, chooseAI } from "../systems/battleEngine";

export default function Battle({ initialP1, initialP2, onBack }) {
  const [p1, setP1] = useState(initialP1);
  const [p2, setP2] = useState(initialP2);
  const [turn, setTurn] = useState("player"); // player | enemy | over
  const [log, setLog] = useState([`Batalha iniciada! ${initialP1.name} vs. ${initialP2.name}.`]);
  const [fx, setFx] = useState(null);

  const pushLog = useCallback((line) => {
    setLog((entries) => [...entries, line].slice(-30));
  }, []);

  const isOver = turn === "over";

  const isOverText = useMemo(() => {
    if (p1.hp <= 0 && p2.hp <= 0) return "Empate dramatico!";
    if (p2.hp <= 0) return `${p1.name} venceu!`;
    if (p1.hp <= 0) return `${p2.name} venceu...`;
    return "";
  }, [p1.hp, p1.name, p2.hp, p2.name]);

  const applyCharge = useCallback(
    (attackerKey) => {
      if (isOver) return;
      const attacker = attackerKey === "p1" ? p1 : p2;
      const gain = Math.round(attacker.maxChakra * 0.28 + (Math.random() * 10 - 5));
      const nextChakra = clamp(attacker.chakra + gain, 0, attacker.maxChakra);
      const updatedAttacker = { ...attacker, chakra: nextChakra };

      setFx({ from: attackerKey, kind: "charge" });

      const delta = Math.max(0, nextChakra - attacker.chakra);
      pushLog(`${attacker.name} carrega chakra (+${delta}).`);

      if (attackerKey === "p1") {
        setP1(updatedAttacker);
      } else {
        setP2(updatedAttacker);
      }

      setTurn(attackerKey === "p1" ? "enemy" : "player");
    },
    [isOver, p1, p2, pushLog]
  );

  const applyAttack = useCallback(
    (attackerKey, technique) => {
      if (isOver) return;

      const attacker = attackerKey === "p1" ? p1 : p2;
      const defender = attackerKey === "p1" ? p2 : p1;

      if (attacker.chakra < technique.cost) {
        pushLog(`${attacker.name} tentou ${technique.name}, mas ficou sem chakra e precisou concentrar.`);
        applyCharge(attackerKey);
        return;
      }

      const { dmg, crit } = computeDamage(technique, attacker, defender);
      const updatedAttacker = {
        ...attacker,
        chakra: clamp(attacker.chakra - technique.cost, 0, attacker.maxChakra),
      };
      const updatedDefender = {
        ...defender,
        hp: clamp(defender.hp - dmg, 0, defender.maxHP),
      };

      setFx({ from: attackerKey, kind: "attack" });
      pushLog(`${attacker.name} usa ${technique.name}${crit ? " (CRITICO!)" : ""} e causa ${dmg} de dano!`);

      if (attackerKey === "p1") {
        setP1(updatedAttacker);
        setP2(updatedDefender);
      } else {
        setP2(updatedAttacker);
        setP1(updatedDefender);
      }

      if (updatedDefender.hp <= 0) {
        pushLog(`${defender.name} foi derrotado!`);
        setTurn("over");
        return;
      }

      setTurn(attackerKey === "p1" ? "enemy" : "player");
    },
    [applyCharge, isOver, p1, p2, pushLog]
  );

  useEffect(() => {
    if (turn !== "enemy" || isOver) return undefined;

    const timer = setTimeout(() => {
      const action = chooseAI(p2);
      if (action.type === "charge") {
        applyCharge("p2");
      } else if (action.type === "attack" && action.technique) {
        applyAttack("p2", action.technique);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [turn, isOver, p2, applyAttack, applyCharge]);

  return (
    <div className="min-h-[620px] w-full max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">Batalha - {p1.name} vs. {p2.name}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-3 py-1.5 text-sm"
          >
            Trocar personagens
          </button>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-3 py-1.5 text-sm"
          >
            Recarregar
          </button>
        </div>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <FighterCard fighter={p1} side="left" active={turn === "player" && !isOver} />
        <FighterCard fighter={p2} side="right" active={turn === "enemy" && !isOver} />
        {fx && (
          <div className="absolute inset-0 pointer-events-none">
            <FXLayer from={fx.from} kind={fx.kind} />
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 backdrop-blur">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold">Acoes</h2>
              <span className="text-xs text-neutral-400">
                {isOver ? "Combate encerrado" : turn === "player" ? "Seu turno" : "Turno inimigo"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {p1.techniques.map((technique) => (
                <button
                  key={technique.id}
                  disabled={turn !== "player" || isOver}
                  onClick={() => applyAttack("p1", technique)}
                  className={`group rounded-xl border px-3 py-2 text-left transition ${
                    turn === "player" && !isOver
                      ? "border-neutral-700 hover:border-neutral-500 bg-neutral-800/60 hover:bg-neutral-800"
                      : "border-neutral-900 bg-neutral-900/50 text-neutral-500 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm">{technique.name}</div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                      {technique.kind}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-neutral-300">{technique.desc}</div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span>
                      Dano: <b>{technique.power}</b>
                    </span>
                    <span>
                      Chakra: <b className={p1.chakra < technique.cost ? "text-red-400" : ""}>{technique.cost}</b>
                    </span>
                  </div>
                </button>
              ))}

              <button
                disabled={turn !== "player" || isOver}
                onClick={() => applyCharge("p1")}
                className={`rounded-xl border px-3 py-2 transition ${
                  turn === "player" && !isOver
                    ? "border-emerald-700 bg-emerald-900/30 hover:bg-emerald-900/40"
                    : "border-neutral-900 bg-neutral-900/50 text-neutral-500 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">Carregar Chakra</div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                    suporte
                  </span>
                </div>
                <div className="mt-1 text-xs text-neutral-300">Concentra energia para proximos jutsus.</div>
                <div className="mt-2 text-xs">Ganho aproximado de 28%.</div>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 h-full max-h-72 overflow-y-auto backdrop-blur">
            <h2 className="font-bold mb-2">Log de Batalha</h2>
            <ul className="space-y-1 text-sm">
              {log.map((line, index) => (
                <li key={index} className="text-neutral-200">
                  - {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-neutral-400">
        {isOver ? <span>{isOverText}</span> : <span>Dica: gerencie o chakra antes dos golpes fortes.</span>}
      </div>
    </div>
  );
}