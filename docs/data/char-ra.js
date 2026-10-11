/* Ra Veythor — starting state (Fighter 3, Eldritch Knight, High Elf). Class and race from the DM (2026-10-11);
   ability scores, weapons and gear from the Quest Portal player copy, which has no class, race or story filled in yet.
   The live sheet saves its own copy; this is only the first-load default. */
window.CHARACTER_ID = "ra";
window.DEFAULT_ART = { portrait: "art/ra.webp", dragon: "art/ra-dragon.jpg" };
window.DEFAULT_CHARACTER = {
  name: "Ra Veythor",
  player: "Takokat",
  race: "High Elf",
  background: "",
  alignment: "",
  xp: "Milestone",
  classes: [{ id: "fighter", sub: "eldritch", level: 3 }],
  abilities: { str: 16, dex: 15, con: 16, int: 14, wis: 10, cha: 13 },
  saveProf: ["str", "con"],
  saveNote: "Fey Ancestry: advantage on saves against being charmed.",
  // Perception from Keen Senses. The two fighter skills and the background's skills aren't picked on Quest Portal yet.
  skills: { perception: 1 },
  // Quest Portal shows 10 max HP (a blank template value). Average d10 rolls with CON +3 give 31.
  hp: { rolls: [10, 6, 6], misc: 0, current: 31, temp: 0 },
  hitDiceUsed: 0,
  death: { s: 0, f: 0 },
  inspiration: false,
  // Quest Portal shows AC 12 (10 + DEX) and lists no armor. Add armor in the Inventory tab once it's known.
  armor: { name: "None", base: 10, dexCap: null, shield: false, misc: 0, note: "" },
  speed: 30,
  initMisc: 0,
  size: "Medium",
  senses: "Darkvision 60 ft.",
  defenses: "Advantage on saves against being charmed; magic can't put you to sleep.",
  profs: {
    armor: "All armor, shields",
    weapons: "Simple weapons, martial weapons",
    tools: "",
    languages: "Common, Elvish, one more of your choice (High Elf)"
  },
  attacks: [
    { name: "Shortsword", kind: "melee", ability: "finesse", dice: "1d6", type: "piercing", prof: true, magic: 0, range: "", props: "Finesse, light", notes: "" },
    { name: "Dagger", kind: "melee", ability: "finesse", dice: "1d4", type: "piercing", prof: true, magic: 0, range: "20/60", props: "Finesse, light, thrown", notes: "" }
  ],
  // Fire Bolt is on the Quest Portal sheet. An Eldritch Knight 3 knows 2 cantrips, so one is still to pick.
  cantrips: ["Fire Bolt"],
  // Spells known. Eldritch Knight 3 knows 3 (abjuration or evocation, one free pick); none are chosen yet.
  // The Quest Portal spells (Chromatic Orb, Branding Smite, Fireball) are template filler.
  prepared: [],
  extraSpells: [],
  slotsUsed: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  resUsed: {},
  traits: [
    { name: "Fighting Style", source: "Fighter", text: "Not chosen yet: Archery, Defense, Dueling, Great Weapon Fighting, Protection or Two-Weapon Fighting. Edit this entry once Ra picks one." },
    { name: "Ability Score Increase", source: "High Elf", text: "Your Dexterity increased by 2 and your Intelligence by 1." },
    { name: "Darkvision", source: "High Elf", text: "You see in dim light within 60 ft. as if it were bright light, and in darkness as if it were dim light (shades of gray only)." },
    { name: "Keen Senses", source: "High Elf", text: "You have proficiency in the Perception skill." },
    { name: "Fey Ancestry", source: "High Elf", text: "You have advantage on saving throws against being charmed, and magic can't put you to sleep." },
    { name: "Trance", source: "High Elf", text: "You don't sleep. You meditate deeply for 4 hours a day and gain the same benefit a human does from 8 hours of sleep." },
    { name: "Elf Weapon Training", source: "High Elf", text: "You have proficiency with the longsword, shortsword, shortbow and longbow." },
    { name: "Cantrip", source: "High Elf", text: "You know one extra wizard cantrip of your choice, cast with Intelligence. Not chosen yet." },
    { name: "Extra Language", source: "High Elf", text: "You speak, read and write one extra language of your choice." }
  ],
  feats: [],
  inventory: [
    { name: "Shortsword", qty: 1, wt: 2, notes: "" },
    { name: "Dagger", qty: 1, wt: 1, notes: "" },
    { name: "Hemp Rope (50 ft.)", qty: 1, wt: 10, notes: "" },
    { name: "Rations (1 day)", qty: 2, wt: 2, notes: "" }
  ],
  coins: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
  attuned: ["", "", ""],
  story: {
    gender: "Female", age: "", height: "", weight: "", eyes: "Ice blue", hair: "Platinum blonde, worn in many tight braids", skin: "Pale",
    faith: "",
    backstory: "",
    personality: "",
    ideals: "",
    bonds: "Thamior, Ra's bonded copper dragon.",
    flaws: "",
    allies: "",
    notes: ""
  },
  dragon: {
    kind: "copper",
    name: "Thamior",
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
