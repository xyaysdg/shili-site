/* Interaction only: original manuscripts and article copy remain unchanged. */
class ShiliExperience {
 constructor() {
  this.dialog=document.querySelector('#lightbox');
  this.image=document.querySelector('#lightbox-image');
  this.stage=document.querySelector('.lightbox-stage');
  this.serial=0;this.items=[];this.index=0;this.pageCleanup=()=>{};
  try{this.memory=JSON.parse(localStorage.getItem('shili-poetry-reading'))||{};}catch{this.memory={};}
  if(!this.memory || typeof this.memory!=='object')this.memory={};
  this.rail=document.createElement('nav');this.rail.className='poetry-pages';this.rail.setAttribute('aria-label','诗稿翻页');
  this.dialog.append(this.rail);
  this.stage.tabIndex=0;this.stage.setAttribute('aria-label','作品阅读区域');
  this.stage.addEventListener('scroll',()=>{if(this.blankPress)this.blankPress.moved=true;if(this.ready)this.savePoem();},{passive:true});
  const blank=target=>target instanceof Element&&!target.closest('img,button,a,input,textarea,select,.lightbox-caption,#lightbox-count,.poetry-pages,.image-flight');
  this.dialog.addEventListener('pointerdown',e=>{this.blankPress=e.isPrimary&&e.button===0&&blank(e.target)?{id:e.pointerId,x:e.clientX,y:e.clientY,moved:false}:null;});
  this.dialog.addEventListener('pointermove',e=>{const p=this.blankPress;if(p&&p.id===e.pointerId&&Math.hypot(e.clientX-p.x,e.clientY-p.y)>8)p.moved=true;});
  this.dialog.addEventListener('pointercancel',()=>{this.blankPress=null;});
  this.dialog.addEventListener('click',e=>{const p=this.blankPress;this.blankPress=null;if(p&&!p.moved&&blank(e.target))this.close();});
  this.dialog.addEventListener('cancel',e=>{e.preventDefault();this.close();});
  this.dialog.addEventListener('close',()=>{
   if(this.dialog.open)return;
   this.surfaceAnimation?.cancel();
   this.ready=false;this.blankPress=null;this.cancelFlight();document.body.classList.toggle('modal-open',!!document.querySelector('dialog[open]'));
   if(this.trigger?.isConnected)this.trigger.focus({preventScroll:true});
   this.resumeButton();
  });
 }
 reduced(){return matchMedia('(prefers-reduced-motion: reduce)').matches;}
 cancelFlight(){this.serial++;this.animation?.cancel();this.flight?.remove();this.flight=null;this.image.style.visibility='';}
 sourceImage(){
  if(this.index===this.startIndex&&this.trigger?.isConnected&&(!this.trigger.matches('.photo-print')||Number(this.trigger.dataset.photoIndex)===this.index))return this.trigger.matches('img')?this.trigger:this.trigger.querySelector('img');
  if(this.group==='photography'){const candidates=[...document.querySelectorAll('button.photo-print')].filter(e=>Number(e.dataset.photoIndex)===this.index).map(e=>e.querySelector('img'));const visible=candidates.find(e=>this.visible(e));if(visible)return visible;}
  return [...document.querySelectorAll('[data-gallery]')].filter(e=>e.dataset.gallery===this.group&&Number(e.dataset.index)===this.index).map(e=>e.querySelector('img')).find(e=>this.visible(e));
 }
 visible(el){if(!el)return false;const r=el.getBoundingClientRect();if(el.closest('.photo-print'))return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;const v=el.closest('.flow-viewport')?.getBoundingClientRect();return r.width>0&&r.height>0&&r.top>=Math.max(0,v?.top||0)&&r.bottom<=Math.min(innerHeight,v?.bottom||innerHeight)&&r.left>=Math.max(0,v?.left||0)&&r.right<=Math.min(innerWidth,v?.right||innerWidth);}
 imagePose(el){
  if(!el)return null;const r=el.getBoundingClientRect();if(!el.closest('.photo-print')&&!el.matches('.image-flight'))return {...r.toJSON(),angle:0,filter:'none'};
  const card=el.closest('.photo-print')||el,row=card.closest('.photo-string'),m=new DOMMatrix(getComputedStyle(card).transform),angle=Math.atan2(m.b,m.a)*180/Math.PI+(row?(parseFloat(getComputedStyle(row).rotate)||0):0),width=el.clientWidth,height=el.clientHeight;
  return {left:r.left+r.width/2-width/2,top:r.top+r.height/2-height/2,width,height,angle,filter:getComputedStyle(el).filter};
 }
 async fly(from,to) {
  if(this.reduced()||!from||!to||!this.dialog.open)return;
  const clone=this.image.cloneNode();clone.removeAttribute('id');clone.alt='';clone.setAttribute('aria-hidden','true');clone.className='image-flight';
  const frame=r=>({left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',transform:'rotate('+(r.angle||0)+'deg)',filter:r.filter||'none'});
  Object.assign(clone.style,frame(from),{objectFit:'contain',transformOrigin:'50% 50%'});this.dialog.append(clone);this.flight=clone;this.image.style.visibility='hidden';
  this.animation=clone.animate([frame(from),frame(to)],{duration:620,easing:'cubic-bezier(.45,0,.25,1)',fill:'forwards'});
  try{await this.animation.finished;}catch{}
  clone.remove();if(this.flight===clone){this.flight=null;if(!this.closing)this.image.style.visibility='';}
 }
 surface(out=false){
  const current=getComputedStyle(this.dialog).backgroundColor;
  this.surfaceAnimation?.cancel();
  if(this.reduced())return Promise.resolve();
  const solid=getComputedStyle(this.dialog).backgroundColor;
  this.surfaceAnimation=this.dialog.animate([{backgroundColor:out?current:'transparent'},{backgroundColor:out?'transparent':solid}],{duration:620,easing:'cubic-bezier(.45,0,.25,1)',fill:'forwards'});
  return this.surfaceAnimation.finished.catch(()=>{});
 }
 open(items,index,trigger){
  this.surfaceAnimation?.cancel();
  this.cancelFlight();this.closing=false;this.items=items;this.index=index;this.startIndex=index;this.trigger=trigger;this.group=trigger?.dataset.gallery||(trigger?.closest('[data-photo-hanging]')?'photography':undefined);
  this.poetry=this.group==='poetry';this.dialog.classList.toggle('poetry-reading',this.poetry);
  this.dialog.dataset.lightboxGallery=this.group||'';
  this.dialog.setAttribute('aria-label',this.poetry?'诗稿阅读':'作品大图');
  const link=document.querySelector('#lightbox-wall');link.hidden=!['art','photography','pantheon','poetry'].includes(this.group);
  if(!link.hidden){link.href='#/wall/'+this.group;link.textContent=wallLabel(this.group)+' ↗';}
  const source=this.sourceImage();const from=this.visible(source)?this.imagePose(source):null;
  this.image.style.visibility='hidden';this.dialog.showModal();this.surface();document.body.classList.add('modal-open');this.update(from);
  document.querySelector('#lightbox-close').focus({preventScroll:true});
 }
 async update(from){
  this.cancelFlight();this.image.style.visibility='hidden';const token=this.serial;this.ready=false;this.dialog.classList.remove('zoomed','poetry-fit');
  const item=this.items[this.index];this.image.src=item.src;this.image.alt=item.caption||(this.poetry?'诗稿 ':'作品 ')+(this.index+1);
  document.querySelector('#lightbox-count').textContent=(this.poetry?'诗稿 / ':'')+String(this.index+1).padStart(2,'0')+' / '+this.items.length;
  document.querySelector('#lightbox-caption').textContent=[item.caption,item.description].filter(Boolean).join(' · ');
  const dl=document.querySelector('#image-download');dl.href=item.src;dl.download=item.src.split('/').pop();
  const zoom=document.querySelector('#zoom-toggle');zoom.textContent=this.poetry?'整页预览':'放大 ＋';zoom.setAttribute('aria-label',this.poetry?'切换整页预览':'放大作品');zoom.setAttribute('aria-pressed','false');
  document.querySelector('#lightbox-prev').disabled=this.items.length<2 || (this.poetry&&this.index===0);
  document.querySelector('#lightbox-next').disabled=this.items.length<2 || (this.poetry&&this.index===this.items.length-1);
  this.rail.hidden=!this.poetry;this.rail.replaceChildren();
  if(this.poetry)this.items.forEach((_,i)=>{const b=document.createElement('button');b.textContent=String(i+1).padStart(2,'0');b.setAttribute('aria-label','阅读第 '+(i+1)+' 页诗稿');if(i===this.index)b.setAttribute('aria-current','page');b.onclick=()=>this.go(i);this.rail.append(b);});
  this.stage.scrollTop=0;
  if(from&&!this.poetry&&!this.reduced())this.image.style.visibility='hidden';
  try{await this.image.decode();}catch{}
  if(token!==this.serial||!this.dialog.open)return;
  if(this.poetry){
   const ratio=Math.min(1,Math.max(0,Number(this.memory.positions?.[this.index])||0));
   this.stage.scrollTop=ratio*(this.stage.scrollHeight-this.stage.clientHeight);
   const current=this.rail.querySelector('[aria-current]');this.rail.scrollLeft=current.offsetLeft-this.rail.clientWidth/2+current.offsetWidth/2;
  }else if(from){await this.fly(from,this.image.getBoundingClientRect());}
  if(token===this.serial){if(!this.closing)this.image.style.visibility='';this.ready=true;this.savePoem();}
 }
 savePoem(){
  if(!this.poetry||!this.ready)return;
  const range=this.stage.scrollHeight-this.stage.clientHeight;
  const positions=this.memory.positions && typeof this.memory.positions==='object'?this.memory.positions:{};
  if(!this.dialog.classList.contains('poetry-fit'))positions[this.index]=range>0?this.stage.scrollTop/range:0;
  this.memory={index:this.index,positions};
  try{localStorage.setItem('shili-poetry-reading',JSON.stringify(this.memory));}catch{}
 }
 go(index){if(this.closing||!this.dialog.open)return;this.savePoem();this.index=index;this.update();}
 change(delta){let i=this.index+delta;if(this.poetry)i=Math.max(0,Math.min(this.items.length-1,i));else i=(i+this.items.length)%this.items.length;if(i!==this.index)this.go(i);}
 zoom(){
  if(this.closing||!this.ready)return;
  this.cancelFlight();this.savePoem();
  const on=this.dialog.classList.toggle(this.poetry?'poetry-fit':'zoomed');
  const b=document.querySelector('#zoom-toggle');b.textContent=this.poetry?(on?'阅读宽度':'整页预览'):(on?'适应屏幕 －':'放大 ＋');b.setAttribute('aria-pressed',String(on));
  if(this.poetry&&!on)this.stage.scrollTop=(this.memory.positions?.[this.index]||0)*(this.stage.scrollHeight-this.stage.clientHeight);
 }
 async close(immediate=false){
  if(!this.dialog.open)return;
  if(immediate){this.savePoem();this.surfaceAnimation?.cancel();this.cancelFlight();this.dialog.close();this.closing=false;return;}
  if(this.closing)return;this.closing=true;this.savePoem();const currentFrame=this.flight?this.imagePose(this.flight):null;this.cancelFlight();const token=this.serial;
  const source=this.sourceImage();
  const fade=this.surface(true);
  if(!this.poetry&&!this.dialog.classList.contains('zoomed')&&this.visible(source))await this.fly(currentFrame||this.image.getBoundingClientRect(),this.imagePose(source));
  this.image.style.visibility='hidden';await fade;
  if(token===this.serial){this.dialog.close();this.closing=false;}
 }
 resumeButton(){
  const wall=document.querySelector('[data-flow-wall][data-group="poetry"]');if(!wall)return;
  let b=document.querySelector('#poetry-resume');
  if(!Number.isInteger(this.memory.index)||this.memory.index<0||this.memory.index>=SITE_DATA.sections.poetry.gallery.length)return;
  if(!b){b=document.createElement('button');b.id='poetry-resume';b.className='poetry-resume text-tool';b.dataset.gallery='poetry';wall.before(b);}
  b.textContent='继续阅读 · '+String(this.memory.index+1).padStart(2,'0')+' / '+SITE_DATA.sections.poetry.gallery.length+' →';
  b.onclick=()=>this.open(SITE_DATA.sections.poetry.gallery,this.memory.index,b);
 }
 mountArticle(){
  this.pageCleanup();this.resumeButton();
  const article=document.querySelector('.reading-page'),body=article?.querySelector('.article-body');if(!body)return;
  const normalize=s=>s.replace(/\s+/g,' ').trim();
  const candidates=[...body.querySelectorAll('h1,h2,h3,h4,p')].filter(el=>{
   const text=normalize(el.textContent);if(!text||text.length>65)return false;
   if(/^H[1-4]$/.test(el.tagName))return true;
   const bold=normalize([...el.querySelectorAll('strong,b')].map(n=>n.textContent).join(''));
   return bold===text && (/^[一二三四五六七八九十百]+[、．.]/.test(text)||text.length<28&&/[：:]$/.test(text));
  });
  const numbered=candidates.filter(el=>/^[一二三四五六七八九十百]+[、．.]/.test(normalize(el.textContent)));
  const seen=new Set();const headings=(numbered.length>1?numbered:candidates).filter(el=>{const t=normalize(el.textContent);if(seen.has(t))return false;seen.add(t);return true;});
  // Original rich-text exports contain empty heading tags. Only actual text anchors are used.
  headings.forEach((el,i)=>{el.id='reading-section-'+i;el.classList.add('reading-anchor');});
  const meter=document.createElement('div');meter.className='reading-meter';meter.setAttribute('role','progressbar');meter.setAttribute('aria-label','正文阅读进度');meter.setAttribute('aria-valuemin','0');meter.setAttribute('aria-valuemax','100');meter.innerHTML='<span></span>';article.prepend(meter);
  let buttons=[];
  if(headings.length>1){
   article.classList.add('has-toc');const aside=document.createElement('aside');aside.className='article-toc';
   const details=document.createElement('details');details.open=innerWidth>=1250;
   const summary=document.createElement('summary');summary.textContent='本文目录';details.append(summary);
   const nav=document.createElement('nav');nav.setAttribute('aria-label','本文目录');
   buttons=headings.map((el,i)=>{const b=document.createElement('button');b.textContent=normalize(el.textContent);b.onclick=()=>{if(innerWidth<1250)details.open=false;el.scrollIntoView({behavior:this.reduced()?'instant':'smooth',block:'start'});el.tabIndex=-1;el.focus({preventScroll:true});};nav.append(b);return b;});
   details.append(nav);aside.append(details);document.querySelector('.article-heading').after(aside);
  }
  const leading=document.createElement('button');leading.className='text-tool';leading.textContent='疏朗行距';leading.setAttribute('aria-pressed','false');leading.onclick=()=>{const on=body.classList.toggle('relaxed-leading');leading.textContent=on?'标准行距':'疏朗行距';leading.setAttribute('aria-pressed',String(on));};document.querySelector('.reading-top>div').prepend(leading);
  let frame=0;
  const refresh=()=>{frame=0;const rect=body.getBoundingClientRect();const total=Math.max(1,rect.height-innerHeight+130);const progress=Math.round(Math.max(0,Math.min(1,(130-rect.top)/total))*100);meter.firstChild.style.transform='scaleX('+progress/100+')';meter.setAttribute('aria-valuenow',String(progress));let active=0;headings.forEach((el,i)=>{if(el.getBoundingClientRect().top<180)active=i;});buttons.forEach((b,i)=>{if(i===active)b.setAttribute('aria-current','location');else b.removeAttribute('aria-current');});};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(refresh);};window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);const observer=new ResizeObserver(schedule);observer.observe(body);refresh();
  this.pageCleanup=()=>{window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);observer.disconnect();cancelAnimationFrame(frame);this.pageCleanup=()=>{};};
 }
}
