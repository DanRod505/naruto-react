// src/hooks/useCompactSpace.js
import { useEffect, useMemo, useState } from "react"

export default function useCompactSpace({
  minHeight = 420,    // se a altura útil for <= minHeight, vira compacto
  minWidth = 480,     // fallback por largura muito pequena (portrait estreito)
} = {}) {
  const get = () => ({
    w: typeof window !== "undefined" ? window.innerWidth : 1024,
    h: typeof window !== "undefined" ? window.innerHeight : 768,
    landscape:
      typeof window !== "undefined"
        ? window.matchMedia("(orientation: landscape)").matches
        : false,
  })

  const [s, setS] = useState(get())

  useEffect(() => {
    const onResize = () => setS(get())
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  const compact = useMemo(() => {
    // compacto se faltar ALTURA (principal gatilho em landscape)
    // ou se a largura for bem pequena (portrait estreito)
    return s.h <= minHeight || s.w <= minWidth
  }, [s.h, s.w, minHeight, minWidth])

  return { compact, landscape: s.landscape, w: s.w, h: s.h }
}
