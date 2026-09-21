/* Eight original works as independently drifting, connected image stars. */
class ConstellationWall {
 constructor(wall,items,order,onOpen){
  this.wall=wall;this.items=items;this.onOpen=onOpen;this.viewport=wall.querySelector('.flow-viewport');this.layer=wall.querySelector('.flow-field');this.toggle=wall.querySelector('.flow-toggle');this.listeners=[];this.nodes=[];this.time=0;this.frame=0;this.visible=false;this.entranceTime=0;this.section=wall.closest("[data-section]");
  this.motion=matchMedia('(prefers-reduced-motion: reduce)');this.manualPause=this.motion.matches;wall.constellation=this;
  this.stars=Array.from({length:280},()=>({x:Math.random(),y:Math.random(),radius:.35+Math.pow(Math.random(),3)*1.1,alpha:.13+Math.random()*.4}));
  wall.classList.add('constellation-wall');wall.setAttribute('aria-label','万艺殿星群作品');
  this.canvas=document.createElement('canvas');this.canvas.className='constellation-lines';this.canvas.setAttribute('aria-hidden','true');this.viewport.prepend(this.canvas);this.ctx=this.canvas.getContext('2d');
  this.sky=document.createElement('canvas');this.sky.className='constellation-stars';this.sky.setAttribute('aria-hidden','true');this.viewport.prepend(this.sky);
  items.forEach((item,i)=>{
   const shell=document.createElement('div');shell.className='star-node';
   const button=document.createElement('button');button.className='star-card';button.dataset.gallery='pantheon';button.dataset.index=i;button.setAttribute('aria-label','查看'+(item.caption||'作品 '+(i+1)));
   const image=document.createElement('img');image.src=item.thumb||item.src;image.alt=item.caption||'';image.draggable=false;image.decoding='async';
   const label=document.createElement('span');label.className='star-caption';label.textContent=item.caption||String(i+1).padStart(2,'0');button.append(image,label);shell.append(button);this.layer.append(shell);
   const theta=(i*2.39996+.5);const node={shell,button,index:i,x:0,y:0,vx:Math.cos(theta)*9,vy:Math.sin(theta)*8,phase:i*1.73,w:0,h:0};this.nodes.push(node);
   this.listen(button,'pointerenter',e=>{if(e.pointerType==='mouse')this.hold(node);});
   this.listen(button,'pointerleave',e=>{if(e.pointerType==='mouse'&&!button.matches(':focus-visible'))this.release(node);});
   this.listen(button,'focus',()=>{if(button.matches(':focus-visible'))this.hold(node);});
   this.listen(button,'blur',()=>this.release(node));
   this.listen(button,'click',()=>{this.hold(node);this.onOpen(i,button);});
   // Periodic visual copies preserve a continuous image across the horizontal seam.
   // Only the original is in the accessibility tree and keyboard sequence.
   node.copies=[-1,1].map(shift=>{
    const copy=shell.cloneNode(true),target=copy.querySelector('button');copy.classList.add('star-copy');copy.setAttribute('aria-hidden','true');target.tabIndex=-1;target.removeAttribute('data-gallery');target.removeAttribute('data-index');this.layer.append(copy);
    this.listen(target,'pointerenter',e=>{if(e.pointerType==='mouse')this.hold(node);});
    this.listen(target,'pointerleave',e=>{if(e.pointerType==='mouse'&&!button.matches(':focus-visible'))this.release(node);});
    this.listen(target,'blur',()=>this.release(node));
    this.listen(target,'click',()=>{this.hold(node);this.onOpen(i,target);});
    return {shell:copy,button:target,shift};
   });
  });
  this.listen(this.toggle,'click',()=>{this.manualPause=!this.manualPause;this.update();});
  this.listen(this.motion,'change',()=>{this.manualPause=this.motion.matches;this.paint();this.update();});
  this.listen(document,'visibilitychange',()=>this.update());
  this.resize=new ResizeObserver(()=>this.layout());this.resize.observe(this.viewport);
  this.intersection=new IntersectionObserver(entries=>{const e=entries[0];this.visible=e.isIntersecting;if(!this.visible){this.entranceTime=0;this.entranceStarted=false;}if(e.intersectionRatio>=.5)this.entranceStarted=true;this.paint();this.update();},{threshold:[0,.5]});this.intersection.observe(wall);
  this.mutation=new MutationObserver(()=>this.update());this.mutation.observe(document.body,{attributes:true,attributeFilter:['class']});
  this.layout();
 }
 listen(target,event,fn){target.addEventListener(event,fn);this.listeners.push(()=>target.removeEventListener(event,fn));}
 layout(){
  const w=this.viewport.clientWidth,h=this.viewport.clientHeight;if(!w||!h||w===this.width&&h===this.height)return;
  const oldW=this.width,oldH=this.height;this.width=w;this.height=h;
  const dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(w*dpr);this.canvas.height=Math.round(h*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);
  this.sky.width=Math.round(w*dpr);this.sky.height=Math.round(h*dpr);const sky=this.sky.getContext('2d');sky.setTransform(dpr,0,0,dpr,0,0);
  for(const star of this.stars.slice(0,Math.max(65,Math.min(280,Math.round(w*h/11500))))){sky.fillStyle=`rgba(205,220,249,${star.alpha})`;sky.beginPath();sky.arc(star.x*w,star.y*h,star.radius,0,Math.PI*2);sky.fill();}
  const mobile=w<550;
  // Loosely scattered seeds, followed by continuous free movement, not a looped grid.
  const seeds=mobile?[[.23,.13],[.69,.19],[.4,.35],[.76,.46],[.2,.55],[.51,.67],[.22,.83],[.77,.85]]:[[.14,.27],[.4,.17],[.67,.25],[.85,.48],[.58,.51],[.3,.53],[.14,.8],[.65,.82]];
  this.nodes.forEach((n,i)=>{
   n.w=mobile?64+(i%3)*5:86+(i%3)*9;n.h=Math.max(44,n.w*Math.min(.85,Math.max(.48,this.items[i].height/this.items[i].width)));
   n.shell.style.width=n.w+'px';n.shell.style.height=n.h+'px';
   n.x=oldW?n.x/oldW*w:seeds[i%seeds.length][0]*w;n.y=oldH?n.y/oldH*h:seeds[i%seeds.length][1]*h;
   n.scale=mobile?1.75:2.15;n.button.style.setProperty('--star-scale',n.scale);
   n.copies.forEach(c=>{c.shell.style.width=n.w+'px';c.shell.style.height=n.h+'px';c.button.style.setProperty('--star-scale',n.scale);});
   this.bound(n);
  });
  this.paint();this.update();
 }
 bound(n){const my=n.h*n.scale/2+48;n.x=((n.x%this.width)+this.width)%this.width;n.y=Math.max(my,Math.min(this.height-my,n.y));}
 deltaX(a,b){let dx=a-b;return dx-Math.round(dx/this.width)*this.width;}
 hold(n){if(this.selected===n)return;if(this.selected)this.selected.shell.classList.remove('is-selected');this.selected=n;n.shell.classList.add('is-selected');this.paint();}
 release(n){if(this.selected!==n)return;n.shell.classList.remove('is-selected');this.selected=null;this.paint();}
 update(){
  if(this.destroyed)return;
  this.stopped=(this.manualPause&&this.entranceTime>=9.4)||this.motion.matches||!this.visible||document.hidden||document.body.classList.contains('modal-open');
  this.wall.dataset.motion=this.stopped?'paused':'running';this.toggle.disabled=this.motion.matches;this.toggle.textContent=this.motion.matches?'已减少动态':this.manualPause?'继续漂浮 ▷':'暂停漂浮 Ⅱ';this.toggle.setAttribute('aria-pressed',String(this.manualPause||this.motion.matches));
  if(!this.stopped&&!this.frame){this.previous=0;this.frame=requestAnimationFrame(t=>this.tick(t));}
  if(this.stopped){cancelAnimationFrame(this.frame);this.frame=0;}
 }
 tick(t){
  this.frame=0;if(this.destroyed)return;
  if(this.motion.matches||document.hidden){this.update();return;}
  const dt=this.previous?Math.min((t-this.previous)/1000,.04):0;this.previous=t;this.time+=dt;if(this.entranceStarted)this.entranceTime+=dt;
  for(const n of this.nodes){
   if(n===this.selected||this.manualPause)continue;
   n.vx+=Math.sin(this.time*.23+n.phase)*dt*1.6;n.vy+=Math.cos(this.time*.19+n.phase)*dt*1.6;
   for(const other of this.nodes){
    if(other===n)continue;const dx=this.deltaX(n.x,other.x),dy=n.y-other.y,d=Math.hypot(dx,dy)||1;
    const gap=(n.w+other.w*(other===this.selected?other.scale:1))*.52+18;
    if(d<gap){const force=(1-d/gap)*23;n.vx+=dx/d*force*dt;n.vy+=dy/d*force*dt;}
   }
   const speed=Math.hypot(n.vx,n.vy);if(speed>13){n.vx*=13/speed;n.vy*=13/speed;}
   const my=n.h*n.scale/2+48;
   if(n.y<my+30)n.vy+=dt*8;if(n.y>this.height-my-30)n.vy-=dt*8;
   n.x+=n.vx*dt;n.y+=n.vy*dt;this.bound(n);
  }
  this.paint();if(this.manualPause&&this.entranceTime>=9.4)this.stopped=true;if(!this.stopped)this.frame=requestAnimationFrame(next=>this.tick(next));
 }
 paint(){
  if(!this.ctx||!this.width)return;const ctx=this.ctx;ctx.clearRect(0,0,this.width,this.height);
  const t=this.motion.matches?20:this.entranceTime;
  const ease=(a,b)=>{const p=Math.max(0,Math.min(1,(t-a)/(b-a)));return p*p*(3-2*p);};
  this.section?.style.setProperty('--pantheon-title',ease(.15,1.35));
  const linkProgress=ease(5.9,7.8),finish=ease(7.9,9.4);
  this.wall.dataset.entrance=t>=9.4?'ready':t<1.4?'title':t<5.9?'pictures':t<7.9?'lines':'stars';
  this.sky.style.opacity=finish;this.wall.style.setProperty("--pantheon-stars",finish);
  for(const el of this.wall.querySelectorAll('.flow-bottom,.flow-wall-link')){el.style.opacity=finish;el.inert=finish<.1;}
  for(const n of this.nodes){const opacity=ease(1.4+n.index*.43,2.8+n.index*.43);for(const el of [n.shell,...n.copies.map(c=>c.shell)]){el.style.opacity=opacity;el.inert=opacity<.3;}}
  // Draw connections outward only after the individual images arrive.
  const edges=new Set();
  this.nodes.forEach(n=>{
   const nearest=this.nodes.filter(o=>o!==n).sort((a,b)=>Math.hypot(this.deltaX(a.x,n.x),a.y-n.y)-Math.hypot(this.deltaX(b.x,n.x),b.y-n.y)).slice(0,3);
   nearest.forEach(o=>{const key=[n.index,o.index].sort().join('-');if(edges.has(key))return;edges.add(key);
    const dx=this.deltaX(o.x,n.x),d=Math.hypot(dx,n.y-o.y),reach=Math.max(this.width*.53,240);if(d>reach)return;
    const bright=n===this.selected||o===this.selected;ctx.strokeStyle='rgba(172,198,239,'+((bright?.76:.48)*Math.max(0,1-d/reach)).toFixed(3)+')';ctx.lineWidth=bright?2:1.35;
    for(const shift of [-this.width,0,this.width]){ctx.beginPath();ctx.moveTo(n.x+shift,n.y);ctx.lineTo(n.x+dx*linkProgress+shift,n.y+(o.y-n.y)*linkProgress);ctx.stroke();}
   });
   n.shell.style.transform=`translate3d(${(n.x-n.w/2).toFixed(3)}px,${(n.y-n.h/2).toFixed(3)}px,0)`;
   n.copies.forEach(c=>{c.shell.classList.toggle('is-selected',n===this.selected);c.shell.style.transform=`translate3d(${(n.x+c.shift*this.width-n.w/2).toFixed(3)}px,${(n.y-n.h/2).toFixed(3)}px,0)`;});
  });
 }
 destroy(){this.destroyed=true;delete this.wall.constellation;cancelAnimationFrame(this.frame);this.resize.disconnect();this.intersection.disconnect();this.mutation.disconnect();this.listeners.forEach(off=>off());}
}
