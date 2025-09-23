// Purpose: Orchestrates the turn-based battle loop including player actions, AI turns, and combat log.
// Editing: Keep state updates immutable and memoized hooks stable; adjust animations or log copy as needed.
// Dependencies: Consumes FighterCard, FXLayer, and helpers from src/systems/battleEngine.js plus character data passed by App.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import FighterCard from "../components/FighterCard"
import FXLayer from "../components/FXLayer"
import { clamp, computeDamage, chooseAI } from "../systems/battleEngine"

export default function Battle({ initialP1, initialP2, onBack }) {
  const [p1, setP1] = useState(initialP1)
  const [p2, setP2] = useState(initialP2)
  const [turn, setTurn] = useState("player") // player | enemy | over
  const [log, setLog] = useState([`Batalha iniciada! ${initialP1.name} vs. ${initialP2.name}.`])
  const [fx, setFx] = useState(null)

  // auto-scroll do log
  const logRef = useRef(null)
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [log])

  const pushLog = useCallback((line) => {
    setLog((entries) => [...entries, line].slice(-50))
  }, [])

  const isOver = turn === "over"

  const isOverText = useMemo(() => {
    if (p1.hp <= 0 && p2.hp <= 0) return "Empate dramático!"
    if (p2.hp <= 0) return `${p1.name} venceu!`
    if (p1.hp <= 0) return `${p2.name} venceu...`
    return ""
  }, [p1.hp, p1.name, p2.hp, p2.name])

  const applyCharge = useCallback(
    (attackerKey) => {
      if (isOver) return
      const attacker = attackerKey === "p1" ? p1 : p2
      const gain = Math.round(attacker.maxChakra * 0.28 + (Math.random() * 10 - 5))
      const nextChakra = clamp(attacker.chakra + gain, 0, attacker.maxChakra)
      const updatedAttacker = { ...attacker, chakra: nextChakra }

      setFx({ from: attackerKey, kind: "charge" })

      const delta = Math.max(0, nextChakra - attacker.chakra)
      pushLog(`${attacker.name} carrega chakra (+${delta}).`)

      if (attackerKey === "p1") setP1(updatedAttacker)
      else setP2(updatedAttacker)

      setTurn(attackerKey === "p1" ? "enemy" : "player")
    },
    [isOver, p1, p2, pushLog],
  )

  const applyAttack = useCallback(
    (attackerKey, technique) => {
      if (isOver) return

      const attacker = attackerKey === "p1" ? p1 : p2
      const defender = attackerKey === "p1" ? p2 : p1

      if (attacker.chakra < technique.cost) {
        pushLog(
          `${attacker.name} tentou ${technique.name}, mas ficou sem chakra e precisou concentrar.`,
        )
        applyCharge(attackerKey)
        return
      }

      const { dmg, crit } = computeDamage(technique, attacker, defender)
      const updatedAttacker = {
        ...attacker,
        chakra: clamp(attacker.chakra - technique.cost, 0, attacker.maxChakra),
      }
      const updatedDefender = {
        ...defender,
        hp: clamp(defender.hp - dmg, 0, defender.maxHP),
      }

      setFx({ from: attackerKey, kind: "attack" })
      pushLog(
        `${attacker.name} usa ${technique.name}${crit ? " (CRÍTICO!)" : ""} e causa ${dmg} de dano!`,
      )

      if (attackerKey === "p1") {
        setP1(updatedAttacker)
        setP2(updatedDefender)
      } else {
        setP2(updatedAttacker)
        setP1(updatedDefender)
      }

      if (updatedDefender.hp <= 0) {
        pushLog(`${defender.name} foi derrotado!`)
        setTurn("over")
        return
      }

      setTurn(attackerKey === "p1" ? "enemy" : "player")
    },
    [applyCharge, isOver, p1, p2, pushLog],
  )

  // Turno da IA
  useEffect(() => {
    if (turn !== "enemy" || isOver) return
    const timer = setTimeout(() => {
      const action = chooseAI(p2)
      if (action.type === "charge") applyCharge("p2")
      else if (action.type === "attack" && action.technique) applyAttack("p2", action.technique)
    }, 650)
    return () => clearTimeout(timer)
  }, [turn, isOver, p2, applyAttack, applyCharge])

  // Helpers UI
  const canPlay = turn === "player" && !isOver

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
        <h1 className="text-[clamp(18px,4.8vw,28px)] font-extrabold tracking-tight">
          Batalha — {p1.name} vs. {p2.name}
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="h-10 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm"
          >
            Trocar personagens
          </button>
          <button
            onClick={() => window.location.reload()}
            className="h-10 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm"
          >
            Recarregar
          </button>
        </div>
      </div>

      {/* cards + FX */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        <FighterCard fighter={p1} side="left" active={turn === "player" && !isOver} />
        <FighterCard fighter={p2} side="right" active={turn === "enemy" && !isOver} />
        {fx && (
          <div className="absolute inset-0 pointer-events-none">
            <FXLayer from={fx.from} kind={fx.kind} />
          </div>
        )}
      </div>

      {/* ações + log */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Ações */}
        <section className="lg:col-span-2 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3 sm:p-4 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-[clamp(14px,3.6vw,18px)]">Ações</h2>
            <span
              className={`text-xs ${
                isOver ? "text-rose-300" : canPlay ? "text-emerald-300" : "text-neutral-400"
              }`}
              aria-live="polite"
            >
              {isOver ? "Combate encerrado" : canPlay ? "Seu turno" : "Turno inimigo"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {p1.techniques.map((technique) => (
              <button
                key={technique.id}
                disabled={!canPlay}
                onClick={() => applyAttack("p1", technique)}
                className={`group rounded-2xl border px-3 py-3 text-left transition min-h-[88px] ${
                  canPlay
                    ? "border-neutral-700 hover:border-neutral-500 bg-neutral-800/60 hover:bg-neutral-800 active:scale-[0.99]"
                    : "border-neutral-900 bg-neutral-900/50 text-neutral-500 cursor-not-allowed"
                }`}
                aria-disabled={!canPlay}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-[13px] sm:text-sm leading-tight line-clamp-1">
                    {technique.name}
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                    {technique.kind}
                  </span>
                </div>
                <div className="mt-1 text-[12px] text-neutral-300 line-clamp-2">{technique.desc}</div>
                <div className="mt-2 flex items-center justify-between text-[12px]">
                  <span>
                    Dano: <b>{technique.power}</b>
                  </span>
                  <span>
                    Chakra:{" "}
                    <b className={p1.chakra < technique.cost ? "text-rose-400" : ""}>
                      {technique.cost}
                    </b>
                  </span>
                </div>
              </button>
            ))}

            <button
              disabled={!canPlay}
              onClick={() => applyCharge("p1")}
              className={`rounded-2xl border px-3 py-3 transition min-h-[88px] ${
                canPlay
                  ? "border-emerald-700 bg-emerald-900/30 hover:bg-emerald-900/40 active:scale-[0.99]"
                  : "border-neutral-900 bg-neutral-900/50 text-neutral-500 cursor-not-allowed"
              }`}
              aria-disabled={!canPlay}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-[13px] sm:text-sm">Carregar Chakra</div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                  suporte
                </span>
              </div>
              <div className="mt-1 text-[12px] text-neutral-300">
                Concentra energia para próximos jutsus.
              </div>
              <div className="mt-2 text-[12px]">Ganho aproximado de 28%.</div>
            </button>
          </div>

          {isOver && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={onBack}
                className="h-10 px-4 rounded-xl border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-800 text-sm"
              >
                Escolher novos lutadores
              </button>
              <button
                onClick={() => window.location.reload()}
                className="h-10 px-4 rounded-xl border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-800 text-sm"
              >
                Repetir batalha
              </button>
            </div>
          )}
        </section>

        {/* Log */}
        <aside className="lg:col-span-1">
          <div
            ref={logRef}
            className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 h-64 sm:h-72 overflow-y-auto backdrop-blur"
            role="log"
            aria-live="polite"
          >
            <h2 className="font-bold mb-2 text-[clamp(13px,3.4vw,16px)]">Log de Batalha</h2>
            <ul className="space-y-1 text-[13px]">
              {log.map((line, index) => (
                <li key={index} className="text-neutral-200">
                  — {line}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <div className="mt-4 text-center text-sm text-neutral-400">
        {isOver ? <span>{isOverText}</span> : <span>Dica: gerencie o chakra antes dos golpes fortes.</span>}
      </div>
    </div>
  )
}
