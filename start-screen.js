/* One persistent record; the gate reveals the existing home underneath. */
(()=>{
 window.shiliOpenStartScreen=function(){
 if(document.querySelector('.site-start'))return;
 const player=document.querySelector('[data-record-player]');if(!player)return;
 const parent=player.parentNode,next=player.nextSibling,originalStyle=player.getAttribute('style');
 function restingRect(){const marker=document.createElement('div');marker.className='record-player';marker.style.visibility='hidden';marker.setAttribute('aria-hidden','true');parent.append(marker);const r=marker.getBoundingClientRect();marker.remove();return r;}
 let target=restingRect();
 const gate=document.createElement('dialog');gate.className='site-start';gate.setAttribute('aria-label','欢迎来到十里的内陆帝国');
 gate.innerHTML='<canvas class="start-curtain" aria-hidden="true"></canvas><div class="start-auras" aria-hidden="true"><i></i><i></i><i></i><i></i></div><canvas class="start-branches" aria-hidden="true"></canvas><div class="start-record-slot"></div><p class="start-music-note" aria-hidden="true">点击唱片暂停音乐</p><div class="start-copy"><button type="button" class="start-enter">Welcome to shili\'s Inland Empire</button><p class="start-mobile-note" hidden>本站特效较多，手机建议访问 <a href="https://xyay.mysxl.cn/" target="_blank" rel="noopener noreferrer">轻量版网站 ↗</a></p></div>';
 const enter=gate.querySelector('.start-enter'),copy=gate.querySelector('.start-copy'),canvas=gate.querySelector('canvas'),ctx=canvas.getContext('2d'),audio=document.querySelector('[data-background-audio]');
 const note=gate.querySelector('.start-music-note');
 const syncNote=()=>{const visible=!audio.paused&&!audio.ended;note.dataset.visible=String(visible);note.setAttribute('aria-hidden',String(!visible));};audio.addEventListener('playing',syncNote);audio.addEventListener('pause',syncNote);audio.addEventListener('ended',syncNote);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 gate.querySelector('.start-mobile-note').hidden=!(matchMedia('(max-width: 900px) and (pointer: coarse)').matches||/Android|iPhone|iPod/i.test(navigator.userAgent));
 document.body.append(gate);gate.querySelector('.start-record-slot').append(player);document.body.classList.add('startup-open','modal-open');gate.showModal();gate.addEventListener('cancel',e=>e.preventDefault());
 let entering=false,finished=false,frame=0,armTimer=0,musicTimer=0,readyFrame=0,tries=0,hintTimer=0,gradient,w=0,h=0,ratio=1;
 const transitionAnimations=[];let restoreTitle=()=>{};
 function motion(el,frames,options){const animation=el.animate(frames,options);transitionAnimations.push(animation);return animation;}
 // A direct visit still enters the home at the end of the welcome screen.
 history.replaceState(null,'','#/home');window.dispatchEvent(new HashChangeEvent('hashchange'));
 function draw(radius=0,cx=w*.74,cy=h*.44){
  if(!ctx)return;ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,w,h);ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
  if(radius>0){ctx.globalCompositeOperation='destination-out';const g=ctx.createRadialGradient(cx,cy,Math.max(0,radius-95),cx,cy,radius);g.addColorStop(0,'#000');g.addColorStop(1,'#0000');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation='source-over';}
 }
 function layout(){
  if(entering){done();return;}target=restingRect();w=innerWidth;h=innerHeight;ratio=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);ctx?.setTransform(ratio,0,0,ratio,0,0);
  if(ctx){gradient=ctx.createRadialGradient(w*.3,h*.44,0,w*.3,h*.44,Math.max(w,h)*.8);gradient.addColorStop(0,'#25303a');gradient.addColorStop(.55,'#0b111a');gradient.addColorStop(1,'#05080d');draw();}
  // Hash navigation may still be restoring the previous scroll position here.
  // Align with the home title's position at scroll zero, not that transient viewport.
  const title=document.querySelector('#welcome-title');if(title&&w>700){const r=title.getBoundingClientRect(),s=getComputedStyle(title);copy.style.left=r.left+'px';copy.style.top=(r.top+scrollY)+'px';copy.style.width=r.width+'px';enter.style.font=s.font;enter.style.lineHeight=s.lineHeight;enter.style.letterSpacing=s.letterSpacing;}
  if(w<=700){copy.style.left='8%';copy.style.top='44%';copy.style.width='84%';enter.style.font='';enter.style.lineHeight='';enter.style.letterSpacing='';}
  const scale=w>700?Math.min(6,w*.32/target.width,h*.48/target.height):Math.min(6,w*.44/target.width,h*.27/target.height);player.style.cssText='position:fixed;transform-origin:top left;left:'+Math.max(12,w*(w>700?.25:.45)-target.width*scale/2)+'px;top:'+Math.max(70,h*(w>700?.45:.21)-target.height*scale/2)+'px;transform:scale('+scale+');';const pr=player.getBoundingClientRect();gate.style.setProperty('--start-disc-size',player.querySelector('.record-disc').getBoundingClientRect().width+'px');note.style.left=(pr.left+pr.width/2)+'px';note.style.top=(pr.bottom+36)+'px';applyAuras();
 }

 const auraNodes=[...gate.querySelectorAll('.start-auras i')],storageKey='shili-start-auras-v2';
 const defaults=[{"h":193,"s":100,"v":22,"a":37,"core":50,"fade":268,"scale":100},{"h":264,"s":61,"v":73,"a":10,"core":50,"fade":194,"scale":100},{"h":208,"s":100,"v":73,"a":16,"core":50,"fade":194,"scale":100},{"h":341,"s":95,"v":70,"a":11,"core":50,"fade":297,"scale":100}];
 const fields=[['h','色相',0,360,'°'],['s','饱和度',0,100,'%'],['v','明度',0,100,'%'],['a','不透明度',0,100,'%'],['core','中心直径',0,400,'%'],['fade','过渡宽度',1,400,'%'],['scale','整体大小',25,200,'%']];
 function validate(values){if(!Array.isArray(values)||values.length!==4)return defaults.map(x=>({...x}));return values.map((v,i)=>Object.fromEntries(fields.map(([k,,min,max])=>[k,typeof v?.[k]==='number'&&Number.isFinite(v[k])?Math.max(min,Math.min(max,v[k])):defaults[i][k]])));}
 let auraValues=defaults.map(x=>({...x})),selected=0,saveTimer=0,panelStatus=null;
 try{const stored=JSON.parse(localStorage.getItem(storageKey));if(stored?.version===1)auraValues=validate(stored.circles);}catch{}
 function rgb(c){const h=(c.h%360)/60,s=c.s/100,v=c.v/100,n=Math.floor(h),f=h-n,p=v*(1-s),q=v*(1-f*s),t=v*(1-(1-f)*s);return [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]][n].map(x=>Math.round(x*255));}
 function applyAuras(){const disc=player.querySelector('.record-disc').getBoundingClientRect().width||288;const coreDiameter=Math.max(...auraValues.map(c=>Math.min(4096,disc*(c.core+2*c.fade)/100*c.scale/100)*c.core/(c.core+2*c.fade)));const separation=(coreDiameter+32)*.8;gate.style.setProperty('--aura-orbit-x',Math.max(w*.43,separation)+'px');gate.style.setProperty('--aura-orbit-y',Math.max(h*.43,separation)+'px');auraNodes.forEach((node,i)=>{const c=auraValues[i],base=c.core+2*c.fade,size=disc*base/100*c.scale/100,core=c.core/base*100,color=rgb(c).join(',');node.style.width=Math.min(4096,size)+'px';node.style.background='radial-gradient(circle closest-side,rgba('+color+','+c.a/100+') 0%,rgba('+color+','+c.a/100+') '+core+'%,rgba('+color+','+c.a/240+') '+(core+(100-core)*.45)+'%,rgba('+color+',0) 100%)';});}
 function saveAuras(){clearTimeout(saveTimer);try{localStorage.setItem(storageKey,JSON.stringify({version:1,circles:auraValues}));if(panelStatus)panelStatus.textContent='已保存到当前浏览器';}catch{if(panelStatus)panelStatus.textContent='浏览器未允许保存，请复制参数保留。';}}
 if(document.body.classList.contains('site-editor-active')){
  const panel=document.createElement('details');panel.className='start-aura-panel';panel.open=true;
  panel.innerHTML='<summary>背景渐变调节</summary><div class="aura-panel-body"><label class="aura-choice">选择圆圈 <select aria-label="选择渐变圆圈"><option value="0">青色圈</option><option value="1">紫色圈</option><option value="2">深蓝色圈</option><option value="3">红色圈</option></select></label><p class="aura-help">中心与过渡的100%＝唱片直径；整体大小等比缩放。明度使用HSV。</p><div class="aura-fields"></div><div class="aura-actions"><button type="button" data-aura-reset>恢复当前圈</button><button type="button" data-aura-copy>复制全部参数</button></div><p class="aura-status" role="status">调整后自动保存在当前浏览器</p><textarea class="aura-export" aria-label="渐变参数" readonly hidden></textarea></div>';
  gate.append(panel);panelStatus=panel.querySelector('.aura-status');const host=panel.querySelector('.aura-fields');
  fields.forEach(([k,label,min,max,unit])=>{const row=document.createElement('label');row.className='aura-field';row.innerHTML='<span>'+label+' <small>'+unit+'</small></span><input type="number" aria-label="'+label+'数值" min="'+min+'" max="'+max+'" step="1" data-key="'+k+'"><input type="range" aria-label="'+label+'滑块" min="'+min+'" max="'+max+'" step="1" data-key="'+k+'">';host.append(row);});
  function fill(){host.querySelectorAll('input').forEach(input=>input.value=auraValues[selected][input.dataset.key]);}
  panel.querySelector('select').addEventListener('change',e=>{selected=Number(e.target.value);fill();});
  host.addEventListener('input',e=>{const k=e.target.dataset.key,field=fields.find(f=>f[0]===k),value=e.target.valueAsNumber;if(!field||!Number.isFinite(value))return;auraValues[selected][k]=Math.max(field[2],Math.min(field[3],value));host.querySelectorAll('input').forEach(input=>{if(input.dataset.key===k&&input!==e.target)input.value=auraValues[selected][k];});applyAuras();panelStatus.textContent='实时预览中…';clearTimeout(saveTimer);saveTimer=setTimeout(saveAuras,200);});
  host.addEventListener('change',()=>{fill();saveAuras();});
  panel.querySelector('[data-aura-reset]').addEventListener('click',()=>{auraValues[selected]={...defaults[selected]};fill();applyAuras();saveAuras();});
  panel.querySelector('[data-aura-copy]').addEventListener('click',async()=>{const text=JSON.stringify({version:1,circles:auraValues},null,2);try{await navigator.clipboard.writeText(text);panelStatus.textContent='全部参数已复制，可发给我固定到网站。';}catch{const area=panel.querySelector('textarea');area.hidden=false;area.value=text;area.focus();area.select();panelStatus.textContent='请复制下方参数';}});fill();
 }

 const observer=new MutationObserver(()=>layout());observer.observe(document.querySelector('#main'),{childList:true});addEventListener('resize',layout);
 function ready(){layout();if(!document.querySelector('#welcome-title')&&++tries<120)readyFrame=requestAnimationFrame(ready);}ready();
 function cancelIntro(){clearTimeout(armTimer);clearTimeout(musicTimer);delete player.dataset.lowering;}
 function startMusic(){window.shiliRecordPlayer?.play();}
 armTimer=setTimeout(()=>{player.dataset.lowering='true';musicTimer=setTimeout(startMusic,reduced.matches?0:1400);},1000);
 // A deliberate record click takes over the automatic needle sequence.
 hintTimer=setTimeout(()=>{if(!entering)enter.classList.add('needs-click');},5000);
 const manual=()=>cancelIntro();player.addEventListener('click',manual,{once:true,capture:true});
 gate.addEventListener('click',e=>{if(!player.contains(e.target)&&!e.target.closest('.start-enter,.start-aura-panel')&&audio.paused){cancelIntro();startMusic();}},{once:true});
 function done(){
  if(finished)return;finished=true;restoreTitle();cancelAnimationFrame(frame);cancelAnimationFrame(readyFrame);cancelIntro();clearTimeout(saveTimer);clearTimeout(hintTimer);audio.removeEventListener('playing',syncNote);audio.removeEventListener('pause',syncNote);audio.removeEventListener('ended',syncNote);observer.disconnect();removeEventListener('resize',layout);player.removeEventListener('click',manual,true);
  if(next?.parentNode===parent)parent.insertBefore(player,next);else parent.append(player);if(originalStyle===null)player.removeAttribute('style');else player.setAttribute('style',originalStyle);transitionAnimations.forEach(a=>a.cancel());
  gate.close();gate.remove();const ripples=player.querySelector('.record-ripples');if(ripples&&!reduced.matches)ripples.animate([{opacity:0},{opacity:player.dataset.playing==='true'?1:0}],{duration:650,easing:'ease-out'});document.body.classList.remove('startup-open','modal-open');requestAnimationFrame(()=>requestAnimationFrame(()=>dispatchEvent(new Event('shili:site-enter'))));document.querySelector('#main')?.focus({preventScroll:true});
 }

 enter.addEventListener('click',()=>{
  if(entering)return;layout();entering=true;saveAuras();gate.querySelector('.start-aura-panel')?.remove();clearTimeout(hintTimer);cancelIntro();observer.disconnect();enter.disabled=true;if(audio.paused)startMusic();
  gate.classList.add('is-entering');scrollTo({top:0,left:0,behavior:'instant'});
  if(reduced.matches){motion(gate,[{opacity:1},{opacity:0}],{duration:350,fill:'forwards'}).finished.then(done,done);return;}
  const r=enter.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,pr=player.getBoundingClientRect(),scale=pr.width/target.width,duration=2800;
  const title=document.querySelector('#welcome-title'),titleStyle=title?.getAttribute('style');
  if(title){const style=getComputedStyle(title);enter.style.color=style.color;title.style.visibility='hidden';restoreTitle=()=>{if(titleStyle===null)title.removeAttribute('style');else title.setAttribute('style',titleStyle);};}
  // The same title stays in place while its surroundings open. Only the record travels.
  motion(enter,[{textShadow:getComputedStyle(enter).textShadow},{textShadow:'0 0 10px #eaf5ff66',offset:.13},{textShadow:'0 0 0px #eaf5ff00',offset:.65},{textShadow:'0 0 0px #eaf5ff00'}],{duration,fill:'forwards'});
  const arrival=motion(player,[{transform:'translate(0,0) scale('+scale+')'},{transform:'translate('+(target.left-pr.left)+'px,'+(target.top-pr.top)+'px) scale(1)'}],{delay:420,duration:duration-420,easing:'cubic-bezier(.32,0,.16,1)',fill:'forwards'});
  gate.querySelectorAll('.start-music-note,.start-mobile-note').forEach(el=>motion(el,[{opacity:getComputedStyle(el).opacity},{opacity:0}],{duration:500,fill:'forwards'}));
  motion(gate.querySelector('.start-auras'),[{opacity:1},{opacity:0}],{delay:350,duration:1250,easing:'ease-in-out',fill:'forwards'});
  const trails=gate.querySelector('.start-branches'),ink=trails.getContext('2d');trails.width=canvas.width;trails.height=canvas.height;ink?.setTransform(ratio,0,0,ratio,0,0);
  // Cache the stationary curtain; no background gradient or repeated paragraph is repainted.
  const base=document.createElement('canvas');base.width=canvas.width;base.height=canvas.height;base.getContext('2d')?.drawImage(canvas,0,0);
  const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);},paths=[],text=enter.firstChild,letters=enter.textContent,style=getComputedStyle(enter);
  // Locate an actual ink edge in each chosen glyph, using the current font and DOM line box.
  // This also follows wrapped mobile text without relying on desktop percentage anchors.
  function inkAnchor(index,upper){
   index=Math.min(index,letters.length-1);while(index>0&&letters[index]===' ')index--;
   const range=document.createRange();range.setStart(text,index);range.setEnd(text,index+1);const box=range.getBoundingClientRect();
   const glyph=document.createElement('canvas');glyph.width=Math.ceil(box.width)+8;glyph.height=Math.ceil(box.height)+8;const g=glyph.getContext('2d');
   const fallback={x:box.left+box.width/2,y:upper?box.top:box.bottom};if(!g)return fallback;
   g.font=style.font;g.textBaseline='alphabetic';const m=g.measureText(letters[index]);const ascent=m.fontBoundingBoxAscent||parseFloat(style.fontSize)*.8;g.fillText(letters[index],4,4+ascent);
   try{const data=g.getImageData(0,0,glyph.width,glyph.height).data;let edge=null;
    for(let y=0;y<glyph.height;y++)for(let x=0;x<glyph.width;x++)if(data[(y*glyph.width+x)*4+3]>110){if(!edge||(upper?y<edge.y:y>edge.y)||(y===edge.y&&Math.abs(x-glyph.width/2)<Math.abs(edge.x-glyph.width/2)))edge={x,y};}
    return edge?{x:box.left+edge.x-4,y:box.top+edge.y-4}:fallback;
   }catch{return fallback;}
  }
  function curve(a,b,c,d){const pts=[];for(let i=0;i<=72;i++){const t=i/72,u=1-t;pts.push({x:u*u*u*a.x+3*u*u*t*b.x+3*u*t*t*c.x+t*t*t*d.x,y:u*u*u*a.y+3*u*u*t*b.y+3*u*t*t*c.y+t*t*t*d.y});}return pts;}
  const specs=[{i:0,up:true,x:.04,y:.15},{i:2,up:false,x:.08,y:.87},{i:12,up:true,x:.50,y:-.06},{i:17,up:false,x:.57,y:1.04},{i:26,up:true,x:1.08,y:.12},{i:30,up:false,x:1.08,y:.84}];
  specs.forEach((spec,i)=>{const a=inkAnchor(spec.i,spec.up),d={x:w*spec.x,y:h*spec.y},dy=spec.up?-1:1;
   const b={x:a.x,y:a.y+dy*Math.min(68,h*.08)},c={x:a.x+(d.x-a.x)*.66,y:d.y-dy*h*.08};
   paths.push({points:curve(a,b,c,d),start:90+i*42,span:1320+i*35,child:false,char:letters[spec.i]||' '});
  });
  // Four secondary shoots, with tangent-continuous joins and no recursive doubling.
  [0,2,3,5].forEach((parentIndex,i)=>{const parent=paths[parentIndex],j=39,a=parent.points[j],prev=parent.points[j-1],dx=a.x-prev.x,dy=a.y-prev.y,n=Math.hypot(dx,dy)||1,len=Math.min(w,h)*.23,turn=i%2?-.44:.44,angle=Math.atan2(dy,dx)+turn,d={x:a.x+Math.cos(angle)*len,y:a.y+Math.sin(angle)*len};
   paths.push({points:curve(a,{x:a.x+dx/n*len*.33,y:a.y+dy/n*len*.33},{x:d.x-Math.cos(angle)*len*.25,y:d.y-Math.sin(angle)*len*.25},d),start:parent.start+parent.span*.53,span:700+i*55,child:true,char:''});
  });
  const time=performance.now(),maxX=Math.max(cx,w-cx)*2.35,maxY=Math.max(cy,h-cy)*2.35;
  function reveal(now){
   if(finished)return;const elapsed=now-time,opening=smooth((elapsed-170)/2260),clear=smooth((elapsed-2150)/600);
   if(ctx){ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,w,h);ctx.globalAlpha=1-clear;ctx.drawImage(base,0,0,w,h);ctx.globalAlpha=1;
    if(opening>0){const rx=r.width*.48+(maxX-r.width*.48)*opening,ry=8+(maxY-8)*opening;ctx.save();ctx.translate(cx,cy);ctx.scale(rx,ry);ctx.globalCompositeOperation='destination-out';ctx.globalAlpha=smooth((elapsed-170)/440);const mask=ctx.createRadialGradient(0,0,.48,0,0,1);mask.addColorStop(0,'#000');mask.addColorStop(1,'#0000');ctx.fillStyle=mask;ctx.fillRect(-1,-1,2,2);ctx.restore();}
   }
   if(ink){ink.clearRect(0,0,w,h);ink.lineCap='round';ink.lineJoin='round';const fade=1-smooth((elapsed-1050)/950);
    if(fade>0)for(const path of paths){const growth=smooth((elapsed-path.start)/path.span);if(growth<=0)continue;const end=Math.max(1,Math.floor(growth*72)),first=Math.floor(smooth((elapsed-path.start-850)/950)*end*.65),head=path.points[end];
     ink.beginPath();ink.moveTo(path.points[first].x,path.points[first].y);for(let k=first+1;k<=end;k++)ink.lineTo(path.points[k].x,path.points[k].y);
     const wash=ink.createLinearGradient(path.points[first].x,path.points[first].y,head.x+.01,head.y);wash.addColorStop(0,'#ebeedc00');wash.addColorStop(.25,'#ebeedc');wash.addColorStop(1,'#f4f3e0');ink.strokeStyle=wash;ink.globalAlpha=fade*(path.child?.22:.42);ink.lineWidth=path.child?.65:.95;ink.stroke();
     if(!path.child&&growth>.12&&growth<.94){ink.globalAlpha=fade*.34*smooth((growth-.12)/.18);ink.font='11px ui-monospace,Consolas,monospace';ink.fillStyle='#e9e9dd';ink.fillText(path.char,head.x+3,head.y-3);}
    }ink.globalAlpha=1;
   }
   if(elapsed<duration)frame=requestAnimationFrame(reveal);
  }frame=requestAnimationFrame(reveal);
  arrival.finished.then(done,done);
 });
 };
 if(!document.documentElement.classList.contains('solar-returning'))window.shiliOpenStartScreen();
})();
