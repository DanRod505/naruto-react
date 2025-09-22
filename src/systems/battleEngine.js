// Purpose: Core deterministic helpers for battle flow including cloning fighters, damage formulas, and AI choices.
// Editing: Adjust formulas and helpers with care; keep pure functions and maintain compatibility with Battle screen state updates.
// Dependencies: Used by src/App.jsx for cloning and by src/screens/Battle.jsx for runtime combat logic.
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const rand = (min, max) => Math.random() * (max - min) + min;

export function cloneFighter(fighter) {
  return {
    ...fighter,
    hp: fighter.maxHP,
    chakra: fighter.chakra,
    techniques: fighter.techniques.map((tech) => ({ ...tech })),
  };
}

export function computeDamage(technique, attacker, defender) {
  const variance = rand(0.9, 1.1);
  const base = technique.power * variance;
  const styleMod = technique.kind === "ninjutsu" ? 1.05 : technique.kind === "ranged" ? 1 : 0.95;
  const critRoll = Math.random();
  const critChance = clamp(0.08 + attacker.speed * 0.005, 0.08, 0.25);
  const critMultiplier = critRoll < critChance ? 1.6 : 1;
  const defenseMod = defender ? clamp(1 - (defender.speed ?? 0) * 0.01, 0.8, 1) : 1;
  const rawDamage = base * styleMod * critMultiplier * defenseMod;
  const damage = Math.max(6, Math.round(rawDamage));

  return { dmg: damage, crit: critMultiplier > 1 };
}

export function chooseAI(enemy) {
  const affordable = enemy.techniques.filter((tech) => tech.cost <= enemy.chakra);
  if (affordable.length) {
    const sorted = [...affordable].sort((a, b) => b.power - a.power);
    const primary = sorted[0];
    const fallback = sorted[Math.min(1, sorted.length - 1)] ?? primary;
    return {
      type: "attack",
      technique: Math.random() < 0.7 ? primary : fallback,
    };
  }

  const free = enemy.techniques.find((tech) => tech.cost === 0);
  if (Math.random() < 0.6) return { type: "charge" };
  if (free) return { type: "attack", technique: free };
  return { type: "charge" };
}