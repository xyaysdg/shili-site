/* Decorative books are blank, noninteractive line art; only original articles open. */
const articleBookPalette=new Map();
function articleShelves(all,matching){
 const selected=new Set(matching.map(a=>a.slug));
 const palettes=[['#415c55','#f1eee0'],['#986956','#fff2e1'],['#8a783f','#fff7e2'],['#465b70','#eff1e8'],['#765766','#f7ece7']];
 const slots=[[3,9,15,21],[5,12,19],[4,11,19],[5,12,20]];
 let articleIndex=0;
 const rows=slots.map((positions,row)=>{
  const books=Array.from({length:24},(_,slot)=>{
   const seed=row*29+slot*7;
   const article=positions.includes(slot)?all[articleIndex++]:null;
   const height=158+(seed%6)*11;
   if(!article||!selected.has(article.slug))return `<span class="shelf-filler filler-${seed%5}" aria-hidden="true" style="--book-h:${height}px;--book-weight:${.65+(seed%5)*.22}"><i></i></span>`;
   const index=all.indexOf(article);if(!articleBookPalette.has(article.slug))articleBookPalette.set(article.slug,palettes[Math.floor(Math.random()*palettes.length)]);const [color,ink]=articleBookPalette.get(article.slug);
   const bookHeight=Math.max(height+8,article.title.length>28?244:article.title.length>18?224:190);
   return `<a class="shelf-book ${slot>=12?'opens-left':''}" href="#/article/${E(article.slug)}" aria-label="阅读：${E(article.title)}" data-book-slug="${E(article.slug)}" style="--book-h:${bookHeight}px;--book-color:${color};--book-ink:${ink};--spine-width:${33+(index%3)*5}px">
    <span class="book-object"><span class="book-spine"><span class="book-spine-rule"></span><span class="book-spine-title">${E(article.title)}</span><span class="book-spine-number">${String(index+1).padStart(2,'0')}</span></span>
    <span class="book-cover" aria-hidden="true"><span class="book-cover-category">${E(article.category)}</span><span class="book-cover-title">${E(article.title)}</span><span class="book-cover-bottom"><span>十里先生</span><time>${E(article.date.replaceAll('-','.'))}</time></span></span></span>
   </a>`;
  }).join('');
  return `<div class="shelf-row" role="group" aria-label="第 ${row+1} 层书架"><div class="shelf-books">${books}</div><div class="shelf-plank" aria-hidden="true"><span>${String(row+1).padStart(2,'0')}</span></div></div>`;
 });
 return `<div class="article-bookshelf" aria-label="文章书架，共四层">${rows.join('')}</div>`;
}

class ArticleShelfInteraction {
 constructor(root){
  this.root=root;this.listeners=[];this.motion=matchMedia('(prefers-reduced-motion: reduce)');
  const listen=(el,type,fn)=>{el.addEventListener(type,fn);this.listeners.push(()=>el.removeEventListener(type,fn));};
  this.indexToggle=root.closest('#section-writing')?.querySelector('.library-index-toggle');
  if(this.indexToggle)listen(this.indexToggle,'click',()=>{const panel=root.querySelector('.library-index');if(!panel)return;this.hide();panel.hidden=!panel.hidden;this.indexToggle.setAttribute('aria-expanded',String(!panel.hidden));});
  listen(document,'keydown',e=>{const panel=root.querySelector('.library-index');if(e.key==='Escape'&&panel&&!panel.hidden&&!this.reader){panel.hidden=true;this.indexToggle?.setAttribute('aria-expanded','false');this.indexToggle?.focus({preventScroll:true});}});
  listen(root,'pointerover',e=>{const book=e.target.closest('.shelf-book');if(book&&e.pointerType==='mouse'&&!this.library?.drag&&performance.now()>(root.libraryDragUntil||0))this.preview(book);});
  listen(root,'pointerout',e=>{if(e.target.closest('.shelf-book')&&!e.relatedTarget?.closest('.shelf-book,.book-float')){this.pointer={x:e.clientX,y:e.clientY};this.scheduleHide();}});
  listen(document,'pointermove',e=>{if(e.pointerType!=='mouse'||!this.book||this.reader)return;this.pointer={x:e.clientX,y:e.clientY};if(this.insidePreview())clearTimeout(this.hideTimer);else if(!e.target.closest('.shelf-book'))this.scheduleHide();});
  listen(root,'focusin',e=>{const book=e.target.closest('.shelf-book');if(book)this.preview(book);});
  listen(root,'focusout',e=>{if(e.target.closest('.shelf-book')&&!e.relatedTarget?.closest('.shelf-book,.book-float,.book-reader'))this.scheduleHide(true);});
  listen(document,'pointerout',e=>{if(!e.relatedTarget){this.pointer=null;this.scheduleHide(true);}});
  listen(root,'pointerdown',e=>{this.touch=e.pointerType==='touch'||e.pointerType==='pen';this.touchPreviewed=this.book===e.target.closest('.shelf-book');});
  listen(root,'keydown',()=>{this.touch=false;});
  listen(root,'click',e=>{const book=e.target.closest('.shelf-book');if(!book||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();if(performance.now()<(root.libraryDragUntil||0))return;if(this.touch&&!this.touchPreviewed){this.preview(book);return;}this.open(book);});
  listen(root,'click',e=>{const link=e.target.closest('.library-index a');if(!link||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();const article=D.articles.find(a=>a.slug===link.getAttribute('href').split('/').at(-1));if(!article)return;this.hide();this.library?.hold();const holder=document.createElement('div');holder.innerHTML=libraryBookMarkup(article,D.articles.indexOf(article));this.open(holder.firstElementChild,link);});
  listen(root,'pointermove',e=>{if(this.motion.matches||this.library?.drag||!this.book||this.library?.bookFlights.has(this.book.querySelector('.book-motion')))return;const r=this.book.getBoundingClientRect(),x=Math.max(-1,Math.min(1,(e.clientX-r.left)/Math.max(1,r.width)*2-1)),y=Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1));this.book.style.setProperty('--pointer-yaw',x*3+'deg');this.book.style.setProperty('--pointer-pitch',-y*2+'deg');});
  listen(document,'pointerdown',e=>{if(!e.target.closest('.shelf-book,.book-float,.book-reader'))this.hide();});
  listen(document,'keydown',e=>{if(e.key==='Escape'&&!this.reader)this.hide();});
  listen(window,'scroll',()=>{if(!this.reader)this.hide();});
  listen(window,'resize',()=>{if(!this.reader)this.hide();});
  const sync=()=>{if(this.book&&!this.book.isConnected)this.hide();const el=root.querySelector('.library-viewport');if(el!==this.library?.element){this.library?.destroy();this.library=el?new InfiniteLibrary(el,this):null;}};
  this.mutation=new MutationObserver(sync);this.mutation.observe(root,{childList:true,subtree:true});sync();
 }
 insidePreview(){if(!this.pointer||!this.float)return false;const r=this.float.getBoundingClientRect(),p=this.pointer,pad=38;return p.x>=r.left-pad&&p.x<=r.right+pad&&p.y>=r.top-pad&&p.y<=r.bottom+pad;}
 scheduleHide(force=false){clearTimeout(this.hideTimer);this.hideTimer=setTimeout(()=>{if(force||!this.insidePreview()||this.touch)this.hide();},240);}
 preview(book){
  if(this.destroyed)return;clearTimeout(this.hideTimer);if(this.book===book&&this.float)return;const from=this.library?.pose(book);this.hide();this.book=book;book.classList.add('is-previewed');
  this.library?.hold();this.library?.fitPreview(book);this.library?.animateBook(book,true,from);this.float=book.querySelector('.book-cover');
 }
 hide(){clearTimeout(this.hideTimer);const book=this.book,from=book?this.library?.pose(book):null;book?.classList.remove('is-previewed');book?.style.removeProperty('--pointer-yaw');book?.style.removeProperty('--pointer-pitch');if(book)this.library?.animateBook(book,false,from);this.float=null;this.book=null;this.pointer=null;}
 open(book,trigger=book){
  if(this.reader)return;clearTimeout(this.hideTimer);const slug=book.dataset.bookSlug,article=D.articles.find(a=>a.slug===slug);if(!article)return;
  const from=(this.float||trigger).getBoundingClientRect(),color=book.style.getPropertyValue('--book-color'),cover=book.querySelector('.book-cover').innerHTML;
  const dialog=document.createElement('dialog');dialog.className='book-reader';dialog.setAttribute('aria-label',article.title);dialog.innerHTML='<button class="book-reader-close" aria-label="合上书籍">合上书籍 ×</button><div class="book-spread"><aside class="book-reader-folio"><span>十里先生</span><h2></h2><p></p></aside><div class="book-reader-content"></div><div class="book-turn-cover" aria-hidden="true">'+cover+'</div></div>';
  dialog.querySelector('.book-turn-cover').style.background=color;this.reader=dialog;this.trigger=trigger;document.body.append(dialog);dialog.showModal();document.body.classList.add('modal-open');this.hide();
  const show=slug=>{const a=D.articles.find(a=>a.slug===slug);if(!a)return;this.readingSlug=slug;dialog.setAttribute('aria-label',a.title);dialog.querySelector('.book-reader-folio h2').textContent=a.title;dialog.querySelector('.book-reader-folio p').textContent=a.date;const content=dialog.querySelector('.book-reader-content');content.innerHTML=articlePage(slug);content.scrollTop=0;};
  show(slug);
  dialog.querySelector('.book-reader-close').onclick=()=>dialog.close();
  dialog.addEventListener('click',async e=>{const close=e.target.closest('a[href="#/writing"]');if(close){e.preventDefault();dialog.close();return;}const next=e.target.closest('a[href^="#/article/"]');if(next){e.preventDefault();show(next.getAttribute('href').split('/').at(-1));return;}if(e.target.closest('#reading-size')){const body=dialog.querySelector('.article-body');body.classList.toggle('large-type');e.target.textContent=body.classList.contains('large-type')?'标准字号 Aa':'大字号 Aa';}if(e.target.closest('#copy-article')){try{await navigator.clipboard.writeText(location.origin+location.pathname+'#/article/'+this.readingSlug);toast('文章链接已复制');}catch{toast('请使用文章独立阅读链接');}}});
  dialog.addEventListener('close',()=>{clearTimeout(this.openTimer);this.openAnimation?.cancel();dialog.remove();this.reader=null;if(!document.querySelector('dialog[open]'))document.body.classList.remove('modal-open');if(this.trigger?.isConnected)this.trigger.focus({preventScroll:true});},{once:true});
  const spread=dialog.querySelector('.book-spread'),to=spread.getBoundingClientRect();
  if(this.motion.matches)dialog.dataset.phase='open';
  else{this.openAnimation=spread.animate([{transform:'translate('+(from.left-to.left)+'px,'+(from.top-to.top)+'px) scale('+from.width/to.width+','+from.height/to.height+')',opacity:.55},{transform:'none',opacity:1}],{duration:560,easing:'cubic-bezier(.22,.75,.2,1)'});this.openTimer=setTimeout(()=>{if(dialog.open)dialog.dataset.phase='open';},350);}
  dialog.querySelector('.book-reader-close').focus({preventScroll:true});
 }
 destroy(){this.destroyed=true;clearTimeout(this.openTimer);this.hide();this.reader?.close();this.library?.destroy();this.mutation.disconnect();this.listeners.forEach(off=>off());}
}