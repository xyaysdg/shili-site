/* Resource warming is separate from scene construction and animation clocks. */
(()=>{
 const order=['home','art','photography','poetry','writing','journey','pantheon','contact'];
 const models={journey:'assets/medal-blender-v37.glb',contact:'assets/chestnut-v39.glb'};
 const modules={journey:['three.module.min.js','GLTFLoader.js','medal-blender-model.js'],contact:['three.module.min.js','GLTFLoader.js','chestnut-vocabulary.js','chestnut-composition.js','chestnut-reference-scene.js','chestnut-model.js']};
 const done=new Set(),flights=new Map(),buffers=new Map(),preparations=[];let queue=[],timer=0,idle=0,target='home',running=false,transitioning=false,prepareTimer=0,prepareIdle=0,prepareBusy=false;
 const constrained=()=>navigator.connection?.saveData||/^(slow-)?2g$/.test(navigator.connection?.effectiveType||'');
 const local=url=>{try{const u=new URL(url,document.baseURI);return u.origin===location.origin&&/^https?:$/.test(u.protocol)?u.href:null;}catch{return null;}};
 function status(){document.documentElement.dataset.resourceWarmup=JSON.stringify({target,pending:queue.length,busy:flights.size>0,active:flights.size,completed:done.size,preparing:prepareBusy,transitioning,preparationPending:preparations.filter(p=>!p.cancelled&&!p.done).map(p=>p.id),prepared:preparations.filter(p=>!p.cancelled&&p.done).map(p=>p.id)});}
 function model(url){
  const key=local(url);if(!key)return Promise.reject(Error('Model requires HTTP preview'));
  if(buffers.has(key))return buffers.get(key);
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
  const promise=fetch(key,{cache:'force-cache',signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Model HTTP '+r.status);return r.arrayBuffer();}).catch(e=>{buffers.delete(key);throw e;}).finally(()=>clearTimeout(timeout));
  buffers.set(key,promise);return promise;
 }
 function warm(job){
  if(done.has(job.key))return Promise.resolve();if(flights.has(job.key))return flights.get(job.key);
  let work;
  if(job.kind==='model')work=model(job.key);
  else if(job.kind==='module'){
   // Download modules without evaluating them or creating a WebGL context.
   work=new Promise((resolve,reject)=>{const link=document.createElement('link');link.rel='modulepreload';link.href=job.key;link.fetchPriority='low';let timeout;const finish=error=>{clearTimeout(timeout);link.onload=link.onerror=null;if(error){link.remove();reject(Error('Module preload failed'));}else resolve();};link.onload=()=>finish(false);link.onerror=()=>finish(true);timeout=setTimeout(()=>finish(true),10000);document.head.append(link);});
  }else work=new Promise((resolve,reject)=>{const img=new Image();img.decoding='async';img.fetchPriority=job.priority===0?'high':'low';const timeout=setTimeout(()=>{img.onload=img.onerror=null;reject(Error('Image timeout'));},12000);img.onload=()=>{clearTimeout(timeout);(img.decode?.()||Promise.resolve()).catch(()=>{}).then(resolve);};img.onerror=()=>{clearTimeout(timeout);reject(Error('Image failed'));};img.src=job.key;});
  const promise=work.then(()=>{done.add(job.key);}).finally(()=>flights.delete(job.key));flights.set(job.key,promise);return promise;
 }
 function add(id,priority){
  if(!order.includes(id))return;
  const section=window.SITE_DATA?.sections[id];
  const urls=(section?.gallery||[]).map(p=>id==='poetry'?p.src:(p.thumb||p.src));
  if(id==='art')urls.push('assets/museum-visitor-v29.png');
  for(const [kind,list] of [['image',urls],['module',modules[id]||[]],['model',models[id]?[models[id]]:[]]])for(const url of list){
   const key=local(url);if(!key||done.has(key)||flights.has(key))continue;
   const existing=queue.find(j=>j.key===key);if(existing){existing.priority=Math.min(existing.priority,priority);existing.id=priority===0?id:existing.id;}else queue.push({id,key,kind,priority});
  }
  queue.sort((a,b)=>a.priority-b.priority);schedule();status();
 }
 function schedule(){
  if(timer||idle||!running||document.hidden||!queue.length)return;
  // No speculative work during a transition; target resources still take priority.
  if((transitioning||constrained())&&!queue.some(j=>j.priority===0))return;
  timer=setTimeout(()=>{timer=0;const run=()=>{idle=0;pump();};if(window.requestIdleCallback)idle=requestIdleCallback(run,{timeout:1200});else run();},40);
 }
 function pump(){
  if(document.hidden||!running)return;
  const limit=document.body.classList.contains('startup-open')?3:1;
  while(flights.size<limit){
   const index=queue.findIndex(j=>!((transitioning||constrained())&&j.priority!==0));if(index<0)break;
   const job=queue.splice(index,1)[0];warm(job).catch(()=>{}).finally(()=>{status();schedule();});
  }status();
 }
 function prioritize(id){
  if(!order.includes(id))return;target=id;queue.forEach(j=>j.priority=3);add(id,0);
  // Let one requested scene overtake a slow speculative download without a burst.
  const first=queue.find(j=>j.id===id&&j.priority===0);
  if(flights.size&&first&&flights.size<2&&!flights.has(first.key)){queue.splice(queue.indexOf(first),1);warm(first).catch(()=>{}).finally(()=>{status();schedule();});}
 }
 // Construction is also prepaid at the welcome screen, one scene per idle turn.
 // Keep it separate from downloads, and never run it during the reveal/section fade.
 function schedulePreparation(){
  if(prepareTimer||prepareIdle||prepareBusy||!running||document.hidden||transitioning||constrained()||!preparations.some(p=>!p.done&&!p.cancelled))return;
  if(document.querySelector('.site-start.is-entering')||document.body.classList.contains('directory-travel'))return;
  prepareTimer=setTimeout(()=>{prepareTimer=0;const run=()=>{
   prepareIdle=0;if(prepareBusy||document.hidden||transitioning||document.querySelector('.site-start.is-entering')||document.body.classList.contains('directory-travel'))return;
   const job=preparations.filter(p=>!p.done&&!p.cancelled).sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id))[0];if(!job)return;
   prepareBusy=true;status();Promise.resolve().then(()=>job.cancelled?undefined:job.prepare()).catch(()=>{}).finally(()=>{job.done=true;prepareBusy=false;status();schedulePreparation();});
  };if(window.requestIdleCallback)prepareIdle=requestIdleCallback(run,{timeout:1500});else run();},300);
 }
 function registerPreparation(id,prepare){const job={id,prepare,done:false,cancelled:false};preparations.push(job);schedulePreparation();return ()=>{job.cancelled=true;const i=preparations.indexOf(job);if(i>=0)preparations.splice(i,1);status();};}
 function begin(){if(running)return;running=true;if(!constrained())for(const id of order.slice(1))add(id,id==='journey'||id==='contact'?1:2);schedule();schedulePreparation();}
 addEventListener('load',()=>setTimeout(begin,600),{once:true});
 if(document.readyState==='complete')setTimeout(begin,600);
 addEventListener('shili:site-enter',()=>{begin();schedule();schedulePreparation();});
 addEventListener('shili:scene-prepare',e=>{transitioning=true;prioritize(e.detail.id);});
 addEventListener('shili:scene-arrive',e=>{transitioning=false;prioritize(e.detail.id);if(!constrained()){const next=order[order.indexOf(e.detail.id)+1];if(next)add(next,1);}schedule();schedulePreparation();});
 addEventListener('shili:scene-cancel',()=>{transitioning=false;schedule();schedulePreparation();});
 document.addEventListener('click',e=>{const link=e.target.closest?.('#navigation a[href^="#/"]');if(link)prioritize(link.getAttribute('href').slice(2));},true);
 document.addEventListener('visibilitychange',()=>{schedule();schedulePreparation();});
 window.shiliSceneResources={model,prioritize,registerPreparation};
})();

// Keep section shells/layout stable; build expensive controllers only nearby.
function mountSceneWhenNeeded(root,factory){
 const section=root.closest('[data-section]'),id=section?.dataset.section;let instance=null,disposed=false,observer;
 const start=()=>{if(disposed||!root.isConnected)return;if(!instance){instance=factory();root.dataset.sceneMounted='true';observer?.disconnect();}return instance;};
 const prepare=e=>{if(e.detail.id===id)start();};
 const editor=()=>{if(document.body.classList.contains('site-editor-active'))start();};
 const enter=()=>{const r=section?.getBoundingClientRect();if(r&&r.bottom>-800&&r.top<innerHeight+800)start();};
 if(!section){start();return ()=>{disposed=true;instance?.destroy();};}
 observer=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)&&!document.body.classList.contains('startup-open'))start();},{rootMargin:'800px 0px'});observer.observe(section);
 const mutation=new MutationObserver(editor);mutation.observe(document.body,{attributes:true,attributeFilter:['class']});
 const unregister=window.shiliSceneResources.registerPreparation(id,async()=>{const scene=start();await scene?.preload?.();if(!disposed)root.dataset.scenePrepared='true';});
 window.addEventListener('shili:scene-request',prepare);window.addEventListener('shili:site-enter',enter);window.addEventListener('beforeprint',start);root.addEventListener('focusin',start);editor();
 return ()=>{disposed=true;unregister();observer.disconnect();mutation.disconnect();window.removeEventListener('shili:scene-request',prepare);window.removeEventListener('shili:site-enter',enter);window.removeEventListener('beforeprint',start);root.removeEventListener('focusin',start);instance?.destroy();};
}
