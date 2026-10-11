/* Coltyn Lenuey ("Col") — starting state (Rogue 3, Arcane Trickster), from his Quest Portal player copy (2026-10-10).
   The live sheet saves its own copy; this is only the first-load default. */
window.CHARACTER_ID = "coltyn";
window.DEFAULT_ART = { portrait: "art/coltyn.webp", dragon: "art/coltyn-dragon.webp" };
window.DEFAULT_CHARACTER = {
  name: "Coltyn Lenuey",
  player: "Erin",
  race: "Human",
  background: "Piracy and farming",
  alignment: "Chaotic Neutral",
  xp: "Milestone",
  classes: [{ id: "rogue", sub: "arcane", level: 3 }],
  abilities: { str: 9, dex: 16, con: 12, int: 15, wis: 11, cha: 10 },
  saveProf: ["dex", "int"],
  saveNote: "",
  // Investigation and Persuasion are his expertise picks on Quest Portal.
  skills: { deception: 1, sleight: 1, survival: 1, investigation: 2, persuasion: 2 },
  // Quest Portal shows 24 max HP. Average d8 rolls with CON +1 give 21, so the other 3 sit in misc until the DM confirms.
  hp: { rolls: [8, 5, 5], misc: 3, current: 24, temp: 0 },
  hitDiceUsed: 0,
  death: { s: 0, f: 0 },
  inspiration: false,
  armor: { name: "Leather Armor", base: 11, dexCap: null, shield: false, misc: 0, note: "" },
  speed: 30,
  initMisc: 0,
  size: "Medium",
  senses: "Darkvision 60 ft. (on his Quest Portal sheet)",
  defenses: "",
  profs: {
    armor: "Light armor",
    weapons: "Simple weapons, hand crossbow, longsword, rapier, shortsword, scimitar, whip",
    tools: "Thieves' tools",
    languages: "Common, Aquan, Elvish, Thieves' Cant"
  },
  attacks: [
    { name: "Shortsword", kind: "melee", ability: "finesse", dice: "1d6", type: "piercing", prof: true, magic: 0, range: "", props: "Finesse, light", notes: "" },
    { name: "Trident", kind: "melee", ability: "str", dice: "1d6", type: "piercing", prof: false, magic: 0, range: "20/60", props: "Thrown, versatile (1d8)", notes: "A trident is a martial weapon, so rogues aren't proficient. Ask the DM if piracy taught him." }
  ],
  cantrips: ["Mage Hand", "Shape Water", "Booming Blade"],
  // Spells he knows. Arcane Trickster level 3 knows 3; one more enchantment or illusion spell is still to pick.
  prepared: ["Find Familiar", "Illusory Script"],
  extraSpells: [],
  slotsUsed: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  resUsed: {},
  traits: [
    { name: "Ability Score Increase", source: "Human", text: "Your ability scores each increased by 1." },
    { name: "Languages", source: "Human", text: "You speak, read and write Common and one extra language." }
  ],
  feats: [],
  inventory: [
    { name: "Leather Armor", qty: 1, wt: 10, notes: "Thin leather over worn clothes" },
    { name: "Shortsword", qty: 1, wt: 2, notes: "Plain, worn on his left hip" },
    { name: "Trident", qty: 1, wt: 4, notes: "" },
    { name: "Crossbow Bolts", qty: 50, wt: 0.075, notes: "" },
    { name: "Thieves' Tools", qty: 1, wt: 1, notes: "" },
    { name: "Climber's Kit", qty: 1, wt: 12, notes: "" },
    { name: "Hemp Rope (50 ft.)", qty: 1, wt: 10, notes: "" },
    { name: "Rations (1 day)", qty: 2, wt: 2, notes: "" },
    { name: "Crushed-shell Bracelet", qty: 1, wt: 0, notes: "Blue, on his left wrist" },
    { name: "Iron Ring", qty: 1, wt: 0, notes: "Solid iron, on his left index finger" }
  ],
  coins: { cp: 20, sp: 0, ep: 0, gp: 200, pp: 2 },
  attuned: ["", "", ""],
  story: {
    gender: "Male", age: "22", height: "6 ft", weight: "182 lb", eyes: "Green", hair: "Light brown", skin: "Tan",
    faith: "",
    backstory: "A farm boy who lost his family and turned to piracy to escape the family's debts in his childhood town. He left the crew once it was turning chaotic evil, a path he couldn't follow.\n\nSun- and sea-weathered, of average build. A plain shortsword hangs on his left hip, and thin leather armor sits over worn clothes. He wears a blue crushed-shell bracelet on his left wrist and a solid iron ring on his left index finger.",
    personality: "Bitter, resentful, fair, quiet, broody, justice-seeking.",
    ideals: "A life of solitude. Personal freedom above all.",
    bonds: "The sea, his childhood town, and his bracelet. Noctoror Sactr, his bonded black dragon.",
    flaws: "Closed off, passive-aggressive and defensive. He seeks justice wherever he can, and it often crosses into revenge.",
    allies: "",
    notes: ""
  },
  dragon: {
    kind: "black",
    name: "Noctoror Sactr",
    abilities: null,          // null = use the kind's base scores
    hpCurrent: null,          // null = full
    hpTemp: 0,
    breathReady: true,
    guardUsed: false,
    essenceUsed: 0,
    used: {},
    notes: ""
  },
  history: []
};
