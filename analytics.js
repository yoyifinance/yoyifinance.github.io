// 流量統計（Google Analytics 4）
// 1. 到 analytics.google.com 建立資源 → 網站串流，複製「評估 ID」（G- 開頭）貼到下面 GA_ID
// 2. GA_ID 空白時這支程式什麼都不做，網站照常運作
// 追蹤的事件（GA4 →「事件」報表可看到）：
//   join_line      點了「加入 LINE 社群」（page = 在哪一頁點的）
//   booking_click  點了「預約財務諮詢」
//   ig_click       點了 Instagram
//   form_next      預約問卷換頁（step 2 = 填完第一頁，step 3 = 到了最後一頁＝填完）
//   calc_use       理財試算有動過數字（每次開頁只記一次，tab = house / car）
(function(){
  var GA_ID='G-7L1SJ24MTK';
  if(!GA_ID)return;
  var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+GA_ID;document.head.appendChild(s);
  window.dataLayer=window.dataLayer||[];
  function gtag(){dataLayer.push(arguments)}
  window.gtag=gtag;gtag('js',new Date());gtag('config',GA_ID);
  var page=location.pathname.replace(/^.*\//,'')||'index.html';
  window.yoyiTrack=function(name,p){p=p||{};p.page=page;gtag('event',name,p)};
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;
    var h=a.getAttribute('href'),where=a.dataset.where||'';
    if(/line\.me/.test(h))yoyiTrack('join_line',{where:where});
    else if(/booking\.html/.test(h))yoyiTrack('booking_click',{where:where});
    else if(/instagram\.com/.test(h))yoyiTrack('ig_click',{where:where});
  },true);
  // 預約問卷：iframe 每換一頁就重新載入一次
  document.addEventListener('DOMContentLoaded',function(){
    var f=document.querySelector('.form iframe');
    if(f){var n=0;f.addEventListener('load',function(){n++;if(n>1)yoyiTrack('form_next',{step:n})})}
    var used=false;
    document.addEventListener('input',function(e){
      if(used||!document.getElementById('c-fair-t'))return;used=true;
      var c=document.getElementById('tab-car');yoyiTrack('calc_use',{tab:c&&c.getAttribute('aria-selected')==='true'?'car':'house'});
    });
  });
})();
