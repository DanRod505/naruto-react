// Purpose: In-app changelog screen to track project updates by version/date.
// Editing: Recebe `version` via props (vinda do App). Edite o array CHANGELOG para adicionar novas versões.
// Dependencies: Button component. Rendered when route === "changelog".

import React from "react";
import Button from "../components/Button";

const CHANGELOG = [
  {
    version: "0.3.4",
    date: "2025-09-23",
    highlights: ["HUD mobile com barras", "HP dinâmico", "Ranks nas técnicas", "Fluxo de batalha direto"],
    changes: [
      // Navegação & fluxo
      "Ao apertar Iniciar Batalha na Seleção, agora vai direto para a tela de batalha (sem passo intermediário na Nav).",
      // Mobile & responsividade
      "Tela de Select refeita para mobile no mesmo padrão da Battle (portrait com abas, landscape em split), cabendo toda na página.",
      "HUD móvel da Battle ganhou mini-barras de HP e Chakra com animação.",
      // UI/UX das barras
      "Barras de HP agora variam de cor por percentual (verde ≥60%, amarelo 30–59%, vermelho <30%) no desktop e no mobile.",
      // Técnicas
      "Adicionado campo 'rank' às técnicas e exibição do badge de rank tanto na Battle quanto na Select.",
      "Nomes das técnicas deixaram de truncar e passam a quebrar linha (desktop e mobile).",
      // Sprites & robustez
      "FighterCard atualizado com resolução de caminho dos sprites (compatível com mobile), fallback com monograma e onError.",
      // Correções
      "Corrigida renderização da Battle no desktop (ramo desktop reintroduzido).",
      "Padronizado import do SegmentedTabs para evitar erro de 'casing' em alguns ambientes.",
      "Eliminado erro 'SummaryChip is not defined' na Select.",
    ],
  },

  {
    version: "0.3.3",
    date: "2025-09-23",
    highlights: ["Mobile First", "Safe Areas", "UI Responsiva"],
    changes: [
      "Adicionado arquivo mobile.css com ajustes de toques, safe-areas (notch) e prefers-reduced-motion.",
      "Criado componente AppShell para aplicar safe-areas e padronizar header/main/footer.",
      "Atualizado App.jsx para usar AppShell.",
      "Nav.jsx redesenhado para ser mobile-friendly (botões maiores, wrap responsivo).",
      "FighterCard.jsx atualizado com tipografia fluida, sprites lazy/async e barras com animações leves.",
      "Select.jsx atualizado com grid responsivo 2→3→4 colunas, bloqueio de escolha duplicada e técnicas exibidas em cards.",
      "Battle.jsx atualizado com botões de ação grandes, auto-scroll no log e layout mobile-first.",
      "FXLayer.jsx otimizado com animações curtas baseadas em transform/opacity para melhor performance em celulares.",
      "Melhorias gerais de acessibilidade (aria-live no log, aria-pressed em botões de seleção)."
    ],
  },
  {
    version: "0.3.2",
    date: "2025-09-22",
    highlights: ["Sprites Locais", "Seleção Atualizada"],
    changes: [
      "Personagens agora usam sprites locais (imagens em src/assets/sprites) em vez de emojis.",
      "Atualizado characters.js para importar e expor `sprite` em cada personagem.",
      "FighterCard.jsx atualizado para exibir sprites grandes e pequenos com fallback elegante.",
      "Select.jsx atualizado para renderizar sprites nos cards de seleção com fallback monograma.",
    ],
  },
  {
    version: "0.3.1",
    date: "2025-09-22",
    highlights: ["Navegação Global", "Badge de Versão"],
    changes: [
      "Adicionada barra de navegação global mínima (Nav.jsx) para acessar Home, Seleção, Batalha e Changelog.",
      "Implementado badge de versão no Nav sincronizado com package.json.",
      "Changelog.jsx atualizado para receber a versão via props, evitando duplicação de lógica.",
      "Botão de voltar adicionado na tela de Seleção de Personagens.",
      "Ajustes de estilo no Home.jsx e padronização de botões com Tailwind.",
    ],
  },
  {
    version: "0.3.0",
    date: "2025-09-21",
    highlights: ["Seleção de Personagens", "Batalha por turno", "FX básicos (ataque/carga)"],
    changes: [
      "Arquitetura modular (src/components, src/screens, src/data, src/systems).",
      "UI migrada para Tailwind; remoção de .panel/.row/.action-btn.",
      "Barras de HP/Chakra animadas com framer-motion (StatBar).",
      "AI simples do inimigo (heurística por custo/poder).",
    ],
  },
  {
    version: "0.2.0",
    date: "2025-09-20",
    highlights: ["Starter Kit Vite + React", "Naruto vs Sasuke MVP"],
    changes: [
      "Motor de batalha mínimo (consumo/recarga de chakra, log).",
      "Componentes base (Panel, Button) e telas Home/Battle.",
      "Estrutura inicial de dados (characters/techniques).",
    ],
  },
  {
    version: "0.1.0",
    date: "2025-09-19",
    highlights: ["Setup do projeto"],
    changes: [
      "Projeto criado com Vite + React.",
      "Configuração inicial do Tailwind e PostCSS.",
    ],
  },
];

export default function Changelog({ onBack, version = "v0.0.0" }) {
  return (
    <div className="min-h-[620px] w-full max-w-4xl mx-auto p-6">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Changelog</h1>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full border border-neutral-700 bg-neutral-900/50 text-neutral-300"
            title="Versão atual em uso"
          >
            {version}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            as="a"
            href="https://github.com/seu-repo"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </Button>
          {onBack && <Button onClick={onBack}>Voltar</Button>}
        </div>
      </header>

      <div className="space-y-5">
        {CHANGELOG.map((entry) => (
          <article
            key={entry.version}
            className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 backdrop-blur"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">v{entry.version}</h2>
                <p className="text-xs text-neutral-400">{entry.date}</p>
              </div>

              {entry.highlights?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {entry.highlights.map((h) => (
                    <span
                      key={h}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-700 bg-emerald-900/30 text-emerald-200"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {entry.changes?.length > 0 && (
              <ul className="mt-3 list-disc list-inside space-y-1 text-sm text-neutral-200">
                {entry.changes.map((c, i) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>

      <footer className="mt-6 text-xs text-neutral-400">
        Dica: mantenha notas curtas e objetivas. Quando uma feature ficar grande,
        crie uma entrada “Highlights” e detalhe nos bullets.
      </footer>
    </div>
  );
}
