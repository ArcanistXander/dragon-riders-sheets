/* Dragon Riders character sheet engine — D&D 5e (2014).
   Reads: CLASSES, SLOTS_FULL, SPELLS, DRAGON_RULES, DRAGON_KINDS,
          CHARACTER_ID, DEFAULT_CHARACTER, DEFAULT_ART (set by data/*.js). */
(function () {
  "use strict";

  const ABIL = ["str", "dex", "con", "int", "wis", "cha"];
  const ABIL_NAME = { str: "Strength", dex: "Dexterity", con: "Constitution", int: "Intelligence", wis: "Wisdom", cha: "Charisma" };
  const SKILLS = [
    ["acrobatics", "Acrobatics", "dex"], ["animal", "Animal Handling", "wis"], ["arcana", "Arcana", "int"], ["athletics", "Athletics", "str"],
    ["deception", "Deception", "cha"], ["history", "History", "int"], ["insight", "Insight", "wis"], ["intimidation", "Intimidation", "cha"],
    ["investigation", "Investigation", "int"], ["medicine", "Medicine", "wis"], ["nature", "Nature", "int"], ["perception", "Perception", "wis"],
    ["performance", "Performance", "cha"], ["persuasion", "Persuasion", "cha"], ["religion", "Religion", "int"], ["sleight", "Sleight of Hand", "dex"],
    ["stealth", "Stealth", "dex"], ["survival", "Survival", "wis"]
  ];
  const ORD = ["Cantrip", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"];
  const LS_KEY = "drsheet:" + window.CHARACTER_ID;
  const LS_UI = "drsheet-ui:" + window.CHARACTER_ID;

  /* ---------- helpers ---------- */
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const mod = (s) => Math.floor((s - 10) / 2);
  const sg = (n) => (n >= 0 ? "+" : "−") + Math.abs(n);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (sel, root = document) => root.querySelector(sel);
  const rnd = (n) => 1 + Math.floor(Math.random() * n);
  const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } };
  function getPath(obj, path) { return path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj); }
  function setPath(obj, path, val) {
    const ks = path.split("."); let o = obj;
    for (let i = 0; i < ks.length - 1; i++) { if (o[ks[i]] == null) o[ks[i]] = {}; o = o[ks[i]]; }
    o[ks[ks.length - 1]] = val;
  }
  /* "2d6+3" → { total, detail } ; bare numbers allowed */
  function roll(expr, opts = {}) {
    let total = 0; const parts = [];
    String(expr).replace(/\s+/g, "").replace(/−/g, "-").split(/(?=[+-])/).forEach((tok) => {
      if (!tok) return;
      const sign = tok[0] === "-" ? -1 : 1; const t = tok.replace(/^[+-]/, "");
      const m = t.match(/^(\d*)d(\d+)$/i);
      if (m) {
        const n = +(m[1] || 1), d = +m[2]; const rs = [];
        for (let i = 0; i < n; i++) rs.push(opts.max ? d : rnd(d));
        const s = rs.reduce((a, b) => a + b, 0); total += sign * s; parts.push((sign < 0 ? "−" : "") + "[" + rs.join(", ") + "]");
      } else if (t) { total += sign * +t; parts.push((sign < 0 ? "−" : "+") + t); }
    });
    return { total, detail: parts.join(" ") };
  }
  function addDice(base, extra, times) { // "1d8" + "1d8" × 2 → "3d8"
    if (!times) return base;
    const b = base.match(/^(\d+)d(\d+)$/), e = extra.match(/^(\d+)d(\d+)$/);
    if (b && e && b[2] === e[2]) return (+b[1] + +e[1] * times) + "d" + b[2];
    return base + "+" + Array(times).fill(extra).join("+");
  }

  /* ---------- state ---------- */
  let S = null;            // character state
  let UI = { tab: "overview", edit: false, spellView: "prepared", open: {}, rollMode: "normal" };
  try { Object.assign(UI, JSON.parse(lsGet(LS_UI) || "{}"), { edit: false }); } catch (e) { /* ignore */ }
  let MODAL = null;        // { type, ...data }
  const ART = { portrait: null, dragon: null };

  function migrate(s) {
    const d = clone(window.DEFAULT_CHARACTER);
    for (const k of Object.keys(d)) if (s[k] === undefined) s[k] = d[k];
    s.dragon = Object.assign({}, d.dragon, s.dragon || {});
    s.story = Object.assign({}, d.story, s.story || {});
    s.slotsUsed = (s.slotsUsed || []).concat(Array(10).fill(0)).slice(0, 10);
    s.resUsed = s.resUsed || {};
    s.extraSpells = s.extraSpells || [];
    s.customFeatures = s.customFeatures || [];
    s.panels = Object.assign({}, clone(d.panels || {}), s.panels || {});
    Object.keys(s.panels).forEach((k) => { const p = s.panels[k]; p.active = p.active || {}; p.known = p.known || null; p.used = p.used || {}; p.charges = p.charges || {}; });
    s.exhaustion = s.exhaustion || 0;
    s.conditions = s.conditions || "";
    s.heroPoints = Math.max(0, Math.min(3, +s.heroPoints || 0));
    s.diceMode = s.diceMode === "digital" ? "digital" : "physical";
    if (!Array.isArray(s.conds)) { s.conds = []; if (s.conditions && s.conditionsNote == null) s.conditionsNote = s.conditions; }
    s.conditionsNote = s.conditionsNote || "";
    s.attacks.forEach((w) => {
      if (!w.kind) w.kind = w.ability === "dex" ? "ranged" : "melee";
      if (w.name === "Dagger" && w.range == null) { w.range = "20/60"; w.props = "Finesse, light, thrown"; if (/thrown/i.test(w.notes || "")) w.notes = ""; }
    });
    return s;
  }
  try { const raw = lsGet(LS_KEY); S = raw ? migrate(JSON.parse(raw)) : migrate(clone(window.DEFAULT_CHARACTER)); }
  catch (e) { S = migrate(clone(window.DEFAULT_CHARACTER)); }

  /* ---------- derived values ---------- */
  function pbFor(level) { return 2 + Math.floor((Math.max(1, level) - 1) / 4); }
  function slotsFor(classes) {
    let full = 0, half = 0, third = 0, n = 0, only = null;
    classes.forEach((c) => {
      const C = CLASSES[c.id]; const p = C && C.spellcasting && C.spellcasting.progression;
      if (!p) return; n++; only = c;
      if (p === "full") full += c.level; else if (p === "half") half += c.level; else if (p === "third") third += c.level;
    });
    if (!n) return [];
    let lvl = full + Math.floor(half / 2) + Math.floor(third / 3);
    if (n === 1) { const p = CLASSES[only.id].spellcasting.progression; lvl = p === "full" ? only.level : p === "half" ? Math.ceil(only.level / 2) : Math.ceil(only.level / 3); }
    return (SLOTS_FULL[Math.min(20, lvl)] || []).slice();
  }
  function dragonTier(level) {
    const t = DRAGON_RULES.tiers; let cur = t[0];
    t.forEach((r) => { if (level >= r.level) cur = r; });
    return cur;
  }
  function derive(s = S) {
    const total = s.classes.reduce((a, c) => a + c.level, 0);
    const pb = pbFor(total);
    const mods = {}; ABIL.forEach((a) => (mods[a] = mod(s.abilities[a])));
    const D = { total, pb, mods, classes: [] };
    s.classes.forEach((c) => {
      const C = CLASSES[c.id]; const sub = C.subclasses && C.subclasses[c.sub];
      const ctx = { lvl: c.level, total, pb, mod: (a) => mods[a], dragon: s.dragon && s.dragon.name };
      const feats = [];
      for (let l = 1; l <= c.level; l++) {
        (C.features[l] || []).forEach((f) => feats.push({ ...f, level: l, src: C.name, text: typeof f.text === "function" ? f.text(ctx) : f.text }));
        if (sub) (sub.features[l] || []).forEach((f) => feats.push({ ...f, level: l, src: sub.name, text: typeof f.text === "function" ? f.text(ctx) : f.text }));
      }
      const sc = C.spellcasting; const out = { ...c, C, sub, ctx, feats,
        resources: (C.resources ? C.resources(c.level, mods, total) : []).concat(sub && sub.resources ? sub.resources(c.level, mods, total) : []) };
      if (sc) {
        const am = mods[sc.ability];
        out.dc = 8 + pb + am; out.atk = pb + am; out.ability = sc.ability;
        out.cantrips = C.cantripsKnown ? C.cantripsKnown[c.level] : 0;
        out.prepMax = C.preparedCount ? C.preparedCount(c.level, mods) : 0;
        out.domain = [];
        if (sub && sub.domainSpells) Object.keys(sub.domainSpells).forEach((l) => { if (c.level >= +l) out.domain.push(...sub.domainSpells[l]); });
      }
      D.classes.push(out);
    });
    D.caster = D.classes.find((c) => c.dc != null) || null;
    D.slots = slotsFor(s.classes);
    D.maxSpellLevel = D.slots.length;
    const a = s.armor;
    const dexPart = a.dexCap == null || a.dexCap === "" ? mods.dex : Math.min(mods.dex, +a.dexCap);
    D.ac = (+a.base || 10) + dexPart + (a.shield ? 2 : 0) + (+a.misc || 0);
    const fx = { init: 0, speed: 0, hpPerLevel: 0, passive: 0, saves: [], resources: [] };
    (s.feats || []).forEach((f) => {
      const F = (window.FEATS || []).find((x) => x.key === f.key); if (!F || !F.fx) return;
      fx.init += F.fx.init || 0; fx.speed += F.fx.speed || 0; fx.hpPerLevel += F.fx.hpPerLevel || 0; fx.passive += F.fx.passive || 0;
      if (F.fx.saveProf && f.abil) fx.saves.push(f.abil);
      if (F.fx.resource) fx.resources.push(F.fx.resource);
    });
    D.fx = fx;
    D.init = mods.dex + (+s.initMisc || 0) + fx.init;
    D.eff = conditionEffects(s);
    D.baseSpeed = (+s.speed || 0) + fx.speed;
    D.speed = D.eff.speedZero.length ? 0 : D.eff.speedHalf.length ? Math.floor(D.baseSpeed / 2) : D.baseSpeed;
    D.baseHpMax = s.hp.rolls.reduce((x, y) => x + (+y || 0), 0) + total * (mods.con + fx.hpPerLevel) + (+s.hp.misc || 0);
    D.hpMax = D.eff.hpHalf.length ? Math.floor(D.baseHpMax / 2) : D.baseHpMax;
    D.hitDice = s.classes.map((c) => c.level + "d" + CLASSES[c.id].hitDie).join(" + ");
    D.save = (k) => mods[k] + (s.saveProf.includes(k) || fx.saves.includes(k) ? pb : 0);
    D.skill = (k, ab) => mods[ab] + Math.floor((s.skills[k] || 0) * pb);
    D.passive = (k, ab) => 10 + D.skill(k, ab) + (k === "perception" || k === "investigation" ? fx.passive : 0);
    D.resources = [].concat(...D.classes.map((c) => c.resources), fx.resources).filter((r) => r.max > 0);
    D.carry = s.abilities.str * 15;
    D.weight = s.inventory.reduce((x, i) => x + (+i.qty || 0) * (+i.wt || 0), 0);
    const dBonus = { ac: 0, why: [] };
    D.classes.forEach((c) => { if (c.sub && c.sub.dragonBonus) { const b = c.sub.dragonBonus(s, c.level); dBonus.ac += b.ac || 0; dBonus.why.push(...(b.why || [])); } });
    D.dragon = deriveDragon(s, total, pb, dBonus);
    return D;
  }
  /* Option panels (infusions, wards…) from every class and subclass the character has. */
  function panelsFor(D) {
    const out = [];
    D.classes.forEach((c) => [].concat(c.C.panels || [], (c.sub && c.sub.panels) || []).forEach((p) => out.push({ P: p, c })));
    return out;
  }
  function deriveDragon(s, total, riderPB, bonus = { ac: 0, why: [] }) {
    const K = DRAGON_KINDS[s.dragon.kind] || {};
    const ab = s.dragon.abilities || K.abilities || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    const m = {}; ABIL.forEach((a) => (m[a] = mod(ab[a])));
    const tier = dragonTier(total); const pb = tier.pb;
    const ctx = { mod: (a) => m[a], pb };
    const hpMax = DRAGON_RULES.hpBase + total + m.con + tier.hp;
    const sizes = DRAGON_RULES.tiers.map((t) => t.size);
    const unlockIdx = sizes.indexOf(DRAGON_RULES.essence.unlockSize);
    const essence = sizes.indexOf(tier.size) >= unlockIdx && unlockIdx >= 0;
    const unlockTier = DRAGON_RULES.tiers[unlockIdx];
    return {
      K, ab, m, tier, pb, hpMax, essence, unlockLevel: unlockTier ? unlockTier.level : null,
      essenceMax: DRAGON_RULES.essence.pool(riderPB, total),
      acBase: DRAGON_RULES.acBase + pb,
      ac: DRAGON_RULES.acBase + pb + bonus.ac, acWhy: bonus.why,
      dc: 8 + pb + m.con,
      biteHit: m.str + pb,
      save: (k) => m[k] + (K.saveBonus && K.saveBonus[k] ? pb : 0),
      pp: 10 + m.wis,
      feats: (K.features || []).filter((f) => total >= f.level).map((f) => ({ ...f, text: typeof f.text === "function" ? f.text(ctx, s.name.split(" ")[0]) : f.text }))
    };
  }
  const SPELL_INDEX = {};
  Object.values(window.SPELLS).forEach((list) => list.forEach((r) => {
    SPELL_INDEX[r[0]] = { name: r[0], level: r[1], school: r[2], time: r[3], range: r[4], comp: r[5], dur: r[6], conc: r[7].includes("C"), ritual: r[7].includes("R"), text: r[8], x: r[9] || {} };
  }));

  /* ---------- persistence ---------- */
  const SYNC = { db: null, ref: null, status: "local", canWrite: true, myRevs: new Set(), timer: null, writing: Promise.resolve(), pendingRemote: null, loaded: false };
  function persist() {
    S.updatedAt = Date.now();
    lsSet(LS_KEY, JSON.stringify(S));
    report();
    if (!SYNC.ref || !SYNC.canWrite) return;
    clearTimeout(SYNC.timer);
    setSync("saving");
    SYNC.timer = setTimeout(() => {
      const rev = Math.random().toString(36).slice(2); SYNC.myRevs.add(rev);
      const body = { rev, updatedAt: S.updatedAt, state: JSON.stringify(S) };
      SYNC.writing = SYNC.writing.then(() => SYNC.ref.set(body)).then(() => setSync("synced"))
        .catch((e) => {
          if (e && e.code === "invalid_argument") { SYNC.canWrite = false; setSync("readonly"); }
          else if (e && e.code === "quota_exceeded") { setSync("full"); }
          else setSync("error");
        });
    }, 700);
  }
  function setSync(st) { SYNC.status = st; const el = $("#sync"); if (el) el.outerHTML = syncChip(); }
  function syncChip() {
    const map = {
      local: ["", "Saved on this device"], saving: ["", "Saving…"], synced: ["ok", "Synced"],
      readonly: ["warn", "View only · changes stay on this device"], error: ["warn", "Sync failed · saved on this device"], full: ["warn", "Storage full"]
    };
    const [c, t] = map[SYNC.status] || map.local;
    return `<span id="sync" class="chip ${c}" title="Where your changes are kept">${t}</span>`;
  }
  /* The first answer from the online copy settles which state is real; only then does the sheet report to the
     DM's party sheet or take damage the DM sent, so a device that never opened this sheet can't report stale numbers. */
  function markLoaded() {
    if (SYNC.loaded) return;
    SYNC.loaded = true; report();
    if (SYNC.db) watchParty(SYNC.db);
  }
  async function initSync() {
    if (!window.claude || !window.claude.use) { report(); return; }
    try {
      const db = await window.claude.use("db");
      if (!db) { report(); return; }
      SYNC.db = db; SYNC.ref = db.doc("sheets/" + window.CHARACTER_ID);
      setSync("synced");
      try {
        const user = await window.claude.use("user");
        if (user && user.can) { const w = await user.can("data.write"); if (w === false) { SYNC.canWrite = false; setSync("readonly"); } }
      } catch (e) { /* keep defaults */ }
      SYNC.ref.onSnapshot((snap) => {
        if (snap.metadata && snap.metadata.hasPendingWrites) return;
        const fromCache = !!(snap.metadata && snap.metadata.fromCache);
        // nothing online yet: upload this device's copy if it was ever edited here
        if (!snap.exists) { if (!fromCache) { if (S.updatedAt) persist(); markLoaded(); } return; }
        const d = snap.data();
        if (!d || !d.state || SYNC.myRevs.has(d.rev)) { markLoaded(); return; }
        // this device changed the sheet after the online copy was saved (e.g. edited offline): keep this device's copy
        if (S.updatedAt && S.updatedAt > (+d.updatedAt || 0)) { if (!fromCache) { persist(); markLoaded(); } return; }
        try { applyRemote(migrate(JSON.parse(d.state))); } catch (e) { /* malformed remote state */ }
        markLoaded();
      }, () => { setSync("error"); markLoaded(); });
      ["portrait", "dragon"].forEach((k) => {
        db.doc("art/" + window.CHARACTER_ID + "-" + k).onSnapshot((snap) => {
          if (snap.exists && snap.data().dataUrl) { ART[k] = snap.data().dataUrl; render(); }
        }, () => {});
      });
    } catch (e) { setSync("local"); report(); }
  }
  function applyRemote(next) {
    const a = document.activeElement;
    if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) { SYNC.pendingRemote = next; return; }
    if (JSON.stringify(next) === JSON.stringify(S)) return;
    S = next; lsSet(LS_KEY, JSON.stringify(S)); render(); renderModal(); report();
  }

  /* ---------- link to the DM's party sheet ----------
     report(): the numbers the party sheet shows live. Kept in this browser (drsheet-link:<id>, so a party sheet open in the
     same browser sees it) and, on the website, sent online through js/cloud.js.
     watchParty(): damage, healing, conditions and long rests the DM sends from the party sheet. Each one carries a time and
     applies once (S.dm keeps the newest time applied per kind), so the player can still change things here afterwards. */
  function report() {
    if (!S || (SYNC.ref && !SYNC.loaded)) return;
    const D = derive(), g = D.dragon, c = D.caster, id = window.CHARACTER_ID;
    const saves = {}; ABIL.forEach((a) => { saves[a] = D.save(a); });
    const conds = S.conds.slice(); if (S.concentration) conds.push("concentrating");
    const rep = {
      t: "dr-hero", v: 1, id, name: S.name, at: new Date().toISOString(), restAt: (S.dm && S.dm.rest) || "",
      live: {
        level: D.total, classes: classLine(D), race: S.race, ac: D.ac, init: D.init, speed: D.speed, pp: D.passive("perception", "wis"),
        dc: c ? c.dc : null, saves, saveProf: S.saveProf.concat(D.fx.saves),
        hp: { cur: Math.min(S.hp.current, D.hpMax), max: D.hpMax, temp: S.hp.temp || 0 }, death: S.death,
        conds, exh: +S.exhaustion || 0, insp: !!S.inspiration, hero: S.heroPoints, conc: S.concentration || "", defenses: S.defenses || ""
      },
      dragon: {
        // base AC: the party sheet adds Dragonwarden wards itself
        name: S.dragon.name || "", kind: D.dragon.K.title || "", ac: g.acBase, dc: g.dc, hit: g.biteHit, pb: g.pb, init: g.m.dex,
        hp: { cur: S.dragon.hpCurrent == null ? g.hpMax : Math.min(S.dragon.hpCurrent, g.hpMax), max: g.hpMax, temp: S.dragon.hpTemp || 0 },
        breathReady: S.dragon.breathReady !== false
      }
    };
    lsSet("drsheet-link:" + id, JSON.stringify(rep));
    if (window.sheetsReport) window.sheetsReport(id, rep);
  }
  function longRestNow() {
    const D = derive();
    S.hp.current = D.hpMax; S.hp.temp = 0; S.slotsUsed = Array(10).fill(0); S.resUsed = {};
    S.hitDiceUsed = Math.max(0, S.hitDiceUsed - Math.max(1, Math.floor(D.total / 2)));
    S.death = { s: 0, f: 0 }; S.concentration = "";
    Object.values(S.panels || {}).forEach((p) => { p.used = {}; });
    S.dragon.hpCurrent = null; S.dragon.hpTemp = 0; S.dragon.breathReady = true; S.dragon.guardUsed = false; S.dragon.essenceUsed = 0;
  }
  function dmSeen() { if (!S.dm) S.dm = { hp: {}, cond: {}, rest: "" }; return S.dm; }
  /* "Resistance: poison" · "fire resist" · "immune to cold" → "resist" | "immune" | "" for one damage type */
  function defenseFor(text, type) {
    if (!type) return "";
    let out = "";
    String(text || "").toLowerCase().split(/[.;]/).forEach((part) => {
      if (!new RegExp("\\b" + type + "\\b").test(part)) return;
      if (/immun/.test(part)) out = "immune"; else if (/resist/.test(part) && out !== "immune") out = "resist";
    });
    return out;
  }
  function dmHp(c, dragon) {
    const D = derive(), amt = Math.max(0, Math.floor(+c.amt || 0)), type = c.type && c.type !== "untyped" ? String(c.type) : "";
    if (dragon) {
      const g = D.dragon; let cur = S.dragon.hpCurrent == null ? g.hpMax : S.dragon.hpCurrent; const nm = S.dragon.name || "Your dragon";
      let txt;
      if (c.temp) { S.dragon.hpTemp = Math.max(S.dragon.hpTemp || 0, amt); txt = `${nm}: ${amt} temp HP`; }
      else if (c.heal) { const was = cur; cur = Math.min(g.hpMax, cur + amt); txt = `${nm} healed ${cur - was}`; }
      else {
        const r = defenseFor(g.K.immunities ? g.K.immunities + " immune" : "", type);
        const d = r === "immune" ? 0 : r === "resist" ? Math.floor(amt / 2) : amt;
        const t = Math.min(S.dragon.hpTemp || 0, d); S.dragon.hpTemp = (S.dragon.hpTemp || 0) - t; cur = Math.max(0, cur - (d - t));
        txt = `${nm} took ${d}${type ? " " + type : ""}${r ? ` (${r === "immune" ? "immune" : "halved"})` : ""}${t ? `, ${t} from temp HP` : ""}`;
      }
      S.dragon.hpCurrent = cur >= g.hpMax ? null : cur; return txt;
    }
    if (c.temp) { S.hp.temp = Math.max(S.hp.temp || 0, amt); return `${amt} temp HP`; }
    if (c.heal) {
      const was = Math.min(S.hp.current, D.hpMax); S.hp.current = Math.min(D.hpMax, was + amt);
      if (S.hp.current > 0) S.death = { s: 0, f: 0 };
      return `Healed ${S.hp.current - was}`;
    }
    let r = defenseFor(S.defenses, type); if (!r && S.conds.includes("petrified")) r = "resist";
    const d = r === "immune" ? 0 : r === "resist" ? Math.floor(amt / 2) : amt;
    const t = Math.min(S.hp.temp || 0, d); S.hp.temp = (S.hp.temp || 0) - t;
    const was = S.hp.current; S.hp.current = Math.max(0, was - (d - t));
    let txt = `Took ${d}${type ? " " + type : ""} damage${r ? ` (${r === "immune" ? "immune" : "halved"})` : ""}${t ? `, ${t} from temp HP` : ""}`;
    if (was === 0 && d - t > 0) { S.death.f = Math.min(3, S.death.f + 1); txt += ". Hit at 0 HP: one death save failure"; }
    else if (S.hp.current === 0) txt += ". Down to 0 HP: start rolling death saves";
    else if (S.concentration && d > 0) txt += `. Concentration: CON save DC ${Math.max(10, Math.floor(d / 2))}`;
    return txt;
  }
  function watchParty(db) {
    const me = window.CHARACTER_ID, mine = [[me, false], [me + "-dragon", true]];
    db.doc("party/hp").onSnapshot((s) => {
      const all = (s.exists && s.data()) || {}, seen = dmSeen(), msg = [];
      mine.forEach(([k, dragon]) => {
        const list = (all[k] || []).filter((c) => c && c.at && c.at > (seen.hp[k] || "")).sort((x, y) => (x.at < y.at ? -1 : 1));
        if (seen.hp[k] == null) { if (list.length) seen.hp[k] = list[list.length - 1].at; else seen.hp[k] = ""; return; } // first link: skip old ones
        list.forEach((c) => { seen.hp[k] = c.at; msg.push(dmHp(c, dragon)); });
      });
      if (msg.length) { commit(); toast("From the DM", msg.map(esc).join("<br>"), 7000); }
    }, () => {});
    db.doc("party/conds").onSnapshot((s) => {
      const mine2 = ((s.exists && s.data()) || {})[me] || {}, seen = dmSeen(), msg = [];
      const first = !seen.condLinked; seen.condLinked = true; let changed = first;
      Object.keys(mine2).forEach((k) => {
        const v = mine2[k] || {}, at = String(v.at || "");
        if (!at || at <= (seen.cond[k] || "")) return; seen.cond[k] = at; changed = true;
        if (first) return; // first link: skip what was sent before
        if (k === "exh") { const x = Math.max(0, Math.min(6, +v.v || 0)); if (x !== +S.exhaustion) { S.exhaustion = x; msg.push(`exhaustion ${x}`); } return; }
        if (k === "insp") { if (!!v.on !== !!S.inspiration) { S.inspiration = !!v.on; msg.push(v.on ? "inspiration" : "removed inspiration"); } return; }
        if (k === "concentrating") {
          if (!v.on && S.concentration) { msg.push(`ended concentration on ${S.concentration}`); S.concentration = ""; }
          else if (v.on && !S.concentration) { S.concentration = "a spell"; msg.push("concentrating"); }
          return;
        }
        const c = CONDITIONS.find((x) => x[0] === k); if (!c) return;
        if (S.conds.includes(k) !== !!v.on) { S.conds = v.on ? S.conds.concat(k) : S.conds.filter((x) => x !== k); msg.push((v.on ? "" : "removed ") + c[1].toLowerCase()); }
      });
      if (msg.length) { commit(); toast("The DM set", esc(msg.join(", "))); } else if (changed) persist();
    }, () => {});
    db.doc("party/rest").onSnapshot((s) => {
      if (!s.exists) return; const at = String((s.data() || {}).at || ""), seen = dmSeen();
      if (!at || at <= (seen.rest || "")) return;
      const first = !seen.rest; seen.rest = at;
      if (first && Date.now() - Date.parse(at) > 6 * 3600e3) { persist(); return; } // an old rest from before this sheet linked up
      longRestNow(); commit(); toast("Long rest from the DM", "HP, spell slots and features restored.");
    }, () => {});
  }
  document.addEventListener("focusout", () => setTimeout(() => {
    const a = document.activeElement;
    if (SYNC.pendingRemote && !(a && /INPUT|TEXTAREA|SELECT/.test(a.tagName))) { const n = SYNC.pendingRemote; SYNC.pendingRemote = null; applyRemote(n); }
  }, 50));

  /* art: local copy first, synced copy when db is available */
  ["portrait", "dragon"].forEach((k) => { ART[k] = lsGet(LS_KEY + ":art:" + k); });
  function artSrc(k) { return ART[k] || (window.DEFAULT_ART && window.DEFAULT_ART[k]) || ""; }
  async function saveArt(k, dataUrl) {
    ART[k] = dataUrl; lsSet(LS_KEY + ":art:" + k, dataUrl || ""); render();
    if (SYNC.db && SYNC.canWrite) {
      try {
        const ref = SYNC.db.doc("art/" + window.CHARACTER_ID + "-" + k);
        if (dataUrl) await ref.set({ dataUrl, updatedAt: Date.now() }); else await ref.delete();
        toast("Art saved", "Everyone with the sheet open sees it now.");
      } catch (e) { toast("Art kept on this device", "It couldn't be synced: " + (e && e.code || "unknown error")); }
    }
  }
  function shrinkImage(file) {
    return new Promise((res, rej) => {
      const img = new Image(); const url = URL.createObjectURL(file);
      img.onload = () => {
        let max = 1100, q = 0.82, out = "";
        for (let i = 0; i < 6; i++) {
          const sc = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement("canvas"); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          out = c.toDataURL("image/webp", q); if (!out.startsWith("data:image/webp")) out = c.toDataURL("image/jpeg", q);
          if (out.length < 230000) break; max = Math.round(max * 0.8); q = Math.max(0.6, q - 0.06);
        }
        URL.revokeObjectURL(url); res(out);
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("That file isn't an image the browser can read.")); };
      img.src = url;
    });
  }

  /* ---------- mutation ---------- */
  function commit(rerender = true) { persist(); if (rerender) { render(); renderModal(); } }
  function toast(title, sub, ms = 4200) {
    const el = document.createElement("div"); el.className = "toast";
    el.innerHTML = `<div>${title}</div>${sub ? `<div class="t-sub">${sub}</div>` : ""}`;
    $("#toasts").appendChild(el); setTimeout(() => el.remove(), ms);
    while ($("#toasts").children.length > 4) $("#toasts").firstChild.remove();
  }
  /* Real dice are the default. "Sheet rolls" is opt-in. */
  const physical = () => S.diceMode !== "digital";
  /* kind: { type: "attack" | "check" | "save", ab } lets conditions set advantage, disadvantage or auto-fail. */
  function d20(label, bonus, extra, physExtra, kind) {
    const st = rollState(kind, derive());
    if (st.fail.length) { toast(`${esc(label)}: automatic failure`, `Because you are ${esc([...new Set(st.fail)].join(", ").toLowerCase())}.`); return; }
    const how = st.mode === "adv" ? "with advantage" : st.mode === "dis" ? "with disadvantage" : "";
    const why = st.why && st.mode !== "normal" ? ` (${esc(st.why)})` : st.why ? ` · ${esc(st.why)}` : "";
    if (physical()) {
      toast(`${esc(label)}: d20 <b class="num">${sg(bonus)}</b>${how ? ` ${how}` : ""}`, [how ? `Roll two d20s and keep the ${st.mode === "adv" ? "higher" : "lower"}${why}` : "", physExtra || ""].filter(Boolean).join(" · "));
      return;
    }
    const a = rnd(20), b = rnd(20); let pick = a, note = "";
    if (st.mode === "adv") { pick = Math.max(a, b); note = ` (advantage: ${a}, ${b})`; }
    if (st.mode === "dis") { pick = Math.min(a, b); note = ` (disadvantage: ${a}, ${b})`; }
    const lucky = pick === 1 && S.traits.some((t) => t.name === "Lucky") ? " · Natural 1: Lucky lets you reroll" : "";
    const crit = pick === 20 ? " · Natural 20!" : "";
    toast(`${esc(label)}: <b class="num">${pick + bonus}</b>`, `d20 ${pick}${note}${why} ${sg(bonus)}${crit}${lucky}${extra ? " · " + extra : ""}`);
  }

  /* ---------- rendering ---------- */
  function render() {
    const D = derive();
    const act = document.activeElement; const fid = act && act.id; let sel = null;
    try { sel = fid && act.selectionStart != null ? [act.selectionStart, act.selectionEnd] : null; } catch (e) { sel = null; }
    $("#app").innerHTML = header(D) + vitals(D) + condStrip(D) + tabs(D) + `<div id="page">${page(D)}</div>`;
    if (fid) { const el = document.getElementById(fid); if (el) { el.focus(); if (sel) try { el.setSelectionRange(sel[0], sel[1]); } catch (e) { /* not text */ } } }
  }
  function classLine(D) {
    return D.classes.map((c) => `${c.C.name} ${c.level}${c.sub ? " · " + c.sub.name : ""}`).join(" / ");
  }
  function header(D) {
    return `<header class="hero">
      <div class="hero-portrait">${artSrc("portrait") ? `<img src="${esc(artSrc("portrait"))}" alt="Portrait of ${esc(S.name)}">` : ""}</div>
      <div style="min-width:0">
        <h1>${esc(S.name)}</h1>
        <div class="sub">${esc(classLine(D))} · ${esc(S.race)} · ${esc(S.background)} · ${esc(S.alignment)}</div>
        <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">${syncChip()}
          <span class="chip bronze">Level ${D.total}</span>
          <span class="chip arc">Bonded: ${esc(S.dragon.name || "unnamed " + (D.dragon.K.title || "dragon").toLowerCase())}</span>
          ${S.concentration ? `<span class="chip warn">Concentrating: ${esc(S.concentration)} <button class="icon-btn" data-act="endConc" aria-label="End concentration">✕</button></span>` : ""}
        </div>
      </div>
      <div class="hero-actions">
        <button class="btn primary" data-act="levelUp" ${D.total >= 20 ? "disabled" : ""}>Level up</button>
        <button class="btn" data-act="shortRest">Short rest</button>
        <button class="btn" data-act="longRest">Long rest</button>
        <button class="btn" data-act="toggleEdit" aria-pressed="${UI.edit}">${UI.edit ? "Done editing" : "Edit sheet"}</button>
        <button class="btn" data-act="settings" aria-label="Sheet options">Options</button>
      </div>
    </header>`;
  }
  function vitals(D) {
    const hpPct = Math.max(0, Math.min(100, (S.hp.current / D.hpMax) * 100));
    const c = D.caster;
    const hdLeft = D.total - S.hitDiceUsed;
    const tile = (label, v, extra = "") => `<div class="stat ${extra}"><span class="label">${label}</span><span class="v">${v}</span></div>`;
    return `<section class="vitals" aria-label="Combat stats"><div class="tiles">
      ${UI.edit ? `<div class="stat"><span class="label">Armor class</span><span class="v num">${D.ac}</span><button class="btn sm" data-act="tab" data-tab="overview">Armor ↓</button></div>` : tile("Armor class", D.ac)}
      <div class="stat" style="cursor:pointer" data-act="rollInit"><span class="label">Initiative</span><span class="v">${sg(D.init)}</span></div>
      <div class="stat"><span class="label">Speed</span><span class="v" style="${D.speed !== D.baseSpeed ? "color:var(--bad)" : ""}">${D.speed}<small style="font-size:.9rem"> ft</small></span>${D.speed !== D.baseSpeed ? `<span class="small muted">normally ${D.baseSpeed}</span>` : ""}</div>
      ${tile("Proficiency", sg(D.pb))}
      ${tile("Spell DC", c ? c.dc : "—")}
      ${tile("Spell attack", c ? sg(c.atk) : "—")}
      <div class="stat toggle ${S.inspiration ? "on" : ""}" data-act="inspire" role="button" aria-pressed="${S.inspiration}"><span class="label">Inspiration</span><span class="v">${S.inspiration ? "★" : "☆"}</span></div>
      <div class="stat" title="Homebrew: up to 3 hero points"><span class="label">Hero points</span>
        <span class="pips" style="justify-content:center;margin-top:4px">${[0, 1, 2].map((j) => `<button class="pip hero ${S.heroPoints > j ? "on" : ""}" data-act="hero" data-j="${j}" aria-label="Hero point ${j + 1}${S.heroPoints > j ? " (available)" : " (empty)"}"></button>`).join("")}</span>
        <span class="small muted num">${S.heroPoints} / 3</span></div>
      </div>
      <div class="stat hp" style="text-align:left;padding:10px 14px">
        <div><span class="label">Hit points</span><div class="hp-big">${Math.min(S.hp.current, D.hpMax)}<small> / ${D.hpMax}</small>${S.hp.temp ? ` <small style="color:var(--arc)">+${S.hp.temp} temp</small>` : ""}</div></div>
        <div class="hp-ctl">
          <input id="hp-amt" class="f n" type="number" min="0" inputmode="numeric" aria-label="Amount" placeholder="0">
          <button class="btn sm" data-act="hp" data-k="dmg">Damage</button>
          <button class="btn sm" data-act="hp" data-k="heal">Heal</button>
          <button class="btn sm" data-act="hp" data-k="temp">Temp</button>
        </div>
        <div class="hp-bar"><i style="width:${hpPct}%;${hpPct < 34 ? "background:var(--bad)" : ""}"></i></div>
        <div class="hp-meta">
          <span>Hit dice <b class="num" style="color:var(--ink)">${hdLeft}</b> / ${esc(D.hitDice)}</span>
          <span>Death saves
            <span style="color:var(--good)" aria-hidden="true">✓</span><span class="pips">${[0, 1, 2].map((i) => `<button class="pip good ${S.death.s > i ? "on" : ""}" data-act="death" data-k="s" data-i="${i}" aria-label="Success ${i + 1}"></button>`).join("")}</span>
            <span style="color:var(--bad);margin-left:4px" aria-hidden="true">✕</span><span class="pips">${[0, 1, 2].map((i) => `<button class="pip bad ${S.death.f > i ? "on" : ""}" data-act="death" data-k="f" data-i="${i}" aria-label="Failure ${i + 1}"></button>`).join("")}</span>
          </span>
          <span class="seg" role="group" aria-label="Dice"><button data-act="diceMode" data-k="physical" aria-pressed="${physical()}" title="Buttons show what to roll; you roll real dice">Roll my own dice</button><button data-act="diceMode" data-k="digital" aria-pressed="${!physical()}" title="Buttons roll for you">Sheet rolls</button></span>
          ${physical() ? "" : `<span class="seg" role="group" aria-label="Roll mode">${["normal", "adv", "dis"].map((m) => `<button data-act="rollMode" data-k="${m}" aria-pressed="${UI.rollMode === m}">${{ normal: "Normal", adv: "Adv", dis: "Dis" }[m]}</button>`).join("")}</span>`}
        </div>
      </div>
    </section>`;
  }
  function tabs(D) {
    const T = [["overview", "Overview"], ["attacks", "Attacks"], ["spells", "Spells"], ["features", "Features"]];
    const pn = panelsFor(D);
    if (pn.length) T.push(["panels", window.DEFAULT_CHARACTER.panelsTab || pn.map((x) => x.P.title).join(" & ")]);
    T.push(["dragon", "Dragon bond"], ["inventory", "Inventory"], ["story", "Story & art"]);
    const cur = T.some(([k]) => k === UI.tab) ? UI.tab : "overview";
    return `<nav class="tabs" role="tablist">${T.map(([k, n]) => `<button role="tab" class="tab ${k === "dragon" ? "dragon-tab" : ""}" aria-selected="${cur === k}" data-act="tab" data-tab="${k}">${esc(n)}</button>`).join("")}</nav>`;
  }
  function page(D) {
    if (UI.tab === "panels" && !panelsFor(D).length) return overview(D);
    return ({ overview, attacks, spells, features, panels, dragon, inventory, story }[UI.tab] || overview)(D);
  }

  /* ---- Option panels (artificer infusions, Dragonwarden wards…) ----
     S.panels[id] = { known: [keys] | null, active: { key: "what it's on" }, used: { key: n }, charges: { key: n } } */
  function panels(D) {
    return `<div class="grid2">${panelsFor(D).map(({ P, c }) => panelCard(P, c, D)).join("")}</div>`;
  }
  /* Active count; with countTargets, "Ametrin, Navarre" counts as two. */
  function panelCount(P, st) {
    return Object.values(st.active).reduce((n, v) => n + (P.countTargets ? Math.max(1, String(v || "").split(",").filter((t) => t.trim()).length) : 1), 0);
  }
  function panelCard(P, c, D) {
    const st = S.panels[P.id] || (S.panels[P.id] = { known: null, active: {}, used: {}, charges: {} });
    const txt = (v) => (typeof v === "function" ? v(c.ctx) : v || "");
    const maxActive = P.active ? P.active(c.level) : Infinity;
    const maxKnown = P.known ? P.known(c.level) : null;
    const nActive = panelCount(P, st);
    const knownSet = maxKnown == null ? null : new Set(st.known || []);
    const editing = UI.panelEdit === P.id;
    const shown = P.options.filter((o) => editing || !knownSet || knownSet.has(o.key) || st.active[o.key] != null);
    const rows = shown.map((o) => {
      const on = st.active[o.key] != null;
      const early = o.lvl && c.level < o.lvl;
      const uses = o.uses ? `<span class="pips">${Array.from({ length: o.uses.max }, (_, j) => `<button class="pip slot ${(st.used[o.key] || 0) > j ? "on" : ""}" data-act="panelUse" data-p="${P.id}" data-k="${o.key}" data-j="${j}" aria-label="${esc(o.name)} use ${j + 1}"></button>`).join("")}</span> <span class="small muted">${o.uses.reset === "short" ? "per short rest" : "per long rest"}</span>` : "";
      const ch = o.charges && on ? `<div class="choice" style="margin-top:6px"><span class="label">Charges</span><span class="pips">${Array.from({ length: o.charges.max }, (_, j) => `<button class="pip slot ${(st.charges[o.key] || 0) > j ? "on" : ""}" data-act="panelCharge" data-p="${P.id}" data-k="${o.key}" data-j="${j}" aria-label="${esc(o.name)} charge ${j + 1}${(st.charges[o.key] || 0) > j ? " (spent)" : ""}"></button>`).join("")}</span><span class="small muted">${o.charges.max - (st.charges[o.key] || 0)} left · ${esc(o.charges.note || "")}</span></div>` : "";
      const target = on ? `<label class="small" style="display:block;margin-top:6px">${esc(P.targetLabel || "On")}${o.own ? ` <span class="muted">(${esc(S.dragon.name || "your dragon")} only)</span>` : ""}
          ${inp(`panels.${P.id}.active.${o.key}`, { label: P.targetLabel || "Target", ph: P.targetPh || "" })}</label>` : "";
      const pick = editing && knownSet ? `<input type="checkbox" class="chk" data-act="panelKnow" data-p="${P.id}" data-k="${o.key}" ${knownSet.has(o.key) ? "checked" : ""} aria-label="Know ${esc(o.name)}">` : "";
      return `<div class="feat">
        <h4>${pick}${esc(o.name)}${o.lvl && o.lvl > 2 ? `<span class="badge">Lvl ${o.lvl}</span>` : ""}${on ? `<span class="badge dom">Active</span>` : ""}
          <span style="margin-left:auto;display:flex;gap:8px;align-items:center">${uses}${editing ? "" : `<button class="btn sm ${on ? "" : "primary"}" data-act="panelToggle" data-p="${P.id}" data-k="${o.key}" aria-pressed="${on}">${on ? "End" : "Activate"}</button>`}</span></h4>
        <p>${esc(txt(o.text))}</p>${early ? `<p class="small" style="color:var(--warn);margin:2px 0 0">Normally needs ${esc(c.C.name.toLowerCase())} level ${o.lvl}. Keep it if the DM allowed it.</p>` : ""}${target}${ch}</div>`;
    }).join("");
    return `<section class="panel"><div class="ph"><h2>${esc(P.title)}</h2>
        <span class="choice"><span class="chip ${nActive > maxActive ? "warn" : "bronze"}">${nActive} / ${maxActive} ${esc(P.activeLabel || "active")}</span>
        ${maxKnown != null ? `<span class="chip">${(st.known || []).length} / ${maxKnown} known</span><button class="btn sm" data-act="panelEdit" data-p="${P.id}" aria-pressed="${editing}">${editing ? "Done" : "Change known"}</button>` : ""}</span></div>
      <p class="small muted" style="margin:0 0 6px">${esc(txt(P.intro))}</p>
      ${editing ? `<p class="small" style="margin:0 0 6px">Tick the ones you know. You can swap one whenever you gain an artificer level.</p>` : ""}
      ${rows || `<p class="small muted">Nothing chosen yet. Use “Change known” to pick.</p>`}</section>`;
  }
  const inp = (path, opts = {}) => {
    const v = getPath(S, path);
    const id = "f-" + path.replace(/\./g, "-");
    if (opts.area) return `<textarea id="${id}" class="f" data-bind="${path}" ${opts.ph ? `placeholder="${esc(opts.ph)}"` : ""} rows="${opts.rows || 4}">${esc(v)}</textarea>`;
    return `<input id="${id}" class="f ${opts.num ? "n" : ""}" ${opts.num ? 'type="number" data-num="1"' : 'type="text"'} data-bind="${path}" value="${esc(v)}" ${opts.ph ? `placeholder="${esc(opts.ph)}"` : ""} ${opts.style ? `style="${opts.style}"` : ""} aria-label="${esc(opts.label || path)}">`;
  };

  /* ---- Overview ---- */
  function overview(D) {
    const abil = ABIL.map((a) => `<div class="ab" data-act="rollAbil" data-k="${a}" title="Roll ${ABIL_NAME[a]} check">
        <div class="label">${ABIL_NAME[a].slice(0, 3)}</div>
        <div class="m">${sg(D.mods[a])}</div>
        ${UI.edit ? `<input id="f-ab-${a}" class="f n" type="number" data-bind="abilities.${a}" data-num="1" value="${S.abilities[a]}" aria-label="${ABIL_NAME[a]} score">` : `<span class="s num">${S.abilities[a]}</span>`}
      </div>`).join("");
    const saves = ABIL.map((a) => `<div class="row" data-act="rollSave" data-k="${a}">
        ${UI.edit ? `<input type="checkbox" class="chk" data-act="saveProf" data-k="${a}" ${S.saveProf.includes(a) ? "checked" : ""} aria-label="${ABIL_NAME[a]} save proficiency">` : `<span class="dot ${S.saveProf.includes(a) || D.fx.saves.includes(a) ? "p" : ""}"></span>`}
        <span class="b">${sg(D.save(a))}</span><span>${ABIL_NAME[a]}</span><span class="tag" style="color:var(--bad)">${D.eff.saveFail[a].length ? "auto-fail" : D.eff.saveDis[a].length ? "disadv." : ""}</span></div>`).join("");
    const skills = SKILLS.map(([k, n, ab]) => {
      const p = S.skills[k] || 0;
      return `<div class="row" data-act="rollSkill" data-k="${k}">
        ${UI.edit ? `<button class="dot ${p === 2 ? "e" : p ? "p" : ""}" style="padding:0" data-act="skillProf" data-k="${k}" aria-label="Cycle ${n} proficiency" title="None → proficient → expertise"></button>` : `<span class="dot ${p === 2 ? "e" : p ? "p" : ""}"></span>`}
        <span class="b">${sg(D.skill(k, ab))}</span><span>${n}</span><span class="tag">${ab}</span></div>`;
    }).join("");
    const cs = rollState({ type: "check" }, D);
    const checkChip = cs.mode === "dis" ? `<span class="chip warn" title="${esc(cs.why)}">Disadvantage</span>` : "";
    const anySave = ABIL.some((a) => D.eff.saveFail[a].length || D.eff.saveDis[a].length);
    const saveChip = anySave ? `<span class="chip warn">Affected by conditions</span>` : "";
    const armor = UI.edit ? `<div class="inline-grid" style="margin-top:8px">
        <label class="small">Armor ${inp("armor.name", { label: "Armor name" })}</label>
        <label class="small">Base AC ${inp("armor.base", { num: 1, label: "Base AC" })}</label>
        <label class="small">Max DEX bonus (blank = none) ${inp("armor.dexCap", { num: 1, label: "Max Dex bonus" })}</label>
        <label class="small">Misc AC ${inp("armor.misc", { num: 1, label: "Misc AC" })}</label>
        <label class="small" style="align-self:end"><input type="checkbox" class="chk" data-bindchk="armor.shield" ${S.armor.shield ? "checked" : ""}> Shield (+2)</label>
        <label class="small">Speed ${inp("speed", { num: 1, label: "Speed" })}</label>
        <label class="small">Initiative misc ${inp("initMisc", { num: 1, label: "Initiative misc" })}</label>
        <label class="small">HP misc ${inp("hp.misc", { num: 1, label: "HP misc" })}</label>
      </div>
      <p class="small muted">HP max = hit die rolls (${S.hp.rolls.join(", ")}) + level × CON mod + misc.</p>` : "";
    return `<div class="grid3">
      <div class="stack">
        <section class="panel"><h2>Abilities</h2><div class="abil">${abil}</div></section>
        <section class="panel"><div class="ph"><h2>Saving throws</h2>${saveChip}</div><div class="rows">${saves}</div>
          ${window.DEFAULT_CHARACTER.saveNote ? `<p class="small muted" style="margin:8px 4px 0">${esc(window.DEFAULT_CHARACTER.saveNote)}</p>` : ""}</section>
      </div>
      <div class="stack">
        <section class="panel"><div class="ph"><h2>Skills</h2>${checkChip}</div><div class="rows">${skills}</div>
          <div class="passives">
            <div class="stat"><span class="label">Passive perception</span><span class="v">${D.passive("perception", "wis")}</span></div>
            <div class="stat"><span class="label">Passive insight</span><span class="v">${D.passive("insight", "wis")}</span></div>
            <div class="stat"><span class="label">Passive investig.</span><span class="v">${D.passive("investigation", "int")}</span></div>
          </div>
        </section>
      </div>
      <div class="stack">
        <section class="panel"><h2>Armor & defenses</h2>
          <dl class="kv">
            <dt>Armor</dt><dd>${esc(S.armor.name)}${S.armor.shield ? " + shield" : ""} · AC ${D.ac}${S.armor.note ? ` <span class="muted small">(${esc(S.armor.note)})</span>` : ""}</dd>
            <dt>Defenses</dt><dd>${UI.edit ? inp("defenses", { label: "Defenses" }) : esc(S.defenses)}</dd>
            <dt>Senses</dt><dd>${UI.edit ? inp("senses", { label: "Senses", ph: "e.g. Darkvision 60 ft." }) : esc(S.senses || "—")}</dd>
            <dt>Other effects</dt><dd>${inp("conditionsNote", { label: "Other effects", ph: "Spells or effects on you, e.g. Bless" })}</dd>
          </dl>${armor}
        </section>
        <section class="panel"><h2>Proficiencies</h2>
          <dl class="kv">
            <dt>Armor</dt><dd>${UI.edit ? inp("profs.armor") : esc(S.profs.armor)}</dd>
            <dt>Weapons</dt><dd>${UI.edit ? inp("profs.weapons") : esc(S.profs.weapons)}</dd>
            <dt>Tools</dt><dd>${UI.edit ? inp("profs.tools") : esc(S.profs.tools || "—")}</dd>
            <dt>Languages</dt><dd>${UI.edit ? inp("profs.languages") : esc(S.profs.languages)}</dd>
          </dl>
        </section>
      </div>
    </div>`;
  }
  function cantripDice(sp, D) {
    const n = 1 + (D.total >= 5) + (D.total >= 11) + (D.total >= 17);
    return n + sp.x.cantrip.dice;
  }

  /* ---------- conditions (2014 PHB, Appendix A) ---------- */
  const CONDITIONS = [
    ["blinded", "Blinded", { atkDis: 1 }, "You can't see and automatically fail checks that need sight. Your attacks have disadvantage; attacks against you have advantage."],
    ["charmed", "Charmed", {}, "You can't attack the charmer or target it with harmful abilities or magic. The charmer has advantage on social checks against you."],
    ["deafened", "Deafened", {}, "You can't hear and automatically fail checks that need hearing."],
    ["frightened", "Frightened", { atkDis: 1, checkDis: 1 }, "Disadvantage on ability checks and attacks while the source is in sight. You can't willingly move closer to it."],
    ["grappled", "Grappled", { speedZero: 1 }, "Your speed is 0. Ends if the grappler is incapacitated or you're moved out of its reach."],
    ["incapacitated", "Incapacitated", { cantAct: 1 }, "You can't take actions or reactions."],
    ["invisible", "Invisible", { atkAdv: 1 }, "You can't be seen without magic or special senses. Your attacks have advantage; attacks against you have disadvantage."],
    ["paralyzed", "Paralyzed", { cantAct: 1, speedZero: 1, failStrDex: 1 }, "Incapacitated and can't move or speak. You fail STR and DEX saves. Attacks against you have advantage, and hits from within 5 ft are critical hits."],
    ["petrified", "Petrified", { cantAct: 1, speedZero: 1, failStrDex: 1 }, "Turned to stone: incapacitated, can't move or speak, unaware of surroundings. You fail STR and DEX saves, resist all damage, and are immune to poison and disease. Attacks against you have advantage."],
    ["poisoned", "Poisoned", { atkDis: 1, checkDis: 1 }, "Disadvantage on attack rolls and ability checks."],
    ["prone", "Prone", { atkDis: 1 }, "You can only crawl unless you stand up (costs half your speed). Your attacks have disadvantage. Melee attacks within 5 ft have advantage against you; other attacks have disadvantage."],
    ["restrained", "Restrained", { speedZero: 1, atkDis: 1, dexSaveDis: 1 }, "Your speed is 0. Your attacks and DEX saves have disadvantage; attacks against you have advantage."],
    ["stunned", "Stunned", { cantAct: 1, speedZero: 1, failStrDex: 1 }, "Incapacitated, can't move, and can speak only falteringly. You fail STR and DEX saves. Attacks against you have advantage."],
    ["unconscious", "Unconscious", { cantAct: 1, speedZero: 1, failStrDex: 1, atkDis: 1 }, "Incapacitated, can't move or speak, unaware, and prone. You drop what you hold and fail STR and DEX saves. Attacks against you have advantage, and hits from within 5 ft are critical hits."]
  ];
  const EXHAUSTION = ["", "Disadvantage on ability checks", "Speed halved", "Disadvantage on attack rolls and saving throws", "Hit point maximum halved", "Speed reduced to 0", "Death"];
  function conditionEffects(s) {
    const E = { atkAdv: [], atkDis: [], checkDis: [], saveDis: {}, saveFail: {}, speedZero: [], speedHalf: [], hpHalf: [], cantAct: [], lines: [] };
    ABIL.forEach((a) => { E.saveDis[a] = []; E.saveFail[a] = []; });
    (s.conds || []).forEach((k) => {
      const c = CONDITIONS.find((x) => x[0] === k); if (!c) return; const n = c[1], f = c[2];
      if (f.atkAdv) E.atkAdv.push(n);
      if (f.atkDis) E.atkDis.push(n);
      if (f.checkDis) E.checkDis.push(n);
      if (f.speedZero) E.speedZero.push(n);
      if (f.cantAct) E.cantAct.push(n);
      if (f.failStrDex) { E.saveFail.str.push(n); E.saveFail.dex.push(n); }
      if (f.dexSaveDis) E.saveDis.dex.push(n);
    });
    const ex = +s.exhaustion || 0, xn = `Exhaustion ${ex}`;
    if (ex >= 1) E.checkDis.push(xn);
    if (ex >= 2) E.speedHalf.push(xn);
    if (ex >= 3) { E.atkDis.push(xn); ABIL.forEach((a) => E.saveDis[a].push(xn)); }
    if (ex >= 4) E.hpHalf.push(xn);
    if (ex >= 5) E.speedZero.push(xn);
    const list = (a) => [...new Set(a)].join(", ");
    if (ex >= 6) E.lines.push(["bad", "Exhaustion 6: the character dies."]);
    if (E.cantAct.length) E.lines.push(["bad", `Can't take actions or reactions (${list(E.cantAct)})`]);
    if (E.speedZero.length) E.lines.push(["bad", `Speed 0 (${list(E.speedZero)})`]);
    else if (E.speedHalf.length) E.lines.push(["warn", `Speed halved (${list(E.speedHalf)})`]);
    if (E.hpHalf.length) E.lines.push(["warn", `Hit point maximum halved (${list(E.hpHalf)})`]);
    if (E.atkAdv.length && E.atkDis.length) E.lines.push(["", `Attack rolls: advantage (${list(E.atkAdv)}) and disadvantage (${list(E.atkDis)}) cancel out`]);
    else if (E.atkAdv.length) E.lines.push(["ok", `Advantage on attack rolls (${list(E.atkAdv)})`]);
    else if (E.atkDis.length) E.lines.push(["warn", `Disadvantage on attack rolls (${list(E.atkDis)})`]);
    if (E.checkDis.length) E.lines.push(["warn", `Disadvantage on ability checks and initiative (${list(E.checkDis)})`]);
    if (E.saveFail.str.length) E.lines.push(["bad", `Automatically fail STR and DEX saves (${list(E.saveFail.str)})`]);
    const sd = [...new Set([].concat(...ABIL.map((a) => E.saveDis[a])))];
    if (ex >= 3) E.lines.push(["warn", `Disadvantage on all saving throws (${xn})`]);
    else if (sd.length) E.lines.push(["warn", `Disadvantage on DEX saves (${list(sd)})`]);
    return E;
  }
  /* How a d20 roll should be made right now: { mode: "normal"|"adv"|"dis", why, fail } */
  function rollState(kind, D) {
    const E = D.eff; const adv = [], dis = []; let fail = [];
    if (kind) {
      if (kind.type === "attack") { adv.push(...E.atkAdv); dis.push(...E.atkDis); }
      if (kind.type === "check") dis.push(...E.checkDis);
      if (kind.type === "save") { dis.push(...E.saveDis[kind.ab]); fail = E.saveFail[kind.ab]; }
    }
    if (!physical() && UI.rollMode === "adv") adv.push("chosen");
    if (!physical() && UI.rollMode === "dis") dis.push("chosen");
    const u = (a) => [...new Set(a)].filter((x) => x !== "chosen").join(", ");
    if (adv.length && dis.length) return { mode: "normal", why: "advantage and disadvantage cancel", fail };
    if (adv.length) return { mode: "adv", why: u(adv), fail };
    if (dis.length) return { mode: "dis", why: u(dis), fail };
    return { mode: "normal", why: "", fail };
  }
  function condStrip(D) {
    const on = new Set(S.conds);
    const chips = CONDITIONS.map(([k, n, , t]) => `<button class="cchip ${on.has(k) ? "on" : ""}" data-act="cond" data-k="${k}" aria-pressed="${on.has(k)}" title="${esc(t)}">${n}</button>`).join("");
    const lines = D.eff.lines.map(([c, t]) => `<li class="${c}">${esc(t)}</li>`).join("");
    const active = CONDITIONS.filter((c) => on.has(c[0]));
    return `<section class="panel conds" aria-label="Conditions">
      <div class="ph"><h2>Conditions</h2>
        <label class="small">Exhaustion <select id="f-exhaustion" class="f" style="width:auto;padding:1px 4px" data-bind="exhaustion" data-num="1">${[0, 1, 2, 3, 4, 5, 6].map((n) => `<option value="${n}" ${S.exhaustion == n ? "selected" : ""}>${n}${n ? " · " + EXHAUSTION[n] : " · none"}</option>`).join("")}</select></label></div>
      <div class="cchips">${chips}</div>
      ${lines ? `<ul class="effects">${lines}</ul>` : `<p class="small muted" style="margin:8px 0 0">No conditions. Click one to apply it; its effects update your speed, HP and rolls automatically.</p>`}
      ${active.length ? `<details class="small" style="margin-top:6px"><summary>What these conditions do</summary>${active.map((c) => `<p style="margin:4px 0"><b>${c[1]}:</b> ${esc(c[3])}</p>`).join("")}</details>` : ""}
    </section>`;
  }

  /* ---------- attacks ---------- */
  function attackCalc(w, D) {
    const ab = w.ability || (w.kind === "ranged" ? "dex" : "str");
    const am = ab === "finesse" ? Math.max(D.mods.str, D.mods.dex) : ab === "spell" ? (D.caster ? D.mods[D.caster.ability] : 0) : D.mods[ab] || 0;
    const hit = am + (w.prof ? D.pb : 0) + (+w.magic || 0);
    const dmgMod = ab === "spell" ? 0 : am + (+w.magic || 0);
    const dmg = /d/.test(w.dice) ? `${w.dice}${dmgMod ? sg(dmgMod).replace("−", "-") : ""}` : String(Math.max(0, (+w.dice || 0) + dmgMod));
    const vm = /versatile \((\d+d\d+)\)/i.exec(w.props || "");
    const two = vm ? `${vm[1]}${dmgMod ? sg(dmgMod).replace("−", "-") : ""}` : "";
    return { hit, dmg, two };
  }
  function isProficient(name, cat) {
    const p = (S.profs.weapons || "").toLowerCase();
    return p.includes(cat + " weapons") || p.includes(name.toLowerCase());
  }
  function attacks(D) {
    const st = rollState({ type: "attack" }, D);
    const modeChip = st.mode === "dis" ? `<span class="chip warn">Disadvantage: ${esc(st.why)}</span>` : st.mode === "adv" ? `<span class="chip ok">Advantage: ${esc(st.why)}</span>` : "";
    const row = (w, i) => {
      const r = attackCalc(w, D);
      const reach = w.kind === "ranged" ? (w.range ? w.range + " ft" : "—") : `${/reach/i.test(w.props || "") ? 10 : 5} ft${w.range ? `<br><span class="small muted">thrown ${esc(w.range)}</span>` : ""}`;
      const main = `<tr class="click" data-act="rollAttack" data-i="${i}" data-hit="${r.hit}" data-dmg="${esc(r.dmg)}">
        <td><b>${esc(w.name || "Unnamed weapon")}</b>${+w.magic ? ` <span class="badge dom">+${+w.magic}</span>` : ""}${w.prof ? "" : `<div class="small" style="color:var(--warn)">Not proficient</div>`}</td>
        <td class="num"><b>${sg(r.hit)}</b></td>
        <td class="num">${esc(r.dmg)} ${esc(w.type)}${r.two ? `<br><span class="small muted">${esc(r.two)} two-handed</span>` : ""}</td>
        <td class="num">${reach}</td>
        <td class="small muted">${esc([w.props, w.notes].filter(Boolean).join(" · "))}</td>
        <td><button class="icon-btn edit" data-act="atkEdit" data-i="${i}" aria-label="Edit ${esc(w.name)}" aria-expanded="${UI.atkEdit === i}">✎</button></td></tr>`;
      if (UI.atkEdit !== i) return main;
      const f = (k, label, opts = {}) => `<label class="small">${label}${inp(`attacks.${i}.${k}`, { label, ...opts })}</label>`;
      return main + `<tr><td colspan="6" style="background:var(--panel-2)"><div class="inline-grid">
        ${f("name", "Name")}
        <label class="small">Type<select id="f-atk-${i}-kind" class="f" data-bind="attacks.${i}.kind"><option value="melee" ${w.kind !== "ranged" ? "selected" : ""}>Melee</option><option value="ranged" ${w.kind === "ranged" ? "selected" : ""}>Ranged</option></select></label>
        <label class="small">Attack ability<select id="f-atk-${i}-ab" class="f" data-bind="attacks.${i}.ability">${[["str", "Strength"], ["dex", "Dexterity"], ["finesse", "Finesse (best of STR/DEX)"], ["spell", "Spellcasting"]].concat(D.classes.some((cl) => cl.sub && cl.sub.intWeapons) || w.ability === "int" ? [["int", "Intelligence (magic weapon)"]] : []).map(([v, n]) => `<option value="${v}" ${w.ability === v ? "selected" : ""}>${n}</option>`).join("")}</select></label>
        ${f("dice", "Damage dice", { ph: "1d8" })}${f("type", "Damage type")}${f("range", "Range (ft)", { ph: "e.g. 80/320" })}
        ${f("magic", "Magic bonus", { num: 1 })}${f("props", "Properties")}${f("notes", "Notes")}
        <label class="small" style="align-self:end"><input type="checkbox" class="chk" data-bindchk="attacks.${i}.prof" ${w.prof ? "checked" : ""}> Proficient</label>
      </div><div class="choice" style="margin-top:8px"><button class="btn sm" data-act="atkEdit" data-i="${i}">Done</button><button class="btn sm danger" data-act="delAttack" data-i="${i}">Remove weapon</button></div></td></tr>`;
    };
    const table = (kind) => {
      const rows = S.attacks.map((w, i) => ((w.kind || "melee") === kind ? row(w, i) : "")).join("");
      return rows ? `<div class="tw"><table class="t"><thead><tr><th>Weapon</th><th>To hit</th><th>Damage</th><th>${kind === "melee" ? "Reach" : "Range"}</th><th>Properties</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`
        : `<p class="small muted" style="margin:0">No ${kind} weapons yet. Add one from the list.</p>`;
    };
    const c = D.caster;
    const spellRows = c ? (S.cantrips || []).map((n) => SPELL_INDEX[n]).filter((sp) => sp && sp.x.cantrip).map((sp) => {
      const dice = cantripDice(sp, D);
      return `<tr class="click" data-act="castCantrip" data-name="${esc(sp.name)}"><td><b>${esc(sp.name)}</b><div class="small muted">Cantrip</div></td><td class="num">${sp.x.cantrip.save ? sp.x.cantrip.save.toUpperCase() + " DC " + c.dc : sg(c.atk)}</td><td class="num">${dice} ${sp.x.cantrip.type}</td><td class="num">${esc(sp.range)}</td></tr>`;
    }).concat(spellsAvailable(c).map((r) => SPELL_INDEX[r[0]]).filter((sp) => sp.level >= 1 && sp.x.dmg && sp.level <= D.maxSpellLevel && (S.prepared.includes(sp.name) || c.domain.includes(sp.name))).map((sp) => {
      return `<tr class="click" data-act="cast" data-name="${esc(sp.name)}"><td><b>${esc(sp.name)}</b><div class="small muted">${ORD[sp.level]} level · uses a slot</div></td><td class="num">${sp.x.dmg.attack ? sg(c.atk) : (sp.x.dmg.save || "").toUpperCase() + " DC " + c.dc}</td><td class="num">${esc(effectLine(sp, sp.level, D).split(", ").pop())}</td><td class="num">${esc(sp.range)}</td></tr>`;
    })).join("") : "";
    const groups = [["simple", "melee", "Simple melee"], ["simple", "ranged", "Simple ranged"], ["martial", "melee", "Martial melee"], ["martial", "ranged", "Martial ranged"]];
    const opts = groups.map(([cat, kind, label]) => `<optgroup label="${label}">${(window.WEAPONS || []).filter((w) => w[1] === cat && w[2] === kind).map((w) => `<option value="${esc(w[0])}">${esc(w[0])} · ${w[3]} ${w[4]}${isProficient(w[0], w[1]) ? "" : " (not proficient)"}</option>`).join("")}</optgroup>`).join("");
    const ds = D.classes.find((cl) => cl.feats.some((f) => f.name === "Divine Strike"));
    return `<div class="grid2" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr)">
      <div class="stack">
        ${D.eff.cantAct.length ? `<section class="panel" style="border-color:var(--bad)"><b style="color:var(--bad)">You can't take actions or reactions</b> <span class="small muted">(${esc(D.eff.cantAct.join(", "))})</span></section>` : ""}
        <section class="panel"><div class="ph"><h2>Melee weapons</h2>${modeChip}</div>${table("melee")}</section>
        <section class="panel"><div class="ph"><h2>Ranged weapons</h2>${modeChip}</div>${table("ranged")}
          <p class="small muted" style="margin:8px 0 0">Attacking beyond normal range (up to long range) has disadvantage. Ranged attacks with an enemy within 5 ft also have disadvantage.</p></section>
        ${spellRows ? `<section class="panel"><div class="ph"><h2>Spell attacks</h2><span class="small muted">Save DC ${c.dc} · attack ${sg(c.atk)}</span></div>
          <div class="tw"><table class="t"><thead><tr><th>Spell</th><th>Hit / DC</th><th>Damage</th><th>Range</th></tr></thead><tbody>${spellRows}</tbody></table></div></section>` : ""}
      </div>
      <div class="stack">
        <section class="panel"><h2>Add a weapon</h2>
          <select id="add-weapon" class="f" aria-label="Weapon to add"><option value="">Choose from the Player's Handbook…</option>${opts}</select>
          <div class="choice" style="margin-top:8px"><button class="btn sm primary" data-act="addWeapon">Add weapon</button><button class="btn sm" data-act="addAttack">Custom weapon</button></div>
          <p class="small muted" style="margin:8px 0 0">To-hit and damage are worked out from your scores and proficiencies. Use ✎ to set a magic bonus or change details.</p></section>
        ${ds ? `<section class="panel"><h2>Divine Strike</h2><p style="margin:0">Once on each of your turns, when you hit with a weapon attack, deal an extra <b>${ds.level >= 14 ? "2d8" : "1d8"} radiant</b> damage.</p></section>` : ""}
        <section class="panel"><h2>On your turn</h2>
          <dl class="kv small">
            <dt>Move</dt><dd>Up to your speed (${D.speed} ft), split before and after your action.</dd>
            <dt>Action</dt><dd>Attack, Cast a Spell, Dash, Disengage, Dodge, Help, Hide, Ready, Search, or Use an Object.</dd>
            <dt>Bonus</dt><dd>Only when a feature or spell gives you one, like Healing Word or Spiritual Weapon.</dd>
            <dt>Reaction</dt><dd>One per round, such as an opportunity attack when an enemy leaves your reach.</dd>
            <dt>Free</dt><dd>Interact with one object, like drawing a weapon or opening a door.</dd>
          </dl></section>
      </div></div>`;
  }

  /* ---- Spells ---- */
  /* The class list, plus always-prepared subclass spells that aren't on it. */
  function spellsAvailable(c) {
    const list = window.SPELLS[c.C.spellcasting.list] || [];
    const have = new Set(list.map((r) => r[0]));
    const extra = (c.domain || []).filter((n) => !have.has(n) && SPELL_INDEX[n]).map((n) => { const x = SPELL_INDEX[n]; return [x.name, x.level]; });
    return list.concat(extra);
  }
  const alwaysLabel = (c) => (c && c.sub && c.sub.alwaysLabel) || "Domain";
  function spells(D) {
    const c = D.caster;
    if (!c) return `<section class="panel"><p>This character doesn't cast spells.</p></section>`;
    const prepCount = S.prepared.filter((n) => SPELL_INDEX[n] && SPELL_INDEX[n].level <= D.maxSpellLevel && !c.domain.includes(n)).length;
    const slots = D.slots.map((n, i) => `<div class="slotgrp"><span class="label">${ORD[i + 1]}</span><span class="pips">${Array.from({ length: n }, (_, j) => `<button class="pip slot ${S.slotsUsed[i + 1] > j ? "on" : ""}" data-act="slot" data-l="${i + 1}" data-j="${j}" aria-label="${ORD[i + 1]} level slot ${j + 1}${S.slotsUsed[i + 1] > j ? " (used)" : ""}"></button>`).join("")}</span></div>`).join("");
    const list = spellsAvailable(c).map((r) => SPELL_INDEX[r[0]]);
    const show = (sp) => {
      if (sp.level === 0) return S.cantrips.includes(sp.name) || UI.spellView === "all";
      if (sp.level > D.maxSpellLevel) return false;
      return UI.spellView === "all" || S.prepared.includes(sp.name) || c.domain.includes(sp.name);
    };
    let html = "";
    for (let L = 0; L <= Math.max(0, D.maxSpellLevel); L++) {
      const items = list.filter((sp) => sp.level === L && show(sp));
      const extra = S.extraSpells.map((x, i) => ({ ...x, i })).filter((x) => +x.level === L);
      if (!items.length && !extra.length && L > 0) continue;
      const head = L === 0 ? `Cantrips <span class="small muted">${S.cantrips.length} / ${c.cantrips} known</span>` : `${ORD[L]} level <span class="small muted">${D.slots[L - 1] - S.slotsUsed[L]} of ${D.slots[L - 1]} slots left</span>`;
      html += `<div class="splevel"><h3>${head}</h3>${items.map((sp) => spellRow(sp, c, D)).join("")}${extra.map((x) => extraRow(x)).join("")}</div>`;
    }
    return `<div class="grid2" style="grid-template-columns:minmax(0,1fr)">
      <section class="panel">
        <div class="ph"><h2>Spellcasting · ${esc(c.C.name)}</h2>
          <span class="seg" role="group" aria-label="Spell list view">
            <button data-act="spellView" data-k="prepared" aria-pressed="${UI.spellView === "prepared"}">Prepared</button>
            <button data-act="spellView" data-k="all" aria-pressed="${UI.spellView === "all"}">Full ${esc(c.C.name.toLowerCase())} list</button>
          </span></div>
        <div style="display:flex;gap:18px;flex-wrap:wrap;margin-bottom:12px" class="small">
          <span><span class="label">Ability</span> <b>${ABIL_NAME[c.ability]}</b></span>
          <span><span class="label">Save DC</span> <b class="num">${c.dc}</b></span>
          <span><span class="label">Attack</span> <b class="num">${sg(c.atk)}</b></span>
          <span><span class="label">Prepared</span> <b class="num" style="color:${prepCount > c.prepMax ? "var(--bad)" : "inherit"}">${prepCount} / ${c.prepMax}</b> <span class="muted">+ ${c.domain.length} ${esc(alwaysLabel(c).toLowerCase())}</span></span>
        </div>
        <div class="slots">${slots}</div>
        <p class="small muted" style="margin:10px 0 0">Click a slot to mark it used. A long rest restores every slot. ${c.sub && c.sub.healBonus ? "Healing results include Disciple of Life." : ""}</p>
        ${html}
        <div class="splevel"><h3>Other spells <span class="small muted">from feats, items or the DM</span></h3>
          <button class="btn sm" data-act="addExtraSpell">Add a spell</button></div>
      </section></div>`;
  }
  function spellRow(sp, c, D) {
    const dom = c.domain.includes(sp.name);
    const prep = sp.level === 0 ? S.cantrips.includes(sp.name) : dom || S.prepared.includes(sp.name);
    const open = UI.open[sp.name];
    const box = sp.level === 0
      ? `<input type="checkbox" class="chk" data-act="toggleCantrip" data-name="${esc(sp.name)}" ${prep ? "checked" : ""} aria-label="Know ${esc(sp.name)}">`
      : dom ? `<span title="Always prepared" style="color:var(--bronze);text-align:center">◆</span>`
        : `<input type="checkbox" class="chk" data-act="togglePrep" data-name="${esc(sp.name)}" ${prep ? "checked" : ""} aria-label="Prepare ${esc(sp.name)}">`;
    const effect = effectLine(sp, sp.level, D);
    return `<div class="sp ${prep ? "" : "off"}">
      <div class="sp-head">${box}
        <div style="min-width:0"><span class="sp-name" data-act="openSpell" data-name="${esc(sp.name)}">${esc(sp.name)}</span>${dom ? `<span class="badge dom">${esc(alwaysLabel(c))}</span>` : ""}${sp.conc ? `<span class="badge">Conc.</span>` : ""}${sp.ritual ? `<span class="badge">Ritual</span>` : ""}
          <div class="sp-meta">${esc(sp.time)} · ${esc(sp.range)} · ${esc(sp.dur)}${effect ? " · " + effect : ""}</div></div>
        ${sp.level === 0 ? (sp.x.cantrip ? `<button class="btn sm" data-act="castCantrip" data-name="${esc(sp.name)}">${physical() ? "Use" : "Roll"}</button>` : "") : prep ? `<button class="btn sm" data-act="cast" data-name="${esc(sp.name)}">Cast</button>` : ""}
      </div>
      ${open ? `<div class="sp-body"><div class="small muted">${ORD[sp.level]}${sp.level ? " level" : ""} ${esc(sp.school.toLowerCase())} · ${esc(sp.comp)}</div><p style="margin:4px 0 0">${esc(sp.text)}</p></div>` : ""}
    </div>`;
  }
  function extraRow(x) {
    return `<div class="sp"><div class="sp-head"><span style="text-align:center;color:var(--arc)">◇</span>
      <div style="display:grid;grid-template-columns:minmax(0,1fr) 5em;gap:6px">
        <input id="f-xs-${x.i}-name" class="f" data-bind="extraSpells.${x.i}.name" value="${esc(x.name)}" placeholder="Spell name" aria-label="Spell name">
        <input id="f-xs-${x.i}-level" class="f" type="number" min="0" max="9" data-num="1" data-bind="extraSpells.${x.i}.level" value="${esc(x.level)}" aria-label="Spell level">
        <input id="f-xs-${x.i}-notes" class="f" style="grid-column:1/-1" data-bind="extraSpells.${x.i}.notes" value="${esc(x.notes)}" placeholder="Source, uses, effect" aria-label="Spell notes">
      </div>
      <button class="icon-btn" data-act="delExtraSpell" data-i="${x.i}" aria-label="Remove spell">✕</button></div></div>`;
  }
  function effectLine(sp, slot, D) {
    const x = sp.x; const c = D.caster; const up = slot - sp.level;
    if (x.heal) {
      const supreme = c.feats.some((f) => f.name === "Supreme Healing");
      let s;
      if (x.heal.flat) s = `${x.heal.flat + (x.heal.upFlat || 0) * up} HP`;
      else {
        const dice = addDice(x.heal.dice, x.heal.up || x.heal.dice, x.heal.up ? up : 0);
        const bonus = (x.heal.mod ? D.mods[c.ability] : 0) + (x.heal.flatAdd || 0) + (c.sub && c.sub.healBonus && slot > 0 ? c.sub.healBonus(slot, c.level) : 0);
        s = `heals ${supreme ? "max " : ""}${dice}${bonus ? sg(bonus) : ""}`;
      }
      return s;
    }
    if (x.dmg) {
      let dice = x.dmg.dice;
      if (x.dmg.up) dice = addDice(dice, x.dmg.up, up);
      if (x.dmg.up2) dice = addDice(dice, x.dmg.up2, Math.floor(up / 2));
      const m = x.dmg.mod ? sg(D.mods[c.ability]) : "";
      return `${x.dmg.attack ? sg(c.atk) + " to hit" : (x.dmg.save || "").toUpperCase() + " DC " + c.dc}, ${dice}${m} ${x.dmg.type}`;
    }
    if (x.cantrip) return `${x.cantrip.save ? x.cantrip.save.toUpperCase() + " DC " + c.dc : sg(c.atk) + " to hit"}, ${cantripDice(sp, D)} ${x.cantrip.type}`;
    return "";
  }

  /* ---- Features ---- */
  function features(D) {
    const res = D.resources.map((r) => {
      const used = S.resUsed[r.id] || 0;
      return `<div class="res"><div><b>${esc(r.name)}</b> <span class="small muted">${r.reset === "short" ? "short or long rest" : "long rest"}</span>${r.note ? `<div class="small muted">${esc(r.note)}</div>` : ""}</div>
        <span class="pips">${Array.from({ length: r.max }, (_, j) => `<button class="pip slot ${used > j ? "on" : ""}" data-act="res" data-id="${r.id}" data-j="${j}" aria-label="${esc(r.name)} use ${j + 1}"></button>`).join("")}</span></div>`;
    }).join("");
    const group = (title, list) => list.length ? `<section class="panel"><h2>${title}</h2>${list.map((f) => `<div class="feat"><h4>${esc(f.name)}${f.level ? `<span class="badge">Lvl ${f.level}</span>` : ""}${f.source ? `<span class="badge">${esc(f.source)}</span>` : ""}</h4><p>${esc(f.text)}</p></div>`).join("")}</section>` : "";
    const cls = D.classes.map((c) => group(`${c.C.name} features`, c.feats.filter((f) => f.src === c.C.name && !f.spells && !(f.name === "Ability Score Improvement")))
      + (c.sub ? group(`${c.sub.name}`, c.feats.filter((f) => f.src === c.sub.name)) : "")).join("");
    const feats = S.feats.map((f, i) => `<div class="feat"><h4>${esc(f.name)}<span class="badge">Lvl ${f.level}</span> ${UI.edit ? `<button class="icon-btn" data-act="delFeat" data-i="${i}" aria-label="Remove feat">✕</button>` : ""}</h4><p>${esc(f.text)}</p></div>`).join("");
    const custom = S.customFeatures.map((f, i) => `<div class="feat" style="display:grid;gap:6px">
      <div style="display:flex;gap:6px"><input id="f-cf-${i}-name" class="f" data-bind="customFeatures.${i}.name" value="${esc(f.name)}" placeholder="Feature name" aria-label="Feature name"><button class="icon-btn" data-act="delCustom" data-i="${i}" aria-label="Remove feature">✕</button></div>
      <textarea id="f-cf-${i}-text" class="f" rows="2" style="min-height:56px" data-bind="customFeatures.${i}.text" placeholder="What it does" aria-label="Feature text">${esc(f.text)}</textarea></div>`).join("");
    return `<div class="grid2">
      <div class="stack">
        ${res ? `<section class="panel"><h2>Limited uses</h2>${res}<p class="small muted" style="margin:6px 0 0">Filled squares are spent.</p></section>` : ""}
        ${cls}
      </div>
      <div class="stack">
        ${group("Race & background", S.traits)}
        <section class="panel"><h2>Feats</h2>${feats || `<p class="muted small" style="margin:0">No feats yet. Choose one instead of an ability increase when you level up.</p>`}</section>
        <section class="panel"><div class="ph"><h2>Other features & boons</h2><button class="btn sm" data-act="addCustom">Add</button></div>
          ${custom || `<p class="muted small" style="margin:0">Blessings, boons, magic item powers and anything the DM hands out.</p>`}</section>
      </div></div>`;
  }

  /* ---- Dragon ---- */
  function dragon(D) {
    const g = D.dragon; const K = g.K; const dS = S.dragon;
    const cur = dS.hpCurrent == null ? g.hpMax : Math.min(dS.hpCurrent, g.hpMax);
    const nm = dS.name || "Unnamed " + (K.title || "Dragon");
    const abil = ABIL.map((a) => `<div><div class="label">${a.toUpperCase()}</div>${UI.edit ? `<input id="f-dab-${a}" class="f n" type="number" data-act-input="dragonAbil" data-k="${a}" value="${g.ab[a]}" aria-label="Dragon ${a}">` : `<div class="num">${g.ab[a]} (${sg(g.m[a])})</div>`}</div>`).join("");
    const saves = ABIL.filter((a) => K.saveBonus && K.saveBonus[a]).map((a) => `${a[0].toUpperCase() + a.slice(1)} ${sg(g.save(a))}`).join(", ");
    const ess = g.essence
      ? `<div class="arc-box"><div class="ph"><h3>Essence pool</h3><span class="num"><b>${g.essenceMax - dS.essenceUsed}</b> / ${g.essenceMax}</span></div>
          <span class="pips" style="flex-wrap:wrap">${Array.from({ length: g.essenceMax }, (_, j) => `<button class="pip ess ${dS.essenceUsed > j ? "on" : ""}" data-act="essence" data-j="${j}" aria-label="Essence point ${j + 1}"></button>`).join("")}</span>
          <ul class="small" style="margin:8px 0 0;padding-left:18px">${DRAGON_RULES.essence.costs.map((c) => `<li>${esc(c.name)}: <b>${c.cost}</b> <button class="btn sm" style="padding:0 6px" data-act="spendEssence" data-n="${c.cost}">Spend</button></li>`).join("")}</ul>
          <p class="small" style="margin:6px 0 0">${esc(DRAGON_RULES.essence.empty)} Pool = rider proficiency + half rider level (rounded up). Refills on a long rest.</p></div>`
      : `<div class="arc-box"><h3>Bonus action command</h3><p class="small" style="margin:0">${esc(DRAGON_RULES.bonusActionCommand)}</p></div>`;
    return `<div class="dragon-wrap">
      <div class="stack">
        ${artCard("dragon", nm)}
        <section class="panel">
          <div class="ph"><h2>Trackers</h2><span class="chip arc">${g.tier.size} · PB ${sg(g.pb)}</span></div>
          <div class="hp" style="display:grid;grid-template-columns:auto 1fr;gap:6px 14px;align-items:center">
            <div><span class="label">Dragon HP</span><div class="hp-big">${cur}<small> / ${g.hpMax}</small>${dS.hpTemp ? ` <small style="color:var(--arc)">+${dS.hpTemp} temp</small>` : ""}</div></div>
            <div class="hp-ctl"><input id="dhp-amt" class="f n" type="number" min="0" aria-label="Dragon HP amount" placeholder="0">
              <button class="btn sm" data-act="dhp" data-k="dmg">Damage</button><button class="btn sm" data-act="dhp" data-k="heal">Heal</button><button class="btn sm" data-act="dhp" data-k="temp">Temp</button></div>
            <div class="hp-bar"><i style="width:${Math.max(0, cur / g.hpMax * 100)}%;background:var(--arc)"></i></div>
          </div>
          <div class="res"><div><b>${esc(K.breath ? K.breath.name || "Breath Weapon" : "Breath Weapon")}</b> <span class="small muted">recharge ${esc(K.breath && K.breath.recharge || "5–6")}</span></div>
            <div class="choice">${dS.breathReady ? `<span class="chip ok">Ready</span><button class="btn sm arc" data-act="breath">Breathe</button>`
              : `<span class="chip warn">Spent</span>
                <label class="small" for="rch-roll">Recharge d6</label><input id="rch-roll" class="f n" type="number" min="1" max="6" inputmode="numeric" placeholder="1–6" aria-label="Your recharge roll on a d6">
                <button class="btn sm" data-act="rechargeCheck">Check</button>
                ${physical() ? "" : `<button class="btn sm" data-act="recharge">Roll for me</button>`}
                <button class="btn sm" data-act="breathReset">Mark ready</button>`}</div></div>
          ${dS.breathReady ? "" : `<p class="small muted" style="margin:0 0 6px">At the start of the dragon's turn, roll a d6 and enter it. On a 5 or 6 the breath is ready again.</p>`}
          ${g.feats.filter((f) => f.kind === "Reaction").slice(0, 1).map((f) => `<div class="res"><div><b>${esc(f.name)}</b> <span class="small muted">reaction${f.per === "short" ? " · once per short rest" : ""}</span></div>
            <div class="choice">${dS.guardUsed ? `<span class="chip warn">${f.per === "short" ? "Used · back after a short rest" : "Used this round"}</span><button class="btn sm" data-act="guardReset">Reset</button>`
              : `<button class="btn sm arc" data-act="guard">Use${f.dice ? ` (${f.dice}${sg(f.diceAbil ? g.m[f.diceAbil] : 0)})` : ""}</button>`}</div></div>`).join("")}
          <div class="res"><div><b>Bite</b> <span class="small muted">${sg(g.biteHit)} to hit</span></div><button class="btn sm" data-act="bite">${physical() ? "Attack" : "Roll attack"}</button></div>
        </section>
        <section class="panel"><h2>Bond & name</h2>
          <label class="small">Dragon's name ${inp("dragon.name", { label: "Dragon name", ph: (K.nameIdeas || []).join(", ") })}</label>
          ${K.nameIdeas ? `<p class="small muted" style="margin:6px 0 10px">Name ideas: ${esc(K.nameIdeas.join(", "))}</p>` : ""}
          <label class="small">Bond notes ${inp("dragon.notes", { area: 1, label: "Bond notes", ph: "Shared moments, quirks, what the dragon wants…" })}</label>
        </section>
      </div>
      <div class="stack">
        <section class="panel statblock">
          <h2 class="big">${esc(nm)}</h2>
          <div class="small" style="font-style:italic">${g.tier.size} Dragon (${esc(K.title || "")}), unaligned · bonded to ${esc(S.name.split(" ")[0])}</div>
          <hr class="sb-rule">
          <div class="sb-line"><b>Armor Class</b> ${g.ac} <span class="muted small">(13 + PB, natural armor${g.acWhy.length ? "; " + esc(g.acWhy.join(", ")) : ""})</span></div>
          <div class="sb-line"><b>Hit Points</b> ${g.hpMax} <span class="muted small">(${DRAGON_RULES.hpBase} + rider level ${D.total} + CON ${sg(g.m.con)}${g.tier.hp ? " + growth " + g.tier.hp : ""})</span></div>
          <div class="sb-line"><b>Speed</b> ${esc(K.speed || "")}</div>
          <hr class="sb-rule">
          <div class="sb-abil">${abil}</div>
          <hr class="sb-rule">
          <div class="sb-line"><b>Saving Throws</b> ${saves}</div>
          <div class="sb-line"><b>Damage Immunities</b> ${esc(K.immunities || "—")}</div>
          <div class="sb-line"><b>Senses</b> ${esc(K.senses || "")}, passive Perception ${g.pp}</div>
          ${K.languages ? `<div class="sb-line"><b>Languages</b> ${esc(K.languages)}</div>` : ""}
          <div class="sb-line"><b>Proficiency Bonus</b> ${sg(g.pb)}</div>
          <h3 style="margin-top:14px;color:var(--bronze);border-bottom:1px solid var(--line);padding-bottom:3px">Actions & abilities</h3>
          <p class="sb-act"><b><i>Bite.</i></b> Melee: ${sg(g.biteHit)} to hit, reach ${esc(K.bite ? K.bite.reach : "5 ft.")} Hit: ${esc(K.bite ? K.bite.dice : "1d6")}${sg(g.m.str)} ${esc(K.bite ? K.bite.type : "piercing")}.</p>
          ${K.breath ? `<p class="sb-act"><b><i>${esc(K.breath.name || "Breath Weapon")} (Recharge ${esc(K.breath.recharge || "5–6")}).</i></b> ${esc(K.breath.shape)}. DC ${g.dc} ${esc((K.breath.save || "dex").toUpperCase())} save, <b>${g.tier.breath}</b> ${esc(K.damageType)} damage. ${esc(K.breath.effect)}</p>` : ""}
          ${g.feats.map((f) => `<p class="sb-act"><b><i>${esc(f.name)}.</i></b> ${f.kind ? `<i>${esc(f.kind)}:</i> ` : ""}${esc(f.text)}</p>`).join("")}
          ${ess}
          <div class="arc-box"><h3>Shared bond</h3><p class="small" style="margin:0">AC is 13 + PB. Attack bonuses and DCs scale with the dragon's proficiency bonus, which grows as you level.</p></div>
        </section>
      </div></div>`;
  }
  function artCard(k, label) {
    const src = artSrc(k);
    return `<section class="panel" style="padding:10px">
      <div class="art ${k === "portrait" ? "tall" : ""}">${src ? `<img src="${esc(src)}" alt="${esc(label)}">` : `<div class="art-empty">No art yet. Upload an image to add ${esc(label)}.</div>`}</div>
      <div class="art-ctl">
        <label class="btn sm" for="up-${k}">Upload art</label><input id="up-${k}" type="file" accept="image/*" data-upload="${k}" hidden>
        ${ART[k] ? `<button class="btn sm" data-act="artReset" data-k="${k}">Use default</button>` : ""}
        <span class="small muted" style="align-self:center">${k === "portrait" ? "Character art" : "Dragon art"}</span>
      </div></section>`;
  }

  /* ---- Inventory ---- */
  function inventory(D) {
    const rows = S.inventory.map((it, i) => `<tr>
      <td><input id="f-inv-${i}-name" class="f" data-bind="inventory.${i}.name" value="${esc(it.name)}" aria-label="Item name"></td>
      <td><input id="f-inv-${i}-qty" class="f n" type="number" data-num="1" data-bind="inventory.${i}.qty" value="${esc(it.qty)}" aria-label="Quantity"></td>
      <td><input id="f-inv-${i}-wt" class="f n" type="number" step="0.5" data-num="1" data-bind="inventory.${i}.wt" value="${esc(it.wt)}" aria-label="Weight each"></td>
      <td><input id="f-inv-${i}-notes" class="f" data-bind="inventory.${i}.notes" value="${esc(it.notes)}" aria-label="Notes"></td>
      <td><button class="icon-btn" data-act="delItem" data-i="${i}" aria-label="Remove ${esc(it.name)}">✕</button></td></tr>`).join("");
    const coins = ["cp", "sp", "ep", "gp", "pp"].map((c) => `<label class="stat"><span class="label">${c}</span>${inp("coins." + c, { num: 1, label: c, style: "width:100%" })}</label>`).join("");
    const over = D.weight > D.carry;
    return `<div class="grid2" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr)">
      <section class="panel"><div class="ph"><h2>Equipment</h2><button class="btn sm" data-act="addItem">Add item</button></div>
        <div class="tw"><table class="t"><thead><tr><th>Item</th><th>Qty</th><th>Lb each</th><th>Notes</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
      </section>
      <div class="stack">
        <section class="panel"><h2>Coins</h2><div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px">${coins}</div></section>
        <section class="panel"><h2>Carrying</h2>
          <dl class="kv"><dt>Carried</dt><dd class="num" style="color:${over ? "var(--bad)" : "inherit"}">${Math.round(D.weight * 10) / 10} lb</dd>
          <dt>Capacity</dt><dd class="num">${D.carry} lb</dd><dt>Push / drag / lift</dt><dd class="num">${D.carry * 2} lb</dd></dl></section>
        <section class="panel"><h2>Attuned items</h2>${[0, 1, 2].map((i) => `<div style="margin-bottom:6px">${inp("attuned." + i, { label: "Attuned item " + (i + 1), ph: "Empty slot" })}</div>`).join("")}</section>
      </div></div>`;
  }

  /* ---- Story ---- */
  function story() {
    const f = (k, label) => `<label class="small"><span class="label">${label}</span>${inp("story." + k, { label })}</label>`;
    const a = (k, label, rows) => `<section class="panel"><h2>${label}</h2>${inp("story." + k, { area: 1, label, rows })}</section>`;
    return `<div class="grid2">
      <div class="stack">
        ${artCard("portrait", "a portrait of " + S.name)}
        ${artCard("dragon", "art of " + (S.dragon.name || "the dragon"))}
      </div>
      <div class="stack">
        <section class="panel"><h2>Details</h2>
          <div class="inline-grid">
            <label class="small"><span class="label">Name</span>${inp("name", { label: "Name" })}</label>
            <label class="small"><span class="label">Player</span>${inp("player", { label: "Player" })}</label>
            <label class="small"><span class="label">Race</span>${inp("race", { label: "Race" })}</label>
            <label class="small"><span class="label">Background</span>${inp("background", { label: "Background" })}</label>
            <label class="small"><span class="label">Alignment</span>${inp("alignment", { label: "Alignment" })}</label>
            ${f("faith", "Faith")}${f("gender", "Gender")}${f("age", "Age")}${f("height", "Height")}${f("weight", "Weight")}${f("eyes", "Eyes")}${f("hair", "Hair")}${f("skin", "Skin")}
          </div></section>
        ${a("personality", "Personality traits", 3)}${a("ideals", "Ideals", 3)}${a("bonds", "Bonds", 3)}${a("flaws", "Flaws", 3)}
      </div>
      ${a("backstory", "Backstory", 7)}
      <div class="stack">${a("allies", "Allies & organizations", 3)}${a("notes", "Session notes", 6)}</div>
    </div>`;
  }

  /* ---------- level up: a step-by-step wizard modeled on D&D Beyond's builder ---------- */
  const FEAT_LIST = () => window.FEATS || [];
  function featCtx(s, D0) { return { s, mods: D0.mods, caster: !!D0.caster, armor: (s.profs.armor || "").toLowerCase() }; }
  function applyAsi(s, L, F) {
    if (L.asiMode === "asi") {
      if (L.asiSplit) [L.asiA, L.asiB].forEach((a) => { if (a) s.abilities[a] = Math.min(20, s.abilities[a] + 1); });
      else if (L.asiA) s.abilities[L.asiA] = Math.min(20, s.abilities[L.asiA] + 2);
    } else if (F && F.abil) {
      const a = F.abil !== "any" && F.abil.length === 1 ? F.abil[0] : L.featAbil;
      if (a) s.abilities[a] = Math.min(20, s.abilities[a] + 1);
    }
  }
  function levelPlan(L) {
    const before = derive(S);
    const C = CLASSES[L.classId];
    const had = S.classes.find((c) => c.id === L.classId);
    const nextClasses = had ? S.classes.map((c) => (c.id === L.classId ? { ...c, level: c.level + 1 } : c))
      : S.classes.concat([{ id: L.classId, sub: Object.keys(C.subclasses || {})[0], level: 1 }]);
    const nc = nextClasses.find((c) => c.id === L.classId);
    const sub = C.subclasses && C.subclasses[nc.sub];
    const raw = (C.features[nc.level] || []).map((f) => ({ ...f, src: C.name })).concat(sub ? (sub.features[nc.level] || []).map((f) => ({ ...f, src: sub.name })) : []);
    const asi = raw.some((f) => f.asi);
    const bc = before.classes.find((c) => c.id === L.classId);
    const cantripGain = Math.max(0, (C.cantripsKnown ? C.cantripsKnown[nc.level] : 0) - (bc ? bc.cantrips || 0 : 0));
    const F = asi && L.asiMode === "feat" && L.feat && L.feat !== "custom" ? FEAT_LIST().find((x) => x.key === L.feat) : null;
    const total = before.total + 1;

    const sim = clone(S); delete sim.history;
    sim.classes = nextClasses;
    if (asi) applyAsi(sim, L, F);
    if (asi && L.asiMode === "feat") {
      if (F) {
        const ab = F.abil && F.abil !== "any" && F.abil.length === 1 ? F.abil[0] : L.featAbil || null;
        sim.feats = sim.feats.concat([{ key: F.key, name: F.name + (F.fx && F.fx.saveProf && ab ? ` (${ABIL_NAME[ab]})` : ""), text: F.text, abil: ab, level: total }]);
      } else if (L.feat === "custom" && L.customName) sim.feats = sim.feats.concat([{ key: "custom", name: L.customName, text: L.customText || "", level: total }]);
    }
    if (L.hpVal != null) sim.hp.rolls = sim.hp.rolls.concat([L.hpVal]);
    (L.cantrips || []).filter(Boolean).forEach((n) => sim.cantrips.push(n));
    if (L.prepared) sim.prepared = L.prepared.slice();
    const after = derive(sim);
    const ac = after.classes.find((c) => c.id === L.classId);
    const feats = raw.map((f) => ({ ...f, text: typeof f.text === "function" ? f.text(ac.ctx) : f.text }));
    const newDomain = (sub && sub.domainSpells && sub.domainSpells[nc.level]) || [];

    const t0 = dragonTier(before.total), t1 = dragonTier(after.total);
    const dragonGains = [];
    if (t0 !== t1) {
      if (t0.size !== t1.size) dragonGains.push(`Grows from <b>${t0.size}</b> to <b>${t1.size}</b>.`);
      if (t0.pb !== t1.pb) dragonGains.push(`Dragon proficiency bonus rises to <b>${sg(t1.pb)}</b>, raising its AC, bite and breath DC.`);
      if (t0.breath !== t1.breath) dragonGains.push(`Breath weapon now deals <b>${t1.breath}</b>.`);
      if (t0.hp !== t1.hp) dragonGains.push(`Gains <b>+${t1.hp - t0.hp}</b> bonus HP from growth.`);
    }
    if (!before.dragon.essence && after.dragon.essence) dragonGains.push(`<b>Essence Pool unlocked.</b> The bonus action command is replaced by a shared pool of ${after.dragon.essenceMax} points.`);
    else if (after.dragon.essence && after.dragon.essenceMax !== before.dragon.essenceMax) dragonGains.push(`Essence Pool grows to <b>${after.dragon.essenceMax}</b> points.`);
    (before.dragon.K.features || []).filter((f) => f.level === after.total).forEach((f) => dragonGains.push(`New ability: <b>${esc(f.name)}</b>.`));

    const need = { class: 0, hp: L.hpVal == null ? 1 : 0, features: 0, spells: 0, dragon: 0, review: 0 };
    let asiNeed = 0;
    if (asi) {
      if (L.asiMode === "asi") asiNeed = L.asiSplit ? (L.asiA && L.asiB && L.asiA !== L.asiB ? 0 : 1) : (L.asiA ? 0 : 1);
      else if (L.feat === "custom") asiNeed = L.customName ? 0 : 1;
      else if (!F) asiNeed = 1;
      else if (F.abil && (F.abil === "any" || F.abil.length > 1) && !L.featAbil) asiNeed = 1;
    }
    need.features += asiNeed;
    const cantripHome = feats.some((f) => f.cantrip) || !after.caster ? "features" : "spells";
    const cantripNeed = Math.max(0, cantripGain - (L.cantrips || []).filter(Boolean).length);
    need[cantripHome] += cantripNeed;
    return { before, after, C, sub, nc, had, feats, newDomain, asi, F, cantripGain, cantripHome, cantripNeed, asiNeed, dragonGains, sim, need };
  }
  function luSteps(P) {
    const st = [["class", "Class"], ["hp", "Hit points"], ["features", "Features"]];
    if (P.after.caster) st.push(["spells", "Spells"]);
    st.push(["dragon", "Dragon bond"], ["review", "Review"]);
    return st;
  }
  const LU_TIPS = {
    class: "Each level you advance one class. Staying in one class is the simplest path; taking a level in a different class is called multiclassing.",
    hp: "Your hit point maximum grows every level. The fixed value is reliable; rolling is a gamble. Your Constitution modifier is added either way.",
    features: "These are the new things your character can do. Cards marked <b>choice needed</b> must be filled in before you can finish.",
    spells: "Clerics don't learn spells one at a time. You can prepare any spell on the cleric list, and you can change your prepared spells after every long rest. Domain spells are always prepared for free.",
    dragon: "Your bonded dragon grows with you, and all of its numbers come from your character level. Dragon bond rules are in beta and may change.",
    review: "Everything that changes is listed below. You can undo a level-up later from Options."
  };
  const needBadge = (n) => (n ? `<span class="need-badge">${n} choice${n > 1 ? "s" : ""} needed</span>` : "");

  function levelUpModal() {
    const L = MODAL; const P = levelPlan(L); const steps = luSteps(P);
    if (!steps.some((s) => s[0] === L.step)) L.step = "class";
    L.seen = L.seen || {}; L.seen[L.step] = true;
    const idx = steps.findIndex((s) => s[0] === L.step);
    const missing = steps.reduce((a, [id]) => a + (P.need[id] || 0), 0);
    const nav = steps.map(([id, name], i) => {
      const n = P.need[id] || 0; const visited = L.seen[id] && id !== L.step;
      return `<button class="lu-step ${id === L.step ? "cur" : ""}" data-act="luStep" data-k="${id}" ${id === L.step ? 'aria-current="step"' : ""}>
        <span class="lu-num ${n ? "warn" : visited ? "ok" : ""}">${n ? "!" : visited ? "✓" : i + 1}</span>${name}</button>`;
    }).join("");
    const body = { class: luClass, hp: luHp, features: luFeatures, spells: luSpells, dragon: luDragon, review: luReview }[L.step](P, L);
    const next = steps[idx + 1];
    return `<div class="modal lu" role="dialog" aria-modal="true" aria-labelledby="lu-title">
      <header><div><div class="label">Level up</div><h2 id="lu-title">${esc(S.name)} · Level ${P.before.total} → ${P.after.total}</h2></div><button class="icon-btn" data-act="closeModal" aria-label="Close">✕</button></header>
      <nav class="lu-nav" aria-label="Level-up steps">${nav}</nav>
      <div class="mb"><div class="tip">${(L.step === "spells" && P.C.spellTip) || LU_TIPS[L.step]}</div>${body}</div>
      <footer>
        <span class="small ${missing ? "warn-t" : "muted"}" style="margin-right:auto">${missing ? `${missing} choice${missing > 1 ? "s" : ""} still needed` : "All choices made"}</span>
        ${idx > 0 ? `<button class="btn" data-act="luStep" data-k="${steps[idx - 1][0]}">Back</button>` : `<button class="btn" data-act="closeModal">Cancel</button>`}
        ${next ? `<button class="btn primary" data-act="luStep" data-k="${next[0]}">Next: ${next[1]}</button>`
          : `<button class="btn primary" data-act="luApply" ${missing ? "disabled" : ""}>Level up to ${P.after.total}</button>`}
      </footer></div>`;
  }

  /* step 1: class */
  function luClass(P, L) {
    const C = P.C; const sub = P.sub; const sc = C.spellcasting;
    const classOpts = Object.keys(CLASSES).map((id) => {
      const cur = S.classes.find((c) => c.id === id);
      return `<option value="${id}" ${id === L.classId ? "selected" : ""}>${cur ? `${CLASSES[id].name} (level ${cur.level} → ${cur.level + 1})` : `Multiclass into ${CLASSES[id].name}`}</option>`;
    }).join("");
    const rows = [];
    for (let l = 1; l <= 20; l++) {
      // hideFuture: homebrew subclass features stay secret until the level is reached
      const showSub = sub && !(sub.hideFuture && l > P.nc.level);
      const names = (C.features[l] || []).map((f) => f.name).concat(showSub ? (sub.features[l] || []).map((f) => f.name) : []);
      const slots = sc ? slotsFor([{ id: L.classId, level: l }]) : [];
      const cls = l < P.nc.level ? "past" : l === P.nc.level ? "cur" : "";
      rows.push(`<tr class="${cls}"><td class="num">${l}</td><td class="num">${sg(pbFor(l))}</td><td>${names.map(esc).join(", ") || "—"}</td>${sc ? `<td class="num">${C.cantripsKnown[l]}</td>${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<td class="num">${slots[i] || "–"}</td>`).join("")}` : ""}</tr>`);
    }
    return `<div class="choice"><label class="label" for="lu-class">Class to advance</label>
        <select id="lu-class" class="f" style="width:auto" data-lu="classId">${classOpts}</select></div>
      ${Object.keys(CLASSES).length === 1 ? `<p class="small muted" style="margin:0">Other classes appear here as they're added to the campaign. Multiclassing needs 13 or higher in the main ability of both classes.</p>` : ""}
      ${!P.had ? `<p class="small" style="margin:0">Multiclass requirement for ${esc(C.name)}: <b>${esc(C.multiclassReq || "see the Player's Handbook")}</b>. You gain: ${esc(C.multiclassProfs || "")}.</p>` : ""}
      <div class="cls-card">
        <div><h3 style="font-size:1.3rem">${esc(C.name)}${sub ? ` · ${esc(sub.name)}` : ""}</h3>
          <div class="small muted">Hit die d${C.hitDie} · Saves ${C.saves.map((a) => ABIL_NAME[a]).join(", ")}${sc ? ` · Casts with ${ABIL_NAME[sc.ability]}` : ""}</div></div>
        <div class="lvl-jump">${P.nc.level - 1 || "—"} → ${P.nc.level}</div>
      </div>
      <div><h3 style="color:var(--bronze);margin-bottom:6px">${esc(C.name)} progression</h3>
        <div class="tw"><table class="t prog"><thead><tr><th>Lvl</th><th>PB</th><th>Features</th>${sc ? `<th>Cantrips</th>${ORD.slice(1).map((o) => `<th>${o}</th>`).join("")}` : ""}</tr></thead><tbody>${rows.join("")}</tbody></table></div>
        <p class="small muted" style="margin:6px 0 0">The highlighted row is the level you're about to reach.</p></div>`;
  }

  /* step 2: hit points */
  function luHp(P, L) {
    const hd = P.C.hitDie, avg = hd / 2 + 1, con = P.after.mods.con;
    const gain = L.hpVal != null ? P.after.hpMax - P.before.hpMax : null;
    const conUp = P.after.mods.con - P.before.mods.con;
    return `<div class="opt-grid">
        <button class="opt ${L.hpMode === "avg" ? "sel" : ""}" data-act="luHp" data-k="avg" aria-pressed="${L.hpMode === "avg"}">
          <b>Fixed value</b><span class="big">${avg}</span><span class="small muted">Half your d${hd} plus one. The safe choice, and what most tables use.</span></button>
        ${physical() ? "" : `<button class="opt ${L.hpMode === "roll" ? "sel" : ""}" data-act="luHp" data-k="roll" aria-pressed="${L.hpMode === "roll"}">
          <b>Roll it</b><span class="big">${L.hpMode === "roll" ? L.hpVal : "d" + hd}</span><span class="small muted">${L.hpMode === "roll" ? "Rolled once. The result stands." : `Roll a d${hd}. Could be 1, could be ${hd}.`}</span></button>`}
        <div class="opt ${L.hpMode === "manual" ? "sel" : ""}"><b>${physical() ? "Roll your hit die" : "Rolled real dice?"}</b>
          <input id="lu-hpman" class="f n" type="number" min="1" max="${hd}" data-lu="hpManual" value="${L.hpMode === "manual" ? L.hpVal : ""}" placeholder="1–${hd}" aria-label="Your hit die roll" style="width:5em;font-size:1.4rem">
          <span class="small muted">Type the number you rolled at the table.</span></div>
      </div>
      ${gain != null ? `<div class="result"><span class="label">Your new hit points</span>
          <div style="font-size:1.05rem">${L.hpVal} (hit die) ${sg(con)} (CON modifier)${P.after.fx.hpPerLevel ? ` + ${P.after.fx.hpPerLevel} (Tough)` : ""}${conUp ? ` + ${conUp * (P.after.total - 1)} (higher CON applied to earlier levels)` : ""} = <b style="color:var(--good)">+${gain} HP</b></div>
          <div class="small">Maximum hit points <span class="diff">${P.before.hpMax} → <span class="to">${P.after.hpMax}</span></span></div></div>`
        : `<p class="small muted" style="margin:0">Pick one of the options above.</p>`}`;
  }

  /* step 3: features */
  function luFeatures(P, L) {
    const cards = P.feats.filter((f) => !f.spells || P.after.caster).map((f, i) => {
      let need = 0, choice = "";
      if (f.asi) { need = P.asiNeed; choice = asiChoice(P, L); }
      if (f.cantrip && P.cantripHome === "features") { need = P.cantripNeed; choice = cantripChoice(P, L); }
      return featCard("f" + i, f.name, `${f.src} · Level ${P.nc.level}`, f.text, need, choice, L);
    });
    if (P.after.pb !== P.before.pb) cards.push(featCard("pb", "Proficiency Bonus Increase", `Every character · Level ${P.after.total}`,
      `Your proficiency bonus rises from ${sg(P.before.pb)} to ${sg(P.after.pb)}. Every skill, save and attack you're proficient in improves by 1${P.after.caster ? ", and so do your spell save DC and spell attack" : ""}.`, 0, "", L));
    if ([5, 11, 17].includes(P.after.total) && P.after.caster) cards.push(featCard("ct", "Cantrip Damage Increase", `Every caster · Level ${P.after.total}`,
      `Damage cantrips now roll ${1 + (P.after.total >= 5) + (P.after.total >= 11) + (P.after.total >= 17)} dice instead of ${(P.after.total >= 5) + (P.after.total >= 11) + (P.after.total >= 17)}.`, 0, "", L));
    return cards.join("") || `<p class="muted">No new features at this level, but your hit points still grow.</p>`;
  }
  function featCard(key, name, meta, text, need, choice, L) {
    const open = !(L.closed || {})[key];
    return `<div class="fcard ${need ? "need" : ""}">
      <button class="fhead" data-act="luOpen" data-k="${key}" aria-expanded="${open}">
        <span style="min-width:0"><b>${esc(name)}</b><br><span class="small muted">${esc(meta)}</span></span>
        <span style="display:flex;gap:8px;align-items:center">${needBadge(need)}<span class="chev" aria-hidden="true">${open ? "−" : "+"}</span></span></button>
      ${open ? `<div class="fbody"><p style="margin:0 0 ${choice ? "12px" : "0"}">${esc(text)}</p>${choice}</div>` : ""}</div>`;
  }
  function asiChoice(P, L) {
    const abilSel = (id, key) => `<select id="${id}" class="f" style="width:auto" data-lu="${key}" aria-label="Ability"><option value="">Choose an ability…</option>${ABIL.map((a) => `<option value="${a}" ${L[key] === a ? "selected" : ""} ${S.abilities[a] >= 20 ? "disabled" : ""}>${ABIL_NAME[a]} (${S.abilities[a]})</option>`).join("")}</select>`;
    let inner = "";
    if (L.asiMode === "asi") {
      const changed = ABIL.filter((a) => P.sim.abilities[a] !== S.abilities[a]);
      inner = `<div class="choice"><span class="seg"><button data-act="luSet" data-k="asiSplit" data-v="" aria-pressed="${!L.asiSplit}">+2 to one score</button><button data-act="luSet" data-k="asiSplit" data-v="1" aria-pressed="${!!L.asiSplit}">+1 to two scores</button></span></div>
        <div class="choice" style="margin-top:8px">${abilSel("lu-a", "asiA")}${L.asiSplit ? abilSel("lu-b", "asiB") : ""}</div>
        ${changed.length ? `<div class="choice" style="margin-top:8px">${changed.map((a) => `<span class="chip ok">${ABIL_NAME[a]} ${S.abilities[a]} → ${P.sim.abilities[a]} (modifier ${sg(mod(P.sim.abilities[a]))})</span>`).join("")}</div>` : ""}
        <p class="small muted" style="margin:6px 0 0">A score can't go above 20. Modifiers rise on even numbers, so 15 → 16 matters more than 16 → 17.</p>`;
    } else {
      const D0 = derive(S); const c = featCtx(S, D0); const taken = new Set(S.feats.map((f) => f.key));
      const ok = [], no = [];
      FEAT_LIST().forEach((f) => {
        const meets = !f.req || f.req(c); const has = taken.has(f.key);
        const o = `<option value="${f.key}" ${L.feat === f.key ? "selected" : ""} ${!meets || has ? "disabled" : ""}>${esc(f.name)}${f.abil ? " (+1 ability)" : ""}${has ? " (already taken)" : !meets ? ` (needs ${esc(f.reqText)})` : ""}</option>`;
        (meets && !has ? ok : no).push(o);
      });
      const F = P.F;
      let detail = "";
      if (F) {
        const abilOpts = F.abil === "any" ? ABIL : F.abil && F.abil.length > 1 ? F.abil : null;
        detail = `<div class="result" style="margin-top:8px"><b>${esc(F.name)}</b>${F.reqText ? ` <span class="small muted">Prerequisite: ${esc(F.reqText)}</span>` : ""}<p style="margin:4px 0 0">${esc(F.text)}</p>
          ${F.abil && !abilOpts ? `<p class="small" style="margin:6px 0 0">Also raises ${ABIL_NAME[F.abil[0]]} by 1 (${S.abilities[F.abil[0]]} → ${Math.min(20, S.abilities[F.abil[0]] + 1)}).</p>` : ""}
          ${abilOpts ? `<label class="small" style="display:block;margin-top:8px">Raise which ability by 1? <select id="lu-fa" class="f" style="width:auto" data-lu="featAbil"><option value="">Choose…</option>${abilOpts.map((a) => `<option value="${a}" ${L.featAbil === a ? "selected" : ""} ${S.abilities[a] >= 20 ? "disabled" : ""}>${ABIL_NAME[a]} (${S.abilities[a]})</option>`).join("")}</select></label>` : ""}
          ${F.fx ? `<p class="small muted" style="margin:6px 0 0">The sheet applies this feat's numbers automatically.</p>` : ""}</div>`;
      } else if (L.feat === "custom") {
        detail = `<div class="result" style="margin-top:8px"><label class="small" style="display:block">Feat name<input id="lu-cn" class="f" data-lu="customName" value="${esc(L.customName || "")}" placeholder="Name of the feat"></label>
          <label class="small" style="display:block;margin-top:8px">What it does<textarea id="lu-ct" class="f" rows="3" data-lu="customText" placeholder="Summarize the benefits">${esc(L.customText || "")}</textarea></label></div>`;
      }
      inner = `<select id="lu-feat" class="f" data-lu="feat" aria-label="Choose a feat"><option value="">Choose a feat…</option><optgroup label="Available">${ok.join("")}</optgroup><optgroup label="Other">
        <option value="custom" ${L.feat === "custom" ? "selected" : ""}>A feat not on this list (DM approved)</option></optgroup>${no.length ? `<optgroup label="Not available">${no.join("")}</optgroup>` : ""}</select>${detail}`;
    }
    return `<div class="choice" style="margin-bottom:8px"><span class="seg"><button data-act="luSet" data-k="asiMode" data-v="asi" aria-pressed="${L.asiMode === "asi"}">Ability Score Improvement</button><button data-act="luSet" data-k="asiMode" data-v="feat" aria-pressed="${L.asiMode === "feat"}">Feat</button></span></div>${inner}`;
  }
  function cantripChoice(P, L) {
    const list = window.SPELLS[P.C.spellcasting ? P.C.spellcasting.list : ""] || [];
    const chosen = L.cantrips || [];
    let out = "";
    for (let i = 0; i < P.cantripGain; i++) {
      const opts = list.filter((r) => r[1] === 0 && !S.cantrips.includes(r[0]) && (!chosen.includes(r[0]) || chosen[i] === r[0]));
      const pick = chosen[i] && SPELL_INDEX[chosen[i]];
      out += `<label class="small" style="display:block;margin-top:${i ? 8 : 0}px">New cantrip${P.cantripGain > 1 ? " " + (i + 1) : ""}
        <select id="lu-c${i}" class="f" data-lu="cantrips.${i}"><option value="">Choose a cantrip…</option>${opts.map((r) => `<option ${chosen[i] === r[0] ? "selected" : ""}>${esc(r[0])}</option>`).join("")}</select></label>
        ${pick ? `<p class="small" style="margin:4px 0 0"><b>${esc(pick.name)}:</b> ${esc(pick.text)} <span class="muted">(${esc(pick.time)}, ${esc(pick.range)})</span></p>` : ""}`;
    }
    return out;
  }

  /* step 4: spells */
  function luSpells(P, L) {
    const b = P.before.caster, a = P.after.caster;
    const n = Math.max(P.before.slots.length, P.after.slots.length);
    const head = Array.from({ length: n }, (_, i) => `<th>${ORD[i + 1]}</th>`).join("");
    const rowB = Array.from({ length: n }, (_, i) => `<td class="num">${P.before.slots[i] || "–"}</td>`).join("");
    const rowA = Array.from({ length: n }, (_, i) => `<td class="num ${(P.after.slots[i] || 0) !== (P.before.slots[i] || 0) ? "cur" : ""}">${P.after.slots[i] || "–"}</td>`).join("");
    const newLevel = P.after.slots.length > P.before.slots.length ? P.after.slots.length : 0;
    const list = spellsAvailable(a).map((r) => SPELL_INDEX[r[0]]).filter((sp) => sp.level >= 1 && sp.level <= P.after.maxSpellLevel);
    const prepared = L.prepared || S.prepared;
    const count = prepared.filter((nm) => SPELL_INDEX[nm] && SPELL_INDEX[nm].level <= P.after.maxSpellLevel && !a.domain.includes(nm)).length;
    let groups = "";
    for (let lv = 1; lv <= P.after.maxSpellLevel; lv++) {
      const items = list.filter((sp) => sp.level === lv);
      groups += `<div><h4 style="margin:10px 0 4px;font-family:var(--f-body)">${ORD[lv]} level${lv === newLevel ? ' <span class="chip ok">New</span>' : ""}</h4><div class="prep-grid">${items.map((sp) => {
        const dom = a.domain.includes(sp.name);
        return dom ? `<label title="Always prepared"><span style="color:var(--bronze);width:18px;text-align:center">◆</span>${esc(sp.name)}${P.newDomain.includes(sp.name) ? ' <span class="chip ok">New</span>' : ""}</label>`
          : `<label><input type="checkbox" class="chk" data-act="luPrep" data-name="${esc(sp.name)}" ${prepared.includes(sp.name) ? "checked" : ""}>${esc(sp.name)}</label>`;
      }).join("")}</div></div>`;
    }
    return `<div><h3 style="color:var(--bronze);margin-bottom:6px">Spell slots</h3>
        <div class="tw"><table class="t prog"><thead><tr><th></th>${head}</tr></thead><tbody><tr><td class="label">Now</td>${rowB}</tr><tr><td class="label">Level ${P.after.total}</td>${rowA}</tr></tbody></table></div>
        ${newLevel ? `<p style="margin:6px 0 0"><span class="chip ok">New</span> You can now cast <b>${ORD[newLevel]}-level</b> spells.</p>` : ""}</div>
      <div class="opt-grid">
        <div class="result"><span class="label">Spells you can prepare</span><div class="diff" style="font-size:1.2rem">${b ? b.prepMax : 0} → <span class="to">${a.prepMax}</span></div><span class="small muted">${ABIL_NAME[a.ability]} modifier + ${esc(P.C.prepLabel || P.C.name.toLowerCase() + " level")}</span></div>
        <div class="result"><span class="label">Spell save DC</span><div class="diff" style="font-size:1.2rem">${b ? b.dc : "—"} → <span class="to">${a.dc}</span></div><span class="small muted">8 + proficiency + ${ABIL_NAME[a.ability]}</span></div>
        <div class="result"><span class="label">Spell attack</span><div class="diff" style="font-size:1.2rem">${b ? sg(b.atk) : "—"} → <span class="to">${sg(a.atk)}</span></div><span class="small muted">proficiency + ${ABIL_NAME[a.ability]}</span></div>
      </div>
      ${P.newDomain.length ? `<p style="margin:0"><b>New ${esc(alwaysLabel(a).toLowerCase())} spells</b> (always prepared): ${P.newDomain.map(esc).join(", ")}</p>` : ""}
      ${P.cantripHome === "spells" && P.cantripGain ? `<div class="fcard ${P.cantripNeed ? "need" : ""}"><div class="fbody">${needBadge(P.cantripNeed)}${cantripChoice(P, L)}</div></div>` : ""}
      <div><div class="ph"><h3 style="color:var(--bronze)">Prepared spells <span class="small muted" style="font-family:var(--f-body)">optional</span></h3>
          <span class="chip ${count > a.prepMax ? "warn" : count === a.prepMax ? "ok" : ""}">${count} / ${a.prepMax} prepared</span></div>
        <p class="small muted" style="margin:0">Want to try the new spells? Adjust your list here, or leave it and change it after your next long rest.</p>${groups}</div>`;
  }

  /* step 5: dragon */
  function luDragon(P) {
    const g0 = P.before.dragon, g1 = P.after.dragon, K = g0.K;
    const row = (label, x, y) => `<tr><td>${label}</td><td class="num">${x}</td><td class="num ${String(x) !== String(y) ? "cur" : ""}">${y}</td></tr>`;
    const cmd = (g) => (g.essence ? `Essence Pool (${g.essenceMax})` : "Bonus action");
    const src = artSrc("dragon");
    return `<div class="cls-card" style="border-color:var(--arc)">
        <div style="display:flex;gap:12px;align-items:center">${src ? `<img src="${esc(src)}" alt="" style="width:64px;height:64px;object-fit:cover;border-radius:10px">` : ""}
          <div><h3 style="font-size:1.3rem;color:var(--arc)">${esc(S.dragon.name || K.title || "Your dragon")}</h3><div class="small muted">${g1.tier.size} ${esc(K.title || "dragon")} · bonded to ${esc(S.name.split(" ")[0])}</div></div></div>
        <div class="lvl-jump" style="color:var(--arc)">${g1.tier.size}</div></div>
      ${P.dragonGains.length ? `<div class="result" style="border-color:var(--arc)"><span class="label">What's new</span><ul style="margin:4px 0 0;padding-left:18px">${P.dragonGains.map((x) => `<li>${x}</li>`).join("")}</ul></div>`
        : `<p style="margin:0">No growth milestone this level. Your dragon still gains 1 hit point, because its HP follows your level.</p>`}
      <div class="tw"><table class="t prog"><thead><tr><th>Dragon</th><th>Now</th><th>Level ${P.after.total}</th></tr></thead><tbody>
        ${row("Size", g0.tier.size, g1.tier.size)}${row("Proficiency bonus", sg(g0.pb), sg(g1.pb))}${row("Armor class", g0.ac, g1.ac)}${row("Hit points", g0.hpMax, g1.hpMax)}
        ${row("Bite", sg(g0.biteHit) + " to hit", sg(g1.biteHit) + " to hit")}${row("Breath damage", g0.tier.breath, g1.tier.breath)}${row("Breath save DC", g0.dc, g1.dc)}${row("Commands", cmd(g0), cmd(g1))}
      </tbody></table></div>`;
  }

  /* step 6: review */
  function luReview(P, L) {
    const rows = [];
    const add = (label, html, step) => rows.push(`<div class="rv-row"><span class="label" style="padding-top:2px">${label}</span><div>${html}</div>${step ? `<button class="btn sm" data-act="luStep" data-k="${step}">Change</button>` : "<span></span>"}</div>`);
    add("Class", `${esc(P.C.name)} ${P.nc.level - 1 || ""} → <b>${P.nc.level}</b> · character level <b>${P.after.total}</b>`, "class");
    add("Hit points", L.hpVal == null ? `<span class="warn-t">Not chosen yet</span>` : `<b style="color:var(--good)">+${P.after.hpMax - P.before.hpMax}</b> · max ${P.before.hpMax} → ${P.after.hpMax}`, "hp");
    if (P.asi) {
      const ab = ABIL.filter((a) => P.sim.abilities[a] !== S.abilities[a]).map((a) => `${ABIL_NAME[a]} ${S.abilities[a]} → <b>${P.sim.abilities[a]}</b>`);
      const parts = L.asiMode === "feat" ? [`<b>${esc(P.F ? P.F.name : L.customName || "")}</b>`].concat(ab) : ab;
      add(L.asiMode === "feat" ? "Feat" : "Ability scores", P.asiNeed ? `<span class="warn-t">Choice needed</span>` : parts.join(" · "), "features");
    }
    add("New features", P.feats.map((f) => esc(f.name)).join(", ") || "None this level", "features");
    if (P.after.pb !== P.before.pb) add("Proficiency", `${sg(P.before.pb)} → <b>${sg(P.after.pb)}</b>`);
    if (P.after.caster) {
      const sl = []; P.after.slots.forEach((n, i) => { if (n !== (P.before.slots[i] || 0)) sl.push(`${ORD[i + 1]}: ${P.before.slots[i] || 0} → <b>${n}</b>`); });
      const parts = [sl.length ? "Slots " + sl.join(", ") : "Slots unchanged"];
      if (P.before.caster && P.before.caster.prepMax !== P.after.caster.prepMax) parts.push(`prepare ${P.after.caster.prepMax}`);
      if (P.newDomain.length) parts.push(esc(alwaysLabel(P.after.caster).toLowerCase()) + ": " + P.newDomain.map(esc).join(", "));
      const cn = (L.cantrips || []).filter(Boolean);
      if (P.cantripGain) parts.push(P.cantripNeed ? `<span class="warn-t">pick ${P.cantripNeed} cantrip</span>` : "cantrip: " + cn.map(esc).join(", "));
      add("Spells", parts.join(" · "), P.cantripNeed ? P.cantripHome : "spells");
    }
    add("Dragon", `HP ${P.before.dragon.hpMax} → <b>${P.after.dragon.hpMax}</b>${P.dragonGains.length ? " · " + P.dragonGains.join(" ") : ""}`, "dragon");
    return `<div>${rows.join("")}</div>`;
  }

  function applyLevelUp() {
    const P = levelPlan(MODAL);
    if (Object.values(P.need).some(Boolean)) return;
    const snap = clone(S); delete snap.history;
    const next = P.sim;
    next.hp.current = Math.max(0, S.hp.current + (P.after.hpMax - P.before.hpMax));
    if (next.dragon.hpCurrent != null) next.dragon.hpCurrent += P.after.dragon.hpMax - P.before.dragon.hpMax;
    const summary = [`${P.C.name} ${P.nc.level}`];
    const ab = ABIL.filter((a) => next.abilities[a] !== S.abilities[a]).map((a) => `${a.toUpperCase()} ${S.abilities[a]}→${next.abilities[a]}`);
    if (P.asi && MODAL.asiMode === "feat") summary.push("Feat: " + (P.F ? P.F.name : MODAL.customName));
    if (ab.length) summary.push(ab.join(", "));
    const cn = (MODAL.cantrips || []).filter(Boolean); if (cn.length) summary.push("Cantrip: " + cn.join(", "));
    next.history = (S.history || []).concat([{ at: Date.now(), from: P.before.total, to: P.after.total, summary: summary.join(" · "), snapshot: snap }]).slice(-8);
    S = migrate(next); MODAL = null; commit();
    toast(`Level ${P.after.total}!`, `${summary.join(" · ")} · HP max ${P.before.hpMax} → ${P.after.hpMax}`, 6000);
  }

  /* ---------- other modals ---------- */
  function shortRestModal() {
    const D = derive(); const left = D.total - S.hitDiceUsed; const hd = CLASSES[S.classes[0].id].hitDie;
    return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="sr-title">
      <header><h2 id="sr-title">Short rest</h2><button class="icon-btn" data-act="closeModal" aria-label="Close">✕</button></header>
      <div class="mb">
        <p style="margin:0">Spend hit dice to heal. Each die heals d${hd} ${sg(D.mods.con)} (CON). You have <b>${left}</b> of ${D.total} left. HP: <b>${S.hp.current} / ${D.hpMax}</b>.</p>
        <div class="choice">
          <label class="small" for="hd-roll">Your d${hd} roll</label><input id="hd-roll" class="f n" type="number" min="1" max="${hd}" inputmode="numeric" placeholder="1–${hd}">
          <button class="btn" data-act="spendHD" data-k="manual" ${left <= 0 || S.hp.current >= D.hpMax ? "disabled" : ""}>Spend hit die</button>
          ${physical() ? "" : `<button class="btn" data-act="spendHD" data-k="roll" ${left <= 0 || S.hp.current >= D.hpMax ? "disabled" : ""}>Roll for me</button>`}
        </div>
        ${(MODAL.log || []).length ? `<ul class="small" style="margin:0;padding-left:18px">${MODAL.log.map((l) => `<li>${l}</li>`).join("")}</ul>` : ""}
        <p class="small muted" style="margin:0">Finishing the rest restores: ${D.resources.filter((r) => r.reset === "short").map((r) => r.name).join(", ") || "nothing else"}.</p>
      </div>
      <footer><button class="btn" data-act="closeModal">Cancel</button><button class="btn primary" data-act="finishShort">Finish short rest</button></footer></div>`;
  }
  function longRestModal() {
    const D = derive();
    return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="lr-title">
      <header><h2 id="lr-title">Long rest</h2><button class="icon-btn" data-act="closeModal" aria-label="Close">✕</button></header>
      <div class="mb"><ul style="margin:0;padding-left:18px">
        <li>HP restored to ${D.hpMax}; temporary HP cleared</li>
        <li>All spell slots and limited-use features restored</li>
        <li>Regain ${Math.max(1, Math.floor(D.total / 2))} spent hit dice</li>
        <li>Death saves reset; exhaustion drops by 1 if you ate and drank</li>
        <li>${esc(S.dragon.name || "Your dragon")}: HP full, breath ready${D.dragon.essence ? ", Essence Pool refilled" : ""}</li>
        <li>Time to change your prepared spells</li></ul></div>
      <footer><button class="btn" data-act="closeModal">Cancel</button><button class="btn primary" data-act="finishLong">Take long rest</button></footer></div>`;
  }
  function castModal() {
    const D = derive(); const sp = SPELL_INDEX[MODAL.name]; const c = D.caster;
    const opts = []; for (let l = sp.level; l <= D.maxSpellLevel; l++) { const left = D.slots[l - 1] - S.slotsUsed[l]; opts.push({ l, left }); }
    const sel = MODAL.slot || (opts.find((o) => o.left > 0) || {}).l || sp.level;
    const eff = effectLine(sp, sel, D);
    return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="c-title" style="max-width:520px">
      <header><h2 id="c-title">Cast ${esc(sp.name)}</h2><button class="icon-btn" data-act="closeModal" aria-label="Close">✕</button></header>
      <div class="mb">
        <div class="small muted">${esc(sp.time)} · ${esc(sp.range)} · ${esc(sp.comp)} · ${esc(sp.dur)}</div>
        <p style="margin:0">${esc(sp.text)}</p>
        <div><span class="label">Slot level</span><div class="choice" style="margin-top:4px">${opts.map((o) => `<button class="btn sm" data-act="castSlot" data-l="${o.l}" aria-pressed="${o.l === sel}" ${o.left <= 0 ? "disabled" : ""} style="${o.l === sel ? "border-color:var(--bronze);background:var(--bronze-soft)" : ""}">${ORD[o.l]} (${o.left} left)</button>`).join("")}</div></div>
        ${eff ? `<p style="margin:0"><b>At ${ORD[sel]} level:</b> ${eff}</p>` : ""}
        ${sp.ritual ? `<p class="small muted" style="margin:0">Ritual: you can cast it without a slot by adding 10 minutes.</p>` : ""}
        ${sp.conc && S.concentration ? `<p class="small" style="margin:0;color:var(--bad)">Casting this ends your concentration on ${esc(S.concentration)}.</p>` : ""}
      </div>
      <footer>${sp.ritual ? `<button class="btn" data-act="castRitual">Cast as ritual</button>` : ""}<button class="btn" data-act="closeModal">Cancel</button>
        <button class="btn primary" data-act="castGo" data-l="${sel}" ${opts.some((o) => o.l === sel && o.left > 0) ? "" : "disabled"}>Cast${!physical() && eff && (sp.x.heal || sp.x.dmg) ? " & roll" : ""}</button></footer></div>`;
  }
  function settingsModal() {
    const last = (S.history || [])[S.history.length - 1];
    return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="o-title" style="max-width:600px">
      <header><h2 id="o-title">Sheet options</h2><button class="icon-btn" data-act="closeModal" aria-label="Close">✕</button></header>
      <div class="mb">
        <div class="lu-sec"><h3>Saving</h3><p class="small" style="margin:0">${syncChip()} ${SYNC.ref ? "Changes sync to everyone who opens this sheet and can edit it." : "Changes are kept in this browser only."}</p></div>
        <div class="lu-sec"><h3>Level history</h3>
          ${(S.history || []).length ? `<ul class="small">${S.history.map((h) => `<li>Level ${h.from} → ${h.to}: ${esc(h.summary)} <span class="muted">(${new Date(h.at).toLocaleDateString()})</span></li>`).join("")}</ul>` : `<p class="small muted" style="margin:0">No level-ups recorded on this sheet yet.</p>`}
          ${last ? (MODAL.confirmUndo ? `<div class="choice" style="margin-top:8px"><span class="small">Return to level ${last.from}? Changes made since then are lost.</span><button class="btn sm danger" data-act="undoLevel">Yes, undo</button><button class="btn sm" data-act="optSet" data-k="confirmUndo" data-v="">Keep</button></div>`
            : `<button class="btn sm" style="margin-top:8px" data-act="optSet" data-k="confirmUndo" data-v="1">Undo last level-up</button>`) : ""}
        </div>
        <div class="lu-sec"><h3>Backup</h3>
          <div class="choice"><button class="btn sm" data-act="exportJson">Copy sheet data</button><button class="btn sm" data-act="optSet" data-k="importOpen" data-v="1">Paste sheet data</button></div>
          ${MODAL.exportText ? `<textarea id="exp-box" class="f" rows="5" readonly style="margin-top:8px;font-size:.75rem">${esc(MODAL.exportText)}</textarea>` : ""}
          ${MODAL.importOpen ? `<textarea id="imp-box" class="f" rows="5" style="margin-top:8px;font-size:.75rem" placeholder="Paste copied sheet data here"></textarea><button class="btn sm" style="margin-top:6px" data-act="importJson">Load pasted data</button>` : ""}
        </div>
        <div class="lu-sec"><h3>Start over</h3>
          ${MODAL.confirmReset ? `<div class="choice"><span class="small">Replace this sheet with ${esc(window.DEFAULT_CHARACTER.name.split(" ")[0])}'s level ${window.DEFAULT_CHARACTER.classes[0].level} starting sheet?</span><button class="btn sm danger" data-act="resetSheet">Yes, reset</button><button class="btn sm" data-act="optSet" data-k="confirmReset" data-v="">Keep my sheet</button></div>`
            : `<button class="btn sm danger" data-act="optSet" data-k="confirmReset" data-v="1">Reset to starting sheet</button>`}
        </div>
        <p class="small muted" style="margin:0">Rules: D&D 5e (2014). Dragon bond rules version ${esc(DRAGON_RULES.version)}.</p>
      </div>
      <footer><button class="btn" data-act="closeModal">Close</button></footer></div>`;
  }
  function renderModal() {
    const root = $("#modal");
    if (!MODAL) { root.innerHTML = ""; return; }
    const act = document.activeElement; const fid = act && root.contains(act) && act.id; let sel = null;
    try { sel = fid && act.selectionStart != null ? [act.selectionStart, act.selectionEnd] : null; } catch (e) { sel = null; }
    const body = { levelUp: levelUpModal, shortRest: shortRestModal, longRest: longRestModal, cast: castModal, settings: settingsModal }[MODAL.type]();
    root.innerHTML = `<div class="modal-bg" data-act="bgClose">${body}</div>`;
    const nf = fid && document.getElementById(fid);
    if (nf) { nf.focus(); if (sel) try { nf.setSelectionRange(sel[0], sel[1]); } catch (e) { /* not a text field */ } }
  }

  /* ---------- events ---------- */
  const A = {
    tab: (e) => { UI.tab = e.dataset.tab; lsSet(LS_UI, JSON.stringify({ tab: UI.tab, spellView: UI.spellView })); render(); },
    toggleEdit: () => { UI.edit = !UI.edit; render(); },
    settings: () => { MODAL = { type: "settings" }; renderModal(); },
    levelUp: () => {
      MODAL = { type: "levelUp", step: "class", classId: S.classes[0].id, hpVal: null, hpMode: null, asiMode: "asi", asiSplit: false, asiA: "", asiB: "",
        feat: "", featAbil: "", customName: "", customText: "", cantrips: [], prepared: S.prepared.slice(), closed: {}, seen: {} };
      renderModal();
    },
    hero: (e) => { const j = +e.dataset.j; S.heroPoints = S.heroPoints > j ? j : j + 1; commit(); },
    shortRest: () => { MODAL = { type: "shortRest", log: [] }; renderModal(); },
    longRest: () => { MODAL = { type: "longRest" }; renderModal(); },
    closeModal: () => { MODAL = null; renderModal(); },
    bgClose: (e, ev) => { if (ev.target === e) A.closeModal(); },
    inspire: () => { S.inspiration = !S.inspiration; commit(); },
    rollMode: (e) => { UI.rollMode = e.dataset.k; render(); },
    endConc: () => { S.concentration = ""; commit(); },
    hp: (e) => {
      const n = Math.max(0, +$("#hp-amt").value || 0); const k = e.dataset.k; if (!n) return;
      const D = derive();
      if (k === "dmg") {
        const fromTemp = Math.min(S.hp.temp, n); S.hp.temp -= fromTemp; S.hp.current = Math.max(0, S.hp.current - (n - fromTemp));
        if (S.concentration) toast(`Concentration check`, `CON save DC ${Math.max(10, Math.floor(n / 2))} to keep ${esc(S.concentration)}.`);
        if (S.hp.current === 0) toast("Down to 0 HP", "Start rolling death saves.");
      } else if (k === "heal") { S.hp.current = Math.min(D.hpMax, S.hp.current + n); if (S.hp.current > 0) S.death = { s: 0, f: 0 }; }
      else S.hp.temp = Math.max(S.hp.temp, n);
      commit();
    },
    dhp: (e) => {
      const n = Math.max(0, +$("#dhp-amt").value || 0); if (!n) return;
      const g = derive().dragon; let cur = S.dragon.hpCurrent == null ? g.hpMax : S.dragon.hpCurrent;
      if (e.dataset.k === "dmg") { const t = Math.min(S.dragon.hpTemp, n); S.dragon.hpTemp -= t; cur = Math.max(0, cur - (n - t)); }
      else if (e.dataset.k === "heal") cur = Math.min(g.hpMax, cur + n);
      else S.dragon.hpTemp = Math.max(S.dragon.hpTemp, n);
      S.dragon.hpCurrent = cur >= g.hpMax ? null : cur; commit();
    },
    death: (e) => { const k = e.dataset.k, i = +e.dataset.i; S.death[k] = S.death[k] > i ? i : i + 1; commit(); },
    slot: (e) => { const l = +e.dataset.l, j = +e.dataset.j; S.slotsUsed[l] = S.slotsUsed[l] > j ? j : j + 1; commit(); },
    res: (e) => { const id = e.dataset.id, j = +e.dataset.j; const u = S.resUsed[id] || 0; S.resUsed[id] = u > j ? j : j + 1; commit(); },
    essence: (e) => { const j = +e.dataset.j; S.dragon.essenceUsed = S.dragon.essenceUsed > j ? j : j + 1; commit(); },
    spendEssence: (e) => {
      const n = +e.dataset.n; const g = derive().dragon; const left = g.essenceMax - S.dragon.essenceUsed;
      if (left < n) { toast("Not enough Essence", `${left} left; that costs ${n}.`); return; }
      S.dragon.essenceUsed += n; commit();
    },
    rollAbil: (e) => { const a = e.dataset.k; d20(ABIL_NAME[a] + " check", derive().mods[a], "", "", { type: "check" }); },
    rollSave: (e) => { const a = e.dataset.k; d20(ABIL_NAME[a] + " save", derive().save(a), "", "", { type: "save", ab: a }); },
    rollSkill: (e) => { const sk = SKILLS.find((x) => x[0] === e.dataset.k); d20(sk[1], derive().skill(sk[0], sk[2]), "", "", { type: "check" }); },
    rollInit: () => d20("Initiative", derive().init, "", "", { type: "check" }),
    rollAttack: (e) => {
      const w = S.attacks[+e.dataset.i];
      if (physical()) { d20(w.name + " attack", +e.dataset.hit, "", `Damage on a hit: ${esc(e.dataset.dmg)} ${esc(w.type)}`, { type: "attack" }); return; }
      const dm = roll(e.dataset.dmg.replace("−", "-"));
      d20(w.name + " attack", +e.dataset.hit, `damage ${dm.total} ${w.type} ${dm.detail}`, "", { type: "attack" });
    },
    castCantrip: (e) => {
      const D = derive(); const sp = SPELL_INDEX[e.dataset.name]; const dice = cantripDice(sp, D);
      if (physical()) {
        if (sp.x.cantrip.save) toast(`${esc(sp.name)}: ${sp.x.cantrip.save.toUpperCase()} save DC <b>${D.caster.dc}</b>`, `On a failed save, roll ${dice} ${sp.x.cantrip.type}`);
        else d20(sp.name, D.caster.atk, "", `Damage on a hit: ${dice} ${sp.x.cantrip.type}`, { type: "attack" });
        return;
      }
      const r = roll(dice);
      if (sp.x.cantrip.save) toast(`${esc(sp.name)}: <b class="num">${r.total}</b> ${sp.x.cantrip.type}`, `${sp.x.cantrip.save.toUpperCase()} save DC ${D.caster.dc} · ${dice} ${r.detail}`);
      else d20(sp.name, D.caster.atk, `damage ${r.total} ${sp.x.cantrip.type}`, "", { type: "attack" });
    },
    toggleCantrip: (e) => {
      const n = e.dataset.name; const D = derive();
      if (S.cantrips.includes(n)) S.cantrips = S.cantrips.filter((x) => x !== n);
      else { if (S.cantrips.length >= D.caster.cantrips) toast("Cantrip limit reached", `You know ${D.caster.cantrips} at this level. Unmark one first.`); else S.cantrips.push(n); }
      commit();
    },
    togglePrep: (e) => {
      const n = e.dataset.name;
      if (S.prepared.includes(n)) S.prepared = S.prepared.filter((x) => x !== n); else S.prepared.push(n);
      commit();
    },
    openSpell: (e) => { UI.open[e.dataset.name] = !UI.open[e.dataset.name]; render(); },
    spellView: (e) => { UI.spellView = e.dataset.k; lsSet(LS_UI, JSON.stringify({ tab: UI.tab, spellView: UI.spellView })); render(); },
    cast: (e) => { MODAL = { type: "cast", name: e.dataset.name }; renderModal(); },
    castSlot: (e) => { MODAL.slot = +e.dataset.l; renderModal(); },
    castRitual: () => { const sp = SPELL_INDEX[MODAL.name]; MODAL = null; renderModal(); toast(`${esc(sp.name)} cast as a ritual`, "No slot used. Takes 10 extra minutes."); if (sp.conc) { S.concentration = sp.name; commit(); } },
    castGo: (e) => {
      const D = derive(); const sp = SPELL_INDEX[MODAL.name]; const l = +e.dataset.l; const c = D.caster;
      S.slotsUsed[l] = Math.min(D.slots[l - 1], S.slotsUsed[l] + 1);
      if (sp.conc) S.concentration = sp.name;
      let msg = "", sub = `${ORD[l]}-level slot used`;
      const x = sp.x; const up = l - sp.level;
      if (physical()) {
        const eff = effectLine(sp, l, D);
        const heal = x.heal && c.feats.some((f) => f.name === "Blessed Healer") ? ` · Blessed Healer: you regain ${2 + l} HP if you healed someone else` : "";
        const st = x.dmg && x.dmg.attack ? rollState({ type: "attack" }, D) : null;
        const adv = st && st.mode !== "normal" ? ` · Attack roll with ${st.mode === "adv" ? "advantage" : "disadvantage"} (${esc(st.why)})` : "";
        MODAL = null; commit(); toast(`${esc(sp.name)} cast at ${ORD[l]} level`, `${sub}${eff ? " · Roll: " + eff : ""}${adv}${heal}`, 6000); return;
      }
      if (x.heal) {
        const supreme = c.feats.some((f) => f.name === "Supreme Healing");
        let total, detail = "";
        if (x.heal.flat) total = x.heal.flat + (x.heal.upFlat || 0) * up;
        else {
          const dice = addDice(x.heal.dice, x.heal.up || x.heal.dice, x.heal.up ? up : 0);
          const r = roll(dice, { max: supreme }); const bonus = (x.heal.mod ? D.mods[c.ability] : 0) + (x.heal.flatAdd || 0) + (c.sub && c.sub.healBonus ? c.sub.healBonus(l, c.level) : 0);
          total = r.total + bonus; detail = `${dice} ${r.detail} ${sg(bonus)}`;
        }
        msg = `${esc(sp.name)} heals <b class="num">${total}</b>`; sub += " · " + detail;
        if (c.feats.some((f) => f.name === "Blessed Healer")) sub += ` · Blessed Healer: you regain ${2 + l} HP if you healed someone else`;
      } else if (x.dmg) {
        let dice = x.dmg.dice; if (x.dmg.up) dice = addDice(dice, x.dmg.up, up); if (x.dmg.up2) dice = addDice(dice, x.dmg.up2, Math.floor(up / 2));
        if (x.dmg.mod) dice += "+" + D.mods[c.ability];
        const r = roll(dice);
        if (x.dmg.attack) { MODAL = null; commit(); d20(sp.name, c.atk, `damage ${r.total} ${x.dmg.type} ${r.detail} · ${ORD[l]} slot used`, "", { type: "attack" }); return; }
        msg = `${esc(sp.name)}: <b class="num">${r.total}</b> ${x.dmg.type}`; sub += ` · ${x.dmg.save.toUpperCase()} save DC ${c.dc} · ${r.detail}`;
      } else msg = `${esc(sp.name)} cast`;
      MODAL = null; commit(); toast(msg, sub, 6000);
    },
    breath: () => {
      const D = derive(); const g = D.dragon;
      if (g.essence) { const left = g.essenceMax - S.dragon.essenceUsed; if (left < 2) { toast("Not enough Essence", "Breath costs 2 points."); return; } S.dragon.essenceUsed += 2; }
      S.dragon.breathReady = false; commit();
      const save = `DC ${g.dc} ${(g.K.breath.save || "dex").toUpperCase()} save`; const ess = g.essence ? " · 2 Essence spent" : "";
      if (physical()) { toast(`${esc(g.K.breath.name || "Breath")}: ${save}`, `Roll ${g.tier.breath} ${g.K.damageType} damage${ess}`, 6000); return; }
      const r = roll(g.tier.breath);
      toast(`${esc(g.K.breath.name || "Breath")}: <b class="num">${r.total}</b> ${g.K.damageType}`, `${save} · ${g.tier.breath} ${r.detail}${ess}`, 6000);
    },
    recharge: () => { const n = rnd(6); if (n >= 5) { S.dragon.breathReady = true; commit(); } toast(`Recharge roll: <b>${n}</b>`, n >= 5 ? "Breath weapon is ready." : "Not yet. Try again next turn."); },
    rechargeCheck: () => {
      const n = Math.round(+$("#rch-roll").value);
      if (!(n >= 1 && n <= 6)) { toast("Enter your d6 roll", "Type a number from 1 to 6, then press Check."); return; }
      if (n >= 5) { S.dragon.breathReady = true; commit(); toast(`Rolled ${n}: breath recharged`, "The breath weapon is ready."); }
      else { $("#rch-roll").value = ""; toast(`Rolled ${n}: not yet`, "It recharges on a 5 or 6. Try again next turn."); }
    },
    breathReset: () => { S.dragon.breathReady = true; commit(); },
    guard: () => {
      const g = derive().dragon; const f = g.feats.find((x) => x.kind === "Reaction"); if (!f) return;
      S.dragon.guardUsed = true; commit();
      if (!f.dice) { toast(`${esc(f.name)} used`, esc(f.text)); return; }
      const bm = f.diceAbil ? g.m[f.diceAbil] : 0; const verb = f.verb || "roll";
      if (physical()) { toast(`${esc(f.name)}: ${esc(verb)} ${f.dice} ${sg(bm)}`, "Roll the dice and add the modifier."); return; }
      const r = roll(f.dice); toast(`${esc(f.name)}: ${esc(verb)} <b class="num">${Math.max(0, r.total + bm)}</b>`, `${f.dice} ${r.detail} ${sg(bm)}`);
    },
    guardReset: () => { S.dragon.guardUsed = false; commit(); },
    bite: () => {
      const g = derive().dragon; const K = g.K; const dice = (K.bite ? K.bite.dice : "1d6") + sg(g.m.str).replace("−", "-"); const type = K.bite ? K.bite.type : "piercing";
      if (physical()) { d20("Bite", g.biteHit, "", `Damage on a hit: ${dice} ${type}`); return; }
      const r = roll(dice); d20("Bite", g.biteHit, `damage ${r.total} ${type}`);
    },
    diceMode: (e) => { S.diceMode = e.dataset.k; commit(); toast(S.diceMode === "physical" ? "Rolling your own dice" : "The sheet rolls for you", S.diceMode === "physical" ? "Buttons show what to roll and track what you spend." : "Buttons roll dice and show results."); },
    saveProf: (e) => { const a = e.dataset.k; S.saveProf = S.saveProf.includes(a) ? S.saveProf.filter((x) => x !== a) : S.saveProf.concat(a); commit(); },
    skillProf: (e, ev) => { ev.stopPropagation(); const k = e.dataset.k; S.skills[k] = ((S.skills[k] || 0) + 1) % 3; commit(); },
    addAttack: () => {
      S.attacks.push({ name: "New weapon", kind: "melee", ability: "str", dice: "1d6", type: "bludgeoning", prof: true, magic: 0, range: "", props: "", notes: "" });
      UI.tab = "attacks"; UI.atkEdit = S.attacks.length - 1; commit();
      const el = document.getElementById(`f-attacks-${UI.atkEdit}-name`); if (el) { el.focus(); el.select(); }
    },
    addWeapon: () => {
      const name = $("#add-weapon").value; const w = (window.WEAPONS || []).find((x) => x[0] === name);
      if (!w) { toast("Pick a weapon first", "Choose one from the list, then press Add weapon."); return; }
      const [n, cat, kind, dice, type, props, range] = w;
      S.attacks.push({ name: n, kind, ability: /finesse/i.test(props) ? "finesse" : kind === "ranged" ? "dex" : "str", dice, type, prof: isProficient(n, cat), magic: 0, range, props, notes: "" });
      commit(); toast(`${esc(n)} added`, isProficient(n, cat) ? "You're proficient with it." : "You're not proficient, so your proficiency bonus isn't added to hit.");
    },
    atkEdit: (e, ev) => { if (ev) ev.stopPropagation(); const i = +e.dataset.i; UI.atkEdit = UI.atkEdit === i ? null : i; render(); },
    delAttack: (e) => { S.attacks.splice(+e.dataset.i, 1); UI.atkEdit = null; commit(); },
    cond: (e) => {
      const k = e.dataset.k; const on = S.conds.includes(k);
      S.conds = on ? S.conds.filter((x) => x !== k) : S.conds.concat(k);
      if (!on && k === "unconscious" && !S.conds.includes("prone")) S.conds.push("prone"); // unconscious creatures fall prone
      commit();
    },
    addItem: () => { S.inventory.push({ name: "", qty: 1, wt: 0, notes: "" }); commit(); const i = S.inventory.length - 1; const el = document.getElementById(`f-inv-${i}-name`); if (el) el.focus(); },
    delItem: (e) => { S.inventory.splice(+e.dataset.i, 1); commit(); },
    addCustom: () => { S.customFeatures.push({ name: "", text: "" }); commit(); },
    delCustom: (e) => { S.customFeatures.splice(+e.dataset.i, 1); commit(); },
    delFeat: (e) => { S.feats.splice(+e.dataset.i, 1); commit(); },
    addExtraSpell: () => { S.extraSpells.push({ name: "", level: 1, notes: "" }); commit(); },
    delExtraSpell: (e) => { S.extraSpells.splice(+e.dataset.i, 1); commit(); },
    artReset: (e) => saveArt(e.dataset.k, null),
    // option panels
    panelToggle: (e) => {
      const D = derive(); const pc = panelsFor(D).find((x) => x.P.id === e.dataset.p); if (!pc) return;
      const { P, c } = pc; const st = S.panels[P.id]; const k = e.dataset.k; const o = P.options.find((x) => x.key === k);
      if (st.active[k] != null) { delete st.active[k]; commit(); return; }
      const max = P.active ? P.active(c.level) : Infinity;
      if (panelCount(P, st) >= max) { toast(`All ${esc(P.activeLabel || "slots")} in use`, `You can have ${max} at once. End one first.`); return; }
      st.active[k] = o.own || P.defaultTarget === "own" ? S.dragon.name || "" : "";
      commit();
      const el = document.getElementById(`f-panels-${P.id}-active-${k}`); if (el && !el.value) el.focus();
    },
    panelKnow: (e) => {
      const D = derive(); const pc = panelsFor(D).find((x) => x.P.id === e.dataset.p); if (!pc) return;
      const st = S.panels[pc.P.id]; const k = e.dataset.k; const max = pc.P.known(pc.c.level); const set = new Set(st.known || []);
      if (set.has(k)) set.delete(k); else if (set.size >= max) { toast("Known limit reached", `You know ${max} at this level. Untick one first.`); render(); return; } else set.add(k);
      st.known = [...set]; commit();
    },
    panelEdit: (e) => { UI.panelEdit = UI.panelEdit === e.dataset.p ? null : e.dataset.p; render(); },
    panelUse: (e) => { const st = S.panels[e.dataset.p]; const k = e.dataset.k, j = +e.dataset.j; st.used[k] = (st.used[k] || 0) > j ? j : j + 1; commit(); },
    panelCharge: (e) => { const st = S.panels[e.dataset.p]; const k = e.dataset.k, j = +e.dataset.j; st.charges[k] = (st.charges[k] || 0) > j ? j : j + 1; commit(); },
    // level up
    luHp: (e) => {
      const hd = CLASSES[MODAL.classId].hitDie; const k = e.dataset.k;
      if (k === "avg") MODAL.hpVal = hd / 2 + 1;
      else if (MODAL.hpMode !== "roll") MODAL.hpVal = rnd(hd); // one roll; the result stands
      MODAL.hpMode = k; renderModal();
    },
    luSet: (e) => { MODAL[e.dataset.k] = e.dataset.v === "" ? false : e.dataset.v; if (e.dataset.k === "asiSplit" && !MODAL.asiSplit) MODAL.asiB = ""; renderModal(); },
    luStep: (e) => { MODAL.step = e.dataset.k; renderModal(); const bg = $(".modal-bg"); if (bg) bg.scrollTop = 0; },
    luOpen: (e) => { MODAL.closed[e.dataset.k] = !MODAL.closed[e.dataset.k]; renderModal(); },
    luPrep: (e) => { const n = e.dataset.name; MODAL.prepared = MODAL.prepared.includes(n) ? MODAL.prepared.filter((x) => x !== n) : MODAL.prepared.concat(n); renderModal(); },
    luApply: () => applyLevelUp(),
    // rests
    spendHD: (e) => {
      const D = derive(); const hd = CLASSES[S.classes[0].id].hitDie; let r;
      if (e.dataset.k === "manual") {
        r = Math.round(+$("#hd-roll").value);
        if (!(r >= 1 && r <= hd)) { toast("Enter your hit die roll", `Type a number from 1 to ${hd}.`); return; }
      } else r = rnd(hd);
      const gain = Math.max(0, r + D.mods.con);
      S.hitDiceUsed++; S.hp.current = Math.min(D.hpMax, S.hp.current + gain);
      MODAL.log.push(`d${hd}: ${r} ${sg(D.mods.con)} CON = <b>${gain}</b> HP`); commit();
    },
    finishShort: () => {
      const D = derive(); const back = D.resources.filter((r) => r.reset === "short");
      back.forEach((r) => (S.resUsed[r.id] = 0));
      panelsFor(D).forEach(({ P }) => { const st = S.panels[P.id]; if (!st) return; P.options.forEach((o) => { if (o.uses && o.uses.reset === "short" && st.used[o.key]) { st.used[o.key] = 0; back.push({ name: o.name }); } }); });
      if (S.dragon.guardUsed) { const f = D.dragon.feats.find((x) => x.kind === "Reaction"); if (f) back.push({ name: f.name }); }
      S.dragon.guardUsed = false; MODAL = null; commit();
      toast("Short rest finished", back.length ? esc(back.map((r) => r.name).join(", ")) + " restored." : "Hit dice spent; nothing else to restore.");
    },
    finishLong: () => { longRestNow(); MODAL = null; commit(); toast("Long rest finished", "HP, slots and features restored."); },
    // options
    optSet: (e) => { MODAL[e.dataset.k] = e.dataset.v; renderModal(); },
    undoLevel: () => {
      const h = S.history.pop(); const keep = S.history; S = migrate(Object.assign(h.snapshot, { history: keep }));
      MODAL = null; commit(); toast(`Back to level ${h.from}`, "The last level-up was undone.");
    },
    exportJson: () => {
      const txt = JSON.stringify(S); MODAL.exportText = txt; renderModal();
      const box = $("#exp-box");
      const p = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(txt) : Promise.reject();
      p.then(() => toast("Sheet data copied", "Paste it somewhere safe as a backup.")).catch(() => { if (box) { box.focus(); box.select(); } toast("Copy the selected text", "Your browser blocked automatic copying."); });
    },
    importJson: () => {
      try { const d = JSON.parse($("#imp-box").value); if (!d.classes || !d.abilities) throw new Error(); S = migrate(d); MODAL = null; commit(); toast("Sheet loaded"); }
      catch (e) { toast("That doesn't look like sheet data", "Paste the full text from “Copy sheet data”."); }
    },
    resetSheet: () => { S = migrate(clone(window.DEFAULT_CHARACTER)); MODAL = null; commit(); toast("Sheet reset"); }
  };

  document.addEventListener("click", (ev) => {
    if (ev.target.matches("input, select, textarea, option") && !ev.target.dataset.act) return;
    const el = ev.target.closest("[data-act]"); if (!el) return;
    const fn = A[el.dataset.act]; if (!fn) return;
    fn(el, ev);
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && MODAL) { MODAL = null; renderModal(); }
    if (ev.key === "Enter" && (ev.target.id === "hp-amt" || ev.target.id === "dhp-amt")) { ev.preventDefault(); }
    if (ev.key === "Enter" && ev.target.id === "rch-roll") { ev.preventDefault(); A.rechargeCheck(); }
    if (ev.key === "Enter" && ev.target.id === "hd-roll") { ev.preventDefault(); const b = $('[data-act="spendHD"][data-k="manual"]'); if (b && !b.disabled) A.spendHD(b); }
  });
  function luField(el) {
    const k = el.dataset.lu, v = el.value;
    if (k === "hpManual") {
      const hd = CLASSES[MODAL.classId].hitDie; const n = Math.round(+v);
      if (n >= 1 && n <= hd) { MODAL.hpMode = "manual"; MODAL.hpVal = n; } else if (MODAL.hpMode === "manual") MODAL.hpVal = null;
      return;
    }
    setPath(MODAL, k, v);
    if (k === "classId") { MODAL.hpVal = null; MODAL.hpMode = null; MODAL.cantrips = []; }
    if (k === "feat") MODAL.featAbil = "";
  }
  function readVal(el) {
    if (el.dataset.num) { if (el.value === "") return el.dataset.bind === "armor.dexCap" ? null : 0; return +el.value; }
    return el.value;
  }
  document.addEventListener("input", (ev) => {
    const el = ev.target;
    if (el.dataset.bind && el.tagName !== "SELECT") { setPath(S, el.dataset.bind, readVal(el)); persist(); }
    if (el.dataset.lu && el.tagName !== "SELECT") { luField(el); renderModal(); }
  });
  document.addEventListener("change", (ev) => {
    const el = ev.target;
    if (el.dataset.bind) { setPath(S, el.dataset.bind, readVal(el)); commit(); }
    else if (el.dataset.bindchk) { setPath(S, el.dataset.bindchk, el.checked); commit(); }
    else if (el.dataset.lu) {
      luField(el);
      renderModal();
    } else if (el.dataset.actInput === "dragonAbil") {
      const g = derive().dragon; S.dragon.abilities = Object.assign({}, g.ab, { [el.dataset.k]: +el.value || 0 }); commit();
    } else if (el.dataset.upload) {
      const f = el.files && el.files[0]; if (!f) return;
      shrinkImage(f).then((d) => saveArt(el.dataset.upload, d)).catch((e) => toast("Couldn't use that image", e.message));
    }
  });

  render();
  initSync();
})();
