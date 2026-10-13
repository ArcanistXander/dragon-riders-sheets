/* Dragon Riders sheets: turns from the DM's initiative tracker (website copy only).
   The party sheet posts party/round {cid, round, active, turn, turnName, next, nextName, held, notes, call, callFor}.
   turn, next, held and callFor hold tracker entries ("pc-<rider>"), only for riders reading a live sheet. The dragon
   acts on its rider's turn. On this rider's turn the sheet pops up "Your turn", and a small bar stays at the bottom
   with Hold and End turn. Replies go to party/turn-<rider>; the party sheet moves the tracker.
   Load after cloud.js:  <script src="js/turn.js" data-hero="corbin" data-name="Corbin"></script> */
(function(){
  'use strict';
  var me=document.currentScript, ID=me&&me.dataset.hero, NAME=(me&&me.dataset.name)||ID;
  if(!ID||!window.claude||!window.claude.use)return;
  var KEY='drsheet-turn-'+ID;   // the last turn the pop-up was shown for, so a reload doesn't show it again
  var ME='pc-'+ID;

  var round=null, db=null, sent='', msg='', call=null, rolledTxt='', callBox=null;
  function turnKey(){return round?round.cid+':'+round.round+':'+round.turn:''}
  function myTurn(){return !!(round&&round.active&&round.turn===ME)}
  function holding(){return !!(round&&round.active&&(round.held||[]).indexOf(ME)>=0)}
  function shown(k){try{if(localStorage.getItem(KEY)===k)return true;localStorage.setItem(KEY,k)}catch(e){}return false}
  /* this sheet's own report (kept in this browser): the initiative bonus and the dragon's name */
  function rep(){try{return JSON.parse(localStorage.getItem('drsheet-link:'+ID)||'null')}catch(e){return null}}
  function dragonName(){var r=rep();return (r&&r.dragon&&r.dragon.name)||'your dragon'}
  function bonus(){var r=rep(),v=r&&r.live&&r.live.init;return v==null||isNaN(+v)?null:+v}
  function sgn(v){return v<0?'− '+(-v):'+ '+v}

  /* ---- talking to the DM's tracker ---- */
  function reply(act){
    if(!db||!round)return;
    sent=act; draw();
    db.doc('party/turn-'+ID).set({cid:round.cid,round:round.round,entry:ME,act:act,at:new Date().toISOString()})
      .catch(function(){sent='';msg='Couldn’t reach the DM’s tracker. Tell the DM.';draw()});
  }
  /* A saving throw the DM called: this rider (and/or their dragon) types the total rolled at the table. The DC stays with the DM. */
  var save=null, saveBox=null, saveSent='';
  var ABN={str:'Strength',dex:'Dexterity',con:'Constitution',int:'Intelligence',wis:'Wisdom',cha:'Charisma'};
  function seenKey(kind,k){try{if(localStorage.getItem(KEY+'-'+kind)===k)return true;localStorage.setItem(KEY+'-'+kind,k)}catch(e){}return false}
  function onSave(d){
    var s=d&&d.save, mine=s?(s.who||[]).filter(function(w){return w.id===ID||w.id===ID+'-dragon'}):[];
    save=mine.length?{id:s.id,ab:s.ab,label:s.label||'',who:mine}:null;
    if(!save||save.id!==saveSent)saveSent='';
    if(!save&&saveBox){saveBox.close();saveBox=null}
    if(save&&!saveBox&&!seenKey('save',save.id))savePopup();
  }
  function savePopup(){
    if(!save||saveBox)return;
    buzz();
    var s=save, nm=ABN[s.ab]||s.ab;
    var rows=s.who.map(function(w,i){
      var who=w.id===ID?'You':w.n, b=w.b==null?null:+w.b;
      if(w.f==='fail')return '<p><b>'+esc(who)+'</b>: automatically fails (a condition). Nothing to roll.</p>';
      return '<label>'+esc(who)+' <span style="font-weight:400;color:var(--tt-muted)">d20'+(b!=null?' '+sgn(b):'')+(w.f==='dis'?' · roll with disadvantage':'')+'</span>'+
        '<input class="tt-init" data-sv="'+esc(w.id)+'" type="number" inputmode="numeric" aria-label="'+esc(who)+' save total" placeholder="Total"></label>';
    }).join('');
    saveBox=modal('<div class="tt-box" role="dialog" aria-modal="true" aria-labelledby="tt-sv"><h2 id="tt-sv">Make a '+esc(nm)+' save!</h2>'+
      (s.label?'<p>'+esc(s.label)+'</p>':'')+'<p>Roll at the table and type your total (d20 plus the bonus shown).</p>'+rows+
      '<p class="tt-msg" role="status"></p>'+
      '<div class="tt-row"><button data-a="later">Later</button><button data-a="auto">Roll for me</button><button class="pri" data-a="send">Send</button></div></div>',
      function(a,v,close){
        var m=v.querySelector('.tt-msg'), out={}, miss=null, txt=[];
        if(a==='later'){close();saveBox=null;draw();return}
        var boxes=[].slice.call(v.querySelectorAll('[data-sv]'));
        if(a==='auto')boxes.forEach(function(bx){
          var w=s.who.find(function(x){return x.id===bx.dataset.sv}), r1=1+Math.floor(Math.random()*20), r2=1+Math.floor(Math.random()*20), d=w.f==='dis'?Math.min(r1,r2):r1;
          bx.value=d+(+w.b||0); txt.push((w.id===ID?'You':w.n)+' rolled '+(w.f==='dis'?r1+'/'+r2+' → ':'')+d+(w.b?' '+sgn(+w.b):'')+' = '+bx.value);
        });
        boxes.forEach(function(bx){var x=parseInt(bx.value,10);if(isNaN(x)){if(!miss)miss=bx}else out[bx.dataset.sv]=x});
        if(miss){m.textContent='Type the total you rolled first.';miss.focus();return}
        sendSave(out);
        if(a==='auto'){m.textContent=txt.join(' · ');setTimeout(function(){close();saveBox=null;draw()},1600)}else{close();saveBox=null;draw()}
      });
    saveBox.onEsc=function(){saveBox=null;draw()};
    layer.querySelectorAll('[data-sv]').forEach(function(inp){inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();var s2=layer.querySelector('[data-a="send"]');if(s2)s2.click()}})});
    draw();
  }
  function sendSave(values){
    if(!db||!save)return; var id=save.id;
    if(!Object.keys(values).length){saveSent=id;draw();return}
    db.doc('party/turn-'+ID).set({act:'save',save:id,values:values,at:new Date().toISOString()})
      .then(function(){saveSent=id;draw()},function(){msg='Couldn’t reach the DM. Tell the DM your save total.';draw()});
  }
  /* The DM ended combat: the fight recap, once. */
  function onRecap(d){
    var R=d&&!d.active&&d.recap; if(!R||!R.id||seenKey('recap',R.id))return;
    if(Date.now()-Date.parse(R.at)>3*3600e3)return;
    var tot=R.tot||{}, aw=R.awards||[];
    modal('<div class="tt-box" role="dialog" aria-modal="true" aria-labelledby="tt-rc" style="max-width:480px"><h2 id="tt-rc">Fight recap</h2>'+
      '<p>'+R.rounds+' round'+(R.rounds===1?'':'s')+(R.foes&&R.foes.n?' · '+R.foes.down+' of '+R.foes.n+' enem'+(R.foes.n===1?'y':'ies')+' defeated':'')+'</p>'+
      '<div class="tt-tot">'+[['Damage dealt',tot.dealt],['Damage taken',tot.taken],['Healing',tot.healed],['Spell slots',tot.spells]].map(function(x){return '<div><b>'+(x[1]||0)+'</b><span>'+x[0]+'</span></div>'}).join('')+'</div>'+
      (aw.length?'<ul class="tt-aw">'+aw.map(function(a){var me=(a.ids||[]).indexOf(ID)>=0;
        return '<li'+(me?' class="me"':'')+'><span class="ic" aria-hidden="true">'+esc(a.icon)+'</span><div><b>'+esc(a.t)+'</b> <span class="dd">'+esc(a.d)+'</span><div>'+esc((a.who||[]).join(', '))+(a.v!=null?' · '+a.v+' '+esc(a.u):'')+(me?' <b>(you!)</b>':'')+'</div></div></li>'}).join('')+'</ul>':'<p>No awards this time.</p>')+
      '<div class="tt-row"><button class="pri" data-a="ok">Nice!</button></div></div>',
      function(a,v,close){close()});
  }
  function onRound(d){
    onSave(d);onRecap(d);
    var was=turnKey();
    round=d&&d.active?d:null;
    if(turnKey()!==was){sent='';msg=''}
    if(myTurn()&&!shown(turnKey()))popup();
    /* the DM asked everyone to roll initiative */
    call=d&&!d.active&&d.call&&(d.callFor||[]).indexOf(ME)>=0?d.call:null;
    if(!call&&callBox){callBox.close();callBox=null}
    if(!(d&&d.call))rolledTxt='';
    if(call&&!callBox&&!shown('init:'+call))rollPopup();
    draw();
  }
  function sendInit(values,txt){
    if(!db||!call)return;
    db.doc('party/turn-'+ID).set({act:'init',call:call,values:values,at:new Date().toISOString()}).then(function(){rolledTxt=txt;draw()},function(){msg='Couldn’t reach the DM’s tracker. Tell the DM your roll.';draw()});
  }
  window.claude.use('db').then(function(d){
    if(!d)return; db=d;
    db.doc('party/round').onSnapshot(function(s){onRound(s.exists?s.data():null)},function(){});
  }).catch(function(){});

  /* ---- what the player sees ---- */
  var css=document.createElement('style');
  css.textContent=
    '.tt-root{--tt-bg:#f9fafb;--tt-ink:#1a1f29;--tt-muted:#5a6371;--tt-rule:#cdd3db;--tt-acc:#8a5120;--tt-acc-ink:#fff8f0;--tt-warn:#b3261e;font:15px/1.4 "Alegreya Sans",system-ui,sans-serif;color:var(--tt-ink)}'+
    '@media (prefers-color-scheme:dark){.tt-root{--tt-bg:#161b22;--tt-ink:#e6e9ee;--tt-muted:#97a1b0;--tt-rule:#2b333e;--tt-acc:#d9965a;--tt-acc-ink:#1a1109;--tt-warn:#f08a80}}'+
    '.tt-root button{font:inherit;font-size:.9rem;border-radius:6px;padding:6px 12px;cursor:pointer;border:1px solid var(--tt-rule);background:var(--tt-bg);color:var(--tt-ink)}'+
    '.tt-root button:hover{border-color:var(--tt-acc)}.tt-root button:focus-visible{outline:2px solid var(--tt-acc);outline-offset:2px}'+
    '.tt-root button.pri{background:var(--tt-acc);border-color:var(--tt-acc);color:var(--tt-acc-ink)}.tt-root button:disabled{opacity:.45;cursor:not-allowed}'+
    '.tt-dock{position:fixed;right:12px;bottom:12px;z-index:900;max-width:calc(100% - 24px);display:flex;flex-direction:column;align-items:flex-end;gap:8px}'+
    '.tt-ord{width:min(300px,calc(100vw - 24px));box-sizing:border-box;background:var(--tt-bg);border:1px solid var(--tt-rule);border-radius:10px;box-shadow:0 4px 18px rgba(0,0,0,.2);overflow:hidden}'+
    '.tt-ord header{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 6px 6px 12px;border-bottom:1px solid var(--tt-rule)}'+
    '.tt-ord header b{font-family:"Marcellus SC",Georgia,serif;font-weight:400;font-size:1rem}.tt-root .tt-ord header button{padding:2px 10px}'+
    '.tt-ord ol{list-style:none;margin:0;padding:4px 0;max-height:min(45vh,340px);overflow:auto}'+
    '.tt-ord li{display:flex;align-items:center;gap:8px;padding:4px 12px;font-size:.92rem}'+
    '.tt-ord li .mk{width:1em;color:var(--tt-acc);font-weight:700}.tt-ord li.cur{background:color-mix(in srgb,var(--tt-acc) 14%,transparent);font-weight:700}'+
    '.tt-ord li.me .nm{color:var(--tt-acc);font-weight:700}.tt-ord li.foe .nm{color:var(--tt-muted)}.tt-ord li.down .nm{text-decoration:line-through}'+
    '.tt-ord .cd{font-style:italic;font-size:.8em}'+
    '.tt-ord .tg{margin-left:auto;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--tt-muted)}'+
    '.tt-root button.tt-tab{border-radius:999px;box-shadow:0 4px 18px rgba(0,0,0,.2);font-weight:700}'+
    '.tt-pill{box-sizing:border-box;max-width:100%;background:var(--tt-bg);border:1px solid var(--tt-rule);border-radius:999px;padding:6px 8px 6px 14px;box-shadow:0 4px 18px rgba(0,0,0,.2);display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;font-size:.88rem}'+
    '.tt-pill.mine,.tt-pill.next{border:2px solid var(--tt-acc)}.tt-pill b{color:var(--tt-acc)}.tt-pill .tt-btns{display:flex;gap:6px}'+
    '.tt-pill .tt-msg{flex-basis:100%;color:var(--tt-warn);font-size:.8rem}'+
    '.tt-veil{position:fixed;inset:0;z-index:1001;display:grid;place-items:center;padding:16px;background:rgba(10,8,16,.55)}'+
    '.tt-box{max-width:420px;width:100%;box-sizing:border-box;background:var(--tt-bg);border-radius:12px;padding:20px 22px;display:grid;gap:12px;box-shadow:0 10px 40px rgba(0,0,0,.4)}'+
    '.tt-box h2{margin:0;font-size:1.4rem;font-family:"Marcellus SC",Georgia,serif;font-weight:400}.tt-box p{margin:0;color:var(--tt-muted)}.tt-box .tt-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}'+
    '.tt-notes{margin:0;padding-left:20px;display:grid;gap:2px}.tt-box .tt-msg{color:var(--tt-acc);min-height:1.2em;font-weight:700}'+
    '.tt-box label{display:grid;gap:4px;font-weight:700}'+
    '.tt-tot{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.tt-tot div{display:grid;justify-items:center;border:1px solid var(--tt-rule);border-radius:6px;padding:6px 4px;text-align:center}'+
    '.tt-tot b{font-size:1.3rem}.tt-tot span{font-size:.75rem;color:var(--tt-muted)}'+
    '.tt-aw{list-style:none;margin:0;padding:0;display:grid;gap:8px}.tt-aw li{display:flex;gap:10px;align-items:flex-start;padding:4px 6px;border-radius:6px}'+
    '.tt-aw li.me{background:color-mix(in srgb,var(--tt-acc) 16%,transparent)}.tt-aw .ic{font-size:1.4rem;width:1.6em;text-align:center}.tt-aw .dd{color:var(--tt-muted);font-size:.85rem}'+
    '.tt-init{font:inherit;font-size:1.3rem;padding:8px 10px;border:1px solid var(--tt-rule);border-radius:6px;background:var(--tt-bg);color:var(--tt-ink);width:100%;box-sizing:border-box}';
  document.head.appendChild(css);
  var root=document.createElement('div'); root.className='tt-root';
  var layer=document.createElement('div'); layer.className='tt-root';   // the pop-up, kept apart so redrawing the bar never removes it
  function mount(){if(!root.parentNode)document.body.appendChild(root);if(!layer.parentNode)document.body.appendChild(layer)}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  /* The turn order from the DM's tracker, only while combat runs. Minimizing it lasts for that fight; a new fight opens it again. */
  var MINKEY=KEY+'-min';
  function minimized(){try{return !!round&&localStorage.getItem(MINKEY)===round.cid}catch(e){return false}}
  function setMin(on){try{if(on)localStorage.setItem(MINKEY,round.cid);else localStorage.removeItem(MINKEY)}catch(e){}draw()}
  function orderBox(){
    var L=round&&round.order||[]; if(!L.length) return '';
    if(minimized()) return '<button class="tt-tab" data-tt="show" aria-expanded="false">⚔ Turn order · round '+round.round+'</button>';
    return '<section class="tt-ord" aria-label="Turn order"><header><b>Turn order · round '+round.round+'</b><button data-tt="hide" aria-expanded="true" aria-label="Minimize turn order" title="Minimize">–</button></header>'+
      '<ol>'+L.map(function(o){var me=o.id===ME;
        return '<li class="'+(o.cur?'cur ':'')+(me?'me ':'')+(o.id?'':'foe ')+(o.down?'down':'')+'"'+(o.cur?' aria-current="true"':'')+'><span class="mk" aria-hidden="true">'+(o.cur?'▶':'')+'</span>'+
          '<span class="nm">'+esc(o.n)+(me?' (you)':'')+(o.c&&o.c.length?' <i class="cd">'+esc(o.c.join(', '))+'</i>':'')+'</span>'+(o.held?'<span class="tg">Holding</span>':o.down?'<span class="tg">Down</span>':'')+'</li>'}).join('')+'</ol></section>';
  }
  function draw(){
    mount();
    var h='', wait=sent?' disabled':'';
    if(myTurn())
      h='<div class="tt-pill mine" role="region" aria-label="Your turn"><span><b>Your turn</b> · round '+round.round+(round.nextName?' · then '+esc(round.nextName):'')+'</span>'+
        '<span class="tt-btns"><button data-tt="hold"'+wait+' title="Ready an action or wait: step out of the order and act later">Hold</button><button class="pri" data-tt="end"'+wait+'>'+(sent==='end'?'Ending…':'End turn')+'</button></span>'+
        (msg?'<span class="tt-msg" role="status">'+esc(msg)+'</span>':'')+'</div>';
    else if(holding())
      h='<div class="tt-pill next"><span><b>Holding</b> · round '+round.round+' · '+esc(round.turnName||'someone')+' is acting</span><button class="pri" data-tt="act"'+wait+'>'+(sent==='act'?'Sending…':'Act now')+'</button></div>';
    else if(round)
      h='<div class="tt-pill'+(round.next===ME?' next':'')+'"><span>Round '+round.round+' · '+esc(round.turnName||'someone')+'’s turn'+(round.next===ME?' · <b>you’re next</b>':'')+'</span></div>';
    else if(call&&!callBox)
      h='<div class="tt-pill next"><span><b>Roll initiative</b> for the DM</span><button class="pri" data-tt="roll">Roll</button></div>';
    else if(rolledTxt)
      h='<div class="tt-pill"><span>'+esc(rolledTxt)+' · waiting for the fight to start</span></div>';
    // an unanswered saving throw sits on top of everything else
    if(save&&!saveBox)h=(saveSent===save.id?'<div class="tt-pill"><span>Save sent · waiting for the DM</span></div>':
      '<div class="tt-pill mine"><span><b>Make a '+esc(ABN[save.ab]||save.ab)+' save!</b></span><button class="pri" data-tt="save">Roll</button></div>')+h;
    var o=orderBox();
    root.innerHTML=o||h?'<div class="tt-dock">'+o+h+'</div>':'';
  }
  root.addEventListener('click',function(ev){
    var b=ev.target.closest('button[data-tt]'), t=b&&b.dataset.tt;if(!b)return;
    if(t==='roll')rollPopup();
    else if(t==='save')savePopup();
    else if(t==='hide'||t==='show'){setMin(t==='hide');var f=root.querySelector(t==='hide'?'[data-tt="show"]':'[data-tt="hide"]');if(f)f.focus()}
    else reply(t);
  });

  /* ---- pop-ups ---- */
  function buzz(){try{if(navigator.vibrate&&navigator.userActivation&&navigator.userActivation.hasBeenActive)navigator.vibrate([120,80,120])}catch(e){}}
  function modal(html,onClick){
    mount();
    var v=document.createElement('div'); v.className='tt-veil'; v.innerHTML=html; layer.appendChild(v);
    var back=document.activeElement, box={close:close};
    function close(){if(!v.parentNode)return;v.remove();document.removeEventListener('keydown',key,true);if(back&&back.focus)try{back.focus()}catch(e){}}
    function key(e){if(e.key==='Escape'){e.stopPropagation();close();if(box.onEsc)box.onEsc()}}
    document.addEventListener('keydown',key,true);
    v.addEventListener('click',function(e){var b=e.target.closest('button[data-a]');if(b)onClick(b.dataset.a,v,close)});
    var f=v.querySelector('input')||v.querySelector('button.pri'); if(f)f.focus();
    return box;
  }
  function popup(){
    buzz();
    var notes=(round.notes||[]).map(function(t){return '<li>'+esc(t)+'</li>'}).join(''), dn=dragonName();
    modal('<div class="tt-box" role="alertdialog" aria-modal="true" aria-labelledby="tt-yt"><h2 id="tt-yt">Your turn, '+esc(NAME)+'!</h2>'+
      '<p>Round '+round.round+(round.nextName?'. '+esc(round.nextName)+' is up after you.':'.')+'</p>'+
      '<p>'+esc(dn.charAt(0).toUpperCase()+dn.slice(1))+' acts on your turn too. It takes the Dodge action unless you spend a bonus action to command it.</p>'+
      (notes?'<ul class="tt-notes">'+notes+'</ul>':'')+
      '<div class="tt-row"><button data-a="end">End turn (pass)</button><button data-a="hold">Hold</button><button class="pri" data-a="go">Take my turn</button></div></div>',
      function(a,v,close){close();if(a!=='go')reply(a)});
  }
  function rollPopup(){
    if(!call||callBox)return;
    buzz();
    var b=bonus();
    callBox=modal('<div class="tt-box" role="dialog" aria-modal="true" aria-labelledby="tt-ri"><h2 id="tt-ri">Roll initiative!</h2>'+
      '<p>Type your total'+(b!=null?' (d20 '+sgn(b)+')':'')+', or let the sheet roll. Your dragon acts on your turn.</p>'+
      '<input class="tt-init" type="number" inputmode="numeric" aria-label="Initiative total" placeholder="Total">'+
      '<p class="tt-msg" role="status"></p>'+
      '<div class="tt-row"><button data-a="later">Later</button><button data-a="auto">Roll for me</button><button class="pri" data-a="send">Send</button></div></div>',
      function(a,v,close){
        var box=v.querySelector('.tt-init'), m=v.querySelector('.tt-msg'), out={};
        if(a==='later'){close();callBox=null;draw();return}
        if(a==='auto'){
          var d=1+Math.floor(Math.random()*20), t=d+(b||0); box.value=t; out[ME]=t;
          m.textContent='Rolled '+d+(b?' '+sgn(b):'')+' = '+t;sendInit(out,'You rolled '+t);shown('init:'+call);setTimeout(function(){close();callBox=null;draw()},1400);return;
        }
        var x=parseInt(box.value,10);
        if(isNaN(x)){m.textContent='Type your initiative total first.';box.focus();return}
        out[ME]=x;sendInit(out,'You rolled '+x);shown('init:'+call);close();callBox=null;draw();
      });
    callBox.onEsc=function(){callBox=null;draw()};
    var inp=layer.querySelector('.tt-init'); if(inp)inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();var s=layer.querySelector('[data-a="send"]');if(s)s.click()}});
    draw();
  }
  if(document.body)draw();else document.addEventListener('DOMContentLoaded',draw);
})();
