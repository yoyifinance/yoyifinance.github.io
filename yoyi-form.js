// 官網樣式的預約問卷（2026-11-04）
// 頁面放 <div data-yoyi-form></div> 就會長出問卷；資料直接送進原本的 Google 問卷（試算表照舊），網站不經手、不存客戶資料。
// 在 Google 問卷改題目、加選項時，這裡的 entry 代號和選項文字要跟著改（選項文字必須一字不差，Google 才收得到）。
// 從理財試算帶數字：網址 ?calc=… 或 window.YOYI_CALC，會預填「網站試算結果」（entry.2011746388）。
(function(){
var GF='https://docs.google.com/forms/d/e/1FAIpQLScU9st7cWI0tRjzh5ze6UEP0wBsMwF52g4j6mr7dQdfKEKMjA/formResponse';
var BANK={name:'822 中國信託',acct:'679540166893'};

// 題目：t=text tel date area radio check consent；req=必填
var STEPS=[
 {k:'1',h:'先認識你',s:'讓我知道怎麼稱呼\n怎麼聯絡你',q:[
  {id:'474377663',t:'text',l:'怎麼稱呼你？',ph:'例如：王小姐 / Andy',req:1},
  {id:'547510124',t:'text',l:'你的 LINE ID',ph:'我會用 LINE 跟你聯絡',req:1},
  {id:'670527687',t:'tel',l:'聯絡手機',ph:'09xx-xxx-xxx',req:1}]},
 {k:'2',h:'關於你',s:'幫助我先了解你的生活背景',q:[
  {id:'1933128490',t:'text',l:'目前所在地區',ph:'例如：台北市、台中市',req:1},
  {id:'492811904',t:'date',l:'你的生日',req:1},
  {id:'1698690731',t:'area',l:'職業與工作內容簡述',ph:'例如：科技業工程師，常加班',req:1}]},
 {k:'3',h:'收入與經驗',s:'沒有標準答案\n照實際狀況選就好',q:[
  {id:'1058084671',t:'radio',l:'平均月收入',o:['3萬以下','3萬~5萬','5萬~10萬','10萬~20萬','20萬以上'],req:1},
  {id:'1235612542',t:'radio',l:'投資經驗',o:['無投資經驗','1年以下','1-3年','3-5年','5年以上'],req:1},
  {id:'1773575038',t:'radio',l:'目前可動用的閒置資金',o:['10萬以下','10-50萬','50-100萬','100~300萬','300~1000萬','1000萬以上'],req:1}]},
 {k:'4',h:'目前的配置',s:'越清楚\n諮詢時越能對症下藥',q:[
  {id:'1010254915',t:'check',l:'目前已持有的配置（可複選）',o:['🏦 銀行存款（活存 / 定存）','📈 台灣股票（ETF）','📈 美國股票（ETF）','🏢 房地產自住','🏢 房地產投資(出租或買賣) ❌非自住','🪙 實體黃金 / 黃金存摺','🛡️ 儲蓄型保單','🛡️ 投資型保單','🔗 虛擬貨幣（加密貨幣）','❎無'],other:1,req:1},
  {id:'668582299',t:'radio',l:'目前的風險承受度',o:['🛡️ 保本至上（強調防護與安全，適合保守型配置）','⚖️ 穩健增長（強調平衡與策略，適合中產階級的核心配置）','🚀 積極進取（強調動力與成長，適合追求資產爆發力的配置）'],req:1}]},
 {k:'5',h:'你的目標',s:'想完成什麼\n我們就從那裡開始',q:[
  {id:'1811156510',t:'check',l:'現階段最想完成的目標（可複選）',o:['🍵 退休金準備','🏠 買房 / 換房計畫','✈️ 旅遊 / 圓夢基金','🧾 稅務規劃','💰現金流打造','🏠房產活化','❓沒有想法'],req:1},
  {id:'1099706819',t:'check',l:'希望我怎麼協助你？（可複選）',o:['💰累積一大桶金','💸 提升每月配息（被動收入）','🧱 建立自動化的財務防火牆（保護工作收入、保障家庭）','🎓 規劃子女教育基金','✈️規劃旅遊基金 (每年旅遊補助)','🔍 揪出目前的財務盲點'],req:1}]},
 {k:'6',h:'怎麼聯絡你',s:'選你方便的時間\n我會照這個時段聯絡',q:[
  {id:'1475083719',t:'check',l:'方便聯繫的時間（可複選）',o:['平日早上','平日下午','平日晚上','假日早上','假日下午','假日晚上'],req:1},
  {id:'1887650498',t:'area',l:'其他想對我說的話，或目前的財務煩惱？（選填）',ph:'想到什麼都可以寫'},
  {id:'2011746388',t:'area',l:'網站試算結果（選填，可修改）',calc:1}]},
 {k:'7',h:'保證金與確認',s:'最後一步',dep:1,q:[
  {id:'1492265098',t:'text',l:'匯款帳號後五碼',ph:'例如：12345',req:1,mode:'numeric'},
  {id:'2009054050',t:'consent',o:['我同意 YOYI 財經 僅為本次諮詢聯繫與規劃使用以上資料'],req:1}]}
];

var CSS='.yf h4,.yf p{margin:0}.yf{background:#fff;border:1px solid rgba(184,137,58,.3);border-radius:22px;box-shadow:0 14px 44px rgba(90,65,20,.10);overflow:hidden;text-align:left;font-family:inherit;color:#1F1B14}'+
'.yf-top{padding:18px 20px 0}.yf-bar{height:6px;border-radius:9px;background:#F3EBDA;overflow:hidden}.yf-bar i{display:block;height:100%;background:linear-gradient(90deg,#E2BD70,#B8893A);border-radius:9px;transition:width .35s}'+
'.yf-cnt{display:flex;justify-content:space-between;font-size:12.5px;color:#7A7366;margin-top:8px;letter-spacing:.06em}.yf-cnt b{color:#B8893A}'+
'.yf-pg{padding:6px 20px 22px}.yf-pg h4{font-family:"Noto Serif TC",serif;font-weight:900;font-size:23px;line-height:1.35;margin-top:10px}.yf-pg>p.s{white-space:pre-line;font-size:14px;color:#7A7366;margin-top:2px}'+
'.yf-q{margin-top:20px}.yf-q>label,.yf-q>.l{display:block;font-weight:700;font-size:15.5px;margin-bottom:8px}.yf-q .rq{color:#C0563B;margin-left:3px}'+
'.yf input[type=text],.yf input[type=tel],.yf input[type=date],.yf textarea{width:100%;font:inherit;font-size:16px;padding:12px 14px;border-radius:14px;border:1px solid rgba(184,137,58,.35);background:#FFFDF8;color:#1F1B14;outline:none;-webkit-appearance:none;appearance:none}'+
'.yf textarea{min-height:92px;resize:vertical;line-height:1.6}.yf input:focus,.yf textarea:focus{border-color:#B8893A;background:#fff;box-shadow:0 0 0 3px rgba(227,191,110,.25)}'+
'.yf-op{display:flex;flex-wrap:wrap;gap:8px}.yf-op label{position:relative;cursor:pointer}.yf-op input{position:absolute;opacity:0;pointer-events:none}'+
'.yf-op span{display:block;padding:9px 15px;border-radius:999px;border:1px solid rgba(184,137,58,.35);background:#fff;font-size:14.5px;line-height:1.45;transition:all .15s}'+
'.yf-op.cs span::before{content:"☐ ";font-size:1.15em}.yf-op.cs input:checked+span::before{content:"☑ "}'+
'.yf-op.col{flex-direction:column}.yf-op.col span{border-radius:14px;padding:11px 14px}'+
'.yf-op input:checked+span{background:linear-gradient(135deg,#E2BD70,#B8893A);border-color:#B8893A;color:#fff;font-weight:700;box-shadow:0 6px 16px rgba(184,137,58,.28)}'+
'.yf-op input:focus-visible+span{outline:2px solid #B8893A;outline-offset:2px}'+
'.yf-oth{margin-top:8px;display:none}.yf-oth.on{display:block}'+
'.yf-er{display:none;font-size:13px;color:#C0563B;margin-top:6px}.yf-q.bad .yf-er{display:block}.yf-q.bad input[type=text],.yf-q.bad input[type=tel],.yf-q.bad input[type=date],.yf-q.bad textarea{border-color:#D98A72}'+
'.yf-dep{margin-top:16px;padding:16px;border-radius:16px;background:#FFF9EC;border:1px solid rgba(184,137,58,.3);font-size:14.5px;line-height:1.75;color:#4A443A}.yf-dep b{color:#1F1B14}.yf-dep em{font-style:normal;font-weight:700;color:#1F1B14;background:linear-gradient(transparent 60%,rgba(227,191,110,.45) 60%)}'+
'.yf-acct{margin-top:10px;background:#fff;border:1px dashed #C9A25A;border-radius:12px;padding:10px 12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}.yf-acct div{flex:1;min-width:150px}.yf-acct small{display:block;font-size:12px;color:#7A7366}.yf-acct strong{font-size:17px;letter-spacing:.06em}'+
'.yf-acct button{font:inherit;font-size:13px;font-weight:700;padding:6px 12px;border-radius:999px;border:1px solid #B8893A;background:#fff;color:#B8893A;cursor:pointer}'+
'.yf-nav{display:flex;gap:10px;padding:0 20px 20px}.yf-nav button{font:inherit;font-weight:700;font-size:16px;padding:14px 10px;border-radius:14px;cursor:pointer;border:1px solid rgba(184,137,58,.35);background:#fff;color:#1F1B14}'+
'.yf-nav .nx{flex:1;border:none;color:#fff;background:linear-gradient(135deg,#D9B061,#B8893A);box-shadow:0 10px 26px rgba(184,137,58,.3)}.yf-nav .bk{width:96px}.yf-nav button[disabled]{opacity:.6;cursor:default}'+
'.yf-note{font-size:12px;color:#A39C8D;text-align:center;padding:0 20px 18px}'+
'.yf-done{padding:34px 22px 30px;text-align:center}.yf-done .ok{width:64px;height:64px;margin:0 auto;border-radius:50%;display:grid;place-items:center;font-size:30px;color:#fff;background:linear-gradient(135deg,#E2BD70,#B8893A);box-shadow:0 10px 26px rgba(184,137,58,.35)}'+
'.yf-done h4{font-family:"Noto Serif TC",serif;font-weight:900;font-size:24px;margin-top:14px}.yf-done p{font-size:15px;color:#4A443A;margin-top:10px;line-height:1.8}.yf-done .tip{font-size:13.5px;color:#7A7366;background:#FFF9EC;border-radius:12px;padding:10px 12px;margin-top:14px}'+
'.yf-pg.in{animation:yfin .3s ease}@keyframes yfin{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:none}}';

function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function track(n,p){try{window.yoyiTrack&&window.yoyiTrack(n,p||{})}catch(e){}}
function calcText(){var c='';try{c=new URLSearchParams(location.search).get('calc')||''}catch(e){}return (window.YOYI_CALC||c||'').slice(0,1500)}

function qHtml(q,uid){
  var n=uid+'-'+q.id,rq=q.req?'<span class="rq">*</span>':'',h='<div class="yf-q" data-q="'+q.id+'">';
  if(q.t==='radio'||q.t==='check'||q.t==='consent'){
    var long=q.o.some(function(o){return o.length>14}),ty=q.t==='radio'?'radio':'checkbox';
    h+=q.t==='consent'?'':'<div class="l">'+esc(q.l)+rq+'</div>';
    h+='<div class="yf-op'+(long||q.t==='consent'?' col':'')+(q.t==='consent'?' cs':'')+'">'+q.o.map(function(o){return '<label><input type="'+ty+'" name="'+n+'" value="'+esc(o)+'"><span>'+esc(o)+'</span></label>'}).join('');
    if(q.other)h+='<label><input type="checkbox" name="'+n+'" value="__other_option__"><span>其他</span></label>';
    h+='</div>';
    if(q.other)h+='<input class="yf-oth" type="text" name="'+n+'-oth" placeholder="請寫下其他配置">';
  }else{
    h+='<label for="'+n+'">'+esc(q.l)+rq+'</label>';
    if(q.t==='area')h+='<textarea id="'+n+'" name="'+n+'" placeholder="'+esc(q.ph||'')+'"></textarea>';
    else h+='<input id="'+n+'" name="'+n+'" type="'+q.t+'"'+(q.mode?' inputmode="'+q.mode+'" maxlength="5"':'')+(q.t==='tel'?' inputmode="tel" autocomplete="tel"':'')+' placeholder="'+esc(q.ph||'')+'">';
  }
  return h+'<div class="yf-er">'+(q.t==='check'?'請至少選一個':q.t==='radio'?'請選一個':q.t==='consent'?'請勾選同意':'這題要填喔')+'</div></div>';
}

function mount(box,ix){
  var uid='yf'+ix,cur=0,calc=calcText(),steps=STEPS.map(function(s){return s});
  box.innerHTML='<div class="yf" id="'+uid+'"><div class="yf-top"><div class="yf-bar"><i></i></div><div class="yf-cnt"><span><b>1</b> / '+steps.length+'</span><span>約 3 分鐘</span></div></div>'+
   steps.map(function(s,i){var qs=s.q.filter(function(q){return !q.calc||calc});
    var dep=s.dep?'<div class="yf-dep"><b>本諮詢採「保證金預約制」</b><br>預約保證金 <em>NT$ 500</em><br>完成線上 30 分鐘 1 對 1 諮詢後<br>不論是否進行後續規劃<br><em>當日全額退還</em>。<br>保證金只是為了確保彼此的時間承諾 🙏'+
     '<div class="yf-acct"><div><small>銀行名稱／代碼</small><strong>'+BANK.name+'</strong></div><div><small>轉帳帳號</small><strong>'+BANK.acct+'</strong></div><button type="button" data-copy="'+BANK.acct+'">複製帳號</button></div></div>':'';
    return '<div class="yf-pg" data-i="'+i+'"'+(i?' hidden':'')+'><h4>'+esc(s.h)+'</h4><p class="s">'+esc(s.s)+'</p>'+dep+qs.map(function(q){return qHtml(q,uid)}).join('')+'</div>'}).join('')+
   '<div class="yf-nav"><button type="button" class="bk" hidden>上一步</button><button type="button" class="nx">下一步</button></div><p class="yf-note">🔒 資料只用於這次諮詢聯絡<br>不會公開</p></div>';
  var root=box.firstChild,pgs=root.querySelectorAll('.yf-pg'),bk=root.querySelector('.bk'),nx=root.querySelector('.nx');
  if(calc){var ta=root.querySelector('[name="'+uid+'-2011746388"]');if(ta)ta.value=calc}
  root.addEventListener('change',function(e){
    var t=e.target;if(t.value==='__other_option__'){var o=root.querySelector('[name="'+t.name+'-oth"]');o.classList.toggle('on',t.checked);if(t.checked)o.focus()}
    var q=t.closest('.yf-q');if(q)q.classList.remove('bad')});
  root.addEventListener('input',function(e){var q=e.target.closest('.yf-q');if(q)q.classList.remove('bad')});
  root.addEventListener('click',function(e){var b=e.target.closest('[data-copy]');if(!b)return;
    var v=b.getAttribute('data-copy');(navigator.clipboard?navigator.clipboard.writeText(v):Promise.reject()).then(function(){b.textContent='已複製 ✓'},function(){b.textContent=v})});
  function q2v(q){var n=uid+'-'+q.id;
    if(q.t==='radio'||q.t==='check'||q.t==='consent')return [].map.call(root.querySelectorAll('[name="'+n+'"]:checked'),function(x){return x.value});
    var el=root.querySelector('[name="'+n+'"]');return el?el.value.trim():''}
  function ok(i){var bad=null;steps[i].q.forEach(function(q){if(!q.req)return;var v=q2v(q),el=root.querySelector('[data-q="'+q.id+'"]');
    var miss=Array.isArray(v)?!v.length:!v;if(q.other&&v.indexOf('__other_option__')>=0&&!root.querySelector('[name="'+uid+'-'+q.id+'-oth"]').value.trim())miss=true;
    if(el){el.classList.toggle('bad',miss);if(miss&&!bad)bad=el}});
    if(bad){var f=bad.querySelector('input,textarea');bad.scrollIntoView({behavior:'smooth',block:'center'});if(f&&f.type!=='radio'&&f.type!=='checkbox')f.focus({preventScroll:true})}
    return !bad}
  function show(i){pgs[cur].hidden=true;cur=i;pgs[i].hidden=false;pgs[i].classList.remove('in');void pgs[i].offsetWidth;pgs[i].classList.add('in');
    root.querySelector('.yf-bar i').style.width=((i+1)/steps.length*100)+'%';root.querySelector('.yf-cnt b').textContent=i+1;
    bk.hidden=!i;nx.textContent=i===steps.length-1?'送出預約 ✓':'下一步';
    var r=root.getBoundingClientRect();if(r.top<0||r.top>innerHeight*.4)root.scrollIntoView({behavior:'smooth',block:'start'})}
  root.querySelector('.yf-bar i').style.width=(1/steps.length*100)+'%';
  bk.onclick=function(){if(cur)show(cur-1)};
  nx.onclick=function(){if(!ok(cur))return;
    if(cur<steps.length-1){show(cur+1);track('form_next',{step:cur+1});return}
    send()};
  function send(){
    var fd=new URLSearchParams();
    steps.forEach(function(s){s.q.forEach(function(q){var v=q2v(q);
      if(q.t==='date'){if(v){var d=v.split('-');fd.append('entry.'+q.id+'_year',d[0]);fd.append('entry.'+q.id+'_month',+d[1]);fd.append('entry.'+q.id+'_day',+d[2])}return}
      if(Array.isArray(v))v.forEach(function(x){fd.append('entry.'+q.id,x)});else if(v)fd.append('entry.'+q.id,v);
      if(q.other&&v.indexOf('__other_option__')>=0)fd.append('entry.'+q.id+'.other_option_response',root.querySelector('[name="'+uid+'-'+q.id+'-oth"]').value.trim())})});
    fd.append('pageHistory','0,1,2');
    nx.disabled=true;nx.textContent='送出中…';
    fetch(GF,{method:'POST',mode:'no-cors',body:fd}).then(done,function(){nx.disabled=false;nx.textContent='送出預約 ✓';
      alert('網路好像不太穩，送出失敗了\n請再按一次「送出預約」。')})}
  function done(){track('form_submit',{});
    root.innerHTML='<div class="yf-done"><div class="ok">✓</div><h4>預約完成，謝謝你！</h4><p>我已經收到你的資料<br>會根據你的目標先做功課。<br><b>24 小時內</b>我會透過 LINE 跟你聯絡<br>約線上 30 分鐘 1 對 1 的時間。</p>'+
     '<p class="tip">☕ 小提醒：<br>請確認 LINE 已開啟「允許利用 ID 加入好友」<br>才不會錯過我的訊息。</p></div>';
    root.scrollIntoView({behavior:'smooth',block:'start'})}
}

function css(){if(!document.getElementById('yf-css')){var st=document.createElement('style');st.id='yf-css';st.textContent=CSS;document.head.appendChild(st)}}
function init(){var bs=document.querySelectorAll('[data-yoyi-form]');if(!bs.length)return;css();[].forEach.call(bs,mount)}
// 給理財試算用：按下預約時才長出問卷，再次按下只更新試算文字（不清掉已填的答案）
var n=100;window.YoyiForm={open:function(el,calc){window.YOYI_CALC=calc||'';
  if(!el.firstChild){css();mount(el,n++);return}
  var ta=el.querySelector('[name$="-2011746388"]');if(ta&&calc)ta.value=calc}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
