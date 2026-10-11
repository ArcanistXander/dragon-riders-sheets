/* Paladin — D&D 5e (2014 PHB; Oathbreaker from the 2014 DMG). Feature text is summarized for table use.
   A feature's `text` may be a function (ctx) => string, where ctx carries
   { lvl (class level), total (character level), pb, mod(ability) }.
   The Sacred Oath is picked in the level-up wizard at level 3 (subclassLevel); undoing that
   level-up from Options and leveling again lets the player pick a different oath. */
window.CLASSES = window.CLASSES || {};
const PAL_ASI = { name: "Ability Score Improvement", text: "Increase one ability score by 2, or two scores by 1 (max 20), or take a feat.", asi: true };
const palDC = (c) => 8 + c.pb + c.mod("cha");
window.CLASSES.paladin = {
  name: "Paladin",
  hitDie: 10,
  saves: ["wis", "cha"],
  spellcasting: { ability: "cha", progression: "half", list: "paladin", prepares: true, firstSlotLevel: 2 },
  asiLevels: [4, 8, 12, 16, 19],
  multiclassReq: "STR 13 and CHA 13",
  multiclassProfs: "Light armor, medium armor, shields, simple weapons, martial weapons",
  subclassLevel: 3,
  subclassLabel: "Sacred Oath",
  preparedCount: (lvl, mods) => (lvl < 2 ? 0 : Math.max(1, Math.floor(lvl / 2) + mods.cha)),
  prepLabel: "half your paladin level",
  spellTip: "Paladins don't learn spells one at a time. After each long rest you prepare paladin spells equal to your CHA modifier + half your paladin level (rounded down), from the whole paladin list. Oath spells are always prepared for free. Divine Smite isn't a spell: it's on the Attacks tab and spends a slot when you hit.",
  resources: (lvl, mods) => [
    { id: "loh", name: "Lay on Hands", max: lvl * 5, reset: "long", pool: true, unit: "hit points",
      note: "Action: touch a creature and restore HP from the pool, or spend 5 to cure one disease or neutralize one poison. No effect on undead or constructs." },
    { id: "sense", name: "Divine Sense", max: Math.max(1, 1 + mods.cha), reset: "long" },
    { id: "cd", name: "Channel Divinity", max: lvl >= 3 ? 1 : 0, reset: "short" },
    { id: "cleanse", name: "Cleansing Touch", max: lvl >= 14 ? Math.max(1, mods.cha) : 0, reset: "long" }
  ],
  features: {
    1: [
      { name: "Divine Sense", text: (c) => `Action: until the end of your next turn you know the location of any celestial, fiend or undead within 60 ft. that isn't behind total cover, and any consecrated or desecrated place or object. ${Math.max(1, 1 + c.mod("cha"))} uses per long rest.` },
      { name: "Lay on Hands", text: (c) => `A pool of ${c.lvl * 5} hit points (5 × paladin level) that refills on a long rest. Action: touch a creature and restore any number of HP from the pool, or spend 5 to cure one disease or neutralize one poison. No effect on undead or constructs.` }
    ],
    2: [
      { name: "Fighting Style", text: "You adopt a style of fighting as your specialty (Defense, Dueling, Great Weapon Fighting or Protection). You can't take the same style twice. Your pick is listed under Race & background." },
      { name: "Spellcasting", text: (c) => `You prepare ${Math.max(1, Math.floor(c.lvl / 2) + c.mod("cha"))} paladin spells (CHA mod + half paladin level) after each long rest. Spell save DC ${palDC(c)}, spell attack +${c.pb + c.mod("cha")}. A holy symbol is your focus.` },
      { name: "Divine Smite", onAttacks: true, text: "When you hit with a melee weapon attack, you can spend a spell slot to deal extra radiant damage: 2d8 for a 1st-level slot, +1d8 per slot level above 1st (max 5d8). +1d8 more against an undead or fiend. Decide after you hit; it isn't a spell and doesn't take an action." }
    ],
    3: [
      { name: "Divine Health", text: "The divine magic flowing through you makes you immune to disease." },
      { name: "Sacred Oath", text: "You swear the oath that binds you as a paladin forever. It grants features at 3rd, 7th, 15th and 20th level, oath spells, and Channel Divinity options (once per short or long rest)." }
    ],
    4: [PAL_ASI],
    5: [
      { name: "Extra Attack", onAttacks: true, text: "You can attack twice, instead of once, whenever you take the Attack action on your turn." },
      { name: "2nd-Level Spells", text: "You gain 2nd-level spell slots.", spells: 2 }
    ],
    6: [{ name: "Aura of Protection", text: (c) => `Whenever you or a friendly creature within ${c.lvl >= 18 ? 30 : 10} ft. of you makes a saving throw, it gains a bonus equal to your CHA modifier (+${Math.max(1, c.mod("cha"))}, minimum +1). You must be conscious.` }],
    8: [PAL_ASI],
    9: [{ name: "3rd-Level Spells", text: "You gain 3rd-level spell slots.", spells: 3 }],
    10: [{ name: "Aura of Courage", text: (c) => `You and friendly creatures within ${c.lvl >= 18 ? 30 : 10} ft. of you can't be frightened while you are conscious.` }],
    11: [{ name: "Improved Divine Smite", onAttacks: true, text: "Whenever you hit a creature with a melee weapon, it takes an extra 1d8 radiant damage. This adds to Divine Smite." }],
    12: [PAL_ASI],
    13: [{ name: "4th-Level Spells", text: "You gain 4th-level spell slots.", spells: 4 }],
    14: [{ name: "Cleansing Touch", text: (c) => `Action: end one spell on yourself or on one willing creature you touch. ${Math.max(1, c.mod("cha"))} uses per long rest (CHA modifier, minimum 1).` }],
    16: [PAL_ASI],
    17: [{ name: "5th-Level Spells", text: "You gain 5th-level spell slots.", spells: 5 }],
    18: [{ name: "Aura Improvements", text: "The range of your Aura of Protection and Aura of Courage increases to 30 ft." }],
    19: [PAL_ASI]
  },
  subclasses: {
    vengeance: {
      name: "Oath of Vengeance", source: "PHB", alwaysLabel: "Oath",
      blurb: "Punish those who commit grievous sins, whatever the cost. A relentless hunter of the wicked.",
      domainSpells: { 3: ["Bane", "Hunter's Mark"], 5: ["Hold Person", "Misty Step"], 9: ["Haste", "Protection from Energy"], 13: ["Banishment", "Dimension Door"], 17: ["Hold Monster", "Scrying"] },
      features: {
        3: [
          { name: "Tenets of Vengeance", text: "Fight the greater evil. No mercy for the wicked. By any means necessary. Restitution: if your foes wreak ruin on the world, it is because you failed to stop them." },
          { name: "Channel Divinity: Abjure Enemy", text: (c) => `Action: present your holy symbol and choose one creature within 60 ft. that you can see. It makes a WIS save (DC ${palDC(c)}); fiends and undead have disadvantage. On a failure it is frightened for 1 minute or until it takes damage, and its speed is 0. On a success its speed is halved for 1 minute or until it takes damage.` },
          { name: "Channel Divinity: Vow of Enmity", bonusAction: true, text: "Bonus action: utter a vow against a creature you can see within 10 ft. You have advantage on attack rolls against it for 1 minute or until it drops to 0 HP or falls unconscious. Uses your Channel Divinity." }
        ],
        7: [{ name: "Relentless Avenger", text: "When you hit a creature with an opportunity attack, you can move up to half your speed immediately afterward as part of the same reaction. This movement doesn't provoke opportunity attacks." }],
        15: [{ name: "Soul of Vengeance", text: "When a creature under your Vow of Enmity makes an attack, you can use your reaction to make a melee weapon attack against it if it is within range." }],
        20: [{ name: "Avenging Angel", text: "Action: for 1 hour you sprout wings (fly 60 ft.) and emanate a 30-ft. aura of menace. The first time an enemy enters or starts its turn there in a battle, it makes a WIS save or is frightened for 1 minute or until it takes damage; attacks against it have advantage. Once per long rest." }]
      }
    },
    devotion: {
      name: "Oath of Devotion", source: "PHB", alwaysLabel: "Oath",
      blurb: "Honesty, courage, compassion, honor and duty. The classic knight in shining armor.",
      domainSpells: { 3: ["Protection from Evil and Good", "Sanctuary"], 5: ["Lesser Restoration", "Zone of Truth"], 9: ["Beacon of Hope", "Dispel Magic"], 13: ["Freedom of Movement", "Guardian of Faith"], 17: ["Commune", "Flame Strike"] },
      features: {
        3: [
          { name: "Tenets of Devotion", text: "Honesty. Courage. Compassion. Honor. Duty." },
          { name: "Channel Divinity: Sacred Weapon", text: (c) => `Action: for 1 minute your weapon adds +${Math.max(1, c.mod("cha"))} (CHA mod) to attack rolls, sheds bright light 20 ft., and counts as magical.` },
          { name: "Channel Divinity: Turn the Unholy", text: (c) => `Action: each fiend or undead within 30 ft. that can see or hear you makes a WIS save (DC ${palDC(c)}). On a failure it is turned for 1 minute or until it takes damage.` }
        ],
        7: [{ name: "Aura of Devotion", text: (c) => `You and friendly creatures within ${c.lvl >= 18 ? 30 : 10} ft. can't be charmed while you are conscious.` }],
        15: [{ name: "Purity of Spirit", text: "You are always under the effects of Protection from Evil and Good." }],
        20: [{ name: "Holy Nimbus", text: "Action: for 1 minute you shine bright light in 30 ft. Enemies starting their turn in it take 10 radiant damage, and you have advantage on saves against spells cast by fiends or undead. Once per long rest." }]
      }
    },
    ancients: {
      name: "Oath of the Ancients", source: "PHB", alwaysLabel: "Oath",
      blurb: "Protect the light, life and beauty of the world against the darkness.",
      domainSpells: { 3: ["Ensnaring Strike", "Speak with Animals"], 5: ["Misty Step", "Moonbeam"], 9: ["Plant Growth", "Protection from Energy"], 13: ["Ice Storm", "Stoneskin"], 17: ["Commune with Nature", "Tree Stride"] },
      features: {
        3: [
          { name: "Tenets of the Ancients", text: "Kindle the light. Shelter the light. Preserve your own light. Be the light." },
          { name: "Channel Divinity: Nature's Wrath", text: (c) => `Action: spectral vines grasp a creature within 10 ft. that you can see. It makes a STR or DEX save (its choice, DC ${palDC(c)}) or is restrained; it repeats the save at the end of each of its turns.` },
          { name: "Channel Divinity: Turn the Faithless", text: (c) => `Action: each fey or fiend within 30 ft. that can hear you makes a WIS save (DC ${palDC(c)}). On a failure it is turned for 1 minute or until it takes damage.` }
        ],
        7: [{ name: "Aura of Warding", text: (c) => `You and friendly creatures within ${c.lvl >= 18 ? 30 : 10} ft. have resistance to damage from spells.` }],
        15: [{ name: "Undying Sentinel", text: "When you are reduced to 0 HP and not killed outright, you drop to 1 HP instead (once per long rest). You don't suffer the drawbacks of old age and can't be aged magically." }],
        20: [{ name: "Elder Champion", text: "Action: for 1 minute you regain 10 HP at the start of each turn, cast paladin spells of 1 action as a bonus action, and enemies within 10 ft. have disadvantage on saves against your paladin spells and Channel Divinity. Once per long rest." }]
      }
    },
    oathbreaker: {
      name: "Oathbreaker", source: "DMG, DM approval", alwaysLabel: "Oath",
      blurb: "A paladin who broke their sacred oath to pursue dark ambition or serve an evil power.",
      domainSpells: { 3: ["Hellish Rebuke", "Inflict Wounds"], 5: ["Crown of Madness", "Darkness"], 9: ["Animate Dead", "Bestow Curse"], 13: ["Blight", "Confusion"], 17: ["Contagion", "Dominate Person"] },
      features: {
        3: [
          { name: "Channel Divinity: Control Undead", text: (c) => `Action: one undead within 30 ft. makes a WIS save (DC ${palDC(c)}). On a failure it obeys your commands for 24 hours or until you use this again. An undead whose CR is equal to or greater than your paladin level (${c.lvl}) is immune.` },
          { name: "Channel Divinity: Dreadful Aspect", text: (c) => `Action: each creature of your choice within 30 ft. that can see you makes a WIS save (DC ${palDC(c)}) or is frightened for 1 minute. It repeats the save at the end of each turn it ends more than 30 ft. from you.` }
        ],
        7: [{ name: "Aura of Hate", text: (c) => `You and fiends and undead within ${c.lvl >= 18 ? 30 : 10} ft. add your CHA modifier (${Math.max(1, c.mod("cha"))}) to melee weapon damage rolls. Multiple auras don't stack.` }],
        15: [{ name: "Supernatural Resistance", text: "You have resistance to bludgeoning, piercing and slashing damage from nonmagical weapons." }],
        20: [{ name: "Dread Lord", text: "Action: for 1 minute a 30-ft. aura of gloom dims bright light; frightened enemies starting their turn there take 4d10 psychic damage, you and allies have heavily obscured cover, and you can make a 3d10 necrotic melee spell attack as a bonus action. Once per long rest." }]
      }
    }
  }
};

/* Shared slot tables used by every caster. */
window.SLOTS_FULL = window.SLOTS_FULL || [
  [], [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1]
];
