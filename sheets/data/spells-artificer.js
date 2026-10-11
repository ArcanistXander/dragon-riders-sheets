/* Artificer spell list — D&D 5e (Tasha's Cauldron of Everything, 2014-era rules).
   Row: [name, level, school, casting time, range, components, duration, flags, summary, extra]
   flags: C = concentration, R = ritual.
   extra (optional): { heal:{dice, up, mod}, dmg:{dice, up, type, attack|save}, cantrip:{dice,type,save} }
     dice = base dice at the spell's own level, up = dice added per slot level above it,
     mod  = add spellcasting modifier. Used by the Cast button to show the result line. */
window.SPELLS = window.SPELLS || {};
window.SPELLS.artificer = [
  // Cantrips
  ["Acid Splash",0,"Conjuration","1 action","60 ft","V, S","Instantaneous","","One creature, or two within 5 ft. of each other, make a DEX save or take acid damage.",{cantrip:{dice:"d6",type:"acid",save:"dex"}}],
  ["Booming Blade",0,"Evocation","1 action","Self (5 ft)","S, M","1 round","","Make a melee weapon attack. On a hit the target is sheathed in thunder; if it willingly moves before your next turn it takes 1d8 thunder. Extra dice grow at 5th level."],
  ["Create Bonfire",0,"Conjuration","1 action","60 ft","V, S","1 minute","C","A bonfire fills a 5-ft. square. Creatures there or entering it make a DEX save or take fire damage.",{cantrip:{dice:"d8",type:"fire",save:"dex"}}],
  ["Dancing Lights",0,"Evocation","1 action","120 ft","V, S, M","1 minute","C","Up to four torch-like lights (or one glowing humanoid shape) that you can move 60 ft. as a bonus action."],
  ["Fire Bolt",0,"Evocation","1 action","120 ft","V, S","Instantaneous","","Ranged spell attack. On a hit, fire damage; flammable objects that aren't worn or carried ignite.",{cantrip:{dice:"d10",type:"fire"}}],
  ["Frostbite",0,"Evocation","1 action","60 ft","V, S","Instantaneous","","CON save or cold damage, and the target has disadvantage on its next weapon attack before the end of its next turn.",{cantrip:{dice:"d6",type:"cold",save:"con"}}],
  ["Green-Flame Blade",0,"Evocation","1 action","Self (5 ft)","S, M","Instantaneous","","Make a melee weapon attack. On a hit, green fire leaps to a second creature within 5 ft. for fire damage equal to your spellcasting modifier (more dice from 5th level)."],
  ["Guidance",0,"Divination","1 action","Touch","V, S","1 minute","C","A willing creature adds 1d4 to one ability check of its choice before the spell ends."],
  ["Light",0,"Evocation","1 action","Touch","V, M","1 hour","","An object glows with bright light in a 20-ft radius and dim light 20 ft beyond. DEX save if held by a hostile creature."],
  ["Lightning Lure",0,"Evocation","1 action","Self (15 ft)","V","Instantaneous","","A creature within 15 ft. makes a STR save or is pulled 10 ft. toward you, taking lightning damage if it ends within 5 ft. of you.",{cantrip:{dice:"d8",type:"lightning",save:"str"}}],
  ["Mage Hand",0,"Conjuration","1 action","30 ft","V, S","1 minute","","A spectral hand manipulates objects, opens doors and carries up to 10 lb. It can't attack or activate magic items."],
  ["Magic Stone",0,"Transmutation","1 bonus action","Touch","V, S","1 minute","","Up to three pebbles become magic. A ranged spell attack with one deals 1d6 + your spellcasting modifier bludgeoning."],
  ["Mending",0,"Transmutation","1 minute","Touch","V, S, M","Instantaneous","","Repairs a single break or tear in an object no larger than 1 ft in any dimension."],
  ["Message",0,"Transmutation","1 action","120 ft","V, S, M","1 round","","Whisper a message to a creature you point at; only it hears, and it can whisper a reply."],
  ["Poison Spray",0,"Conjuration","1 action","10 ft","V, S","Instantaneous","","A creature you can see makes a CON save or takes poison damage.",{cantrip:{dice:"d12",type:"poison",save:"con"}}],
  ["Prestidigitation",0,"Transmutation","1 action","10 ft","V, S","Up to 1 hour","","Minor tricks: a harmless sensory effect, light or snuff a candle, clean or soil, chill, warm or flavor, a small mark, or a trinket illusion."],
  ["Ray of Frost",0,"Evocation","1 action","60 ft","V, S","Instantaneous","","Ranged spell attack. On a hit, cold damage and the target's speed drops by 10 ft. until your next turn.",{cantrip:{dice:"d8",type:"cold"}}],
  ["Resistance",0,"Abjuration","1 action","Touch","V, S, M","1 minute","C","A willing creature adds 1d4 to one saving throw of its choice before the spell ends."],
  ["Shocking Grasp",0,"Evocation","1 action","Touch","V, S","Instantaneous","","Melee spell attack with advantage against metal armor. On a hit, lightning damage and the target can't take reactions until its next turn.",{cantrip:{dice:"d8",type:"lightning"}}],
  ["Spare the Dying",0,"Necromancy","1 action","Touch","V, S","Instantaneous","","A living creature at 0 HP becomes stable. No effect on undead or constructs."],
  ["Sword Burst",0,"Conjuration","1 action","Self (5 ft)","V","Instantaneous","","Spectral blades sweep around you. Each creature within 5 ft. makes a DEX save or takes force damage.",{cantrip:{dice:"d6",type:"force",save:"dex"}}],
  ["Thorn Whip",0,"Transmutation","1 action","30 ft","V, S, M","Instantaneous","","Melee spell attack. On a hit, piercing damage and a Large or smaller target is pulled up to 10 ft. toward you.",{cantrip:{dice:"d6",type:"piercing"}}],
  ["Thunderclap",0,"Evocation","1 action","Self (5 ft)","S","Instantaneous","","A burst of thunder. Each creature within 5 ft. makes a CON save or takes thunder damage.",{cantrip:{dice:"d6",type:"thunder",save:"con"}}],
  // 1st
  ["Absorb Elements",1,"Abjuration","1 reaction","Self","S","1 round","","When you take acid, cold, fire, lightning or thunder damage: resistance to that type until your next turn, and your first melee hit next turn deals +1d6 of that type (+1d6 per slot level above 1st)."],
  ["Alarm",1,"Abjuration","1 minute","30 ft","V, S, M","8 hours","R","Ward a door, window or area up to a 20-ft. cube. You get a mental ping or an audible alarm when a creature enters."],
  ["Catapult",1,"Transmutation","1 action","60 ft","S","Instantaneous","","Hurl an object of 1–5 lb. in a 90-ft. line. The first creature in its path makes a DEX save or takes bludgeoning damage.",{dmg:{dice:"3d8",up:"1d8",type:"bludgeoning",save:"dex"}}],
  ["Cure Wounds",1,"Evocation","1 action","Touch","V, S","Instantaneous","","A creature you touch regains hit points. No effect on undead or constructs.",{heal:{dice:"1d8",up:"1d8",mod:true}}],
  ["Detect Magic",1,"Divination","1 action","Self","V, S","10 minutes","C,R","Sense magic within 30 ft and see a faint aura around visible magical creatures and objects, including their school."],
  ["Disguise Self",1,"Illusion","1 action","Self","V, S","1 hour","","Change how you look, including clothing and gear, for the duration. Physical inspection can reveal it."],
  ["Expeditious Retreat",1,"Transmutation","1 bonus action","Self","V, S","10 minutes","C","Take the Dash action now and as a bonus action on each of your turns."],
  ["Faerie Fire",1,"Evocation","1 action","60 ft","V","1 minute","C","Creatures in a 20-ft. cube make a DEX save or are outlined in light: attacks against them have advantage and they can't be invisible."],
  ["False Life",1,"Necromancy","1 action","Self","V, S, M","1 hour","","Gain 1d4 + 4 temporary hit points (+5 per slot level above 1st)."],
  ["Feather Fall",1,"Transmutation","1 reaction","60 ft","V, M","1 minute","","When up to five falling creatures are within range, their fall slows to 60 ft. per round and they take no falling damage."],
  ["Grease",1,"Conjuration","1 action","60 ft","V, S, M","1 minute","","A 10-ft. square becomes difficult terrain. Creatures there or entering make a DEX save or fall prone."],
  ["Identify",1,"Divination","1 minute","Touch","V, S, M","Instantaneous","R","Learn a magic item's properties and how to use it, or the spells affecting a creature or object."],
  ["Jump",1,"Transmutation","1 action","Touch","V, S, M","1 minute","","A creature's jump distance triples."],
  ["Longstrider",1,"Transmutation","1 action","Touch","V, S, M","1 hour","","A creature's speed increases by 10 ft. (+1 creature per slot level above 1st)."],
  ["Purify Food and Drink",1,"Transmutation","1 action","10 ft","V, S","Instantaneous","R","Nonmagical food and drink in a 5-ft sphere is purified of poison and disease."],
  ["Sanctuary",1,"Abjuration","1 bonus action","30 ft","V, S, M","1 minute","","Attackers targeting the warded creature must make a WIS save or pick a new target. Ends if the warded creature attacks or casts at an enemy."],
  ["Snare",1,"Abjuration","1 minute","Touch","S, M","8 hours","","Set a magical trap in a 5-ft. circle. A creature entering it makes a DEX save or is hoisted upside down and restrained."],
  ["Tasha's Caustic Brew",1,"Evocation","1 action","Self (30-ft line)","V, S, M","1 minute","C","A 30-ft. by 5-ft. line of acid. Each creature makes a DEX save or is coated, taking acid damage at the start of each of its turns until it scrapes it off (action).",{dmg:{dice:"2d4",up:"2d4",type:"acid",save:"dex"}}],
  // 2nd
  ["Aid",2,"Abjuration","1 action","30 ft","V, S, M","8 hours","","Up to three creatures gain 5 to their HP maximum and current HP. +5 per slot level above 2nd."],
  ["Alter Self",2,"Transmutation","1 action","Self","V, S","1 hour","C","Change your form: aquatic adaptation, change appearance, or natural weapons (1d6, magic)."],
  ["Arcane Lock",2,"Abjuration","1 action","Touch","V, S, M","Until dispelled","","Magically lock a door, window, gate or chest. You and chosen creatures open it normally; +10 to the DC to force it."],
  ["Blur",2,"Illusion","1 action","Self","V","1 minute","C","Your body blurs. Attacks against you have disadvantage unless the attacker doesn't rely on sight."],
  ["Continual Flame",2,"Evocation","1 action","Touch","V, S, M","Until dispelled","","A torch-bright flame that gives no heat and uses no oxygen appears on an object."],
  ["Darkvision",2,"Transmutation","1 action","Touch","V, S, M","8 hours","","A willing creature gains darkvision out to 60 ft."],
  ["Enhance Ability",2,"Transmutation","1 action","Touch","V, S, M","1 hour","C","Grant one boon: advantage on checks of one ability, plus a rider (e.g. Bear's Endurance grants 2d6 temp HP). +1 target per slot level above 2nd."],
  ["Enlarge/Reduce",2,"Transmutation","1 action","30 ft","V, S, M","1 minute","C","A creature or object doubles in size (+1d4 weapon damage, advantage on STR) or halves (−1d4 weapon damage, disadvantage on STR). Unwilling targets make a CON save."],
  ["Heat Metal",2,"Transmutation","1 action","60 ft","V, S, M","1 minute","C","A metal object glows red-hot. A creature touching it takes fire damage; repeat as a bonus action. It may drop the object or have disadvantage.",{dmg:{dice:"2d8",up:"1d8",type:"fire",save:"con"}}],
  ["Invisibility",2,"Illusion","1 action","Touch","V, S, M","1 hour","C","A creature turns invisible until it attacks or casts a spell. +1 target per slot level above 2nd."],
  ["Lesser Restoration",2,"Abjuration","1 action","Touch","V, S","Instantaneous","","End one disease or one condition: blinded, deafened, paralyzed or poisoned."],
  ["Levitate",2,"Transmutation","1 action","60 ft","V, S, M","10 minutes","C","A creature or object up to 500 lb. rises up to 20 ft. and floats. Unwilling targets make a CON save."],
  ["Magic Mouth",2,"Illusion","1 minute","30 ft","V, S, M","Until dispelled","R","Plant a spoken message (up to 25 words) in an object that plays when a trigger you set happens."],
  ["Magic Weapon",2,"Transmutation","1 bonus action","Touch","V, S","1 hour","C","A nonmagical weapon becomes a +1 magic weapon (+2 with a 4th-level slot, +3 with 6th)."],
  ["Protection from Poison",2,"Abjuration","1 action","Touch","V, S","1 hour","","Neutralize one poison on a creature. It has advantage on saves against being poisoned and resistance to poison damage."],
  ["Pyrotechnics",2,"Transmutation","1 action","60 ft","V, S","Instantaneous","","Turn a nonmagical flame into fireworks (CON save or blinded) or a cloud of thick smoke."],
  ["Rope Trick",2,"Transmutation","1 action","Touch","V, S, M","1 hour","","A rope rises to an invisible extradimensional space that holds up to eight Medium creatures."],
  ["See Invisibility",2,"Divination","1 action","Self","V, S, M","1 hour","","You see invisible creatures and objects and into the Ethereal Plane."],
  ["Skywrite",2,"Transmutation","1 action","Sight","V, S","1 hour","C,R","Write up to ten words in the sky with clouds."],
  ["Spider Climb",2,"Transmutation","1 action","Touch","V, S, M","1 hour","C","A willing creature can climb walls and ceilings with its hands free, and gains a climbing speed equal to its walking speed."],
  ["Web",2,"Conjuration","1 action","60 ft","V, S, M","1 hour","C","Sticky webs fill a 20-ft. cube. Creatures there make a DEX save or are restrained. The webs are difficult terrain and flammable."],
  // 3rd
  ["Blink",3,"Transmutation","1 action","Self","V, S","1 minute","","At the end of each of your turns, roll a d20: on 11+ you vanish to the Ethereal Plane until your next turn."],
  ["Catnap",3,"Enchantment","1 action","30 ft","S, M","10 minutes","","Up to three willing creatures fall asleep. Ten minutes of this sleep counts as a short rest."],
  ["Create Food and Water",3,"Conjuration","1 action","30 ft","V, S","Instantaneous","","Create enough food and water for fifteen humanoids or five steeds for 24 hours."],
  ["Dispel Magic",3,"Abjuration","1 action","120 ft","V, S","Instantaneous","","End spells of 3rd level or lower on a target. Higher-level spells need a check (DC 10 + the spell's level)."],
  ["Elemental Weapon",3,"Transmutation","1 action","Touch","V, S","1 hour","C","A nonmagical weapon gets +1 to hit and deals an extra 1d4 acid, cold, fire, lightning or thunder damage."],
  ["Flame Arrows",3,"Transmutation","1 action","Touch","V, S","1 hour","C","Twelve pieces of ammunition from a quiver deal an extra 1d6 fire damage on a hit."],
  ["Fly",3,"Transmutation","1 action","Touch","V, S, M","10 minutes","C","A willing creature gains a flying speed of 60 ft. +1 target per slot level above 3rd."],
  ["Glyph of Warding",3,"Abjuration","1 hour","Touch","V, S, M","Until dispelled","","Inscribe a glyph that triggers an explosion (5d8 of an element, DEX save) or a stored spell of 3rd level or lower."],
  ["Haste",3,"Transmutation","1 action","30 ft","V, S, M","1 minute","C","A willing creature gets double speed, +2 AC, advantage on DEX saves and an extra limited action. It's stunned for a round when the spell ends."],
  ["Intellect Fortress",3,"Abjuration","1 action","30 ft","V","1 hour","C","A willing creature resists psychic damage and has advantage on INT, WIS and CHA saves."],
  ["Protection from Energy",3,"Abjuration","1 action","Touch","V, S","1 hour","C","A willing creature resists one damage type: acid, cold, fire, lightning or thunder."],
  ["Revivify",3,"Necromancy","1 action","Touch","V, S, M","Instantaneous","","A creature that died within the last minute returns to life with 1 HP. Costs diamonds worth 300 gp."],
  ["Tiny Servant",3,"Transmutation","1 minute","Touch","V, S","8 hours","","A Tiny object sprouts limbs and becomes a creature that obeys your commands."],
  ["Water Breathing",3,"Transmutation","1 action","30 ft","V, S, M","24 hours","R","Up to ten willing creatures can breathe underwater."],
  ["Water Walk",3,"Transmutation","1 action","30 ft","V, S, M","1 hour","R","Up to ten willing creatures can move across liquid as if it were solid ground."],
  // 4th
  ["Arcane Eye",4,"Divination","1 action","30 ft","V, S, M","1 hour","C","Create an invisible floating eye with darkvision that you can move and see through."],
  ["Elemental Bane",4,"Transmutation","1 action","90 ft","V, S","1 minute","C","A creature makes a CON save or loses resistance to an element you choose and takes an extra 2d6 of it the first time each turn it takes that damage."],
  ["Fabricate",4,"Transmutation","10 minutes","120 ft","V, S","Instantaneous","","Turn raw materials into finished products of the same material, such as a bridge from trees or clothes from flax."],
  ["Freedom of Movement",4,"Abjuration","1 action","Touch","V, S, M","1 hour","","A willing creature ignores difficult terrain, can't be slowed, paralyzed or restrained by magic, and can escape grapples easily."],
  ["Leomund's Secret Chest",4,"Conjuration","1 action","Touch","V, S, M","Instantaneous","","Hide a chest and its contents on the Ethereal Plane and call it back with a miniature replica."],
  ["Mordenkainen's Faithful Hound",4,"Conjuration","1 action","30 ft","V, S, M","8 hours","","An invisible watchdog barks at intruders and bites hostile creatures within 5 ft. (4d8 piercing)."],
  ["Mordenkainen's Private Sanctum",4,"Abjuration","10 minutes","120 ft","V, S, M","24 hours","","Make an area magically secure against sound, sight, scrying and teleportation as you choose."],
  ["Otiluke's Resilient Sphere",4,"Evocation","1 action","30 ft","V, S, M","1 minute","C","Enclose a Large or smaller creature or object in an unbreakable sphere of force. Unwilling targets make a DEX save."],
  ["Stone Shape",4,"Transmutation","1 action","Touch","V, S, M","Instantaneous","","Reshape a 5-ft. cube of stone into any shape you want."],
  ["Stoneskin",4,"Abjuration","1 action","Touch","V, S, M","1 hour","C","A willing creature resists nonmagical bludgeoning, piercing and slashing damage. Costs diamond dust worth 100 gp."],
  ["Summon Construct",4,"Conjuration","1 action","90 ft","V, S, M","1 hour","C","Summon a clay, metal or stone construct spirit that fights for you. Stat block: Tasha's Cauldron."],
  // 5th
  ["Animate Objects",5,"Transmutation","1 action","120 ft","V, S","1 minute","C","Bring up to ten nonmagical objects to life to attack on your command."],
  ["Bigby's Hand",5,"Evocation","1 action","120 ft","V, S, M","1 minute","C","A Large hand of force can punch (4d8 force), shove, grapple or shield on your bonus action."],
  ["Creation",5,"Illusion","1 minute","30 ft","V, S, M","Special","","Create a nonliving object of vegetable or mineral matter up to a 5-ft. cube. How long it lasts depends on the material."],
  ["Greater Restoration",5,"Abjuration","1 action","Touch","V, S, M","Instantaneous","","End one level of exhaustion, a charm or petrification, a curse, an ability score reduction or an HP maximum reduction. Costs 100 gp of diamond dust."],
  ["Skill Empowerment",5,"Transmutation","1 action","Touch","V, S","1 hour","C","A willing creature doubles its proficiency bonus for one skill it's proficient in."],
  ["Transmute Rock",5,"Transmutation","1 action","120 ft","V, S, M","Until dispelled","","Turn a 40-ft. cube of rock into mud or mud into rock."],
  ["Wall of Stone",5,"Evocation","1 action","120 ft","V, S, M","10 minutes","C","Raise a wall of stone panels that becomes permanent if you concentrate for the full duration."]
];

/* Dragonwarden specialist spells: always prepared for a Dragonwarden, and
   count as artificer spells for her even though they aren't on the main list. */
window.SPELLS.dragonwarden = [
  ["Heroism",1,"Enchantment","1 action","Touch","V, S","1 minute","C","A willing creature can't be frightened and gains temporary HP equal to your spellcasting modifier at the start of each of its turns. +1 target per slot level above 1st."],
  ["Warding Bond",2,"Abjuration","1 action","Touch","V, S, M","1 hour","","A willing creature gets +1 AC, +1 to saving throws and resistance to all damage while within 60 ft. of you. You take the same damage it takes. Needs a pair of platinum rings worth 50 gp each."],
  ["Barkskin",2,"Transmutation","1 action","Touch","V, S, M","1 hour","C","Hardened Scales: a willing creature's skin (or a dragon's scales) hardens, and its AC can't be lower than 16, whatever armor it wears."],
  ["Wall of Force",5,"Evocation","1 action","120 ft","V, S, M","10 minutes","C","An invisible wall of force (a dome, sphere or up to ten 10-ft. panels) appears. Nothing physically passes through it, and it is immune to all damage. Disintegrate destroys it."],
  ["Shield",1,"Abjuration","1 reaction","Self","V, S","1 round","","When you're hit by an attack or targeted by magic missile: +5 AC until the start of your next turn, including against the triggering attack, and no damage from magic missile."]
];

/* Spells known from a race or feat rather than a class. Shown under "Other spells". */
window.SPELLS.racial = [
  ["Blade Ward",0,"Abjuration","1 action","Self","V, S","1 round","","Until the end of your next turn, you resist bludgeoning, piercing and slashing damage from weapon attacks."]
];
