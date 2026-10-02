/* Original milestone data; two-sided machined metal presentation. */
function milestoneMedalMarkup(){
 const shield='M122 43H378Q423 43 431 89L458 374Q462 405 437 425L273 541Q250 557 227 541L63 425Q38 405 42 374L69 89Q77 43 122 43Z';
 const face=back=>`<svg viewBox="0 0 500 560" aria-hidden="true" focusable="false"><defs>
 <linearGradient id="shield-metal-${back}" x1="0" y1="0" x2="1" y2=".8"><stop stop-color="#f7fbfc"/><stop offset=".12" stop-color="#acb8bb"/><stop offset=".25" stop-color="#505d63"/><stop offset=".32" stop-color="#e3ebec"/><stop offset=".36" stop-color="#ffffff"/><stop offset=".4" stop-color="#adb9bc"/><stop offset=".58" stop-color="#748389"/><stop offset=".66" stop-color="#f6ffff"/><stop offset=".71" stop-color="#c1cdce"/><stop offset=".86" stop-color="#68797e"/><stop offset="1" stop-color="#e6eeef"/></linearGradient>
 <linearGradient id="shield-bevel-${back}" x1="0" y1="0" x2=".65" y2="1"><stop stop-color="#ffffff"/><stop offset=".25" stop-color="#d7e3e4"/><stop offset=".47" stop-color="#6e7d81"/><stop offset=".51" stop-color="#f8ffff"/><stop offset=".75" stop-color="#9eabad"/><stop offset="1" stop-color="#354a50"/></linearGradient>
 <pattern id="shield-brush-${back}" width="4" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)"><path d="M0 .5H4" stroke="#fff" stroke-opacity=".22" stroke-width=".45"/><path d="M0 2H4" stroke="#142b31" stroke-opacity=".18" stroke-width=".4"/></pattern>
 <filter id="shield-relief-${back}" x="-15%" y="-20%" width="130%" height="150%"><feDropShadow dx="1" dy="3" stdDeviation="1" flood-color="#023c32" flood-opacity=".8"/></filter>
 <linearGradient id="shield-mint-${back}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#c8e6d2"/><stop offset=".26" stop-color="#79c8b2"/><stop offset=".6" stop-color="#b5e4ce"/><stop offset="1" stop-color="#53ab92"/></linearGradient>
 <linearGradient id="shield-green-${back}" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#00b4a2"/><stop offset=".42" stop-color="#009d80"/><stop offset=".7" stop-color="#00836a"/><stop offset="1" stop-color="#00624d"/></linearGradient>
 <linearGradient id="shield-letter-${back}" x1="0" y1="0" x2=".18" y2="1"><stop stop-color="#ffffff"/><stop offset=".25" stop-color="#d8e4e5"/><stop offset=".46" stop-color="#8a9b9f"/><stop offset=".49" stop-color="#6c7f84"/><stop offset=".53" stop-color="#eef8fa"/><stop offset=".76" stop-color="#b8c7c9"/><stop offset="1" stop-color="#657e83"/></linearGradient>
 <clipPath id="shield-inner-${back}"><path d="${shield}" transform="translate(250 280) scale(.79) translate(-250 -280)"/></clipPath>
 </defs>
 <path class="medal-outline" d="${shield}" fill="url(#shield-metal-${back})" stroke="#344e54" stroke-width="4"/>
 <path d="${shield}" transform="translate(250 280) scale(.987) translate(-250 -280)" fill="none" stroke="url(#shield-bevel-${back})" stroke-width="5"/>
 <path d="${shield}" transform="translate(250 280) scale(.953) translate(-250 -280)" fill="none" stroke="url(#shield-brush-${back})" stroke-width="13"/>
 <path d="${shield}" transform="translate(250 280) scale(.928) translate(-250 -280)" fill="#233f43" stroke="#354e52" stroke-width="4"/>
 <path d="${shield}" transform="translate(250 280) scale(.914) translate(-250 -280)" fill="url(#shield-mint-${back})" stroke="url(#shield-bevel-${back})" stroke-width="4"/>
 <path d="${shield}" transform="translate(250 280) scale(.837) translate(-250 -280)" fill="#173e39" stroke="#42786a" stroke-width="4"/>
 <path d="${shield}" transform="translate(250 280) scale(.821) translate(-250 -280)" fill="url(#shield-metal-${back})" stroke="url(#shield-bevel-${back})" stroke-width="3"/>
 <path d="${shield}" transform="translate(250 280) scale(.79) translate(-250 -280)" fill="url(#shield-green-${back})" stroke="#0e5d49" stroke-width="2"/>
 <g clip-path="url(#shield-inner-${back})"><path d="M60 86L405 280L416 330L50 125Z" fill="#d2fff5" opacity=".08"/><path d="M70 169L313 65L436 140L70 311Z" fill="#00d4b5" opacity=".12"/><path d="M45 327L421 528L462 410L35 177Z" fill="#004f49" opacity=".15"/></g>
 ${back?`<text x="250" y="156" text-anchor="middle" class="shield-back-label">个人生涯跑步里程</text>
 <text x="250" y="208" text-anchor="middle" class="shield-back-title">1000km</text>
 <path d="M147 240H353" stroke="#d2e8ce" stroke-opacity=".45"/>
 <text x="250" y="280" text-anchor="middle" class="shield-back-label">第一条记录</text>
 <text x="250" y="315" text-anchor="middle" class="shield-date">2021.02.02</text>
 <text x="250" y="365" text-anchor="middle" class="shield-back-label">达成日期</text>
 <text x="250" y="400" text-anchor="middle" class="shield-date">2025.12.18</text>`:
 `<g clip-path="url(#shield-inner-false)">
 <g class="shield-track-shadow"><path d="M63 398Q122 290 247 331L443 407M83 421Q140 316 256 357L430 426M106 444Q157 343 264 383L407 444M134 463Q172 369 274 410L383 462M245 331L237 351M301 373L292 394"/></g>
 <g class="shield-track" filter="url(#shield-relief-false)"><path d="M63 393Q122 285 247 326L443 402M83 416Q140 311 256 352L430 421M106 439Q157 338 264 378L407 439M134 458Q172 364 274 405L383 457M245 326L237 346M301 368L292 389"/><path class="shield-track-ridge" d="M63 391Q122 283 247 324L443 400M83 414Q140 309 256 350L430 419M106 437Q157 336 264 376L407 437M134 456Q172 362 274 403L383 455"/></g></g>
 <text x="250" y="219" text-anchor="middle" class="shield-value shield-value-shadow" transform="translate(1 7)">1000<tspan class="shield-km">km</tspan></text>
 <text x="250" y="219" text-anchor="middle" class="shield-value">1000<tspan class="shield-km">km</tspan></text>
 <text x="250" y="267" text-anchor="middle" class="shield-running shield-value-shadow" transform="translate(0 5)">RUNNING</text>
 <text x="250" y="267" text-anchor="middle" class="shield-running">RUNNING</text>
 <path d="M92 25H408Q426 25 428 53L405 56L95 56L72 53Q74 25 92 25Z" fill="url(#shield-metal-false)" stroke="#6b8071" stroke-width="2"/>
 <path d="M96 42L250 110L404 42Z" fill="#005f58" stroke="#355f52" stroke-width="3"/>
 <path d="M102 41L250 95L398 41Z" fill="#079786" stroke="#5bbaa6" stroke-width="2"/>
 <path d="M250 45V94L395 42Z" fill="#057469" opacity=".75"/>
 <rect x="219" y="19" width="66" height="67" rx="2" fill="#174a41" opacity=".8"/>
 <rect x="218" y="16" width="64" height="66" rx="1" fill="url(#shield-metal-false)" stroke="url(#shield-bevel-false)" stroke-width="3"/>
 <rect x="222" y="20" width="56" height="58" fill="url(#shield-brush-false)" stroke="#536b70" stroke-width=".8"/>
 <path d="M235 32V64L264 33M250 50L266 66" fill="none" stroke="#4d6155" stroke-width="5" stroke-linejoin="round"/><path d="M234 31V62L263 31M250 48L266 64" fill="none" stroke="#e1e6d8" stroke-width="1.5"/>
 `}</svg>`;
 return `<section class="medal-exhibit" data-medal-asset="blender-v37" aria-labelledby="medal-title"><header class="medal-exhibit-heading"><span class="eyebrow">2025 / RUNNING MILESTONE</span><h2 id="medal-title">2025个人跑步生涯1000公里目标达成！</h2></header>
 <div class="medal-stage"><div class="medal-shadow" aria-hidden="true"></div><div class="medal-orbit" tabindex="0" role="group" aria-roledescription="可旋转的三维徽章" aria-label="1000公里纪念徽章。首次记录2021年2月2日，达成日期2025年12月18日。">
 <div class="medal-rotor" aria-hidden="true"><div class="medal-edge"></div><div class="medal-face medal-front">${face(false)}<img class="medal-reference-front" src="assets/medal-blender-v37-front.webp" loading="lazy" alt=""><span class="medal-glint"></span></div><div class="medal-face medal-back">${face(true)}<img class="medal-reference-back" src="assets/medal-blender-v37-back.webp" loading="lazy" alt=""><span class="medal-glint"></span></div></div></div></div>
 <div class="medal-controls"><div><button class="medal-image" data-journey-image aria-haspopup="dialog">查看图片</button><button class="medal-pause" aria-pressed="false">暂停转动 Ⅱ</button><button class="medal-flip">查看背面 ↻</button><button class="medal-reset">复位 ↺</button></div></div>
 <span class="visually-hidden medal-status" role="status" aria-live="polite"></span></section>`;
}

class MilestoneMedal {
 constructor(root){
  this.root=root;this.stage=root.querySelector('.medal-stage');this.orbit=root.querySelector('.medal-orbit');this.rotor=root.querySelector('.medal-rotor');this.pause=root.querySelector('.medal-pause');this.flip=root.querySelector('.medal-flip');this.reset=root.querySelector('.medal-reset');this.status=root.querySelector('.medal-status');
  this.yaw=0;this.pitch=0;this.targetYaw=0;this.targetPitch=0;this.baseYaw=0;this.time=0;this.frame=0;this.listeners=[];this.visible=false;this.reduced=matchMedia('(prefers-reduced-motion: reduce)');this.paused=true;
  const edge=root.querySelector('.medal-edge');
  const outline=root.querySelector('.medal-outline'),length=outline.getTotalLength();
  for(let i=0;i<96;i++){
   const a=outline.getPointAtLength(i*length/96),b=outline.getPointAtLength((i+1)*length/96),dx=b.x-a.x,dy=b.y-a.y;
   const tile=document.createElement('i');
   tile.style.left=((a.x+b.x)/10)+'%';tile.style.top=((a.y+b.y)/11.2)+'%';
   tile.style.width='calc(var(--medal-size) * '+(Math.hypot(dx,dy)/500+.0008)+')';
   tile.style.setProperty('--edge-angle',Math.atan2(dy,dx)*180/Math.PI+'deg');
   tile.style.setProperty('--edge-light',(.7+.2*Math.cos(Math.atan2(dy,dx))).toFixed(2));edge.append(tile);
  }
  this.listen(this.orbit,'pointerdown',e=>{if(e.button!==0||!e.isPrimary||this.drag)return;this.drag={id:e.pointerId,x:e.clientX,y:e.clientY,yaw:this.yaw,pitch:this.pitch};this.targetYaw=this.yaw;this.targetPitch=this.pitch;this.paused=true;this.orbit.setPointerCapture(e.pointerId);this.root.classList.add('is-dragging');this.sync();});
  this.listen(this.orbit,'pointermove',e=>{if(!this.drag||this.drag.id!==e.pointerId)return;this.targetYaw=this.drag.yaw+(e.clientX-this.drag.x)*.55;this.targetPitch=Math.max(-38,Math.min(38,this.drag.pitch-(e.clientY-this.drag.y)*.3));this.sync();this.wake();});
  const release=e=>{if(this.drag&&e.pointerId!==this.drag.id)return;this.drag=null;this.root.classList.remove('is-dragging');this.sync();this.wake();};
  this.listen(this.orbit,'pointerup',release);this.listen(this.orbit,'pointercancel',release);this.listen(this.orbit,'lostpointercapture',release);
  this.listen(this.orbit,'keydown',e=>{
   if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','Home'].includes(e.key))return;e.preventDefault();
   if(e.key===' '){if(!this.reduced.matches)this.toggleMotion();return;}this.paused=true;
   if(e.key==='ArrowLeft')this.targetYaw-=15;if(e.key==='ArrowRight')this.targetYaw+=15;
   if(e.key==='ArrowUp')this.targetPitch=Math.min(48,this.targetPitch+10);if(e.key==='ArrowDown')this.targetPitch=Math.max(-48,this.targetPitch-10);
   if(e.key==='Home')this.resetPosition();
   this.sync();this.wake();
  });
  this.listen(this.pause,'click',()=>this.toggleMotion());
  this.listen(this.flip,'click',()=>{this.paused=true;const front=Math.cos(this.targetYaw*Math.PI/180)>=0;this.targetYaw=this.nearestFace(front?180:0,this.yaw);this.targetPitch=-6;this.sync();this.wake();});
  this.listen(this.reset,'click',()=>this.resetPosition());
  this.listen(this.reduced,'change',()=>{if(this.reduced.matches)this.paused=true;this.sync();this.wake();});
  this.listen(window,'blur',()=>this.cancelDrag());
  this.listen(document,'visibilitychange',()=>{if(document.hidden)this.cancelDrag();this.wake();});
  this.intersection=new IntersectionObserver(es=>{this.visible=es[0].isIntersecting;this.wake();});this.intersection.observe(root);
  this.mutation=new MutationObserver(()=>{if(document.body.classList.contains('modal-open'))this.cancelDrag();this.wake();});this.mutation.observe(document.body,{attributes:true,attributeFilter:['class']});
  this.paint();this.sync();
  this.modelPreload=new IntersectionObserver(entries=>{if(!entries.some(e=>e.isIntersecting))return;this.modelPreload.disconnect();import('./medal-blender-model.js').then(m=>this.destroyed?null:m.createMedalModel(root)).then(model=>{if(this.destroyed){model?.dispose();return;}this.meshModel=model;this.paint();}).catch(()=>{if(!this.destroyed){root.dataset.medalRenderer='fallback';this.status.textContent='当前设备未能启用三维渲染，显示兼容版徽章。';}});},{rootMargin:'700px'});this.modelPreload.observe(root);
 }
 listen(el,event,fn){el.addEventListener(event,fn);this.listeners.push(()=>el.removeEventListener(event,fn));}
 resetPosition(){this.paused=true;this.targetYaw=this.nearestFace(0,this.yaw);this.targetPitch=0;this.sync();this.wake();}
 nearestFace(offset,reference){return Math.round((reference-offset)/360)*360+offset;}
 toggleMotion(){if(this.reduced.matches)return;if(this.paused){this.paused=false;this.baseYaw=this.nearestFace(Math.cos(this.yaw*Math.PI/180)>=0?0:180,this.yaw);this.time=0;}else{this.paused=true;this.targetYaw=this.yaw;this.targetPitch=this.pitch;}this.sync();this.wake();}
 cancelDrag(){if(!this.drag)return;const id=this.drag.id;this.drag=null;this.root.classList.remove('is-dragging');if(this.orbit.hasPointerCapture(id))this.orbit.releasePointerCapture(id);this.targetYaw=this.yaw;this.targetPitch=this.pitch;}
 sync(){this.pause.disabled=this.reduced.matches;this.pause.textContent=this.reduced.matches?'已减少动态':this.paused?'继续转动 ▷':'暂停转动 Ⅱ';this.pause.setAttribute('aria-pressed',String(this.paused));this.flip.dataset.face=Math.cos(this.targetYaw*Math.PI/180)>=0?'front':'back';this.flip.textContent=this.flip.dataset.face==='front'?'查看背面 ↻':'查看正面 ↻';}
 wake(){if(this.destroyed)return;if(!this.visible||document.hidden||document.body.classList.contains('modal-open')){cancelAnimationFrame(this.frame);this.frame=0;return;}if(!this.frame){this.previous=0;this.frame=requestAnimationFrame(t=>this.tick(t));}}
 tick(t){
  this.frame=0;if(this.destroyed||!this.visible||document.hidden||document.body.classList.contains('modal-open'))return;const dt=this.previous?Math.min((t-this.previous)/1000,.05):0;this.previous=t;
  if(!this.paused&&!this.drag&&!this.reduced.matches){this.time+=dt;this.targetYaw=this.baseYaw+Math.sin(this.time*.28)*12;this.targetPitch=Math.sin(this.time*.35)*3;}
  const ease=this.reduced.matches?1:1-Math.exp(-dt/(this.drag ? .085 : .2));this.yaw+=(this.targetYaw-this.yaw)*ease;this.pitch+=(this.targetPitch-this.pitch)*ease;
  this.paint();
  if(!this.paused&&!this.reduced.matches||Math.abs(this.targetYaw-this.yaw)>.015||Math.abs(this.targetPitch-this.pitch)>.015)this.frame=requestAnimationFrame(n=>this.tick(n));
 }
 paint(){
  this.meshModel?.render(this.pitch,this.yaw);
  this.rotor.style.transform=`rotateX(${this.pitch.toFixed(3)}deg) rotateY(${this.yaw.toFixed(3)}deg)`;
  const light=50+Math.sin(this.yaw*Math.PI/180)*36;
  // Isolate moving highlights from SVG text styles to avoid repeated glyph layout during rotation.
  this.root.querySelectorAll('.medal-glint').forEach(glint=>{glint.style.setProperty('--medal-light-x',light+'%');glint.style.setProperty('--medal-light-angle',(110-this.yaw*.7)+'deg');});
  const front=Math.cos(this.yaw*Math.PI/180)>=0;
  if(this.front!==front){this.front=front;this.status.textContent=front?'徽章正面：累计1000公里。':'徽章背面：首次记录2021年2月2日，达成日期2025年12月18日。';}
 }
 destroy(){this.destroyed=true;this.cancelDrag();cancelAnimationFrame(this.frame);this.meshModel?.dispose();this.modelPreload.disconnect();this.intersection.disconnect();this.mutation.disconnect();this.listeners.forEach(off=>off());}
}
