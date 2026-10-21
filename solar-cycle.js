/* One deadline clock per document. Route changes never reset it; reload clears scene memory,
   not the author's saved works, editor settings or message drafts. */
(()=>{
 const MUSIC=1223,STOP=1310,END=1320,FADE=8000,HOLD=5000;
 const audio=new Audio('assets/solar-destruction.mp3');audio.preload='metadata';audio.volume=.65;
 const button=document.createElement('button');button.type='button';button.className='solar-test';
 button.textContent='音乐启动';button.title='跳到20分22秒；再次点击跳到21分50秒';
 const notice=document.createElement('span');notice.className='solar-notice';notice.setAttribute('role','status');
 const veil=document.createElement('dialog');veil.className='solar-veil';veil.setAttribute('aria-label','本轮结束，即将返回首页');
 veil.addEventListener('cancel',e=>e.preventDefault());document.body.append(button,notice,veil);
 let origin=Date.now(),phase='waiting',step=0,timer=0,job=0,disposed=false;
 const elapsed=()=>Math.max(0,(Date.now()-origin)/1000);
 audio.addEventListener('loadedmetadata',()=>{
  // The supplied MP3 is about 87.43s; fit its complete track into the 87s window.
  if(Number.isFinite(audio.duration)&&audio.duration>0)audio.playbackRate=audio.duration/(STOP-MUSIC);
 });
 audio.addEventListener('playing',()=>{
  if(phase==='music'&&Math.abs(audio.currentTime-(elapsed()-MUSIC)*audio.playbackRate)>.3){
   try{audio.currentTime=Math.max(0,(elapsed()-MUSIC)*audio.playbackRate);}catch{}
  }
 });
 audio.addEventListener('error',()=>{notice.textContent='本轮音乐未能加载，请重新加载网页后重试。';});
 function silence(){audio.pause();audio.muted=false;}
 function playAt(seconds){
  const token=++job;audio.muted=false;
  try{audio.currentTime=Math.max(0,seconds*audio.playbackRate);}catch{}
  window.shiliRecordPlayer?.pause();
  audio.play().then(()=>{if(token!==job||phase!=='music')audio.pause();}).catch(e=>{
   if(token===job&&e.name!=='AbortError')notice.textContent='浏览器限制了自动播放，本轮音乐未能播放。';
  });
 }
 function reset(){
  if(disposed)return;
  // Full navigation releases scene objects, GPU contexts, timers and in-memory caches.
  // No localStorage / IndexedDB / user drafts are erased.
  try{sessionStorage.setItem('shili-solar-return','1');}catch{}
  const url=new URL(location.href);url.hash='/home';history.replaceState(null,'',url.href);location.reload();
 }
 function whiteout(){
  if(phase==='white'||document.hidden)return;
  phase='white';++job;silence();button.disabled=true;notice.textContent='';
  veil.showModal();
  const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?1000:FADE;
  const animation=veil.animate([{opacity:1,backgroundColor:'rgba(255,255,255,0)',backdropFilter:'blur(0px)'},{opacity:1,backgroundColor:'rgba(255,255,255,1)',backdropFilter:'blur(16px)'}],{duration,easing:'ease-in-out',fill:'forwards'});
  animation.finished.then(()=>{if(!disposed)timer=setTimeout(reset,HOLD);}).catch(()=>{});
 }
 function tick(){
  if(disposed||phase==='white')return;
  clearTimeout(timer);const t=elapsed();
  if(t>=STOP&&phase!=='silent'){phase='silent';++job;silence();}
  else if(t>=MUSIC&&t<STOP&&phase!=='music'){phase='music';playAt(t-MUSIC);}
  if(t>=END){whiteout();if(phase==='white')return;}
  // Absolute time prevents accumulated interval drift and catches up after tab suspension.
  const next=t<MUSIC?MUSIC:t<STOP?STOP:END;
  timer=setTimeout(tick,Math.max(50,Math.min(1000,(next-t)*1000)));
 }
 button.addEventListener('click',()=>{
  notice.textContent='';
  if(step===0){
   step=1;origin=Date.now()-1222*1000;phase='waiting';button.textContent='跳至音乐结束';
   // Prime in the user gesture, silently; the first audible sample starts one second later.
   audio.muted=true;const token=++job;
   audio.play().then(()=>{if(token!==job&&phase!=='music')audio.pause();}).catch(()=>{});
  }else{origin=Date.now()-STOP*1000;phase='music';button.textContent='等待白屏';}
  tick();
 });
 const visibility=()=>tick();document.addEventListener('visibilitychange',visibility);
 // Returning home starts a fresh 22-minute cycle.
 try{if(sessionStorage.getItem('shili-solar-return')){
  sessionStorage.removeItem('shili-solar-return');veil.style.opacity='1';veil.style.backgroundColor='#fff';veil.showModal();
  const reveal=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
   scrollTo({top:0,left:0,behavior:'instant'});
   document.documentElement.classList.remove('solar-returning');
   const a=veil.animate([{opacity:1,backgroundColor:'#fff',backdropFilter:'blur(16px)'},{opacity:1,backgroundColor:'rgba(255,255,255,0)',backdropFilter:'blur(0px)'}],{duration:3000,easing:'ease-in-out',fill:'forwards'});
   a.finished.then(()=>{veil.close();a.cancel();veil.style.opacity='';veil.style.backgroundColor='';});
  }));
  if(document.readyState==='complete')reveal();else addEventListener('load',reveal,{once:true});
 }}catch{}
 addEventListener('pagehide',()=>{disposed=true;++job;clearTimeout(timer);silence();document.removeEventListener('visibilitychange',visibility);},{once:true});
 tick();
})();
