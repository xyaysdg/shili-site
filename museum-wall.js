function museumMarkup(){return `<div class="museum-stage" data-entrance="waiting"><div class="museum-backdrop" aria-hidden="true"></div><div class="museum-viewport" data-museum-wall tabindex="0" role="region" aria-label="可拖动画廊"><div class="museum-pictures"></div></div><div class="museum-floor" aria-hidden="true"><canvas class="museum-reflection"></canvas></div><img class="museum-visitor" src="assets/museum-visitor-v29.png" alt="" aria-hidden="true"><div class="museum-tools"><a href="#/wall/art">完整作品墙 ↗</a></div></div>`;}

// Keep the live frame, reflected frame and flight frame on the same thirty-two-pixel profile.
const MUSEUM_FRAME_RIM=32;
function paintMuseumFrame(ctx,x,y,w,h,scale=1){
 const bands=["#493018","#bf9958","#d7b675","#806036","#47321e","#654925","#ad8242","#d0a45b","#b48a45","#92703b","#91703c","#95713c","#99733d","#99743e","#98733b","#91703a","#846235","#6e4f2a","#533a22","#b98e4b","#d4ae6d","#c49e5e","#876235","#4f3720","#bd975d","#d6b881","#79603a","#d9ccad","#c6b593","#d7c7a7","#d7c7a7","#907b58"];
 bands.forEach((color,i)=>{const inset=i*scale;ctx.fillStyle=color;ctx.fillRect(x+inset,y+inset,Math.max(0,w-inset*2),Math.max(0,h-inset*2));});
 ctx.save();ctx.lineWidth=scale;
 for(const [cx,cy,sx,sy] of [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]]){
  ctx.beginPath();ctx.moveTo(cx+sx*2*scale,cy+sy*2*scale);ctx.lineTo(cx+sx*25*scale,cy+sy*25*scale);ctx.strokeStyle='#cfac6d';ctx.stroke();
 }
 ctx.restore();
}
class MuseumWall {
 constructor(viewport,items){
  this.viewport=viewport;viewport.museumWall=this;this.layer=viewport.querySelector('.museum-pictures');this.items=items;this.nodes=[];this.listeners=[];this.x=0;this.y=0;this.tx=0;this.ty=0;this.vx=0;this.vy=0;this.frame=0;this.reduced=matchMedia('(prefers-reduced-motion: reduce)');this.canvas=viewport.parentElement.querySelector('.museum-reflection');this.ctx=this.canvas.getContext('2d');
  this.stage=viewport.parentElement;this.tools=this.stage.querySelector('.museum-tools');this.entranceFrame=0;this.entranceElapsed=0;this.waitForEntrance();
  items.forEach((item,i)=>{const button=document.createElement('button');button.className='museum-frame';button.dataset.gallery='art';button.dataset.index=i;button.setAttribute('aria-label','查看'+(item.caption||'画作 '+(i+1)));const img=document.createElement('img');img.src=item.thumb||item.src;img.alt=item.caption||'';img.draggable=false;img.decoding='async';button.append(img);this.layer.append(button);const n={button,index:i};this.nodes.push(n);
   this.listen(button,'click',e=>{if(this.suppressClick){e.preventDefault();return;}openGallery(items,i,button);});this.listen(img,'load',()=>this.paint());
   this.listen(button,'focus',()=>{if(!button.matches(':focus-visible'))return;const r=button.getBoundingClientRect(),v=viewport.getBoundingClientRect();if(r.left<v.left||r.right>v.right||r.top<v.top||r.bottom>v.bottom){this.stop();this.tx=this.x=viewport.clientWidth/2-n.w/2-n.bx;this.ty=this.y=viewport.clientHeight/2-n.h/2-n.by;this.paint();viewport.scrollLeft=viewport.scrollTop=0;}});
  });
  const label=document.createElement('div');label.className='museum-wall-label';label.innerHTML='<h1>说来“画”长</h1><p>从小热爱画画，系统学过美术，也凭着热爱创作出了许多的画作，且看我一一“道”来。</p><p class="museum-drag-hint">左键摁住拖动画作</p>';this.layer.append(label);this.nodes.push({button:label,isLabel:true,index:-1});
  this.compose();
  this.listen(viewport,'dragstart',e=>e.preventDefault());
  this.listen(viewport,'pointerdown',e=>{if(e.button!==0||!e.isPrimary)return;this.stop();this.suppressClick=false;this.drag={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,time:e.timeStamp,touch:e.pointerType==='touch',moved:false};this.drag.capture=e.target.closest('.museum-frame')||viewport;this.drag.capture.setPointerCapture(e.pointerId);});
  this.listen(viewport,'pointermove',e=>{const d=this.drag;if(!d||e.pointerId!==d.id)return;const dx=e.clientX-d.x,dy=d.touch?0:e.clientY-d.y,dt=Math.max(8,e.timeStamp-d.time);if(Math.hypot(e.clientX-d.startX,e.clientY-d.startY)>6){d.moved=true;viewport.classList.add('is-dragging');}this.tx+=dx*.48;this.ty+=dy*.48;this.vx=Math.max(-1.5,Math.min(1.5,dx/dt))*.28;this.vy=Math.max(-1.5,Math.min(1.5,dy/dt))*.28;d.x=e.clientX;d.y=e.clientY;d.time=e.timeStamp;this.wake();});
  const release=e=>{const d=this.drag;if(!d||e.pointerId!==d.id)return;this.suppressClick=d.moved||e.type==='pointercancel';if(e.type==='pointercancel'||e.timeStamp-d.time>100)this.vx=this.vy=0;this.drag=null;viewport.classList.remove('is-dragging');if(d.capture.hasPointerCapture(e.pointerId))d.capture.releasePointerCapture(e.pointerId);this.wake();clearTimeout(this.clickTimer);this.clickTimer=setTimeout(()=>this.suppressClick=false,160);};
  this.listen(viewport,'pointerup',release);this.listen(viewport,'pointercancel',release);this.listen(viewport,'lostpointercapture',release);
  this.listen(viewport,'keydown',e=>{const dir={ArrowLeft:[120,0],ArrowRight:[-120,0],ArrowUp:[0,100],ArrowDown:[0,-100]}[e.key];if(!dir)return;e.preventDefault();e.stopPropagation();this.tx+=dir[0];this.ty+=dir[1];this.vx=this.vy=0;this.wake();});
  this.resize=new ResizeObserver(()=>this.layout());this.resize.observe(viewport);
  this.visibility=new IntersectionObserver(es=>{const e=es[0],visibleHeight=e.intersectionRect.height,available=Math.min(e.boundingClientRect.height,Math.max(1,innerHeight));this.visible=e.isIntersecting;this.stage.style.setProperty('--museum-presence',this.reduced.matches?'1':Math.min(1,visibleHeight/(available*.82)).toFixed(3));if(!this.visible){this.stop();this.waitForEntrance();}else if(!this.navigationPending&&visibleHeight>=available*.82&&this.stage.dataset.entrance==='waiting')this.beginEntrance();},{threshold:Array.from({length:41},(_,i)=>i/40)});this.visibility.observe(viewport);
  this.listen(window,'shili:scene-prepare',e=>{if(e.detail.id==='art'){this.navigationPending=true;this.waitForEntrance();}});
  this.listen(window,'shili:scene-cancel',e=>{if(e.detail.id==='art'){this.navigationPending=false;const r=this.viewport.getBoundingClientRect();if(Math.min(innerHeight,r.bottom)-Math.max(0,r.top)>=Math.min(innerHeight,r.height)*.82)this.beginEntrance();}});
  this.listen(window,'shili:scene-arrive',e=>{if(e.detail.id==='art'){this.navigationPending=false;this.beginEntrance();}});
  this.listen(document,'visibilitychange',()=>{if(document.hidden){this.stop();cancelAnimationFrame(this.entranceFrame);this.entranceFrame=0;}else if(this.stage.dataset.entrance==='playing'){this.entranceLast=0;this.entranceFrame=requestAnimationFrame(t=>this.entranceTick(t));}});
  this.listen(this.reduced,'change',()=>{if(this.reduced.matches)this.finishEntrance();});
  this.listen(window,'blur',()=>{if(this.drag){const {id,capture}=this.drag;this.drag=null;if(capture.hasPointerCapture(id))capture.releasePointerCapture(id);}viewport.classList.remove('is-dragging');this.stop();});this.layout();
 }
 listen(el,type,fn){el.addEventListener(type,fn);this.listeners.push(()=>el.removeEventListener(type,fn));}
 waitForEntrance(){
  cancelAnimationFrame(this.entranceFrame);this.entranceFrame=0;this.entranceElapsed=0;this.stage.dataset.entrance='waiting';this.viewport.inert=true;this.tools.inert=true;
  for(const key of ['floor','person','label','art','reflection','tools'])this.stage.style.setProperty('--entrance-'+key,'0');
  this.clearDeparture();
  this.layer.querySelectorAll('.museum-frame').forEach(e=>e.style.setProperty('--painting-opacity','0'));
  if(this.reduced.matches)this.finishEntrance();
 }
 resetComposition(){const label=this.label,width=this.viewport.clientWidth,height=this.viewport.clientHeight;this.stop();this.x=this.tx=(width<600?width-label.w-20:width*.67-label.w/2)-label.bx;this.y=this.ty=height*.43-label.h/2-label.by;this.anchor={x:label.bx+this.x+label.w/2,y:label.by+this.y+label.h/2};this.paint();}
 beginEntrance(){if(this.destroyed||!this.worldW)return;if(this.reduced.matches){this.finishEntrance();return;}this.resetComposition();this.stage.dataset.entrance='playing';this.entranceElapsed=0;this.entranceLast=0;this.prepareReveal();this.entranceFrame=requestAnimationFrame(t=>this.entranceTick(t));}
 prepareReveal(){
  // Reveal complete framed works, ordered by distance from the wall inscription.
  const visible=(this.rendered||[]).filter(v=>!v.n.isLabel&&v.y+v.n.h>0&&v.y<this.viewport.clientHeight);
  visible.sort((a,b)=>Math.hypot(a.x+a.n.w/2-this.anchor.x,a.y+a.n.h/2-this.anchor.y)-Math.hypot(b.x+b.n.w/2-this.anchor.x,b.y+b.n.h/2-this.anchor.y));
  this.revealOrder=visible.map((v,i)=>({...v,start:1320+i*Math.min(155,1300/Math.max(1,visible.length-1))}));
 }
 entranceTick(t){
  this.entranceFrame=0;if(this.destroyed||this.stage.dataset.entrance!=='playing')return;
  if(this.entranceLast)this.entranceElapsed+=Math.min(t-this.entranceLast,80);this.entranceLast=t;const time=this.entranceElapsed;
  const ease=(start,end)=>{const p=Math.max(0,Math.min(1,(time-start)/(end-start)));return p*p*(3-2*p);};
  for(const [key,start,end] of [['floor',180,780],['person',260,900],['label',720,1380],['art',1280,1900],['reflection',1800,3060],['tools',2600,3200]])this.stage.style.setProperty('--entrance-'+key,ease(start,end).toFixed(4));
  for(const v of this.revealOrder||[])v.e.style.setProperty('--painting-opacity',ease(v.start,v.start+560).toFixed(4));
  if(time>=3200)this.finishEntrance();else this.entranceFrame=requestAnimationFrame(n=>this.entranceTick(n));
 }
 finishEntrance(){cancelAnimationFrame(this.entranceFrame);this.entranceFrame=0;this.stage.dataset.entrance='ready';this.viewport.inert=false;this.tools.inert=false;for(const key of ['floor','person','label','art','reflection','tools'])this.stage.style.removeProperty('--entrance-'+key);this.layer.querySelectorAll('.museum-frame').forEach(e=>e.style.removeProperty('--painting-opacity'));}
 departureGap(works,w,h){
  // A real clear point between frames, not a focal point through a painting.
  let best=null;
  const xs=[w/2],ys=[h/2];
  for(const v of works){xs.push(v.x-15,v.x+v.n.w+15);ys.push(v.y-15,v.y+v.n.h+15);}
  for(const x of xs)for(const y of ys){
   const clear=works.every(v=>x<v.x-5||x>v.x+v.n.w+5||y<v.y-5||y>v.y+v.n.h+5);
   const distance=Math.hypot(x-w/2,y-h/2);if(clear&&(!best||distance<best.distance))best={x,y,distance};
  }
  return best||{x:this.anchor.x,y:this.anchor.y};
 }
 startDeparture(){
  this.clearDeparture();this.stop();this.finishEntrance();this.viewport.inert=this.tools.inert=true;
  if(this.reduced.matches)return Promise.resolve(true);
  const w=this.viewport.clientWidth,h=this.viewport.clientHeight;
  const works=this.rendered.filter(v=>!v.n.isLabel&&v.x+v.n.w>0&&v.x<w&&v.y+v.n.h>0&&v.y<h);
  this.flightGap=this.departureGap(works,w,h);
  const scene=document.createElement('div');scene.className='museum-flight';scene.setAttribute('aria-hidden','true');scene.inert=true;
  const canvas=document.createElement('canvas');canvas.className='museum-flight-canvas';scene.append(canvas);this.stage.append(scene);this.flightScene=scene;this.flightCanvas=canvas;
  const resolution=Math.min(1.25,devicePixelRatio||1,1600/w);canvas.width=Math.round(w*resolution);canvas.height=Math.round((h+62)*resolution);
  const ctx=canvas.getContext('2d',{alpha:true});this.flightBuffers=[];
  const cards=works.map((v,i)=>{const img=v.e.querySelector('img'),texture=document.createElement('canvas'),ratio=Math.min(1,1100/Math.max(img.naturalWidth||1,img.naturalHeight||1));texture.width=Math.max(1,Math.round(img.naturalWidth*ratio));texture.height=Math.max(1,Math.round(img.naturalHeight*ratio));if(img.complete&&img.naturalWidth)texture.getContext('2d').drawImage(img,0,0,texture.width,texture.height);this.flightBuffers.push(texture);return {...v,texture,depth:85+((v.n.index*67+i*43)%210)};}).sort((a,b)=>a.depth-b.depth);
  this.flightDepths=cards.map(v=>v.depth);this.stage.dataset.departure='playing';this.departureElapsed=0;
  return new Promise(resolve=>{this.departureResolve=resolve;let last;
   const clamp=p=>Math.max(0,Math.min(1,p)),smooth=p=>(p=clamp(p))*p*(3-2*p);
   const step=t=>{if(this.destroyed)return;this.departureElapsed+=last?Math.min(100,t-last)*1.25:0;last=t;const time=this.departureElapsed;
    const lift=smooth(time/1000),progress=clamp((time-1000)/4200),travel=progress*progress;
    // One ray through the clear gap: lateral and forward travel have the same clock.
    // Reach the gap at its nearest artwork plane, rather than finishing XY early.
    const crossingDepth=900-Math.max(...this.flightDepths,85);
    const cz=930*travel,cx=(this.flightGap.x-w/2)*cz/crossingDepth,cy=(this.flightGap.y-h/2)*cz/crossingDepth;
    this.flightCamera={x:cx,y:cy,z:cz};this.flightCameraZ=cz;this.flightProgress=progress;
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.setTransform(resolution,0,0,resolution,0,62*resolution);this.flightVisible=0;
    // Project and crop source rectangles before drawing: one bounded raster, no giant DOM layers.
    cards.forEach(v=>{const z=v.depth*lift,remaining=900-z-cz;if(remaining<=15)return;const scale=900/remaining,left=w/2+(v.x-w/2-cx)*scale,top=h/2+(v.y-h/2-cy)*scale,pw=v.n.w*scale,ph=v.n.h*scale;
     if(left>w||left+pw<0||top>h||top+ph<-62)return;this.flightVisible++;
     paintMuseumFrame(ctx,left,top,pw,ph,scale);const rim=MUSEUM_FRAME_RIM*scale,ix=left+rim,iy=top+rim,iw=pw-2*rim,ih=ph-2*rim,dx=Math.max(0,ix),dy=Math.max(-62,iy),dw=Math.min(w,ix+iw)-dx,dh=Math.min(h,iy+ih)-dy;
     if(dw>0&&dh>0)ctx.drawImage(v.texture,(dx-ix)/iw*v.texture.width,(dy-iy)/ih*v.texture.height,dw/iw*v.texture.width,dh/ih*v.texture.height,dx,dy,dw,dh);
    });
    this.stage.style.setProperty('--departure-retreat',smooth((time-600)/1300));this.stage.style.setProperty('--departure-lift',lift);
    if(time>=5200||(time>2200&&this.flightVisible===0)){this.departureFrame=0;this.stage.dataset.departure='complete';this.departureResolve=null;resolve(true);}else this.departureFrame=requestAnimationFrame(step);
   };this.departureFrame=requestAnimationFrame(step);
  });
 }
 clearDeparture(){cancelAnimationFrame(this.departureFrame);this.departureFrame=0;this.departureResolve?.(false);this.departureResolve=null;this.flightScene?.remove();this.flightScene=null;this.flightCanvas=null;for(const buffer of this.flightBuffers||[])buffer.width=buffer.height=0;this.flightBuffers=[];delete this.stage.dataset.departure;this.stage.style.removeProperty('--departure-retreat');this.stage.style.removeProperty('--departure-lift');}
 compose(){
  const originals=this.nodes.filter(n=>!n.isLabel);this.label=this.nodes.find(n=>n.isLabel);this.layoutSeed=Math.floor(Math.random()*0x100000000);
  const random=this.randomLayout(),shuffle=values=>{const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  this.composition=[];
  // Three shuffled decks retain every original, each with independently varied dimensions.
  for(let deck=0;deck<3;deck++)for(const base of shuffle(originals)){
   const n=deck?{button:this.copy(base),index:base.index}:base;
   if(deck)this.nodes.push(n);
   n.area=65000+random()*150000;n.order=random();this.composition.push(n);
  }
 }
 randomLayout(){let seed=this.layoutSeed>>>0;return()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};}
 layout(pass=0){
  const width=this.viewport.clientWidth,height=this.viewport.clientHeight;if(!width||!height)return;
  const scale=Math.max(1060,width)/1440,gap=(width<600?42:58),rim=MUSEUM_FRAME_RIM*2,label=this.label,random=this.randomLayout();
  this.worldW=4800*scale*(1+pass*.1);this.worldH=3600*scale*(1+pass*.1);this.layoutGap=gap;
  let free=[{x:0,y:0,w:this.worldW,h:this.worldH}];const placed=[];
  const intersects=(a,b)=>a.x<b.x+b.w-.01&&a.x+a.w>b.x+.01&&a.y<b.y+b.h-.01&&a.y+a.h>b.y+.01;
  const carve=box=>{
   const next=[];
   for(const r of free){
    if(!intersects(r,box)){next.push(r);continue;}
    if(box.x>r.x)next.push({x:r.x,y:r.y,w:box.x-r.x,h:r.h});
    if(box.x+box.w<r.x+r.w)next.push({x:box.x+box.w,y:r.y,w:r.x+r.w-box.x-box.w,h:r.h});
    if(box.y>r.y)next.push({x:r.x,y:r.y,w:r.w,h:box.y-r.y});
    if(box.y+box.h<r.y+r.h)next.push({x:r.x,y:box.y+box.h,w:r.w,h:r.y+r.h-box.y-box.h});
   }
   free=next.filter((r,i)=>r.w>80*scale&&r.h>80*scale&&!next.some((q,j)=>j!==i&&q.x<=r.x&&q.y<=r.y&&q.x+q.w>=r.x+r.w&&q.y+q.h>=r.y+r.h&&(q.w*q.h>r.w*r.h||j<i)));
  };
  const place=(n,box)=>{n.bx=box.x+gap/2+(n.isLabel?0:(random()-.5)*gap*.26);n.by=box.y+gap/2+(n.isLabel?0:(random()-.5)*gap*.26);n.period=this.worldH;placed.push(n);carve(box);};
  label.w=280*scale;label.h=250*scale;place(label,{x:this.worldW*.46,y:this.worldH*.43,w:label.w+gap,h:label.h+gap});
  const nearSame=(n,x,y)=>placed.some(p=>{
   if(p.isLabel||p.index!==n.index)return false;
   // Check the torus seams too: repeated art must remain separated while dragging.
   for(const dx of [-this.worldW,0,this.worldW])for(const dy of [-this.worldH,0,this.worldH]){
    const distanceX=Math.max(p.bx+dx-(x+n.w),x-(p.bx+dx+p.w),0),distanceY=Math.max(p.by+dy-(y+n.h),y-(p.by+dy+p.h),0);
    if(Math.hypot(distanceX,distanceY)<Math.max(400*scale,gap*4))return true;
   }return false;
  });
  // Large works first create cavities, filled by smaller independently sized works.
  const order=[...this.composition].sort((a,b)=>b.area-a.area);
  for(const n of order){
   const item=this.items[n.index],ratio=item.width/item.height;
   let innerW=Math.sqrt(n.area*ratio)*scale,innerH=Math.sqrt(n.area/ratio)*scale;
   const limit=Math.min(1,800*scale/Math.max(innerW,innerH));innerW*=limit;innerH*=limit;
   let chosen;
   for(let attempt=0;attempt<3&&!chosen;attempt++){
    n.w=innerW+rim;n.h=innerH+rim;const candidates=[];
    for(const r of free){if(r.w<n.w+gap||r.h<n.h+gap)continue;
     for(const side of [0,1,2,3]){
      const x=r.x+(side%2?r.w-n.w-gap:0),y=r.y+(side>1?r.h-n.h-gap:0);
      if(nearSame(n,x+gap/2,y+gap/2))continue;
      const waste=r.w*r.h-(n.w+gap)*(n.h+gap);
      candidates.push({x,y,w:n.w+gap,h:n.h+gap,score:waste*(.72+random()*.56)+random()*80000*scale*scale});
     }
    }
    candidates.sort((a,b)=>a.score-b.score);chosen=candidates[0];
    if(!chosen){innerW*=.95;innerH*=.95;}
   }
   if(!chosen)return this.layout(pass+1);
   place(n,chosen);
  }
  // Fill leftover cavities after packing the main works; expanding the torus must not leave empty walls.
  this.fillNodes??=[];this.fillNodes.forEach(n=>n.inactive=true);let fillCount=0;
  for(let pass=0;pass<180;pass++){
   const cavities=free.filter(r=>r.w>180*scale&&r.h>180*scale&&r.w*r.h>50000*scale*scale).sort((a,b)=>b.w*b.h-a.w*a.h);
   let match;
   for(const r of cavities){
    const start=Math.floor(random()*this.items.length);
    for(let k=0;k<this.items.length;k++){
     const index=(start+k)%this.items.length,item=this.items[index],ratio=item.width/item.height;
     let h=Math.min(r.h-gap-rim,480*scale),w=h*ratio;
     if(w>r.w-gap-rim){w=r.w-gap-rim;h=w/ratio;}
     if(w>640*scale){h*=640*scale/w;w=640*scale;}
     if(w<70*scale||h<70*scale)continue;
     const n={index,w:w+rim,h:h+rim},box={x:r.x,y:r.y,w:w+rim+gap,h:h+rim+gap};
     if(nearSame(n,box.x+gap/2,box.y+gap/2))continue;
     match={n,box};break;
    }
    if(match)break;
   }
   if(!match)break;
   let n=this.fillNodes[fillCount];
   if(!n){const base=this.composition.find(v=>v.index===match.n.index);n={button:this.copy(base),index:match.n.index,isFill:true};this.fillNodes.push(n);this.nodes.push(n);}
   n.index=match.n.index;n.w=match.n.w;n.h=match.n.h;n.inactive=false;
   // Reusable supplemental slots may receive a different original after resize.
   for(const el of [n.button,...(n.copies||[])]){
    const item=this.items[n.index];el.dataset.index=n.index;el.setAttribute('aria-label','查看'+(item.caption||'画作 '+(n.index+1)));el.querySelector('img').alt=item.caption||'';
   }
   place(n,match.box);fillCount++;
  }
  this.remainingCavities=free.map(r=>({...r}));
  for(const n of this.nodes){
   if(n.inactive){[n.button,...(n.copies||[])].forEach(e=>e.style.display='none');continue;}
   const title=Math.min(48,Math.max(18,n.w*.07)),body=Math.min(18,Math.max(10,n.w*.036));
   for(const e of [n.button,...(n.copies||[])]){
    e.style.width=n.w+'px';e.style.height=n.h+'px';
    if(!n.isLabel){const img=e.querySelector('img'),item=this.items[n.index],src=n.w>600||n.h>760?item.src:item.thumb||item.src;if(img.getAttribute('src')!==src)img.src=src;}
    e.style.setProperty('--label-title',title+'px');e.style.setProperty('--label-body',body+'px');
   }
  }
  this.canvas.width=width;this.canvas.height=56;this.floorY=height-56;
  this.viewport.style.setProperty('--museum-overhang',(Math.ceil(Math.max(...this.nodes.map(n=>n.h)))+80)+'px');
  for(const e of [label.button,...(label.copies||[])]){e.style.setProperty('--label-title',Math.min(32,Math.max(24,label.w*.11))+'px');e.style.setProperty('--label-body',Math.min(14,Math.max(12,label.w*.05))+'px');}
  if(this.layoutWidth!==width||this.stage.dataset.entrance!=='ready'){this.resetComposition();this.layoutWidth=width;}
  this.paint();
 }
 copy(n){const e=n.button.cloneNode(true);e.setAttribute('aria-hidden','true');e.tabIndex=-1;e.dataset.repeat='true';if(n.isLabel){const h=e.querySelector('h1');if(h)h.outerHTML='<div class="museum-label-title">说来“画”长</div>';}else this.listen(e,'click',event=>{if(this.suppressClick){event.preventDefault();return;}openGallery(this.items,Number(e.dataset.index),e);});const img=e.querySelector('img');if(img)this.listen(img,'load',()=>this.paint());this.layer.append(e);return e;}
 paint(){if(!this.worldW||!this.worldH)return;const mod=(n,d)=>((n%d)+d)%d,w=this.viewport.clientWidth,h=this.viewport.clientHeight,c=this.ctx;if(c)c.clearRect(0,0,w,56);this.rendered=[];
  this.nodes.forEach(n=>{if(n.inactive)return;const bx=mod(n.bx+this.x,this.worldW),by=mod(n.by+this.y,n.period),positions=[];for(let x=bx-this.worldW;x<w;x+=this.worldW)for(let y=by-n.period;y<h;y+=n.period)if(x+n.w>0&&y+n.h>0)positions.push({x,y});n.copies??=[];
   while(n.copies.length<positions.length-1)n.copies.push(this.copy(n));const views=[n.button,...n.copies];views.forEach((e,i)=>{const p=positions[i];e.style.display=i===0||p?'block':'none';e.style.transform=p?`translate3d(${p.x.toFixed(2)}px,${p.y.toFixed(2)}px,0)`:'translate3d(-3000px,-3000px,0)';if(p)this.rendered.push({e,n,...p});});
   const img=n.button.querySelector('img');if(c&&img?.complete&&img.naturalWidth){c.save();c.setTransform(1,0,0,-.36,0,this.floorY*.36);positions.forEach(p=>{paintMuseumFrame(c,p.x,p.y,n.w,n.h);c.drawImage(img,p.x+MUSEUM_FRAME_RIM,p.y+MUSEUM_FRAME_RIM,n.w-MUSEUM_FRAME_RIM*2,n.h-MUSEUM_FRAME_RIM*2);});c.restore();}
  });
 }
 wake(){if(!this.frame){this.last=0;this.frame=requestAnimationFrame(t=>this.tick(t));}}
 tick(t){this.frame=0;if(this.destroyed)return;const dt=this.last?Math.min(t-this.last,40):16;this.last=t;if(!this.drag){if(this.reduced.matches)this.vx=this.vy=0;this.tx+=this.vx*dt;this.ty+=this.vy*dt;const decay=Math.exp(-dt/300);this.vx*=decay;this.vy*=decay;}const ease=this.reduced.matches?1:1-Math.exp(-dt/165);this.x+=(this.tx-this.x)*ease;this.y+=(this.ty-this.y)*ease;this.paint();if(Math.hypot(this.tx-this.x,this.ty-this.y)>.15||Math.hypot(this.vx,this.vy)>.002)this.frame=requestAnimationFrame(n=>this.tick(n));}
 stop(){cancelAnimationFrame(this.frame);this.frame=0;this.vx=this.vy=0;this.tx=this.x;this.ty=this.y;}
 destroy(){this.destroyed=true;this.stop();this.clearDeparture();cancelAnimationFrame(this.entranceFrame);delete this.viewport.museumWall;clearTimeout(this.clickTimer);this.resize.disconnect();this.visibility.disconnect();this.listeners.forEach(off=>off());}
}