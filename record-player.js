/* Persistent player: interruptible one-second volume and disc-speed ramps. */
(()=>{
 const root=document.querySelector('[data-record-player]');if(!root)return;
 const button=root.querySelector('button'),audio=root.querySelector('audio')||document.querySelector('[data-background-audio]'),status=root.querySelector('[data-record-status]');
 const song='Red Rock Riviera — Sea Power',level=.35;let noticeTimer,frame=0,token=0,wanted=false,cycle=null,cycleFrame=0,visualSpeed=0,buffering=false,observedMuted=audio.muted;
 audio.volume=0;
 const tell=message=>{clearTimeout(noticeTimer);status.textContent=message;status.hidden=!message;if(message)noticeTimer=setTimeout(()=>status.hidden=true,6000);};
 const sync=()=>{if(cycle){button.setAttribute('aria-pressed',String(cycle.playing));button.setAttribute('aria-label',(cycle.playing?'静音':'恢复声音')+'：太阳毁灭（22分钟循环继续）');button.title=(cycle.playing?'静音':'恢复声音')+' · 太阳毁灭';root.dataset.engaged=String(cycle.playing);return;}button.setAttribute('aria-pressed',String(wanted));button.setAttribute('aria-label',(wanted?'暂停音乐：':'播放音乐：')+song);button.title=(wanted?'暂停':'播放')+' · '+song;root.dataset.engaged=String(wanted);};
 const disc=root.querySelector('.record-disc');
 // Set the rate before starting; preserve the current angle when changing speed.
 const discSpeed=value=>{visualSpeed=value;for(const a of disc?.getAnimations?.()||[]){if(a.updatePlaybackRate)a.updatePlaybackRate(value);else a.playbackRate=value;if(value>0){if(a.playState!=='running')a.play();}else a.pause();}};
 discSpeed(0);
 const canSound=()=>!audio.paused&&!audio.ended&&!audio.error&&!audio.muted&&!buffering&&(audio.readyState===undefined||audio.readyState>=3);
 const motionState=value=>{if(root.dataset.playing!==String(value))root.dataset.playing=String(value);};
 const stopMotion=()=>{if(!cycle){discSpeed(0);motionState(false);}};
 function ramp(target,done){
  cancelAnimationFrame(frame);const start=audio.volume,speed=visualSpeed,time=performance.now();
  const step=now=>{const p=Math.min(1,(now-time)/1000),ease=p*p*(3-2*p);audio.volume=start+(target-start)*ease;if(!cycle){const audible=canSound()&&audio.volume>0;discSpeed(audible?speed+((target>0?1:0)-speed)*ease:0);motionState(audible);}if(p<1)frame=requestAnimationFrame(step);else{frame=0;done?.();}};
  frame=requestAnimationFrame(step);
 }
 function pause(){wanted=false;++token;sync();if(audio.paused){cancelAnimationFrame(frame);audio.volume=0;if(!cycle){discSpeed(0);root.dataset.playing='false';}return;}ramp(0,()=>{audio.pause();if(!cycle)root.dataset.playing='false';});}
 async function play(){
  wanted=true;const job=++token;cancelAnimationFrame(frame);
  try{if(audio.paused)audio.volume=0;audio.muted=false;if(audio.error)audio.load();await audio.play();if(job!==token){if(!wanted)audio.pause();return;}buffering=false;sync();tell('');ramp(level);}
  catch(e){if(job!==token)return;wanted=false;cancelAnimationFrame(frame);audio.pause();stopMotion();sync();tell('未能播放音乐，请再次点击唱片。');}
 }
 audio.addEventListener('pause',()=>{wanted=false;++token;cancelAnimationFrame(frame);stopMotion();sync();});
 audio.addEventListener('playing',()=>{buffering=false;if(wanted&&!cycle){tell('');ramp(level);}});
 const waitForAudio=()=>{buffering=true;stopMotion();if(wanted&&!cycle)tell('音乐正在缓冲…');};
 audio.addEventListener('waiting',waitForAudio);
 audio.addEventListener('stalled',()=>{if(audio.readyState<3)waitForAudio();});
 audio.addEventListener('emptied',()=>{buffering=true;cancelAnimationFrame(frame);stopMotion();});
 audio.addEventListener('volumechange',()=>{const wasMuted=observedMuted;observedMuted=audio.muted;if(audio.muted||audio.volume===0)stopMotion();else if(wasMuted&&wanted&&!cycle)ramp(level);});
 audio.addEventListener('ended',()=>{wanted=false;cancelAnimationFrame(frame);stopMotion();sync();});
 audio.addEventListener('error',()=>{wanted=false;++token;cancelAnimationFrame(frame);stopMotion();sync();tell('音乐暂时无法播放，请点击唱片重试。');});
 button.addEventListener('click',()=>{if(cycle){cycle.toggle();return;}if(wanted&&!audio.muted)pause();else play();});
 function setCycle(state){
 const unchanged=!!cycle===!!state&&cycle?.playing===state?.playing;cycle=state;sync();if(unchanged)return;cancelAnimationFrame(cycleFrame);const start=visualSpeed,target=state?.playing?1:0,time=performance.now();motionState(!!state?.playing);
 const step=now=>{const p=Math.min(1,(now-time)/1000),ease=p*p*(3-2*p);discSpeed(start+(target-start)*ease);if(p<1)cycleFrame=requestAnimationFrame(step);};cycleFrame=requestAnimationFrame(step);
 }
 window.shiliRecordPlayer={pause,play,setCycle};
 addEventListener('shili:site-enter',()=>{if(!cycle){if(canSound()&&audio.volume>0)discSpeed(visualSpeed);else stopMotion();}});
 addEventListener('pagehide',()=>{++token;cancelAnimationFrame(frame);cancelAnimationFrame(cycleFrame);clearTimeout(noticeTimer);audio.pause();});sync();
})();
