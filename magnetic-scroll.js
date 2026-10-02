/* Only content ranges can rest; empty gradient bridges are crossed as snaps. */
class MagneticPageController extends LongPageController {
 constructor(){
  super();this.pressure=0;this.direction=0;this.cooldown=0;
  this.listen(window,'resize',()=>{if(this.departureMuseum)this.cancel(true);});
  this.listen(this.reduced,'change',()=>{if(this.reduced.matches&&this.departureMuseum){const next=this.bands().find(b=>b.id==='photography');this.jump(next.min,next.id);}});
  this.listen(window,'scroll',()=>{clearTimeout(this.settleTimer);this.settleTimer=setTimeout(()=>this.settle(),190);},{passive:true});
  this.listen(window,'touchstart',e=>{if(e.touches.length===1)this.touch={x:e.touches[0].clientX,y:e.touches[0].clientY,origin:e.target};},{passive:true});
  this.listen(window,'touchmove',e=>{if(!this.touch||e.touches.length!==1||this.excluded(this.touch.origin))return;const t=e.touches[0],dy=this.touch.y-t.clientY,dx=this.touch.x-t.clientX;this.touch.x=t.clientX;this.touch.y=t.clientY;if(Math.abs(dx)>Math.abs(dy))return;e.preventDefault();this.input(dy,true);},{passive:false});
  this.listen(window,'touchend',()=>{this.touch=null;this.scheduleRelease();},{passive:true});
  this.listen(window,'keydown',e=>{if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||this.excluded(e.target)||e.target.closest('button,a,.museum-viewport'))return;const map={ArrowDown:55,ArrowUp:-55,PageDown:innerHeight*.85,PageUp:-innerHeight*.85,' ':innerHeight*.85};if(e.key==='Home'||e.key==='End'){e.preventDefault();const bands=this.bands(),last=e.key==='End';this.jump(last?bands.at(-1).max:0,last?bands.at(-1).id:'home',650);return;}if(map[e.key]){e.preventDefault();this.input(map[e.key]*(e.shiftKey?-1:1));}});
  this.themeObserver=new MutationObserver(()=>this.bridges());this.themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});this.bridges();
 }
 // Save geometry before a resize changes all viewport-relative section/bridge heights.
 paint(){
  const previous=this.readingSnapshot;
  if(previous&&(previous.width!==innerWidth||previous.height!==innerHeight)&&!this.resizeAnchor)this.resize();
  const bands=this.bands();
  if(this.resizeAnchor){
   const anchor=this.resizeAnchor,band=bands.find(b=>b.id===anchor.id);this.resizeAnchor=null;
   if(band){
    const y=band.min+(band.max-band.min)*anchor.progress;
    scrollTo(0,y);this.target=scrollY;
    if(this.current!==band.id)this.activate(band.id,true);
    if(anchor.arrive){this.sceneEvent('prepare',band.id);this.sceneEvent('arrive',band.id);}
   }
  }
  this.readingSnapshot={width:innerWidth,height:innerHeight,bands,y:scrollY};
  super.paint();
 }
 resize(){
  const previous=this.readingSnapshot;
  if(!previous){super.resize();return;}
  if(!this.resizeAnchor){
   // A resize interrupts an old-coordinate transition; finish at its intended destination.
   const destination=this.pendingScene,position=destination?this.target:previous.y;
   let band=destination&&previous.bands.find(b=>b.id===destination);
   if(!band)band=previous.bands.reduce((best,b)=>Math.max(b.min-position,position-b.max,0)<Math.max(best.min-position,position-best.max,0)?b:best);
   const span=band.max-band.min;
   this.resizeAnchor={id:band.id,progress:span>0?Math.max(0,Math.min(1,(position-band.min)/span)):0,arrive:!!destination};
   this.cancel(true);this.resetPressure();this.touch=null;
   clearTimeout(this.settleTimer);clearTimeout(this.pressureTimer);
  }
  this.request();
 }
 bridges(){
  this.sections.forEach(section=>{
   if(section.dataset.section==='pantheon'&&!section.dataset.editorBackground){section.style.removeProperty('background-image');section.style.removeProperty('background-size');const s=getComputedStyle(section),image=s.backgroundImage,color=s.backgroundColor,size=s.backgroundSize;section.style.backgroundSize='100% 100%,'+size;section.style.backgroundImage=`linear-gradient(${color},transparent 14%,transparent 86%,${color}),${image}`;}
  });
  document.querySelectorAll('.section-bridge[data-from]').forEach(el=>{
   const from=document.querySelector('#section-'+el.dataset.from),to=document.querySelector('#section-'+el.dataset.to),a=getComputedStyle(from),b=getComputedStyle(to);
   el.style.setProperty('--bridge-from',el.dataset.from==='home'&&!from.dataset.editorBackground?'#20170f':a.getPropertyValue('--bridge-bottom').trim()||a.backgroundColor);
   el.style.setProperty('--bridge-to',b.getPropertyValue('--bridge-top').trim()||b.backgroundColor);
  });
 }
 bands(){return this.sections.map(el=>{const id=el.dataset.section,r=el.getBoundingClientRect(),top=r.top+scrollY;const min=Math.max(0,top-(id==='about'?innerHeight*.22:0));return {el,id,min,max:Math.max(min,top+r.height-innerHeight)};});}
 excluded(el){return document.querySelector('dialog[open]')||document.body.classList.contains('menu-open')||el?.closest('#site-editor-ui,input,textarea,select,[contenteditable],.poetry-pages,.article-toc,.library-index,.medal-orbit,.chestnut-core-handle');}
 cancel(force=false,preserveDeparture=false){if(this.transitioning&&!force)return;if(this.pendingScene){this.sceneEvent('cancel',this.pendingScene);this.pendingScene=null;}this.departureToken=(this.departureToken||0)+1;const museum=this.departureMuseum||document.querySelector('[data-museum-wall]')?.museumWall;if(!preserveDeparture&&museum?.stage.dataset.departure){museum.clearDeparture();museum.finishEntrance();}this.departureMuseum=null;super.cancel();this.transitioning=false;}
 resetPressure(){this.pressure=0;this.direction=0;this.sections.forEach(s=>s.style.removeProperty('--magnet-pull'));}
 scheduleRelease(){clearTimeout(this.pressureTimer);this.pressureTimer=setTimeout(()=>this.resetPressure(),260);}
 wheel(e){if(e.ctrlKey||e.metaKey||this.excluded(e.target)||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;for(let el=e.target;el&&el!==document.body;el=el.parentElement){const s=getComputedStyle(el);if(/auto|scroll/.test(s.overflowY)&&el.scrollHeight>el.clientHeight+2)return;}e.preventDefault();this.input(e.deltaY*(e.deltaMode===1?18:e.deltaMode===2?innerHeight:1));}
 input(delta,touch=false){
  const now=performance.now();if(this.transitioning||now<this.cooldown||!delta)return;const bands=this.bands(),position=this.scrollFrame?this.target:scrollY;let index=0,distance=Infinity;
  bands.forEach((b,i)=>{const d=Math.max(b.min-position,position-b.max,0);if(d<distance){distance=d;index=i;}});
  const band=bands[index],sign=Math.sign(delta),wanted=position+delta,inside=Math.max(band.min,Math.min(band.max,wanted));
  if(wanted>=band.min&&wanted<=band.max){this.resetPressure();this.follow(inside,touch);return;}this.follow(inside,touch);
  // Reaching the reading boundary consumes this gesture; crossing needs a fresh push.
  if(Math.abs(position-inside)>3){this.resetPressure();return;}
  if(index===0&&sign<0||index===bands.length-1&&sign>0){this.resetPressure();return;}
  if(this.direction!==sign||now-(this.lastPressure||0)>380)this.pressure=0;this.direction=sign;this.lastPressure=now;this.pressure+=Math.abs(wanted-inside);band.el.style.setProperty('--magnet-pull',sign*Math.min(20,this.pressure*.09)+'px');this.scheduleRelease();
  if(this.pressure>=(touch?85:155)){const next=bands[index+sign],museumBridge=band.id==='photography'&&next.id==='art',skyBridge=band.id==='journey'&&next.id==='pantheon'||band.id==='pantheon'&&next.id==='journey';this.resetPressure();if(band.id==='art'&&sign>0&&!this.reduced.matches)this.departMuseum(next);else this.jump(sign>0?next.min:next.max,next.id,museumBridge?4700:skyBridge?2800:1750);}
 }
 departMuseum(next){const museum=document.querySelector('[data-museum-wall]')?.museumWall;if(!museum){this.jump(next.min,next.id,1750);return;}this.cancel(true);this.departureMuseum=museum;this.navigating=this.transitioning=true;const token=this.departureToken;museum.startDeparture().then(completed=>{if(!completed||this.destroyed||token!==this.departureToken)return;this.departureMuseum=null;this.jump(this.bands().find(b=>b.id===next.id).min,next.id,4700,true);});}
 follow(y,touch=false){this.target=y;if(this.reduced.matches||touch){scrollTo(0,y);this.request();return;}if(this.scrollFrame)return;let previous,position=scrollY;const step=t=>{const dt=previous?Math.min(40,t-previous):16;previous=t;position+=(this.target-position)*(1-Math.exp(-dt/85));scrollTo(0,position);if(Math.abs(this.target-position)>.45)this.scrollFrame=requestAnimationFrame(step);else{scrollTo(0,this.target);this.scrollFrame=0;this.request();}};this.scrollFrame=requestAnimationFrame(step);}
 sceneEvent(phase,id){if(phase==='prepare')this.pendingScene=id;else if(this.pendingScene===id)this.pendingScene=null;window.dispatchEvent(new CustomEvent('shili:scene-'+phase,{detail:{id}}));}
 jump(y,id,duration=900,preserveDeparture=false){this.cancel(true,preserveDeparture);this.resetPressure();this.navigating=this.transitioning=true;this.sceneEvent('prepare',id);this.activate(id);this.target=y;if(this.reduced.matches){scrollTo(0,y);this.navigating=this.transitioning=false;this.sceneEvent('arrive',id);this.request();return;}const start=scrollY;let begin;const step=t=>{begin??=t;const p=Math.min(1,(t-begin)/duration),ease=p*p*p*(p*(p*6-15)+10);scrollTo(0,start+(y-start)*ease);if(p<1)this.scrollFrame=requestAnimationFrame(step);else{this.scrollFrame=0;this.navigating=this.transitioning=false;this.cooldown=performance.now()+180;this.target=scrollY;this.sceneEvent('arrive',id);this.request();}};this.scrollFrame=requestAnimationFrame(step);}
 scrollToSection(id,animate=true,restore){if(id==='about'){id='home';history.replaceState(null,'','#/home');}const b=this.bands().find(b=>b.id===id);if(!b)return;closeMenu();const y=restore===undefined?b.min:Math.max(b.min,Math.min(b.max,restore));if(animate)this.jump(y,id,Math.min(2200,1000+Math.abs(y-scrollY)*.01));else{this.cancel(true);this.resetPressure();this.sceneEvent('prepare',id);this.activate(id);scrollTo(0,y);this.target=y;this.sceneEvent('arrive',id);this.request();}}
 settle(){if(this.destroyed||this.scrollFrame||this.transitioning||this.touch||document.querySelector('dialog[open]'))return;const bands=this.bands();if(bands.some(b=>scrollY>=b.min-1&&scrollY<=b.max+1))return;let closest;for(const b of bands)for(const y of [b.min,b.max])if(!closest||Math.abs(y-scrollY)<closest.distance)closest={y,id:b.id,distance:Math.abs(y-scrollY)};if(closest)this.jump(closest.y,closest.id,1500);}
 destroy(){this.destroyed=true;this.cancel(true);clearTimeout(this.pressureTimer);clearTimeout(this.settleTimer);this.themeObserver.disconnect();this.resetPressure();super.destroy();}
}
