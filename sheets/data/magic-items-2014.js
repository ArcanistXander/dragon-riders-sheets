/* Magic items — D&D 5e (2014 DMG), summarized for table use. Feeds the Magic items tab's quick-add list.
   fx (applied while the item is attuned, or carried when it needs no attunement): ac, saves (bonus to every save),
   noArmor (only while wearing no armor and no shield). 5e rule (DMG, "Combining Game Effects"): two copies of the
   same item don't combine, so only the best one counts; different items, like a Ring and a Cloak of Protection, do.
   stack (optional): group items the DM rules are "the same", so only the best of them counts.
   charges: { max, recharge } is tracked with pips on the tab. */
window.MAGIC_ITEMS = [
  { name: "Bag of Holding", type: "Wondrous item", rarity: "Uncommon", text: "Holds up to 500 lb, not exceeding 64 cubic ft, but always weighs 15 lb. Retrieving an item takes an action. Placing it inside another extradimensional space destroys both and opens a gate to the Astral Plane." },
  { name: "Boots of Elvenkind", type: "Wondrous item", rarity: "Uncommon", text: "Your steps make no sound. You have advantage on Dexterity (Stealth) checks that rely on moving silently." },
  { name: "Cloak of Elvenkind", type: "Wondrous item", rarity: "Uncommon", attune: true, text: "With the hood up, Wisdom (Perception) checks to see you have disadvantage, and you have advantage on Dexterity (Stealth) checks to hide. Raising or lowering the hood takes an action." },
  { name: "Cloak of Protection", type: "Wondrous item", rarity: "Uncommon", attune: true, fx: { ac: 1, saves: 1 }, text: "+1 to AC and saving throws." },
  { name: "Ring of Protection", type: "Ring", rarity: "Rare", attune: true, fx: { ac: 1, saves: 1 }, text: "+1 to AC and saving throws." },
  { name: "Bracers of Defense", type: "Wondrous item", rarity: "Rare", attune: true, fx: { ac: 2, noArmor: true }, text: "+2 AC while you wear no armor and use no shield." },
  { name: "Ioun Stone (Protection)", type: "Wondrous item", rarity: "Rare", attune: true, fx: { ac: 1 }, text: "This rose-pink stone orbits your head: +1 to AC." },
  { name: "Amulet of Natural Armor", type: "Wondrous item", rarity: "Uncommon", attune: true, fx: { ac: 1 }, text: "Homebrew (not in the 5e books). Your skin toughens like hide: +1 to AC (if the DM gives a stronger one, change it with ✎). A second amulet doesn't add more." },
  { name: "Goggles of Night", type: "Wondrous item", rarity: "Uncommon", text: "You have darkvision out to 60 ft. If you already have darkvision, its range increases by 60 ft." },
  { name: "Gauntlets of Ogre Power", type: "Wondrous item", rarity: "Uncommon", attune: true, text: "Your Strength score is 19. No effect if it's already 19 or higher. Change your STR in edit mode while attuned." },
  { name: "Headband of Intellect", type: "Wondrous item", rarity: "Uncommon", attune: true, text: "Your Intelligence score is 19. No effect if it's already 19 or higher. Change your INT in edit mode while attuned." },
  { name: "Amulet of Health", type: "Wondrous item", rarity: "Rare", attune: true, text: "Your Constitution score is 19. No effect if it's already 19 or higher. Change your CON in edit mode while attuned." },
  { name: "Pearl of Power", type: "Wondrous item", rarity: "Uncommon", attune: true, charges: { max: 1, recharge: "Regains its use at dawn" }, text: "Spellcasters only. As an action, regain one expended spell slot of up to 3rd level." },
  { name: "Wand of Magic Missiles", type: "Wand", rarity: "Uncommon", charges: { max: 7, recharge: "Regains 1d6 + 1 charges at dawn. Using the last charge: roll a d20, on a 1 it crumbles." }, text: "Spend 1 charge to cast Magic Missile (1st level), +1 spell level per extra charge." },
  { name: "Wand of Web", type: "Wand", rarity: "Uncommon", attune: true, charges: { max: 7, recharge: "Regains 1d6 + 1 charges at dawn. Using the last charge: roll a d20, on a 1 it crumbles." }, text: "Spellcasters only. Spend 1 charge to cast Web (save DC 15)." },
  { name: "Wand of Secrets", type: "Wand", rarity: "Uncommon", charges: { max: 3, recharge: "Regains 1d3 charges at dawn" }, text: "Spend 1 charge: learn whether any secret doors or traps are within 30 ft, and where the nearest one is." },
  { name: "Immovable Rod", type: "Rod", rarity: "Uncommon", text: "Press the button (action) and the rod is fixed in place. It holds up to 8,000 lb; a creature can move it 10 ft with a DC 30 Strength check." },
  { name: "Rope of Climbing", type: "Wondrous item", rarity: "Uncommon", text: "60 ft of silk rope that moves, knots and fastens itself on command." },
  { name: "Driftglobe", type: "Wondrous item", rarity: "Uncommon", text: "Command words cast Light or Daylight (once per day) from the globe, and it can hover and follow you." },
  { name: "Sending Stones", type: "Wondrous item", rarity: "Uncommon", charges: { max: 1, recharge: "Regains its use at dawn" }, text: "A pair. Touch one to cast Sending to whoever holds the other." },
  { name: "Alchemy Jug", type: "Wondrous item", rarity: "Uncommon", text: "As an action, name a liquid (water, wine, acid, mayonnaise…) and the jug fills with it. Resets at dawn." },
  { name: "Decanter of Endless Water", type: "Wondrous item", rarity: "Uncommon", text: "Speak a command word to pour fresh or salt water: stream (1 gal), fountain (5 gal) or geyser (30 gal, 30 ft long, DC 13 STR save or knocked prone)." },
  { name: "Lantern of Revealing", type: "Wondrous item", rarity: "Uncommon", text: "While lit, invisible creatures and objects within 30 ft become visible." },
  { name: "Eyes of the Eagle", type: "Wondrous item", rarity: "Uncommon", attune: true, text: "Advantage on Wisdom (Perception) checks that rely on sight; you can see clearly up to 1 mile." },
  { name: "Gloves of Thievery", type: "Wondrous item", rarity: "Uncommon", text: "These gloves are invisible while worn. +5 to Dexterity (Sleight of Hand) checks and checks to pick locks." },
  { name: "Hat of Disguise", type: "Wondrous item", rarity: "Uncommon", attune: true, text: "Cast Disguise Self at will. The spell ends if the hat is removed." },
  { name: "Periapt of Wound Closure", type: "Wondrous item", rarity: "Uncommon", attune: true, text: "You stabilize automatically at the start of your turn when dying. Hit dice you spend heal double." },
  { name: "Weapon, +1", type: "Weapon", rarity: "Uncommon", text: "+1 to attack and damage rolls. Set the magic bonus with ✎ on the Attacks tab." },
  { name: "Armor, +1", type: "Armor", rarity: "Rare", text: "+1 AC. On the Inventory tab, use ✎ on the armor and set its magic bonus." },
  { name: "Shield, +1", type: "Armor", rarity: "Uncommon", text: "+1 AC on top of the shield's normal +2. On the Inventory tab, use ✎ on the shield and set its magic bonus." },
  { name: "Spell Scroll", type: "Scroll", rarity: "Varies", text: "Cast the spell written on it without components, then the scroll crumbles. If the spell isn't on your class list, you can't read it." }
];

/* Healing potions (2014 DMG). Drinking one takes an action; feeding it to another creature also takes an action. */
window.HEALING_POTIONS = [
  { name: "Potion of Healing", rarity: "Common", dice: "2d4+2", match: /^(potion of )?healing( potion)?$/i },
  { name: "Potion of Greater Healing", rarity: "Uncommon", dice: "4d4+4", match: /greater/i },
  { name: "Potion of Superior Healing", rarity: "Rare", dice: "8d4+8", match: /superior/i },
  { name: "Potion of Supreme Healing", rarity: "Very rare", dice: "10d4+20", match: /supreme/i }
];
