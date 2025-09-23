// src/screens/Battle.jsx
// Purpose: Battle loop com layout desktop e HUD compacto automático no mobile.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import FighterCard from "../components/FighterCard"
import FXLayer from "../components/FXLayer"
import { clamp, computeDamage, chooseAI } from "../systems/battleEngine"

// Hook para detectar telas pequenas (<= 480px)
function useCompact(breakpoint = 480) {
  const [compact, setCompact] = useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  )
  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth <= breakpoint)
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [breakpoint])
  return compact
}

export default function Battle({ initialP1, initialP2, onBack }) {
  const [p1, setP1] = useState(initialP1)
  const [p2, setP2] = useState(initialP2)
  const [turn, setTurn] = useState("player") // player | enemy | over
  const [log, setLog] = useState([`Batalha iniciada! ${initialP1.name} vs. ${initialP2.name}.`])
  const [fx, setFx] = useState(null)
  const [tab, setTab] = useState("actions") // abas do HUD compacto

  const compact = useCompact(480)

  // auto-scroll do log
  const logRef = useRef(null)
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
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
    (who) => {
      if (isOver) return
      const a = who === "p1" ? p1 : p2
      const gain = Math.round(a.maxChakra * 0.28 + (Math.random() * 10 - 5))
      const next = clamp(a.chakra + gain, 0, a.maxChakra)
      const upd = { ...a, chakra: next }

      setFx({ from: who, kind: "charge" })
      pushLog(`${a.name} carrega chakra (+${Math.max(0, next - a.chakra)}).`)

      if (who === "p1") setP1(upd)
      else setP2(upd)

      setTurn(who === "p1" ? "enemy" : "player")
    },
    [isOver, p1, p2, pushLog],
  )

  const applyAttack = useCallback(
    (who, technique) => {
      if (isOver) return
      const a = who === "p1" ? p1 : p2
      const d = who === "p1" ? p2 : p1

      if (a.chakra < technique.cost) {
        pushLog(`${a.name} tentou ${technique.name}, mas ficou sem chakra e precisou concentrar.`)
        applyCharge(who)
        return
      }

      const { dmg, crit } = computeDamage(technique, a, d)
      const updA = { ...a, chakra: clamp(a.chakra - technique.cost, 0, a.maxChakra) }
      const updD = { ...d, hp: clamp(d.hp - dmg, 0, d.maxHP) }

      setFx({ from: who, kind: "attack" })
      pushLog(`${a.name} usa ${technique.name}${crit ? " (CRÍTICO!)" : ""} e causa ${dmg} de dano!`)

      if (who === "p1") {
        setP1(updA)
        setP2(updD)
      } else {
        setP2(updA)
        setP1(updD)
      }

      if (updD.hp <= 0) {
        pushLog(`${d.name} foi derrotado!`)
        setTurn("over")
        return
      }

      setTurn(who === "p1" ? "enemy" : "player")
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

  const canPlay = turn === "player" && !isOver

  // ===========================
  // HUD COMPACTO (mobile)
  // ===========================
  if (compact) {
    return (
      <div className="min-h-[100dvh] max-w-6xl mx-auto p-2 flex flex-col gap-2 overflow-hidden">
        {/* Título + ações rápidas */}
        <div className="flex items-center justify-between">
          <h1 className="text-[16px] font-extrabold truncate">
            {p1.name} vs. {p2.name}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="h-8 px-3 rounded-lg bg-neutral-800 border border-neutral-700 text-xs"
            >
              Trocar
            </button>
            <button
              onClick={() => window.location.reload()}
              className="h-8 px-3 rounded-lg bg-neutral-800 border border-neutral-700 text-xs"
            >
              Recarregar
            </button>
          </div>
        </div>

        {/* Status compacto dos lutadores */}
        <div className="grid grid-cols-2 gap-2">
          <MiniStatus who="Você" fighter={p1} active={turn === "player" && !isOver} />
          <MiniStatus who="Adversário" fighter={p2} active={turn === "enemy" && !isOver} right />
        </div>

        {/* Abas: Ações | Log */}
        <SegmentedTabs value={tab} onChange={setTab} className="mt-1" />

        {/* Área de conteúdo que ocupa o restante da tela */}
        <div className="flex-1 min-h-0">
          {tab === "actions" ? (
            <div className="h-full overflow-auto rounded-2xl border border-neutral-800 bg-neutral-900/60 p-2">
              <div className="grid grid-cols-2 gap-2">
                {p1.techniques.map((tech) => (
                  <button
                    key={tech.id}
                    disabled={!canPlay}
                    onClick={() => applyAttack("p1", tech)}
                    className={`rounded-xl border px-2 py-2 text-left text-[12px] min-h-[76px] ${
                      canPlay
                        ? "border-neutral-700 bg-neutral-800/60 hover:bg-neutral-800 active:scale-[0.99]"
                        : "border-neutral-900 bg-neutral-900/50 text-neutral-500"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <b className="truncate">{tech.name}</b>
                      <span className="text-[10px] px-1 rounded bg-neutral-800 border border-neutral-700">
                        {tech.kind}
                      </span>
                    </div>
                    <div className="mt-0.5 text-neutral-300 line-clamp-2">{tech.desc}</div>
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span>Dano <b>{tech.power}</b></span>
                      <span>
                        Chakra <b className={p1.chakra < tech.cost ? "text-rose-400" : ""}>{tech.cost}</b>
                      </span>
                    </div>
                  </button>
                ))}
                <button
                  disabled={!canPlay}
                  onClick={() => applyCharge("p1")}
                  className={`rounded-xl border px-2 py-2 text-left text-[12px] min-h-[76px] ${
                    canPlay
                      ? "border-emerald-700 bg-emerald-900/30 hover:bg-emerald-900/40"
                      : "border-neutral-900 bg-neutral-900/50 text-neutral-500"
                  }`}
                >
                  <b>Carregar Chakra</b>
                  <div className="text-neutral-300 mt-0.5">Concentra energia para próximos jutsus.</div>
                  <div className="mt-1 text-[11px]">Ganho aprox. 28%.</div>
                </button>
              </div>
            </div>
          ) : (
            <div
              ref={logRef}
              className="h-full overflow-auto rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3"
              role="log"
              aria-live="polite"
            >
              <h2 className="font-bold text-sm mb-2">Log de Batalha</h2>
              <ul className="space-y-1 text-[12px]">
                {log.map((line, i) => (
                  <li key={i} className="text-neutral-200">— {line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* FX */}
        {fx && (
          <div className="pointer-events-none absolute inset-0">
            <FXLayer from={fx.from} kind={fx.kind} />
          </div>
        )}

        {/* dica / status final */}
        <div className="text-center text-xs text-neutral-400 mt-1">
          {isOver ? isOverText : "Dica: gerencie o chakra antes dos golpes fortes."}
        </div>
      </div>
    )
  }

  // ===========================
  // DESKTOP/TABLET (layout atual)
  // ===========================
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
              className={`text-xs ${isOver ? "text-rose-300" : canPlay ? "text-emerald-300" : "text-neutral-400"}`}
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
                  <span>Dano: <b>{technique.power}</b></span>
                  <span>Chakra: <b className={p1.chakra < technique.cost ? "text-rose-400" : ""}>{technique.cost}</b></span>
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
              <div className="mt-1 text-[12px] text-neutral-300">Concentra energia para próximos jutsus.</div>
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
                <li key={index} className="text-neutral-200">— {line}</li>
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

// Componentes auxiliares (HUD compacto)
function MiniStatus({ who, fighter, active, right = false }) {
  const hpPct = Math.round((fighter.hp / fighter.maxHP) * 100)
  const ckPct = Math.round((fighter.chakra / fighter.maxChakra) * 100)
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-2">
      <div className={`flex items-center ${right ? "justify-end text-right" : "justify-start"}`}>
        <div className="h-8 w-8 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900">
          {fighter.sprite ? (
            <img src={fighter.sprite} alt={fighter.name} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className={`${right ? "mr-2" : "ml-2"}`}>
          <div className="text-[12px] font-semibold leading-tight">{fighter.name}</div>
          <div className="text-[10px] text-neutral-400">
            {who}{active ? " — seu turno" : ""}
          </div>
        </div>
      </div>
      <div className="mt-2 space-y-1">
        <BarSmall label="HP" pct={hpPct} value={`${fighter.hp}/${fighter.maxHP}`} color="rose" />
        <BarSmall label="Chakra" pct={ckPct} value={`${fighter.chakra}/${fighter.maxChakra}`} color="sky" />
      </div>
    </div>
  )
}

function BarSmall({ label, pct, value, color }) {
  const grad = color === "rose" ? "from-rose-600 to-rose-500" : "from-sky-600 to-sky-500"
  return (
    <div>
      <div className="flex justify-between text-[10px] text-neutral-300">
        <span>{label}</span>
        <span className="tabular-nums">{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${grad}`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </div>
    </div>
  )
}

// Abas simples usadas no HUD compacto
function SegmentedTabs({ value, onChange, className = "" }) {
  const base = "flex-1 h-10 rounded-xl border text-sm transition"
  const active = "bg-neutral-800 border-neutral-600"
  const idle = "bg-neutral-900/40 border-neutral-800 hover:bg-neutral-800/40"
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button className={`${base} ${value === "actions" ? active : idle}`} onClick={() => onChange("actions")}>
        Ações
      </button>
      <button className={`${base} ${value === "log" ? active : idle}`} onClick={() => onChange("log")}>
        Log
      </button>
    </div>
  )
}
