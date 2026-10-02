/* Four depth planes of original photographs, clipped to a finite recycled viewport. */
function hangingPhotographyMarkup(){return `<div class="photo-hanging" data-photo-hanging><div class="photo-depths" tabindex="0" role="region" aria-label="悬挂摄影，按住左键左右拖动，或用左右方向键探索"></div><div class="photo-copy">${pageHeading('photography',E(intro.photography))}</div><a class="photo-wall-link" href="#/wall/photography">查看完整照片墙 ↗</a></div>`;}
class HangingPhotography {
 constructor(root,items,onOpen){
  this.root=root;this.viewport=root.querySelector('.photo-depths');this.items=items;this.onOpen=onOpen;this.offset=0;this.target=0;this.velocity=0;this.lift=0;this.liftTarget=0;this.listeners=[];this.frame=0;this.visible=false;this.motion=matchMedia('(prefers-reduced-motion: reduce)');root.photography=this;
  this.configs=[
   {name:'foreground',speed:1,size:178,spacing:300,rows:[{base:-.13,amp:.105,phase:-.9,waveFactor:1.15},{base:.5,amp:.035,phase:1.4,waveFactor:.9,centered:true},{base:.91,amp:.11,phase:3.6,waveFactor:.73}]},
   {name:'middle',speed:.6,size:122,spacing:232,rows:[{base:.22,amp:.12,phase:.9,waveFactor:.91},{base:.72,amp:.13,phase:3.8,waveFactor:1.13}]},
   {name:'far',speed:.3,size:76,spacing:155,rows:[{base:-.04,amp:.07,phase:.2},{base:.28,amp:.08,phase:2.3},{base:.52,amp:.075,phase:-.5},{base:.76,amp:.09,phase:4.5},{base:1.04,amp:.08,phase:1.7}]},
   {name:'distant',speed:.14,size:43,spacing:112,rows:Array.from({length:8},(_,i)=>({base:[.035,.17,.31,.45,.60,.73,.87,1.025][i],amp:.028+(i%3)*.012,phase:i*2.13+.4,waveFactor:.72+(i%4)*.23,speed:.16-i*.011}))}
  ];this.rows=[];
  this.configs.forEach((config,depth)=>{
   const layer=document.createElement('div');layer.className='photo-depth photo-depth-'+config.name;layer.dataset.depth=depth;layer.style.zIndex=4-depth;if(depth>1)layer.setAttribute('aria-hidden','true');this.viewport.append(layer);
   config.rows.forEach((shape,rowIndex)=>{const row={...config,...shape,depth,rowIndex,layer,cards:[]};row.element=document.createElement('div');row.element.className='photo-string';if(depth===3)row.element.style.zIndex=8-rowIndex;row.element.style.setProperty('--float-distance',(depth===0?34:depth===1?22:depth===2?12:6)+'px');row.element.style.setProperty('--row-parallax',row.speed);if(depth===3)row.element.style.setProperty('--distance-veil',(.84+rowIndex*.013).toFixed(3));row.element.style.animationDuration=(24+depth*4+rowIndex*2.1)+'s';row.element.style.animationDelay=(-depth*3-rowIndex*5)+'s';layer.append(row.element);const rope=document.createElementNS('http://www.w3.org/2000/svg','svg');rope.classList.add('photo-rope');rope.setAttribute('aria-hidden','true');rope.innerHTML='<path class="rope-shadow"/><path class="rope-body"/><path class="rope-fibre"/><path class="rope-light"/>';row.element.append(rope);row.rope=rope;this.rows.push(row);});
  });
  const listen=(el,event,fn,opts)=>{el.addEventListener(event,fn,opts);this.listeners.push(()=>el.removeEventListener(event,fn,opts));};
  listen(this.viewport,'pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;this.velocity=0;this.target=this.offset;this.drag={id:e.pointerId,x:e.clientX,y:e.clientY,start:this.offset,touch:e.pointerType!=='mouse',lastX:e.clientX,lastTime:performance.now(),moved:false};});
  listen(this.viewport,'pointermove',e=>{const d=this.drag;if(!d||d.id!==e.pointerId)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(!d.moved&&d.touch&&Math.abs(dy)>Math.abs(dx)+8){this.drag=null;return;}if(!d.moved&&(d.touch?Math.abs(dx):Math.hypot(dx,dy))>7){d.moved=true;this.viewport.setPointerCapture(e.pointerId);this.root.classList.add('is-dragging');}if(!d.moved)return;e.preventDefault();const now=performance.now();this.velocity=.5*this.velocity+.5*(e.clientX-d.lastX)/Math.max(8,now-d.lastTime);d.lastX=e.clientX;d.lastTime=now;this.target=d.start+dx;this.liftTarget=this.motion.matches?0:Math.max(-72,Math.min(72,dy*.55));this.suppressUntil=now+400;this.wake();},{passive:false});
  const release=e=>{if(this.drag?.id!==e.pointerId)return;const moved=this.drag.moved,stale=performance.now()-this.drag.lastTime>90;this.drag=null;this.liftTarget=0;this.root.classList.remove('is-dragging');if(this.viewport.hasPointerCapture(e.pointerId))this.viewport.releasePointerCapture(e.pointerId);if(moved){this.suppressUntil=performance.now()+400;if(stale||this.motion.matches)this.velocity=0;this.wake();}};
  listen(this.viewport,'pointerup',release);listen(this.viewport,'pointercancel',e=>{this.velocity=0;release(e);});listen(this.viewport,'lostpointercapture',e=>{if(e.target===this.viewport)release(e);});listen(this.viewport,'dragstart',e=>e.preventDefault());
  listen(this.viewport,'click',e=>{const card=e.target.closest('button.photo-print');if(!card||performance.now()<(this.suppressUntil||0))return;this.stop(true);this.root.style.setProperty('--photo-play-state','paused');this.onOpen(Number(card.dataset.photoIndex),card);});
  listen(this.viewport,'keydown',e=>{if(!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;e.preventDefault();e.stopPropagation();this.velocity=0;this.target=e.key==='Home'?this.homeOffset:this.target+(e.key==='ArrowRight'?-1:1)*this.width*.5;this.wake();});
  listen(window,'blur',()=>{this.blurred=true;this.stop();this.syncAtmosphere();});listen(window,'focus',()=>{this.blurred=false;this.syncAtmosphere();});listen(document,'visibilitychange',()=>{if(document.hidden)this.stop();this.syncAtmosphere();});listen(this.motion,'change',()=>{this.stop();this.paint();this.syncAtmosphere();});
  this.modal=new MutationObserver(()=>{if(document.body.classList.contains('modal-open'))this.stop(true);else if(Math.abs(this.lift)>.05)this.wake();this.syncAtmosphere();});this.modal.observe(document.body,{attributes:true,attributeFilter:['class']});
  this.observer=new IntersectionObserver(es=>{this.visible=es[0].isIntersecting;if(!this.visible)this.stop();this.syncAtmosphere();},{threshold:0,rootMargin:'400px 0px'});this.observer.observe(root);
  this.resize=new ResizeObserver(()=>this.measure());this.resize.observe(this.viewport);this.measure();this.entrance=new SectionEntrance(root,'photography');
 }
 measure(){
  this.stop();this.width=this.viewport.clientWidth;this.height=this.viewport.clientHeight;this.mobile=this.width<=700;
  for(const row of this.rows){row.cards.forEach(card=>{card.photoLayout=null;});row.size=row.depth===0?(this.mobile?116:Math.max(145,Math.min(194,this.width*.105))):row.depth===1?(this.mobile?80:114):row.depth===2?(this.mobile?44:62):(this.mobile?22:32)*(1-row.rowIndex*.043);row.gap=row.size*(row.depth===0?2.8:row.depth===1?2.9:row.depth===2?4.7:5.1+(row.rowIndex%3)*.45);row.wave=Math.max(2100,this.width*2.4)*(row.waveFactor||1);row.slotOffset=row.depth===3?row.gap*((row.rowIndex*.381)%1):0;row.paperX=row.depth===3?4:row.depth===2?6:12;row.paperY=row.depth===3?6:row.depth===2?8:16;row.hangGap=row.depth===3?2:row.depth===2?4:10;const count=Math.ceil(this.width/row.gap)+4;
   while(row.cards.length<count){const card=document.createElement(row.depth<2?'button':'span');card.className='photo-print';if(row.depth<2)card.type='button';else card.setAttribute('aria-hidden','true');card.innerHTML='<img draggable="false" decoding="async" alt=""><i class="photo-pin" aria-hidden="true"></i>';row.element.append(card);row.cards.push(card);}
   while(row.cards.length>count)row.cards.pop().remove();row.rope.setAttribute('viewBox','0 0 '+this.width+' '+this.height);row.rope.style.setProperty('--rope-width',row.depth===0?'5px':row.depth===1?'3px':row.depth===2?'1.3px':'.7px');
  }
  // Center the photograph bodies, not the rope. Calibrate at Home only so dragging stays steady.
  for(const row of this.rows){row.copyClearance=0;row.centerLift=0;if(!row.centered)continue;const centers=[];for(let slot=-1;slot<=Math.ceil(this.width/row.gap)+1;slot++){const p=this.photo(row,slot);if(p.world>=0&&p.world<=this.width)centers.push(this.y(row,p.world)+row.hangGap+(p.h+row.paperY)/2);}row.centerLift=centers.reduce((sum,y)=>sum+y,0)/Math.max(1,centers.length)-Math.min(this.height,innerHeight)/2;}
  // Reference crop: glass roofs, street scene and swans on the center rope.
  this.homeOffset=34395*this.rows[0].gap/(194*2.8);if(!this.hasMeasured){this.offset=this.target=this.homeOffset;this.hasMeasured=true;}this.protectHomeCopy();this.paint();this.bridgeDecor();
 }
 bridgeDecor(){

  const section=this.root.closest('[data-section]');this.bridgeLayers??=[];
  this.bridgeLayers.forEach(el=>el.remove());this.bridgeLayers=[];
  for(const [bridge,edge] of [[section.previousElementSibling,'before'],[section.nextElementSibling,'after']]){
   if(!bridge?.classList.contains('section-bridge'))continue;
   const decor=document.createElement('div');decor.className='photo-bridge-decor';decor.dataset.edge=edge;decor.dataset.sceneEntrance=this.root.dataset.sceneEntrance==='ready'?'ready':'waiting';decor.setAttribute('aria-hidden','true');bridge.append(decor);this.bridgeLayers.push(decor);
   const height=Math.min(innerHeight*1.8,2100),width=this.width;decor.style.height=height+'px';
   [.08,.32,.62,.94].forEach((distance,row)=>{
    const far=row<2,wrap=document.createElement('div');wrap.className='photo-bridge-string photo-depth-'+(far?'far':'distant');wrap.style.opacity=(.48*(1-distance)+.025).toFixed(3);decor.append(wrap);
    const y=edge==='before'?height*(1-distance):height*distance,amplitude=22+row*7,phase=row*1.4,curve=x=>y+Math.sin(x/Math.max(width,600)*3+phase)*amplitude;
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('photo-rope');svg.setAttribute('viewBox','0 0 '+width+' '+height);let d='';for(let x=-20;x<=width+40;x+=30)d+=(d?'L':'M')+x+' '+curve(x);svg.innerHTML='<path class="rope-body" d="'+d+'"/>';wrap.append(svg);
    const count=Math.max(2,Math.round(width/(far?240:340)*(1-distance*.5)));
    for(let i=0;i<count;i++){
     const item=this.items[(row*13+i*7+(edge==='before'?2:19))%this.items.length],x=(i+.4+(row%2)*.26)*width/count,ratio=item.width/item.height,size=(far?47:28)*(1-distance*.25),card=document.createElement('span');card.className='photo-print';const im=document.createElement('img');im.src=item.thumb||item.src;im.alt='';im.loading='lazy';card.append(im);card.style.cssText='width:'+(ratio>=1?size:size*ratio)+'px;height:'+(ratio>=1?size/ratio:size)+'px;transform:translate('+x+'px,'+(curve(x)+5)+'px) rotate('+((i%3-1)*3)+'deg)';wrap.append(card);
    }
   });
  }
  if(this.entrance){const state=this.root.dataset.sceneEntrance;this.entrance.reset();if(state==='ready')this.entrance.finish();else if(state==='playing'&&!this.entrance.navigationPending)this.entrance.play();}
 }
 protectHomeCopy(){
  const copy=this.root.querySelector('.photo-copy').getBoundingClientRect(),view=this.viewport.getBoundingClientRect();
  const left=copy.left-view.left,right=copy.right-view.left,top=copy.top-view.top,bottom=copy.bottom-view.top;
  for(const row of this.rows){
   row.copyClearance=0;if(row.depth>(this.mobile?2:1))continue;
   const shift=this.homeOffset*row.speed,first=Math.floor((-shift-row.gap)/row.gap),bounds=[];
   for(let slot=first;slot<first+row.cards.length;slot++){const p=this.photo(row,slot),x=p.world+shift,w=p.w+row.paperX,h=p.h+row.paperY;if(x+w/2+30<left||x-w/2-30>right)continue;const y=this.y(row,p.world)+row.hangGap;bounds.push({top:y-w*.05,bottom:y+h+w*.05});}
   if(!bounds.length)continue;
   const min=Math.min(...bounds.map(b=>b.top)),max=Math.max(...bounds.map(b=>b.bottom)),clearance=row.depth===0?48:36;
   if(min<bottom+clearance&&max>top-clearance){const above=row.depth===0&&row.rowIndex===0||this.mobile&&(row.depth===1&&row.rowIndex===0||row.depth===2&&row.rowIndex<2);row.copyClearance=above?Math.min(0,top-clearance-max):Math.max(0,bottom+clearance-min);}
  }
 }
 resetHome(){
  this.stop();this.offset=this.target=this.homeOffset||0;this.suppressUntil=0;
  this.root.style.setProperty('--photo-play-state','paused');
  for(const a of this.root.getAnimations({subtree:true}))if(a.animationName==='photo-string-breathe')a.currentTime=0;
  this.paint();
 }
 y(row,world){const base=this.mobile?(row.depth===1?(row.rowIndex===0?.065:.67):row.depth===2?[-.02,.14,.56,.78,1.02][row.rowIndex]:row.depth===3?(row.rowIndex<3?.025+row.rowIndex*.032:.5+(row.rowIndex-3)*.09):row.base):row.base;const height=row.centered?Math.min(this.height,innerHeight):this.height,anchor=row.centered?Math.sin(this.width*.5/row.wave*Math.PI*2+row.phase):0;return (row.copyClearance||0)+base*height-(row.centerLift||0)+(Math.sin(world/row.wave*Math.PI*2+row.phase)-anchor)*row.amp*this.height*(this.mobile?.5:1);}
 photo(row,slot){const mod=(x,n)=>(x%n+n)%n,index=mod(slot*7+row.depth*11+row.rowIndex*19,this.items.length),item=this.items[index],ratio=item.width/item.height,seed=Math.sin(slot*127.1+row.depth*311.7+row.rowIndex*74.7)*43758.5453,scale=1+seed-Math.floor(seed),size=row.size*scale;return {index,item,scale,w:ratio>=1?size:size*ratio,h:ratio>=1?size/ratio:size,world:slot*row.gap+row.slotOffset+Math.sin(slot*2.17+row.depth)*row.gap*.12};}
 paint(){
  if(!this.width)return;const mod=(x,n)=>(x%n+n)%n,copy=this.root.querySelector('.photo-copy').getBoundingClientRect(),vr=this.viewport.getBoundingClientRect();
  for(const row of this.rows){const shift=this.offset*row.speed;let path='';for(let x=-40;x<=this.width+64;x+=32)path+=(path?'L':'M')+x.toFixed(1)+' '+this.y(row,x-shift).toFixed(1);row.rope.querySelectorAll('path').forEach(p=>p.setAttribute('d',path));
   const first=Math.floor((-shift-row.gap-row.slotOffset)/row.gap);row.cards.forEach((card,i)=>{const slot=first+mod(i-first,row.cards.length);if(!card.photoLayout||card.photoLayout.slot!==slot)card.photoLayout={slot,...this.photo(row,slot)};const {world,index,item,scale,w,h}=card.photoLayout,x=world+shift,y=this.y(row,world);card.dataset.size=scale.toFixed(4);
    if(card.dataset.photoIndex!==String(index)){card.dataset.photoIndex=index;const img=card.querySelector('img');img.src=item.thumb||item.src;img.width=item.width;img.height=item.height;if(row.depth<2){img.alt=item.caption||'';card.setAttribute('aria-label','查看'+(item.caption?'《'+item.caption+'》':'摄影 '+String(index+1).padStart(2,'0')));} }
    card.style.width=(w+row.paperX)+'px';card.style.height=(h+row.paperY)+'px';card.style.transform='translate3d('+(x-(w+row.paperX)/2).toFixed(2)+'px,'+(y+row.hangGap).toFixed(2)+'px,0) rotate('+(Math.sin(slot*4.13+row.depth)*4).toFixed(2)+'deg)';
    const covered=x>copy.left-vr.left-15&&x<copy.right-vr.left+15&&y+h*.5>copy.top-vr.top-10&&y+h*.5<copy.bottom-vr.top+10,visible=x-w/2>4&&x+w/2<this.width-4&&y>0&&y+h<this.height-70;
    if(row.depth<2){card.tabIndex=visible&&!covered?0:-1;card.style.pointerEvents=covered?'none':'';}
   });
  }this.viewport.dataset.position=this.offset.toFixed(2);
 }
 syncAtmosphere(){this.root.style.setProperty('--photo-play-state',this.visible&&this.root.dataset.sceneEntrance==='ready'&&!document.hidden&&!this.blurred&&!this.motion.matches&&!document.body.classList.contains('modal-open')?'running':'paused');}
 wake(){if(this.motion.matches){this.offset=this.target;this.lift=0;this.viewport.style.setProperty('--photo-drag-y','0px');this.paint();return;}if(document.body.classList.contains('site-editor-active')||this.frame||!this.visible||document.hidden||document.body.classList.contains('modal-open'))return;this.previous=0;const tick=t=>{if(document.body.classList.contains('site-editor-active')){this.stop(true);return;}const dt=this.previous?Math.min(32,t-this.previous):16;this.previous=t;if(!this.drag){this.target+=this.velocity*dt;this.velocity*=Math.exp(-dt/180);}this.offset+=(this.target-this.offset)*(1-Math.exp(-dt/65));this.lift+=(this.liftTarget-this.lift)*(1-Math.exp(-dt/160));this.viewport.style.setProperty('--photo-drag-y',this.lift.toFixed(3)+'px');this.paint();if(Math.abs(this.target-this.offset)>.12||Math.abs(this.velocity)>.005||Math.abs(this.liftTarget-this.lift)>.05)this.frame=requestAnimationFrame(tick);else{this.frame=0;this.offset=this.target;this.paint();}};this.frame=requestAnimationFrame(tick);}
 stop(preservePose=false){cancelAnimationFrame(this.frame);this.frame=0;this.velocity=0;this.liftTarget=0;if(!preservePose){this.lift=0;this.viewport.style.setProperty('--photo-drag-y','0px');}this.target=this.offset;const drag=this.drag;this.drag=null;if(drag&&this.viewport.hasPointerCapture(drag.id))this.viewport.releasePointerCapture(drag.id);this.root.classList.remove('is-dragging');}
 destroy(){this.bridgeLayers?.forEach(el=>el.remove());this.stop();this.entrance.destroy();this.resize.disconnect();this.observer.disconnect();this.modal.disconnect();this.listeners.forEach(off=>off());delete this.root.photography;}
}
