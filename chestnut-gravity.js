class ChestnutGravity {
 constructor(root){
  this.root=root;this.section=root.closest('[data-section]');this.host=root.querySelector('.chestnut-canvas');this.listeners=[];this.destroyed=false;this.visible=false;this.paused=false;
  const on=(el,type,fn,opts)=>{el.addEventListener(type,fn,opts);this.listeners.push(()=>el.removeEventListener(type,fn,opts));};
  this.observer=new IntersectionObserver(es=>{const was=this.visible;this.visible=es[0].isIntersecting;if(!this.visible&&this.scene)this.root.dataset.status='waiting';if(this.visible&&this.scene&&!was){this.root.dataset.status='ready';this.scene.resetEntrance();}if(this.visible)this.load();this.scene?.setActive(this.visible&&!this.dialog.open);},{rootMargin:'150px 0px'});this.observer.observe(root);
  this.dialog=root.querySelector('.chestnut-message');const toggle=root.querySelector('[data-chestnut-message]');
  on(toggle,'click',()=>{this.dialog.showModal();this.scene?.setActive(false);});
  on(root.querySelector('[data-chestnut-close]'),'click',()=>this.dialog.close());
  on(this.dialog,'click',e=>{if(e.target===this.dialog){const r=this.dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)this.dialog.close();}});
  on(this.dialog,'close',()=>{this.scene?.setActive(this.visible);toggle.focus({preventScroll:true});});
  const pause=root.querySelector('[data-chestnut-pause]');on(pause,'click',()=>{this.paused=!this.paused;pause.textContent=this.paused?'继续流动':'暂停流动';pause.setAttribute('aria-pressed',String(this.paused));this.scene?.pause(this.paused);});
  on(root.querySelector('[data-chestnut-home]'),'click',()=>this.scene?.shift(0,0));
  on(window,'scroll',()=>this.progress(),{passive:true});
  on(this.host,'chestnut-error',()=>this.fallback());
  on(matchMedia('(prefers-reduced-motion: reduce)'),'change',()=>this.scene?.setActive(this.visible));
 }
 progress(){if(!this.scene)return;const r=this.section.getBoundingClientRect();this.scene.setProgress(-r.top/Math.max(1,r.height-innerHeight));}
 async load(){if(this.loading||this.scene||this.destroyed)return;this.loading=true;let model,cleanup;try{const [reference,modelModule]=await Promise.all([import('./chestnut-reference-scene.js'),import('./chestnut-model.js')]);if(this.destroyed)return;await reference.prepareGravityScene();model=await modelModule.loadChestnutModel(this.host);if(this.destroyed){model.destroy();return;}const opts={active:this.visible,paused:this.paused,initialX:innerWidth<700?0:.36,initialY:innerWidth<700?.18:0,progress:()=>0,onFrame:state=>model.draw(state)};cleanup=reference.createGravityScene(this.host,()=>{if(!this.destroyed)this.root.dataset.status='ready';},()=>this.fallback(),opts);this.scene={resetEntrance:()=>opts.resetEntrance?.(),setActive:v=>opts.setActive?.(v),setProgress:()=>{},move:()=>{},shift:(x,y)=>{if(x===0&&y===0)opts.reset?.();else opts.shift?.(x*.08,y*.08);},getOffset:()=>({x:0,y:0}),pulse:()=>opts.pulse?.(),pause:v=>{opts.paused=v;},destroy:()=>{cleanup?.();model.destroy();}};this.scene.setActive(this.visible&&!this.dialog.open);}catch(e){cleanup?.();model?.destroy();console.warn('栗子空间使用兼容显示',e);this.fallback();}}
 fallback(){this.scene?.destroy();this.scene=null;this.root.dataset.status='fallback';this.root.querySelector('[data-chestnut-handle]').hidden=true;this.root.querySelector('[data-chestnut-pause]').hidden=true;this.root.querySelector('[data-chestnut-home]').hidden=true;}
 destroy(){this.destroyed=true;this.observer.disconnect();this.listeners.forEach(f=>f());this.scene?.destroy();if(this.dialog.open)this.dialog.close();}
}
