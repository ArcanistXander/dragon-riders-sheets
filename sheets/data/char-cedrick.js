/* Cedrick — starting state (Monk 2 / Fighter 1, Protector Aasimar, Folk Hero). Classes, race and background from the DM (2026-10-11).
   Ability scores are the standard array plus Aasimar bonuses (placeholders for the DM);
   the Protector subrace is still to confirm. Skills set by the DM. Fighting style Blind Fighting (Tasha's) per the DM.
   The live sheet saves its own copy; this is only the first-load default. */
window.CHARACTER_ID = "cedrick";
window.DEFAULT_ART = { portrait: "art/cedrick.webp", dragon: "art/cedrick-dragon.webp" };
/* Aasimar once-per-long-rest features, shown with the class trackers. */
window.RACE_RESOURCES = (total) => [
  { id: "healhands", name: "Healing Hands", max: 1, reset: "long", note: `Action: touch a creature to restore ${total} hit points.` },
  { id: "radsoul", name: "Radiant Soul", max: total >= 3 ? 1 : 0, reset: "long", note: `Action: for 1 minute, fly 30 ft. and deal +${total} radiant damage to one target you hit each turn.` }
];
window.DEFAULT_CHARACTER = {
  name: "Cedrick",
  player: "",
  race: "Aasimar (Protector)",
  background: "Folk Hero",
  alignment: "",
  xp: "Milestone",
  // Monk first: its saving throws and full proficiencies; Fighter gives only its multiclass proficiencies.
  classes: [{ id: "monk", sub: "", level: 2 }, { id: "fighter", sub: "", level: 1 }],
  abilities: { str: 12, dex: 15, con: 13, int: 10, wis: 15, cha: 10 },   // standard array, then Aasimar CHA +2 and Protector WIS +1
  saveProf: ["str", "dex"],
  // Skills set by the DM: Animal Handling and Survival (Folk Hero), plus Acrobatics, Athletics, Perception and Stealth.
  skills: { acrobatics: 1, animal: 1, athletics: 1, perception: 1, stealth: 1, survival: 1 },
  // Monk d8 at 1st level (max), then average rolls: monk 5, fighter 6. CON adds per level (22).
  // The DM set his max HP to 24, so misc carries the +2.
  hp: { rolls: [8, 5, 6], misc: 2, current: 24, temp: 0 },
  hitDiceUsed: 0,
  death: { s: 0, f: 0 },
  inspiration: false,
  armor: { name: "None", base: 10, dexCap: null, shield: false, misc: 0, note: "" },
  speed: 30,
  initMisc: 0,
  size: "Medium",
  senses: "Blindsight 10 ft. (Blind Fighting), darkvision 60 ft.",
  defenses: "Resistance to necrotic and radiant damage (Celestial Resistance).",
  profs: {
    armor: "Light armor, medium armor, shields (from Fighter; armor turns off Unarmored Defense and Martial Arts)",
    weapons: "Simple weapons, shortswords, martial weapons",
    tools: "One type of artisan's tools (Folk Hero, not chosen yet), vehicles (land)",
    languages: "Common, Celestial"
  },
  attacks: [
    { name: "Unarmed Strike", kind: "melee", ability: "finesse", dice: "1d4", type: "bludgeoning", prof: true, magic: 0, range: "", props: "Martial Arts", notes: "Bonus-action strike after the Attack action; Flurry of Blows for 1 ki." },
    { name: "Quarterstaff", kind: "melee", ability: "finesse", dice: "1d6", type: "bludgeoning", prof: true, magic: 0, range: "", props: "Versatile (1d8), monk weapon", notes: "" }
  ],
  cantrips: [],
  prepared: [],
  extraSpells: [{ name: "Light", level: 0, ability: "cha", notes: "Light Bearer (Aasimar). Cast at will; no spell slot." }],
  slotsUsed: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  resUsed: {},
  traits: [
    { name: "Fighting Style: Blind Fighting", source: "Fighter", text: "You have blindsight with a range of 10 ft. Within that range you can see anything that isn't behind total cover, even if you're blinded or in darkness, and you can see an invisible creature unless it successfully hides from you. (Tasha's Cauldron of Everything.)" },
    { name: "Ability Score Increase", source: "Aasimar", text: "Your Charisma increased by 2, and your Wisdom by 1 (Protector)." },
    { name: "Darkvision", source: "Aasimar", text: "You see in dim light within 60 ft. as if it were bright light, and in darkness as if it were dim light (shades of gray only)." },
    { name: "Celestial Resistance", source: "Aasimar", text: "You have resistance to necrotic damage and radiant damage." },
    { name: "Healing Hands", source: "Aasimar", text: "As an action, touch a creature and it regains hit points equal to your level (3). Once per long rest; tracked under Trackers." },
    { name: "Light Bearer", source: "Aasimar", text: "You know the Light cantrip. Charisma is your spellcasting ability for it." },
    { name: "Radiant Soul", source: "Aasimar (Protector)", text: "As an action, unleash the divine energy within you for 1 minute: glimmering wings give you a flying speed of 30 ft., and once on each of your turns you deal extra radiant damage equal to your level (3) to one target you hit with an attack or a spell. Ends early if you use a bonus action to end it. Once per long rest; tracked under Trackers." },
    { name: "Languages", source: "Aasimar", text: "You speak, read and write Common and Celestial." },
    { name: "Rustic Hospitality", source: "Folk Hero", text: "You fit in among common folk. You can find a place to hide, rest or recover among commoners, unless you've shown yourself a danger to them. They shield you from the law or anyone else searching for you, but won't risk their lives for you." },
    { name: "Defining Event", source: "Folk Hero", text: "Not chosen yet: the moment that marked Cedrick as a hero of the common people. Write it in the Story tab." }
  ],
  feats: [],
  inventory: [
    { name: "Quarterstaff", qty: 1, wt: 4, notes: "" },
    { name: "Prayer Beads", qty: 1, wt: 0, notes: "" },
    { name: "Artisan's tools (your choice)", qty: 1, wt: 5, notes: "Folk Hero" },
    { name: "Shovel", qty: 1, wt: 5, notes: "Folk Hero" },
    { name: "Iron pot", qty: 1, wt: 10, notes: "Folk Hero" },
    { name: "Common clothes", qty: 1, wt: 3, notes: "Folk Hero" },
    { name: "Belt pouch", qty: 1, wt: 1, notes: "Folk Hero" }
  ],
  coins: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 },
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
