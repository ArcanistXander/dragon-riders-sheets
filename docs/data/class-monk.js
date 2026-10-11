/* Monk — D&D 5e (2014 PHB). Feature text is summarized for table use.
   A feature's `text` may be a function (ctx) => string, where ctx carries
   { lvl (class level), total (character level), pb, mod(ability) }.
   `onAttacks` features also show beside the weapons on the Attacks tab;
   `bonusAction` features are listed under "On your turn".
   `unarmored` drives Unarmored Defense (WIS to AC) and Unarmored Movement in the engine.
   The Monastic Tradition is picked in the level-up wizard at level 3 (subclassLevel). */
window.CLASSES = window.CLASSES || {};
window.SPELLS = window.SPELLS || {};
const MNK_ASI = { name: "Ability Score Improvement", text: "Increase one ability score by 2, or two scores by 1 (max 20), or take a feat.", asi: true };
const maDie = (lvl) => (lvl >= 17 ? "1d10" : lvl >= 11 ? "1d8" : lvl >= 5 ? "1d6" : "1d4");
const unarmoredFt = (lvl) => (lvl >= 18 ? 30 : lvl >= 14 ? 25 : lvl >= 10 ? 20 : lvl >= 6 ? 15 : lvl >= 2 ? 10 : 0);
const kiDC = (c) => 8 + c.pb + c.mod("wis");
window.CLASSES.monk = {
  name: "Monk",
  hitDie: 8,
  saves: ["str", "dex"],
  asiLevels: [4, 8, 12, 16, 19],
  multiclassReq: "DEX 13 and WIS 13",
  multiclassProfs: "Simple weapons, shortswords",
  subclassLevel: 3,
  subclassLabel: "Monastic Tradition",
  unarmored: { name: "Unarmored Defense", ac: "wis", speed: unarmoredFt },
  tiles: (c) => [["Martial Arts", maDie(c.lvl)], ["Ki save DC", c.lvl >= 2 ? kiDC(c) : "—"]],
  resources: (lvl) => [
    { id: "ki", name: "Ki Points", max: lvl >= 2 ? lvl : 0, reset: "short", note: "Flurry of Blows, Patient Defense and Step of the Wind cost 1 each. All are regained after a short or long rest." }
  ],
  features: {
    1: [
      { name: "Unarmored Defense", text: (c) => `While you wear no armor and carry no shield, your AC is 10 + DEX + WIS (${10 + c.mod("dex") + c.mod("wis")}). The sheet adds it on its own when nothing is worn.` },
      { name: "Martial Arts", onAttacks: true, bonusAction: true, text: (c) => `With unarmed strikes and monk weapons (shortswords and simple melee weapons without two-handed or heavy) you can use DEX instead of STR, and roll ${maDie(c.lvl)} in place of the weapon's damage when it's higher. When you take the Attack action with one, you can make one unarmed strike as a bonus action. Only while you wear no armor and carry no shield.` }
    ],
    2: [
      { name: "Ki", bonusAction: true, text: (c) => `You have ${c.lvl} ki points (back after a short or long rest). Ki save DC ${kiDC(c)}. Flurry of Blows: after the Attack action, spend 1 ki for two unarmed strikes as a bonus action. Patient Defense: 1 ki to Dodge as a bonus action. Step of the Wind: 1 ki to Disengage or Dash as a bonus action, and your jump distance doubles this turn.` },
      { name: "Unarmored Movement", text: (c) => `Your speed rises by ${unarmoredFt(c.lvl)} ft. while you wear no armor and carry no shield. The sheet adds it on its own.${c.lvl >= 9 ? " You can also move along vertical surfaces and across liquids on your turn without falling." : ""}` }
    ],
    3: [
      { name: "Monastic Tradition", text: "You commit yourself to a tradition. It grants features at 3rd, 6th, 11th and 17th level." },
      { name: "Deflect Missiles", text: (c) => `Reaction when hit by a ranged weapon attack: reduce the damage by 1d10 + ${c.mod("dex") + c.lvl}. If it drops to 0 and you have a free hand, you catch the missile and can spend 1 ki to throw it back (monk weapon, ${maDie(c.lvl)}, range 20/60).` }
    ],
    4: [
      MNK_ASI,
      { name: "Slow Fall", text: (c) => `Reaction when you fall: reduce the falling damage by ${5 * c.lvl}.` }
    ],
    5: [
      { name: "Extra Attack", onAttacks: true, text: "You can attack twice, instead of once, whenever you take the Attack action on your turn." },
      { name: "Stunning Strike", onAttacks: true, text: (c) => `When you hit with a melee weapon attack, spend 1 ki: the target makes a CON save (DC ${kiDC(c)}) or is stunned until the end of your next turn.` }
    ],
    6: [{ name: "Ki-Empowered Strikes", text: "Your unarmed strikes count as magical for overcoming resistance and immunity." }],
    7: [
      { name: "Evasion", text: "When an effect lets you make a DEX save for half damage, you take no damage on a success and only half on a failure." },
      { name: "Stillness of Mind", text: "Use your action to end one effect on yourself that is causing you to be charmed or frightened." }
    ],
    8: [MNK_ASI],
    10: [{ name: "Purity of Body", text: "You are immune to disease and poison." }],
    12: [MNK_ASI],
    13: [{ name: "Tongue of the Sun and Moon", text: "You understand all spoken languages, and any creature that understands a language can understand what you say." }],
    14: [{ name: "Diamond Soul", text: "You are proficient in all saving throws (tick them on the Overview). When you fail a save, you can spend 1 ki to reroll it and take the second result." }],
    15: [{ name: "Timeless Body", text: "You suffer none of the frailty of old age, can't be aged magically, and no longer need food or water." }],
    16: [MNK_ASI],
    18: [{ name: "Empty Body", text: "Spend 4 ki as an action: you are invisible for 1 minute and resist all damage but force. Or spend 8 ki to cast Astral Projection without material components (only you)." }],
    19: [MNK_ASI],
    20: [{ name: "Perfect Self", text: "When you roll initiative and have no ki points left, you regain 4 ki points." }]
  },
  subclasses: {
    openhand: {
      name: "Way of the Open Hand",
      resources: (lvl) => [
        { id: "wholebody", name: "Wholeness of Body", max: lvl >= 6 ? 1 : 0, reset: "long", note: `Action: regain ${lvl * 3} hit points.` }
      ],
      features: {
        3: [{ name: "Open Hand Technique", onAttacks: true, text: (c) => `When you hit with a Flurry of Blows strike, you can also: knock the target prone (DEX save DC ${kiDC(c)}), push it up to 15 ft. away (STR save DC ${kiDC(c)}), or deny it reactions until the end of your next turn.` }],
        6: [{ name: "Wholeness of Body", text: (c) => `As an action, regain ${c.lvl * 3} hit points. Once per long rest.` }],
        11: [{ name: "Tranquility", text: (c) => `At the end of a long rest you gain the effect of a Sanctuary spell until your next long rest (save DC ${kiDC(c)}). It ends early if you attack or cast a spell that affects an enemy.` }],
        17: [{ name: "Quivering Palm", onAttacks: true, text: (c) => `When you hit with an unarmed strike, spend 3 ki to set lethal vibrations in the target for ${c.lvl} days. Later, as an action, end them: the target makes a CON save (DC ${kiDC(c)}), dropping to 0 HP on a failure or taking 10d10 necrotic damage on a success. Only one creature at a time.` }]
      }
    },
    shadow: {
      name: "Way of Shadow",
      features: {
        3: [{ name: "Shadow Arts", text: "Spend 2 ki to cast Darkness, Darkvision, Pass without Trace or Silence, without material components. You also learn the Minor Illusion cantrip." }],
        6: [{ name: "Shadow Step", bonusAction: true, text: "When you are in dim light or darkness, as a bonus action you can teleport up to 60 ft. to an unoccupied space you can see that is also in dim light or darkness. You then have advantage on the first melee attack you make before the end of the turn." }],
        11: [{ name: "Cloak of Shadows", text: "When you are in dim light or darkness, as an action you can become invisible. You stay invisible until you attack, cast a spell, or are in bright light." }],
        17: [{ name: "Opportunist", text: "When a creature within 5 ft. of you is hit by an attack made by someone other than you, you can use your reaction to make a melee attack against it." }]
      }
    },
    elements: {
      name: "Way of the Four Elements",
      features: {
        3: [{ name: "Disciple of the Elements", text: (c) => `You know Elemental Attunement and ${c.lvl >= 17 ? 4 : c.lvl >= 11 ? 3 : c.lvl >= 6 ? 2 : 1} more elemental discipline${c.lvl >= 6 ? "s" : ""} (more at 6th, 11th and 17th; you can swap one each time). Disciplines cost ki (at most ${c.lvl >= 17 ? 6 : c.lvl >= 13 ? 5 : c.lvl >= 9 ? 4 : c.lvl >= 5 ? 3 : 2} ki on one spell). Save DC ${kiDC(c)}. List your disciplines under Race & background.` }]
      }
    }
  }
};
