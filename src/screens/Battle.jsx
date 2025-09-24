// src/screens/Battle.jsx
// Purpose: Battle loop com layout desktop e HUD compacto (portrait & landscape).
// Integra status/efeitos: startTurn (ticks) + resolveTechnique (attack/heal/support).
// SFX: ataque, cura, suporte, carga, ticks (veneno/queimadura/regen), paralisia e KO.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import FighterCard from "../components/FighterCard"
import FXLayer from "../components/FXLayer"
import SegmentedTabs from "../components/SegmentedTabs"
import {
  clamp,
  chooseAI,
  startTurn,
  resolveTechnique,
} from "../systems/battleEngine"
import useCompactSpace from "../hooks/useCompactSpace"
import { useSfx } from "../hooks/useSfx"

// Garante que o sprite seja absoluto (funciona no mobile e no desktop)
function resolveSprite(path) {
  if (!path) return null
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) return path
  const base = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.BASE_URL) || "/"
  return `${base}${path}`.replace(/\/\/+/g, "/")
}

// Fallback monograma se a imagem não carregar
function Monogram({ name = "" }) {
  const initials = name.split(" ").map(s => s[0]).filter(Boolean).slice(0,2).join("").toUpperCase()
  return (
    <div className="h-full w-full flex items-center justify-center bg-neutral-800 text-neutral-300 text-xs font-bold">
      {initials || "?"}
    </div>
  )
}

export default function Battle({ initialP1, initialP2, onBack }) {
  const [p1, setP1] = useState(initialP1)
  const [p2, setP2] = useState(initialP2)
  const [turn, setTurn] = useState("player") // "player" | "enemy" | "over"
  const [log, setLog] = useState([`Batalha iniciada! ${initialP1.name} vs. ${initialP2.name}.`])
  const [fx, setFx] = useState(null)

  const sfx = useSfx()

  const { compact, landscape } = useCompactSpace({ minHeight: 420, minWidth: 480 })
  const [tab, setTab] = useState("actions") // usado no compacto-portrait

  // auto-scroll do log
  const logRef = useRef(null)
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [log])

  const pushLog = useCallback((lineOrLines) => {
    setLog((entries) => {
      const lines = Array.isArray(lineOrLines) ? lineOrLines : [lineOrLines]
      return [...entries, ...lines].slice(-50)
    })
  }, [])

  const isOver = turn === "over"

  const isOverText = useMemo(() => {
    if (p1.hp <= 0 && p2.hp <= 0) return "Empate dramático!"
    if (p2.hp <= 0) return `${p1.name} venceu!`
    if (p1.hp <= 0) return `${p2.name} venceu...`
    return ""
  }, [p1.hp, p1.name, p2.hp, p2.name])

  // Início de turno: aplica DOT/HoT, verifica paralisia e pode pular turno
  useEffect(() => {
    if (isOver) return
    if (turn !== "player" && turn !== "enemy") return

    const who = turn === "player" ? "p1" : "p2"
    const r = startTurn(who, p1, p2)

    if (turn === "player") setP1(r.p1); else setP2(r.p2)
    if (r.lines?.length) {
      pushLog(r.lines)
      // 🔊 mapear mensagens para SFX
      r.lines.forEach(line => {
        if (line.includes("veneno")) sfx.play("poison_tick")
        else if (line.includes("queimadura")) sfx.play("burn_tick")
        else if (line.includes("regenera")) sfx.play("regen_tick")
      })
    }

    if (r.skipTurn) {
      pushLog("Turno pulado devido à paralisia.")
      sfx.play("paralysis_skip")
      setTurn(turn === "player" ? "enemy" : "player")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn])

  const applyCharge = useCallback(
    (who) => {
      if (isOver) return
      const a = who === "p1" ? p1 : p2
      const gain = Math.round(a.maxChakra * 0.28 + (Math.random() * 10 - 5))
      const next = clamp(a.chakra + gain, 0, a.maxChakra)
      const upd = { ...a, chakra: next }

      setFx({ from: who, kind: "charge" })
      sfx.play("charge")
      pushLog(`${a.name} carrega chakra (+${Math.max(0, next - a.chakra)}).`)

      if (who === "p1") setP1(upd)
      else setP2(upd)

      setTurn(who === "p1" ? "enemy" : "player")
    },
    [isOver, p1, p2, pushLog, sfx],
  )

  // Resolver técnica (attack/heal/support)
  const applyTechnique = useCallback(
    (who, technique) => {
      if (isOver) return
      const r = resolveTechnique(technique, who, p1, p2)

      setFx({ from: who, kind: technique.type === "attack" ? "attack" : "charge" })
      if (technique.type === "attack") sfx.play("attack")
      else if (technique.type === "heal") sfx.play("heal")
      else if (technique.type === "support") {
        if (technique.effect === "shield") sfx.play("shield")
        else if (technique.effect === "cleanse") sfx.play("cleanse")
        else sfx.play("ui")
      }

      setP1(r.p1); setP2(r.p2)
      if (r.lines?.length) pushLog(r.lines)

      const opp = who === "p1" ? r.p2 : r.p1
      if (opp.hp <= 0) {
        pushLog(`${opp.name} foi derrotado!`)
        sfx.play("ko")
        setTurn("over")
        return
      }

      if (r.didAction) setTurn(who === "p1" ? "enemy" : "player")
    },
    [isOver, p1, p2, pushLog, sfx],
  )

  // Turno da IA
  useEffect(() => {
    if (turn !== "enemy" || isOver) return
    const timer = setTimeout(() => {
      const action = chooseAI(p2)
      if (action.type === "charge") applyCharge("p2")
      else if (action.type === "attack" && action.technique) applyTechnique("p2", action.technique)
    }, 650)
    return () => clearTimeout(timer)
  }, [turn, isOver, p2, applyCharge, applyTechnique])

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
            {/* Sem controle de áudio aqui */}
            <button onClick={onBack} className="h-8 px-3 rounded-lg bg-neutral-800 border border-neutral-700 text-xs">
              Trocar
            </button>
            <button onClick={() => window.location.reload()} className="h-8 px-3 rounded-lg bg-neutral-800 border border-neutral-700 text-xs">
              Recarregar
            </button>
          </div>
        </div>

        {/* Status compacto dos lutadores (com mini-barras animadas) */}
        <div className="grid grid-cols-2 gap-2">
          <MiniStatus who="Você" fighter={p1} active={turn === "player" && !isOver} />
          <MiniStatus who="Adversário" fighter={p2} active={turn === "enemy" && !isOver} right />
        </div>

        {/* Portrait = abas; Landscape = split view */}
        {!landscape ? (
          <>
            <SegmentedTabs value={tab} onChange={setTab} className="mt-1" />
            <div className="flex-1 min-h-0">
              {tab === "actions" ? (
                <ActionsPanel
                  p1={p1}
                  canPlay={canPlay}
                  onAttack={(t) => applyTechnique("p1", t)}
                  onCharge={() => applyCharge("p1")}
                />
              ) : (
                <LogPanel logRef={logRef} log={log} />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-2">
            <ActionsPanel
              p1={p1}
              canPlay={canPlay}
              onAttack={(t) => applyTechnique("p1", t)}
              onCharge={() => applyCharge("p1")}
            />
            <LogPanel logRef={logRef} log={log} />
          </div>
        )}

        {/* FX */}
        {fx && (
          <div className="pointer-events-none absolute inset-0">
            <FXLayer from={fx.from} kind={fx.kind} />
          </div>
        )}

        <div className="text-center text-xs text-neutral-400 mt-1">
          {isOver ? isOverText : "Dica: gerencie o chakra antes dos golpes fortes."}
        </div>
      </div>
    )
  }

  // ===========================
  // DESKTOP/TABLET
  // ===========================
  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
        <h1 className="text-[clamp(18px,4.8vw,28px)] font-extrabold tracking-tight">
          Batalha — {p1.name} vs. {p2.name}
        </h1>

        <div className="flex items-center gap-2">
          {/* Sem controle de áudio aqui */}
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
                onClick={() => applyTechnique("p1", technique)}
                className={`group rounded-2xl border px-3 py-3 text-left transition min-h-[96px] ${
                  canPlay
                    ? "border-neutral-700 hover:border-neutral-500 bg-neutral-800/60 hover:bg-neutral-800 active:scale-[0.99]"
                    : "border-neutral-900 bg-neutral-900/50 text-neutral-500 cursor-not-allowed"
                }`}
                aria-disabled={!canPlay}
              >
                <div className="flex items-center justify-between">
                  {/* NOME DA TÉCNICA: sempre visível, com quebra de linha */}
                  <div className="font-semibold text-[13px] sm:text-sm leading-tight whitespace-normal break-words">
                    {technique.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                      {technique.kind}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700"
                      title="Rank da técnica"
                    >
                      {technique.rank || "—"}
                    </span>
                  </div>
                </div>
                <div className="mt-1 text-[12px] text-neutral-300 line-clamp-2">{technique.desc}</div>
                <div className="mt-2 flex items-center justify-between text-[12px]">
                  {/* Para técnicas de cura/suporte, mostramos rótulos úteis */}
                  <span>
                    {technique.type === "attack" ? <>Dano: <b>{technique.power}</b></> :
                     technique.type === "heal" ? <>Cura: <b>{technique.power}{technique.scaling ? ` + ${Math.round(technique.scaling*100)}%` : ""}</b></> :
                     technique.effect === "shield" ? <>Escudo: <b>{Math.round((technique.potency ?? 0.25)*100)}%</b></> :
                     technique.effect === "regen" ? <>Regen: <b>{technique.duration ?? 2}t</b></> :
                     technique.effect === "paralysis" ? <>Paralisia: <b>{technique.duration ?? 2}t</b></> :
                     technique.effect === "cleanse" ? <>Limpeza</> :
                     technique.inflict ? <>Efeito: <b>{technique.inflict.kind}</b></> : "—"}
                  </span>
                  <span>
                    Chakra: <b className={p1.chakra < technique.cost ? "text-rose-400" : ""}>{technique.cost ?? 0}</b>
                  </span>
                </div>
              </button>
            ))}

            {/* Carregar Chakra */}
            <button
              disabled={!canPlay}
              onClick={() => applyCharge("p1")}
              className={`rounded-2xl border px-3 py-3 transition min-h-[96px] ${
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

/* ===== Helpers (HUD compacto) ===== */

function ActionsPanel({ p1, canPlay, onAttack, onCharge }) {
  return (
    <div className="h-full overflow-auto rounded-2xl border border-neutral-800 bg-neutral-900/60 p-2">
      <div className="grid grid-cols-2 gap-2">
        {p1.techniques.map((tech) => (
          <button
            key={tech.id}
            disabled={!canPlay}
            onClick={() => onAttack(tech)}
            className={`rounded-xl border px-2 py-2 text-left text-[12px] min-h-[80px] ${
              canPlay
                ? "border-neutral-700 hover:border-neutral-500 bg-neutral-800/60 hover:bg-neutral-800 active:scale-[0.99]"
                : "border-neutral-900 bg-neutral-900/50 text-neutral-500 cursor-not-allowed"
            }`}
            aria-disabled={!canPlay}
          >
            <div className="flex items-center justify-between">
              {/* NOME DA TÉCNICA: sempre visível, com quebra no mobile */}
              <b className="whitespace-normal break-words">{tech.name}</b>
              <div className="flex items-center gap-1">
                <span className="text-[10px] px-1 rounded bg-neutral-800 border border-neutral-700">
                  {tech.kind}
                </span>
                <span className="text-[10px] px-1 rounded bg-neutral-900 border border-neutral-700" title="Rank">
                  {tech.rank || "—"}
                </span>
              </div>
            </div>
            <div className="mt-0.5 text-[12px] text-neutral-300 line-clamp-2">{tech.desc}</div>
            <div className="mt-1 flex items-center justify-between text-[12px]">
              <span>
                {tech.type === "attack" ? <>Dano: <b>{tech.power}</b></> :
                 tech.type === "heal" ? <>Cura: <b>{tech.power}{tech.scaling ? ` + ${Math.round(tech.scaling*100)}%` : ""}</b></> :
                 tech.effect === "shield" ? <>Escudo: <b>{Math.round((tech.potency ?? 0.25)*100)}%</b></> :
                 tech.effect === "regen" ? <>Regen: <b>{tech.duration ?? 2}t</b></> :
                 tech.effect === "paralysis" ? <>Paralisia: <b>{tech.duration ?? 2}t</b></> :
                 tech.effect === "cleanse" ? <>Limpeza</> :
                 tech.inflict ? <>Efeito: <b>{tech.inflict.kind}</b></> : "—"}
              </span>
              <span>Chakra: <b className={p1.chakra < (tech.cost ?? 0) ? "text-rose-400" : ""}>{tech.cost ?? 0}</b></span>
            </div>
          </button>
        ))}

        <button
          disabled={!canPlay}
          onClick={onCharge}
          className={`rounded-xl border px-2 py-2 text-left text-[12px] min-h-[80px] ${
            canPlay
              ? "border-emerald-700 bg-emerald-900/30 hover:bg-emerald-900/40 active:scale-[0.99]"
              : "border-neutral-900 bg-neutral-900/50 text-neutral-500 cursor-not-allowed"
          }`}
          aria-disabled={!canPlay}
        >
          <div className="flex items-center justify-between">
            <b className="whitespace-normal break-words">Carregar Chakra</b>
            <span className="text-[10px] px-1 rounded bg-emerald-950 border border-emerald-800">suporte</span>
          </div>
          <div className="mt-0.5 text-[12px] text-neutral-300">Concentra energia para próximos jutsus.</div>
          <div className="mt-1 text-[12px]">Ganho aproximado de 28%.</div>
        </button>
      </div>
    </div>
  )
}

function LogPanel({ logRef, log }) {
  return (
    <div
      ref={logRef}
      className="h-full overflow-auto rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3"
      role="log"
      aria-live="polite"
    >
      <h2 className="font-semibold text-sm mb-2">Log de Batalha</h2>
      <ul className="space-y-1 text-[12px]">
        {log.map((line, index) => (
          <li key={index} className="text-neutral-200">— {line}</li>
        ))}
      </ul>
    </div>
  )
}

/* Mini-barras com animação e HP dinâmico (verde/amber/rose) */
function MiniBar({ label, value, max, kind }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)))
  const hpClass =
    pct >= 60 ? "from-emerald-600 to-emerald-500"
    : pct >= 30 ? "from-amber-500 to-amber-400"
    : "from-rose-600 to-rose-500"
  const color = kind === "hp" ? hpClass : "from-sky-600 to-sky-500"

  return (
    <div>
      <div className="flex items-end justify-between mb-0.5">
        <span className="text-[10px] text-neutral-300">{label}</span>
        <span className="text-[10px] tabular-nums text-neutral-400">
          {value}/{max}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} transition-[width] duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function MiniStatus({ who, fighter, active, right = false }) {
  const [imgOk, setImgOk] = useState(true)
  const src = resolveSprite(fighter.sprite)

  return (
    <div className={`rounded-xl border border-neutral-800 bg-neutral-900/60 p-2 ${right ? "text-right" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        {!right && (
          <div className="h-8 w-8 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 shrink-0">
            {imgOk && src ? (
              <img
                src={src}
                alt={fighter.name}
                className="h-full w-full object-contain"
                loading="eager"
                decoding="async"
                onError={() => setImgOk(false)}
              />
            ) : (
              <Monogram name={fighter.name} />
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-neutral-400">{who}</div>
          <div className="flex items-center justify-between gap-2">
            <b className="truncate">{fighter.name}</b>
            <div className={`text-[10px] px-2 py-0.5 rounded ${active ? "bg-emerald-900/50 border border-emerald-700" : "bg-neutral-800 border border-neutral-700"}`}>
              {active ? "Seu turno" : "Aguardando"}
            </div>
          </div>

          {/* Mini-barras (HP e Chakra) */}
          <div className="mt-1 space-y-1">
            <MiniBar label="HP" value={fighter.hp} max={fighter.maxHP} kind="hp" />
            <MiniBar label="Chakra" value={fighter.chakra} max={fighter.maxChakra} kind="chakra" />
          </div>
        </div>

        {right && (
          <div className="h-8 w-8 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 shrink-0">
            {imgOk && src ? (
              <img
                src={src}
                alt={fighter.name}
                className="h-full w-full object-contain"
                loading="eager"
                decoding="async"
                onError={() => setImgOk(false)}
              />
            ) : (
              <Monogram name={fighter.name} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
