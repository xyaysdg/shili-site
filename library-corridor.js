/* A finite set of reusable objects represents an unbounded library aisle. */
function libraryBookMarkup(a,index){
 const palettes=[['#8eafa0','#253e35'],['#d7ad94','#553d30'],['#c4b27f','#514424'],['#a2b5c3','#304351'],['#bfa6b4','#513c49']];
 if(!articleBookPalette.has(a.slug))articleBookPalette.set(a.slug,palettes[Math.floor(Math.random()*palettes.length)]);
 const [color,ink]=articleBookPalette.get(a.slug);
 return `<a class="shelf-book" href="#/article/${E(a.slug)}" data-book-slug="${E(a.slug)}" aria-label="阅读：${E(a.title)}" style="--book-color:${color};--book-ink:${ink}"><span class="book-motion"><span class="book-object"><span class="book-spine"><span class="book-spine-rule"></span><span class="book-spine-title">${E(a.title)}</span><span class="book-spine-number">${String(index+1).padStart(2,'0')}</span></span><span class="book-cover"><span class="book-cover-category">${E(a.category)}</span><span class="book-cover-title">${E(a.title)}</span><span class="book-cover-bottom"><span>十里先生</span><time>${E(a.date.replaceAll('-','.'))}</time></span></span><span class="book-pages book-pages-top"></span><span class="book-pages book-pages-bottom"></span><span class="book-pages book-pages-side"></span><span class="book-back"></span></span></span></a>`;
}
function libraryIndexLinks(matching){return matching.map(a=>`<a href="#/article/${E(a.slug)}">${E(a.title)}</a>`).join('');}
// Five shared line-book silhouettes; no textures, per-book shadows or page grain.
const libraryFillerStyles=[{w:32,h:96,r:3},{w:39,h:86,r:1},{w:47,h:92,r:2},{w:35,h:78,r:4},{w:43,h:98,r:0}];
function libraryBookPreviewDepth(depth,height,scale){
 // Bound the rear corners, including the existing +/-3deg yaw and +/-2deg
 // pointer tilt. Keep a small 6px gap rather than a large display clearance.
 return Math.max(depth+6,scale*(depth+21*Math.sin(13*Math.PI/180)+height*.5*Math.sin(2*Math.PI/180))+6);
}
function corridorMarkup(all,matching){
 const rows=Array.from({length:6},(_,row)=>`<div class="library-row ${row===0||row===5?'library-decoration-row':''}" data-row="${row}" style="--row:${row}"><div class="library-fillers" aria-hidden="true"><div class="library-filler-track"></div></div><div class="library-plank"></div><div class="library-plank-edge"></div>${row>0&&row<5?'<div class="library-article-slot"></div>':''}</div>`).join('');
 return `<div class="library-viewport" tabindex="0" role="region" aria-label="无限立体书架，左右拖动或使用左右方向键探索" data-articles="${E(JSON.stringify(matching.map(a=>a.slug)))}"><div class="library-plane">${rows}</div></div><div class="library-letters" aria-hidden="true">${Array.from({length:9},()=>'<span></span>').join('')}</div><div class="library-index" id="library-index" hidden>${libraryIndexLinks(matching)}</div>`;
}
class InfiniteLibrary {
  constructor(element,interaction){
   this.element=element;this.interaction=interaction;this.root=interaction.root;this.pool=JSON.parse(element.dataset.articles).map(slug=>D.articles.find(a=>a.slug===slug));this.offset=this.target=this.velocity=0;this.listeners=[];this.slots=[...element.querySelectorAll('.library-article-slot')];this.bookFlights=new Map();this.fillerTracks=[...element.querySelectorAll('.library-filler-track')];this.fillers=this.fillerTracks.map(e=>[...e.children]);this.hiddenFillers=this.fillers.map(()=>new Set());this.fillerWrapCount=0;this.sizeFrame=0;this.needsSizing=false;element.library=this;
   this.initFillers();
  const listen=(el,type,fn,options)=>{el.addEventListener(type,fn,options);this.listeners.push(()=>el.removeEventListener(type,fn,options));};
  listen(element,'pointerdown',e=>{if(e.button!==0||!e.isPrimary)return;this.drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastTime:performance.now(),start:this.offset,moved:false};this.velocity=0;});
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
  if(['127.0.0.1','localhost',''].includes(location.hostname))this.createBookTuner();
 }
  replaceArticles(articles){
   // Let the original lifecycle handle unfinished entrances and empty results.
   if(this.destroyed||!articles.length||this.section.dataset.sceneEntrance!=='ready')return false;
   this.interaction.hide();
   this.bookFlights.forEach(animation=>animation.cancel());this.bookFlights.clear();this.bookPaths=new WeakMap();
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
   this.measureFillers();
  }
  measureFillers(){
   // Invert the existing Y-rotated scene at the two depth extremes. Reading
   // geometry happens only at construction/resize, never on the drag RAF.
   let min=100,max=2920;
   const plane=this.element.querySelector('.library-plane');
   if(plane){
    const view=getComputedStyle(this.element),style=getComputedStyle(plane),matrix=style.transform.match(/^matrix3d\(([^)]+)\)$/)?.[1].split(',').map(Number),p=parseFloat(view.perspective),origin=parseFloat(style.transformOrigin),camera=parseFloat(view.perspectiveOrigin),rect=this.element.getBoundingClientRect(),width=this.element.clientWidth;
    if(matrix?.length===16&&matrix.every(Number.isFinite)&&p>0&&width>0&&Number.isFinite(origin)&&Number.isFinite(camera)&&!style.transformOrigin.includes('%')&&!view.perspectiveOrigin.includes('%')&&Math.abs(matrix[4])+Math.abs(matrix[6])<1e-8){
     // V152: recycle behind the opaque foreground, not at a fixed world X.
     // The same CSS stop drives both themes; include all depth/width corners.
     const foreground=this.element.closest?.('#section-writing')?.querySelector('.section-content');
     const foregroundRect=foreground?.getBoundingClientRect();
     const stop=foreground?parseFloat(getComputedStyle(foreground).getPropertyValue('--library-opaque-stop')):NaN;
     const opaque=(foregroundRect?.left??rect.left)+(foregroundRect?.width??width)*(Number.isFinite(stop)?stop/100:innerWidth<=600?0:.32);
     const left=Math.max(0,-rect.left,opaque-rect.left)-48,right=Math.min(width,innerWidth-rect.left)+48;
     const samples=[];let safe=true;
     for(const z of [-160,0]){
      const a=plane.offsetLeft+origin-matrix[0]*origin+matrix[8]*z+matrix[12],b=-matrix[2]*origin+matrix[10]*z+matrix[14];
      for(const x of [100,2969])if(p-b-matrix[2]*x<=1)safe=false;
      for(const screen of [left,right]){
       const q=(screen-camera)/p,divisor=matrix[0]+q*matrix[2],x=(q*(p-b)-(a-camera))/divisor;
       if(!Number.isFinite(x)||divisor<=1e-6)safe=false;else samples.push(x);
      }
     }
     if(safe){min=Math.min(...samples)-49-58;max=Math.max(...samples)+58;}
    }
   }
   if(max<=min){min=100;max=2920;}
   const changed=this.fillerRange?.min!==min||this.fillerRange?.max!==max;this.fillerRange={min,max};
   const count=Math.ceil((max-min)/58)+2;
   if(this.fillers[0]?.length!==count){
    const markup=Array.from({length:count},()=>'<span class="library-dummy"><i class="dummy-spine"></i><i class="dummy-cover"></i><i class="dummy-top"></i></span>').join('');
    this.fillerTracks.forEach(track=>{track.innerHTML=markup;});
    this.fillers=this.fillerTracks.map(track=>[...track.children]);this.hiddenFillers=this.fillers.map(()=>new Set());this.fillerFirst=this.fillerLast=null;
   }
   return changed;
  }
  syncFillers(positions){
   const period=3828,phase=((this.offset%period)+period)%period,{min,max}=this.fillerRange,first=Math.ceil((min+852-phase)/58),last=Math.floor((max+852-phase)/58),recycle=first!==this.fillerFirst||last!==this.fillerLast,mod=(n,p)=>((n%p)+p)%p;
   if(phase!==this.fillerPhase){
    this.fillerPhase=phase;
    this.fillerTracks.forEach(track=>{track.style.transform=`translate3d(${phase}px,0,0)`;});
   }
   this.fillers.forEach((books,row)=>{
    if(recycle){
    for(let index=first;index<=last;index++){
     const element=books[mod(index,books.length)];
     if(element.libraryFillerIndex!==index){
      element.libraryFillerIndex=index;const sourceIndex=mod(index,66),seed=Math.sin(sourceIndex*127.1+row*311.7)*43758.5453,kind=Math.floor((seed-Math.floor(seed))*5),shape=libraryFillerStyles[kind];
      element.style.left=index*58+'px';
      if(element.dataset.lineStyle!==String(kind)){element.dataset.lineStyle=String(kind);element.style.setProperty('--dummy-h',shape.h+'%');element.style.setProperty('--dummy-w',shape.w+'px');element.style.setProperty('--dummy-radius',shape.r+'px');element.dataset.width=String(shape.w);}
     }
    }
    // At most two spare nodes: never add/remove DOM during pointer movement.
    books.forEach(element=>{const hidden=element.libraryFillerIndex<first||element.libraryFillerIndex>last||element.libraryFillerIndex===undefined;if(element.hidden!==hidden)element.hidden=hidden;});
    }
    const next=new Set(),articlePositions=positions[row]||[];
    for(const articleX of articlePositions){const center=Math.round((articleX+852-phase)/58);for(let delta=-2;delta<=2;delta++){const index=center+delta;if(index<first||index>last)continue;const element=books[mod(index,books.length)],x=index*58-852+phase,width=+element.dataset.width;if(x<articleX+43&&x+width>articleX-1)next.add(element);}}
    for(const element of this.hiddenFillers[row])if(!next.has(element))element.style.visibility='visible';
    for(const element of next)if(!this.hiddenFillers[row].has(element))element.style.visibility='hidden';this.hiddenFillers[row]=next;
   });
   this.fillerFirst=first;this.fillerLast=last;
  }
  paint(){
  const period=4050,mod=(n,p)=>((n%p)+p)%p,positions=Array.from({length:6},()=>[]);
  // Left recycling is hidden by the foreground; right recycling stays beyond the viewport.
  let changed=false;
  this.slots.forEach((slot,i)=>{
   if(!this.pool.length){slot.innerHTML='';return;}
   const row=Math.floor(i/3),base=this.rowPositions[row][i%3],cycle=Math.floor((base+this.offset+650)/period),cell=i%3-cycle*3;
   const seed=Math.sin(cell*127.1+row*311.7+this.layoutSeed)*43758.5453,jitter=((seed-Math.floor(seed))-.5)*160;
   const x=base+this.offset-cycle*period+jitter,index=mod(cell*4+row,this.pool.length),a=this.pool[index];
   if(slot.dataset.slug!==a.slug){const focused=slot.contains(document.activeElement);slot.dataset.slug=a.slug;slot.innerHTML=libraryBookMarkup(a,D.articles.indexOf(a));slot.libraryPaint=null;changed=true;if(focused)this.element.focus({preventScroll:true});}
   const state=slot.libraryPaint||(slot.libraryPaint={}),transform=`translate3d(${x}px,0,1px)`,alpha=x>=100&&x<=2920?1:0;
   if(state.transform!==transform){slot.style.transform=transform;state.transform=transform;}
   const book=state.book?.parentElement===slot?state.book:(state.book=slot.querySelector('.shelf-book'));
   if(book.hasAttribute('data-distance-hidden')!==(alpha===0))book.toggleAttribute('data-distance-hidden',alpha===0);
   const tabIndex=alpha>.15?0:-1;if(book.tabIndex!==tabIndex)book.tabIndex=tabIndex;positions[row+1].push(x);
  });
   this.syncFillers(positions);
   this.element.dataset.position=this.offset.toFixed(1);if(changed){this.needsSizing=true;if(!this.frame&&!this.drag)this.queueSizeBooks();}
 }
 updateFocusTargets(){
  // Recycled volumes beyond the screen must not become invisible Tab stops.
  const v=this.element.getBoundingClientRect(),items=this.slots.map(slot=>({book:slot.querySelector('.shelf-book'),rect:slot.getBoundingClientRect(),alpha:slot.querySelector('.shelf-book')?.hasAttribute('data-distance-hidden')?0:1}));
  items.forEach(({book,rect:r,alpha})=>{if(book)book.tabIndex=alpha>.15&&r.right>Math.max(0,v.left)&&r.left<Math.min(innerWidth,v.right)&&r.bottom>Math.max(74,v.top)&&r.top<Math.min(innerHeight-60,v.bottom)?0:-1;});
 }
 hold(){this.velocity=0;this.target=this.offset;}
 fitPreview(book){
  if(this.bookFlights.has(book.querySelector('.book-motion')))return;
  const object=book.querySelector('.book-motion'),cover=book.querySelector('.book-cover');let shift=0;object.style.transition='none';book.style.setProperty('--preview-shift','0px');book.style.setProperty('--preview-lift','0px');
  // Measure the final projected cuboid, not just the old spine hit area.
  for(let i=0;i<3;i++){const r=cover.getBoundingClientRect(),delta=r.left<16?16-r.left:r.right>innerWidth-16?innerWidth-16-r.right:0;if(Math.abs(delta)<1)break;book.style.setProperty('--preview-shift',(shift+20)+'px');const slope=(cover.getBoundingClientRect().left-r.left)/20;shift+=delta/Math.max(.15,slope);book.style.setProperty('--preview-shift',shift+'px');}
  // The top and bottom rows can be clipped after extraction; fit the projected cover vertically too.
  const top=Math.max(74,this.element.getBoundingClientRect().top+12),toolsTop=this.element.closest('#section-writing')?.querySelector('.writing-tools')?.getBoundingClientRect().top,bottom=innerWidth<=600&&toolsTop>top+100?Math.min(innerHeight-72,toolsTop-16):innerHeight-72;let lift=0;
  for(let i=0;i<3;i++){const r=cover.getBoundingClientRect(),delta=r.top<top?top-r.top:r.bottom>bottom?bottom-r.bottom:0;if(Math.abs(delta)<.5)break;book.style.setProperty('--preview-lift',(lift+20)+'px');const slope=(cover.getBoundingClientRect().top-r.top)/20;lift+=delta/Math.max(.15,slope);book.style.setProperty('--preview-lift',lift+'px');}
  object.style.removeProperty('transition');
 }
 pose(book){const motion=book?.querySelector('.book-motion');if(!motion)return 'none';const pose=getComputedStyle(motion).transform;return pose;}
 animateBook(book,opening,from){
  const motion=book?.querySelector('.book-motion');if(!motion)return;
  const settings=this.bookTuning||{duration:1500,split:.60,a:[.128,.017,.288,1],b:[.277,.054,.664,1]},curve=v=>'cubic-bezier('+v.join(',')+')';
  this.bookPaths??=new WeakMap();let animation=this.bookPaths.get(motion);
  if(this.interaction.motion.matches){animation?.cancel();this.bookFlights.delete(motion);this.bookPaths.delete(motion);return;}
  if(!animation){
   if(!opening)return;
   from??=this.pose(book);const to=getComputedStyle(motion).transform,style=getComputedStyle(book),depth=parseFloat(style.getPropertyValue('--book-depth')),scale=parseFloat(style.getPropertyValue('--preview-scale'))||1,clearance=parseFloat(style.getPropertyValue('--preview-depth'))||libraryBookPreviewDepth(depth,book.clientHeight,scale);
   // Nonzero but gentle speed at clearance; returning retraces this same safe path.
   animation=motion.animate([{transform:from,offset:0,easing:curve(settings.a)},{transform:'translate3d(0,0,'+clearance+'px)',offset:settings.split,easing:curve(settings.b)},{transform:to,offset:1}],{duration:settings.duration,easing:'linear',fill:'both'});
   this.bookPaths.set(motion,animation);
  }
  this.bookFlights.set(motion,animation);animation.updatePlaybackRate(opening?1:-1);animation.play();
  animation.onfinish=()=>{if(this.bookFlights.get(motion)!==animation)return;this.bookFlights.delete(motion);if(animation.playbackRate<0){animation.cancel();this.bookPaths.delete(motion);}else if(this.interaction.book===book)this.interaction.updateTilt?.();};
 }
  queueSizeBooks(){if(this.sizeFrame||this.destroyed)return;this.sizeFrame=requestAnimationFrame(()=>{this.sizeFrame=0;if(this.frame||this.drag)return;this.sizeBooks();});}
  finishMotion(){if(this.needsSizing)this.sizeBooks();else this.updateFocusTargets();}
  sizeBooks(){cancelAnimationFrame(this.sizeFrame);this.sizeFrame=0;this.needsSizing=false;let shelfDepth=180;
  const fillerLayoutChanged=this.measureFillers();
  // Read all row heights before changing any book's dimensions.
  const sizes=this.slots.map(slot=>({slot,height:slot.clientHeight,face:slot.querySelector('.book-cover')}));
  sizes.forEach(item=>{const {slot,height}=item,cover=Math.round(height*(innerWidth<=600?1.05:.7));
  slot.style.setProperty('--cover-width',cover+'px');slot.style.setProperty('--book-depth',cover+'px');shelfDepth=Math.max(shelfDepth,cover+24);
  slot.style.setProperty('--preview-depth',libraryBookPreviewDepth(cover,height,innerWidth<=600?1.15:1)+'px');
   const titleSize=item.titleSize=Math.max(12,Math.min(27,height*.095));
   slot.style.setProperty('--cover-title-size',titleSize+'px');slot.style.setProperty('--cover-small-size',Math.max(7,Math.min(12,height*.042))+'px');slot.style.setProperty('--cover-padding',Math.max(6,height*.06)+'px');
   });
  // Measure default title overflow in one read phase, then fit only long titles.
  sizes.forEach(item=>{const face=item.face;item.overflow=face&&face.scrollHeight>face.clientHeight+1;});
  sizes.forEach(({slot,face,overflow,titleSize})=>{
  // Start large, then fit the actual original title; long articles must not clip.
   if(overflow){let low=9,high=titleSize;while(high-low>.5){const middle=Math.floor((low+high)*2)/4;slot.style.setProperty('--cover-title-size',middle+'px');if(face.scrollHeight<=face.clientHeight+1)low=middle;else high=middle;}slot.style.setProperty('--cover-title-size',low+'px');}
   });this.element.style.setProperty('--shelf-depth',shelfDepth+'px');if(fillerLayoutChanged)this.paint();this.updateFocusTargets();}

  wake(){if(document.body.classList.contains('site-editor-active')||this.frame||this.destroyed)return;let previous;const step=t=>{if(document.body.classList.contains('site-editor-active')){this.frame=0;this.velocity=0;this.target=this.offset;return;}const dt=previous?Math.min(40,t-previous):16;previous=t;if(!this.drag){this.target+=this.velocity*dt;this.velocity*=Math.exp(-dt/220);}this.offset+=(this.target-this.offset)*(this.interaction.motion.matches?1:1-Math.exp(-dt/(this.drag?35:100)));this.paint();if(Math.abs(this.target-this.offset)>.1||Math.abs(this.velocity)>.005)this.frame=requestAnimationFrame(step);else{this.frame=0;this.offset=this.target;this.paint();this.finishMotion();}};this.frame=requestAnimationFrame(step);}
 createBookTuner(){
  const defaults=()=>({duration:1500,split:.60,a:[.128,.017,.288,1],b:[.277,.054,.664,1]});this.bookTuning=defaults();try{const saved=JSON.parse(localStorage.getItem('shili-book-motion-settings'));if(saved&&Number.isFinite(saved.duration)&&saved.duration>=200&&saved.duration<=6000&&Number.isFinite(saved.split)&&saved.split>=.15&&saved.split<=.85&&['a','b'].every(k=>Array.isArray(saved[k])&&saved[k].length===4&&saved[k].every(v=>Number.isFinite(v)&&v>=0&&v<=1)))this.bookTuning=saved;if(this.bookTuning.b.join(',')==='0.265,0.309,0.664,1')this.bookTuning.b=[.277,.054,.664,1];}catch{}
  const panel=document.createElement('details');panel.className='book-tuner';panel.open=true;panel.innerHTML='<summary>书籍动画 · 曲线编辑</summary><div class="book-tuner-body"><p>修改后点击重播。参数自动记在本浏览器，仅编辑模式显示。</p><label>总时长（毫秒）<input data-key="duration" type="number" min="200" max="6000" step="50" value="1500"></label><label>抽出阶段占比（%）<input data-key="split" type="number" min="15" max="85" step="1" value="60"></label>'+['a','b'].map((key,i)=>'<fieldset><legend>'+ (i?'第二段：轻转停稳':'第一段：向外抽出')+'</legend><svg data-editor="'+key+'" viewBox="0 0 120 90" aria-label="时间与位移曲线"><path d="M10 5V80H115" fill="none" stroke="#b4a88f"/><path data-curve="'+key+'" fill="none" stroke="#93713d" stroke-width="2"/><path data-handles="'+key+'" fill="none" stroke="#ba9459" stroke-dasharray="2 2"/><rect x="7" y="77" width="6" height="6" fill="#76552b"/><rect x="107" y="7" width="6" height="6" fill="#76552b"/><circle data-handle="0" r="4" tabindex="0" role="button" aria-label="起点控制柄，方向键微调"/><circle data-handle="2" r="4" tabindex="0" role="button" aria-label="终点控制柄，方向键微调"/></svg><div class="book-tuner-points">'+['X1','Y1','X2','Y2'].map((name,j)=>'<label>'+name+'<input type="number" min="0" max="1" step=".001" data-point="'+key+j+'" value="'+this.bookTuning[key][j]+'"></label>').join('')+'</div></fieldset>').join('')+'<div class="book-tuner-actions"><button type="button" data-play>重播抽出</button><button type="button" data-return>回架</button><button type="button" data-reset>恢复默认</button></div><textarea readonly aria-label="当前动画参数" rows="4"></textarea><small>横轴时间，纵轴位移。方形是固定起止锚点，圆形是可拖动控制柄。参数框可复制发给我。</small><p data-status role="status"></p></div>';
  this.section.append(panel);this.tuner=panel;
  const update=()=>{panel.querySelector('[data-key="duration"]').value=this.bookTuning.duration;panel.querySelector('[data-key="split"]').value=Math.round(this.bookTuning.split*100);try{localStorage.setItem('shili-book-motion-settings',JSON.stringify(this.bookTuning));}catch{}for(const key of ['a','b']){const v=this.bookTuning[key];panel.querySelector('[data-curve="'+key+'"]').setAttribute('d','M10 80 C'+(10+100*v[0])+' '+(80-70*v[1])+','+(10+100*v[2])+' '+(80-70*v[3])+',110 10');}for(const key of ['a','b']){const v=this.bookTuning[key],svg=panel.querySelector('[data-editor="'+key+'"]');svg.querySelector('[data-handles]').setAttribute('d','M10 80 L'+(10+100*v[0])+' '+(80-70*v[1])+' M110 10 L'+(10+100*v[2])+' '+(80-70*v[3]));for(const n of [0,2]){const h=svg.querySelector('[data-handle="'+n+'"]');h.setAttribute('cx',10+100*v[n]);h.setAttribute('cy',80-70*v[n+1]);}v.forEach((value,i)=>panel.querySelector('[data-point="'+key+i+'"]').value=Number(value.toFixed(3)));}panel.querySelector('textarea').value=JSON.stringify(this.bookTuning,null,2);};
  panel.addEventListener('input',e=>{const input=e.target;if(input.tagName!=='INPUT'||!input.validity.valid||input.value==='')return;const value=Number(input.value);if(!Number.isFinite(value))return;if(input.dataset.key)this.bookTuning[input.dataset.key]=input.dataset.key==='split'?value/100:value;else if(input.dataset.point){const [key,i]=input.dataset.point;this.bookTuning[key][i]=value;}update();});
  for(const svg of panel.querySelectorAll('[data-editor]')){
   let drag=null;const change=(n,x,y)=>{const v=this.bookTuning[svg.dataset.editor];v[n]=Math.round(Math.max(0,Math.min(1,x))*1000)/1000;v[n+1]=Math.round(Math.max(0,Math.min(1,y))*1000)/1000;update();};
   svg.addEventListener('pointerdown',e=>{const handle=e.target.closest('[data-handle]');if(!handle||e.button!==0)return;e.preventDefault();e.stopPropagation();drag={id:e.pointerId,n:Number(handle.dataset.handle)};svg.setPointerCapture(e.pointerId);handle.focus();});
   svg.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;e.preventDefault();const r=svg.getBoundingClientRect();change(drag.n,((e.clientX-r.left)/r.width*120-10)/100,(80-(e.clientY-r.top)/r.height*90)/70);});
   const release=e=>{if(!drag||drag.id!==e.pointerId)return;drag=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);};svg.addEventListener('pointerup',release);svg.addEventListener('pointercancel',release);svg.addEventListener('lostpointercapture',()=>{drag=null;});
   svg.addEventListener('keydown',e=>{const h=e.target.closest('[data-handle]');if(!h||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();e.stopPropagation();const n=Number(h.dataset.handle),v=this.bookTuning[svg.dataset.editor],step=e.shiftKey?.1:.01;change(n,v[n]+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0),v[n+1]+(e.key==='ArrowUp'?step:e.key==='ArrowDown'?-step:0));});
  }
  panel.querySelector('[data-play]').addEventListener('click',()=>{if(this.interaction.motion.matches){panel.querySelector('[data-status]').textContent='系统已启用减少动态效果，请关闭后再预览动画。';return;}let book=this.interaction.book;if(!book?.isConnected){const candidates=this.slots.map(s=>s.querySelector('.shelf-book')).filter(b=>{const r=b.getBoundingClientRect();return !b.hasAttribute('data-distance-hidden')&&r.right>innerWidth*.4&&r.left<innerWidth-30&&r.top>90&&r.bottom<innerHeight-80;});book=candidates[0];}if(!book){panel.querySelector('[data-status]').textContent='请先拖动书架，让一本彩色书进入画面。';return;}this.interaction.hide();const motion=book.querySelector('.book-motion');this.bookPaths?.get(motion)?.cancel();this.bookFlights.delete(motion);this.bookPaths?.delete(motion);this.interaction.preview(book);panel.querySelector('[data-status]').textContent=book.getAttribute('aria-label')+' · '+this.bookTuning.duration+'毫秒';});
  panel.querySelector('[data-return]').addEventListener('click',()=>this.interaction.hide());panel.querySelector('[data-reset]').addEventListener('click',()=>{this.bookTuning=defaults();panel.querySelector('[data-key="duration"]').value=1500;panel.querySelector('[data-key="split"]').value=60;for(const key of ['a','b'])this.bookTuning[key].forEach((v,i)=>panel.querySelector('[data-point="'+key+i+'"]').value=v);update();});update();
 }
  destroy(){this.tuner?.remove();this.bookFlights.forEach(a=>a.cancel());this.bookFlights.clear();this.destroyed=true;cancelAnimationFrame(this.frame);cancelAnimationFrame(this.sizeFrame);this.entrance.destroy();this.letterLayer.remove();this.observer.disconnect();this.resize.disconnect();this.listeners.forEach(off=>off());}
}
