/* Haratio — starting state (Paladin 3, Oath of Vengeance), from his Quest Portal player copy (2026-10-10).
   The live sheet saves its own copy; this is only the first-load default. */
window.CHARACTER_ID = "haratio";
window.DEFAULT_ART = { portrait: "art/haratio.webp", dragon: "art/haratio-dragon.webp" };
window.DEFAULT_CHARACTER = {
  name: "Haratio",
  player: "H1arr",
  race: "Human",
  background: "Haunted One",
  alignment: "Lawful Neutral",
  xp: "Milestone",
  classes: [{ id: "paladin", sub: "vengeance", level: 3 }],
  abilities: { str: 14, dex: 5, con: 16, int: 11, wis: 10, cha: 15 },
  saveProf: ["wis", "cha"],
  saveNote: "Immune to disease (Divine Health).",
  skills: { insight: 1, investigation: 1, persuasion: 1, survival: 1 },
  // Quest Portal shows 26 max HP. Average d10 rolls with CON +3 give 31, so the −5 gap sits in misc until the DM confirms.
  hp: { rolls: [10, 6, 6], misc: -5, current: 17, temp: 0 },
  hitDiceUsed: 0,
  death: { s: 0, f: 0 },
  inspiration: false,
  armor: { name: "Chain Mail", base: 16, dexCap: 0, shield: false, misc: 0, note: "Disadvantage on Stealth" },
  speed: 30,
  initMisc: 0,
  size: "Medium",
  senses: "",
  defenses: "Immune to disease.",
  profs: {
    armor: "All armor, shields",
    weapons: "Simple weapons, martial weapons",
    tools: "",
    languages: "Common, Draconic, Infernal"
  },
  attacks: [
    { name: "Greatsword", kind: "melee", ability: "str", dice: "2d6", type: "slashing", prof: true, magic: 0, range: "", props: "Heavy, two-handed", notes: "Great Weapon Fighting: reroll 1s and 2s on the damage dice" },
    { name: "Battleaxe", kind: "melee", ability: "str", dice: "1d8", type: "slashing", prof: true, magic: 0, range: "", props: "Versatile (1d10)", notes: "Great Weapon Fighting applies when used two-handed" },
    { name: "Dagger", kind: "melee", ability: "finesse", dice: "1d4", type: "piercing", prof: true, magic: 0, range: "20/60", props: "Finesse, light, thrown", notes: "" }
  ],
  cantrips: [],
  prepared: [],
  extraSpells: [],
  slotsUsed: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  resUsed: {},
  traits: [
    { name: "Fighting Style: Great Weapon Fighting", source: "Paladin", text: "When you roll a 1 or 2 on a damage die for an attack with a melee weapon you are wielding with two hands, you can reroll the die and must use the new roll. The weapon must have the two-handed or versatile property." },
    { name: "Heart of Darkness", source: "Haunted One", text: "Those who look into your eyes can see that you have faced unimaginable horror. Common folk don't fear you, but they extend every courtesy and do their utmost to help you, even taking up arms to fight beside you against a threat." }
  ],
  feats: [],
  inventory: [
    { name: "Chain Mail", qty: 1, wt: 55, notes: "Worn. Needs STR 13" },
    { name: "Greatsword", qty: 1, wt: 6, notes: "" },
    { name: "Battleaxe", qty: 1, wt: 4, notes: "" },
    { name: "Dagger", qty: 1, wt: 1, notes: "" },
    { name: "Hemp Rope (50 ft.)", qty: 1, wt: 10, notes: "" },
    { name: "Rations (1 day)", qty: 2, wt: 2, notes: "" }
  ],
  coins: { cp: 0, sp: 0, ep: 0, gp: 45, pp: 2 },
  attuned: ["", "", ""],
  story: {
    gender: "Male", age: "28", height: "6 ft 6 in", weight: "216 lb", eyes: "Orange", hair: "Long, black", skin: "White",
    faith: "",
    backstory: "",
    personality: "",
    ideals: "",
    bonds: "His bonded crystal dragon.",
    flaws: "Dark urges that he fights to keep in check.",
    allies: "",
    notes: ""
  },
  dragon: {
    kind: "crystal",
    name: "",
    abilities: null,          // null = use the kind's base scores
    hpCurrent: null,          // null = full
    hpTemp: 0,
    breathReady: true,
    guardUsed: false,
    essenceUsed: 0,
    used: {},
    corrupted: false,
    notes: ""
  },
  history: []
};
/* Haratio starts at level 3, but his oath wasn't picked on Quest Portal. This history entry lets
   Options → "Undo last level-up" return him to Paladin 2, so the level-up wizard can pick the oath again. */
(function () {
  const d = window.DEFAULT_CHARACTER;
  const snap = JSON.parse(JSON.stringify(d));
  delete snap.history;
  snap.classes = [{ id: "paladin", sub: "", level: 2 }];
  snap.hp.rolls = [10, 6];
  snap.hp.current = 17;
  d.history = [{ at: Date.UTC(2026, 9, 10, 18), from: 2, to: 3, summary: "Paladin 3 · Oath of Vengeance (set up from Quest Portal)", snapshot: snap }];
})();
