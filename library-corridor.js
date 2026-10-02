/* A finite set of reusable objects represents an unbounded library aisle. */
function libraryBookMarkup(a,index){
 const palettes=[['#8eafa0','#253e35'],['#d7ad94','#553d30'],['#c4b27f','#514424'],['#a2b5c3','#304351'],['#bfa6b4','#513c49']];
 if(!articleBookPalette.has(a.slug))articleBookPalette.set(a.slug,palettes[Math.floor(Math.random()*palettes.length)]);
 const [color,ink]=articleBookPalette.get(a.slug);
 return `<a class="shelf-book" href="#/article/${E(a.slug)}" data-book-slug="${E(a.slug)}" aria-label="阅读：${E(a.title)}" style="--book-color:${color};--book-ink:${ink}"><span class="book-motion"><span class="book-object"><span class="book-spine"><span class="book-spine-rule"></span><span class="book-spine-title">${E(a.title)}</span><span class="book-spine-number">${String(index+1).padStart(2,'0')}</span></span><span class="book-cover"><span class="book-cover-category">${E(a.category)}</span><span class="book-cover-title">${E(a.title)}</span><span class="book-cover-bottom"><span>十里先生</span><time>${E(a.date.replaceAll('-','.'))}</time></span></span><span class="book-pages book-pages-top"></span><span class="book-pages book-pages-bottom"></span><span class="book-pages book-pages-side"></span><span class="book-back"></span></span></span></a>`;
}
function libraryIndexLinks(matching){return matching.map(a=>`<a href="#/article/${E(a.slug)}">${E(a.title)}</a>`).join('');}
function corridorMarkup(all,matching){
 const rows=Array.from({length:6},(_,row)=>`<div class="library-row ${row===0||row===5?'library-decoration-row':''}" data-row="${row}" style="--row:${row}"><div class="library-fillers" aria-hidden="true"><div class="library-filler-track">${Array.from({length:66},()=>'<span class="library-dummy"><i class="dummy-spine"></i><i class="dummy-cover"></i><i class="dummy-top"></i></span>').join('')}</div></div><div class="library-plank"></div><div class="library-plank-edge"></div>${row>0&&row<5?'<div class="library-article-slot"></div>':''}</div>`).join('');
 return `<div class="library-viewport" tabindex="0" role="region" aria-label="无限立体书架，左右拖动或使用左右方向键探索" data-articles="${E(JSON.stringify(matching.map(a=>a.slug)))}"><div class="library-plane">${rows}</div></div><div class="library-letters" aria-hidden="true">${Array.from({length:9},()=>'<span></span>').join('')}</div><div class="library-index" id="library-index" hidden>${libraryIndexLinks(matching)}</div>`;
}
class InfiniteLibrary {
  constructor(element,interaction){
   this.element=element;this.interaction=interaction;this.root=interaction.root;this.pool=JSON.parse(element.dataset.articles).map(slug=>D.articles.find(a=>a.slug===slug));this.offset=this.target=this.velocity=0;this.listeners=[];this.slots=[...element.querySelectorAll('.library-article-slot')];this.bookFlights=new Map();this.fillerTracks=[...element.querySelectorAll('.library-filler-track')];this.fillers=this.fillerTracks.map(e=>[...e.children]);this.hiddenFillers=this.fillers.map(()=>new Set());this.fillerWrapCount=0;this.sizeFrame=0;this.needsSizing=false;element.library=this;
   this.initFillers();
  const listen=(el,type,fn,options)=>{el.addEventListener(type,fn,options);this.listeners.push(()=>el.removeEventListener(type,fn,options));};
  listen(element,'pointerdown',e=>{if(e.button!==0||!e.isPrimary)return;this.drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastTime:performance.now(),start:this.target,moved:false};this.velocity=0;});
  listen(element,'pointermove',e=>{const d=this.drag;if(!d||d.id!==e.pointerId)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(!d.moved&&Math.abs(dy)>Math.abs(dx)+8){this.drag=null;return;}if(!d.moved&&Math.abs(dx)>7){d.moved=true;element.setPointerCapture(e.pointerId);element.classList.add('is-dragging');interaction.hide();}if(!d.moved)return;e.preventDefault();const now=performance.now(),dt=Math.max(8,now-d.lastTime);this.velocity=.6*this.velocity+.4*(e.clientX-d.lastX)*2.4/dt;this.target=d.start+dx*2.4;d.lastX=e.clientX;d.lastTime=now;this.root.libraryDragUntil=now+400;this.wake();});
  const release=e=>{if(!this.drag||e.pointerId!==this.drag.id)return;const moved=this.drag.moved;this.drag=null;element.classList.remove('is-dragging');if(element.hasPointerCapture(e.pointerId))element.releasePointerCapture(e.pointerId);if(moved){this.root.libraryDragUntil=performance.now()+400;this.wake();}};
  listen(element,'pointerup',release);listen(element,'pointercancel',e=>{this.velocity=0;release(e);});listen(element,'lostpointercapture',e=>{if(e.target===element)release(e);});
  listen(element,'dragstart',e=>e.preventDefault());
  listen(element,'keydown',e=>{if(!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;e.preventDefault();e.stopPropagation();interaction.hide();this.velocity=0;this.target=e.key==='Home'?0:this.target+(e.key==='ArrowRight'?1:-1)*760;this.wake();});

  this.section=element.closest('#section-writing');this.letterLayer=this.root.querySelector('.library-letters');this.section.append(this.letterLayer);
  this.layoutSeed=Math.random()*10000;
  const circularDistance=(a,b)=>Math.min(Math.abs(a-b),4050-Math.abs(a-b)),taken=[];
  this.rowPositions=Array.from({length:4},()=>{const row=[];for(let i=0;i<3;i++){let x,attempt=0;do{x=Math.random()*4050;attempt++;}while(attempt<2000&&(row.some(p=>circularDistance(p,x)<650)||taken.some(p=>circularDistance(p,x)<150)));row.push(x);taken.push(x);}return row.sort((a,b)=>a-b);});
  this.slots.forEach(slot=>{slot.after(slot.cloneNode(),slot.cloneNode());});this.slots=[...element.querySelectorAll('.library-article-slot')];
  this.letters=[...this.letterLayer.children];const characters=[...new Set(('篇篇起舞'+intro.writing).match(/[\u4e00-\u9fff]/g))];
  // Stable timelines avoid animationiteration changes to duration, delay and position.
  const titleRGB=(getComputedStyle(this.section.querySelector('h1')).color.match(/[\d.]+/g)||[207,177,109]).slice(0,3).map(Number);
  this.letters.forEach((e,i)=>{const blend=Math.random(),color=[255,237,141].map((v,k)=>Math.round(v+(titleRGB[k]-v)*blend));e.style.color='rgb('+color.join(',')+')';e.style.textShadow='0 0 9px rgba('+color.join(',')+',.25)';e.textContent=characters[Math.floor(Math.random()*characters.length)];e.style.left=(i<7?3+i*6.5+Math.random()*4:64+(i-7)*18+Math.random()*6)+'%';e.style.top=(Math.random()<.5?12+Math.random()*18:75+Math.random()*12)+'%';e.style.fontSize=(30+Math.random()*22)+'px';e.style.setProperty('--letter-angle',(-180+Math.random()*360)+'deg');e.style.setProperty('--letter-turn',((Math.random()<.5?-1:1)*(45+Math.random()*65))+'deg');e.style.setProperty('--letter-dx',(-110+Math.random()*220)+'px');e.style.setProperty('--letter-dy',(-120-Math.random()*100)+'px');e.style.animationDuration=(24+Math.random()*12)+'s';e.style.animationDelay=(-Math.random()*36)+'s';});
  const pauseLetters=()=>this.letters.forEach(e=>e.style.animationPlayState=!this.visible||document.hidden?'paused':'running');listen(document,'visibilitychange',pauseLetters);
   this.observer=new IntersectionObserver(es=>{this.visible=es[0].isIntersecting;pauseLetters();if(!this.visible){this.velocity=0;this.target=this.offset;if(this.drag&&element.hasPointerCapture(this.drag.id))element.releasePointerCapture(this.drag.id);this.drag=null;element.classList.remove('is-dragging');interaction.hide();cancelAnimationFrame(this.frame);this.frame=0;this.finishMotion();}},{threshold:0});this.observer.observe(element);this.visible=true;this.resize=new ResizeObserver(()=>{this.needsSizing=true;this.queueSizeBooks();});this.resize.observe(element);this.paint();this.sizeBooks();
  this.entrance=new SectionEntrance(this.section,'library');
 }
  replaceArticles(articles){
   // Let the original lifecycle handle unfinished entrances and empty results.
   if(this.destroyed||!articles.length||this.section.dataset.sceneEntrance!=='ready')return false;
   this.interaction.hide();
   this.bookFlights.forEach(animation=>animation.cancel());this.bookFlights.clear();
   cancelAnimationFrame(this.frame);this.frame=0;
   cancelAnimationFrame(this.sizeFrame);this.sizeFrame=0;
   const drag=this.drag;this.drag=null;
   if(drag&&this.element.hasPointerCapture(drag.id))this.element.releasePointerCapture(drag.id);
   this.element.classList.remove('is-dragging');this.velocity=0;this.target=this.offset;
   this.root.libraryDragUntil=0;
   this.pool=articles;this.element.dataset.articles=JSON.stringify(articles.map(a=>a.slug));
   this.paint();this.finishMotion();return true;
  }
  initFillers(){
   this.fillers.forEach((books,row)=>books.forEach((element,index)=>{const seed=Math.sin(index*127.1+row*311.7)*43758.5453,random=seed-Math.floor(seed),width=32+((random*71)%17);element.style.left=index*58+'px';element.style.setProperty('--dummy-x',String(index*58-852));element.style.setProperty('--dummy-h',(76+random*21)+'%');element.style.setProperty('--dummy-w',width+'px');element.dataset.width=width.toFixed(3);element.style.transform='translate3d(0,0,0)';}));
  }
  syncFillers(positions){
   const period=3828,phase=((this.offset%period)+period)%period,wrapCount=Math.max(0,Math.floor((phase-.0001)/58));
   if(wrapCount!==this.fillerWrapCount){const start=Math.min(wrapCount,this.fillerWrapCount),end=Math.max(wrapCount,this.fillerWrapCount);for(const books of this.fillers)for(let count=start;count<end;count++){const element=books[65-count];if(element){const wrapped=wrapCount>this.fillerWrapCount;element.style.transform=wrapped?'translate3d(-3828px,0,0)':'translate3d(0,0,0)';element.style.setProperty('--dummy-wrap',wrapped?'-3828':'0');}}this.fillerWrapCount=wrapCount;}
   this.fillerTracks.forEach(track=>{track.style.transform=`translate3d(${phase}px,0,0)`;track.style.setProperty('--filler-phase',String(phase));});
   this.fillers.forEach((books,row)=>{const next=new Set(),articlePositions=positions[row]||[];for(const articleX of articlePositions){const center=Math.round((articleX+852-phase)/58);for(let delta=-2;delta<=2;delta++){const index=((center+delta)%66+66)%66,element=books[index];if(!element)continue;const x=index*58-852+phase-(index>=66-wrapCount?period:0),width=+element.dataset.width;if(x<articleX+43&&x+width>articleX-1)next.add(element);}}for(const element of this.hiddenFillers[row])if(!next.has(element))element.style.visibility='visible';for(const element of next)if(!this.hiddenFillers[row].has(element))element.style.visibility='hidden';this.hiddenFillers[row]=next;});
  }
  paint(){
  const period=4050,mod=(n,p)=>((n%p)+p)%p,positions=Array.from({length:6},()=>[]);
  const smooth=n=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
  // Both ends are fully transparent before a world object is recycled.
  const fade=(x,end)=>smooth((x-100)/1100)*smooth((end-x)/240);let changed=false;
  this.slots.forEach((slot,i)=>{
   if(!this.pool.length){slot.innerHTML='';return;}
   const row=Math.floor(i/3),base=this.rowPositions[row][i%3],cycle=Math.floor((base+this.offset+650)/period),cell=i%3-cycle*3;
   const seed=Math.sin(cell*127.1+row*311.7+this.layoutSeed)*43758.5453,jitter=((seed-Math.floor(seed))-.5)*160;
   const x=base+this.offset-cycle*period+jitter,index=mod(cell*4+row,this.pool.length),a=this.pool[index];
   if(slot.dataset.slug!==a.slug){const focused=slot.contains(document.activeElement);slot.dataset.slug=a.slug;slot.innerHTML=libraryBookMarkup(a,D.articles.indexOf(a));changed=true;if(focused)this.element.focus({preventScroll:true});}
   slot.style.transform=`translate3d(${x}px,0,1px)`;slot.style.setProperty('--distance-fog',Math.max(0,Math.min(70,(1200-x)*.055))+'%');const alpha=fade(x,2920);slot.style.setProperty('--distance-alpha',alpha.toFixed(5));const book=slot.querySelector('.shelf-book');book.toggleAttribute('data-distance-hidden',alpha===0);book.tabIndex=alpha>.15?0:-1;positions[row+1].push(x);
  });
   this.syncFillers(positions);
   this.element.dataset.position=this.offset.toFixed(1);if(changed){this.needsSizing=true;if(!this.frame&&!this.drag)this.queueSizeBooks();}
 }
 updateFocusTargets(){
  // Recycled volumes beyond the screen must not become invisible Tab stops.
  const v=this.element.getBoundingClientRect(),items=this.slots.map(slot=>({book:slot.querySelector('.shelf-book'),rect:slot.getBoundingClientRect(),alpha:+slot.style.getPropertyValue('--distance-alpha')}));
  items.forEach(({book,rect:r,alpha})=>{if(book)book.tabIndex=alpha>.15&&r.right>Math.max(0,v.left)&&r.left<Math.min(innerWidth,v.right)&&r.bottom>Math.max(74,v.top)&&r.top<Math.min(innerHeight-60,v.bottom)?0:-1;});
 }
 hold(){this.velocity=0;this.target=this.offset;}
 fitPreview(book){
  const object=book.querySelector('.book-motion'),cover=book.querySelector('.book-cover');let shift=0;object.style.transition='none';book.style.setProperty('--preview-shift','0px');book.style.setProperty('--preview-lift','0px');
  // Measure the final projected cuboid, not just the old spine hit area.
  for(let i=0;i<3;i++){const r=cover.getBoundingClientRect(),delta=r.left<16?16-r.left:r.right>innerWidth-16?innerWidth-16-r.right:0;if(Math.abs(delta)<1)break;book.style.setProperty('--preview-shift',(shift+20)+'px');const slope=(cover.getBoundingClientRect().left-r.left)/20;shift+=delta/Math.max(.15,slope);book.style.setProperty('--preview-shift',shift+'px');}
  // The top and bottom rows can be clipped after extraction; fit the projected cover vertically too.
  const top=Math.max(74,this.element.getBoundingClientRect().top+12),toolsTop=this.element.closest('#section-writing')?.querySelector('.writing-tools')?.getBoundingClientRect().top,bottom=innerWidth<=600&&toolsTop>top+100?Math.min(innerHeight-72,toolsTop-16):innerHeight-72;let lift=0;
  for(let i=0;i<3;i++){const r=cover.getBoundingClientRect(),delta=r.top<top?top-r.top:r.bottom>bottom?bottom-r.bottom:0;if(Math.abs(delta)<.5)break;book.style.setProperty('--preview-lift',(lift+20)+'px');const slope=(cover.getBoundingClientRect().top-r.top)/20;lift+=delta/Math.max(.15,slope);book.style.setProperty('--preview-lift',lift+'px');}
  object.style.removeProperty('transition');
 }
 pose(book){const motion=book?.querySelector('.book-motion');if(!motion)return 'none';const pose=getComputedStyle(motion).transform;const flight=this.bookFlights.get(motion);if(flight){flight.cancel();this.bookFlights.delete(motion);}return pose;}
 animateBook(book,opening,from){
  const motion=book?.querySelector('.book-motion');if(!motion)return;from??=this.pose(book);const to=getComputedStyle(motion).transform;if(this.interaction.motion.matches)return;
  const depth=parseFloat(getComputedStyle(book).getPropertyValue('--book-depth')),scale=parseFloat(getComputedStyle(book).getPropertyValue('--preview-scale'))||1,clearance=Math.max(depth+40,depth*scale+40),clear='translate3d(0,0,'+clearance+'px)';
  // The entire cuboid clears the shelf before changing height, angle or scale.
  const frames=[{transform:from,offset:0},{transform:clear,offset:opening?.44:.56},{transform:to,offset:1}];
  const animation=motion.animate(frames,{duration:850,easing:'cubic-bezier(.3,.65,.3,1)',fill:'both'});this.bookFlights.set(motion,animation);
  animation.onfinish=()=>{if(this.bookFlights.get(motion)===animation){animation.cancel();this.bookFlights.delete(motion);}};
 }
  queueSizeBooks(){if(this.sizeFrame||this.destroyed)return;this.sizeFrame=requestAnimationFrame(()=>{this.sizeFrame=0;if(this.frame||this.drag)return;this.sizeBooks();});}
  finishMotion(){if(this.needsSizing)this.sizeBooks();else this.updateFocusTargets();}
  sizeBooks(){cancelAnimationFrame(this.sizeFrame);this.sizeFrame=0;this.needsSizing=false;let shelfDepth=180;this.slots.forEach(slot=>{
  const height=slot.clientHeight,cover=Math.round(height*(innerWidth<=600?1.05:.7));
  slot.style.setProperty('--cover-width',cover+'px');slot.style.setProperty('--book-depth',cover+'px');shelfDepth=Math.max(shelfDepth,cover+24);
   let titleSize=Math.max(12,Math.min(27,height*.095));
   slot.style.setProperty('--cover-title-size',titleSize+'px');slot.style.setProperty('--cover-small-size',Math.max(7,Math.min(12,height*.042))+'px');slot.style.setProperty('--cover-padding',Math.max(6,height*.06)+'px');
  const face=slot.querySelector('.book-cover');
  // Start large, then fit the actual original title; long articles must not clip.
   if(face&&face.scrollHeight>face.clientHeight+1){let low=9,high=titleSize;while(high-low>.5){const middle=Math.floor((low+high)*2)/4;slot.style.setProperty('--cover-title-size',middle+'px');if(face.scrollHeight<=face.clientHeight+1)low=middle;else high=middle;}titleSize=low;slot.style.setProperty('--cover-title-size',titleSize+'px');}
   });this.element.style.setProperty('--shelf-depth',shelfDepth+'px');this.updateFocusTargets();}

  wake(){if(document.body.classList.contains('site-editor-active')||this.frame||this.destroyed)return;let previous;const step=t=>{if(document.body.classList.contains('site-editor-active')){this.frame=0;this.velocity=0;this.target=this.offset;return;}const dt=previous?Math.min(40,t-previous):16;previous=t;if(!this.drag){this.target+=this.velocity*dt;this.velocity*=Math.exp(-dt/220);}this.offset+=(this.target-this.offset)*(this.interaction.motion.matches?1:1-Math.exp(-dt/100));this.paint();if(Math.abs(this.target-this.offset)>.1||Math.abs(this.velocity)>.005)this.frame=requestAnimationFrame(step);else{this.frame=0;this.offset=this.target;this.paint();this.finishMotion();}};this.frame=requestAnimationFrame(step);}
  destroy(){this.bookFlights.forEach(a=>a.cancel());this.bookFlights.clear();this.destroyed=true;cancelAnimationFrame(this.frame);cancelAnimationFrame(this.sizeFrame);this.entrance.destroy();this.letterLayer.remove();this.observer.disconnect();this.resize.disconnect();this.listeners.forEach(off=>off());}
}
