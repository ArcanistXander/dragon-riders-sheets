/* Cedrick — starting state (Monk 2 / Fighter 1). Classes from the DM (2026-10-11).
   Everything else is a placeholder for the DM to fill in: ability scores use the standard array,
   race, background, skills and fighting style aren't picked yet.
   The live sheet saves its own copy; this is only the first-load default. */
window.CHARACTER_ID = "cedrick";
window.DEFAULT_ART = { portrait: "art/cedrick.webp", dragon: "art/cedrick-dragon.webp" };
window.DEFAULT_CHARACTER = {
  name: "Cedrick",
  player: "",
  race: "",
  background: "",
  alignment: "",
  xp: "Milestone",
  // Monk first: its saving throws and full proficiencies; Fighter gives only its multiclass proficiencies.
  classes: [{ id: "monk", sub: "", level: 2 }, { id: "fighter", sub: "", level: 1 }],
  abilities: { str: 12, dex: 15, con: 13, int: 10, wis: 14, cha: 8 },
  saveProf: ["str", "dex"],
  skills: {},
  // Monk d8 at 1st level (max), then average rolls: monk 5, fighter 6. CON adds per level.
  hp: { rolls: [8, 5, 6], misc: 0, current: 22, temp: 0 },
  hitDiceUsed: 0,
  death: { s: 0, f: 0 },
  inspiration: false,
  armor: { name: "None", base: 10, dexCap: null, shield: false, misc: 0, note: "" },
  speed: 30,
  initMisc: 0,
  size: "Medium",
  senses: "",
  defenses: "",
  profs: {
    armor: "Light armor, medium armor, shields (from Fighter; armor turns off Unarmored Defense and Martial Arts)",
    weapons: "Simple weapons, shortswords, martial weapons",
    tools: "",
    languages: "Common"
  },
  attacks: [
    { name: "Unarmed Strike", kind: "melee", ability: "finesse", dice: "1d4", type: "bludgeoning", prof: true, magic: 0, range: "", props: "Martial Arts", notes: "Bonus-action strike after the Attack action; Flurry of Blows for 1 ki." },
    { name: "Quarterstaff", kind: "melee", ability: "finesse", dice: "1d6", type: "bludgeoning", prof: true, magic: 0, range: "", props: "Versatile (1d8), monk weapon", notes: "" }
  ],
  cantrips: [],
  prepared: [],
  extraSpells: [],
  slotsUsed: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  resUsed: {},
  traits: [
    { name: "Fighting Style", source: "Fighter", text: "Not chosen yet: Archery, Defense, Dueling, Great Weapon Fighting, Protection or Two-Weapon Fighting. Edit this entry once Cedrick picks one." }
  ],
  feats: [],
  inventory: [
    { name: "Quarterstaff", qty: 1, wt: 4, notes: "" },
    { name: "Prayer Beads", qty: 1, wt: 0, notes: "" }
  ],
  coins: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
  attuned: ["", "", ""],
  story: {
    gender: "Male", age: "", height: "", weight: "", eyes: "Violet", hair: "None (shaved head)", skin: "",
    faith: "",
    backstory: "",
    personality: "",
    ideals: "",
    bonds: "His bonded emerald dragon.",
    flaws: "",
    allies: "",
    notes: "Violet sigil tattoos across the head and brow."
  },
  dragon: {
    kind: "emerald",
    name: "Emerald Hatchling",
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
