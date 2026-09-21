/* V38: ink-paper sheets. Original manuscripts remain authoritative. */
const POETRY_LEAVES=[{"title":"如果说战争是一次盛大的葬礼","body":"…\n如果说战争是一次盛大的葬礼，\n那地球便是我们的坟地。\n扭曲的飞机与坦克要来做棺材、\n生锈的枪械与弹壳当陪葬淹没残骸。\n曾经绽放的血肉鲜花洒满遗体，\n弥漫硝烟为漫天香华祝我安息。\n遗照中支离破碎的头骨挂在刺刀，\n弯曲的下颌骨一半在微笑。\n怒吼与哀嚎，咒骂和尖叫。\n演奏着交响安眠曲三天三夜，\n也阻挡不了眼球们上天入地的逃跑。\n我们与敌人交织着，再不分彼此，\n带着我们那未完的\n亲情、\n爱情、\n友情，\n一同沉入沙漠、沼泽、丛林与海底。\n与此相关的所有人都恸哭着，\n她们被强迫见证我们的葬礼，\n无论身处何地，\n都共享着那被我们诅咒的\n亲情、\n爱情\n与友情，\n继续活下去。\n愿战争消逝，\n世界和平，再无泪水。\n愿曾经的战士们，安睡。\n…"},{"title":"雪旅","body":"圣白山天共，点黑岩铁时。\n夏风尤做冷，狂水脸霜直。\n厚衣僵无有，天地渺渺痴。\n万籁此颓寂，唯风闯心失。"},{"title":"夕阳红","body":"夕阳红，夕阳红，\n红卷天云如相融。\n不见远海当年绿，\n但见怒云夕阳红。"},{"title":"死花","body":"花败宛若生，气盛独枝死。\n孤立丛冬中，不惧黑寒洗。\n生隐归众花，死坚脱俗气。\n虽枯神亦胜，吾辈应如此。"},{"title":"诗稿 05","body":"千万藏书一寸金，不如与朋片刻阴。\n共逐黄土年与日，方知广厦页中辛！"},{"title":"燕","body":"一\n燕过飞无痕，君死无人问。\n黄沙埋白骨，颗颗是英魂。\n\n二\n燕过飞无痕，心事何处恨。\n叶雨秋色里，杯茶且消闲。"},{"title":"手","body":"嫩白温玉五指分，双指并捻削葱根。\n似是露水冻晶化，又疑云映日光辉。\n腕口轻弯欲折断，细龙青盘指缝间。\n通体雪凝浑然成，恰是工匠雕玉能。\n（吉良吉影也赞叹，杀皇已发动炸弹！）"},{"title":"李诗仙","body":"世人皆赞李诗仙，无人知李书两千。\n百杯夜叹应有识，梁梦到头孤坟眠！"},{"title":"脸盲","body":"我时常认不对别人的脸，\n所以大家都说我是脸盲。\n久而久之，连我也说：“我是脸盲。”\n有时，我会想，我真的是脸盲吗？\n明明有的人脸，基本一样。\n一样的小眼睛、坏脾气、乱头发、不正经，\n容貌像的性格也像。\n可我不知道，因为我是脸盲\n“脸盲，你是脸盲。”大家齐声附和，\n情绪高涨。\n我看着他们的脸开始重合，逐渐变成一个模样。\n于是我也笑起来，说：“脸盲，我是脸盲。”"},{"title":"诗稿 10","body":"云阶步步清，灰海寂寂平。\n舟漪望而叹，日月任渔行。"},{"title":"皇","body":"粉身玉肌润汤香，万人千女入泉痒。\n媚面流转魂无定，醉卧肉山不胜场。\n佳人一笑媚百回，声声催我梦离肠。\n太监奴婢卑等令，文武臣官怒而慌。\n尘民冷冬亲相食，寡人温春龙袍敞。\n谁怜万物悲万涸？今身一回疯一莽！"},{"title":"暴雨","body":"风摧柳叶舞续雨，黑云为伴演天地。\n远雷密，不见阳红绝人迹。\n孤灯微续茶屋里，竹湖亭默如黑狱。\n风雷起，只鸟惊寻乱飞去。"},{"title":"二二年七月二十日戌时散步邓庄南路有感","body":"绵山思遮千丈天，淡云愁坠万里连。\n青夜直残夕边树，黑遍，影压百家灯自怜…\n我散郊阔油柏路，仍笑天仙不知数，醉允日月共天幕。\n琼浆玉液，半倾染碧处；红光娇现，却隐如袖辉不复。\n可怜！不如高歌乐漫步。"},{"title":"赠博宇","body":"天有羽鸟，衔冀之迁。\n海生月明，耀枝而联。\n尘爪终收，地芽将见。\n微巢永筑，琴瑟不眠。"},{"title":"冥想","body":"行看山与水，坐观心互忘。\n山水无穷里，思绪万千样。\n平静听万物，山水虽激荡。\n自在世界里，红尘再无望。"},{"title":"晚饭路上有感","body":"寒打枫叶黄遍地，卷秋携冬霜。\n小雨随拍伞面上，郁郁路渺茫。\n肤已凉，人彷徨，暮至何处寻曙光？\n豺狼暗权日不落，布衣只求身安当。"}];
function poetryLinesMarkup(body){return body.split('\n').map(line=>`<span class="${/^[\u3400-\u9fff]{7}[，、。！？；][\u3400-\u9fff]{7}[，、。！？；]$/.test(line)?'poetry-verse-nowrap':''}">${E(line)||'&nbsp;'}</span>`).join('');}
function poetryGardenMarkup(){
 return `<div class="poetry-garden" data-poetry-garden data-entrance="waiting"><header class="poetry-intro"><span>04 / POETRY</span><h1>“诗”志不渝</h1><p>${E(D.sections.poetry.paragraphs[2])}</p><p>${E(D.sections.poetry.paragraphs[1])}</p></header>
 <div class="poetry-space" tabindex="0" role="region" aria-label="自由悬浮诗页，左右拖动或方向键探索，点击完整阅读">
 <div class="poetry-world"><svg class="poetry-thread" viewBox="0 0 1400 800" preserveAspectRatio="none" aria-hidden="true"><path d="M-40 240 C140 -70 180 530 410 440 S570 35 800 250 S850 860 1430 680"/></svg>
 ${POETRY_LEAVES.map((p,i)=>`<button class="poetry-leaf" data-poem="${i}" data-index="${i}" aria-label="阅读：${E(p.title)}" aria-controls="poetry-reader" aria-expanded="false"><span class="poetry-leaf-paper"><span class="poetry-leaf-number">${String(i+1).padStart(2,'0')}</span><strong>${E(p.title)}</strong><span class="poetry-rule"></span><span class="poetry-leaf-lines">${poetryLinesMarkup(p.body)}</span><span class="poetry-signature">花草情裳</span></span></button>`).join('')}
 ${Array.from({length:14},(_,i)=>{const p=POETRY_LEAVES[(i*5+1)%POETRY_LEAVES.length];return `<span class="poetry-leaf poetry-ghost" aria-hidden="true" data-ghost="${i}"><span class="poetry-leaf-paper"><strong>${E(p.title)}</strong><span class="poetry-rule"></span><span class="poetry-leaf-lines">${poetryLinesMarkup(p.body.split('\n').filter(Boolean).slice(0,6).join('\n'))}</span></span></span>`;}).join('')}
 </div></div>
 <aside class="poetry-reader" id="poetry-reader" aria-label="诗稿阅读面板" hidden><div class="poetry-reader-top"><span class="poetry-count"></span><div><button data-poem-prev aria-label="上一篇">‹</button><button data-poem-next aria-label="下一篇">›</button><button data-poem-close aria-label="关闭阅读面板">×</button></div></div><div class="poetry-reader-scroll" tabindex="0"><h2></h2><div class="poetry-reader-lines"></div><p class="poetry-reader-author">— 花草情裳 —</p><button class="poetry-original">查看原稿 ↗</button><div class="poetry-reader-landscape" aria-hidden="true"></div></div></aside>
 <div class="poetry-browse"><span>16 / 页诗稿</span><p>诗页缓落，轻移鼠标穿行其间</p><button class="poetry-fall-toggle" aria-pressed="false">暂停飘落</button></div><a class="poetry-wall-link" href="#/wall/poetry">查看完整诗稿墙 ↗</a></div>`;
}
class PoetryGarden{
 constructor(root){
  this.root=root;root.poetryGarden=this;this.space=root.querySelector('.poetry-space');this.leaves=[...root.querySelectorAll('[data-poem]')];this.ghosts=[...root.querySelectorAll('.poetry-ghost')];this.bleed=650;this.reader=root.querySelector('.poetry-reader');this.cleanups=[];this.motion=matchMedia('(prefers-reduced-motion: reduce)');this.visible=false;this.frame=0;this.elapsed=0;this.pan=0;this.panTarget=0;this.mx=this.my=0;this.pointer={x:0,y:0};this.hover=null;this.focus=null;this.entranceTime=0;this.entered=false;this.readerRevealed=false;
  const on=(el,type,fn,opts)=>{el.addEventListener(type,fn,opts);this.cleanups.push(()=>el.removeEventListener(type,fn,opts));};
  on(root.querySelector('[data-poem-prev]'),'click',()=>this.open((this.index+15)%16,false));
  on(root.querySelector('[data-poem-next]'),'click',()=>this.open((this.index+1)%16,false));
  on(root.querySelector('[data-poem-close]'),'click',()=>this.closeReader());
  on(root.querySelector('.poetry-original'),'click',e=>{e.currentTarget.dataset.gallery='poetry';openGallery(D.sections.poetry.gallery,this.index,e.currentTarget);});
  on(root,'keydown',e=>{if(e.key==='Escape'&&!this.reader.hidden&&!document.body.classList.contains('modal-open')){e.preventDefault();e.stopPropagation();this.closeReader();}});
  on(root.querySelector('.poetry-fall-toggle'),'click',e=>{this.paused=!this.paused;e.currentTarget.setAttribute('aria-pressed',String(this.paused));e.currentTarget.textContent=this.paused?'继续飘落':'暂停飘落';this.sync();});
  this.leaves.forEach((leaf,i)=>{
   on(leaf,'click',()=>{if(performance.now()>=(this.dragUntil||0))this.open(i);});
   on(leaf,'pointerenter',e=>{if(e.pointerType==='mouse')this.hover=i;});
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
  const release=e=>{const d=this.drag;if(!d||d.id!==e.pointerId)return;this.drag=null;this.space.classList.remove('is-dragging');if(this.space.hasPointerCapture(e.pointerId))this.space.releasePointerCapture(e.pointerId);if(d.moved)this.dragUntil=performance.now()+400;else if(e.type==='pointerup'&&e.pointerType==='touch'){const leaf=e.target.closest('.poetry-leaf');if(leaf){this.open(Number(leaf.dataset.poem));this.dragUntil=performance.now()+400;}}};
  on(this.space,'pointerup',release);on(this.space,'pointercancel',release);on(this.space,'lostpointercapture',e=>{if(e.target===this.space)release(e);});
  on(this.space,'pointerleave',()=>{this.pointer={x:0,y:0};this.wake();});on(this.space,'dragstart',e=>e.preventDefault());
  on(this.space,'keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();e.stopPropagation();this.panTarget=e.key==='Home'?0:e.key==='End'?this.width-this.worldWidth:this.clamp(this.panTarget+(e.key==='ArrowLeft'?220:-220));this.wake();});
  on(window,'blur',()=>{this.blurred=true;this.drag=null;this.space.classList.remove('is-dragging');this.pointer={x:0,y:0};this.sync();});on(window,'focus',()=>{this.blurred=false;this.sync();});
  on(document,'visibilitychange',()=>this.sync());on(this.motion,'change',()=>{this.mx=this.my=0;this.sync();});
  this.resize=new ResizeObserver(()=>this.layout());this.resize.observe(this.space);
  this.observer=new IntersectionObserver(es=>{const e=es[0];this.viewportVisible=e.isIntersecting;if(!this.viewportVisible){this.hover=null;this.focus=null;}this.visible=this.viewportVisible||this.bleedVisible;if(!this.visible)this.resetEntrance();if(e.isIntersecting&&!this.entered&&e.intersectionRatio>=.4){this.entered=true;this.entranceTime=0;}this.sync();},{threshold:[0,.05,.4]});this.observer.observe(root);
  this.bleedObserver=new IntersectionObserver(es=>{this.bleedVisible=es[0].isIntersecting;this.visible=this.bleedVisible||this.viewportVisible;if(!this.visible)this.resetEntrance();this.sync();},{rootMargin:'650px 0px'});this.bleedObserver.observe(root);
  this.modal=new MutationObserver(()=>this.sync());this.modal.observe(document.body,{attributes:true,attributeFilter:['class']});
  this.layout();this.resetEntrance();
 }
 open(i,focus=true){this.readerRevealed=true;this.index=i;const p=POETRY_LEAVES[i];this.reader.querySelector('h2').textContent=p.title;this.reader.querySelector('.poetry-reader-lines').innerHTML=poetryLinesMarkup(p.body);this.reader.querySelector('.poetry-count').textContent=String(i+1).padStart(2,'0')+' / 16';this.reader.querySelector('.poetry-reader-scroll').scrollTop=0;this.reader.hidden=false;this.leaves.forEach((e,j)=>e.setAttribute('aria-expanded',String(i===j)));if(focus)this.reader.querySelector('[data-poem-close]').focus({preventScroll:true});}
 closeReader(){this.reader.hidden=true;this.leaves[this.index].setAttribute('aria-expanded','false');this.leaves[this.index].focus({preventScroll:true});}
 clamp(x){return Math.max(Math.min(0,this.width-this.worldWidth),Math.min(0,x));}
 layout(){
  const previous=this.nodes;
  this.width=this.space.clientWidth;this.height=this.space.clientHeight;
  const small=innerWidth<=760,span=this.width,base=Math.min(278,this.height*.39),order=[1,7,14,3,2,5,9,13,4,15,6,0,8,10,11,12];
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
  this.worldWidth=small?16*225+65:span*2.15;
  this.nodes=order.map((i,k)=>{
   const s=slots[k],w=small?Math.min(180,this.width*.48):base*s[6],h=w*(POETRY_LEAVES[i].body.length>250?1.85:1.48),z=small?(k%3-1)*24:Math.max(-260,s[2]),projection=1000/(1000-z);
   const screenX=small?125+k*225:s[0]*span,screenY=small?this.height*.51+Math.sin(k*2.1)*18:s[1]*this.height;
   const x=this.width/2+(screenX-this.width/2)/projection,y=this.height/2+(screenY-this.height/2)/projection;
   const margin=Math.hypot(w,h)*1000/(1000-z-65)/2+85,cycle=this.height+margin*2,old=previous?.find(n=>n.i===i);
   return {i,w,h,x,y,z,screenX,screenY,projection,angle:s[3],pitch:s[5],tilt:s[4],phase:k*2.31,speed:.21+(k%4)*.04,depth:projection,margin,cycle,travel:old?old.travel/old.cycle*cycle:margin+screenY,fallSpeed:(26+k%5*2.4)*Math.sqrt(projection),age:old?.age||0,laps:old?.laps||0,motionRate:old?.motionRate??1,entryDelay:k<3?k*.9:3.5+(k-3)*.95,entryAge:old?.entryAge??(-(k<3?k*.9:3.5+(k-3)*.95)),entryDuration:7.5+(k%4)*.65,entryDone:old?.entryDone||false};
  }).sort((a,b)=>a.i-b.i);
  const oldGhosts=this.decorNodes||[];
  this.decorNodes=this.ghosts.map((e,k)=>{
   const z=-620-(k%8)*74,projection=1000/(1000-z),w=small?180:260,h=w*1.48,screenX=(.04+(k*.173)%1)*this.width,screenY=(.15+(k*.23)%.8)*this.height,margin=Math.hypot(w,h)*1000/(1000-z-65)/2+85,old=oldGhosts[k];
   const n={i:k,decor:true,w,h,z,projection,screenX,screenY,x:this.width/2+(screenX-this.width/2)/projection,y:screenY,margin,cycle:this.height+margin*2,travel:old?old.travel:0,entryDelay:8+k*.85,entryAge:old?.entryAge??(-8-k*.85),entryDuration:9+k%3,entryDone:old?.entryDone||false,angle:k%2?19:-15,pitch:14,tilt:k%2?-29:24,phase:k*2.81,speed:.2,fallSpeed:15+k%3,age:old?.age||0,laps:old?.laps||0,motionRate:1};
   e.style.width=w+'px';e.style.height=h+'px';e.style.setProperty('--page-unit',w/248);e.style.setProperty('--paper-alpha',.35-(k%8)*.022);e.style.setProperty('--paper-blur',(2+(k%8)*.35)+'px');return n;
  });
  const intro=this.root.querySelector(".poetry-intro");this.copyZone=small?null:{left:intro.offsetLeft,right:intro.offsetLeft+intro.offsetWidth,cy:(this.root.clientHeight/2)-this.space.offsetTop,half:intro.offsetHeight/2};
  this.pan=this.panTarget=this.clamp(this.panTarget);
  this.nodes.forEach(n=>{
   const e=this.leaves[n.i];e.classList.toggle('is-long',POETRY_LEAVES[n.i].body.length>250);e.style.width=n.w+'px';e.style.height=n.h+'px';e.style.zIndex='auto';
   e.style.setProperty('--paper-alpha',String(small?1:Math.max(.34,1+Math.min(0,n.z)/1250)));e.style.setProperty('--paper-blur',(small?0:Math.max(0,(-n.z-170)/175))+'px');
   const paper=e.querySelector('.poetry-leaf-paper'),lines=e.querySelector('.poetry-leaf-lines');
   paper.style.setProperty('--page-unit',n.w/248+'');lines.style.fontSize='13px';
   const room=paper.clientHeight-lines.offsetTop-25*(n.w/248);
   let font=13;while((lines.scrollHeight>room||lines.scrollWidth>lines.clientWidth+1)&&font>3){font-=.25;lines.style.fontSize=font+'px';}
  });
  this.draw();this.sync();
 }
 active(){return this.visible&&!this.blurred&&!document.hidden&&!document.body.classList.contains('modal-open');}
 sync(){if(this.motion.matches&&this.entered)this.updateEntrance(0);if(!this.active()){cancelAnimationFrame(this.frame);this.frame=0;this.last=0;return;}if(this.motion.matches){cancelAnimationFrame(this.frame);this.frame=0;this.pan=this.panTarget;this.draw();}else this.wake();}
 wake(){if(!this.active())return;if(this.motion.matches){this.pan=this.panTarget;this.draw();return;}if(this.frame)return;this.last=0;const tick=t=>{this.frame=0;if(!this.active())return;const dt=this.last?Math.min(40,t-this.last):16;this.last=t;this.frameStep=dt/1000;this.elapsed+=dt/1000;this.updateEntrance(dt/1000);this.advanceFall(dt/1000);this.smoothing=1-Math.exp(-dt/170);const follow=1-Math.exp(-dt/210);this.mx+=(this.pointer.x-this.mx)*follow;this.my+=(this.pointer.y-this.my)*follow;this.pan+=(this.panTarget-this.pan)*(1-Math.exp(-dt/115));this.draw();if(this.paused&&this.entranceTime>5.5&&Math.abs(this.panTarget-this.pan)<.1&&Math.abs(this.pointer.x-this.mx)<.001&&Math.abs(this.pointer.y-this.my)<.001){this.last=0;return;}this.frame=requestAnimationFrame(tick);};this.frame=requestAnimationFrame(tick);}
 resetEntrance(){
  this.entered=false;this.entranceTime=0;this.readerRevealed=false;this.reader.hidden=true;this.root.dataset.entrance='waiting';this.hover=null;this.focus=null;
  [...(this.nodes||[]),...(this.decorNodes||[])].forEach((n,k)=>{n.travel=this.paused?n.margin+n.screenY:0;n.entryAge=-n.entryDelay;n.entryDone=!!this.paused;n.motionRate=1;n.age=0;n.pose=null;n.copyOffset=0;n.copySide=null;if(!n.decor)this.leaves[n.i].setAttribute('aria-expanded','false');});
  this.draw();
 }
 updateEntrance(dt){
  if(!this.entered)return;
  this.entranceTime=this.motion.matches?20:this.entranceTime+dt;
  const t=this.entranceTime,stage=t<.35?'waiting':t<1.65?'text':t<4.8?'pages':'ready';
  if(this.root.dataset.entrance!==stage)this.root.dataset.entrance=stage;
  if(stage==='ready'&&!this.readerRevealed){this.readerRevealed=true;if(innerWidth>760)this.open(this.index??14,false);}
 }
 advanceFall(dt){
  if(this.motion.matches||this.paused||!this.entered||this.entranceTime<1.65)return;
  const all=[...(this.nodes||[]),...(this.decorNodes||[])];
  const eligible=all.filter(n=>n.screenX+this.pan>=-80&&n.screenX+this.pan<=this.width+80);
  const onstage=eligible.filter(n=>n.entryAge>=0&&n.travel-n.margin>=0&&n.travel-n.margin<=this.height).length;
  // Replenish sparsely populated space only while a page is fully beyond the visible edges.
  const refill=Math.max(1,Math.min(16,(Math.round(eligible.length*.65)-onstage+2)*2));
  for(const n of all){
   const held=(!n.decor&&this.focus===n.i)||!!this.drag,hovering=!n.decor&&this.hover===n.i;
   n.motionRate+=((hovering?0:1)-n.motionRate)*(1-Math.exp(-dt/(hovering?.22:.36)));
   if(held)continue;
   const step=dt*n.motionRate;n.age+=step;
   if(!n.entryDone){
    n.entryAge+=step;
    if(n.entryAge<0)continue;
    const p=Math.min(1,n.entryAge/n.entryDuration),end=n.margin+n.screenY;
    // Hermite arrival ends at the normal falling velocity, without stopping or reversing.
    const m0=end*1.25,m1=n.fallSpeed*n.entryDuration;
    n.travel=(-2*p*p*p+3*p*p)*end+(p*p*p-2*p*p+p)*m0+(p*p*p-p*p)*m1;
    if(p===1)n.entryDone=true;
   }else {const screen=n.travel-n.margin;const off=Math.max(0,-screen-n.margin,screen-this.height-n.margin);const ramp=Math.min(1,off/220);n.travel+=n.fallSpeed*(1+.12*Math.sin(n.age*.43+n.phase))*(1+refill*ramp*ramp*(3-2*ramp))*step;}
   if(n.travel>=n.cycle+this.bleed){n.travel=-this.bleed;n.laps++;n.pose=null;}
  }
 }
 draw(){
  if(!this.nodes)return;const still=this.motion.matches;
  [...this.nodes,...this.decorNodes].forEach(n=>{
   const e=n.decor?this.ghosts[n.i]:this.leaves[n.i],frozen=this.paused||this.drag||(!n.decor&&this.focus===n.i)||(!n.decor&&this.hover===n.i&&n.motionRate<.002);
   if(still||!frozen||!n.pose){
    const t=n.age*.42+n.phase;
    const target={x:still?0:(Math.sin(t)*49+Math.sin(t*.47)*21-this.mx*33)/n.projection,y:still?0:Math.sin(t*.72)*7,z:n.z+(still?0:Math.sin(t*.63)*60),angle:n.angle+(still?0:Math.sin(t)*21),pitch:n.pitch+(still?0:Math.cos(t*.83)*16+this.my*3),yaw:n.tilt+(still?0:Math.sin(t*.64)*23-this.mx*4)};
    if(!n.pose||still)n.pose=target;else for(const key of Object.keys(target))n.pose[key]+=(target[key]-n.pose[key])*(this.smoothing||.1)*(!n.decor&&this.hover===n.i?n.motionRate:1);
   }
   e.style.visibility=!this.entered||this.entranceTime<1.65||(!still&&n.entryAge<0)?'hidden':'visible';
   const liveProjection=1000/(1000-n.pose.z),screenY=still?n.screenY:n.travel-n.margin;
   let x=n.x+this.pan/n.projection+n.pose.x;const y=this.height/2+(screenY-this.height/2)/liveProjection+n.pose.y;
   let avoidance=0;
   if(this.copyZone){
    const q=this.copyZone,extent=Math.hypot(n.w,n.h)*liveProjection/2+24,projectedX=this.width/2+(x-this.width/2)*liveProjection,mid=(q.left+q.right)/2;
    const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
    const vertical=smooth((q.half+extent+180-Math.abs(screenY-q.cy))/180);
    // Pick one side for the whole pass; crossing a horizontal threshold must not flip it.
    if(n.copySide==null||vertical===0)n.copySide=projectedX<mid?-1:1;
    const horizontal=smooth(((q.right-q.left)/2+extent+160-Math.abs(projectedX-mid))/160);
    const distance=n.copySide<0?Math.min(0,q.left-extent-projectedX):Math.max(0,q.right+extent-projectedX);
    avoidance=distance*vertical*horizontal;
   }
   if(still)n.copyOffset=avoidance;
   else if(!frozen){const dt=this.frameStep||1/60,rate=!n.decor&&this.hover===n.i?n.motionRate:1,delta=(avoidance-(n.copyOffset||0))*(1-Math.exp(-dt/.55));n.copyOffset=(n.copyOffset||0)+Math.max(-95*dt,Math.min(95*dt,delta))*rate;}
   x+=(n.copyOffset||0)/liveProjection;
   e.style.transform=`translate3d(${(x-n.w/2).toFixed(2)}px,${(y-n.h/2).toFixed(2)}px,${n.pose.z.toFixed(2)}px) rotateZ(${n.pose.angle.toFixed(2)}deg) rotateY(${n.pose.yaw.toFixed(2)}deg) rotateX(${n.pose.pitch.toFixed(2)}deg)`;
   const sx=n.screenX+this.pan,extent=Math.hypot(n.w,n.h)*liveProjection/2;
   if(!n.decor)e.tabIndex=(this.motion.matches||this.entranceTime>=1.65)&&sx+extent>0&&sx-extent<this.width&&screenY+extent>0&&screenY-extent<this.height?0:-1;
  });
 }
 destroy(){cancelAnimationFrame(this.frame);this.resize.disconnect();this.observer.disconnect();this.bleedObserver.disconnect();this.modal.disconnect();this.cleanups.forEach(off=>off());delete this.root.poetryGarden;}
}





