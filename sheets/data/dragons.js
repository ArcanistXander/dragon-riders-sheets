/* ============================================================
   DRAGON BOND RULES — BETA
   Everything about dragon growth lives here so it can be changed
   without touching the sheet engine. Edit, republish, done.
   ============================================================ */
window.DRAGON_RULES = {
  version: "beta-1",

  /* Growth by rider (character) level. The sheet uses the highest row
     whose level is <= the rider's level (the first row below level 3). */
  tiers: [
    { level: 3,  size: "Small",      pb: 2, hp: 0,  breath: "2d6" },
    { level: 5,  size: "Medium",     pb: 3, hp: 20, breath: "3d6" },
    { level: 10, size: "Large",      pb: 4, hp: 40, breath: "4d6" },
    { level: 16, size: "Huge",       pb: 5, hp: 60, breath: "5d6" },
    { level: 19, size: "Gargantuan", pb: 6, hp: 80, breath: "6d6" }
  ],

  /* Base stat formulas (PB = dragon PB from the tier table). */
  acBase: 13,              // AC = 13 + PB
  hpBase: 20,              // HP = 20 + rider level + dragon CON mod + tier HP

  /* Bonus Action command until the dragon reaches this size,
     then the shared Essence Pool takes over. */
  essence: {
    unlockSize: "Large",
    pool: (riderPB, riderLevel) => riderPB + Math.ceil(riderLevel / 2),
    costs: [
      { name: "Command a complex maneuver", cost: 1 },
      { name: "Use Breath Weapon", cost: 2 },
      { name: "Dragon uses Multiattack", cost: 2 },
      { name: "Legendary Resistance", cost: 3 }
    ],
    empty: "Out of Essence: the dragon can only take the Attack action (Bite only), Dash, or Disengage."
  },

  bonusActionCommand: "The dragon takes the Dodge action on its turn unless you use a bonus action to command it to take another action."
};

/* Every rider's dragon, by the rider's id on the DM's party sheet. Used where one sheet
   reaches another rider's dragon, like Breya's Hidecarved Wards. Keep in step with party.html. */
window.PARTY_DRAGONS = [
  { id: "breya", rider: "Breya", dragon: "Ametrin" },
  { id: "corbin", rider: "Corbin", dragon: "Bronze Hatchling" },
  { id: "coltyn", rider: "Coltyn", dragon: "Noctoror Sactr" },
  { id: "haratio", rider: "Haratio", dragon: "Crystal Hatchling" },
  { id: "karinya", rider: "Karinya", dragon: "Navarre" },
  { id: "cedrick", rider: "Cedrick", dragon: "Emerald Hatchling" },
  { id: "ra", rider: "Ra", dragon: "Thamior" }
];

/* Dragon kinds. Only `bronze` has a full stat card so far; the others
   carry the breath and persona notes from the companion document. */
window.DRAGON_KINDS = {
  bronze: {
    title: "Bronze Dragon", family: "Metallic",
    abilities: { str: 15, dex: 10, con: 15, int: 10, wis: 12, cha: 14 },
    saveBonus: { dex: true, con: true, wis: true, cha: true },
    speed: "30 ft., fly 40 ft., swim 30 ft.",
    immunities: "Lightning",
    senses: "Blindsight 10 ft., Darkvision 60 ft.",
    damageType: "lightning",
    bite: { dice: "1d6", type: "piercing", reach: "5 ft." },
    breath: {
      name: "Lightning Breath", recharge: "5–6", shape: "20-foot line, 5 ft. wide", save: "dex",
      effect: "Each creature in the line makes a Dexterity save, taking the damage on a failure and losing its reaction until its next turn."
    },
    features: [
      { level: 3, name: "Lightning Guard", kind: "Reaction", dice: "1d6", diceAbil: "con", per: "round", verb: "reduce damage by",
        text: (d) => `When the rider (or an ally within 5 ft. of the dragon) is hit by a melee or ranged weapon attack, the dragon intercepts it with electromagnetic force, reducing the damage by 1d6 + ${d.mod("con")}.` }
    ],
    nameIdeas: ["Aegis", "Valor", "Kaelen", "Ignis"],
    persona: {
      Appearance: "Deep, polished bronze scales that shimmer reddish-gold in sunlight. Ridged spinal crests resemble an ancient military helmet, giving it a martial silhouette.",
      "The Tell": "A powerhouse of heat. Before combat the air around it visibly warps, and its scales bristle and stand on edge when it senses a challenge, making it look larger than it is.",
      Voice: "Booming, authoritative and energetic. It doesn't talk down to anyone; it talks at them, like a veteran drill sergeant or a war hero speaking with total conviction.",
      "Roleplay Dynamic": "Corbin's shield-brother. It has no interest in political intrigue or academic study of the Weavers. It respects strength, discipline and a hard-won victory, and bonds over the battlefield: the clash of steel, tactical positioning, and triumph against superior odds."
    }
  },
  /* Crystal Hatchling (Haratio). Numbers from the DM's stat card. While Haratio is corrupted by
     his dark urges (toggle on the Dragon tab), the breath and Bioluminescent Truth change. */
  crystal: {
    title: "Crystal Dragon", family: "Gem",
    abilities: { str: 14, dex: 10, con: 15, int: 10, wis: 12, cha: 14 },
    saveBonus: { dex: true, con: true, wis: true, cha: true },
    speed: "30 ft., fly 40 ft., burrow 15 ft.",
    immunities: "Radiant",
    senses: "Blindsight 10 ft., Darkvision 60 ft.",
    damageType: "radiant",
    bite: { dice: "1d6", type: "piercing", reach: "5 ft." },
    breath: {
      name: "Radiant Breath", recharge: "5–6", shape: "15-foot cone of starlight", save: "con",
      effect: "On a failure the creature is also blinded until the end of its next turn. On a success it takes half damage and isn't blinded."
    },
    corrupt: {
      label: "Dark urges", damageType: "necrotic",
      hint: "Turn on while Haratio is corrupted by his dark urges. The breath turns necrotic and frightens, and the dragon's light turns violet-black.",
      breath: { name: "Radiant Breath (corrupted)", effect: "On a failure the creature is frightened (instead of blinded) until the end of its next turn. On a success it takes half damage and isn't frightened." }
    },
    features: [
      { level: 3, name: "Bioluminescent Truth", kind: "Bonus action",
        text: () => "The dragon sheds bright daylight in a 15-foot radius, revealing invisible creatures and illusions.",
        corruptText: () => "The dragon's light turns violet-black: it extinguishes non-magical flames within 15 feet and fills the area with magical dim light instead of revealing the invisible." }
    ]
  },
  copper:   { title: "Copper Dragon",   family: "Metallic",  damageType: "acid",     breath: { shape: "15-foot cone", effect: "On a failed save, the ground in the area becomes difficult terrain for 1 round." } },
  /* Ametrin (Breya). Numbers from the DM's party sheet and Breya's Quest Portal card. */
  amethyst: {
    title: "Amethyst Dragon", family: "Gem",
    abilities: { str: 13, dex: 12, con: 14, int: 16, wis: 12, cha: 14 },
    saveBonus: { dex: true, con: true, wis: true, cha: true },
    speed: "30 ft., fly 40 ft. (hover)",
    immunities: "Force",
    senses: "Blindsight 10 ft., Darkvision 60 ft.",
    languages: "Understands Draconic; telepathic bond with its rider",
    damageType: "force",
    bite: { dice: "1d6", type: "piercing", reach: "5 ft." },
    breath: {
      name: "Force Breath", recharge: "5–6", shape: "15-foot cone of kinetic force", save: "str",
      effect: "On a failure the creature is also pushed 10 feet away; on a success it takes half damage and isn't pushed."
    },
    features: [
      { level: 3, name: "Gravitational Tinkering", kind: "At will",
        text: () => "The dragon keeps a permanent, invisible Mage Hand that can carry up to 30 lb." },
      { level: 3, name: "Gravity Shift", kind: "Reaction", per: "short",
        text: (d, rider) => `When a ranged attack targets ${rider}, the dragon bends gravity and the attack roll takes a −2 penalty. Once per short rest.` }
    ]
  },
  /* Navarre (Karinya). Numbers from the DM's stat card. */
  moonstone: {
    title: "Moonstone Dragon", family: "Gem",
    abilities: { str: 14, dex: 14, con: 13, int: 14, wis: 9, cha: 16 },
    saveBonus: { dex: true, con: true, wis: true, cha: true },
    speed: "30 ft., fly 40 ft.",
    immunities: "Psychic",
    senses: "Blindsight 10 ft., Darkvision 60 ft.",
    damageType: "psychic",
    bite: { dice: "1d6", type: "piercing", reach: "5 ft." },
    breath: {
      name: "Psychic Breath", recharge: "5–6", shape: "15-foot cone of fey energy", save: "wis",
      effect: "Each creature in the cone makes a Wisdom save, taking the damage and becoming charmed for 1 round on a failure."
    },
    features: [
      { level: 3, name: "Feywild Havoc", kind: "Innate magic", per: "long", use: "Color Spray",
        text: () => "The dragon manipulates light and sound without components. It can cast Minor Illusion at will, and Color Spray once per long rest." }
    ]
  },
  /* Noctoror Sactr (Coltyn). Numbers from the DM's party sheet. */
  black: {
    title: "Black Dragon", family: "Chromatic",
    abilities: { str: 15, dex: 14, con: 13, int: 14, wis: 10, cha: 13 },
    saveBonus: { dex: true, con: true, wis: true, cha: true },
    speed: "30 ft., fly 40 ft., swim 30 ft.",
    immunities: "Acid",
    senses: "Blindsight 10 ft., Darkvision 60 ft.",
    damageType: "acid",
    bite: { dice: "1d6", type: "piercing", reach: "5 ft." },
    breath: {
      name: "Acid Breath", recharge: "5–6", shape: "20-foot line, 5 ft. wide", save: "dex",
      effect: "Each creature in the line makes a Dexterity save, taking the damage on a failure. On a failure the acid also clings, dealing 1d4 more acid damage at the start of the creature's next turn."
    },
    features: [
      { level: 3, name: "Amphibious", kind: "Trait", text: () => "The dragon can breathe air and water." },
      { level: 3, name: "Snuff Light", kind: "At will", text: () => "The dragon puts out any nonmagical light within 30 feet." },
      { level: 3, name: "Deep-Lurker's Shroud", kind: "Action", per: "long", use: "Shroud",
        text: (d, rider) => `The dragon pulls the shadows into a 10-foot-radius sphere around itself for 1 minute. It works like Pass without Trace: the dragon, ${rider} and allies in the sphere get +10 to Stealth checks. Once per long rest.` }
    ]
  },
  emerald:  { title: "Emerald Dragon",  family: "Gem",       damageType: "psychic",  breath: { shape: "15-foot cone", effect: "On a failed save, the target can't take reactions until the start of its next turn." } }
};
