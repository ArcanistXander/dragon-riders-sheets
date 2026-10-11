/* Dragon Riders sheets: turns from the DM's initiative tracker (website copy only).
   The party sheet posts party/round {cid, round, active, turn, turnName, next, nextName, held, notes, call, callFor}.
   turn, next, held and callFor hold tracker entries: "pc-<rider>" for the rider, "dr-<rider>" for their dragon,
   and only for riders reading a live sheet. On this rider's (or dragon's) turn the sheet pops up "Your turn", and a
   small bar stays at the bottom with Hold and End turn. Replies go to party/turn-<rider>; the party sheet moves the tracker.
   Load after cloud.js:  <script src="js/turn.js" data-hero="corbin" data-name="Corbin"></script> */
(function(){
  'use strict';
  var me=document.currentScript, ID=me&&me.dataset.hero, NAME=(me&&me.dataset.name)||ID;
  if(!ID||!window.claude||!window.claude.use)return;
  var KEY='drsheet-turn-'+ID;   // the last turn the pop-up was shown for, so a reload doesn't show it again
  var RIDER='pc-'+ID, DRAGON='dr-'+ID;

  var round=null, db=null, sent='', msg='', call=null, mine=[], rolledTxt='', callBox=null;
  function turnKey(){return round?round.cid+':'+round.round+':'+round.turn:''}
  function mineE(e){return e===RIDER||e===DRAGON}
  function myTurn(){return !!(round&&round.active&&mineE(round.turn))}
  function heldE(){return round&&round.active?(round.held||[]).filter(mineE):[]}
  function shown(k){try{if(localStorage.getItem(KEY)===k)return true;localStorage.setItem(KEY,k)}catch(e){}return false}
  /* this sheet's own report (kept in this browser): initiative bonuses and the dragon's name */
  function rep(){try{return JSON.parse(localStorage.getItem('drsheet-link:'+ID)||'null')}catch(e){return null}}
  function dragonName(){var r=rep();return (r&&r.dragon&&r.dragon.name)||(round&&round.turn===DRAGON&&round.turnName)||'Your dragon'}
  function who(e){return e===DRAGON?dragonName():NAME}
  function bonus(e){var r=rep();if(!r)return null;var v=e===DRAGON?r.dragon&&r.dragon.init:r.live&&r.live.init;return v==null||isNaN(+v)?null:+v}
  function sgn(v){return v<0?'− '+(-v):'+ '+v}

  /* ---- talking to the DM's tracker ---- */
  function reply(act,entry){
    if(!db||!round)return;
    sent=act; draw();
    db.doc('party/turn-'+ID).set({cid:round.cid,round:round.round,entry:entry||round.turn,act:act,at:new Date().toISOString()})
      .catch(function(){sent='';msg='Couldn’t reach the DM’s tracker. Tell the DM.';draw()});
  }
  function onRound(d){
    var was=turnKey();
    round=d&&d.active?d:null;
    if(turnKey()!==was){sent='';msg=''}
    if(myTurn()&&!shown(turnKey()))popup();
    /* the DM asked everyone to roll initiative */
    mine=d&&!d.active&&d.call?(d.callFor||[]).filter(mineE):[];
    call=mine.length?d.call:null;
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
    '.tt-pill{position:fixed;right:12px;bottom:12px;z-index:900;max-width:calc(100% - 24px);box-sizing:border-box;background:var(--tt-bg);border:1px solid var(--tt-rule);border-radius:999px;padding:6px 8px 6px 14px;box-shadow:0 4px 18px rgba(0,0,0,.2);display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;font-size:.88rem}'+
    '.tt-pill.mine,.tt-pill.next{border:2px solid var(--tt-acc)}.tt-pill b{color:var(--tt-acc)}.tt-pill .tt-btns{display:flex;gap:6px}'+
    '.tt-pill .tt-msg{flex-basis:100%;color:var(--tt-warn);font-size:.8rem}'+
    '.tt-veil{position:fixed;inset:0;z-index:1001;display:grid;place-items:center;padding:16px;background:rgba(10,8,16,.55)}'+
    '.tt-box{max-width:420px;width:100%;box-sizing:border-box;background:var(--tt-bg);border-radius:12px;padding:20px 22px;display:grid;gap:12px;box-shadow:0 10px 40px rgba(0,0,0,.4)}'+
    '.tt-box h2{margin:0;font-size:1.4rem;font-family:"Marcellus SC",Georgia,serif;font-weight:400}.tt-box p{margin:0;color:var(--tt-muted)}.tt-box .tt-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}'+
    '.tt-notes{margin:0;padding-left:20px;display:grid;gap:2px}.tt-box .tt-msg{color:var(--tt-acc);min-height:1.2em;font-weight:700}'+
    '.tt-box label{display:grid;gap:4px;font-weight:700}'+
    '.tt-init{font:inherit;font-size:1.3rem;padding:8px 10px;border:1px solid var(--tt-rule);border-radius:6px;background:var(--tt-bg);color:var(--tt-ink);width:100%;box-sizing:border-box}';
  document.head.appendChild(css);
  var root=document.createElement('div'); root.className='tt-root';
  var layer=document.createElement('div'); layer.className='tt-root';   // the pop-up, kept apart so redrawing the bar never removes it
  function mount(){if(!root.parentNode)document.body.appendChild(root);if(!layer.parentNode)document.body.appendChild(layer)}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function draw(){
    mount();
    var h='', wait=sent?' disabled':'', held=heldE();
    if(myTurn())
      h='<div class="tt-pill mine" role="region" aria-label="Your turn"><span><b>'+(round.turn===DRAGON?esc(who(DRAGON))+'’s turn':'Your turn')+'</b> · round '+round.round+(round.nextName?' · then '+esc(round.nextName):'')+'</span>'+
        '<span class="tt-btns"><button data-tt="hold"'+wait+' title="Ready an action or wait: step out of the order and act later">Hold</button><button class="pri" data-tt="end"'+wait+'>'+(sent==='end'?'Ending…':'End turn')+'</button></span>'+
        (msg?'<span class="tt-msg" role="status">'+esc(msg)+'</span>':'')+'</div>';
    else if(held.length)
      h='<div class="tt-pill next"><span><b>'+esc(held.map(who).join(' and '))+' holding</b> · round '+round.round+' · '+esc(round.turnName||'someone')+' is acting</span>'+
        '<span class="tt-btns">'+held.map(function(e){return '<button class="pri" data-tt="act" data-e="'+e+'"'+wait+'>'+(sent==='act'?'Sending…':(held.length>1?esc(who(e))+' acts now':'Act now'))+'</button>'}).join('')+'</span></div>';
    else if(round)
      h='<div class="tt-pill'+(mineE(round.next)?' next':'')+'"><span>Round '+round.round+' · '+esc(round.turnName||'someone')+'’s turn'+(mineE(round.next)?' · <b>'+(round.next===DRAGON?esc(who(DRAGON))+' is next':'you’re next')+'</b>':'')+'</span></div>';
    else if(call&&!callBox)
      h='<div class="tt-pill next"><span><b>Roll initiative</b> for the DM</span><button class="pri" data-tt="roll">Roll</button></div>';
    else if(rolledTxt)
      h='<div class="tt-pill"><span>'+esc(rolledTxt)+' · waiting for the fight to start</span></div>';
    root.innerHTML=h;
  }
  root.addEventListener('click',function(ev){var b=ev.target.closest('button[data-tt]');if(!b)return;if(b.dataset.tt==='roll')rollPopup();else reply(b.dataset.tt,b.dataset.e)});

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
    var dragon=round.turn===DRAGON, notes=(round.notes||[]).map(function(t){return '<li>'+esc(t)+'</li>'}).join('');
    modal('<div class="tt-box" role="alertdialog" aria-modal="true" aria-labelledby="tt-yt"><h2 id="tt-yt">'+(dragon?esc(who(DRAGON))+'’s turn!':'Your turn, '+esc(NAME)+'!')+'</h2>'+
      '<p>Round '+round.round+(round.nextName?'. '+esc(round.nextName)+' is up after '+(dragon?'it':'you')+'.':'.')+'</p>'+
      (dragon?'<p>It takes the Dodge action unless you spend a bonus action to command it.</p>':'')+
      (notes?'<ul class="tt-notes">'+notes+'</ul>':'')+
      '<div class="tt-row"><button data-a="end">End turn (pass)</button><button data-a="hold">Hold</button><button class="pri" data-a="go">'+(dragon?'Command it':'Take my turn')+'</button></div></div>',
      function(a,v,close){close();if(a!=='go')reply(a)});
  }
  function rollPopup(){
    if(!call||callBox)return;
    buzz();
    var rows=mine.map(function(e){var b=bonus(e);
      return '<label>'+esc(e===DRAGON?who(DRAGON):'You ('+NAME+')')+(b!=null?' <span style="font-weight:400;color:var(--tt-muted)">d20 '+sgn(b)+'</span>':'')+
        '<input class="tt-init" data-e="'+e+'" type="number" inputmode="numeric" aria-label="'+esc(who(e))+' initiative total" placeholder="Total"></label>'}).join('');
    callBox=modal('<div class="tt-box" role="dialog" aria-modal="true" aria-labelledby="tt-ri"><h2 id="tt-ri">Roll initiative!</h2>'+
      '<p>Type your total'+(mine.length>1?'s':'')+', or let the sheet roll.</p>'+rows+
      '<p class="tt-msg" role="status"></p>'+
      '<div class="tt-row"><button data-a="later">Later</button><button data-a="auto">Roll for me</button><button class="pri" data-a="send">Send</button></div></div>',
      function(a,v,close){
        var boxes=[].slice.call(v.querySelectorAll('.tt-init')), m=v.querySelector('.tt-msg'), out={}, txt=[];
        if(a==='later'){close();callBox=null;draw();return}
        if(a==='auto'){
          boxes.forEach(function(box){var e=box.dataset.e,b=bonus(e)||0,d=1+Math.floor(Math.random()*20);box.value=d+b;out[e]=d+b;txt.push(who(e)+' '+(d+b)+' (rolled '+d+')')});
          m.textContent=txt.join(' · ');sendInit(out,'Rolled '+txt.join(', '));shown('init:'+call);setTimeout(function(){close();callBox=null;draw()},1600);return;
        }
        for(var i=0;i<boxes.length;i++){var x=parseInt(boxes[i].value,10);if(isNaN(x)){m.textContent='Type every initiative total first.';boxes[i].focus();return}out[boxes[i].dataset.e]=x;txt.push(who(boxes[i].dataset.e)+' '+x)}
        sendInit(out,'Rolled '+txt.join(', '));shown('init:'+call);close();callBox=null;draw();
      });
    callBox.onEsc=function(){callBox=null;draw()};
    [].slice.call(layer.querySelectorAll('.tt-init')).forEach(function(inp,i,all){inp.addEventListener('keydown',function(e){if(e.key!=='Enter')return;e.preventDefault();if(all[i+1])all[i+1].focus();else{var s=layer.querySelector('[data-a="send"]');if(s)s.click()}})});
    draw();
  }
  if(document.body)draw();else document.addEventListener('DOMContentLoaded',draw);
})();
