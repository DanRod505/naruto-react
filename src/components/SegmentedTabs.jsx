import React from "react"

export default function SegmentedTabs({ value, onChange, className = "" }) {
  const base = "flex-1 h-10 rounded-xl border text-sm transition"
  const active = "bg-neutral-800 border-neutral-600"
  const idle = "bg-neutral-900/40 border-neutral-800 hover:bg-neutral-800/40"

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        className={`${base} ${value === "actions" ? active : idle}`}
        onClick={() => onChange("actions")}
      >
        Ações
      </button>
      <button
        className={`${base} ${value === "log" ? active : idle}`}
        onClick={() => onChange("log")}
      >
        Log
      </button>
    </div>
  )
}
