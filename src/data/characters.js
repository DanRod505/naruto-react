// Purpose: Defines the selectable character roster with base stats and techniques for the battle flow.
// Editing: Update stats or add fighters carefully; ensure each entry copies techniques from src/data/techniques.js.
// Dependencies: Consumed by Select screen and cloneFighter in src/systems/battleEngine.js.

import { T } from "./techniques";

// 🔽 importe as imagens locais (Vite resolve e faz hash no build)
import narutoSprite from "../assets/sprites/naruto.png";
import sasukeSprite from "../assets/sprites/sasuke.png";
import sakuraSprite from "../assets/sprites/sakura.png";
import kakashiSprite from "../assets/sprites/kakashi.png";
import gaaraSprite from "../assets/sprites/gaara.png";

export const CHARACTER_LIBRARY = [
  {
    key: "naruto",
    name: "Naruto Uzumaki",
    sprite: narutoSprite,              // <- imagem local
    maxHP: 160, hp: 160,
    maxChakra: 120, chakra: 80,
    speed: 12,
    techniques: [
      T.rasengan,
      T.kagebunshin,
      T.kunai,
      { id: "uzumaki", name: "Soco Giratorio", power: 16, cost: 0, kind: "melee", desc: "Ataque fisico sem custo." },
    ],
  },
  {
    key: "sasuke",
    name: "Sasuke Uchiha",
    sprite: sasukeSprite,
    maxHP: 150, hp: 150,
    maxChakra: 130, chakra: 90,
    speed: 13,
    techniques: [T.chidori, T.katon, T.shuriken, T.taijutsu],
  },
  {
    key: "sakura",
    name: "Sakura Haruno",
    sprite: sakuraSprite,
    maxHP: 155, hp: 155,
    maxChakra: 110, chakra: 85,
    speed: 11,
    techniques: [
      T.palm,
      T.kunai,
      T.shuriken,
      { id: "burst", name: "Impacto Concentrado", power: 20, cost: 10, kind: "melee", desc: "Forca precisa que treme o solo." },
    ],
  },
  {
    key: "kakashi",
    name: "Kakashi Hatake",
    sprite: kakashiSprite,
    maxHP: 150, hp: 150,
    maxChakra: 140, chakra: 100,
    speed: 14,
    techniques: [T.chidori, T.kunai, T.tsukuyomi, T.taijutsu],
  },
  {
    key: "gaara",
    name: "Gaara",
    sprite: gaaraSprite,
    maxHP: 165, hp: 165,
    maxChakra: 135, chakra: 95,
    speed: 10,
    techniques: [
      T.sand,
      T.kunai,
      T.katon,
      { id: "shell", name: "Casulo de Areia", power: 10, cost: 6, kind: "ninjutsu", desc: "Defesa agressiva que corta." },
    ],
  },
];
