/* Persistent player: interruptible one-second volume and disc-speed ramps. */
(()=>{
 const root=document.querySelector('[data-record-player]');if(!root)return;
 const button=root.querySelector('button'),audio=root.querySelector('audio'),status=root.querySelector('[data-record-status]');
 const song='Red Rock Riviera — Sea Power',level=.35;let noticeTimer,frame=0,token=0,wanted=false;
 audio.volume=0;
 const tell=message=>{clearTimeout(noticeTimer);status.textContent=message;status.hidden=!message;if(message)noticeTimer=setTimeout(()=>status.hidden=true,6000);};
 const sync=()=>{button.setAttribute('aria-pressed',String(wanted));button.setAttribute('aria-label',(wanted?'暂停音乐：':'播放音乐：')+song);button.title=(wanted?'暂停':'播放')+' · '+song;root.dataset.engaged=String(wanted);};
 const disc=root.querySelector('.record-disc');
 // Set the rate before starting; preserve the current angle when changing speed.
 const discSpeed=value=>{for(const a of disc?.getAnimations?.()||[]){if(a.updatePlaybackRate)a.updatePlaybackRate(value);else a.playbackRate=value;if(value>0){if(a.playState!=='running')a.play();}else a.pause();}};
 discSpeed(0);
 function ramp(target,done){
  cancelAnimationFrame(frame);const start=audio.volume,time=performance.now();
  const step=now=>{const p=Math.min(1,(now-time)/1000),ease=p*p*(3-2*p);audio.volume=start+(target-start)*ease;discSpeed(audio.volume/level);if(p<1)frame=requestAnimationFrame(step);else{frame=0;done?.();}};
  frame=requestAnimationFrame(step);
 }
 function pause(){wanted=false;++token;sync();if(audio.paused){cancelAnimationFrame(frame);audio.volume=0;discSpeed(0);root.dataset.playing='false';return;}ramp(0,()=>{audio.pause();root.dataset.playing='false';});}
 async function play(){
  wanted=true;const job=++token;cancelAnimationFrame(frame);sync();
  try{if(audio.paused)audio.volume=0;discSpeed(audio.volume/level);if(audio.error)audio.load();await audio.play();if(job!==token){if(!wanted)audio.pause();return;}discSpeed(audio.volume/level);root.dataset.playing='true';tell('');ramp(level);}
  catch(e){if(job!==token||e.name==='AbortError')return;wanted=false;audio.pause();sync();tell('未能播放音乐，请再次点击唱片。');}
 }
 audio.addEventListener('pause',()=>{root.dataset.playing='false';discSpeed(0);});
 audio.addEventListener('ended',()=>{wanted=false;cancelAnimationFrame(frame);root.dataset.playing='false';discSpeed(0);sync();});
 audio.addEventListener('error',()=>{wanted=false;++token;cancelAnimationFrame(frame);root.dataset.playing='false';discSpeed(0);sync();tell('音乐暂时无法播放，请点击唱片重试。');});
 button.addEventListener('click',()=>{if(wanted)pause();else play();});
 window.shiliRecordPlayer={pause,play};
 addEventListener('pagehide',()=>{++token;cancelAnimationFrame(frame);clearTimeout(noticeTimer);audio.pause();});sync();
})();
