/* Karinya Varis — starting state (Rogue 3, Assassin), from her Quest Portal player copy (2026-10-10).
   The live sheet saves its own copy; this is only the first-load default. */
window.CHARACTER_ID = "karinya";
window.DEFAULT_ART = { portrait: "art/karinya.jpg", dragon: "art/karinya-dragon.webp" };
window.DEFAULT_CHARACTER = {
  name: "Karinya Varis",
  player: "Val",
  race: "Half-Elf",
  background: "Noble",
  alignment: "Lawful Good",
  xp: "Milestone",
  classes: [{ id: "rogue", sub: "assassin", level: 3 }],
  abilities: { str: 10, dex: 18, con: 11, int: 12, wis: 11, cha: 15 },
  saveProf: ["dex", "int"],
  saveNote: "Advantage on saves against being charmed, and magic can't put you to sleep (Fey Ancestry).",
  // Athletics and Insight are her expertise picks on Quest Portal.
  skills: { acrobatics: 1, deception: 1, history: 1, persuasion: 1, sleight: 1, stealth: 1, athletics: 2, insight: 2 },
  // Quest Portal shows 31 max HP. Average d8 rolls with CON +0 give 18, so the other 13 sit in misc until the DM confirms.
  hp: { rolls: [8, 5, 5], misc: 13, current: 31, temp: 0 },
  hitDiceUsed: 0,
  death: { s: 0, f: 0 },
  inspiration: false,
  armor: { name: "No armor", base: 10, dexCap: null, shield: false, misc: 0, note: "AC 14 as on Quest Portal. Leather armor would make it 15." },
  speed: 30,
  initMisc: 0,
  size: "Medium",
  senses: "Darkvision 60 ft.",
  defenses: "Advantage on saves against being charmed. Magic can't put her to sleep.",
  profs: {
    armor: "Light armor",
    weapons: "Simple weapons, hand crossbow, longsword, rapier, shortsword, scimitar, whip",
    tools: "Thieves' tools, disguise kit, poisoner's kit, playing card set",
    languages: "Common, Elvish, Draconic, Thieves' Cant"
  },
  attacks: [
    { name: "Dagger", kind: "melee", ability: "finesse", dice: "1d4", type: "piercing", prof: true, magic: 0, range: "20/60", props: "Finesse, light, thrown", notes: "" },
    { name: "Special Dagger", kind: "melee", ability: "finesse", dice: "1d4", type: "piercing", prof: true, magic: 0, range: "20/60", props: "Finesse, light, thrown", notes: "Ask the DM what makes it special" },
    { name: "Shortsword", kind: "melee", ability: "finesse", dice: "1d6", type: "piercing", prof: true, magic: 0, range: "", props: "Finesse, light", notes: "" },
    { name: "Hand Crossbow", kind: "ranged", ability: "dex", dice: "1d6", type: "piercing", prof: true, magic: 0, range: "30/120", props: "Ammunition, light, loading", notes: "" }
  ],
  cantrips: [],
  prepared: [],
  extraSpells: [],
  slotsUsed: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  resUsed: {},
  traits: [
    { name: "Darkvision", source: "Half-Elf", text: "You can see in dim light within 60 ft. as if it were bright light, and in darkness as if it were dim light (shades of gray only)." },
    { name: "Fey Ancestry", source: "Half-Elf", text: "You have advantage on saving throws against being charmed, and magic can't put you to sleep." },
    { name: "Skill Versatility", source: "Half-Elf", text: "You gain proficiency in two skills of your choice (Athletics and Insight)." },
    { name: "Horns", source: "Heritage", text: "Small horn stubs that set her apart since she was four. Her birth father was a human soldier and her mother an elven princess." },
    { name: "Position of Privilege", source: "Noble", text: "People assume you have the right to be wherever you are. You are welcome in high society, common folk try to accommodate you, and you can get an audience with a local noble if you need one." }
  ],
  feats: [],
  inventory: [
    { name: "Dagger", qty: 1, wt: 1, notes: "" },
    { name: "Special Dagger", qty: 1, wt: 1, notes: "" },
    { name: "Shortsword", qty: 1, wt: 2, notes: "" },
    { name: "Hand Crossbow", qty: 1, wt: 3, notes: "" },
    { name: "Crossbow Bolts", qty: 20, wt: 0.075, notes: "Count not on Quest Portal" },
    { name: "Thieves' Tools", qty: 1, wt: 1, notes: "" },
    { name: "Potion of Healing", qty: 1, wt: 0.5, notes: "2d4 + 2 HP" },
    { name: "Hemp Rope (50 ft.)", qty: 1, wt: 10, notes: "" },
    { name: "Rations (1 day)", qty: 2, wt: 2, notes: "" }
  ],
  coins: { cp: 0, sp: 0, ep: 0, gp: 76, pp: 0 },
  attuned: ["", "", ""],
  story: {
    gender: "Female", age: "25", height: "5 ft 8 in", weight: "", eyes: "Brown", hair: "Black and grey", skin: "White",
    faith: "",
    backstory: "Karinya is the second child of the Varis family, a noble house of Vasselheim that rose from middle-class farmers. Lady Varis left her high-standing family to marry a stable boy, then grew tired of being poor. She struck a deal with an elf tribe: the family would rise to power if they raised the tribe's newborn bastard, the child of a human soldier and an elven princess, as their own. That child was Karinya.\n\nPointed ears and small horn stubs set her apart by age four. Her parents were unkind, but her sisters loved her and stood up for her: Corinth, the eldest, who remembered being poor, and Amlyn, the youngest. Karinya was bullied in private school but always had her siblings. As an adult she kept sneaking into the woods to glimpse the elves, and never did.\n\nOnce the elves learned she hadn't been raised as a true daughter, the family fell out of favor. Corinth was sent off on a quest of arcane cultivation. When dragons returned to the worthy, the Varises planned to send 16-year-old Amlyn to the trials. Karinya slipped out at night to go in her place, leaving only a note. She took what she could steal from the guards' chambers and boarded a boat to the trials.",
    personality: "Despite her noble birth, she doesn't place herself above other folk; everyone has the same blood. Her favor, once lost, is lost forever. Her eloquent flattery makes everyone feel like the most important person in the world.",
    ideals: "Independence: prove she can manage without her family's coddling. Family: blood runs thicker than water. Noble obligation: protect and care for those beneath her.",
    bonds: "Nothing is more important than the other members of her family. Navarre, her bonded moonstone dragon.",
    flaws: "Her words and actions often bring shame to her family. She secretly believes everyone is beneath her.",
    allies: "Her sisters Corinth and Amlyn. House Varis of Vasselheim.",
    notes: ""
  },
  dragon: {
    kind: "moonstone",
    name: "Navarre",
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
