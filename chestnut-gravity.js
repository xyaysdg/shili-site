class ChestnutGravity {
 constructor(root){
  this.root=root;this.section=root.closest('[data-section]');this.host=root.querySelector('.chestnut-canvas');this.friendLink=root.querySelector('[data-chestnut-friend]');this.listeners=[];this.destroyed=false;this.visible=false;this.paused=false;
  const on=(el,type,fn,opts)=>{el.addEventListener(type,fn,opts);this.listeners.push(()=>el.removeEventListener(type,fn,opts));};
  on(document,'shili-editor-motion',e=>this.scene?.setActive(this.visible&&!this.dialog.open&&!e.detail.paused));
  this.observer=new IntersectionObserver(es=>{const was=this.visible;this.visible=es[0].isIntersecting;if(!this.visible){this.friendLink.dataset.revealed='false';this.friendLink.tabIndex=-1;if(this.scene)this.root.dataset.status='waiting';}if(this.visible&&this.scene&&!was){this.scene.resetEntrance();this.root.dataset.status='ready';}if(this.visible)this.load();this.scene?.setActive(this.visible&&!this.dialog.open);},{rootMargin:'150px 0px'});this.observer.observe(root);
  this.dialog=root.querySelector('.chestnut-message');const toggle=root.querySelector('[data-chestnut-message]');
  on(toggle,'click',()=>{this.dialog.showModal();this.scene?.setActive(false);});
  on(root.querySelector('[data-chestnut-close]'),'click',()=>this.dialog.close());
  on(this.dialog,'click',e=>{if(e.target===this.dialog){const r=this.dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)this.dialog.close();}});
  on(this.dialog,'close',()=>{this.scene?.setActive(this.visible);toggle.focus({preventScroll:true});});
  const pause=root.querySelector('[data-chestnut-pause]');on(pause,'click',()=>{this.paused=!this.paused;pause.textContent=this.paused?'继续流动':'暂停流动';pause.setAttribute('aria-pressed',String(this.paused));this.scene?.pause(this.paused);});
  this.home=root.querySelector('[data-chestnut-home]');this.homeLabel=this.home.textContent;on(this.home,'click',()=>{if(this.root.dataset.status==='fallback')this.load(true);else this.scene?.shift(0,0);});
  on(this.host,'chestnut-error',()=>this.fallback());
  on(matchMedia('(prefers-reduced-motion: reduce)'),'change',()=>this.scene?.setActive(this.visible&&!this.dialog.open));
 }
 updateFriend({handle,entrance=0,reduced=false},opts){
  if(!handle)return;const x=(opts.initialX+1)*.5,y=(1-opts.initialY)*.5,diameter=parseFloat(handle.style.width)||0;
  const dx=(parseFloat(handle.style.left)/100-x)*this.host.clientWidth,dy=(parseFloat(handle.style.top)/100-y)*this.host.clientHeight;
  const ready=reduced||entrance>=3.7,width=Math.min(190,diameter*.52);const style=this.friendLink.style;
  const left=(x*100)+'%',top=(y*100)+'%',w=width+'px',font=Math.max(10,Math.min(17,width/11.5))+'px';
  if(style.left!==left)style.left=left;if(style.top!==top)style.top=top;if(style.width!==w)style.width=w;if(style.fontSize!==font)style.fontSize=font;
  const revealed=String(ready&&Math.hypot(dx,dy)>diameter*.48),tabIndex=ready?0:-1;
  if(this.friendLink.dataset.revealed!==revealed)this.friendLink.dataset.revealed=revealed;if(this.friendLink.tabIndex!==tabIndex)this.friendLink.tabIndex=tabIndex;
 }
 progress(){} // Fixed-camera scene: scrolling does not change scene progress.
 async load(retry=false){if(this.loading||this.scene||this.destroyed||(!retry&&this.root.dataset.status==='fallback'))return;this.loading=true;this.loadFailed=false;this.home.disabled=true;let model,cleanup,released=false;const release=()=>{if(released)return;released=true;model?.destroy();cleanup?.();};try{const [reference,modelModule]=await Promise.all([import('./chestnut-reference-scene.js'),import('./chestnut-model.js')]);if(this.destroyed)return;await reference.prepareGravityScene();if(this.destroyed)return;model=await modelModule.loadChestnutModel(this.host);if(this.destroyed){release();return;}const stage=this.root,host=this.host;const opts={model,active:this.visible,paused:this.paused,get initialX(){return innerWidth<700?0:.2889;},get initialY(){return (innerWidth<700?.18:.0570)*stage.clientHeight/host.clientHeight;},progress:()=>0,onFrame:state=>{model.draw(state);this.updateFriend(state,opts);}};cleanup=reference.createGravityScene(this.host,()=>{if(!this.destroyed)this.root.dataset.status='ready';},()=>this.fallback(),opts);if(this.loadFailed||this.destroyed){release();return;}this.root.querySelector('[data-chestnut-handle]').hidden=false;this.root.querySelector('[data-chestnut-pause]').hidden=false;this.home.textContent=this.homeLabel;this.home.hidden=false;this.friendLink.dataset.revealed='false';this.friendLink.tabIndex=-1;this.scene={resetEntrance:()=>{this.friendLink.dataset.revealed='false';this.friendLink.tabIndex=-1;opts.resetEntrance?.();},setActive:v=>{const editing=document.body.classList.contains('site-editor-active');opts.setActive?.(v&&!editing);if(v&&editing)opts.drawStill?.();},setProgress:()=>{},move:()=>{},shift:(x,y)=>{if(x===0&&y===0)opts.reset?.();else opts.shift?.(x*.08,y*.08);},getOffset:()=>({x:0,y:0}),pulse:()=>opts.pulse?.(),pause:v=>{opts.paused=v;opts.invalidate?.();},destroy:release};this.scene.setActive(this.visible&&!this.dialog.open);}catch(e){release();if(this.destroyed)return;console.warn('栗子空间使用兼容显示',e);this.fallback();}finally{this.loading=false;this.home.disabled=false;}}
 fallback(){this.loadFailed=true;const scene=this.scene;this.scene=null;scene?.destroy();this.root.dataset.status='fallback';this.friendLink.dataset.revealed='true';this.friendLink.tabIndex=0;this.root.querySelector('[data-chestnut-handle]').hidden=true;this.root.querySelector('[data-chestnut-pause]').hidden=true;this.home.hidden=false;this.home.textContent='重新加载';}
 destroy(){this.destroyed=true;this.observer.disconnect();this.listeners.forEach(f=>f());this.scene?.destroy();if(this.dialog.open)this.dialog.close();}
}
