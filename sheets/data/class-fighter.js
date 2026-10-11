/* Fighter — D&D 5e (2014 PHB). Feature text is summarized for table use.
   A feature's `text` may be a function (ctx) => string, where ctx carries
   { lvl (class level), total (character level), pb, mod(ability) }.
   `onAttacks` features also show beside the weapons on the Attacks tab;
   `bonusAction` features are listed under "On your turn".
   The Martial Archetype is picked in the level-up wizard at level 3 (subclassLevel). */
window.CLASSES = window.CLASSES || {};
window.SPELLS = window.SPELLS || {};   // only Eldritch Knights cast (wizard list in spells-wizard.js)
const FTR_ASI = { name: "Ability Score Improvement", text: "Increase one ability score by 2, or two scores by 1 (max 20), or take a feat.", asi: true };
const supDie = (lvl) => (lvl >= 18 ? "d12" : lvl >= 10 ? "d10" : "d8");
window.CLASSES.fighter = {
  name: "Fighter",
  hitDie: 10,
  saves: ["str", "con"],
  asiLevels: [4, 6, 8, 12, 14, 16, 19],
  multiclassReq: "STR 13 or DEX 13",
  multiclassProfs: "Light armor, medium armor, shields, simple weapons, martial weapons",
  subclassLevel: 3,
  subclassLabel: "Martial Archetype",
  tiles: (c) => [["Action Surge", c.lvl >= 17 ? "2 / rest" : c.lvl >= 2 ? "1 / rest" : "—"]],   // shown when the fighter doesn't cast
  resources: (lvl) => [
    { id: "wind", name: "Second Wind", max: 1, reset: "short", note: `Bonus action: regain 1d10 + ${lvl} hit points.` },
    { id: "surge", name: "Action Surge", max: lvl >= 17 ? 2 : lvl >= 2 ? 1 : 0, reset: "short", note: "Take one additional action on your turn (only one Action Surge per turn)." },
    { id: "indom", name: "Indomitable", max: lvl >= 17 ? 3 : lvl >= 13 ? 2 : lvl >= 9 ? 1 : 0, reset: "long", note: "Reroll a saving throw you fail. You must use the new roll." }
  ],
  features: {
    1: [
      { name: "Fighting Style", text: "You adopt a style of fighting as your specialty: Archery, Defense, Dueling, Great Weapon Fighting, Protection or Two-Weapon Fighting. You can't take the same style twice. Your pick is listed under Race & background." },
      { name: "Second Wind", bonusAction: true, text: (c) => `Bonus action: regain 1d10 + ${c.lvl} hit points. Once per short or long rest.` }
    ],
    2: [{ name: "Action Surge", text: (c) => `On your turn you can take one additional action. Once per short or long rest${c.lvl >= 17 ? " (twice before a rest from 17th level, but only once per turn)" : ""}.` }],
    3: [{ name: "Martial Archetype", text: "You choose the archetype you strive to emulate. It grants features at 3rd, 7th, 10th, 15th and 18th level." }],
    4: [FTR_ASI],
    5: [{ name: "Extra Attack", onAttacks: true, text: (c) => `You can attack ${c.lvl >= 20 ? "four times" : c.lvl >= 11 ? "three times" : "twice"}, instead of once, whenever you take the Attack action on your turn.` }],
    6: [FTR_ASI],
    8: [FTR_ASI],
    9: [{ name: "Indomitable", text: (c) => `You can reroll a saving throw that you fail, and must use the new roll. ${c.lvl >= 17 ? 3 : c.lvl >= 13 ? 2 : 1} use${c.lvl >= 13 ? "s" : ""} per long rest.` }],
    11: [{ name: "Extra Attack (2)", text: "You attack three times whenever you take the Attack action." }],
    12: [FTR_ASI],
    13: [{ name: "Indomitable (two uses)", text: "You can use Indomitable twice between long rests." }],
    14: [FTR_ASI],
    16: [FTR_ASI],
    17: [
      { name: "Action Surge (two uses)", text: "You can use Action Surge twice before a rest, but only once on the same turn." },
      { name: "Indomitable (three uses)", text: "You can use Indomitable three times between long rests." }
    ],
    19: [FTR_ASI],
    20: [{ name: "Extra Attack (3)", text: "You attack four times whenever you take the Attack action." }]
  },
  subclasses: {
    champion: {
      name: "Champion",
      features: {
        3: [{ name: "Improved Critical", onAttacks: true, text: "Your weapon attacks score a critical hit on a roll of 19 or 20." }],
        7: [{ name: "Remarkable Athlete", text: (c) => `Add +${Math.ceil(c.pb / 2)} (half your proficiency bonus, rounded up) to any STR, DEX or CON check that doesn't already use your proficiency bonus. Your running long jump grows by ${Math.max(0, c.mod("str"))} ft.` }],
        10: [{ name: "Additional Fighting Style", text: "Choose a second Fighting Style option." }],
        15: [{ name: "Superior Critical", onAttacks: true, text: "Your weapon attacks score a critical hit on a roll of 18–20." }],
        18: [{ name: "Survivor", text: (c) => `At the start of each of your turns, regain ${5 + c.mod("con")} hit points if you have no more than half your hit points left and at least 1.` }]
      }
    },
    battle: {
      name: "Battle Master",
      resources: (lvl) => [
        { id: "sup", name: `Superiority Dice (${supDie(lvl)})`, max: lvl >= 15 ? 6 : lvl >= 7 ? 5 : 4, reset: "short", note: "Spend one to fuel a maneuver. All are regained after a short or long rest." }
      ],
      features: {
        3: [
          { name: "Combat Superiority", onAttacks: true, text: (c) => `You know ${c.lvl >= 15 ? 9 : c.lvl >= 10 ? 7 : c.lvl >= 7 ? 5 : 3} maneuvers and have ${c.lvl >= 15 ? 6 : c.lvl >= 7 ? 5 : 4} superiority dice (${supDie(c.lvl)}). Maneuver save DC ${8 + c.pb + Math.max(c.mod("str"), c.mod("dex"))}. List your maneuvers under Race & background.` },
          { name: "Student of War", text: "You gain proficiency with one type of artisan's tools of your choice." }
        ],
        7: [{ name: "Know Your Enemy", text: "If you spend at least 1 minute observing or interacting with a creature outside combat, you learn whether it is your equal, superior or inferior in two of: STR, DEX, CON, AC, current HP, total class levels, fighter levels." }],
        10: [{ name: "Improved Combat Superiority", text: "Your superiority dice turn into d10s." }],
        15: [{ name: "Relentless", text: "When you roll initiative and have no superiority dice remaining, you regain 1." }],
        18: [{ name: "Improved Combat Superiority (d12)", text: "Your superiority dice turn into d12s." }]
      }
    },
    /* Eldritch Knight: casts wizard spells as a third caster. `casting` lays spellcasting over
       the fighter class (engine classDef). It knows a fixed list, kept in S.prepared. */
    eldritch: {
      name: "Eldritch Knight",
      casting: {
        spellcasting: { ability: "int", progression: "third", list: "wizard", known: true, firstSlotLevel: 3 },
        cantripsKnown: [0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        preparedCount: (lvl) => [0, 0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13][lvl],
        listName: "wizard",
        prepLabel: "from the Eldritch Knight table",
        spellTip: "Eldritch Knights learn wizard spells and keep them; there's nothing to prepare after a rest. Most must be abjuration or evocation: only the spells you learn at 3rd, 8th, 14th and 20th level can come from any school. When you gain a fighter level you can also swap one spell you know for another wizard spell (abjuration or evocation unless it replaces a free pick).",
        knownTip: "Tick the spells you learn at this level. Pick abjuration or evocation unless this level gives a free pick (3rd, 8th, 14th, 20th). You can also untick one spell you know and learn another in its place."
      },
      features: {
        3: [
          { name: "Spellcasting", text: (c) => `You know ${c.lvl >= 10 ? 3 : 2} wizard cantrips and learn wizard spells, mostly abjuration and evocation, casting them with INT. Spell save DC ${8 + c.pb + c.mod("int")}, spell attack +${c.pb + c.mod("int")}.` },
          { name: "Weapon Bond", text: "Over a 1-hour ritual (it can be part of a short rest) you bond with up to two weapons. You can't be disarmed of a bonded weapon unless you're incapacitated, and if it's on the same plane you can summon it to your hand as a bonus action." }
        ],
        7: [{ name: "War Magic", bonusAction: true, text: "When you use your action to cast a cantrip, you can make one weapon attack as a bonus action." }],
        10: [{ name: "Eldritch Strike", onAttacks: true, text: "When you hit a creature with a weapon attack, it has disadvantage on the next saving throw it makes against a spell you cast before the end of your next turn." }],
        15: [{ name: "Arcane Charge", text: "When you use Action Surge, you can also teleport up to 30 feet to an unoccupied space you can see, before or after the additional action." }],
        18: [{ name: "Improved War Magic", bonusAction: true, text: "When you use your action to cast a spell, you can make one weapon attack as a bonus action." }]
      }
    }
  }
};
/* Spell slots by caster level (2014 PHB). The Eldritch Knight casts as a third caster. */
window.SLOTS_FULL = window.SLOTS_FULL || [
  [], [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1]
];
