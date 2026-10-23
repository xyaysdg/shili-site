/* Absolute 22-minute timeline; reload releases scene memory, preserves saved drafts. */
(()=>{
 const MUSIC=1223,STOP=1310,WHITE=1308,BLACK=1314,RELOAD=1316,END=1320;
 const audio=new Audio('assets/solar-destruction.mp3');audio.preload='metadata';audio.volume=.65;
 const button=document.createElement('button');button.type='button';button.className='solar-test';button.textContent='音乐启动';button.title='跳到20分22秒；再次点击跳到21分48秒';
 const notice=document.createElement('span');notice.className='solar-notice';notice.setAttribute('role','status');
 const veil=document.createElement('dialog');veil.className='solar-veil';veil.setAttribute('aria-label','本轮结束，即将返回首页');veil.addEventListener('cancel',e=>e.preventDefault());document.body.append(button,notice,veil);
 let origin=Date.now(),step=0,timer=0,disposed=false,started=false,stopped=false,covered=false,reloading=false,token=0,returning=false,suspended=false,resumeReveal=null;
 const elapsed=()=>Math.max(0,(Date.now()-origin)/1000);
 audio.addEventListener('loadedmetadata',()=>{if(Number.isFinite(audio.duration)&&audio.duration>0)audio.playbackRate=audio.duration/(STOP-MUSIC);});
 function play(t){started=true;const job=++token;audio.muted=false;try{audio.currentTime=Math.max(0,(t-MUSIC)*audio.playbackRate);}catch{}window.shiliRecordPlayer?.pause();audio.play().then(()=>{if(job!==token)return;if(disposed||suspended||stopped)audio.pause();}).catch(()=>{if(job===token&&!disposed&&!suspended)notice.textContent='浏览器限制了自动播放，本轮音乐未能播放。';});}
 function reset(){if(reloading)return;reloading=true;try{sessionStorage.setItem('shili-solar-return',String(origin+END*1000));}catch{}const url=new URL(location.href);url.hash='/home';history.replaceState(null,'',url.href);location.reload();}
 function tick(){
  if(disposed||suspended||returning||reloading)return;clearTimeout(timer);const t=elapsed();
  if(t>=STOP&&!stopped){stopped=true;++token;audio.pause();}else if(t>=MUSIC&&t<STOP&&!started)play(t);
  if(t>=WHITE&&!document.hidden){
   if(!covered){covered=true;button.disabled=true;notice.textContent='';veil.showModal();}
   const smooth=x=>{x=Math.min(1,Math.max(0,x));return x*x*(3-2*x);};
   veil.style.opacity='1';
   if(t<BLACK){const a=smooth((t-WHITE)/(BLACK-WHITE));veil.style.backgroundColor=`rgba(255,255,255,${a})`;veil.style.backdropFilter=`blur(${16*a}px)`;}
   else{const c=Math.round(255*(1-smooth((t-BLACK)/(RELOAD-BLACK))));veil.style.backgroundColor=`rgb(${c},${c},${c})`;}
   if(t>=RELOAD){reset();return;}
  }
  timer=setTimeout(tick,covered&&!document.hidden?33:250);
 }
 button.addEventListener('click',()=>{notice.textContent='';++token;audio.pause();started=false;stopped=false;if(!step++){origin=Date.now()-1222000;button.textContent='跳至白屏前';audio.muted=true;audio.play().catch(()=>{});}else{origin=Date.now()-WHITE*1000;started=false;button.textContent='正在结束本轮';}tick();});
 const visibility=()=>{if(returning)resumeReveal?.();else tick();};document.addEventListener('visibilitychange',visibility);
 try{const saved=sessionStorage.getItem('shili-solar-return');if(saved){sessionStorage.removeItem('shili-solar-return');returning=true;button.disabled=true;const deadline=Number(saved)>1?Number(saved):Date.now()+4000;origin=deadline;
  veil.style.opacity='1';veil.style.backgroundColor='transparent';veil.innerHTML='<div class="solar-eyelid solar-eyelid-top"></div><div class="solar-eyelid solar-eyelid-bottom"></div>';veil.showModal();
  let revealing=false,animations=[],revealTimer=0;
  const finish=()=>{if(disposed||suspended||!returning)return;clearTimeout(revealTimer);veil.close();animations.forEach(a=>a.cancel());veil.innerHTML='';veil.style.cssText='';document.documentElement.classList.remove('solar-returning');origin=Math.max(deadline,Date.now());returning=false;resumeReveal=null;button.disabled=false;tick();};
  const reveal=()=>{if(revealing||disposed||suspended||document.hidden)return;revealing=true;requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(disposed||suspended||document.hidden){revealing=false;return;}
   scrollTo({top:0,left:0,behavior:'instant'});document.documentElement.classList.remove('solar-returning');const duration=Math.max(2000,deadline-Date.now());const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
   try{animations=[...veil.children].map((lid,i)=>lid.animate(reduced?[{opacity:1},{opacity:0}]:[{transform:'translateY(0)',borderRadius:'0'},{transform:`translateY(${i?100:-100}%)`,borderRadius:i?'50% 50% 0 0':'0 0 50% 50%'}],{duration,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'}));
    Promise.all(animations.map(a=>a.finished)).then(finish,finish);revealTimer=setTimeout(finish,duration+250);
   }catch{finish();}
  }));};resumeReveal=()=>{if(revealing&&animations.length&&animations.every(a=>a.playState==='finished'))finish();else reveal();};
  if(document.readyState==='complete')reveal();else{addEventListener('load',reveal,{once:true});setTimeout(reveal,5000);}

 }}catch{document.documentElement.classList.remove('solar-returning');returning=false;veil.close();button.disabled=false;}
 addEventListener('pagehide',e=>{suspended=true;disposed=!e.persisted;++token;clearTimeout(timer);audio.pause();if(!e.persisted)document.removeEventListener('visibilitychange',visibility);});
 addEventListener('pageshow',e=>{if(!e.persisted||disposed)return;suspended=false;started=false;if(returning)resumeReveal?.();else tick();});tick();
})();
