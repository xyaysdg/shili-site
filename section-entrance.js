/* Independent section timelines; no timers survive navigation or offscreen resets. */
class SectionEntrance {
 constructor(section,kind){
  this.section=section;this.kind=kind;this.animations=[];this.listeners=[];this.motion=matchMedia('(prefers-reduced-motion: reduce)');this.visible=false;this.destroyed=false;
  const listen=(el,type,fn)=>{el.addEventListener(type,fn);this.listeners.push(()=>el.removeEventListener(type,fn));};
  this.controls=[...section.querySelectorAll(kind==='library'?'.writing-tools,.library-controls,.library-viewport':kind==='photography'?'.photo-depths,.photo-wall-link':'.medal-controls,.medal-orbit')];
  const alreadyReady=section.dataset.sceneEntrance==='ready';this.reset();if(alreadyReady||this.motion.matches)this.finish();
  this.observer=new IntersectionObserver(entries=>{const e=entries[0];this.visible=e.isIntersecting;if(!e.isIntersecting){this.wasOutside=true;this.sync();return;}if(this.wasOutside&&!this.navigationPending){this.reset();this.wasOutside=false;}if(!this.navigationPending&&(e.intersectionRatio>=.65||e.boundingClientRect.top<innerHeight*.2))this.play();},{threshold:[0,.12,.3,.65,.85]});this.observer.observe(section);
  const sceneId=section.closest('[data-section]')?.dataset.section;
  listen(window,'shili:scene-prepare',e=>{if(e.detail.id===sceneId){this.navigationPending=true;this.reset();}});
  listen(window,'shili:scene-cancel',e=>{if(e.detail.id===sceneId){this.navigationPending=false;const r=section.getBoundingClientRect();if(Math.min(innerHeight,r.bottom)-Math.max(0,r.top)>=Math.min(innerHeight,r.height)*.65)this.play();}});
  listen(window,'shili:scene-arrive',e=>{if(e.detail.id===sceneId){this.navigationPending=false;this.wasOutside=false;this.visible=true;this.play();}});
  // Keep visible overhangs intact after the section's own box has left the viewport.
  this.extentObserver=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)this.reset();},{rootMargin:'100% 0px'});this.extentObserver.observe(section);
  listen(this.motion,'change',()=>{if(this.motion.matches||document.body.classList.contains('site-editor-active'))this.finish();else if(this.visible)this.play();});
  listen(document,'visibilitychange',()=>this.sync());
  listen(window,'beforeprint',()=>this.finish());
  this.modal=new MutationObserver(()=>this.sync());this.modal.observe(document.body,{attributes:true,attributeFilter:['class']});
  // Keyboard navigation must never land in a visually hidden control.
  listen(section,'focusin',()=>{if(!this.navigationPending)this.finish();});
 }
 add(selector,from,to,delay,duration){for(const el of (typeof selector==='string'?this.section.querySelectorAll(selector):selector)){const a=el.animate([from,to],{delay,duration,easing:'cubic-bezier(.25,.65,.3,1)',fill:'both'});a.pause();a.currentTime=0;this.animations.push(a);}}
 reset(){
  this.animations.forEach(a=>a.cancel());this.animations=[];if(this.destroyed)return;
  this.section.dataset.sceneEntrance='waiting';this.controls.forEach(e=>e.inert=true);
  const fade=(selector,delay,duration=1200)=>this.add(selector,{opacity:0},{opacity:1},delay,duration);
  if(this.kind==='library'){
   fade('.page-title-row,.page-heading>.eyebrow',1000,1100);fade('.page-heading>p',1500,1200);
   fade('.library-viewport',2100,1900);
   // Reverse the extraction vector in the book's own 3D coordinates.
   for(const el of this.section.querySelectorAll('.library-article-slot .book-motion')){const a=el.animate([{transform:'translate3d(0,0,calc(var(--book-depth) + 260px))',offset:0},{transform:'translate3d(0,0,0)',offset:1}],{delay:3100,duration:4400,easing:'cubic-bezier(.35,.05,.3,1)',fill:'both'});a.pause();a.currentTime=0;this.animations.push(a);}
   this.add('.library-article-slot .book-object>span',{opacity:0},{opacity:'var(--distance-alpha,1)'},3100,2400);
   fade('.library-letters',5900,1600);fade('.writing-tools,.library-controls,.shelf-results-heading',7500,1000);
  }else if(this.kind==='photography'){
   this.section.photography?.resetHome();
   const bridgeLayers=this.section.photography?.bridgeLayers||[];bridgeLayers.forEach(el=>el.dataset.sceneEntrance='waiting');
   this.add(bridgeLayers,{opacity:0},{opacity:1},1600,1800);
   fade('.photo-copy .eyebrow,.photo-copy .page-title-row',0,1000);fade('.photo-copy .page-heading>p',250,1200);fade('.photo-wall-link',500,1100);
   // Fade in the flat hanging layers from back to front.
   ['distant','far','middle','foreground'].forEach((depth,i)=>this.add('.photo-depth-'+depth,{opacity:0,transform:'translateY(18px) scale(.94)'},{opacity:1,transform:'translateY(0px) scale(1)'},1100+i*700,1800));
  }else{
   this.add('.medal-stage',{filter:'brightness(.045)'},{filter:'brightness(1)'},650,1700);
   fade('.journey-beam,.medal-shadow,.journey-floor',650,1700);fade('.journey-fireflies',1650,2000);
   fade('.journey-copy',1400,1900);fade('.medal-controls',3700,1000);
  }
  if(this.motion.matches)this.finish();
 }
 play(){if(this.kind==='library')this.section.querySelector('.library-viewport')?.library?.updateFocusTargets();if(this.destroyed||this.section.dataset.sceneEntrance==='ready')return;if(this.motion.matches){this.finish();return;}if(this.section.dataset.sceneEntrance==='waiting'){
   this.section.dataset.sceneEntrance='playing';const last=this.animations.at(-1);if(last)last.onfinish=()=>this.finish();
  }this.sync();}
 sync(){if(document.body.classList.contains('site-editor-active')){this.finish();return;}if(this.destroyed||this.section.dataset.sceneEntrance!=='playing')return;const paused=!this.visible||document.hidden||document.body.classList.contains('modal-open');this.animations.forEach(a=>{if(a.playState==='finished')return;if(paused)a.pause();else if(a.playState!=='running')a.play();});}
 finish(){if(this.destroyed)return;this.section.dataset.sceneEntrance='ready';if(this.kind==='photography')this.section.photography?.bridgeLayers?.forEach(el=>el.dataset.sceneEntrance='ready');this.animations.forEach(a=>{a.onfinish=null;a.cancel();});this.animations=[];this.controls.forEach(e=>e.inert=false);if(this.kind==='photography')this.section.photography?.syncAtmosphere();}
 destroy(){this.finish();this.destroyed=true;this.observer.disconnect();this.extentObserver.disconnect();this.modal.disconnect();this.listeners.forEach(off=>off());}
}
