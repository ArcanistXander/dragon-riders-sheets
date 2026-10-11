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
      /* From the DM's "The Dragonwarden Subclass" document. Later features stay hidden
         until she reaches their level (hideFuture keeps them out of the level-up table). */
      hideFuture: true,
      domainSpells: { 3: ["Heroism", "Shield"], 5: ["Warding Bond", "Barkskin"], 9: ["Intellect Fortress"], 13: ["Freedom of Movement"], 17: ["Wall of Force"] },
      intWeapons: true,
      resources: (lvl, mods, total) => [
        { id: "runic", name: "Runic Resonance", max: lvl >= 9 && !essenceAt(total) ? Math.max(1, mods.int) : 0, reset: "long",
          note: "Once your dragon has an Essence Pool, each use costs 1 Essence Point instead." }
      ],
      features: {
        3: [
          { name: "Tool Proficiency", text: "You gain proficiency with mason's tools or calligrapher's supplies, which you use to etch wards into scale, stone or hide." },
          { name: "Dragonwarden Spells", text: "Heroism and Shield are always prepared. They count as artificer spells for you but don't count against your prepared spells." },
          { name: "Battle Ready", text: "You gain proficiency with martial weapons. When you attack with a magic weapon, you can use your Intelligence modifier instead of Strength or Dexterity for the attack and damage rolls." },
          { name: "Draconic Warding", text: (c) => `At the end of a long rest, carve Hidecarved Wards into willing dragons within reach: ${window.WARD_CAP(c.lvl)} ward${window.WARD_CAP(c.lvl) > 1 ? "s" : ""} at a time. Spread them one per dragon, or concentrate several on one dragon to stack their effects. A ward works only while the warded dragon is within 60 ft. of your own bonded dragon, and lasts until you carve a replacement or the dragon drops to 0 HP. During a short rest, 10 minutes with your tools reinforces a ward that was disrupted (this doesn't restore HP). Your dragon keeps its own statistics. Track wards on the Infusions & wards tab.` }
        ],
        5: [
          { name: "Dragonwarden Spells", text: "Warding Bond and Hardened Scales (Barkskin) are always prepared." },
          { name: "Extra Attack", text: "You can attack twice, instead of once, whenever you take the Attack action on your turn." },
          { name: "Draconic Warding: 2 wards", text: "You can maintain two Hidecarved Wards, on up to two dragons." }
        ],
        9: [
          { name: "Dragonwarden Spells", text: "Intellect Fortress is always prepared." },
          { name: "Draconic Warding: 3 wards", text: "You can maintain three Hidecarved Wards, on up to three dragons. Ward of Resonance now deals 1d6." },
          { name: "Runic Resonance", text: (c) => `When you hit with a magic weapon attack, or a dragon bearing one of your wards hits, channel energy through the strike: Disruptive Resonance (the target takes an extra ${c.lvl >= 15 ? "4d6" : "2d6"} force) or Restorative Resonance (a creature or object you can see within 30 ft. of the target regains ${c.lvl >= 15 ? "4d6" : "2d6"} HP). Each use costs 1 point from your dragon's Essence Pool. Until your dragon has an Essence Pool, you get ${Math.max(1, c.mod("int"))} uses (INT modifier) per long rest instead.` }
        ],
        13: [{ name: "Dragonwarden Spells", text: "Freedom of Movement is always prepared." }],
        15: [
          { name: "Master Wardcarver", text: (c) => `You can maintain four Hidecarved Wards. Runic Resonance damage and healing rise to 4d6. Every dragon bearing one of your wards gets +1 AC on top of its ward. When Ward of the Bonded Dragonwarden imposes disadvantage, the attacker also takes 1d4 ${c.mod("int") >= 0 ? "+" : "−"} ${Math.abs(c.mod("int"))} force damage.` },
          { name: "Ward of Resonance", text: "Ward of Resonance now deals 1d8." }
        ],
        17: [{ name: "Dragonwarden Spells", text: "Wall of Force is always prepared." }]
      },
      /* Bonus a ward gives the warden's own dragon, for its stat block.
         A ward's target may list several dragons ("Ametrin, Navarre"). */
      dragonBonus: (s, lvl) => {
        const on = ((s.panels || {}).wards || {}).active || {};
        const mine = (k) => on[k] != null && (k === "bonded" || targets(on[k]).some((t) => sameDragon(t, s.dragon.name)));
        let ac = 0; const why = [];
        if (mine("bonded")) { ac += 2; why.push("Bonded ward +2"); }
        else if (mine("deflection")) { ac += 1; why.push("Deflection ward +1"); }
        if (lvl >= 15 && Object.keys(on).some(mine)) { ac += 1; why.push("warded +1"); }
        return { ac, why };
      },
      panels: [
        {
          id: "wards", title: "Hidecarved Wards",
          intro: (c) => `At the end of a long rest, carve up to ${window.WARD_CAP(c.lvl)} ward${window.WARD_CAP(c.lvl) > 1 ? "s" : ""} into willing dragons within reach. Put the same ward on several dragons (list them with commas), or stack different wards on one dragon. A ward works only while its dragon is within 60 ft. of ${c.dragon || "your bonded dragon"}, and ends when you carve a replacement or the dragon drops to 0 HP. During a short rest, 10 minutes with your tools reinforces a disrupted ward. The DM's party sheet tracks wards on other riders' dragons too.`,
          active: (lvl) => window.WARD_CAP(lvl),
          countTargets: true,
          activeLabel: "wards", targetLabel: "Warded dragon(s)", targetPh: "Which dragon? Separate several with commas", defaultTarget: "own",
          options: [
            { key: "deflection", name: "Ward of Deflection", text: "The dragon gets +1 AC while the ward lasts." },
            { key: "resonance", name: "Ward of Resonance", uses: { max: 1, reset: "short" }, text: (c) => `Once per short rest, the dragon's bite or breath weapon deals an extra ${c.lvl >= 15 ? "1d8" : c.lvl >= 9 ? "1d6" : "1d4"} force damage on a hit.` },
            { key: "aegis", name: "Ward of Aegis", text: (c) => `At the start of each combat, the dragon gains ${c.lvl} temporary HP (your artificer level).` },
            { key: "swiftness", name: "Ward of Swiftness", text: "+10 ft. flying speed, or advantage on the dragon's next saving throw each combat (choose when the ward triggers)." },
            { key: "bonded", name: "Ward of the Bonded Dragonwarden", own: true, uses: { max: 1, reset: "short" }, text: (c) => `Your own dragon only. +2 AC instead of +1. Once per short rest, when a creature within 5 ft. of your dragon hits it, use your reaction to give that attack disadvantage.${c.lvl >= 15 ? ` The attacker also takes 1d4 ${c.mod("int") >= 0 ? "+" : "−"} ${Math.abs(c.mod("int"))} force damage.` : ""}` }
          ]
        }
      ]
    }
  }
};

function infKnown(lvl) { return lvl >= 18 ? 12 : lvl >= 14 ? 10 : lvl >= 10 ? 8 : lvl >= 6 ? 6 : lvl >= 2 ? 4 : 0; }
function infItems(lvl) { return lvl >= 18 ? 6 : lvl >= 14 ? 5 : lvl >= 10 ? 4 : lvl >= 6 ? 3 : lvl >= 2 ? 2 : 0; }
function targets(v) { return String(v || "").split(",").map((t) => t.trim()).filter(Boolean); }
/* True once the dragon's size tier unlocks the Essence Pool at this character level. */
function essenceAt(total) {
  const R = window.DRAGON_RULES; if (!R) return false;
  const sizes = R.tiers.map((t) => t.size); let cur = R.tiers[0];
  R.tiers.forEach((t) => { if (total >= t.level) cur = t; });
  return sizes.indexOf(cur.size) >= sizes.indexOf(R.essence.unlockSize);
}
function sameDragon(a, b) { return !!a && !!b && String(a).trim().toLowerCase() === String(b).trim().toLowerCase(); }

/* Shared slot tables used by every caster. */
window.SLOTS_FULL = window.SLOTS_FULL || [
  [], [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1]
];
