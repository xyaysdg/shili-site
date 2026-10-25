/* Absolute 22-minute timeline; scene rebuild releases scene memory, preserves saved drafts. */
(()=>{
 const MUSIC=1223,STOP=1310,WHITE=1320,BLACK=1326,RELOAD=1328,END=1328,EYE_MS=2000;
 const audio=new Audio('assets/solar-destruction.mp3');audio.preload='metadata';audio.volume=.65;
 const button=document.createElement('button');button.type='button';button.className='solar-test';button.textContent='音乐启动';button.title='跳到20分22秒；再次点击跳到22分00秒';
 const notice=document.createElement('span');notice.className='solar-notice';notice.setAttribute('role','status');
 const veil=document.createElement('dialog');veil.className='solar-veil';veil.setAttribute('aria-label','本轮结束，即将返回首页');veil.addEventListener('cancel',e=>e.preventDefault());document.body.append(button,notice,veil);
 let origin=Date.now(),step=0,timer=0,disposed=false,started=false,stopped=false,covered=false,reloading=false,token=0,returning=false,suspended=false,resumeReveal=null;
 const elapsed=()=>Math.max(0,(Date.now()-origin)/1000);
 audio.addEventListener('loadedmetadata',()=>{if(Number.isFinite(audio.duration)&&audio.duration>0)audio.playbackRate=audio.duration/(STOP-MUSIC);});
 function play(t){started=true;const job=++token;audio.muted=false;try{audio.currentTime=Math.max(0,(t-MUSIC)*audio.playbackRate);}catch{}window.shiliRecordPlayer?.pause();audio.play().then(()=>{if(job!==token)return;if(disposed||suspended||stopped)audio.pause();}).catch(()=>{if(job===token&&!disposed&&!suspended)notice.textContent='浏览器限制了自动播放，本轮音乐未能播放。';});}
 function reset(){
  if(reloading)return;reloading=true;veil.style.backgroundColor='#000';
  // Keep the same top-layer dialog mounted through cleanup and home reconstruction.
  veil.innerHTML='';
  try{window.shiliResetScenes();}catch(error){console.error('Solar scene reset failed',error);}
  beginReveal();
 }
 function tick(){
  if(disposed||suspended||returning||reloading)return;clearTimeout(timer);const t=elapsed();
  if(t>=STOP&&!stopped){stopped=true;++token;audio.pause();}else if(t>=MUSIC&&t<STOP&&!started)play(t);
  if(t>=WHITE&&!document.hidden){
   if(!covered){
    covered=true;button.disabled=true;notice.textContent='';veil.style.opacity='1';
    veil.innerHTML='<div class="solar-white"></div><div class="solar-black"></div>';veil.showModal();
    const elapsedMs=(t-WHITE)*1000;
    [...veil.children].forEach((layer,i)=>{const animation=layer.animate([{opacity:0},{opacity:1}],{duration:(i?RELOAD-BLACK:BLACK-WHITE)*1000,delay:i?(BLACK-WHITE)*1000:0,easing:'ease-in-out',fill:'both'});animation.currentTime=elapsedMs;});
   }
   if(t>=RELOAD){veil.style.backgroundColor='#000';requestAnimationFrame(()=>requestAnimationFrame(reset));return;}
  }
  timer=setTimeout(tick,250);
 }
 button.addEventListener('click',()=>{notice.textContent='';++token;audio.pause();started=false;stopped=false;if(!step++){origin=Date.now()-1222000;button.textContent='跳至22分钟白屏';audio.muted=true;audio.play().catch(()=>{});}else{origin=Date.now()-WHITE*1000;started=false;button.textContent='正在结束本轮';}tick();});
 const visibility=()=>{if(returning)resumeReveal?.();else tick();};document.addEventListener('visibilitychange',visibility);
 function beginReveal(){returning=true;button.disabled=true;
  veil.style.opacity='1';veil.style.backgroundColor='#000';veil.innerHTML='<div class="solar-eyelid solar-eyelid-top"></div><div class="solar-eyelid solar-eyelid-middle"></div><div class="solar-eyelid solar-eyelid-bottom"></div><div class="solar-eye-guard"></div>';veil.showModal();
  let revealing=false,animations=[],revealTimer=0;
  const finish=()=>{if(disposed||suspended||!returning)return;clearTimeout(revealTimer);veil.close();animations.forEach(a=>a.cancel());veil.innerHTML='';veil.style.cssText='';document.documentElement.classList.remove('solar-returning');origin=Date.now();step=0;started=false;stopped=false;covered=false;reloading=false;audio.currentTime=0;button.textContent='音乐启动';returning=false;resumeReveal=null;button.disabled=false;tick();};
  const reveal=()=>{if(revealing||disposed||suspended||document.hidden)return;revealing=true;requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(disposed||suspended||document.hidden){revealing=false;return;}
   scrollTo({top:0,left:0,behavior:'instant'});document.documentElement.classList.remove('solar-returning');const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const duration=reduced?1500:EYE_MS;
   try{veil.style.backgroundColor='transparent';animations=[...veil.children].map((lid,i)=>lid.animate(reduced?[{opacity:1},{opacity:0}]:i===3?[{opacity:1},{opacity:0,offset:.2},{opacity:0}]:(i===1?[{transform:'scaleY(1)',opacity:1},{transform:'scaleY(.45)',opacity:.35,offset:.5},{transform:'scaleY(.12)',opacity:.06,offset:.8},{transform:'scaleY(0)',opacity:0}]:[{transform:'translateY(0)'},{transform:`translateY(${i===0?-110:110}%)`}]),{duration,easing:'cubic-bezier(.42,0,.58,1)',fill:'forwards'}));
    Promise.all(animations.map(a=>a.finished)).then(finish,finish);revealTimer=setTimeout(finish,duration+250);
   }catch{finish();}
  }));};resumeReveal=()=>{if(revealing&&animations.length&&animations.every(a=>a.playState==='finished'))finish();else reveal();};
  if(document.readyState==='complete')reveal();else{addEventListener('load',reveal,{once:true});setTimeout(reveal,5000);}

 }
 try{if(sessionStorage.getItem('shili-solar-return')){sessionStorage.removeItem('shili-solar-return');beginReveal();}}catch{document.documentElement.classList.remove('solar-returning');}
 addEventListener('pagehide',e=>{suspended=true;disposed=!e.persisted;++token;clearTimeout(timer);audio.pause();if(!e.persisted)document.removeEventListener('visibilitychange',visibility);});
 addEventListener('pageshow',e=>{if(!e.persisted||disposed)return;suspended=false;started=false;if(returning)resumeReveal?.();else tick();});tick();
})();
