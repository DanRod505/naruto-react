// Purpose: Defines the selectable character roster with base stats and techniques for the battle flow.
// Editing: Atualize stats/techs com cuidado; cada técnica deve vir do mapa T em src/data/techniques.js.
// Dependencies: Consumido pela Select e pela Battle; battleEngine assume que cada fighter pode ter `statuses`.

import { T } from "./techniques";

// 🔽 sprites locais (Vite resolve e faz hash no build)
import narutoSprite from "../assets/sprites/naruto.png";
import sasukeSprite from "../assets/sprites/sasuke.png";
import sakuraSprite from "../assets/sprites/sakura.png";
import kakashiSprite from "../assets/sprites/kakashi.png";
import gaaraSprite from "../assets/sprites/gaara.png";

export const CHARACTER_LIBRARY = [
  {
    key: "naruto",
    name: "Naruto Uzumaki",
    sprite: narutoSprite,
    maxHP: 160, hp: 160,
    maxChakra: 120, chakra: 80,
    speed: 12,
    // mix: dano forte + pressão de clones + defesa + sustain
    techniques: [
      T.rasengan,        // attack (A)
      T.kagebunshin,     // attack (B)
      T.chakra_shield,   // support: shield
      T.medical_heal,    // heal
    ],
  },
  {
    key: "sasuke",
    name: "Sasuke Uchiha",
    sprite: sasukeSprite,
    maxHP: 150, hp: 150,
    maxChakra: 130, chakra: 90,
    speed: 13,
    // mix: burst elétrico + fogo com burn + pressão + controle (paralisia)
    techniques: [
      T.chidori,         // attack (A) com chance de paralysis
      T.fireball,        // attack (B) com chance de burn
      T.shuriken,        // attack (C) barato
      T.paralysis_seal,  // support: paralysis (enemy)
    ],
  },
  {
    key: "sakura",
    name: "Sakura Haruno",
    sprite: sakuraSprite,
    maxHP: 155, hp: 155,
    maxChakra: 110, chakra: 85,
    speed: 11,
    // mix: melee preciso + kit médico (cura, cleanse, regen)
    techniques: [
      T.palm,            // attack (C)
      T.medical_heal,    // heal
      T.cleanse,         // support: remove negativos
      T.regen_tech,      // support: regen (self)
    ],
  },
  {
    key: "kakashi",
    name: "Kakashi Hatake",
    sprite: kakashiSprite,
    maxHP: 150, hp: 150,
    maxChakra: 140, chakra: 100,
    speed: 14,
    // mix: controle mental + burst + ferramenta + defesa
    techniques: [
      T.tsukuyomi,       // attack (S) com chance de paralysis
      T.chidori,         // attack (A)
      T.kunai,           // attack (D) barato
      T.chakra_shield,   // support: shield
    ],
  },
  {
    key: "gaara",
    name: "Gaara",
    sprite: gaaraSprite,
    maxHP: 165, hp: 165,
    maxChakra: 135, chakra: 95,
    speed: 10,
    // mix: areia ofensiva + fogo + veneno + proteção
    techniques: [
      T.sand,            // attack (B)
      T.katon,           // attack (A) com chance de burn
      T.poison_kunai,    // attack (C) com poison
      T.chakra_shield,   // support: shield
    ],
  },
];
