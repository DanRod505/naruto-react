// src/components/AppShell.jsx
// Descrição: Container de layout padrão com header, main scrollável e footer.
// Aplica safe-areas (notch) via CSS vars definidas em mobile.css e usa 100dvh para altura real em mobile.
// Dependências: Tailwind opcional (classes utilitárias). Você pode ajustar as classes ao seu design.

import React from 'react'

export default function AppShell({
  header = null,
  children,
  footer = null,
  className = '',
  headerClassName = '',
  mainClassName = '',
  footerClassName = '',
}) {
  return (
    <div
      className={`app-shell min-h-[100dvh] flex flex-col bg-black text-white ${className}`}
      // Se preferir, pode controlar padding via CSS (mobile.css) apenas com a classe .app-shell.
      // Aqui fica explícito e compatível mesmo sem Tailwind.
      style={{
        paddingTop: 'var(--sa-top)',
        paddingBottom: 'var(--sa-bottom)',
        paddingLeft: 'var(--sa-left)',
        paddingRight: 'var(--sa-right)',
      }}
    >
      {header && (
        <header
          className={`sticky top-0 z-10 px-4 py-3 border-b border-white/10 bg-black/50 backdrop-blur ${headerClassName}`}
        >
          {header}
        </header>
      )}

      <main className={`flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 ${mainClassName}`}>
        {children}
      </main>

      {footer && (
        <footer
          className={`px-4 py-3 border-t border-white/10 bg-black/50 backdrop-blur ${footerClassName}`}
        >
          {footer}
        </footer>
      )}
    </div>
  )
}
