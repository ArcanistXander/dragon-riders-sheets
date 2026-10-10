/* Cleric — D&D 5e (2014 PHB). Feature text is summarized for table use.
   A feature's `text` may be a function (ctx) => string, where ctx carries
   { lvl (class level), total (character level), pb, mod(ability) }. */
window.CLASSES = window.CLASSES || {};
window.CLASSES.cleric = {
  name: "Cleric",
  hitDie: 8,
  saves: ["wis", "cha"],
  spellcasting: { ability: "wis", progression: "full", list: "cleric", prepares: true },
  cantripsKnown: [0, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  asiLevels: [4, 8, 12, 16, 19],
  multiclassReq: "WIS 13",
  multiclassProfs: "Light armor, medium armor, shields",
  preparedCount: (lvl, mods) => Math.max(1, lvl + mods.wis),
  resources: (lvl) => [
    { id: "cd", name: "Channel Divinity", max: lvl >= 18 ? 3 : lvl >= 6 ? 2 : lvl >= 2 ? 1 : 0, reset: "short" },
    { id: "di", name: "Divine Intervention", max: lvl >= 10 ? 1 : 0, reset: "long",
      note: lvl >= 20 ? "Succeeds automatically. Usable again after 7 days." : `Roll d100; succeeds on ${lvl} or lower. On success, wait 7 days; otherwise usable after a long rest.` }
  ],
  features: {
    1: [
      { name: "Spellcasting", text: (c) => `Prepare ${Math.max(1, c.lvl + c.mod("wis"))} cleric spells (WIS mod + cleric level) after each long rest from the full cleric list. Spell save DC ${8 + c.pb + c.mod("wis")}, spell attack +${c.pb + c.mod("wis")}. Cast prepared cleric spells as rituals if they have the ritual tag. Holy symbol is your focus.` }
    ],
    2: [
      { name: "Channel Divinity", text: (c) => `Channel divine energy ${c.lvl >= 18 ? "three times" : c.lvl >= 6 ? "twice" : "once"} per short or long rest. Save DC ${8 + c.pb + c.mod("wis")}.` },
      { name: "Channel Divinity: Turn Undead", text: (c) => `Action: each undead within 30 ft that can see or hear you makes a WIS save (DC ${8 + c.pb + c.mod("wis")}). On a failure it is turned for 1 minute or until it takes damage.` }
    ],
    4: [
      { name: "Ability Score Improvement", text: "Increase one ability score by 2, or two scores by 1 (max 20), or take a feat.", asi: true },
      { name: "Cantrip Known", text: "You learn a fourth cleric cantrip.", cantrip: true }
    ],
    5: [
      { name: "Destroy Undead (CR 1/2)", text: "When an undead fails its save against your Turn Undead, it is destroyed instantly if its CR is 1/2 or lower." },
      { name: "3rd-Level Spells", text: "You gain access to 3rd-level spell slots and can prepare 3rd-level cleric spells.", spells: 3 }
    ],
    6: [{ name: "Channel Divinity (2/rest)", text: "You can use Channel Divinity twice between rests." }],
    7: [{ name: "4th-Level Spells", text: "You gain access to 4th-level spell slots.", spells: 4 }],
    8: [
      { name: "Ability Score Improvement", text: "Increase one ability score by 2, or two scores by 1 (max 20), or take a feat.", asi: true },
      { name: "Destroy Undead (CR 1)", text: "Turned undead of CR 1 or lower are destroyed." }
    ],
    9: [{ name: "5th-Level Spells", text: "You gain access to 5th-level spell slots.", spells: 5 }],
    10: [
      { name: "Divine Intervention", text: (c) => `Action: call on Bahamut for aid. Roll d100; if the roll is ${c.lvl} or lower, your deity intervenes (DM chooses the effect). On success you can't use this again for 7 days; otherwise you can try again after a long rest.` },
      { name: "Cantrip Known", text: "You learn a fifth cleric cantrip.", cantrip: true }
    ],
    11: [
      { name: "Destroy Undead (CR 2)", text: "Turned undead of CR 2 or lower are destroyed." },
      { name: "6th-Level Spells", text: "You gain a 6th-level spell slot.", spells: 6 }
    ],
    12: [{ name: "Ability Score Improvement", text: "Increase one ability score by 2, or two scores by 1 (max 20), or take a feat.", asi: true }],
    13: [{ name: "7th-Level Spells", text: "You gain a 7th-level spell slot.", spells: 7 }],
    14: [{ name: "Destroy Undead (CR 3)", text: "Turned undead of CR 3 or lower are destroyed." }],
    15: [{ name: "8th-Level Spells", text: "You gain an 8th-level spell slot.", spells: 8 }],
    16: [{ name: "Ability Score Improvement", text: "Increase one ability score by 2, or two scores by 1 (max 20), or take a feat.", asi: true }],
    17: [
      { name: "Destroy Undead (CR 4)", text: "Turned undead of CR 4 or lower are destroyed." },
      { name: "9th-Level Spells", text: "You gain a 9th-level spell slot.", spells: 9 }
    ],
    18: [{ name: "Channel Divinity (3/rest)", text: "You can use Channel Divinity three times between rests." }],
    19: [{ name: "Ability Score Improvement", text: "Increase one ability score by 2, or two scores by 1 (max 20), or take a feat.", asi: true }],
    20: [{ name: "Divine Intervention Improvement", text: "Your call for divine intervention succeeds automatically, no roll required." }]
  },
  subclasses: {
    life: {
      name: "Life Domain",
      domainSpells: { 1: ["Bless", "Cure Wounds"], 3: ["Lesser Restoration", "Spiritual Weapon"], 5: ["Beacon of Hope", "Revivify"], 7: ["Death Ward", "Guardian of Faith"], 9: ["Mass Cure Wounds", "Raise Dead"] },
      healBonus: (spellLevel, lvl) => 2 + spellLevel, // Disciple of Life
      features: {
        1: [
          { name: "Bonus Proficiency", text: "You gain proficiency with heavy armor." },
          { name: "Disciple of Life", text: "When a spell of 1st level or higher restores hit points, the creature regains extra HP equal to 2 + the spell's level." },
          { name: "Domain Spells", text: "Bless and Cure Wounds are always prepared and don't count against your prepared spells." }
        ],
        2: [{ name: "Channel Divinity: Preserve Life", text: (c) => `Action: restore ${5 * c.lvl} HP (5 × cleric level), divided among creatures within 30 ft. Can't raise a creature above half its HP maximum. No effect on undead or constructs.` }],
        3: [{ name: "Domain Spells", text: "Lesser Restoration and Spiritual Weapon are always prepared." }],
        5: [{ name: "Domain Spells", text: "Beacon of Hope and Revivify are always prepared." }],
        6: [{ name: "Blessed Healer", text: "When you cast a spell of 1st level or higher that restores HP to a creature other than you, you regain 2 + the spell's level HP." }],
        7: [{ name: "Domain Spells", text: "Death Ward and Guardian of Faith are always prepared." }],
        8: [{ name: "Divine Strike", text: (c) => `Once on each of your turns when you hit with a weapon attack, deal an extra ${c.lvl >= 14 ? "2d8" : "1d8"} radiant damage.` }],
        9: [{ name: "Domain Spells", text: "Mass Cure Wounds and Raise Dead are always prepared." }],
        14: [{ name: "Divine Strike Improvement", text: "Divine Strike damage increases to 2d8 radiant." }],
        17: [{ name: "Supreme Healing", text: "When you would roll dice to restore HP with a spell, use the highest number possible for each die instead." }]
      }
    }
  }
};

/* Shared slot tables used by every caster. */
window.SLOTS_FULL = [
  [], [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1]
];
