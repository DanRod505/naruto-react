// Purpose: Core helpers para fluxo de batalha, incluindo efeitos de status,
// dano, cura, suporte e IA simples.
// Mantém funções puras e compatíveis com a Battle (desktop e mobile).

/* ===== Utils ===== */
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const rand = (min, max) => Math.random() * (max - min) + min;

/* ===== Fighters ===== */
export function cloneFighter(fighter) {
  return {
    ...fighter,
    hp: fighter.maxHP,
    chakra: fighter.chakra,
    techniques: (fighter.techniques || []).map((t) => ({ ...t })),
    statuses: Array.isArray(fighter.statuses) ? [...fighter.statuses] : [],
  };
}

/* ===== Status system =====
 * Estrutura: fighter.statuses = [{ kind, duration, potency }]
 * kind: "poison" | "burn" | "paralysis" | "regen" | "shield"
 * potency: número (interpretação em cada efeito)
 * duration: turnos restantes (decrementa no INÍCIO do turno do portador)
 */
export function addStatus(fighter, { kind, duration = 2, potency = 1 }) {
  const list = fighter.statuses ? [...fighter.statuses] : [];
  const idx = list.findIndex((s) => s.kind === kind);
  if (idx >= 0) {
    // Refresh (pega maior duração e potência)
    const prev = list[idx];
    list[idx] = {
      kind,
      duration: Math.max(prev.duration, duration),
      potency: Math.max(prev.potency, potency),
    };
  } else {
    list.push({ kind, duration, potency });
  }
  return { ...fighter, statuses: list };
}

export function removeNegativeStatuses(fighter) {
  // remove poison/burn/paralysis; mantém regen/shield
  const keep = (fighter.statuses || []).filter(
    (s) => !["poison", "burn", "paralysis"].includes(s.kind),
  );
  return { ...fighter, statuses: keep };
}

function labelStatus(kind) {
  switch (kind) {
    case "poison": return "veneno";
    case "burn": return "queimadura";
    case "paralysis": return "paralisia";
    case "regen": return "regeneração";
    case "shield": return "escudo";
    default: return kind;
  }
}

/* Ticks no início do turno do portador */
function tickStartOfTurn(fighter) {
  const lines = [];
  let skipTurn = false;
  let fx = { ...fighter };
  const src = fx.statuses || [];
  if (!src.length) return { fighter: fx, lines, skipTurn };

  const next = [];
  for (const s of src) {
    let { kind, duration, potency } = s;

    if (kind === "poison") {
      const dmg = Math.max(1, Math.floor(fx.maxHP * (0.06 * potency)));
      fx.hp = clamp(fx.hp - dmg, 0, fx.maxHP);
      lines.push(`${fx.name} sofre ${dmg} de veneno.`);
    } else if (kind === "burn") {
      const dmg = Math.max(1, Math.floor(fx.maxHP * (0.08 * potency)));
      fx.hp = clamp(fx.hp - dmg, 0, fx.maxHP);
      lines.push(`${fx.name} sofre ${dmg} de queimadura.`);
    } else if (kind === "regen") {
      const heal = Math.max(1, Math.floor(fx.maxHP * (0.07 * potency)));
      const before = fx.hp;
      fx.hp = clamp(fx.hp + heal, 0, fx.maxHP);
      lines.push(`${fx.name} regenera ${fx.hp - before} de HP.`);
    } else if (kind === "paralysis") {
      // 35% * potency de perder a ação neste turno
      const roll = Math.random();
      if (roll < 0.35 * potency) {
        skipTurn = true;
        lines.push(`${fx.name} ficou paralisado e perdeu o turno!`);
      }
    } else if (kind === "shield") {
      // efeito só reduz dano em computeDamage; aqui só contagem
    }

    duration -= 1;
    if (duration > 0) next.push({ kind, duration, potency });
    else lines.push(`${fx.name} se livrou de ${labelStatus(kind)}.`);
  }

  fx.statuses = next;
  return { fighter: fx, lines, skipTurn };
}

/* ===== Dano ===== */
export function computeDamage(technique, attacker, defender) {
  // Base com variação leve e ajuste por "kind" simples
  const variance = rand(0.9, 1.1);
  const base = (technique.power || 0) * variance;
  const styleMod =
    technique.kind === "ninjutsu" ? 1.05 :
    technique.kind === "ranged"   ? 1.00 :
    0.95;

  // Crítico básico
  const critChance = clamp(0.12, 0.08, 0.25); // fixo 12% (pode evoluir)
  const crit = Math.random() < critChance;
  let dmg = Math.round(base * styleMod * (crit ? 1.6 : 1));

  // Defesa por velocidade (leve) – opcional
  const defenseMod = defender ? clamp(1 - (defender.speed ?? 0) * 0.01, 0.8, 1) : 1;
  dmg = Math.round(dmg * defenseMod);

  // Escudo do defensor reduz percentual do dano (potency = 0.2 => 20%)
  const shield = (defender?.statuses || []).find((s) => s.kind === "shield");
  if (shield) {
    const reducePct = clamp(shield.potency ?? 0.25, 0.05, 0.6);
    const before = dmg;
    dmg = Math.max(0, Math.round(dmg * (1 - reducePct)));
    defender.__shieldAbsorb = before - dmg; // anotação para log
  }

  return { dmg: Math.max(0, dmg), crit };
}

/* ===== Resolução de técnica =====
 * tech.type: "attack" | "heal" | "support"
 * attack: dano + opcional inflict { kind, chance, duration, potency }
 * heal: target "self"|"ally"|"enemy" (normalmente self/ally); cura por power + scaling*maxHP
 * support: effect "poison"|"burn"|"paralysis"|"regen"|"shield"|"cleanse" (com target)
 */
export function resolveTechnique(tech, who, p1, p2) {
  const self = who === "p1" ? p1 : p2;
  const opp  = who === "p1" ? p2 : p1;
  const lines = [];

  let nextSelf = { ...self };
  let nextOpp  = { ...opp };

  // Verifica custo
  const cost = tech.cost || 0;
  if (cost > nextSelf.chakra) {
    lines.push(`${self.name} tentou ${tech.name}, mas não tinha chakra suficiente.`);
    return {
      p1: who === "p1" ? nextSelf : nextOpp,
      p2: who === "p1" ? nextOpp : nextSelf,
      lines,
      didAction: false,
    };
  }
  nextSelf.chakra = clamp(nextSelf.chakra - cost, 0, nextSelf.maxChakra);

  if (tech.type === "attack") {
    const { dmg, crit } = computeDamage(tech, nextSelf, nextOpp);
    nextOpp.hp = clamp(nextOpp.hp - dmg, 0, nextOpp.maxHP);
    lines.push(`${self.name} usa ${tech.name}${crit ? " (CRÍTICO!)" : ""} e causa ${dmg} de dano!`);
    if (nextOpp.__shieldAbsorb) {
      lines.push(`Escudo reduziu ${nextOpp.__shieldAbsorb} de dano.`);
      delete nextOpp.__shieldAbsorb;
    }
    // Chance de aplicar status no alvo
    if (tech.inflict && Math.random() < (tech.inflict.chance ?? 0)) {
      nextOpp = addStatus(nextOpp, {
        kind: tech.inflict.kind,
        duration: tech.inflict.duration ?? 2,
        potency: tech.inflict.potency ?? 1,
      });
      lines.push(`${opp.name} foi afetado por ${labelStatus(tech.inflict.kind)}!`);
    }
  } else if (tech.type === "heal") {
    // Cura alvo (normalmente self/ally)
    const targetSelf = tech.target === "ally" || tech.target === "self" || !tech.target;
    const tgt = targetSelf ? nextSelf : nextOpp;
    const before = tgt.hp;
    const heal = Math.max(1, Math.round((tech.power || 0) + (tgt.maxHP * (tech.scaling || 0))));
    tgt.hp = clamp(tgt.hp + heal, 0, tgt.maxHP);
    lines.push(`${self.name} usa ${tech.name} e cura ${tgt.hp - before} de HP ${targetSelf ? "em si mesmo" : `em ${opp.name}`}.`);
    if (targetSelf) nextSelf = { ...tgt }; else nextOpp = { ...tgt };
  } else if (tech.type === "support") {
    if (tech.effect === "cleanse") {
      const targetSelf = tech.target === "ally" || tech.target === "self" || !tech.target;
      const tgt = targetSelf ? nextSelf : nextOpp;
      const before = (tgt.statuses || []).length;
      const cleaned = removeNegativeStatuses(tgt);
      const removed = Math.max(0, before - (cleaned.statuses || []).length);
      lines.push(`${self.name} usa ${tech.name} e remove ${removed} status negativo${removed === 1 ? "" : "s"}.`);
      if (targetSelf) nextSelf = cleaned; else nextOpp = cleaned;
    } else {
      // Aplica status (paralysis/regen/shield/poison/burn etc)
      const targetSelf = tech.target === "ally" || tech.target === "self";
      const tgt = targetSelf ? nextSelf : nextOpp;
      const applied = addStatus(tgt, {
        kind: tech.effect,
        duration: tech.duration ?? 2,
        potency: tech.potency ?? 1,
      });
      lines.push(`${self.name} aplica ${labelStatus(tech.effect)} com ${tech.name}.`);
      if (targetSelf) nextSelf = applied; else nextOpp = applied;
    }
  }

  return {
    p1: who === "p1" ? nextSelf : nextOpp,
    p2: who === "p1" ? nextOpp : nextSelf,
    lines,
    didAction: true,
  };
}

/* ===== Início do turno ===== */
export function startTurn(who, p1, p2) {
  if (who === "p1") {
    const r = tickStartOfTurn(p1);
    return { p1: r.fighter, p2, lines: r.lines, skipTurn: r.skipTurn };
  } else {
    const r = tickStartOfTurn(p2);
    return { p1, p2: r.fighter, lines: r.lines, skipTurn: r.skipTurn };
  }
}

/* ===== IA simples ===== */
export function chooseAI(self) {
  const t = self.techniques || [];
  const hpRatio = self.maxHP > 0 ? self.hp / self.maxHP : 1;

  // 1) se HP baixo, priorizar heal/escudo
  if (hpRatio < 0.35) {
    const heals = t.filter((x) => x.type === "heal" && (x.cost || 0) <= self.chakra);
    if (heals.length) return { type: "attack", technique: heals[0] }; // tratado em resolve como cura
    const shields = t.filter((x) => x.type === "support" && x.effect === "shield" && (x.cost || 0) <= self.chakra);
    if (shields.length) return { type: "attack", technique: shields[0] };
  }

  // 2) sem chakra suficiente → carregar
  const affordable = t.filter((x) => (x.cost || 0) <= self.chakra);
  if (!affordable.length) return { type: "charge" };

  // 3) preferir ataques fortes e com inflict
  const scored = affordable.map((x) => {
    const base = x.type === "attack" ? (x.power || 0) : x.type === "heal" ? 15 : 10;
    const bonus = x.inflict ? 8 : (x.effect === "shield" ? 6 : 0);
    return { x, s: base + bonus + Math.random() * 2 };
  }).sort((a, b) => b.s - a.s);

  return { type: "attack", technique: scored[0].x };
}
