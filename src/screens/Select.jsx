// src/screens/Select.jsx
// Tela de seleção com HUD compacto para mobile (portrait & landscape),
// min-h 100dvh, split-view no landscape, e abas no portrait.
// Baseado no padrão do Battle.jsx (mobile-first).

import React, { useMemo, useState, useRef, useEffect, useCallback } from "react"
import { CHARACTER_LIBRARY } from "../data/characters"
import useCompactSpace from "../hooks/useCompactSpace" // mesmo hook da Battle
import { useSfx } from "../hooks/useSfx"

export default function Select({ onStart, onBack }) {
  const [p1Sel, setP1Sel] = useState(null)
  const [p2Sel, setP2Sel] = useState(null)
  const sfx = useSfx()

  // mesmo critério da Battle: compacto quando faltar ALTURA ou largura estreita
  const { compact, landscape } = useCompactSpace({ minHeight: 460, minWidth: 520 })

  // abas no portrait
  const [tab, setTab] = useState("p1") // "p1" | "p2"

  // rolagem interna suave ao trocar de aba
  const p1GridRef = useRef(null)
  const p2GridRef = useRef(null)
  useEffect(() => {
    const ref = tab === "p1" ? p1GridRef.current : p2GridRef.current
    if (ref) ref.scrollTop = 0
  }, [tab])

  // Ações com SFX
  const handleTab = useCallback((next) => {
    setTab(next)
    sfx.play("ui")
  }, [sfx])

  const handlePickP1 = useCallback((char) => {
    setP1Sel(char)
    sfx.play("ui")
  }, [sfx])

  const handlePickP2 = useCallback((char) => {
    setP2Sel(char)
    sfx.play("ui")
  }, [sfx])

  const handleBack = useCallback(() => {
    sfx.play("ui")
    onBack && onBack()
  }, [onBack, sfx])

  const canStart = useMemo(() => !!(p1Sel && p2Sel), [p1Sel, p2Sel])
  const start = () => {
    if (!canStart) return
    sfx.play("ui")
    onStart(p1Sel, p2Sel)
  }

  // ===========================
  // HUD COMPACTO (mobile)
  // ===========================
  if (compact) {
    return (
      <div className="min-h-[100dvh] max-w-6xl mx-auto p-2 flex flex-col gap-2 overflow-hidden">
        {/* Header compacto */}
        <header className="flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="font-extrabold tracking-tight text-[16px] truncate">
              Seleção de Personagens
            </h1>
            <span className="text-[11px] text-neutral-400">
              Escolha o seu ninja e o adversário
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onBack && (
              <button
                onClick={handleBack}
                className="h-8 px-3 rounded-lg border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-800 text-xs transition"
              >
                Voltar
              </button>
            )}
          </div>
        </header>

        {/* Resumo das escolhas */}
        <div className="grid grid-cols-2 gap-2">
          <SummaryChip label="Você" value={p1Sel?.name} />
          <SummaryChip label="Adversário" value={p2Sel?.name} right />
        </div>

        {/* Portrait = abas; Landscape = split-view */}
        {!landscape ? (
          <>
            <SegmentedSmall
              value={tab}
              onChange={handleTab}
              leftLabel="Você"
              rightLabel="Adversário"
              className="mt-1"
            />
            <div className="flex-1 min-h-0">
              {tab === "p1" ? (
                <SelectPanel
                  title="Você"
                  value={p1Sel}
                  onChange={handlePickP1}
                  gridRef={p1GridRef}
                />
              ) : (
                <SelectPanel
                  title="Adversário"
                  value={p2Sel}
                  onChange={handlePickP2}
                  disallowKey={p1Sel?.key}
                  gridRef={p2GridRef}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-2">
            <SelectPanel
              title="Você"
              value={p1Sel}
              onChange={handlePickP1}
              gridRef={p1GridRef}
            />
            <SelectPanel
              title="Adversário"
              value={p2Sel}
              onChange={handlePickP2}
              disallowKey={p1Sel?.key}
              gridRef={p2GridRef}
            />
          </div>
        )}

        {/* CTA fixo */}
        <div className="pt-1">
          <button
            onClick={start}
            disabled={!canStart}
            className={`w-full h-11 rounded-xl border transition text-sm ${
              !canStart
                ? "border-neutral-800 bg-neutral-900/50 text-neutral-500 cursor-not-allowed"
                : "border-emerald-700 bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-100"
            }`}
            title={!canStart ? "Selecione os dois lutadores" : "Iniciar batalha"}
          >
            Iniciar Batalha
          </button>
        </div>
      </div>
    )
  }

  // ===========================
  // DESKTOP/TABLET (layout atual)
  // ===========================
  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6">
        <div>
          <h1 className="font-extrabold tracking-tight text-[clamp(18px,4.8vw,28px)]">
            Seleção de Personagens
          </h1>
          <span className="text-[12px] sm:text-xs text-neutral-400">
            Escolha o seu ninja e o adversário
          </span>
        </div>
        {onBack && (
          <button
            onClick={handleBack}
            className="h-10 px-4 rounded-xl border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-800 text-sm transition"
          >
            Voltar
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <SelectPanel title="Você" value={p1Sel} onChange={handlePickP1} />
        <SelectPanel
          title="Adversário"
          value={p2Sel}
          onChange={handlePickP2}
          disallowKey={p1Sel?.key}
        />
      </div>

      <div className="mt-5 sm:mt-6 flex items-center justify-center">
        <button
          onClick={start}
          disabled={!canStart}
          className={`h-12 px-6 rounded-2xl border transition text-sm sm:text-base ${
            !canStart
              ? "border-neutral-800 bg-neutral-900/50 text-neutral-500 cursor-not-allowed"
              : "border-emerald-700 bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-100"
          }`}
          title={!canStart ? "Selecione os dois lutadores" : "Iniciar batalha"}
        >
          Iniciar Batalha
        </button>
      </div>
    </div>
  )
}

function SelectPanel({ title, value, onChange, disallowKey, gridRef }) {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3 sm:p-4 backdrop-blur flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-[clamp(14px,3.6vw,18px)]">{title}</h2>
        <span className="text-[11px] sm:text-xs text-neutral-400">
          {value ? value.name : "Nenhum selecionado"}
        </span>
      </div>

      {/* Grid com rolagem interna no compacto */}
      <div
        ref={gridRef}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-auto min-h-0"
        style={{ maxHeight: "unset" }}
      >
        {CHARACTER_LIBRARY.map((character) => {
          const disabled = disallowKey && character.key === disallowKey
          const active = value?.key === character.key

          return (
            <button
              key={character.key}
              disabled={disabled}
              onClick={() => !disabled && onChange(character)}
              className={`relative rounded-xl border px-3 py-3 text-left transition min-h-[148px] focus:outline-none focus:ring-2 focus:ring-emerald-600/50 ${
                active
                  ? "border-emerald-600 bg-emerald-900/30"
                  : disabled
                  ? "border-neutral-900 bg-neutral-900/40 text-neutral-500 cursor-not-allowed"
                  : "border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800"
              }`}
              title={character.name}
              aria-pressed={active}
              aria-label={`Selecionar ${character.name}`}
            >
              {/* Sprite */}
              <div className="h-24 w-full rounded-md overflow-hidden border border-neutral-800 bg-neutral-900 flex items-center justify-center">
                {character.sprite ? (
                  <img
                    src={character.sprite}
                    alt={character.name}
                    className="max-h-20 object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <FallbackMonogram name={character.name} />
                )}
              </div>

              {/* Nome */}
              <div className="mt-2 font-semibold text-[13px] sm:text-sm leading-tight truncate">
                {character.name}
              </div>

              {/* Stats */}
              <div className="mt-1 text-[10px] text-neutral-400">
                HP {character.maxHP} — Chakra {character.maxChakra}
              </div>

              {/* Ativo */}
              {active && (
                <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-emerald-800/70 border border-emerald-600">
                  Selecionado
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Técnicas do selecionado */}
      {value && (
        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
          <h3 className="font-semibold text-sm">Técnicas</h3>
          <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {value.techniques.map((tech) => (
              <li
                key={tech.id}
                className="rounded-lg border border-neutral-800 bg-neutral-900/70 px-2 py-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  {/* NOME DA TÉCNICA: sempre visível, com quebra de linha */}
                  <span className="font-medium whitespace-normal break-words">{tech.name}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                      {tech.kind}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700"
                      title="Rank da técnica"
                    >
                      {tech.rank || "—"}
                    </span>
                  </div>
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
    </section>
  )
}

/** Fallback monogram caso não exista sprite */
function FallbackMonogram({ name = "" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="h-full w-full flex items-center justify-center bg-neutral-800 text-neutral-300 text-lg font-bold">
      {initials}
    </div>
  )
}

/** Chip de resumo (topo) */
function SummaryChip({ label, value, right = false }) {
  return (
    <div className={`rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 ${right ? "text-right" : ""}`}>
      <div className="text-[10px] text-neutral-400">{label}</div>
      <div className="text-[12px] font-semibold truncate">{value || "—"}</div>
    </div>
  )
}

/** Segmented control minimalista para portrait (Você / Adversário) */
function SegmentedSmall({ value, onChange, leftLabel, rightLabel, className = "" }) {
  const base = "flex-1 h-10 rounded-xl border text-sm transition"
  const active = "bg-neutral-800 border-neutral-600"
  const idle = "bg-neutral-900/40 border-neutral-800 hover:bg-neutral-800/40"
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        className={`${base} ${value === "p1" ? active : idle}`}
        onClick={() => onChange("p1")}
        aria-pressed={value === "p1"}
      >
        {leftLabel}
      </button>
      <button
        className={`${base} ${value === "p2" ? active : idle}`}
        onClick={() => onChange("p2")}
        aria-pressed={value === "p2"}
      >
        {rightLabel}
      </button>
    </div>
  )
}
