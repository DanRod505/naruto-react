import React, { createContext, useContext, useMemo, useState } from "react";
import SFX from "../audio/sfx";

const Ctx = createContext(null);

export function SfxProvider({ children }) {
  const [enabled, setEnabledState] = useState(SFX.enabled);
  const [volume, setVolumeState] = useState(SFX.volume);

  const api = useMemo(
    () => ({
      enabled,
      volume,
      play: (name) => SFX.play(name),
      setEnabled: (v) => {
        SFX.setEnabled(v);
        setEnabledState(SFX.enabled);
      },
      setVolume: (v) => {
        SFX.setVolume(v);
        setVolumeState(SFX.volume);
      },
    }),
    [enabled, volume]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

/* eslint-disable-next-line react-refresh/only-export-components */
export const useSfx = () => {
  const ctx = useContext(Ctx);
  if (ctx) return ctx;
  // Fallback silencioso para não quebrar em dev caso esqueça o provider
  if (import.meta?.env?.DEV) {
    console.warn("[SFX] useSfx usado fora de <SfxProvider>. Retornando stub.");
  }
  return {
    enabled: true,
    volume: 1,
    play: () => {},
    setEnabled: () => {},
    setVolume: () => {},
  };
};
