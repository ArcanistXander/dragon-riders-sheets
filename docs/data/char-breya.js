/* Breya — starting state (Artificer 3, Dragonwarden), from her Quest Portal sheet (2026-10-10).
   The live sheet saves its own copy; this is only the first-load default. */
window.CHARACTER_ID = "breya";
window.DEFAULT_ART = { portrait: "art/breya.webp", dragon: "art/breya-dragon.webp" };
window.DEFAULT_CHARACTER = {
  name: "Breya",
  player: "Krispin",
  race: "High Elf",
  background: "Raised in the Eldunari",
  alignment: "Lawful Good",
  xp: "Milestone",
  classes: [{ id: "artificer", sub: "dragonwarden", level: 3 }],
  abilities: { str: 8, dex: 13, con: 17, int: 18, wis: 14, cha: 10 },
  saveProf: ["con", "int"],
  saveNote: "Advantage on saves against being charmed, and magic can't put you to sleep (Fey Ancestry).",
  skills: { arcana: 1, investigation: 1, perception: 1, survival: 1 },
  // Quest Portal showed 18 / 19, which leaves out CON for levels 2–3; the two 4s are the likely rolls.
  hp: { rolls: [8, 4, 4], misc: 0, current: 24, temp: 0 },
  hitDiceUsed: 0,
  death: { s: 0, f: 0 },
  inspiration: false,
  armor: { name: "Dragonrider Armor", base: 10, dexCap: null, shield: false, misc: 0, note: "AC 11 as on Quest Portal" },
  speed: 30,
  initMisc: 0,
  size: "Medium",
  senses: "Darkvision 60 ft.",
  defenses: "Advantage on saves against being charmed. Magic can't put her to sleep.",
  profs: {
    armor: "Light and medium armor, shields",
    weapons: "Simple weapons, martial weapons, longsword, shortsword, shortbow, longbow",
    tools: "Thieves' tools, tinker's tools, calligrapher's supplies",
    languages: "Common, Elvish, Draconic"
  },
  attacks: [
    { name: "Longbow", kind: "ranged", ability: "dex", dice: "1d8", type: "piercing", prof: true, magic: 0, range: "150/600", props: "Ammunition, heavy, two-handed", notes: "18 arrows" },
    { name: "Dagger", kind: "melee", ability: "finesse", dice: "1d4", type: "piercing", prof: true, magic: 0, range: "20/60", props: "Finesse, light, thrown", notes: "" },
    { name: "Light Hammer", kind: "melee", ability: "str", dice: "1d4", type: "bludgeoning", prof: true, magic: 0, range: "20/60", props: "Light, thrown", notes: "" }
  ],
  cantrips: ["Mending"],
  prepared: ["Cure Wounds", "Detect Magic", "Absorb Elements"],
  extraSpells: [
    { name: "Blade Ward", level: 0, notes: "High Elf cantrip (INT). She draws it with the calligraphy pen on her palm." }
  ],
  slotsUsed: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  resUsed: {},
  traits: [
    { name: "Darkvision", source: "Elf", text: "You can see in dim light within 60 ft. as if it were bright light, and in darkness as if it were dim light (shades of gray only)." },
    { name: "Keen Senses", source: "Elf", text: "You have proficiency in the Perception skill." },
    { name: "Fey Ancestry", source: "Elf", text: "You have advantage on saving throws against being charmed, and magic can't put you to sleep." },
    { name: "Trance", source: "Elf", text: "You don't sleep. You meditate deeply for 4 hours a day and gain the same benefit a human does from 8 hours of sleep." },
    { name: "Elf Weapon Training", source: "High Elf", text: "You have proficiency with the longsword, shortsword, shortbow and longbow." },
    { name: "Cantrip", source: "High Elf", text: "You know one wizard cantrip (Blade Ward), cast with Intelligence." },
    { name: "Extra Language", source: "High Elf", text: "You speak, read and write one extra language (Draconic)." }
  ],
  feats: [],
  inventory: [
    { name: "Dragonrider Armor", qty: 1, wt: 0, notes: "Worn. Infused: Armor of Magical Strength" },
    { name: "Longbow", qty: 1, wt: 2, notes: "" },
    { name: "Arrows", qty: 18, wt: 0.05, notes: "" },
    { name: "Dagger", qty: 1, wt: 1, notes: "" },
    { name: "Light Hammer", qty: 1, wt: 2, notes: "" },
    { name: "Thieves' Tools", qty: 1, wt: 1, notes: "Spellcasting focus" },
    { name: "Tinker's Tools", qty: 1, wt: 10, notes: "" },
    { name: "Calligrapher's Supplies", qty: 1, wt: 5, notes: "Carves Hidecarved Wards" },
    { name: "Bag of Holding", qty: 1, wt: 15, notes: "Infused: Replicate Magic Item" },
    { name: "Dragon Bond Diary", qty: 1, wt: 0, notes: "" },
    { name: "Dragonrider Ring", qty: 1, wt: 0, notes: "" },
    { name: "Climber's Kit", qty: 1, wt: 12, notes: "Special pitons, boot tips, gloves and a harness" },
    { name: "Potion of Healing", qty: 2, wt: 0.5, notes: "2d4 + 2 HP" },
    { name: "Potion of Greater Healing", qty: 1, wt: 0.5, notes: "4d4 + 4 HP" },
    { name: "Rations (1 day)", qty: 9, wt: 2, notes: "" }
  ],
  coins: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
  attuned: ["Dragonrider Armor (Armor of Magical Strength)", "", ""],
  magicItems: [
    { name: "Dragonrider Armor (Armor of Magical Strength)", type: "Armor (artificer infusion)", rarity: "", attune: true, attuned: true, text: "Infused by Breya. The charges and effects are tracked on the Infusions & wards tab." },
    { name: "Bag of Holding", type: "Wondrous item (Replicate Magic Item infusion)", rarity: "Uncommon", text: "Holds up to 500 lb, not exceeding 64 cubic ft, but always weighs 15 lb. Retrieving an item takes an action. Placing it inside another extradimensional space destroys both and opens a gate to the Astral Plane." }
  ],
  story: {
    gender: "Female", age: "", height: "5 ft 9 in", weight: "", eyes: "Bright blue", hair: "Brown, fading to light blonde", skin: "Fair",
    faith: "Bahamut, the Platinum Dragon",
    backstory: "Breya has only ever known life in the Dragon order, doing her duties as a Dragonkeeper. She looks like someone who can spend hours repairing equipment, tending animals or keeping up a difficult habitat. Her white uniform with grey accents and intricate platinum embroidery honors the platinum dragon Bahamut and the caring nature of the crystal dragon.",
    personality: "",
    ideals: "",
    bonds: "Ametrin, her bonded amethyst dragon.",
    flaws: "",
    allies: "The Dragon order (Dragonkeepers), raised in the Eldunari.",
    notes: ""
  },
  dragon: {
    kind: "amethyst",
    name: "Ametrin",
    abilities: null,          // null = use the kind's base scores
    hpCurrent: null,          // null = full
    hpTemp: 0,
    breathReady: true,
    guardUsed: false,
    essenceUsed: 0,
    notes: "Understands Draconic and shares a telepathic bond with Breya."
  },
  panelsTab: "Infusions & wards",
  panels: {
    infusions: {
      known: ["magical-strength", "weapon", "homunculus", "replicate"],
      active: { "magical-strength": "Dragonrider Armor (worn)", replicate: "Bag → Bag of Holding" },
      used: {}, charges: {}
    },
    wards: { known: null, active: {}, used: {}, charges: {} }
  },
  history: []
};
