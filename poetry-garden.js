/* V38: ink-paper sheets. Original manuscripts remain authoritative. */
const POETRY_LEAVES_SOURCE=[{"title":"如果说战争是一次盛大的葬礼","body":"…\n如果说战争是一次盛大的葬礼，\n那地球便是我们的坟地。\n扭曲的飞机与坦克要来做棺材、\n生锈的枪械与弹壳当陪葬淹没残骸。\n曾经绽放的血肉鲜花洒满遗体，\n弥漫硝烟为漫天香华祝我安息。\n遗照中支离破碎的头骨挂在刺刀，\n弯曲的下颌骨一半在微笑。\n怒吼与哀嚎，咒骂和尖叫。\n演奏着交响安眠曲三天三夜，\n也阻挡不了眼球们上天入地的逃跑。\n我们与敌人交织着，再不分彼此，\n带着我们那未完的\n亲情、\n爱情、\n友情，\n一同沉入沙漠、沼泽、丛林与海底。\n与此相关的所有人都恸哭着，\n她们被强迫见证我们的葬礼，\n无论身处何地，\n都共享着那被我们诅咒的\n亲情、\n爱情\n与友情，\n继续活下去。\n愿战争消逝，\n世界和平，再无泪水。\n愿曾经的战士们，安睡。\n…"},{"title":"雪旅","body":"圣白山天共，点黑岩铁时。\n夏风尤做冷，狂水脸霜直。\n厚衣僵无有，天地渺渺痴。\n万籁此颓寂，唯风闯心失。"},{"title":"夕阳红","body":"夕阳红，夕阳红，\n红卷天云如相融。\n不见远海当年绿，\n但见怒云夕阳红。"},{"title":"死花","body":"花败宛若生，气盛独枝死。\n孤立丛冬中，不惧黑寒洗。\n生隐归众花，死坚脱俗气。\n虽枯神亦胜，吾辈应如此。"},{"title":"诗稿 05","body":"千万藏书一寸金，不如与朋片刻阴。\n共逐黄土年与日，方知广厦页中辛！"},{"title":"燕","body":"一\n燕过飞无痕，君死无人问。\n黄沙埋白骨，颗颗是英魂。\n\n二\n燕过飞无痕，心事何处恨。\n叶雨秋色里，杯茶且消闲。"},{"title":"手","body":"嫩白温玉五指分，双指并捻削葱根。\n似是露水冻晶化，又疑云映日光辉。\n腕口轻弯欲折断，细龙青盘指缝间。\n通体雪凝浑然成，恰是工匠雕玉能。\n（吉良吉影也赞叹，杀皇已发动炸弹！）"},{"title":"李诗仙","body":"世人皆赞李诗仙，无人知李书两千。\n百杯夜叹应有识，梁梦到头孤坟眠！"},{"title":"脸盲","body":"我时常认不对别人的脸，\n所以大家都说我是脸盲。\n久而久之，连我也说：“我是脸盲。”\n有时，我会想，我真的是脸盲吗？\n明明有的人脸，基本一样。\n一样的小眼睛、坏脾气、乱头发、不正经，\n容貌像的性格也像。\n可我不知道，因为我是脸盲\n“脸盲，你是脸盲。”大家齐声附和，\n情绪高涨。\n我看着他们的脸开始重合，逐渐变成一个模样。\n于是我也笑起来，说：“脸盲，我是脸盲。”"},{"title":"诗稿 10","body":"云阶步步清，灰海寂寂平。\n舟漪望而叹，日月任渔行。"},{"title":"皇","body":"粉身玉肌润汤香，万人千女入泉痒。\n媚面流转魂无定，醉卧肉山不胜场。\n佳人一笑媚百回，声声催我梦离肠。\n太监奴婢卑等令，文武臣官怒而慌。\n尘民冷冬亲相食，寡人温春龙袍敞。\n谁怜万物悲万涸？今身一回疯一莽！"},{"title":"暴雨","body":"风摧柳叶舞续雨，黑云为伴演天地。\n远雷密，不见阳红绝人迹。\n孤灯微续茶屋里，竹湖亭默如黑狱。\n风雷起，只鸟惊寻乱飞去。"},{"title":"二二年七月二十日戌时散步邓庄南路有感","body":"绵山思遮千丈天，淡云愁坠万里连。\n青夜直残夕边树，黑遍，影压百家灯自怜…\n我散郊阔油柏路，仍笑天仙不知数，醉允日月共天幕。\n琼浆玉液，半倾染碧处；红光娇现，却隐如袖辉不复。\n可怜！不如高歌乐漫步。"},{"title":"赠博宇","body":"天有羽鸟，衔冀之迁。\n海生月明，耀枝而联。\n尘爪终收，地芽将见。\n微巢永筑，琴瑟不眠。"},{"title":"冥想","body":"行看山与水，坐观心互忘。\n山水无穷里，思绪万千样。\n平静听万物，山水虽激荡。\n自在世界里，红尘再无望。"},{"title":"晚饭路上有感","body":"寒打枫叶黄遍地，卷秋携冬霜。\n小雨随拍伞面上，郁郁路渺茫。\n肤已凉，人彷徨，暮至何处寻曙光？\n豺狼暗权日不落，布衣只求身安当。"}];
const POETRY_LEAVES=window.shiliSiteEditor.registerPoems(POETRY_LEAVES_SOURCE.map(p=>({...p,displayCopies:1})));
function poetryDisplayPages(){return POETRY_LEAVES.flatMap((p,sourceIndex)=>Array.from({length:(p.displayChance??100)===0?0:Math.max(0,Math.min(5,p.displayCopies??1))},()=>({...p,sourceIndex})));}
// Crop only the illustration from the original manuscript; never duplicate its printed text.
const POETRY_ORIGINAL_ART={
 '79551cf18d918a49.jpg':[1080,1226,324,20,432,450],
 'ce943b648b71b2af.jpg':[1080,1104,215,460,795,215],
 '1e19be74fb996e27.jpg':[1080,1210,324,12,432,444],
 '11ff4f5090c703d2.png':[1080,1293,324,20,432,440],
 '388c6c4394e94672.jpg':[1080,794,0,530,1080,264],
 '6e5b8aea83d413b5.jpg':[1080,1250,0,1135,1080,115],
 'c8eaf0b11530def9.jpg':[1080,1184,324,0,432,445]
};
function poetryWarPage(p){return p?.src?.endsWith('5c44703c455d2ae4.jpg')||p?.title==='如果说战争是一次盛大的葬礼';}
function poetryOriginalArt(p){
 if(!p||poetryWarPage(p)||p.kind==='image'||p.paper)return '';
 const crop=POETRY_ORIGINAL_ART[p.src?.split('/').pop()];if(!crop)return '';
 const [w,h,x,y,cw,ch]=crop;
 return `<svg class="poetry-original-art" aria-hidden="true" viewBox="${x} ${y} ${cw} ${ch}" preserveAspectRatio="xMidYMid meet"><image href="${E(p.src)}" width="${w}" height="${h}"/></svg>`;
}
function applyPoetryPaper(el,p){const paper=el.querySelector('.poetry-leaf-paper');if(!p?.paper)return;paper.style.setProperty('--poem-paper-color',p.paper.color);paper.style.setProperty('--poem-paper-image',!poetryWarPage(p)&&p.paper.image?'url('+JSON.stringify(p.paper.image)+')':'none');paper.style.setProperty('--poem-paper-opacity',p.paper.opacity/100);}
function poetryLinesMarkup(body){return body.split('\n').map(line=>`<span class="${/^[\u3400-\u9fff]{7}[，、。！？；][\u3400-\u9fff]{7}[，、。！？；]$/.test(line)?'poetry-verse-nowrap':''}">${E(line)||'&nbsp;'}</span>`).join('');}
function poetryGardenMarkup(){
 const pages=poetryDisplayPages();
 return `<div class="poetry-garden" data-poetry-garden data-entrance="waiting"><header class="poetry-intro"><span>04 / POETRY</span><h1>“诗”志不渝</h1><p>${E(D.sections.poetry.paragraphs[2])}</p><p>${E(D.sections.poetry.paragraphs[1])}</p></header>
 <div class="poetry-space" tabindex="0" role="region" aria-label="自由悬浮诗页，左右拖动或方向键探索，点击完整阅读">
 <div class="poetry-world"><svg class="poetry-thread" viewBox="0 0 1400 800" preserveAspectRatio="none" aria-hidden="true"><path d="M-40 240 C140 -70 180 530 410 440 S570 35 800 250 S850 860 1430 680"/></svg>
 ${pages.map((p,i)=>`<button class="poetry-leaf" data-poem="${p.sourceIndex}" data-slot="${i}" data-index="${p.sourceIndex}" aria-label="阅读：${E(p.title)}" aria-controls="poetry-reader" aria-expanded="false"><span class="poetry-leaf-paper">${poetryOriginalArt(p)}<span class="poetry-leaf-number">${String(p.sourceIndex+1).padStart(2,'0')}</span><strong>${E(p.title)}</strong><span class="poetry-rule"></span><span class="poetry-leaf-lines">${p.kind==='image'?`<img class="poetry-upload-image" src="${E(p.thumb||p.src)}" alt="${E(p.title)}" decoding="async">`:poetryLinesMarkup(p.body)}</span>${p.kind==='image'?'':'<span class="poetry-signature">花草情裳</span>'}</span></button>`).join('')}
 ${Array.from({length:pages.length?36:0},(_,i)=>{const p=pages[(i*5+1)%pages.length];return `<span class="poetry-leaf poetry-ghost" aria-hidden="true" data-ghost="${i}" data-source="${p.sourceIndex}"><span class="poetry-leaf-paper">${poetryOriginalArt(p)}<strong>${E(p.title)}</strong><span class="poetry-rule"></span><span class="poetry-leaf-lines">${poetryLinesMarkup(p.body.split('\n').filter(Boolean).slice(0,6).join('\n'))}</span></span></span>`;}).join('')}
 </div></div>
 <aside class="poetry-reader" id="poetry-reader" aria-label="诗稿阅读面板" hidden><div class="poetry-reader-top"><span class="poetry-count"></span><div><button data-poem-prev aria-label="上一篇">‹</button><button data-poem-next aria-label="下一篇">›</button><button data-poem-close aria-label="关闭阅读面板">×</button></div></div><div class="poetry-reader-scroll" tabindex="0"><h2></h2><div class="poetry-reader-lines"></div><p class="poetry-reader-author">— 花草情裳 —</p><button class="poetry-original">查看原稿 ↗</button><div class="poetry-reader-landscape" aria-hidden="true"></div></div></aside>
 <div class="poetry-browse"><span>${POETRY_LEAVES.length} / 页诗稿</span><button class="poetry-fall-toggle" aria-pressed="false">暂停飘落</button></div><a class="poetry-wall-link section-wall-entry" href="#/wall/poetry">查看完整诗稿墙 ↗</a></div>`;
}
class PoetryGarden{
 constructor(root){
  this.root=root;root.poetryGarden=this;this.space=root.querySelector('.poetry-space');this.leaves=[...root.querySelectorAll('[data-poem]')];this.pages=this.leaves.map(el=>({...POETRY_LEAVES[+el.dataset.poem],sourceIndex:+el.dataset.poem}));this.ghosts=[...root.querySelectorAll('.poetry-ghost')];this.bleed=650;this.reader=root.querySelector('.poetry-reader');this.cleanups=[];this.motion=matchMedia('(prefers-reduced-motion: reduce)');this.visible=false;this.frame=0;this.elapsed=0;this.pan=0;this.panTarget=0;this.mx=this.my=0;this.pointer={x:0,y:0};this.hover=null;this.focus=null;this.entranceTime=0;this.entered=false;
  this.assetCleanup=()=>{};
  const on=(el,type,fn,opts)=>{el.addEventListener(type,fn,opts);this.cleanups.push(()=>el.removeEventListener(type,fn,opts));};
  on(root.querySelector('[data-poem-prev]'),'click',()=>this.nextPoem(-1));
  on(root.querySelector('[data-poem-next]'),'click',()=>this.nextPoem(1));
  on(root.querySelector('[data-poem-close]'),'click',e=>this.closeReader(e.detail===0));
  on(root.querySelector('.poetry-original'),'click',e=>{e.currentTarget.dataset.gallery='poetry';openGallery(D.sections.poetry.gallery,this.pages[this.index]?.sourceIndex??0,e.currentTarget);});
  on(root,'keydown',e=>{if(e.key==='Escape'&&!this.reader.hidden&&!document.body.classList.contains('modal-open')){e.preventDefault();e.stopPropagation();this.closeReader(true);}});
  on(root.querySelector('.poetry-fall-toggle'),'click',e=>{this.paused=!this.paused;e.currentTarget.setAttribute('aria-pressed',String(this.paused));e.currentTarget.textContent=this.paused?'继续飘落':'暂停飘落';this.sync();});
  this.leaves.forEach((leaf,i)=>{
   on(leaf,'click',()=>{if(performance.now()>=(this.dragUntil||0))this.open(i);});
   // A panel disappearing under a stationary pointer must not pause the revealed card.
   on(leaf,'pointermove',e=>{if(e.pointerType==='mouse')this.hover=i;});
   on(leaf,'pointerleave',()=>{if(this.hover===i)this.hover=null;});
   on(leaf,'focus',()=>{this.focus=i;const item=this.nodes[i];if(item&&Math.abs(item.travel-item.margin-this.height/2)>this.height/2){item.travel=item.margin+this.height/2;item.pose=null;}if(leaf.matches(':focus-visible')){const n=this.nodes[i];this.panTarget=this.clamp(this.width/2-n.screenX);this.wake();}});
   on(leaf,'blur',()=>this.focus=null);
  });
  on(this.space,'pointerdown',e=>{if(e.button!==0||!e.isPrimary)return;this.drag={id:e.pointerId,x:e.clientX,y:e.clientY,origin:this.panTarget,moved:false};});
  on(this.space,'pointermove',e=>{
   const d=this.drag;
   if(d&&d.id===e.pointerId){const dx=e.clientX-d.x,dy=e.clientY-d.y;if(!d.moved&&e.pointerType==='touch'&&Math.abs(dy)>Math.abs(dx)+8){this.drag=null;return;}if(Math.abs(dx)>7&&!d.moved){d.moved=true;this.space.setPointerCapture(e.pointerId);this.space.classList.add('is-dragging');}if(d.moved){this.panTarget=this.clamp(d.origin+dx);this.wake();return;}}
   if(e.pointerType==='mouse'){const r=this.space.getBoundingClientRect();this.pointer={x:Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1)),y:Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1))};this.wake();}
  });
  const release=e=>{const d=this.drag;if(!d||d.id!==e.pointerId)return;this.drag=null;this.space.classList.remove('is-dragging');if(this.space.hasPointerCapture(e.pointerId))this.space.releasePointerCapture(e.pointerId);if(d.moved)this.dragUntil=performance.now()+400;else if(e.type==='pointerup'&&e.pointerType==='touch'){const leaf=e.target.closest('.poetry-leaf');if(leaf){this.open(Number(leaf.dataset.slot));this.dragUntil=performance.now()+400;}}};
  on(this.space,'pointerup',release);on(this.space,'pointercancel',release);on(this.space,'lostpointercapture',e=>{if(e.target===this.space)release(e);});
  on(this.space,'pointerleave',()=>{this.pointer={x:0,y:0};this.wake();});on(this.space,'dragstart',e=>e.preventDefault());
  on(this.space,'keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();e.stopPropagation();this.panTarget=e.key==='Home'?0:e.key==='End'?this.width-this.worldWidth:this.clamp(this.panTarget+(e.key==='ArrowLeft'?220:-220));this.wake();});
  on(window,'blur',()=>{this.blurred=true;this.drag=null;this.space.classList.remove('is-dragging');this.pointer={x:0,y:0};this.sync();});on(window,'focus',()=>{this.blurred=false;this.sync();});
  on(document,'visibilitychange',()=>this.sync());on(this.motion,'change',()=>{this.mx=this.my=0;this.sync();});
  this.resize=new ResizeObserver(()=>this.layout());this.resize.observe(this.space);
  this.observer=new IntersectionObserver(es=>{const e=es[0];this.viewportVisible=e.isIntersecting;if(!this.viewportVisible){this.hover=null;this.focus=null;}this.visible=this.viewportVisible||this.bleedVisible;if(!this.visible)this.resetEntrance();if(e.isIntersecting&&!this.entered&&e.intersectionRatio>=.4){this.entered=true;this.entranceTime=0;}this.sync();},{threshold:[0,.05,.4]});this.observer.observe(root);
  this.bleedObserver=new IntersectionObserver(es=>{this.bleedVisible=es[0].isIntersecting;this.visible=this.bleedVisible||this.viewportVisible;if(!this.visible)this.resetEntrance();this.sync();},{rootMargin:'650px 0px'});this.bleedObserver.observe(root);
  this.modal=new MutationObserver(()=>this.sync());this.modal.observe(document.body,{attributes:true,attributeFilter:['class']});
  [...this.leaves,...this.ghosts].forEach(el=>applyPoetryPaper(el,POETRY_LEAVES[+(el.dataset.poem??el.dataset.source)]));
  this.layout();this.resetEntrance();
 }
 cancelReaderInk(){this.readerInkToken=(this.readerInkToken||0)+1;this.readerInk?.forEach(a=>a.cancel());this.readerInk=[];}
 open(i,focus=true){
  if(!this.pages.length)return;i=Math.max(0,Math.min(this.pages.length-1,i));
  const switching=!this.reader.hidden&&this.index!==i;this.cancelReaderInk();this.index=i;this.hover=null;
  const token=this.readerInkToken,p=this.pages[i],title=this.reader.querySelector('h2'),lines=this.reader.querySelector('.poetry-reader-lines'),texts=[title,lines];
  const render=()=>{title.textContent=p.title;this.reader.querySelector('.poetry-reader-landscape').innerHTML=poetryOriginalArt(p);lines.innerHTML=(p.kind==='image'?`<img class="poetry-upload-image" src="${E(p.src)}" alt="${E(p.title)}">`:'')+poetryLinesMarkup(p.body);this.reader.querySelector('.poetry-reader-author').hidden=p.kind==='image';this.reader.querySelector('.poetry-count').textContent=String(p.sourceIndex+1).padStart(2,'0')+' / '+POETRY_LEAVES.length;this.reader.querySelector('.poetry-reader-scroll').scrollTop=0;this.reader.hidden=false;this.space.inert=innerWidth<=760;this.leaves.forEach((e,j)=>e.setAttribute('aria-expanded',String(i===j)));};
  if(switching&&!this.motion.matches&&texts.every(e=>typeof e.animate==='function')){
   // Only the ink changes; keep the paper panel and controls still and usable.
   const outgoing=this.readerInk=texts.map(e=>e.animate([{opacity:1,filter:'blur(0px)'},{opacity:0,filter:'blur(3px)'}],{duration:120,easing:'ease-out',fill:'forwards'}));
   Promise.all(outgoing.map(a=>a.finished)).then(()=>{
    if(token!==this.readerInkToken||this.reader.hidden)return;
    outgoing.forEach(a=>a.cancel());render();
    const mask={maskImage:'linear-gradient(to bottom,#000 0%,#000 35%,transparent 65%,transparent 100%)',maskSize:'100% 300%',maskRepeat:'no-repeat'};
    const frames=[{opacity:0,filter:'blur(6px)',maskPosition:'0% 100%'},{offset:.45,opacity:.72,filter:'blur(1.5px)',maskPosition:'0% 20%'},{opacity:1,filter:'blur(0px)',maskPosition:'0% 0%'}].map(f=>({...mask,...f}));
    const incoming=this.readerInk=texts.map(e=>e.animate(frames,{duration:520,easing:'cubic-bezier(.2,.65,.3,1)',fill:'forwards'}));
    Promise.all(incoming.map(a=>a.finished)).then(()=>{if(token===this.readerInkToken)this.cancelReaderInk();}).catch(()=>{});
   }).catch(()=>{});
  }else render();
  if(focus)this.reader.querySelector('[data-poem-close]').focus({preventScroll:true});
 }

 nextPoem(step){const source=this.pages[this.index]?.sourceIndex;for(let k=1;k<=this.pages.length;k++){const i=(this.index+step*k+this.pages.length)%this.pages.length;if(this.pages[i].sourceIndex!==source){this.open(i,false);return;}}}
 closeReader(restoreLeaf=false){this.cancelReaderInk();this.reader.hidden=true;this.space.inert=false;this.hover=null;this.focus=null;this.leaves.forEach(e=>e.setAttribute('aria-expanded','false'));const leaf=this.leaves[this.index];(restoreLeaf&&leaf&&getComputedStyle(leaf).visibility!=='hidden'?leaf:this.space).focus({preventScroll:true});this.wake();}
 clamp(x){return Math.max(Math.min(0,this.width-this.worldWidth),Math.min(0,x));}
 layout(){
  const previous=this.nodes;
  this.width=this.space.clientWidth;this.height=this.space.clientHeight;
  const small=innerWidth<=760,span=this.width,base=Math.min(278,this.height*.25,this.width*.23),baseOrder=[1,7,14,3,2,5,9,13,4,15,6,0,8,10,11,12],order=[...baseOrder.filter(i=>i<this.pages.length),...this.pages.map((_,i)=>i).filter(i=>!baseOrder.includes(i))];
  // Screen-space composition is converted to one shared 1000px perspective volume.
  // Each page has its own depth, pitch, yaw and motion phase; no carousel slots.
  const slots=[
   [.14,.40,-80,12,-20,-8,.94],[.37,.20,-330,10,24,10,1],
   [.51,.49,105,7,-19,11,1],[.73,.40,-145,12,26,-9,1],
   [.91,.24,-410,14,-24,9,.96],[.81,.79,-250,9,22,-8,.90],
   [.97,.87,-370,-11,-23,7,.83],[-.015,.20,-880,16,-32,15,.84],
   [.045,.78,-650,22,30,-13,.82],[.32,.86,-820,-16,-26,17,.93],
   [.92,.57,-750,-22,33,13,.83],[1.26,.36,-50,10,-18,8,1],
   [1.55,.64,15,-7,18,-8,1],[1.83,.27,-220,12,-24,12,1],
   [1.91,.76,-290,-9,22,-10,.95],[1.30,.85,-400,12,-21,8,.9]];
  this.worldWidth=small?Math.ceil(this.pages.length/2)*225+65:span*Math.max(2.15,this.pages.length/14.8);
  this.nodes=order.map((i,k)=>{
   const s=slots[k%slots.length]||[.15+(k%7)*.27,.22+(k%3)*.28,-120-(k%5)*70,(k%5-2)*6,(k%4-2)*10,(k%3-1)*7,.92],w=small?Math.min(160,this.width*.40,this.height*.30):base*s[6],h=w*(poetryWarPage(this.pages[i])?3.3:this.pages[i].body.length>250?1.85:1.48),z=small?(k%3-1)*24:Math.max(-260,s[2]),projection=1000/(1000-z);
   const screenX=small?125+Math.floor(k/2)*225+(k%2?45:0):s[0]*span,screenY=small?this.height*.51+Math.sin(k*2.1)*18:s[1]*this.height;
   const x=this.width/2+(screenX-this.width/2)/projection,y=this.height/2+(screenY-this.height/2)/projection;
   const margin=Math.hypot(w,h)*1000/(1000-z-65)/2+85,cycle=this.height+margin*2,old=previous?.find(n=>n.i===i);
   return {i,chance:this.pages[i].displayChance??100,admitted:old?.admitted??true,w,h,x,y,z,screenX,screenY,projection,angle:s[3],pitch:s[5],tilt:s[4],phase:k*2.31,speed:.21+(k%4)*.04,depth:projection,margin,cycle,travel:old?old.travel/old.cycle*cycle:margin+screenY,fallSpeed:(26+k%5*2.4)*Math.sqrt(projection),age:old?.age||0,laps:old?.laps||0,motionRate:old?.motionRate??1,entryDelay:k<3?k*.9:3.5+(k-3)*.95*16/Math.max(16,this.pages.length),entryAge:old?.entryAge??(-(k<3?k*.9:3.5+(k-3)*.95*16/Math.max(16,this.pages.length))),entryDuration:7.5+(k%4)*.65,entryDone:old?.entryDone||false};
  }).sort((a,b)=>a.i-b.i);
  const oldGhosts=this.decorNodes||[];
  this.decorNodes=this.ghosts.map((e,k)=>{
   const z=-620-(k%8)*74,projection=1000/(1000-z),w=small?180:260,h=w*(poetryWarPage(POETRY_LEAVES[+e.dataset.source])?3.3:1.48),screenX=(.04+(k*.173)%1)*this.width,screenY=(.15+(k*.23)%.8)*this.height,margin=Math.hypot(w,h)*1000/(1000-z-65)/2+85,old=oldGhosts[k];
   const n={i:k,chance:POETRY_LEAVES[+e.dataset.source]?.displayChance??100,admitted:old?.admitted??true,decor:true,w,h,z,projection,screenX,screenY,x:this.width/2+(screenX-this.width/2)/projection,y:screenY,margin,cycle:this.height+margin*2,travel:old?old.travel:0,entryDelay:7+k*.85*14/Math.max(14,this.ghosts.length),entryAge:old?.entryAge??(-(7+k*.85*14/Math.max(14,this.ghosts.length))),entryDuration:9+k%3,entryDone:old?.entryDone||false,angle:k%2?19:-15,pitch:14,tilt:k%2?-29:24,phase:k*2.81,speed:.2,fallSpeed:15+k%3,age:old?.age||0,laps:old?.laps||0,motionRate:1};
   e.style.width=w+'px';e.style.height=h+'px';e.style.setProperty('--page-unit',w/248);e.style.setProperty('--paper-alpha',.35-(k%8)*.022);e.style.setProperty('--paper-blur',(2+(k%8)*.35)+'px');return n;
  });
  // One evenly spaced vertical loop prevents the old burst/empty rhythm.
  // Near and far papers are interleaved so depth also stays visually balanced.
  this.flowNodes=[...this.nodes,...this.decorNodes];
  this.configureFlow();
  this.pan=this.panTarget=this.clamp(this.panTarget);
  this.nodes.forEach(n=>{
   const e=this.leaves[n.i];e.classList.toggle('is-long',this.pages[n.i].body.length>250);e.style.width=n.w+'px';e.style.height=n.h+'px';e.style.zIndex='auto';
   e.style.setProperty('--paper-alpha',String(small?1:Math.max(.34,1+Math.min(0,n.z)/1250)));e.style.setProperty('--paper-blur',(small?0:Math.max(0,(-n.z-170)/175))+'px');
   const paper=e.querySelector('.poetry-leaf-paper'),lines=e.querySelector('.poetry-leaf-lines');
   paper.style.setProperty('--page-unit',n.w/248+'');lines.style.fontSize='13px';
   const room=paper.clientHeight-lines.offsetTop-25*(n.w/248)-(poetryOriginalArt(this.pages[n.i])?paper.clientHeight*.28:0);
   // Search the original quarter-pixel grid; choose exactly the same largest fitting size.
   const fits=()=>lines.scrollHeight<=room&&lines.scrollWidth<=lines.clientWidth+1;
   if(!fits()){let low=12,high=51,best=12;while(low<=high){const mid=(low+high)>>1;lines.style.fontSize=mid/4+'px';if(fits()){best=mid;low=mid+1;}else high=mid-1;}lines.style.fontSize=best/4+'px';}
  });
  this.draw();this.sync();
 }
 active(){return !document.body.classList.contains('site-editor-active')&&this.visible&&!this.blurred&&!document.hidden&&!document.body.classList.contains('modal-open');}
 sync(){this.space.inert=!this.reader.hidden&&innerWidth<=760;if(this.motion.matches&&this.readerInk?.length)this.open(this.index,false);if(document.body.classList.contains('site-editor-active')){this.entered=true;this.entranceTime=60;this.updateEntrance(0);this.draw();}if(this.motion.matches&&this.entered)this.updateEntrance(0);if(!this.active()){cancelAnimationFrame(this.frame);this.frame=0;this.last=0;return;}if(this.motion.matches){cancelAnimationFrame(this.frame);this.frame=0;this.pan=this.panTarget;this.draw();}else this.wake();}
 wake(){if(!this.active())return;if(this.motion.matches){this.pan=this.panTarget;this.draw();return;}if(this.frame)return;this.last=0;const tick=t=>{this.frame=0;if(!this.active())return;const dt=this.last?Math.min(40,t-this.last):16;this.last=t;this.frameStep=dt/1000;this.elapsed+=dt/1000;this.updateEntrance(dt/1000);this.advanceFall(dt/1000);this.smoothing=1-Math.exp(-dt/170);const follow=1-Math.exp(-dt/210);this.mx+=(this.pointer.x-this.mx)*follow;this.my+=(this.pointer.y-this.my)*follow;this.pan+=(this.panTarget-this.pan)*(1-Math.exp(-dt/115));this.draw();if(this.paused&&this.entranceTime>5.5&&Math.abs(this.panTarget-this.pan)<.1&&Math.abs(this.pointer.x-this.mx)<.001&&Math.abs(this.pointer.y-this.my)<.001){this.last=0;return;}this.frame=requestAnimationFrame(tick);};this.frame=requestAnimationFrame(tick);}
 resetEntrance(){
  this.cancelReaderInk();
  this.entered=false;this.entranceTime=0;this.reader.hidden=true;this.space.inert=false;this.root.dataset.entrance='waiting';this.hover=null;this.focus=null;
  (this.flowNodes||[]).forEach((n,k)=>{n.travel=this.densityGroups?n.margin+n.screenY:(this.paused?n.margin+n.screenY:0);n.entryAge=this.densityGroups?1:-n.entryDelay;n.entryDone=this.densityGroups?true:!!this.paused;n.motionRate=1;n.age=0;n.pose=null;n.admitted=this.densityGroups?!!n.scheduled:Math.random()*100<n.chance;if(!n.decor)this.leaves[n.i].setAttribute('aria-expanded','false');});
  this.draw();
 }
 updateEntrance(dt){
  if(!this.entered)return;
  this.entranceTime=this.motion.matches?20:this.entranceTime+dt;
  const t=this.entranceTime,stage=t<.35?'waiting':t<1.65?'text':t<4.8?'pages':'ready';
  if(this.root.dataset.entrance!==stage)this.root.dataset.entrance=stage;
 }
 configureFlow(){
  const small=innerWidth<=760,previousGroups=this.densityGroups;
  this.densityGroups=[{nodes:this.nodes,limit:small?5:9,decor:false},{nodes:this.decorNodes,limit:small?17:27,decor:true}];
  for(const group of this.densityGroups){
   const pool=group.nodes.filter(n=>n.chance>0),count=Math.min(group.limit,pool.length);
   group.slots=[];group.rate=1;group.clock=previousGroups?.find(g=>g.decor===group.decor)?.clock||0;
   for(const n of group.nodes){n.scheduled=false;n.admitted=false;n.pose=null;n.avoidX=0;}
   for(let k=0;k<count;k++){
    const prior=previousGroups?.find(g=>g.decor===group.decor),offset=prior?.slots.length?prior.slots[0].phase-.5/prior.slots.length:0;
    const slot={phase:((k+.5)/count+offset+1)%1,node:null,index:k};group.slots.push(slot);this.assignFlowSlot(group,slot,pool[k]);
   }
  }
  this.worldWidth=this.width*1.16;this.pan=this.panTarget=this.clamp(this.panTarget||0);
 }
 assignFlowSlot(group,slot,preferred){
  const candidates=group.nodes.filter(n=>n.chance>0&&!n.scheduled);
  if(!candidates.length)return;
  let selected=preferred;
  if(!selected){
   // Weighted fair selection changes the poem, never creates an empty slot.
   let total=0;for(const n of candidates){total+=n.chance;n.selectionCredit=(n.selectionCredit||0)+n.chance;}
   selected=candidates.reduce((a,b)=>(a.selectionCredit||0)>=(b.selectionCredit||0)?a:b);selected.selectionCredit-=total;
  }
  if(slot.node){slot.node.scheduled=false;slot.node.admitted=false;}
  slot.node=selected;selected.scheduled=true;selected.admitted=true;selected.entryDone=true;selected.entryAge=1;selected.pose=null;selected.avoidX=0;selected.flowSlot=slot;selected.driftTime=group.clock;selected.motionRate=1;
  selected.flowTop=-this.height*.5;selected.flowSpan=this.height*2;selected.cycle=selected.flowSpan;selected.fallSpeed=group.decor?22:24;
  const lanes=this.width<850?2:3;
  const random=((Math.sin((selected.i+1)*127.1+(slot.index+1)*311.7+(selected.laps||0)*73.3)*43758.5453)%1+1)%1;selected.laps=(selected.laps||0)+1;
  selected.entryStart=group.decor?slot.index*.65+random*.4:2.8+slot.index*1.15+random*.6;selected.entryLength=(group.decor?8:7.5)+random*3;
  selected.anchor=group.decor?.12+((slot.index*.61803398875)%1)*.76:Math.max(.10,Math.min(.90,.18+(slot.index%lanes)*.64/(lanes-1)+(random-.5)*.24));
  selected.screenY=selected.flowTop+slot.phase*selected.flowSpan+selected.flowSpan*.10/Math.max(1,Math.min(group.limit,group.nodes.filter(n=>n.chance>0).length))*Math.sin(group.clock*(group.decor?.7:.35)+slot.index*2.4);selected.travel=selected.margin+selected.screenY;
 }
 advanceFall(dt){
  if(!this.densityGroups||this.motion.matches||this.paused||!this.entered||this.entranceTime<1.65)return;
  for(const group of this.densityGroups){
   // Keep spacing intact when a reader holds a foreground sheet.
   const hold=!!this.drag;
   group.rate+=((hold?0:1)-group.rate)*(1-Math.exp(-dt/.45));
   group.clock+=dt*group.rate;
   for(const slot of group.slots){
    let n=slot.node;const held=!group.decor&&(this.focus===n.i||this.hover===n.i);n.motionRate+=((held?0:1)-n.motionRate)*(1-Math.exp(-dt/.25));if(held&&n.motionRate<.002)n.motionRate=0;const step=dt*group.rate*n.motionRate;slot.phase+=step*n.fallSpeed/n.flowSpan;
    if(slot.phase>=1){slot.phase-=1;this.assignFlowSlot(group,slot);n=slot.node;}
    n.age+=step;n.driftTime=(n.driftTime??group.clock)+step;const drift=n.flowSpan*.10/Math.max(1,group.slots.length)*Math.sin(n.driftTime*(group.decor?.7:.35)+slot.index*2.4);n.screenY=n.flowTop+slot.phase*n.flowSpan+drift;n.travel=n.margin+n.screenY;
   }
  }
 }
 softenSeparation(){
  if(!this.densityGroups)return;
  const nodes=this.nodes.filter(n=>n.scheduled),dt=Math.min(.04,this.frameStep||1/60),targets=new Map(nodes.map(n=>[n,0]));
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
   const a=nodes[i],b=nodes[j],ay=a.screenY,by=b.screenY;
   const ax=a.anchor*this.width+(a.avoidX||0),bx=b.anchor*this.width+(b.avoidX||0);
   const dy=Math.abs(ay-by),safeY=(a.h*a.projection+b.h*b.projection)*.55+24;
   const safeX=(a.w*a.projection+b.w*b.projection)*.6+28,dx=ax-bx;
   if(dy>=safeY||Math.abs(dx)>=safeX)continue;
   const weight=(1-dy/safeY)**2*(1-Math.abs(dx)/safeX)**2,sign=dx===0?(a.i<b.i?-1:1):Math.sign(dx),push=sign*weight*48;
   targets.set(a,targets.get(a)+push);targets.set(b,targets.get(b)-push);
  }
  for(const n of nodes){const held=this.focus===n.i||this.hover===n.i;if(held)continue;const target=this.motion.matches?0:Math.max(-32,Math.min(32,targets.get(n))),delta=(target-(n.avoidX||0))*(1-Math.exp(-dt/1.2));n.avoidX=(n.avoidX||0)+Math.max(-dt*10,Math.min(dt*10,delta));}
 }
 draw(){
  if(!this.nodes)return;const still=this.motion.matches;
  this.softenSeparation();
  this.drawWidth=this.width;
  this.flowNodes.forEach(n=>{
   const e=n.decor?this.ghosts[n.i]:this.leaves[n.i],frozen=this.paused||this.drag||(!n.decor&&this.focus===n.i)||(!n.decor&&this.hover===n.i&&n.motionRate<.002);
   if(this.densityGroups&&!n.scheduled){if(e.style.visibility!=='hidden')e.style.visibility='hidden';n.drawVisibility='hidden';if(!n.decor)e.tabIndex=-1;return;}
   if(still||!frozen||!n.pose){
    const t=n.age*.42+n.phase;
    const target={x:still?0:(Math.sin(t)*49+Math.sin(t*.47)*21-this.mx*33)/n.projection,y:still?0:Math.sin(t*.72)*7,z:n.z+(still?0:Math.sin(t*.63)*60),angle:n.angle+(still?0:Math.sin(t)*21),pitch:n.pitch+(still?0:Math.cos(t*.83)*16+this.my*3),yaw:n.tilt+(still?0:Math.sin(t*.64)*23-this.mx*4)};
    if(!n.pose||still)n.pose=target;else for(const key of Object.keys(target))n.pose[key]+=(target[key]-n.pose[key])*(this.smoothing||.1)*(!n.decor&&this.hover===n.i?n.motionRate:1);
   }
   const liveProjection=1000/(1000-n.pose.z),screenY=still?n.screenY:n.travel-n.margin;
   const entryProgress=still?1:Math.max(0,Math.min(1,(this.entranceTime-1.65-(n.entryStart||0))/(n.entryLength||8))),entryShift=(1-entryProgress*entryProgress*(3-2*entryProgress))*(Math.max(0,screenY)+n.margin+40);
   const anchored=!!this.densityGroups;
   const pad=Math.min(this.drawWidth*.32,n.w*liveProjection*.65+18),baseX=anchored?Math.max(pad,Math.min(this.drawWidth-pad,n.anchor*this.drawWidth+this.pan+(n.avoidX||0)+(still?0:Math.sin(n.age*.3+n.phase)*12))):null;
   const x=anchored?this.width/2+(baseX-this.width/2)/liveProjection:n.x+this.pan/n.projection+n.pose.x;const y=this.height/2+(screenY-entryShift-this.height/2)/liveProjection+n.pose.y;
   // Keep simulation continuous; cull only DOM output beyond a conservative
   // projected sphere, including the 650px cross-section bleed and blur padding.
   const radius=Math.hypot(n.w,n.h)/2,denom=1000-n.pose.z-radius;
   const cx=this.width/2+(x-this.width/2)*liveProjection,cy=this.height/2+(y-this.height/2)*liveProjection;
   const rx=denom>0?radius*(1000+Math.abs(cx-this.width/2))/denom+64:Infinity;
   const ry=denom>0?radius*(1000+Math.abs(cy-this.height/2))/denom+64:Infinity;
   const outside=cx+rx<0||cx-rx>(this.root?.clientWidth||this.width)||cy+ry<-(this.bleed??650)||cy-ry>this.height+(this.bleed??650);
   const visible=n.admitted&&this.entered&&this.entranceTime>=1.65&&(still||n.entryAge>=0)&&!outside;
   const visibility=visible?'visible':'hidden';if(n.drawVisibility!==visibility){e.style.visibility=visibility;n.drawVisibility=visibility;}
   if(!visible){if(!n.decor&&e.tabIndex!==-1)e.tabIndex=-1;return;}
   e.style.transform=`translate3d(${(x-n.w/2).toFixed(2)}px,${(y-n.h/2).toFixed(2)}px,${n.pose.z.toFixed(2)}px) rotateZ(${n.pose.angle.toFixed(2)}deg) rotateY(${n.pose.yaw.toFixed(2)}deg) rotateX(${n.pose.pitch.toFixed(2)}deg)`;
   const fade=still?1:Math.min(1,entryProgress*2);if(n.drawFade!==fade){e.style.opacity='calc(var(--paper-alpha) * '+fade+')';n.drawFade=fade;}
   const sx=anchored?baseX:n.screenX+this.pan,extent=radius*liveProjection;
   if(!n.decor){const viewWidth=this.reader&&!this.reader.hidden?this.width:this.root?.clientWidth||this.width,tabIndex=n.admitted&&(this.motion.matches||this.entranceTime>=1.65)&&sx+extent>0&&sx-extent<viewWidth&&screenY+extent>0&&screenY-extent<this.height?0:-1;if(e.tabIndex!==tabIndex)e.tabIndex=tabIndex;}
  });
 }
 destroy(){this.cancelReaderInk();this.assetCleanup?.();cancelAnimationFrame(this.frame);this.resize.disconnect();this.observer.disconnect();this.bleedObserver.disconnect();this.modal.disconnect();this.cleanups.forEach(off=>off());delete this.root.poetryGarden;}
}





