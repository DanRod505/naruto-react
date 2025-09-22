// Purpose: Catalog of combat techniques defining stats consumed by characters and the battle engine.
// Editing: Add or tweak techniques carefully; keep ids unique and balance power/cost values with game design goals.
// Dependencies: Imported by src/data/characters.js and referenced indirectly through battle actions.
export const T = {
  rasengan: { id: "rasengan", name: "Rasengan", power: 36, cost: 28, kind: "ninjutsu", desc: "Ataque concentrado de chakra. Alto dano." },
  kagebunshin: { id: "kagebunshin", name: "Kage Bunshin", power: 18, cost: 12, kind: "ninjutsu", desc: "Golpes em sequencia com clones." },
  kunai: { id: "kunai", name: "Arremesso de Kunai", power: 12, cost: 4, kind: "ranged", desc: "Dano rapido a distancia." },
  katon: { id: "katon", name: "Katon: Goukakyu", power: 30, cost: 22, kind: "ninjutsu", desc: "Bola de fogo avassaladora." },
  chidori: { id: "chidori", name: "Chidori", power: 34, cost: 26, kind: "ninjutsu", desc: "Perfura rapido eletrico." },
  shuriken: { id: "shuriken", name: "Shuriken Tripla", power: 14, cost: 6, kind: "ranged", desc: "Tres shurikens em arco." },
  taijutsu: { id: "taijutsu", name: "Combo Rapido", power: 15, cost: 0, kind: "melee", desc: "Sequencia corpo a corpo." },
  palm: { id: "palm", name: "Palm Heal Strike", power: 13, cost: 0, kind: "melee", desc: "Golpe preciso com foco." },
  tsukuyomi: { id: "tsukuyomi", name: "Genjutsu Breve", power: 22, cost: 14, kind: "ninjutsu", desc: "Atordoa e fere a mente." },
  sand: { id: "sand", name: "Areia: Lamina", power: 24, cost: 18, kind: "ninjutsu", desc: "Corte de areia compacta." },
};