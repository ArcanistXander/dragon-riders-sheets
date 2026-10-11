/* Weapons — D&D 5e (2014 PHB).
   Row: [name, category, kind, damage, damage type, properties, range (ft, normal/long)] */
window.WEAPONS = [
  ["Club", "simple", "melee", "1d4", "bludgeoning", "Light", ""],
  ["Dagger", "simple", "melee", "1d4", "piercing", "Finesse, light, thrown", "20/60"],
  ["Greatclub", "simple", "melee", "1d8", "bludgeoning", "Two-handed", ""],
  ["Handaxe", "simple", "melee", "1d6", "slashing", "Light, thrown", "20/60"],
  ["Javelin", "simple", "melee", "1d6", "piercing", "Thrown", "30/120"],
  ["Light Hammer", "simple", "melee", "1d4", "bludgeoning", "Light, thrown", "20/60"],
  ["Mace", "simple", "melee", "1d6", "bludgeoning", "", ""],
  ["Quarterstaff", "simple", "melee", "1d6", "bludgeoning", "Versatile (1d8)", ""],
  ["Sickle", "simple", "melee", "1d4", "slashing", "Light", ""],
  ["Spear", "simple", "melee", "1d6", "piercing", "Thrown, versatile (1d8)", "20/60"],
  ["Light Crossbow", "simple", "ranged", "1d8", "piercing", "Ammunition, loading, two-handed", "80/320"],
  ["Dart", "simple", "ranged", "1d4", "piercing", "Finesse, thrown", "20/60"],
  ["Shortbow", "simple", "ranged", "1d6", "piercing", "Ammunition, two-handed", "80/320"],
  ["Sling", "simple", "ranged", "1d4", "bludgeoning", "Ammunition", "30/120"],
  ["Battleaxe", "martial", "melee", "1d8", "slashing", "Versatile (1d10)", ""],
  ["Flail", "martial", "melee", "1d8", "bludgeoning", "", ""],
  ["Glaive", "martial", "melee", "1d10", "slashing", "Heavy, reach, two-handed", ""],
  ["Greataxe", "martial", "melee", "1d12", "slashing", "Heavy, two-handed", ""],
  ["Greatsword", "martial", "melee", "2d6", "slashing", "Heavy, two-handed", ""],
  ["Halberd", "martial", "melee", "1d10", "slashing", "Heavy, reach, two-handed", ""],
  ["Lance", "martial", "melee", "1d12", "piercing", "Reach, special (disadvantage within 5 ft; two-handed unless mounted)", ""],
  ["Longsword", "martial", "melee", "1d8", "slashing", "Versatile (1d10)", ""],
  ["Maul", "martial", "melee", "2d6", "bludgeoning", "Heavy, two-handed", ""],
  ["Morningstar", "martial", "melee", "1d8", "piercing", "", ""],
  ["Pike", "martial", "melee", "1d10", "piercing", "Heavy, reach, two-handed", ""],
  ["Rapier", "martial", "melee", "1d8", "piercing", "Finesse", ""],
  ["Scimitar", "martial", "melee", "1d6", "slashing", "Finesse, light", ""],
  ["Shortsword", "martial", "melee", "1d6", "piercing", "Finesse, light", ""],
  ["Trident", "martial", "melee", "1d6", "piercing", "Thrown, versatile (1d8)", "20/60"],
  ["War Pick", "martial", "melee", "1d8", "piercing", "", ""],
  ["Warhammer", "martial", "melee", "1d8", "bludgeoning", "Versatile (1d10)", ""],
  ["Whip", "martial", "melee", "1d4", "slashing", "Finesse, reach", ""],
  ["Blowgun", "martial", "ranged", "1", "piercing", "Ammunition, loading", "25/100"],
  ["Hand Crossbow", "martial", "ranged", "1d6", "piercing", "Ammunition, light, loading", "30/120"],
  ["Heavy Crossbow", "martial", "ranged", "1d10", "piercing", "Ammunition, heavy, loading, two-handed", "100/400"],
  ["Longbow", "martial", "ranged", "1d8", "piercing", "Ammunition, heavy, two-handed", "150/600"]
];

/* Armor — D&D 5e (2014 PHB). Row: [name, category, AC, strength needed, stealth disadvantage, weight lb]
   Light adds all of DEX, medium adds DEX up to +2, heavy adds none. A shield adds its AC (+2) on top. */
window.ARMOR = [
  ["Padded Armor", "light", 11, 0, true, 8],
  ["Leather Armor", "light", 11, 0, false, 10],
  ["Studded Leather Armor", "light", 12, 0, false, 13],
  ["Hide Armor", "medium", 12, 0, false, 12],
  ["Chain Shirt", "medium", 13, 0, false, 20],
  ["Scale Mail", "medium", 14, 0, true, 45],
  ["Breastplate", "medium", 14, 0, false, 20],
  ["Half Plate", "medium", 15, 0, true, 40],
  ["Ring Mail", "heavy", 14, 0, true, 40],
  ["Chain Mail", "heavy", 16, 13, true, 55],
  ["Splint Armor", "heavy", 17, 15, true, 60],
  ["Plate Armor", "heavy", 18, 15, true, 65],
  ["Shield", "shield", 2, 0, false, 6]
];
