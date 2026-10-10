/* Corbin Silvervein — starting state (Cleric 3, from the D&D Beyond export).
   The live sheet saves its own copy; this is only the first-load default. */
window.CHARACTER_ID = "corbin";
window.DEFAULT_ART = { portrait: "art/corbin.webp", dragon: "art/corbin-dragon.webp" };
window.DEFAULT_CHARACTER = {
  name: "Corbin Silvervein",
  player: "AlexanderWood68904",
  race: "Stout Halfling",
  background: "Acolyte",
  alignment: "Lawful Good",
  xp: "Milestone",
  classes: [{ id: "cleric", sub: "life", level: 3 }],
  abilities: { str: 8, dex: 14, con: 17, int: 14, wis: 20, cha: 14 },
  saveProf: ["wis", "cha"],
  skills: { insight: 1, medicine: 1, religion: 1 },
  hp: { rolls: [8, 5, 6], misc: 0, current: 28, temp: 0 },
  hitDiceUsed: 0,
  death: { s: 0, f: 0 },
  inspiration: false,
  armor: { name: "Scale Mail", base: 14, dexCap: 2, shield: true, misc: 0, note: "Disadvantage on Stealth" },
  speed: 25,
  initMisc: 0,
  size: "Small",
  senses: "",
  defenses: "Resistance: poison. Advantage on saves vs. being frightened and vs. poison.",
  profs: {
    armor: "Light, medium and heavy armor, shields",
    weapons: "Simple weapons",
    tools: "",
    languages: "Common, Draconic, Dwarvish, Halfling"
  },
  attacks: [
    { name: "Dagger", ability: "finesse", dice: "1d4", type: "piercing", prof: true, notes: "Finesse, light, thrown (20/60)" },
    { name: "Unarmed Strike", ability: "str", dice: "1", type: "bludgeoning", prof: true, notes: "" }
  ],
  cantrips: ["Guidance", "Spare the Dying", "Sacred Flame"],
  prepared: ["Command", "Guiding Bolt", "Healing Word", "Shield of Faith", "Create or Destroy Water", "Hold Person", "Prayer of Healing", "Zone of Truth"],
  slotsUsed: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  resUsed: {},
  traits: [
    { name: "Lucky", source: "Halfling", text: "When you roll a 1 on the d20 for an attack roll, ability check or saving throw, you can reroll the die and must use the new roll." },
    { name: "Brave", source: "Halfling", text: "You have advantage on saving throws against being frightened." },
    { name: "Halfling Nimbleness", source: "Halfling", text: "You can move through the space of any creature that is of a size larger than yours." },
    { name: "Stout Resilience", source: "Stout Halfling", text: "You have advantage on saving throws against poison, and you have resistance against poison damage." },
    { name: "Shelter of the Faithful", source: "Acolyte", text: "You and your companions can receive free healing and care at a temple, shrine or other presence of your faith, and you can call on its priests for help that doesn't endanger them." }
  ],
  feats: [],
  inventory: [
    { name: "Scale Mail", qty: 1, wt: 45, notes: "Equipped" },
    { name: "Shield", qty: 1, wt: 6, notes: "Equipped, +2 AC" },
    { name: "Dagger", qty: 1, wt: 1, notes: "" },
    { name: "Amulet (holy symbol of Bahamut)", qty: 1, wt: 1, notes: "Spellcasting focus" },
    { name: "Potion of Healing", qty: 1, wt: 0.5, notes: "2d4 + 2 HP" },
    { name: "Backpack", qty: 1, wt: 5, notes: "" },
    { name: "Clothes, Common", qty: 1, wt: 3, notes: "" },
    { name: "Vestments", qty: 1, wt: 4, notes: "" },
    { name: "Alms Box", qty: 1, wt: 0, notes: "" },
    { name: "Block of Incense", qty: 2, wt: 0, notes: "" },
    { name: "Censer", qty: 1, wt: 0, notes: "" },
    { name: "Blanket", qty: 1, wt: 3, notes: "" },
    { name: "Candle", qty: 10, wt: 0, notes: "" },
    { name: "Rations (1 day)", qty: 2, wt: 2, notes: "" },
    { name: "Tinderbox", qty: 1, wt: 1, notes: "" },
    { name: "Waterskin", qty: 1, wt: 5, notes: "" }
  ],
  coins: { cp: 0, sp: 0, ep: 0, gp: 15, pp: 0 },
  attuned: ["", "", ""],
  story: {
    gender: "Male", age: "25", height: "3 ft 1 in", weight: "40 lb", eyes: "Light blue", hair: "Black", skin: "",
    faith: "Bahamut, the Platinum Dragon",
    backstory: "As a child my family was murdered and I was adopted by a family that worshipped the platinum dragon Bahamut. Raised in this family, I decided to become a Life cleric of Bahamut. One day my sister mysteriously disappeared without a trace, and I've made my decision to look for her until we are reunited once again.",
    personality: "I can find common ground between the fiercest enemies, empathizing with them and always working toward peace.",
    ideals: "Faith. I trust that my deity will guide my actions. I have faith that if I work hard, things will go well. (Lawful)",
    bonds: "I owe my life to the priest who took me in when my parents died.",
    flaws: "Once I pick a goal, I become obsessed with it to the detriment of everything else in my life.",
    allies: "",
    notes: ""
  },
  dragon: {
    kind: "bronze",
    name: "",
    abilities: null,          // null = use the kind's base scores
    hpCurrent: null,          // null = full
    hpTemp: 0,
    breathReady: true,
    guardUsed: false,
    essenceUsed: 0,
    notes: ""
  },
  history: []
};
