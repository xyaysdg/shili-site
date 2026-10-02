/* Section-aware editing tools. IDs, routes and actions stay independent of labels. */
(function(){
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const defaults={home:'#20170f',art:'#102b3a',photography:'#fcfaf6',poetry:'#f5f4f2',writing:'#fffefa',journey:'#030405',pantheon:'#090f21',contact:'#020304'};
 const titles={home:'让我想想说什么比较好',art:'说来“画”长',photography:'“摄”身处地',poetry:'“诗”志不渝',writing:'“篇篇”起舞',journey:'一步。一个。脚印。',pantheon:'万艺殿',contact:'超微型栗子对撞机'};
 const control=(section,key,selector,label,when)=>({section,key,selector,label,when});
 const originalCategories=['全部',...new Set(window.SITE_DATA.articles.map(a=>a.category))];
 window.shiliArticleCategories=()=>['全部',...new Set(window.SITE_DATA.articles.map(a=>a.category).filter(c=>c&&c!=='全部'))];
 const controls=[
  ...Object.keys(titles).map(id=>control(id,'nav:'+id,`#navigation a[href="#/${id}"] .nav-label`,titles[id])),
  ...[['art','完整作品墙 ↗','.museum-tools a'],['photography','查看完整照片墙 ↗','.photo-wall-link'],['poetry','查看完整诗稿墙 ↗','.poetry-wall-link'],['pantheon','完整作品墙 ↗','.flow-wall-link']].map(([id,label,selector])=>control(id,'wall:'+id,`#section-${id} ${selector}`,label)),
  control('poetry','poetry:original','.poetry-original','查看原稿 ↗'),
  control('poetry','poetry:previous','[data-poem-prev]','‹'),control('poetry','poetry:next','[data-poem-next]','›'),control('poetry','poetry:close','[data-poem-close]','×'),
  control('writing','writing:index','.library-index-toggle','查看全部文章'),
  control('journey','journey:image','[data-journey-image]','查看图片'),control('journey','journey:flip','.medal-flip','查看背面 ↻',e=>e.dataset.face!=='back'),control('journey','journey:front','.medal-flip','查看正面 ↻',e=>e.dataset.face==='back'),control('journey','journey:reset','.medal-reset','复位 ↺'),
  control('contact','contact:exchange','[data-chestnut-message]','与十里交流 ↗'),control('contact','contact:home','[data-chestnut-home]','回到中心'),
  control('contact','contact:friend','[data-chestnut-friend]','另一个顶有趣的灵魂。'),control('contact','contact:draft','#contact-form button[type=submit]','保留留言草稿'),control('contact','contact:send','#contact-form a.primary','启动对撞机 ↗'),
  ...[['poetry','.poetry-fall-toggle','暂停飘落','继续飘落'],['pantheon','#section-pantheon .flow-toggle','暂停漂浮 Ⅱ','继续漂浮 ▷'],['journey','.medal-pause','暂停转动 Ⅱ','继续转动 ▷'],['contact','[data-chestnut-pause]','暂停流动','继续流动']].flatMap(([id,selector,a,b])=>[control(id,id+':pause',selector,a,e=>e.getAttribute('aria-pressed')!=='true'),control(id,id+':resume',selector,b,e=>e.getAttribute('aria-pressed')==='true')])
 ];
 class ShiliEditorPanels{
  controls(){return [...controls,...window.shiliArticleCategories().map(name=>{const i=originalCategories.indexOf(name),key=i>=0?String(i):'u-'+Array.from(name,c=>c.codePointAt(0).toString(16)).join('-');return control('writing','writing:category-'+key,`#section-writing [data-category="${CSS.escape(name)}"]`,name);})];}
  constructor(editor){this.editor=editor;this.workSection='all';this.bases=new WeakMap();this.labelOriginals=new WeakMap();this.capturedColors={};this.backgroundSignatures=new WeakMap();
   addEventListener('shili:section-active',event=>{if(this.editor.ui&&this.selectedSection()!==event.detail.id){this.editor.clearSelection();this.syncSection(event.detail.id);}});
   addEventListener('hashchange',()=>{this.editor.clearSelection();this.locatedId=null;setTimeout(()=>this.syncSection(),0);});
   this.themeObserver=new MutationObserver(()=>{this.bases=new WeakMap();this.capturedColors={};this.backgroundSignatures=new WeakMap();editor.scan();this.syncSection();});this.themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  }
  nav(){return window.SITE_DATA.navigation.filter(n=>Object.hasOwn(titles,n.id));}
  title(id){return this.editor.state.buttons?.['nav:'+id]||titles[id]||id;}
  section(){const e=this.editor,route=e.route().split('/');return e.selected?.closest('[data-section]')?.dataset.section||(route[0]==='wall'?route[1]:route[0]==='article'?'writing':route[0]);}
  selectedSection(){return this.editor.ui?.querySelector('[data-section-picker]')?.value||this.section();}
  mount(){
   this.keywordSignature=null;
   const ui=this.editor.ui;ui.querySelector('[data-section-picker]').value=this.section();
   ui.querySelector('[data-section-picker]').onchange=e=>{this.editor.clearSelection();this.syncSection(e.target.value);location.hash='#/'+e.target.value;};
   ui.querySelector('[data-bg-layer]').onchange=()=>this.syncBackgroundUI();
   ui.querySelectorAll('[data-bg-param]').forEach(input=>{const change=()=>{if(input.type==='number'&&!input.checkValidity())return input.reportValidity();const field=input.dataset.bgParam;this.changeBackground(field,input.type==='checkbox'?input.checked:input.type==='color'?input.value:Number(input.value));};input.onchange=change;});
   ui.querySelector('[data-keywords-save]').onclick=()=>this.saveKeywords();
   ui.querySelector('[data-keywords-default]').onclick=()=>{this.editor.state.chestnutKeywords=null;this.keywordSignature=null;this.editor.commit('恢复栗子默认关键词',true);};
   ui.querySelector('[data-chestnut-keywords]').oninput=()=>{const field=ui.querySelector('[data-keywords-status]');try{const words=ShiliChestnutWords.parse(ui.querySelector('[data-chestnut-keywords]').value);field.textContent=words.length+' 项 · 尚未保存';}catch(error){field.textContent=error.message;}};
   this.syncSection();this.filterButtons();
  }
  syncSection(id=this.section()){
   const ui=this.editor.ui;if(!ui||!Object.hasOwn(titles,id))return;const picker=ui.querySelector('[data-section-picker]');picker.value=id;this.buttonFields(id);this.syncKeywords(id);this.syncBackgroundUI();
  }
  keywordMarkup(){return '<details data-keywords-panel open hidden><summary>飘带关键词</summary><label>全部文字与词语<textarea data-chestnut-keywords rows="10" spellcheck="false" aria-describedby="chestnut-keywords-help"></textarea></label><p class="editor-help" id="chestnut-keywords-help">每行一项，每项最多 16 个字符。完整诗句每行一条，保留句内标点；短词也可用逗号、顿号分隔。重复项自动合并。清空后保存可移除全部文字。</p><p class="editor-help" data-keywords-status role="status"></p><div class="editor-actions"><button type="button" data-keywords-save>保存关键词</button><button type="button" data-keywords-default>恢复默认</button></div></details>';}
  syncKeywords(id){const panel=this.editor.ui?.querySelector('[data-keywords-panel]');if(!panel)return;panel.hidden=id!=='contact';const values=ShiliChestnutWords.current(),signature=JSON.stringify(values);if(signature===this.keywordSignature)return;this.keywordSignature=signature;panel.querySelector('textarea').value=values.join('\n');panel.querySelector('[data-keywords-status]').textContent=values.length+' 项 · 已应用';}
  saveKeywords(){try{const values=ShiliChestnutWords.parse(this.editor.ui.querySelector('[data-chestnut-keywords]').value);this.editor.state.chestnutKeywords=values;this.keywordSignature=null;this.editor.commit('修改栗子关键词',true);this.editor.notice('已应用 '+values.length+' 个关键词。');}catch(error){this.editor.ui.querySelector('[data-keywords-status]').textContent=error.message;this.editor.notice(error.message);}}
  filterButtons(){const container=this.editor.ui?.querySelector('[data-content-sections]');if(!container)return;container.innerHTML=['all',...this.nav().map(x=>x.id)].map(id=>`<button type="button" data-work-section="${id}" aria-pressed="${id===this.workSection}">${esc(id==='all'?'全部':this.title(id))}</button>`).join('');container.onclick=e=>{const b=e.target.closest('[data-work-section]');if(!b)return;this.workSection=b.dataset.workSection;this.editor.listContent();};}
  accepts(record,query){return (this.workSection==='all'||record.section===this.workSection)&&(!query||(record.title+' '+record.section+' '+this.title(record.section)).toLowerCase().includes(query));}
  listFinished(){this.filterButtons();const ui=this.editor.ui;if(!ui)return;const list=ui.querySelector('[data-content-list]');if(!list.children.length)list.innerHTML='<p class="editor-help">这个板块暂无符合条件的作品。</p>';}
  async locate(id){
   const e=this.editor,r=e.catalog().find(x=>x.id===id&&!x.deleted);if(!r)return e.notice('作品已删除，可先从回收站恢复。');e.clearSelection();e.flush();this.pendingLocation=id;this.locatedId=null;
   const route='#/wall/'+r.section;if(location.hash===route)e.refresh();else location.hash=route;
   // Route rendering is synchronous after hashchange. Scan finishes before focusing.
   for(let attempt=0;attempt<40;attempt++){await new Promise(resolve=>setTimeout(resolve,50));if(this.pendingLocation!==id)return;const target=document.querySelector(`[data-work-id="${CSS.escape(id)}"]`);if(!target)continue;document.querySelectorAll('.editor-work-located').forEach(x=>x.classList.remove('editor-work-located'));target.classList.add('editor-work-located');this.locatedId=id;this.pendingLocation=null;if(innerWidth<=700){e.ui.classList.add('is-collapsed');e.ui.querySelector('[data-action=collapse]').textContent='展开';}target.scrollIntoView({block:'center',behavior:'instant'});if(innerWidth<=700){const rect=target.getBoundingClientRect(),bottom=e.ui.getBoundingClientRect().top-16;if(rect.bottom>bottom)scrollBy({top:rect.bottom-bottom,behavior:'instant'});}target.focus({preventScroll:true});e.notice('已定位：'+r.title+(r.visible?'':'（仅编辑器显示隐藏作品）'));return;}
   this.pendingLocation=null;e.notice('定位尚未完成，请再次点击定位。');
  }
  wallMarkup(id){
   const e=this.editor,records=e.catalog().filter(r=>r.section===id&&!r.deleted&&(e.active&&!e.previewing||r.visible));
   return `<header class="page-heading"><h1>${esc(this.title(id))}</h1></header><div class="gallery-toolbar"><a href="#/${id}" class="arrow-link">← 返回板块</a><span>完整作品墙 / ${records.length}</span></div><div class="editor-full-wall full-wall" id="gallery-grid" data-wall-section="${esc(id)}">${records.map(r=>{const item=r.item,src=item.thumb||item.src||item.cover;return `<button type="button" class="editor-wall-card${r.visible?'':' is-hidden-work'}" data-work-id="${esc(r.id)}" data-content-id="${esc(r.id)}" aria-label="${esc(r.title)}${r.visible?'':'，已隐藏'}">${src?`<img src="${esc(src)}" alt="${esc(r.title)}" width="${Number(item.width)||600}" height="${Number(item.height)||750}" loading="lazy">`:''}<strong>${esc(r.title)}</strong>${r.kind==='article'||r.kind==='poem'?`<span class="editor-wall-excerpt">${esc((item.body||item.text||item.excerpt||'').slice(0,300))}</span>`:''}${r.visible?'':'<span class="editor-hidden-badge">已隐藏</span>'}</button>`;}).join('')||'<p class="empty-state">这个板块还没有作品。</p>'}</div>`;
  }
  applyLabels(){
   const e=this.editor,state=e.state.buttons||{};
   for(const item of this.controls())for(const el of document.querySelectorAll(item.selector)){
    if(item.when&&!item.when(el))continue;
    let originals=this.labelOriginals.get(el);if(!originals){originals={};this.labelOriginals.set(el,originals);}if(!Object.hasOwn(originals,item.key))originals[item.key]=el.textContent;
    const edited=Object.hasOwn(state,item.key),value=edited?state[item.key]:el.dataset.editorButton===item.key?originals[item.key]:null;
    if(value!=null&&el.textContent!==value)el.textContent=value;
    if(edited)el.dataset.editorButton=item.key;else if(el.dataset.editorButton===item.key)delete el.dataset.editorButton;
   }
   // Keep selector choices in sync without replacing a focused form control.
   e.ui?.querySelectorAll('[data-section-picker] option').forEach(o=>{o.textContent=this.title(o.value);});
  }
  buttonFields(id){const box=this.editor.ui?.querySelector('[data-section-buttons]');if(!box)return;const definitions=this.controls().filter(x=>x.section===id),signature=id+JSON.stringify([this.editor.state.buttons||{},definitions.map(x=>x.key)]);if(box.dataset.signature===signature)return;box.dataset.signature=signature;box.replaceChildren();
   for(const d of definitions){const row=document.createElement('label');row.className='editor-button-field';const original=d.key.startsWith('nav:')?'目录 · '+d.label:d.label;row.innerHTML=`<span>${esc(original)}</span><div><input data-button-key="${esc(d.key)}" maxlength="80" aria-label="修改 ${esc(original)}" value="${esc(this.editor.state.buttons?.[d.key]??d.label)}"><button type="button" aria-label="恢复 ${esc(original)}">恢复</button></div>`;const input=row.querySelector('input');input.onchange=()=>{const value=input.value.trim();if(!value){input.value=this.editor.state.buttons?.[d.key]??d.label;return this.editor.notice('按钮名称不能为空。');}this.editor.flush();this.editor.state.buttons||={};this.editor.state.buttons[d.key]=value;this.editor.commit('修改按钮文字');this.filterButtons();};row.querySelector('button').onclick=()=>{this.editor.flush();delete this.editor.state.buttons?.[d.key];this.editor.commit('恢复按钮文字');this.buttonFields(id);this.filterButtons();};box.append(row);}
  }
  colorToHex(color,fallback='#f5f3ec'){if(/^#[\da-f]{6}$/i.test(color||''))return color;const values=String(color).match(/[\d.]+/g);if(!values||values.length<3||(values.length>3&&+values[3]===0))return fallback;return '#'+values.slice(0,3).map(n=>Math.round(+n).toString(16).padStart(2,'0')).join('');}
  baseColor(id){
   const dark=document.documentElement.dataset.theme==='dark',fallback=dark&&id==='poetry'?'#24272a':defaults[id]||'#f5f3ec';const section=document.querySelector(`#section-${CSS.escape(id)}`);
   if(section){const css=getComputedStyle(section),color=this.colorToHex(css.getPropertyValue('--bridge-top').trim()&&!section.dataset.editorBackground?css.getPropertyValue('--bridge-top').trim():css.backgroundColor,fallback);this.capturedColors[id]=color;return color;}
   return this.capturedColors[id]||fallback;
  }
  layers(id){const color=this.editor.state.backgrounds[id]||this.baseColor(id),saved=this.editor.state.backgroundLayers?.[id];return saved?ShiliEditorData.clone(saved):[{enabled:true,color,sharpness:0,saturation:100,blur:0,opacity:100,texture:!this.editor.state.backgrounds[id]},{enabled:false,color,sharpness:0,saturation:100,blur:0,opacity:50,texture:false}];}
  backgroundMarkup(){return `<div class="editor-background-controls"><label>背景层<select data-bg-layer><option value="0">背景 1 号 · 底层</option><option value="1">背景 2 号 · 上层</option></select></label><label class="editor-checkbox"><input type="checkbox" data-bg-param="enabled">启用这一层</label><div class="editor-grid"><label>背景颜色<input data-editor-bg data-bg-param="color" type="color"></label><label>透明度（%）<input data-bg-param="transparency" type="number" min="0" max="100" step="1"></label><label>锐度（%）<input data-bg-param="sharpness" type="number" min="0" max="100" step="1"></label><label>饱和度（%）<input data-bg-param="saturation" type="number" min="0" max="200" step="1"></label><label>模糊度（像素）<input data-bg-param="blur" type="number" min="0" max="40" step="1"></label></div><label class="editor-checkbox"><input type="checkbox" data-bg-param="texture">保留原背景纹理</label><p class="editor-help">背景 2 号叠在 1 号上方。透明度越高，下层越明显；纯色的锐度和模糊度主要影响边缘。</p><button type="button" data-action="resetBg">恢复本板块背景</button></div>`;}
  syncBackgroundUI(){const ui=this.editor.ui;if(!ui)return;const layer=this.layers(this.selectedSection())[Number(ui.querySelector('[data-bg-layer]').value)];for(const input of ui.querySelectorAll('[data-bg-param]')){const key=input.dataset.bgParam,value=key==='transparency'?100-layer.opacity:layer[key];if(input.type==='checkbox')input.checked=Boolean(value);else input.value=value;}}
  changeBackground(field,value){const e=this.editor,id=this.selectedSection(),i=Number(e.ui.querySelector('[data-bg-layer]').value),layers=this.layers(id);e.flush();if(field==='transparency'){field='opacity';value=100-value;}layers[i][field]=value;if(field==='color'){layers[i].enabled=true;layers[i].texture=false;}e.state.backgroundLayers||={};e.state.backgroundLayers[id]=layers;e.state.backgrounds[id]=layers[0].color;e.commit('调整背景 '+(i+1)+' 号');this.syncBackgroundUI();}
  resetBackground(){const e=this.editor,id=this.selectedSection();e.flush();delete e.state.backgrounds[id];delete e.state.backgroundLayers?.[id];e.commit('恢复板块背景');this.syncBackgroundUI();}
  blendColor(base,layers){let rgb=base.slice(1).match(/../g).map(x=>parseInt(x,16));for(const l of layers){if(!l.enabled)continue;let c=l.color.slice(1).match(/../g).map(x=>parseInt(x,16)),grey=c[0]*.213+c[1]*.715+c[2]*.072;c=c.map(x=>Math.max(0,Math.min(255,grey+(x-grey)*l.saturation/100)));const a=l.opacity/100;rgb=rgb.map((v,i)=>v*(1-a)+c[i]*a);}return '#'+rgb.map(x=>Math.round(x).toString(16).padStart(2,'0')).join('');}
  surface(section,id){return id==='home'?section.closest('.intro-sequence')?.querySelector('.intro-backdrop'):section.querySelector(({art:'.museum-backdrop',photography:'.photo-hanging',poetry:'.poetry-garden',contact:'.chestnut-canvas'})[id]||':scope > .no-background-surface')||section;}
  applyBackgrounds(){
   const e=this.editor,sections=[...document.querySelectorAll('#main [data-section]')],detail=document.querySelector('#main:has(.full-wall),#main:has(.reading-page)');if(detail)sections.push(detail);
   for(const section of sections){const id=section.dataset.section||this.section();if(!Object.hasOwn(titles,id))continue;const host=section===detail?section:this.surface(section,id),configured=!!(e.state.backgroundLayers?.[id]||e.state.backgrounds[id]);if(!host)continue;
    if(!configured){host.querySelector(':scope > .editor-background-stack')?.remove();delete host.dataset.editorLayerHost;delete section.dataset.editorBackground;for(const k of ['--bridge-top','--bridge-bottom','--editor-bg','--ink','color'])if(section.dataset.editorBackgroundApplied)section.style.removeProperty(k);delete section.dataset.editorBackgroundApplied;this.backgroundSignatures.delete(host);continue;}
    let base=this.bases.get(host);if(!base){const css=getComputedStyle(host),source=id==='home'?host.querySelector('.intro-atmosphere'):null,background=source?getComputedStyle(source):css;base={color:this.baseColor(id),image:background.backgroundImage,size:background.backgroundSize,position:background.backgroundPosition};this.bases.set(host,base);}
    const layers=this.layers(id),signature=JSON.stringify(layers);if(this.backgroundSignatures.get(host)===signature)continue;this.backgroundSignatures.set(host,signature);
    host.querySelector(':scope > .editor-background-stack')?.remove();host.dataset.editorLayerHost=id;section.dataset.editorBackground='true';section.dataset.editorBackgroundApplied='true';const stack=document.createElement('div');stack.className='editor-background-stack';stack.setAttribute('aria-hidden','true');stack.style.backgroundColor=base.color;stack.style.backgroundImage=base.image;stack.style.backgroundSize=base.size;stack.style.backgroundPosition=base.position;
    for(let i=0;i<layers.length;i++){const layer=layers[i];if(!layer.enabled)continue;const filterId='editor-sharpen-'+id+'-'+i,amount=layer.sharpness/100,node=document.createElement('div');node.className='editor-background-layer';node.dataset.backgroundLayer=String(i);node.style.backgroundColor=layer.color;if(layer.texture){node.style.backgroundImage=base.image;node.style.backgroundSize=base.size;node.style.backgroundPosition=base.position;}node.style.opacity=layer.opacity/100;
     if(amount){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','editor-background-filter');svg.innerHTML=`<defs><filter id="${filterId}" color-interpolation-filters="sRGB"><feConvolveMatrix order="3" kernelMatrix="0 ${-amount} 0 ${-amount} ${1+4*amount} ${-amount} 0 ${-amount} 0" edgeMode="duplicate" preserveAlpha="true"/></filter></defs>`;stack.append(svg);}
     node.style.filter=(amount?`url("#${filterId}") `:'')+`saturate(${layer.saturation/100}) blur(${layer.blur}px)`;stack.append(node);
    }
    host.prepend(stack);const color=this.blendColor(base.color,layers);section.style.setProperty('--bridge-top',color);section.style.setProperty('--bridge-bottom',color);section.style.setProperty('--editor-bg',color);const rgb=color.slice(1).match(/../g).map(x=>parseInt(x,16)),ink=rgb[0]*.299+rgb[1]*.587+rgb[2]*.114>150?'#26221d':'#f4ead8';section.style.setProperty('--ink',ink);section.style.color=ink;
   }
   window.shiliEditorBridge?.colors();
  }
 }
 window.ShiliEditorPanels=ShiliEditorPanels;
})();
