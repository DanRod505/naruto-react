// Purpose: Generic button wrapper that switches between <button> and <a> variants for consistent styling.
// Editing: Ajuste o mapa de variantes conforme necessário; mantém API estável.
// Dependencies: Não depende mais de index.css legado, usa Tailwind direto.

import React from "react";

const styles = {
  primary:
    "rounded-xl border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-800 px-3 py-2 text-left transition duration-200",
  ghost:
    "text-emerald-400 hover:text-emerald-300 transition duration-150",
  solid:
    "rounded-xl border border-emerald-700 bg-emerald-900/40 hover:bg-emerald-900/60 px-4 py-2 transition duration-200",
};

export default function Button({
  as = "button",
  href,
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const cls = `${styles[variant] ?? styles.primary} ${className}`;
  if (as === "a") {
    return (
      <a className={cls} href={href} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
