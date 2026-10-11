/* Rogue — D&D 5e (2014 PHB). Feature text is summarized for table use.
   A feature's `text` may be a function (ctx) => string, where ctx carries
   { lvl (class level), total (character level), pb, mod(ability) }.
   `onAttacks` features also show beside the weapons on the Attacks tab;
   `bonusAction` features are listed under "On your turn". */
window.CLASSES = window.CLASSES || {};
window.SPELLS = window.SPELLS || {};   // only Arcane Tricksters cast (wizard list in spells-wizard.js)
window.CLASSES.rogue = {
  name: "Rogue",
  hitDie: 8,
  saves: ["dex", "int"],
  asiLevels: [4, 8, 10, 12, 16, 19],
  multiclassReq: "DEX 13",
  multiclassProfs: "Light armor, one skill from the rogue list, thieves' tools",
  subclassLevel: 3,
  subclassLabel: "Roguish Archetype",
  tiles: (c) => [["Sneak attack", `${Math.ceil(c.lvl / 2)}d6`]],   // replaces the spell tiles a caster would have
  resources: (lvl) => [
    { id: "luck", name: "Stroke of Luck", max: lvl >= 20 ? 1 : 0, reset: "short" }
  ],
  features: {
    1: [
      { name: "Expertise", text: "Your proficiency bonus is doubled for two of your skill proficiencies (or one skill and thieves' tools). Expertise skills show a ringed dot on the Overview." },
      { name: "Sneak Attack", onAttacks: true, text: (c) => `Once per turn, deal an extra ${Math.ceil(c.lvl / 2)}d6 damage to one creature you hit with a finesse or ranged weapon attack, if you have advantage on the roll. You don't need advantage if another enemy of the target is within 5 ft. of it, that enemy isn't incapacitated, and you don't have disadvantage.` },
      { name: "Thieves' Cant", text: "You know the secret mix of dialect, jargon and code that lets rogues hide messages in normal-seeming conversation, plus the signs and symbols that mark danger, a guild's territory or a safe house." }
    ],
    2: [{ name: "Cunning Action", bonusAction: true, text: "On each of your turns in combat you can take a bonus action to Dash, Disengage, or Hide." }],
    3: [{ name: "Roguish Archetype", text: "You choose the archetype you emulate. It grants features at 3rd, 9th, 13th and 17th level." }],
    4: [{ name: "Ability Score Improvement", text: "Increase one ability score by 2, or two scores by 1 (max 20), or take a feat.", asi: true }],
    5: [{ name: "Uncanny Dodge", text: "When an attacker you can see hits you with an attack, you can use your reaction to halve the attack's damage against you." }],
    6: [{ name: "Expertise", text: "Choose two more of your skill proficiencies (or one skill and thieves' tools) to gain expertise. Tap the skill dots on the Overview in edit mode." }],
    7: [{ name: "Evasion", text: "When an effect lets you make a DEX save for half damage, you take no damage on a success and only half on a failure." }],
    8: [{ name: "Ability Score Improvement", text: "Increase one ability score by 2, or two scores by 1 (max 20), or take a feat.", asi: true }],
    10: [{ name: "Ability Score Improvement", text: "Increase one ability score by 2, or two scores by 1 (max 20), or take a feat.", asi: true }],
    11: [{ name: "Reliable Talent", text: "Whenever you make an ability check that uses a skill you're proficient in, treat a d20 roll of 9 or lower as a 10." }],
    12: [{ name: "Ability Score Improvement", text: "Increase one ability score by 2, or two scores by 1 (max 20), or take a feat.", asi: true }],
    14: [{ name: "Blindsense", text: "If you can hear, you are aware of the location of any hidden or invisible creature within 10 ft. of you." }],
    15: [{ name: "Slippery Mind", text: "You gain proficiency in Wisdom saving throws. Tick WIS on the saving throws list." }],
    16: [{ name: "Ability Score Improvement", text: "Increase one ability score by 2, or two scores by 1 (max 20), or take a feat.", asi: true }],
    18: [{ name: "Elusive", text: "No attack roll has advantage against you while you aren't incapacitated." }],
    19: [{ name: "Ability Score Improvement", text: "Increase one ability score by 2, or two scores by 1 (max 20), or take a feat.", asi: true }],
    20: [{ name: "Stroke of Luck", text: "If your attack misses a target in range, you can turn the miss into a hit. Or, if you fail an ability check, you can treat the d20 roll as a 20. Once per short or long rest." }]
  },
  subclasses: {
    assassin: {
      name: "Assassin",
      features: {
        3: [
          { name: "Bonus Proficiencies", text: "You gain proficiency with the disguise kit and the poisoner's kit." },
          { name: "Assassinate", onAttacks: true, text: "You have advantage on attack rolls against any creature that hasn't taken a turn in the combat yet. Any hit you score against a creature that is surprised is a critical hit." }
        ],
        9: [{ name: "Infiltration Expertise", text: "Spend seven days and 25 gp to build a false identity: history, profession and affiliations, plus documents and acquaintances. You can't take the identity of someone who already exists. Others believe you are that person until given an obvious reason not to." }],
        13: [{ name: "Impostor", text: "After studying a person's speech, writing and behavior for at least three hours, you can mimic them unerringly. Casual observers can't see through it. If a wary creature suspects something, you have advantage on any Charisma (Deception) check you make to avoid detection." }],
        17: [{ name: "Death Strike", onAttacks: true, text: (c) => `When you attack and hit a creature that is surprised, it must make a CON save (DC ${8 + c.mod("dex") + c.pb}). On a failure, double the damage of your attack against it.` }]
      }
    },
    /* Arcane Trickster: casts wizard spells as a third caster. `casting` lays spellcasting over
       the rogue class (engine classDef). It knows a fixed list, kept in S.prepared. */
    arcane: {
      name: "Arcane Trickster",
      casting: {
        spellcasting: { ability: "int", progression: "third", list: "wizard", known: true, firstSlotLevel: 3 },
        cantripsKnown: [0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        preparedCount: (lvl) => [0, 0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13][lvl],
        listName: "wizard",
        prepLabel: "from the Arcane Trickster table",
        spellTip: "Arcane Tricksters learn wizard spells and keep them; there's nothing to prepare after a rest. Most must be enchantment or illusion: only the spells you learn at 3rd, 8th, 14th and 20th level can come from any school. When you gain a rogue level you can also swap one spell you know for another wizard spell (enchantment or illusion unless it replaces a free pick). Mage Hand is always one of your cantrips.",
        knownTip: "Tick the spells you learn at this level. Pick enchantment or illusion unless this level gives a free pick (3rd, 8th, 14th, 20th). You can also untick one spell you know and learn another in its place."
      },
      features: {
        3: [
          { name: "Spellcasting", text: (c) => `You know ${c.lvl >= 10 ? 4 : 3} cantrips (Mage Hand plus your choices) and learn wizard spells, mostly enchantment and illusion, casting them with INT. Spell save DC ${8 + c.pb + c.mod("int")}, spell attack +${c.pb + c.mod("int")}.` },
          { name: "Mage Hand Legerdemain", bonusAction: true, text: "Your Mage Hand is invisible, and you can control it as a bonus action (Cunning Action). With it you can stow an object in a container worn or carried by another creature, retrieve an object from one, or use thieves' tools to pick locks and disarm traps at range. A DEX (Sleight of Hand) check against the creature's WIS (Perception) keeps it from noticing." }
        ],
        9: [{ name: "Magical Ambush", text: "If you are hidden from a creature when you cast a spell on it, the creature has disadvantage on any saving throw it makes against the spell this turn." }],
        13: [{ name: "Versatile Trickster", bonusAction: true, text: "As a bonus action, you can use your Mage Hand to distract a creature within 5 ft. of the hand. You have advantage on attack rolls against that creature until the end of the turn." }],
        17: [{ name: "Spell Thief", text: (c) => `Immediately after a creature casts a spell that targets you or includes you in its area, you can use your reaction to force it to make a save with its spellcasting modifier (DC ${8 + c.pb + c.mod("int")}). On a failure you negate the spell's effect on you and steal the knowledge of it for 8 hours, if it's at least 1st level and of a level you can cast. The caster can't cast it until then. Once per long rest.` }]
      }
    }
  }
};
/* Spell slots by caster level (2014 PHB). The Arcane Trickster casts as a third caster. */
window.SLOTS_FULL = window.SLOTS_FULL || [
  [], [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1]
];
