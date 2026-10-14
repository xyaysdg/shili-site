/* Versioned browser drafts. Original content files are never changed. */
(function(){
 const clone=x=>JSON.parse(JSON.stringify(x));
 const empty=()=>({version:2,chestnutKeywords:null,text:{},backgrounds:{},buttons:{},backgroundLayers:{},edits:{},order:{},invisible:[],trash:[],hidden:{articles:[],gallery:[],poems:[],dom:[]},additions:{articles:[],gallery:[],poems:[],text:[],media:[]}});
 const safeURL=s=>typeof s==='string'&&(/^(https?:\/\/|data:image\/(png|jpeg|webp|gif);base64,|assets\/|#\/)/i.test(s)||s==='')?s:'';
 const cleanHTML=s=>{const t=document.createElement('template');t.innerHTML=String(s||'');t.content.querySelectorAll('script,style,iframe,object,embed,svg,math,form,input,button,link,meta').forEach(e=>e.remove());t.content.querySelectorAll('*').forEach(e=>{for(const a of [...e.attributes]){if(!['href','src','alt','title','colspan','rowspan','data-editor-block'].includes(a.name))e.removeAttribute(a.name);else if(['href','src'].includes(a.name)&&!safeURL(a.value))e.removeAttribute(a.name);}if(e.tagName==='A')e.rel='noopener noreferrer';});return t.innerHTML;};
 const styleKeys=['fontSize','fontFamily','color','textAlign','whiteSpace','lineHeight','letterSpacing','marginTop','marginBottom','fontWeight','fontStyle','textDecoration'];
 function validateCardSettings(o){
  for(const [key,max] of [['displayCopies',5],['displayChance',100]])if(o[key]!=null){if(!Number.isInteger(o[key])||o[key]<0||o[key]>max)throw Error('卡片数量或概率超出范围。');}
  if(o.paper!=null){const p=o.paper;if(!p||!/^#[\da-f]{6}$/i.test(p.color)||typeof p.image!=='string'||(p.image&&!safeURL(p.image))||p.image.startsWith('#')||!Number.isFinite(p.opacity)||p.opacity<0||p.opacity>100)throw Error('诗卡背景参数有误。');o.paper={color:p.color,image:p.image,opacity:p.opacity};}
  return o;
 }
 const cleanStyle=o=>Object.fromEntries(Object.entries(o||{}).filter(([k,v])=>styleKeys.includes(k)&&typeof v==='string'&&v.length<120&&!/[<>;{}]|url\(|expression/i.test(v)));
 function normalize(input){
  window.ShiliDraftSchema.validate(input);
  if(!input||typeof input!=='object'||![1,2].includes(input.version))throw Error('文件不是受支持的编辑备份（版本 1 或 2）。');
  if(!input.text||!input.additions||!input.hidden)throw Error('备份缺少必要数据，未导入。');
  const s=empty();
  if(input.chestnutKeywords!=null)s.chestnutKeywords=window.ShiliChestnutWords.normalize(input.chestnutKeywords);
  for(const k of ['text','backgrounds','buttons','backgroundLayers','edits','order']){if(input[k]&&(typeof input[k]!=='object'||Array.isArray(input[k])))throw Error('备份结构有误：'+k);s[k]=clone(input[k]||{});}
  for(const k of Object.keys(s.additions)){if(input.additions[k]&&!Array.isArray(input.additions[k]))throw Error('内容列表格式有误。');s.additions[k]=clone(input.additions[k]||[]);}
  for(const k of Object.keys(s.hidden)){if(input.hidden[k]&&!Array.isArray(input.hidden[k]))throw Error('隐藏列表格式有误。');s.hidden[k]=(input.hidden[k]||[]).filter(x=>typeof x==='string');}
  if(input.invisible&&!Array.isArray(input.invisible)||input.trash&&!Array.isArray(input.trash))throw Error('备份列表结构有误。');for(const order of Object.values(s.order))if(!Array.isArray(order)||!order.every(x=>typeof x==='string'))throw Error('排序记录格式有误。');
  s.invisible=(input.invisible||[]).filter(x=>typeof x==='string');s.trash=clone(input.trash||[]);
  const cleanItem=o=>{if(!o||typeof o!=='object')throw Error('内容记录格式有误。');if(o.html!=null)o.html=cleanHTML(o.html);if(o.style)o.style=cleanStyle(o.style);for(const k of ['src','thumb','cover'])if(o[k]){if(/^data:image\/svg\+xml/.test(o[k])){const raw=decodeURIComponent(o[k].split(',').slice(1).join(','));if(/<script|on\w+\s*=|foreignObject|(?:href|src)\s*=/i.test(raw))throw Error('图片含有不支持的活动内容。');}else if(!safeURL(o[k]))throw Error('图片地址格式不支持。');}return validateCardSettings(o);};
  Object.values(s.text).forEach(cleanItem);Object.values(s.edits).forEach(cleanItem);Object.values(s.additions).flat().forEach(x=>cleanItem(x.item||x));
  for(const [k,v] of Object.entries(s.backgrounds))if(!/^#[0-9a-f]{6}$/i.test(v))delete s.backgrounds[k];
  for(const [k,v] of Object.entries(s.buttons))if(!/^[a-z]+:[a-z0-9-]+$/.test(k)||typeof v!=='string'||!v.trim()||v.length>80)delete s.buttons[k];
  for(const [id,layers] of Object.entries(s.backgroundLayers)){
   if(!['home','art','photography','poetry','writing','journey','pantheon','contact'].includes(id)||!Array.isArray(layers)||layers.length!==2)throw Error('背景层数据格式有误。');
   s.backgroundLayers[id]=layers.map(l=>{if(!l||!/^#[0-9a-f]{6}$/i.test(l.color))throw Error('背景颜色格式有误。');const result={color:l.color,enabled:!!l.enabled,texture:!!l.texture};for(const [key,max,fallback] of [['sharpness',100,0],['saturation',200,100],['blur',40,0],['opacity',100,100]]){const n=Number(l[key]??fallback);if(!Number.isFinite(n)||n<0||n>max)throw Error('背景效果参数超出范围。');result[key]=n;}return result;});
  }
  return s;
 }
 class Store{
  constructor(){this.state=empty();this.history=[];this.future=[];this.queue=Promise.resolve();this.dirty=false;this.scope=location.pathname;this.base=JSON.stringify(this.state);this.ready=this.init();}
  async init(){
   let loaded;
   try{this.db=await new Promise((resolve,reject)=>{const r=indexedDB.open('shili-editor-v2',1);r.onupgradeneeded=()=>r.result.createObjectStore('drafts');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('请关闭旧版编辑标签页后重试。'));});loaded=await new Promise((resolve,reject)=>{const r=this.db.transaction('drafts').objectStore('drafts').get(this.scope);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});if(loaded){this.revision=loaded.revision||0;this.savedAt=loaded.savedAt||0;this.state=normalize(loaded.state);this.history=Array.isArray(loaded.history)?loaded.history.slice(-20):[];await this.loadRecoveryBackup(loaded.recoveryKey);}else{let legacy;try{legacy=JSON.parse(localStorage.getItem('shili-local-editor-v1')||'null');}catch(e){this.recoveryRecord={legacyRaw:localStorage.getItem('shili-local-editor-v1')};throw e;}loaded=window.SHILI_PUBLISHED_EDITS||legacy;this.state=normalize(loaded||empty());}this.base=JSON.stringify(this.state);}
   catch(e){this.error='编辑草稿暂时无法读取：'+e.message;if(loaded||this.recoveryRecord)this.recoveryRecord??=loaded.state?loaded:{state:loaded};this.history=[];try{this.state=normalize(window.SHILI_PUBLISHED_EDITS||empty());}catch{this.state=empty();}this.base=JSON.stringify(this.state);}
   this.savedRevision=this.revision||0;this.savedBase=JSON.stringify(this.state);return this;
  }
  async loadRecoveryBackup(key){if(typeof key!=='string'||!key.startsWith(this.scope+'|recovery:'))return;try{this.recoveredRecord=await new Promise((resolve,reject)=>{const r=this.db.transaction('drafts').objectStore('drafts').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});this.recoveryKey=key;}catch{}}
  async recoverOriginal(){
   if(!this.recoveryRecord)return;if(!this.db)throw Error('草稿库不可用，请先导出原始草稿。');
   await this.queue;const key=this.scope+'|recovery:'+crypto.randomUUID(),original=this.recoveryRecord,next={state:empty(),history:[],revision:this.savedRevision+1,savedAt:Date.now(),recoveryKey:key};
   await new Promise((resolve,reject)=>{const tx=this.db.transaction('drafts','readwrite'),store=tx.objectStore('drafts'),r=store.get(this.scope);let conflict;
    r.onsuccess=()=>{if((r.result?.revision||0)!==this.savedRevision){conflict=Error('另一标签页已修改草稿，请先导出后刷新。');tx.abort();return;}store.put(original,key);store.put(next,this.scope);};tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(conflict||tx.error||Error('恢复未完成，原草稿未替换'));});
   this.state=next.state;this.history=[];this.future=[];this.revision=this.savedRevision=next.revision;this.savedAt=next.savedAt;this.base=this.savedBase=JSON.stringify(this.state);this.recoveredRecord=this.recoveryRecord;this.recoveryKey=key;this.recoveryRecord=null;this.error='';this.dirty=false;
  }
  checkpoint(label='修改内容'){
   const json=JSON.stringify(this.state);if(json===this.base){this.dirty=json!==this.savedBase;if(!this.dirty)this.onstatus?.(this.error?'error':'saved',this.error);return this.queue;}
   this.history.push({id:crypto.randomUUID(),time:Date.now(),label,state:JSON.parse(this.base)});this.history=this.history.slice(-20);this.future=[];this.base=json;return this.persist();
  }
  persist(){
   if(this.recoveryRecord){this.error='原草稿尚未恢复，请先导出原始草稿并选择恢复编辑。';this.onstatus?.('error',this.error);return this.queue;}
   const record={state:clone(this.state),// History states are immutable snapshots; undo/restore already clone into live state.
    // Capture the list now; IndexedDB performs the deep structured clone when putting it.
    history:this.history.slice(),...(this.recoveryKey?{recoveryKey:this.recoveryKey}:{}),revision:(this.revision||0)+1};this.revision=record.revision;this.dirty=true;this.onstatus?.('saving');
   this.queue=this.queue.catch(()=>{}).then(async()=>{if(!this.db)throw Error(this.error||'草稿库不可用');await new Promise((resolve,reject)=>{const tx=this.db.transaction('drafts','readwrite'),store=tx.objectStore('drafts'),check=store.get(this.scope);let conflict;check.onsuccess=()=>{if((check.result?.revision||0)!==this.savedRevision){conflict=Error('另一标签页已保存新版本。请先导出本页备份，再刷新后导入合并');tx.abort();return;}record.savedAt=Date.now();store.put(record,this.scope);};tx.oncomplete=()=>{this.savedRevision=record.revision;this.savedBase=JSON.stringify(record.state);this.savedAt=record.savedAt;resolve();};tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(conflict||tx.error||Error('保存被中断'));});if(record.revision===this.revision){this.dirty=JSON.stringify(this.state)!==this.savedBase;this.error='';this.onstatus?.(this.dirty?'saving':'saved');}}).catch(e=>{this.error=e.message||'存储空间不足';this.onstatus?.('error',this.error);});return this.queue;
  }
  undo(){const x=this.history.at(-1);if(!x)return false;let restored;try{restored=normalize(x.state);}catch(e){this.onstatus?.('error','历史记录无法恢复：'+e.message);return false;}this.history.pop();this.future.push({id:crypto.randomUUID(),time:Date.now(),label:'重做',state:clone(this.state)});this.state=restored;this.base=JSON.stringify(this.state);this.persist();return true;}
  redo(){const x=this.future.at(-1);if(!x)return false;let restored;try{restored=normalize(x.state);}catch(e){this.onstatus?.('error','历史记录无法恢复：'+e.message);return false;}this.future.pop();this.history.push({id:crypto.randomUUID(),time:Date.now(),label:'撤销重做',state:clone(this.state)});this.state=restored;this.base=JSON.stringify(this.state);this.persist();return true;}
 }
 window.ShiliEditorData={Store,empty,normalize,clone,cleanHTML,cleanStyle,safeURL,styleKeys,validateCardSettings};
})();
