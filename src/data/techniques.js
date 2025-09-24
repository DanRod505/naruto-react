// Purpose: Catálogo de técnicas consumidas por characters e pelo battleEngine.
// Notas:
// - Campos comuns: id, name, desc, kind, rank, cost
// - type: "attack" | "heal" | "support"
//   - attack: usa `power` e pode ter `inflict` (status secundário no alvo)
//   - heal: cura alvo (self/ally/enemy) com `power` + `scaling` * maxHP
//   - support: aplica `effect` (paralysis/regen/shield/cleanse/poison/burn)
// - Inflict (em attack): { kind, chance, duration, potency }
// - Support: { effect, target, duration, potency }
//
// IMPORTANTE: garanta que os personagens usem ids válidos deste mapa.

export const T = {
  /* ===== EXISTENTES (agora com type: "attack") ===== */
  rasengan:   {
    id: "rasengan",
    name: "Rasengan",
    desc: "Ataque concentrado de chakra. Alto dano.",
    kind: "ninjutsu",
    rank: "A",
    type: "attack",
    power: 36,
    cost: 28,
  },
  kagebunshin:{
    id: "kagebunshin",
    name: "Kage Bunshin",
    desc: "Golpes em sequência com clones.",
    kind: "ninjutsu",
    rank: "B",
    type: "attack",
    power: 18,
    cost: 12,
  },
  kunai:      {
    id: "kunai",
    name: "Arremesso de Kunai",
    desc: "Dano rápido à distância.",
    kind: "ranged",
    rank: "D",
    type: "attack",
    power: 12,
    cost: 4,
  },
  katon:      {
    id: "katon",
    name: "Katon: Goukakyu",
    desc: "Bola de fogo avassaladora.",
    kind: "ninjutsu",
    rank: "A",
    type: "attack",
    power: 30,
    cost: 22,
    // chance moderada de aplicar queimadura
    inflict: { kind: "burn", chance: 0.30, duration: 2, potency: 1 },
  },
  chidori:    {
    id: "chidori",
    name: "Chidori",
    desc: "Investida elétrica perfurante.",
    kind: "ninjutsu",
    rank: "A",
    type: "attack",
    power: 34,
    cost: 26,
    // chance baixa de paralisar
    inflict: { kind: "paralysis", chance: 0.18, duration: 2, potency: 1 },
  },
  shuriken:   {
    id: "shuriken",
    name: "Shuriken Tripla",
    desc: "Três shurikens em arco.",
    kind: "ranged",
    rank: "C",
    type: "attack",
    power: 14,
    cost: 6,
  },
  taijutsu:   {
    id: "taijutsu",
    name: "Combo Rápido",
    desc: "Sequência corpo a corpo.",
    kind: "melee",
    rank: "C",
    type: "attack",
    power: 15,
    cost: 0,
  },
  palm:       {
    id: "palm",
    name: "Palm Heal Strike",
    desc: "Golpe preciso com foco.",
    kind: "melee",
    rank: "C",
    type: "attack",
    power: 13,
    cost: 0,
  },
  tsukuyomi:  {
    id: "tsukuyomi",
    name: "Genjutsu Breve",
    desc: "Atordoa e fere a mente.",
    kind: "ninjutsu",
    rank: "S",
    type: "attack",
    power: 22,
    cost: 14,
    // pequena chance de paralisar mentalmente
    inflict: { kind: "paralysis", chance: 0.15, duration: 1, potency: 1 },
  },
  sand:       {
    id: "sand",
    name: "Areia: Lâmina",
    desc: "Corte de areia compacta.",
    kind: "ninjutsu",
    rank: "B",
    type: "attack",
    power: 24,
    cost: 18,
  },

  /* ===== NOVAS – ATAQUES COM STATUS ===== */
  fireball:   {
    id: "fireball",
    name: "Katon: Grande Bola de Fogo",
    desc: "Explosão ígnea que pode queimar o alvo.",
    kind: "ninjutsu",
    rank: "B",
    type: "attack",
    power: 34,
    cost: 24,
    inflict: { kind: "burn", chance: 0.35, duration: 2, potency: 1 },
  },
  poison_kunai: {
    id: "poison_kunai",
    name: "Kunai Envenenada",
    desc: "Arma recoberta de toxina.",
    kind: "bukijutsu",
    rank: "C",
    type: "attack",
    power: 20,
    cost: 14,
    inflict: { kind: "poison", chance: 0.45, duration: 3, potency: 1 },
  },

  /* ===== SUPORTE (STATUS) ===== */
  paralysis_seal: {
    id: "paralysis_seal",
    name: "Selo de Paralisia",
    desc: "Interfere nos sinais do corpo do alvo.",
    kind: "fūinjutsu",
    rank: "B",
    type: "support",
    effect: "paralysis",
    target: "enemy",
    duration: 2,
    potency: 1,
    cost: 22,
  },
  chakra_shield: {
    id: "chakra_shield",
    name: "Escudo de Chakra",
    desc: "Reduz dano recebido por alguns turnos.",
    kind: "ninjutsu",
    rank: "B",
    type: "support",
    effect: "shield",
    target: "self",
    duration: 3,
    potency: 0.35, // 35% de redução
    cost: 18,
  },
  cleanse: {
    id: "cleanse",
    name: "Purificação",
    desc: "Remove efeitos negativos do alvo.",
    kind: "ninjutsu",
    rank: "C",
    type: "support",
    effect: "cleanse",
    target: "ally", // ou "self"
    cost: 14,
  },
  regen_tech: {
    id: "regen_tech",
    name: "Regeneração Acelerada",
    desc: "Regenera HP por alguns turnos.",
    kind: "medic",
    rank: "B",
    type: "support",
    effect: "regen",
    target: "self",
    duration: 3,
    potency: 1,
    cost: 16,
  },

  /* ===== CURA ===== */
  medical_heal: {
    id: "medical_heal",
    name: "Tratamento Médico",
    desc: "Cura imediata proporcional ao máximo de HP.",
    kind: "medic",
    rank: "A",
    type: "heal",
    power: 18,      // base fixa
    scaling: 0.12,  // +12% do maxHP do alvo
    target: "ally", // ou "self"
    cost: 24,
  },
}
