/* Original writing and media live in content.js. No tracking or external runtime. */
const D = window.SITE_DATA;
const $ = (q, root = document) => root.querySelector(q);
const $$ = (q, root = document) => [...root.querySelectorAll(q)];
const E = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const photos = D.sections.photography.gallery;
const art = D.sections.art.gallery;
const english = ['WELCOME','ABOUT ME','ARTWORK','PHOTOGRAPHY','POETRY','JOURNAL','MILESTONES','PANTHEON','LET’S TALK','ANOTHER SOUL'];
const displayTitles = Object.fromEntries(D.navigation.map(n=>[n.id,n.label]));
Object.assign(displayTitles,{art:'说来“画”长',photography:'“摄”身处地',poetry:'“诗”志不渝',writing:'“篇篇”起舞',journey:'一步。一个。脚印。',pantheon:'万神殿'});
const navigation=D.navigation.filter(n=>!['about','friend'].includes(n.id)).map(n=>n.id==='home'?{...n,label:'让我想想说什么比较好'}:n);
Object.assign(displayTitles,{home:'让我想想说什么比较好',about:'让我想想说什么比较好'});
const intro = Object.fromEntries(['art','photography','poetry','writing'].map(id=>[id,D.sections[id].headings[1] || '']));
const sortedArticles = [...D.articles].sort((a,b) => b.date.localeCompare(a.date));
let activeRoute = 'home', savedScroll = new Map();
let articleCategory = '全部', articleQuery = '';
const experience = new ShiliExperience();
const categories = () => window.shiliArticleCategories();

function picture(item, attrs = '') { if(!item)return '';return `<img src="${E(item.thumb || item.src)}" width="${item.width || 640}" height="${item.height || 480}" alt="${E(item.caption || '十里的作品')}" loading="lazy" decoding="async" ${attrs}>`; }
function imageCard(item, index, group, options = '') { return `<button class="image-card ${options}" data-gallery="${group}" data-index="${index}" aria-label="放大${E(item.caption || '作品 '+(index+1))}"><span class="image-wrap">${picture(item)}<span class="image-open" aria-hidden="true">↗</span></span><span class="image-label"><span>${E(item.caption || '')}</span><span>${String(index+1).padStart(2,'0')}</span></span>${item.description?`<span class="image-description">${E(item.description)}</span>`:''}</button>`; }
function sectionHeading(id, title, subtitle, count = '') { return `<div class="section-heading"><div><span class="eyebrow">${english[D.navigation.findIndex(n=>n.id===id)] || ''}</span><h2>${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ''}</div><a href="#/${id}" class="arrow-link">${count || '走进这一页'} <span>↗</span></a></div>`; }
function pageHeading(id, description = '', extra = '') { const i = D.navigation.findIndex(n=>n.id===id);return `<header class="page-heading"><span class="eyebrow">${String(i+1).padStart(2,'0')} / ${english[i]}</span><div class="page-title-row"><h1>${displayTitles[id]}</h1>${extra}</div>${description ? `<p>${description}</p>` : ''}</header>`; }
function articleRow(a) { return `<a class="article-row" href="#/article/${a.slug}"><span class="article-date">${a.date.replaceAll('-','.')}</span><div><span class="category-label">${E(a.category)}</span><h3>${E(a.title)}</h3><p>${E(a.excerpt).slice(0,130)}</p></div><span class="row-arrow" aria-hidden="true">↗</span></a>`; }
function homePage() {return `
  <section class="hero"><div class="hero-copy"><span class="eyebrow">Welcome to shili's Inland Empire</span><h1>欢迎来到<br>十里的<span class="hero-title">内陆帝国</span></h1><div class="hero-byline"><span class="small-seal">十里</span><p>花径不曾缘客扫，<br>蓬门今始为君开</p></div><a class="button primary" href="#/about">让我想想说点什么好 <span>↗</span></a></div><div class="hero-visual"><button class="hero-photo" data-home-image aria-label="放大首页原图"><img src="${D.sections.home.images[0]}" alt="" fetchpriority="high"></button><div class="hero-inset">${picture(photos[44])}<span>PHOTOGRAPHY / 45</span></div></div></section>
  <div class="home-note"><span class="asterisk">✳</span><p>好画，画疲则驰步，步毕则读书，夜常与相声共寐。<br><span>间察奇思异想，记之。</span></p><a href="#/about" class="arrow-link">自我介绍 ↗</a></div>
  <section class="home-section">${sectionHeading('photography',D.sections.photography.headings[0],'',photos.length+' 张摄影')}${movingWall('photography',true)}</section>
  <section class="home-section artwork-preview">${sectionHeading('art',D.sections.art.headings[0],'',art.length+' 幅作品')}${movingWall('art',true)}</section>
  <section class="home-section">${sectionHeading('writing',D.sections.writing.headings[0],'','全部 '+D.articles.length+' 篇')}<div class="article-list">${sortedArticles.slice(0,3).map(articleRow).join('')}</div></section>
  <section class="home-bottom"><a class="poetry-teaser" href="#/poetry"><span class="eyebrow">POETRY / 诗志不渝</span><p>初入诗坛，诗不求律，看神。<br>我平仄不懂，押韵略知。<br>写诗全凭感觉。<br><em>只博自己欢心。</em></p><span class="arrow-link">诗稿 ↗</span></a><a class="running-teaser" href="#/journey"><span class="eyebrow">一步 一个 脚印</span><strong>1,000<span>km</span></strong><p>2025个人跑步生涯1000公里目标达成！</p><span class="arrow-link">感想 ↗</span></a></section>`; }

function galleryPage(id) {
 const items=D.sections[id].gallery;
 if(id==='photography')return hangingPhotographyMarkup();
 if(id==='poetry')return poetryGardenMarkup();
 if(id==='art'||id==='photography')return pageHeading(id,E(intro[id]),`<span class="page-count">${items.length}<small>${id==='art'?'幅作品':'张摄影'}</small></span>`)+movingWall(id);
 return pageHeading(id,E(intro[id]),`<span class="page-count">${items.length}<small>页诗稿</small></span>`)+`<p class="poetry-preface">${E(D.sections.poetry.paragraphs[2])}</p>`+movingWall(id);
}

function aboutPage() {return `${pageHeading('about')}<div class="about-grid"><div class="about-photo">${picture(photos[0])}<span class="photo-caption">本人</span></div><div class="about-copy">${D.sections.about.html}</div></div>`; }

function writingPage() {if(!categories().includes(articleCategory))articleCategory='全部';return `${pageHeading('writing',intro.writing)}<div class="writing-tools"><div class="filter-list" aria-label="文章分类">${categories().map(c=>`<button class="filter ${articleCategory===c?'active':''}" data-category="${E(c)}" aria-pressed="${articleCategory===c}">${E(c)}</button>`).join('')}</div><div class="writing-search-row"><label class="inline-search"><span class="visually-hidden">搜索文章</span><input id="article-search" type="search" value="${E(articleQuery)}" placeholder="搜索文章…"></label><button type="button" class="library-index-toggle" aria-expanded="false" aria-controls="library-index">查看全部文章</button></div></div><div id="article-results" class="shelf-results"></div>`; }
function updateArticles() {
 const root=$('#article-results');if(!root)return;
 const query=articleQuery.toLowerCase();
 const results=sortedArticles.filter(a=>(articleCategory==='全部'||a.category===articleCategory)&&(!query||(a.title+a.text).toLowerCase().includes(query)));
 // Editor/content refresh creates a new root; this cache lives only with its rendered content.
 const previous=root.articleMatches;
 if(previous&&previous.length===results.length&&results.every((a,i)=>a===previous[i]))return;
 root.articleMatches=results;
 const reused=results.length&&root.querySelector('.library-viewport')?.library?.replaceArticles(results);
 if(reused){
  root.querySelector('.results-count').textContent=`共 ${results.length} 篇文章`;
  const index=root.querySelector('.library-index');index.innerHTML=libraryIndexLinks(results);index.hidden=true;
 }else{
 root.innerHTML=`<div class="shelf-results-heading"><p class="results-count" role="status">共 ${results.length} 篇文章</p><span class="shelf-desktop-hint">左右拖动 · 悬停抽书 · 点击阅读</span><span class="shelf-touch-hint">轻触预览 · 再次点击阅读</span></div>`+(results.length?corridorMarkup(sortedArticles,results):'<div class="empty-state">这一页暂时没有找到结果。<br><button class="text-tool" id="clear-article-search">清空筛选</button></div>');
 }
 const indexToggle=$('.library-index-toggle');if(indexToggle){indexToggle.disabled=!results.length;indexToggle.setAttribute('aria-expanded','false');}
 $('#clear-article-search')?.addEventListener('click',()=>{
  articleQuery='';const input=$('#article-search');if(input)input.value='';
  selectArticleCategory('全部');input?.focus({preventScroll:true});
 });
}

function selectArticleCategory(category){
 articleCategory=category;
 $$('[data-category]').forEach(button=>{const active=button.dataset.category===category;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
 updateArticles();
}
function bindArticleSearch(){
 const input=$('#article-search');if(!input)return;let composing=false;
 const update=()=>{articleQuery=input.value;updateArticles();};
 input.addEventListener('compositionstart',()=>{composing=true;});
 input.addEventListener('compositionend',()=>{composing=false;update();});
 input.addEventListener('input',e=>{if(!composing&&!e.isComposing)update();});
}

function articlePage(slug) {const a=D.articles.find(a=>a.slug===slug);if(!a)return '<div class="empty-state"><h1>这篇文章还没有出现。</h1><a href="#/writing">返回文章目录 →</a></div>';return `<article class="reading-page" data-content-id="${E(a.editorId||'article:'+a.slug)}"><div class="reading-top"><a href="#/writing">← 返回篇篇起舞</a><div><button id="reading-size" class="text-tool" aria-label="切换大字号">大字号 Aa</button><button id="copy-article" class="text-tool">复制链接 ↗</button></div></div><header class="article-heading"><span class="eyebrow">${E(a.category)} / ${a.date.replaceAll('-','.')}</span><h1>${E(a.title)}</h1><p>十里先生 <span>·</span> 约 ${Math.max(1,Math.ceil(a.text.length/400))} 分钟阅读</p></header><div class="article-body">${a.cover?`<figure class="article-cover"><img src="${E(a.cover)}" alt="" loading="lazy"></figure>`:''}${a.html}</div><div class="article-end"><span class="small-seal">十里</span><a href="${E(a.source)}" target="_blank" rel="noopener noreferrer">原文 ↗</a></div><div class="article-neighbors">${(()=>{let i=sortedArticles.findIndex(x=>x.slug===slug);return [sortedArticles[i+1],sortedArticles[i-1]].map((x,j)=>x?`<a href="#/article/${x.slug}"><span>${j?'下一篇':'上一篇'}</span><p>${E(x.title)} ↗</p></a>`:'<span></span>').join('');})()}</div></article>`; }

function journeyPage() {const s=D.sections.journey; const paras=s.paragraphs.filter(p=>!['一步。一个。脚印。','还没有什么着墨的成长记录~建设ing...','2025个人跑步生涯1000公里目标达成！','感想'].includes(p));return `<div class="journey-layout"><div class="journey-floor" aria-hidden="true"></div><div class="journey-copy">${pageHeading('journey')}<h2 class="journey-milestone-title">2025个人跑步生涯1000公里目标达成！</h2><div class="journey-story"><div class="prose">${paras.map(p=>`<p>${E(p)}</p>`).join('')}</div></div></div>${milestoneMedalMarkup()}</div>`; }
function pantheonPage() {return '<header class="pantheon-heading"><h1>万神殿</h1><p>我见证过无数世界</p></header>'+movingWall('pantheon'); }
function contactPage(){return `<div class="chestnut-gravity" data-chestnut-gravity data-status="loading"><div class="chestnut-fallback" aria-hidden="true"><img src="assets/chestnut-v39-preview.png" alt=""></div><div class="chestnut-canvas"><a class="chestnut-friend-link" data-chestnut-friend href="https://caienqi.mysxl.cn/" tabindex="-1" aria-label="另一个顶有趣的灵魂。前往蔡恩淇的博客">另一个顶有趣的灵魂。</a><button class="chestnut-core-handle" data-chestnut-handle data-gravity-drag-handle aria-label="拖动栗子，方向键移动，Home复位"></button></div><div class="chestnut-copy"><h1>超微型栗子对撞机</h1><p>灵魂是比粒子（质子）更大的栗子，虽说与大型粒子对撞机相比，撞不出黑洞，更撞不出宇宙。但我相信两个灵魂的碰撞，是比宇宙大爆炸更耀眼的东西。</p><button class="chestnut-exchange" data-chestnut-message>与十里交流 ↗</button></div><div class="chestnut-tools"><button data-chestnut-pause aria-pressed="false">暂停流动</button><button data-chestnut-home>回到中心</button><span class="chestnut-help">拖动栗子 · 点击泛起涟漪</span></div><dialog class="chestnut-message" aria-labelledby="chestnut-message-title"><div class="chestnut-message-heading"><h2 id="chestnut-message-title">与十里交流</h2><button data-chestnut-close aria-label="关闭留言">×</button></div><form id="contact-form" class="contact-form"><label for="contact-name">请问如何称呼？</label><input id="contact-name" name="name" maxlength="80" placeholder="你的名字或昵称" required><label for="contact-message">我期待与任何人进行一场深度的交流</label><textarea id="contact-message" name="message" rows="7" placeholder="此刻，你在想些什么？" required maxlength="10000"></textarea><p class="form-note">这里可以保存本机草稿。想把话送达十里，请前往原站的留言区。</p><div class="form-actions"><button class="button outline" type="submit">保留留言草稿</button><a class="button primary" href="https://xyay.mysxl.cn/#_9" target="_blank" rel="noopener noreferrer">启动对撞机 ↗</a></div><p class="draft-status" id="draft-status" role="status"></p></form></dialog></div>`;}
/* One motion engine shared by photography, artwork and the pantheon. */
const wallOrders = new Map();
let wallCleanup = [];
function cleanupWalls(){wallCleanup.forEach(fn=>fn());wallCleanup=[];}
function wallLabel(id){return id==='photography'?'完整照片墙':id==='poetry'?'完整诗稿墙':'完整作品墙';}
function shuffled(id){
 if(!wallOrders.has(id)){
  const list=D.sections[id].gallery.map((_,i)=>i);
  for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}
  wallOrders.set(id,list);
 }
 return wallOrders.get(id);
}
function movingWall(id,compact=false){
 const items=D.sections[id].gallery;
 if(id==='pantheon')return `<section class="flow-wall diagonal-wall cinema-wall" data-flow-wall data-group="pantheon" aria-label="万艺殿星群作品"><div class="flow-viewport"><div class="flow-field"></div></div><div class="flow-bottom"><button class="flow-toggle" aria-pressed="false">暂停漂浮 Ⅱ</button></div><a class="flow-wall-link" href="#/wall/pantheon">完整作品墙 ↗</a></section>`;
 const label={art:'绘画',photography:'摄影',pantheon:'万艺殿',poetry:'诗稿'}[id];
 const en={art:'ARTWORK',photography:'PHOTOGRAPHY',pantheon:'PANTHEON',poetry:'POETRY'}[id];
 return `<section class="flow-wall diagonal-wall ${compact?'compact':''} ${id==='pantheon'?'cinema-wall':id==='poetry'?'poem-wall':''}" data-flow-wall data-group="${id}" aria-label="${label}流动作品墙"><div class="flow-top"><span>${String(items.length).padStart(2,'0')} / ${en}</span><a href="#/wall/${id}">${wallLabel(id)} ↗</a></div><div class="flow-viewport"><div class="flow-field"></div></div><div class="flow-bottom"><span>悬停定格 · 点击放大</span><button class="flow-toggle" aria-pressed="false">暂停流动 Ⅱ</button></div></section>`;
}
function fullWallPage(id){
 if(window.shiliSiteEditor?.panels.nav().some(n=>n.id===id)&&(window.shiliSiteEditor.active||!['art','photography','pantheon','poetry'].includes(id)))return window.shiliSiteEditor.panels.wallMarkup(id);
 if(!['art','photography','pantheon','poetry'].includes(id))return homePage();
 const items=D.sections[id].gallery;
 return `${pageHeading(id)}<div class="gallery-toolbar"><a href="#/${id}" class="arrow-link">← 返回流动作品墙</a><span>${wallLabel(id)} / ${items.length}</span></div><div class="gallery masonry full-wall" id="gallery-grid">${items.map((item,i)=>imageCard(item,i,id)).join('')}</div>`;
}
function initWalls(){
 $$('[data-flow-wall]').forEach(wall=>{
  const id=wall.dataset.group;
  const Engine=id==='pantheon'?ConstellationWall:DiagonalWall;
  const field=new Engine(wall,D.sections[id].gallery,id==='poetry'?D.sections[id].gallery.map((_,i)=>i):shuffled(id),
   (index,trigger)=>openGallery(D.sections[id].gallery,index,trigger));
  wallCleanup.push(()=>field.destroy());
 });
}

function getRoute() { let hash=location.hash.slice(1);if(hash==='/friend'||hash==='friend'||hash==='_10'){history.replaceState(null,'','#/contact');return 'contact';}if(/^_\d+$/.test(hash)) return namesFromIndex(Number(hash.slice(1))-1);if(!hash&&location.pathname.includes('/blog/'))return 'article/'+location.pathname.split('/blog/')[1].replace(/\/$/,'');return hash.replace(/^\//,'')||'home'; }
function namesFromIndex(i) {return D.navigation[i]?.id||'home';}
let longPage=null;
function render() {
 experience.close(true);experience.pageCleanup();cleanupWalls();longPage=null;
 const route=getRoute();activeRoute=route;const [id,slug]=route.split('/');const detail=id==='article'||id==='wall';
 const navId=id==='article'?'writing':id==='wall'?slug:id;
 const title=id==='article'?D.articles.find(a=>a.slug===slug)?.title:displayTitles[navId];document.title=(title?title+' · ':'')+'十里 · 内陆帝国';
 $('#navigation').innerHTML=navigation.map((n,i)=>`<a href="#/${n.id}" class="nav-link ${navId===n.id?'active':''}" ${navId===n.id?'aria-current="page"':''}><span class="nav-label">${E(n.label)}</span><span class="nav-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span></a>`).join('');
 $('#main').className=detail?(id==='article'?'main-content reading-main':'main-content'):'main-content long-page';
 document.body.classList.toggle('long-mode',!detail);document.body.classList.toggle('pantheon-page',detail&&navId==='pantheon');
 $('#main').innerHTML=detail?(id==='article'?articlePage(slug):fullWallPage(slug)):longPageMarkup();
 closeMenu();bindPage();if(!detail){updateArticles();longPage=new MagneticPageController();wallCleanup.push(()=>longPage?.destroy());}
}
function bindPage() {
 $$('.editor-wall-card').forEach(button=>button.addEventListener('click',()=>{const editor=window.shiliSiteEditor;if(editor.active&&!editor.previewing)return;const record=editor.catalog().find(r=>r.id===button.dataset.workId);if(!record||!record.visible)return;if(record.kind==='article')location.hash='#/article/'+record.item.slug;else {const item=record.item;openGallery([{...item,src:item.src||editor.poemImage(item.title,item.body),caption:record.title}],0,button);}}));
 const chestnutRoot=$('[data-chestnut-gravity]');if(chestnutRoot){const chestnut=new ChestnutGravity(chestnutRoot);wallCleanup.push(()=>chestnut.destroy());}
 const poetryRoot=document.querySelector('[data-poetry-garden]');if(poetryRoot){const garden=new PoetryGarden(poetryRoot);wallCleanup.push(()=>garden.destroy());}
 const photoRoot=$('[data-photo-hanging]');if(photoRoot&&photos.length){const hanging=new HangingPhotography(photoRoot,photos,(index,trigger)=>openGallery(photos,index,trigger));wallCleanup.push(()=>hanging.destroy());}
 const museumRoot=$('[data-museum-wall]');if(museumRoot&&D.sections.art.gallery.length){const museum=new MuseumWall(museumRoot,D.sections.art.gallery);wallCleanup.push(()=>museum.destroy());}
 if(photoRoot&&!photos.length)photoRoot.querySelector('.photo-depths').innerHTML='<p class="empty-state">暂时没有摄影作品，可在编辑器中添加或恢复。</p>';
 if(museumRoot&&!D.sections.art.gallery.length){museumRoot.innerHTML='<p class="empty-state">暂时没有画作，可在编辑器中添加或恢复。</p>';museumRoot.parentElement.dataset.entrance='ready';}
 initWalls();
 experience.mountArticle();
 const shelfRoot=$('#article-results');
 if(shelfRoot){const shelf=new ArticleShelfInteraction(shelfRoot);wallCleanup.push(()=>shelf.destroy());}
 const medalRoot=$('.medal-exhibit');
 if(medalRoot){const medal=new MilestoneMedal(medalRoot);const stage=new JourneyStage(medalRoot.closest('#section-journey'));wallCleanup.push(()=>{stage.destroy();medal.destroy();});}
 $('[data-home-image]')?.addEventListener('click',e=>openGallery([{src:D.sections.home.images[0],caption:''}],0,e.currentTarget));
$$('[data-gallery]:not(.drift-card):not(.star-card):not(.museum-frame):not(#poetry-resume)').forEach(b=>b.addEventListener('click',()=>openGallery(D.sections[b.dataset.gallery].gallery,Number(b.dataset.index),b)));$$('[data-density]').forEach(b=>b.addEventListener('click',()=>{const n=b.dataset.density;$('#gallery-grid').style.setProperty('--columns',n);$$('[data-density]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});}));$$('[data-category]').forEach(b=>b.addEventListener('click',()=>selectArticleCategory(b.dataset.category)));bindArticleSearch();$('#reading-size')?.addEventListener('click',()=>{$('.article-body').classList.toggle('large-type');$('#reading-size').textContent=$('.article-body').classList.contains('large-type')?'标准字号 Aa':'大字号 Aa';});$('#copy-article')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);toast('文章链接已复制');}catch{toast('请复制浏览器地址栏中的文章链接');}});bindArticleImages($('#main'));$('#contact-form')?.addEventListener('submit',e=>{e.preventDefault();try{localStorage.setItem('shili-message-draft',JSON.stringify({name:$('#contact-name').value,message:$('#contact-message').value}));$('#draft-status').textContent='草稿已保存在此浏览器，尚未发送。';}catch{$('#draft-status').textContent='浏览器不允许保存草稿，请手动复制后到原站留言。';}});if($('#contact-form')){try{const d=JSON.parse(localStorage.getItem('shili-message-draft')||'null');if(d){$('#contact-name').value=d.name;$('#contact-message').value=d.message;$('#draft-status').textContent='已恢复本机草稿，尚未发送。';}}catch{}}$('[data-journey-image]')?.addEventListener('click',e=>openGallery([{src:D.sections.journey.images[0],caption:'跑步里程记录'}],0,e.currentTarget));}

// Both reading surfaces use the same image actions; bound nodes disappear with their content.
const boundArticleImages=new WeakSet();
function bindArticleImages(root){
 const images=[...root.querySelectorAll('.article-body img')];
 images.forEach((im,i)=>{if(boundArticleImages.has(im))return;boundArticleImages.add(im);im.tabIndex=0;im.setAttribute('role','button');im.setAttribute('aria-label','放大文章配图 '+(i+1));
  const open=e=>{e.preventDefault();openGallery(images.map(x=>({src:x.getAttribute('src'),caption:x.alt||'文章配图'})),i,im);};
  im.addEventListener('click',open);im.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')open(e);});
 });
}
function openGallery(items,index,trigger){experience.open(items,index,trigger);}
function changeImage(delta){experience.change(delta);}
$('#lightbox-prev').addEventListener('click',()=>changeImage(-1));
$('#lightbox-next').addEventListener('click',()=>changeImage(1));
$('#lightbox-close').addEventListener('click',()=>experience.close());
$('#zoom-toggle').addEventListener('click',()=>experience.zoom());
$('#lightbox').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();changeImage(-1);}if(e.key==='ArrowRight'){e.preventDefault();changeImage(1);}});
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');setTimeout(()=>$('#toast').classList.remove('visible'),2800);}
function openSearch(){$('#search-dialog').showModal();document.body.classList.add('modal-open');$('#global-search').focus();search();}
function search(){const q=$('#global-search').value.trim().toLowerCase();const articles=sortedArticles.filter(a=>!q||(a.title+a.text).toLowerCase().includes(q));const nav=navigation.filter(n=>q&&n.label.includes(q));$('#search-results').innerHTML=nav.map(n=>`<a href="#/${n.id}"><span>栏目</span><strong>${E(n.label)}</strong><i>↗</i></a>`).join('')+articles.map(a=>`<a href="#/article/${a.slug}"><span>${E(a.category)}</span><strong>${E(a.title)}</strong><i>↗</i></a>`).join('')||'<p class="empty-state">没有找到相关内容，换个词试试。</p>';$$('#search-results a').forEach(a=>a.addEventListener('click',()=>$('#search-dialog').close()));}
$('#global-search').addEventListener('input',search);$('#search-dialog').addEventListener('close',()=>document.body.classList.remove('modal-open'));$('#search-dialog').addEventListener('click',e=>{if(e.target===$('#search-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)&&!document.activeElement.isContentEditable&&!document.querySelector('dialog[open]')){e.preventDefault();openSearch();}if(e.key==='Escape'){const dialog=$('#lightbox').open?$('#lightbox'):document.querySelector('dialog[open]');if(dialog){e.preventDefault();if(dialog.id==='lightbox')experience.close();else dialog.close();}closeMenu();}},true);
function closeMenu(){$('body').classList.remove('menu-open');}
$('#mobile-shade').addEventListener('click',closeMenu);
function setTheme(dark){document.documentElement.dataset.theme=dark?'dark':'light';$('#theme-toggle span').textContent=dark?'日间模式':'夜读模式';$('#theme-toggle').setAttribute('aria-label',dark?'切换浅色模式':'切换深色模式');try{localStorage.setItem('shili-theme',dark?'dark':'light');}catch{}}
try{setTheme(localStorage.getItem('shili-theme')==='dark');}catch{}$('#theme-toggle').addEventListener('click',()=>setTheme(document.documentElement.dataset.theme!=='dark'));
function finishPage(){
 const grid=$('#gallery-grid');
 if(grid){const initial=innerWidth<=600?2:3;grid.style.setProperty('--columns',initial);$$('[data-density]').forEach(b=>{const on=Number(b.dataset.density)===initial;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});}


}
$('#lightbox-wall').addEventListener('click',()=>experience.close(true));
if('scrollRestoration' in history)history.scrollRestoration='manual';
document.addEventListener('click',e=>{
 const link=e.target.closest('a[href^="#/"]');if(!link||e.defaultPrevented||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
 const id=link.getAttribute('href').slice(2);if(!longPage||!navigation.some(n=>n.id===id))return;
 e.preventDefault();if($('#search-dialog').open)$('#search-dialog').close();experience.close(true);
 savedScroll.set(activeRoute,scrollY);history.pushState(null,'','#/'+id);longPage.scrollToSection(id,true);
});
function routeChanged(initial=false){
 const previous=activeRoute,route=getRoute(),primary=navigation.some(n=>n.id===route);
 if(longPage&&primary){experience.close(true);longPage.scrollToSection(route,!initial);return;}
 savedScroll.set(previous,scrollY);render();finishPage();
 if(longPage){const restore=!initial&&(previous.startsWith('article/')||previous.startsWith('wall/'))?savedScroll.get(route):undefined;longPage.scrollToSection(primary?route:'home',false,restore);}
 else scrollTo(0,initial?0:savedScroll.get(route)||0);
 $('#main').focus({preventScroll:true});
}
window.shiliEditorBridge={
 colors:()=>longPage?.bridges(),
 refresh:()=>{const y=scrollY;sortedArticles.splice(0,sortedArticles.length,...(window.shiliSiteEditor.state.order.writing?D.articles:[...D.articles].sort((a,b)=>b.date.localeCompare(a.date))));render();finishPage();scrollTo(0,y);},
};
window.addEventListener('hashchange',()=>routeChanged());
window.shiliSiteEditor.ready.then(()=>{sortedArticles.splice(0,sortedArticles.length,...(window.shiliSiteEditor.state.order.writing?D.articles:[...D.articles].sort((a,b)=>b.date.localeCompare(a.date))));routeChanged(true);window.shiliSiteEditor.scan();});
