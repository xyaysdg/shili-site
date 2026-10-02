/* A single audio element lives outside route rendering, so navigation preserves playback. */
(()=>{
 const root=document.querySelector('[data-record-player]');if(!root)return;
 const button=root.querySelector('button'),audio=root.querySelector('audio'),status=root.querySelector('[data-record-status]');
 const song='Red Rock Riviera — Sea Power';let noticeTimer;
 audio.volume=.35;
 const tell=message=>{clearTimeout(noticeTimer);status.textContent=message;status.hidden=!message;if(message)noticeTimer=setTimeout(()=>{status.hidden=true;},6000);};
 const sync=()=>{const playing=!audio.paused&&!audio.ended;button.setAttribute('aria-pressed',String(playing));button.setAttribute('aria-label',(playing?'暂停音乐：':'播放音乐：')+song);button.title=(playing?'暂停':'播放')+' · '+song;if(!playing)root.dataset.playing='false';};
 audio.addEventListener('play',sync);
 audio.addEventListener('playing',()=>{root.dataset.playing='true';sync();tell('');});
 audio.addEventListener('pause',sync);audio.addEventListener('ended',sync);
 audio.addEventListener('waiting',()=>{root.dataset.playing='false';});
 audio.addEventListener('error',()=>{root.dataset.playing='false';button.setAttribute('aria-pressed','false');button.setAttribute('aria-label','重试播放音乐：'+song);button.title='重试播放 · '+song;tell('音乐暂时无法播放，请点击唱片重试。');});
 button.addEventListener('click',async()=>{
  if(!audio.paused){audio.pause();sync();tell('');return;}
  try{if(audio.error)audio.load();await audio.play();}catch(error){if(error.name==='AbortError')return;audio.pause();sync();tell('未能播放音乐，请再次点击唱片。');}
 });
 addEventListener('pagehide',()=>audio.pause());sync();
})();
