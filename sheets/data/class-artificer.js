/* Artificer — D&D 5e (Tasha's Cauldron of Everything, 2014-era rules) plus the
   campaign's homebrew Dragonwarden specialist. Feature text is summarized for table use.
   A feature's `text` may be a function (ctx) => string, where ctx carries
   { lvl (class level), total (character level), pb, mod(ability) }.
   `panels` adds the "Infusions & wards" tab: options a character turns on and off,
   with what each one is placed on (an object, a dragon). */
window.CLASSES = window.CLASSES || {};

/* Wards a Dragonwarden can keep active at once (matches the DM's party sheet). */
window.WARD_CAP = (lvl) => (lvl >= 15 ? 4 : lvl >= 9 ? 3 : lvl >= 5 ? 2 : lvl >= 3 ? 1 : 0);

window.CLASSES.artificer = {
  name: "Artificer",
  hitDie: 8,
  saves: ["con", "int"],
  spellcasting: { ability: "int", progression: "half", list: "artificer", prepares: true },
  cantripsKnown: [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4],
  asiLevels: [4, 8, 12, 16, 19],
  multiclassReq: "INT 13",
  multiclassProfs: "Light armor, medium armor, shields, thieves' tools, tinker's tools",
  preparedCount: (lvl, mods) => Math.max(1, mods.int + Math.floor(lvl / 2)),
  prepLabel: "half your artificer level",
  spellTip: "Artificers don't learn spells one at a time. You can prepare any spell on the artificer list (INT modifier + half your artificer level), and you can change them after every long rest. Your specialist spells are always prepared for free. You cast through thieves' tools, artisan's tools or an infused item.",
  resources: (lvl, mods) => [
    { id: "flash", name: "Flash of Genius", max: lvl >= 7 ? Math.max(1, mods.int) : 0, reset: "long",
      note: `Reaction: add +${mods.int} to a check or save by you or a creature within 30 ft.` }
  ],
  features: {
    1: [
      { name: "Magical Tinkering", text: (c) => `Action, with thieves' or artisan's tools: give a Tiny nonmagical object one minor magical property (light, a recorded message, an odor or sound, or a still image). Up to ${Math.max(1, c.mod("int"))} objects at once (INT modifier).` },
      { name: "Spellcasting", text: (c) => `Prepare ${Math.max(1, c.mod("int") + Math.floor(c.lvl / 2))} artificer spells (INT mod + half artificer level) after each long rest. Spell save DC ${8 + c.pb + c.mod("int")}, spell attack +${c.pb + c.mod("int")}. You need thieves' tools, artisan's tools or an infused item in hand as your focus. Prepared spells with the ritual tag can be cast as rituals.` }
    ],
    2: [
      { name: "Infuse Item", text: (c) => `After a long rest, touch nonmagical objects and turn them into magic items with infusions you know. You know ${infKnown(c.lvl)} infusions and can have ${infItems(c.lvl)} infused items at once. An object holds one infusion. When you go over the limit, the oldest infusion ends. Track them on the Infusions & wards tab.` }
    ],
    3: [
      { name: "Artificer Specialist", text: "You choose a specialty. Breya is a Dragonwarden (homebrew)." },
      { name: "The Right Tool for the Job", text: "With thieves' or artisan's tools in hand, spend 1 hour of uninterrupted work (it can be part of a short or long rest) to make one set of artisan's tools. It vanishes if you use this again." }
    ],
    4: [{ name: "Ability Score Improvement", text: "Increase one ability score by 2, or two scores by 1 (max 20), or take a feat.", asi: true }],
    6: [{ name: "Tool Expertise", text: "Your proficiency bonus is doubled for any ability check that uses a tool you're proficient with." }],
    7: [{ name: "Flash of Genius", text: (c) => `Reaction when you or a creature within 30 ft. makes an ability check or saving throw: add +${c.mod("int")} (INT modifier). ${Math.max(1, c.mod("int"))} uses per long rest.` }],
    8: [{ name: "Ability Score Improvement", text: "Increase one ability score by 2, or two scores by 1 (max 20), or take a feat.", asi: true }],
    10: [
      { name: "Magic Item Adept", text: "You can attune to up to four magic items at once. Crafting a common or uncommon magic item takes a quarter of the time and half the gold." },
      { name: "Cantrip Known", text: "You learn a third artificer cantrip.", cantrip: true }
    ],
    11: [{ name: "Spell-Storing Item", text: (c) => `After a long rest, store a 1st- or 2nd-level artificer spell (casting time 1 action) in a weapon or focus. Anyone holding it can cast the spell with your modifier. ${Math.max(2, 2 * c.mod("int"))} uses (twice your INT modifier).` }],
    12: [{ name: "Ability Score Improvement", text: "Increase one ability score by 2, or two scores by 1 (max 20), or take a feat.", asi: true }],
    14: [
      { name: "Magic Item Savant", text: "You can attune to five magic items at once and ignore all class, race, spell and level requirements on attuning to or using magic items." },
      { name: "Cantrip Known", text: "You learn a fourth artificer cantrip.", cantrip: true }
    ],
    16: [{ name: "Ability Score Improvement", text: "Increase one ability score by 2, or two scores by 1 (max 20), or take a feat.", asi: true }],
    18: [{ name: "Magic Item Master", text: "You can attune to six magic items at once." }],
    19: [{ name: "Ability Score Improvement", text: "Increase one ability score by 2, or two scores by 1 (max 20), or take a feat.", asi: true }],
    20: [{ name: "Soul of Artifice", text: "+1 to all saving throws per magic item you're attuned to. When you drop to 0 HP, you can end one infusion to drop to 1 HP instead." }]
  },
  panels: [
    {
      id: "infusions", title: "Infusions",
      intro: (c) => `After a long rest you can touch nonmagical objects and infuse them. You know ${infKnown(c.lvl)} infusions and can keep ${infItems(c.lvl)} infused items at once. An object can carry only one infusion. If an infused Bag of Holding loses its infusion, what was inside spills out harmlessly.`,
      known: (lvl) => infKnown(lvl), active: (lvl) => infItems(lvl),
      activeLabel: "infused items", targetLabel: "Infused object", targetPh: "Which object?",
      options: [
        { key: "arcane-focus", name: "Enhanced Arcane Focus", lvl: 2, text: (c) => `Rod, staff or wand (attunement): +${c.lvl >= 10 ? 2 : 1} to spell attack rolls, and your spell attacks ignore half cover.` },
        { key: "defense", name: "Enhanced Defense", lvl: 2, text: (c) => `Armor or a shield: +${c.lvl >= 10 ? 2 : 1} AC while wearing or wielding it.` },
        { key: "weapon", name: "Enhanced Weapon", lvl: 2, text: (c) => `Simple or martial weapon: +${c.lvl >= 10 ? 2 : 1} to attack and damage rolls with it. Set the magic bonus on the Attacks tab.` },
        { key: "homunculus", name: "Homunculus Servant", lvl: 2, text: "Needs a gem or crystal worth at least 100 gp. Creates a tiny construct servant that acts on your turn and can deliver your touch spells. Mending heals it 2d6. Stat block: Tasha's Cauldron, p. 22." },
        { key: "mind-sharpener", name: "Mind Sharpener", lvl: 2, text: "Armor or robes (4 charges, regains 1d4 at dawn): when the wearer fails a concentration save, spend a charge as a reaction to succeed instead." },
        { key: "repeating", name: "Repeating Shot", lvl: 2, text: "Ammunition weapon (attunement): +1 to attack and damage, ignores the loading property, and makes its own magic ammunition." },
        { key: "replicate", name: "Replicate Magic Item", lvl: 2, text: "Turn an object into a copy of a magic item from the artificer list (for example Bag of Holding, Goggles of Night, Alchemy Jug). The list grows at levels 6, 10 and 14. Tasha's Cauldron, p. 23." },
        { key: "returning", name: "Returning Weapon", lvl: 2, text: "Thrown weapon: +1 to attack and damage, and it flies back to your hand right after the attack." },
        { key: "winding-path", name: "Boots of the Winding Path", lvl: 6, text: "Boots (attunement): bonus action to teleport up to 15 ft. back to a space you occupied this turn." },
        { key: "radiant", name: "Radiant Weapon", lvl: 6, text: "Weapon (attunement, 4 charges, regains 1d4 at dawn): +1 to attack and damage, sheds light on command, and a reaction to blind an attacker (CON save)." },
        { key: "repulsion", name: "Repulsion Shield", lvl: 6, text: "Shield (attunement, 4 charges, regains 1d4 at dawn): +1 AC, and a reaction to push a melee attacker 15 ft." },
        { key: "resistant", name: "Resistant Armor", lvl: 6, text: "Armor (attunement): resistance to one damage type chosen at infusion (acid, cold, fire, force, lightning, necrotic, poison, psychic, radiant or thunder)." },
        { key: "refueling", name: "Spell-Refueling Ring", lvl: 6, text: "Ring (attunement): once per dawn, recover one spell slot of 3rd level or lower as an action." },
        { key: "magical-strength", name: "Armor of Magical Strength", lvl: 10, charges: { max: 6, note: "Regains 1d6 charges at dawn." }, text: "Armor (attunement, 6 charges): spend a charge to add your INT modifier to a Strength check or save, or as a reaction to avoid being knocked prone." },
        { key: "awareness", name: "Helm of Awareness", lvl: 10, text: "Helmet (attunement): advantage on initiative, and you can't be surprised while not incapacitated." },
        { key: "propulsion", name: "Arcane Propulsion Armor", lvl: 14, text: "Armor (attunement): +5 ft. speed, gauntlets become magic thrown weapons (1d8 force, return), and the armor can't be removed against your will." }
      ]
    }
  ],
  subclasses: {
    dragonwarden: {
      name: "Dragonwarden",
      alwaysLabel: "Dragonwarden",
      domainSpells: { 3: ["Heroism", "Shield"] },
      intWeapons: true,
      features: {
        3: [
          { name: "Tool Proficiency", text: "You gain proficiency with mason's tools or calligrapher's supplies, which you use to etch wards into scale, stone or hide." },
          { name: "Dragonwarden Spells", text: "Heroism and Shield are always prepared and don't count against your prepared spells." },
          { name: "Warden's Training", text: "You gain proficiency with martial weapons. When you attack with a magic weapon, you can use your Intelligence modifier instead of Strength or Dexterity for the attack and damage rolls." },
          { name: "Draconic Warding", text: (c) => `At the end of a long rest, carve Hidecarved Wards into willing dragons within reach: ${window.WARD_CAP(c.lvl)} ward${window.WARD_CAP(c.lvl) > 1 ? "s" : ""} at a time. A ward works only while you're within 60 ft. of the dragon and lasts until you carve a new one or the dragon drops to 0 HP. Re-carving a broken ward takes 10 minutes. The dragon keeps its own statistics. Track wards on the Infusions & wards tab.` }
        ],
        5: [{ name: "Draconic Warding (2 wards)", text: "You can keep two Hidecarved Wards active. Ask the DM about the rest of this level's Dragonwarden features." }],
        9: [{ name: "Draconic Warding (3 wards)", text: "You can keep three Hidecarved Wards active, and Ward of Resonance deals 1d6. Ask the DM about the rest of this level's Dragonwarden features." }],
        15: [{ name: "Draconic Warding (4 wards)", text: "You can keep four Hidecarved Wards active, Ward of Resonance deals 1d8, and every warded dragon gets +1 AC. Ask the DM about the rest of this level's Dragonwarden features." }]
      },
      /* Bonus a ward gives the warden's own dragon, for its stat block. */
      dragonBonus: (s, lvl) => {
        const on = ((s.panels || {}).wards || {}).active || {};
        const mine = (k) => on[k] != null && (k === "bonded" || sameDragon(on[k], s.dragon.name));
        let ac = 0; const why = [];
        if (mine("bonded")) { ac += 2; why.push("Bonded ward +2"); }
        else if (mine("deflection")) { ac += 1; why.push("Deflection ward +1"); }
        if (lvl >= 15 && Object.keys(on).some(mine)) { ac += 1; why.push("warded +1"); }
        return { ac, why };
      },
      panels: [
        {
          id: "wards", title: "Hidecarved Wards",
          intro: (c) => `At the end of a long rest, carve wards into willing dragons within reach: ${window.WARD_CAP(c.lvl)} active at a time, one per dragon. A ward works only while you're within 60 ft. of the dragon, and ends when you carve a replacement or the dragon drops to 0 HP. Re-carving a broken ward (once the dragon is stable) takes 10 minutes. The DM's party sheet tracks wards on other riders' dragons too.`,
          active: (lvl) => window.WARD_CAP(lvl),
          activeLabel: "wards", targetLabel: "Warded dragon", targetPh: "Which dragon?", defaultTarget: "own",
          options: [
            { key: "deflection", name: "Ward of Deflection", text: "The dragon gets +1 AC while the ward lasts." },
            { key: "resonance", name: "Ward of Resonance", uses: { max: 1, reset: "short" }, text: (c) => `Once per short rest, the dragon's bite or breath weapon deals an extra ${c.lvl >= 15 ? "1d8" : c.lvl >= 9 ? "1d6" : "1d4"} force damage on a hit.` },
            { key: "aegis", name: "Ward of Aegis", text: (c) => `At the start of each combat, the dragon gains ${c.lvl} temporary HP (your artificer level).` },
            { key: "swiftness", name: "Ward of Swiftness", text: "Choose when you carve it: +10 ft. flying speed, or advantage on the dragon's first saving throw each combat." },
            { key: "bonded", name: "Ward of the Bonded Dragonwarden", own: true, uses: { max: 1, reset: "short" }, text: "Your own dragon only. +2 AC instead of +1. Once per short rest, when a creature within 5 ft. of your dragon hits it, use your reaction to give that attack disadvantage." }
          ]
        }
      ]
    }
  }
};

function infKnown(lvl) { return lvl >= 18 ? 12 : lvl >= 14 ? 10 : lvl >= 10 ? 8 : lvl >= 6 ? 6 : lvl >= 2 ? 4 : 0; }
function infItems(lvl) { return lvl >= 18 ? 6 : lvl >= 14 ? 5 : lvl >= 10 ? 4 : lvl >= 6 ? 3 : lvl >= 2 ? 2 : 0; }
function sameDragon(a, b) { return !!a && !!b && String(a).trim().toLowerCase() === String(b).trim().toLowerCase(); }

/* Shared slot tables used by every caster. */
window.SLOTS_FULL = window.SLOTS_FULL || [
  [], [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1]
];
