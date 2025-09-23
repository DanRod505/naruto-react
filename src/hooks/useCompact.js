import { useEffect, useState } from "react"

// compact quando a largura é pequena (ajuste o breakpoint se quiser)
export default function useCompact(breakpoint = 480) {
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
