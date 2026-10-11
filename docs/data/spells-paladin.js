/* Paladin spell list — D&D 5e (2014 PHB), 1st to 5th level.
   Row: [name, level, school, casting time, range, components, duration, flags, summary, extra]
   flags: C = concentration, R = ritual.
   extra (optional): { heal:{dice, up, mod}, dmg:{dice, up, type, attack|save} }
   SPELLS.oath holds oath spells from other class lists. They are always prepared for a paladin
   of that oath but aren't on the paladin list, so they can't be picked as ordinary prepared spells. */
window.SPELLS = window.SPELLS || {};
window.SPELLS.paladin = [
  // 1st
  ["Bless",1,"Enchantment","1 action","30 ft","V, S, M","1 minute","C","Up to three creatures add 1d4 to attack rolls and saving throws. +1 target per slot level above 1st."],
  ["Command",1,"Enchantment","1 action","60 ft","V","1 round","","One-word command (approach, drop, flee, grovel, halt). WIS save or the target obeys on its next turn. +1 target per slot level above 1st."],
  ["Compelled Duel",1,"Enchantment","1 bonus action","30 ft","V","1 minute","C","A creature makes a WIS save or has disadvantage on attacks against anyone but you, and must save to move more than 30 ft. away from you."],
  ["Cure Wounds",1,"Evocation","1 action","Touch","V, S","Instantaneous","","A creature you touch regains hit points. No effect on undead or constructs.",{heal:{dice:"1d8",up:"1d8",mod:true}}],
  ["Detect Evil and Good",1,"Divination","1 action","Self","V, S","10 minutes","C","Sense aberrations, celestials, elementals, fey, fiends and undead within 30 ft, plus consecrated or desecrated places."],
  ["Detect Magic",1,"Divination","1 action","Self","V, S","10 minutes","C, R","Sense magic within 30 ft. Use an action to see a faint aura around a visible magic creature or object and learn its school."],
  ["Detect Poison and Disease",1,"Divination","1 action","Self","V, S, M","10 minutes","C, R","Sense poisons, poisonous creatures and diseases within 30 ft, and learn their kind."],
  ["Divine Favor",1,"Evocation","1 bonus action","Self","V, S","1 minute","C","Your weapon attacks deal an extra 1d4 radiant damage on a hit."],
  ["Heroism",1,"Enchantment","1 action","Touch","V, S","1 minute","C","A willing creature is immune to being frightened and gains temp HP equal to your spellcasting modifier at the start of each of its turns. +1 target per slot level above 1st."],
  ["Protection from Evil and Good",1,"Abjuration","1 action","Touch","V, S, M","10 minutes","C","Aberrations, celestials, elementals, fey, fiends and undead have disadvantage to attack the target, and can't charm, frighten or possess it."],
  ["Purify Food and Drink",1,"Transmutation","1 action","10 ft","V, S","Instantaneous","R","Nonmagical food and drink in a 5-ft. sphere is made free of poison and disease."],
  ["Searing Smite",1,"Evocation","1 bonus action","Self","V","1 minute","C","Your next melee weapon hit deals extra fire damage and sets the target ablaze: 1d6 fire at the start of each of its turns until it passes a CON save or someone douses it.",{dmg:{dice:"1d6",up:"1d6",type:"fire",attack:true}}],
  ["Shield of Faith",1,"Abjuration","1 bonus action","60 ft","V, S, M","10 minutes","C","A creature of your choice gains +2 AC for the duration."],
  ["Thunderous Smite",1,"Evocation","1 bonus action","Self","V","1 minute","C","Your next melee weapon hit deals extra thunder damage, audible 300 ft. away. The target makes a STR save or is pushed 10 ft. and knocked prone.",{dmg:{dice:"2d6",type:"thunder",attack:true}}],
  ["Wrathful Smite",1,"Evocation","1 bonus action","Self","V","1 minute","C","Your next melee weapon hit deals extra psychic damage. The target makes a WIS save or is frightened of you; it can use an action to repeat the save (WIS check).",{dmg:{dice:"1d6",type:"psychic",attack:true}}],
  // 2nd
  ["Aid",2,"Abjuration","1 action","30 ft","V, S, M","8 hours","","Up to three creatures gain +5 to their HP maximum and current HP. +5 more per slot level above 2nd."],
  ["Branding Smite",2,"Evocation","1 bonus action","Self","V","1 minute","C","Your next weapon hit deals extra radiant damage and makes the target shed dim light; it can't become invisible until the spell ends.",{dmg:{dice:"2d6",up:"1d6",type:"radiant",attack:true}}],
  ["Find Steed",2,"Conjuration","10 minutes","30 ft","V, S","Instantaneous","","Summon a loyal steed spirit (warhorse, pony, camel, elk or mastiff) that is celestial, fey or fiend. You share a telepathic bond, and self-targeting spells can also affect it."],
  ["Lesser Restoration",2,"Abjuration","1 action","Touch","V, S","Instantaneous","","End one disease or one condition afflicting a creature: blinded, deafened, paralyzed or poisoned."],
  ["Locate Object",2,"Divination","1 action","Self","V, S, M","10 minutes","C","Sense the direction of a familiar object or the nearest object of a kind within 1,000 ft. Blocked by lead."],
  ["Magic Weapon",2,"Transmutation","1 bonus action","Touch","V, S","1 hour","C","A nonmagical weapon becomes a +1 magic weapon. +2 with a 4th-level slot, +3 with a 6th-level slot."],
  ["Protection from Poison",2,"Abjuration","1 action","Touch","V, S","1 hour","","Neutralize one poison affecting a creature. For the duration it has advantage on saves against being poisoned and resistance to poison damage."],
  ["Zone of Truth",2,"Enchantment","1 action","60 ft","V, S","10 minutes","","Creatures in a 15-ft. sphere make a CHA save or can't speak a deliberate lie. You know who failed."],
  // 3rd
  ["Aura of Vitality",3,"Evocation","1 action","Self (30-ft radius)","V","1 minute","C","Bonus action each turn: one creature in the aura (you included) regains 2d6 HP.",{heal:{dice:"2d6"}}],
  ["Blinding Smite",3,"Evocation","1 bonus action","Self","V","1 minute","C","Your next melee weapon hit deals extra radiant damage. The target makes a CON save or is blinded; it repeats the save at the end of each of its turns.",{dmg:{dice:"3d8",type:"radiant",attack:true}}],
  ["Create Food and Water",3,"Conjuration","1 action","30 ft","V, S","Instantaneous","","Create 45 lb. of food and 30 gallons of water, enough for fifteen humanoids or five steeds for 24 hours."],
  ["Crusader's Mantle",3,"Evocation","1 action","Self","V","1 minute","C","Each nonhostile creature within 30 ft. (you included) deals an extra 1d4 radiant damage when it hits with a weapon attack."],
  ["Daylight",3,"Evocation","1 action","60 ft","V, S","1 hour","","A 60-ft. sphere of bright light, plus 60 ft. of dim light beyond. Dispels magical darkness of 3rd level or lower that it overlaps."],
  ["Dispel Magic",3,"Abjuration","1 action","120 ft","V, S","Instantaneous","","End spells of 3rd level or lower on a target. Higher-level spells need an ability check (DC 10 + spell level)."],
  ["Elemental Weapon",3,"Transmutation","1 action","Touch","V, S","1 hour","C","A nonmagical weapon gains +1 to attack rolls and deals an extra 1d4 acid, cold, fire, lightning or thunder damage. Stronger with a 5th- or 7th-level slot."],
  ["Magic Circle",3,"Abjuration","1 minute","10 ft","V, S, M","1 hour","","A 10-ft.-radius cylinder that hinders celestials, elementals, fey, fiends or undead from entering, or traps them inside."],
  ["Remove Curse",3,"Abjuration","1 action","Touch","V, S","Instantaneous","","End all curses affecting one creature or object. A cursed magic item's curse remains, but the attunement breaks."],
  ["Revivify",3,"Necromancy","1 action","Touch","V, S, M","Instantaneous","","Return a creature that died within the last minute to life with 1 HP. Needs diamonds worth 300 gp, consumed."],
  // 4th
  ["Aura of Life",4,"Abjuration","1 action","Self (30-ft radius)","V","10 minutes","C","Nonhostile creatures in the aura have resistance to necrotic damage and their HP maximum can't be reduced. A creature at 0 HP there regains 1 HP."],
  ["Aura of Purity",4,"Abjuration","1 action","Self (30-ft radius)","V","10 minutes","C","Nonhostile creatures in the aura can't become diseased, resist poison damage, and have advantage on saves against being blinded, charmed, deafened, frightened, paralyzed, poisoned or stunned."],
  ["Banishment",4,"Abjuration","1 action","60 ft","V, S, M","1 minute","C","A creature makes a CHA save or is banished to a harmless demiplane (or its home plane, if extraplanar). +1 target per slot level above 4th."],
  ["Death Ward",4,"Abjuration","1 action","Touch","V, S","8 hours","","The first time the target would drop to 0 HP, it drops to 1 HP instead, or an instant-kill effect is negated. Then the spell ends."],
  ["Locate Creature",4,"Divination","1 action","Self","V, S, M","1 hour","C","Sense the direction of a familiar creature, or the nearest creature of a kind, within 1,000 ft. Blocked by running water."],
  ["Staggering Smite",4,"Evocation","1 bonus action","Self","V","1 minute","C","Your next melee weapon hit deals extra psychic damage. The target makes a WIS save or has disadvantage on attacks and checks and can't take reactions until the end of its next turn.",{dmg:{dice:"4d6",type:"psychic",attack:true}}],
  // 5th
  ["Banishing Smite",5,"Abjuration","1 bonus action","Self","V","1 minute","C","Your next weapon hit deals extra force damage. If that leaves the target at 50 HP or fewer, it is banished to a harmless demiplane (or its home plane) while you concentrate.",{dmg:{dice:"5d10",type:"force",attack:true}}],
  ["Circle of Power",5,"Abjuration","1 action","Self (30-ft radius)","V","10 minutes","C","Friendly creatures in the aura have advantage on saves against spells and magical effects, and take no damage on a successful save for half."],
  ["Destructive Wave",5,"Evocation","1 action","Self (30-ft radius)","V","Instantaneous","","Creatures of your choice within 30 ft. make a CON save. On a failure: 5d6 thunder plus 5d6 radiant or necrotic damage and knocked prone. Half and not prone on a success.",{dmg:{dice:"10d6",type:"thunder + radiant/necrotic",save:"con"}}],
  ["Dispel Evil and Good",5,"Abjuration","1 action","Self","V, S, M","1 minute","C","Celestials, elementals, fey, fiends and undead have disadvantage to attack you. End the spell early to break an enchantment or send one such creature home (CHA save)."],
  ["Geas",5,"Enchantment","1 minute","60 ft","V","30 days","","A creature makes a WIS save or must follow your command. It takes 5d10 psychic damage, once a day, whenever it acts directly against the command."],
  ["Raise Dead",5,"Necromancy","1 hour","Touch","V, S, M","Instantaneous","","Return a creature dead no longer than 10 days to life with 1 HP. Needs a diamond worth 500 gp, consumed. −4 to rolls, easing each long rest."]
];
window.SPELLS.oath = [
  // Oath of Vengeance
  ["Bane",1,"Enchantment","1 action","30 ft","V, S, M","1 minute","C","Up to three creatures make CHA saves; on a failure they subtract 1d4 from attack rolls and saving throws. +1 target per slot level above 1st."],
  ["Hunter's Mark",1,"Divination","1 bonus action","90 ft","V","1 hour","C","Mark a creature. Your weapon hits deal an extra 1d6 damage to it, and you have advantage on Perception and Survival checks to find it. If it drops to 0 HP, move the mark as a bonus action."],
  ["Hold Person",2,"Enchantment","1 action","60 ft","V, S, M","1 minute","C","A humanoid makes a WIS save or is paralyzed. It repeats the save at the end of each of its turns. +1 target per slot level above 2nd."],
  ["Misty Step",2,"Conjuration","1 bonus action","Self","V","Instantaneous","","Teleport up to 30 ft. to an unoccupied space you can see."],
  ["Haste",3,"Transmutation","1 action","30 ft","V, S, M","1 minute","C","A willing creature doubles its speed, gains +2 AC, advantage on DEX saves and an extra limited action each turn. When it ends, the target loses its next turn."],
  ["Protection from Energy",3,"Abjuration","1 action","Touch","V, S","1 hour","C","A willing creature has resistance to acid, cold, fire, lightning or thunder damage (your choice)."],
  ["Dimension Door",4,"Conjuration","1 action","500 ft","V","Instantaneous","","Teleport yourself (and one willing creature you touch) up to 500 ft. to a place you can see, picture or describe."],
  ["Hold Monster",5,"Enchantment","1 action","90 ft","V, S, M","1 minute","C","A creature makes a WIS save or is paralyzed. It repeats the save at the end of each of its turns. +1 target per slot level above 5th."],
  ["Scrying",5,"Divination","10 minutes","Self","V, S, M","10 minutes","C","See and hear a creature on the same plane, which makes a WIS save modified by how well you know it. Or watch a place you know well."],
  // Oath of Devotion
  ["Sanctuary",1,"Abjuration","1 bonus action","30 ft","V, S, M","1 minute","","A creature attacking the warded target must first make a WIS save or choose a new target. Ends if the warded creature attacks or casts on an enemy."],
  ["Beacon of Hope",3,"Abjuration","1 action","30 ft","V, S","1 minute","C","Chosen creatures have advantage on WIS saves and death saves, and regain the maximum possible HP from any healing."],
  ["Freedom of Movement",4,"Abjuration","1 action","Touch","V, S, M","1 hour","","Difficult terrain and magic can't reduce the target's speed or paralyze or restrain it. It can spend 5 ft. to escape nonmagical restraints."],
  ["Guardian of Faith",4,"Conjuration","1 action","30 ft","V","8 hours","","A spectral guardian. An enemy that first moves within 10 ft. of it on a turn makes a DEX save or takes 20 radiant damage (half on a save). It vanishes after dealing 60 damage.",{dmg:{dice:"20",type:"radiant",save:"dex"}}],
  ["Commune",5,"Divination","1 minute","Self","V, S, M","1 minute","R","Ask your deity up to three yes-or-no questions."],
  ["Flame Strike",5,"Evocation","1 action","60 ft","V, S, M","Instantaneous","","A 10-ft.-radius, 40-ft.-high column of divine fire. DEX save: 4d6 fire plus 4d6 radiant, half on a success.",{dmg:{dice:"8d6",up:"1d6",type:"fire + radiant",save:"dex"}}],
  // Oath of the Ancients
  ["Ensnaring Strike",1,"Conjuration","1 bonus action","Self","V","1 minute","C","Your next weapon hit sprouts thorny vines. The target makes a STR save or is restrained and takes 1d6 piercing damage at the start of each of its turns."],
  ["Speak with Animals",1,"Divination","1 action","Self","V, S","10 minutes","R","You can understand and talk with beasts."],
  ["Moonbeam",2,"Evocation","1 action","120 ft","V, S, M","1 minute","C","A 5-ft.-radius, 40-ft.-high cylinder of moonlight. A creature entering or starting its turn there makes a CON save: 2d10 radiant, half on a success. Move it 60 ft. as an action.",{dmg:{dice:"2d10",up:"1d10",type:"radiant",save:"con"}}],
  ["Plant Growth",3,"Transmutation","1 action or 8 hours","150 ft","V, S","Instantaneous","","Overgrowth: plants in a 100-ft. radius cost 4 ft. of movement per foot. Or enrichment: plants within half a mile bear twice the food for a year."],
  ["Ice Storm",4,"Evocation","1 action","300 ft","V, S, M","Instantaneous","","A 20-ft.-radius, 40-ft.-high cylinder of hail. DEX save: 2d8 bludgeoning plus 4d6 cold, half on a success. The area becomes difficult terrain until your next turn.",{dmg:{dice:"2d8 + 4d6",type:"bludgeoning + cold",save:"dex"}}],
  ["Stoneskin",4,"Abjuration","1 action","Touch","V, S, M","1 hour","C","A willing creature has resistance to nonmagical bludgeoning, piercing and slashing damage. Needs diamond dust worth 100 gp, consumed."],
  ["Commune with Nature",5,"Divination","1 minute","Self","V, S","Instantaneous","R","Gain knowledge of the land within 3 miles (1 mile underground): terrain, water, plants, animals, creatures, planar influences and structures."],
  ["Tree Stride",5,"Conjuration","1 action","Self","V, S","1 minute","C","Step into a living tree and out of another of the same kind within 500 ft., using 5 ft. of movement."],
  // Oathbreaker (DMG)
  ["Hellish Rebuke",1,"Evocation","1 reaction","60 ft","V, S","Instantaneous","","When a creature damages you, it is wreathed in flames: DEX save or 2d10 fire damage, half on a success.",{dmg:{dice:"2d10",up:"1d10",type:"fire",save:"dex"}}],
  ["Inflict Wounds",1,"Necromancy","1 action","Touch","V, S","Instantaneous","","Make a melee spell attack. On a hit the target takes necrotic damage.",{dmg:{dice:"3d10",up:"1d10",type:"necrotic",attack:true}}],
  ["Crown of Madness",2,"Enchantment","1 action","120 ft","V, S","1 minute","C","A humanoid makes a WIS save or is charmed and must attack a creature you choose before moving. Repeats the save at the end of each of its turns."],
  ["Darkness",2,"Evocation","1 action","60 ft","V, M","10 minutes","C","Magical darkness fills a 15-ft. sphere. Darkvision can't see through it and nonmagical light can't light it."],
  ["Animate Dead",3,"Necromancy","1 minute","10 ft","V, S, M","Instantaneous","","Raise a skeleton or zombie from a corpse or bones. It obeys your mental commands for 24 hours."],
  ["Bestow Curse",3,"Necromancy","1 action","Touch","V, S","1 minute","C","A creature makes a WIS save or is cursed: disadvantage on one ability's checks and saves, disadvantage attacking you, losing turns, or +1d8 necrotic from your hits."],
  ["Blight",4,"Necromancy","1 action","30 ft","V, S","Instantaneous","","A creature makes a CON save: 8d8 necrotic, half on a success. Plants have disadvantage and take maximum damage.",{dmg:{dice:"8d8",up:"1d8",type:"necrotic",save:"con"}}],
  ["Confusion",4,"Enchantment","1 action","90 ft","V, S, M","1 minute","C","Creatures in a 10-ft. sphere make a WIS save or act randomly each turn (d10). Repeat the save at the end of each turn."],
  ["Contagion",5,"Necromancy","1 action","Touch","V, S","7 days","","Melee spell attack: the target is poisoned. After three failed CON saves it contracts a disease of your choice for 7 days."],
  ["Dominate Person",5,"Enchantment","1 action","60 ft","V, S","1 minute","C","A humanoid makes a WIS save or is charmed and obeys your telepathic commands. It saves again whenever it takes damage."]
];
