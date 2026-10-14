/* Pure draft validation shared by browser imports and local version exports. */
(function(root){
 const record=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const sectionIds=['home','about','friend','art','photography','poetry','writing','journey','pantheon','contact'];
 const linkURL=s=>{if(typeof s!=='string'||/[\u0000-\u0020\u007f]/.test(s))return '';if(/^#\/[a-z0-9/_-]*$/i.test(s))return s;try{const u=new URL(s);return ['http:','https:'].includes(u.protocol)?s:'';}catch{return '';}};
 const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
 const imageURL=s=>{if(typeof s!=='string')return false;if(s===''||/^assets\//.test(s)||/^data:image\/(png|jpeg|webp|gif);base64,/i.test(s))return true;if(/^data:image\/svg\+xml/i.test(s)){try{const raw=decodeURIComponent(s.split(',').slice(1).join(','));return !/<script|on\w+\s*=|foreignObject|(?:href|src)\s*=/i.test(raw);}catch{return false;}}return /^https?:\/\//i.test(s)&&linkURL(s)===s;};
 function validate(input){
  if(!record(input)||![1,2].includes(input.version)||!record(input.text)||!record(input.hidden)||!record(input.additions))throw Error('备份结构不完整，未更改当前草稿。');
  const walk=x=>{if(!x||typeof x!=='object')return;for(const [k,v] of Object.entries(x)){if(['__proto__','prototype','constructor'].includes(k))throw Error('备份包含不支持的属性。');walk(v);}};walk(input);
  for(const key of ['backgrounds','buttons','backgroundLayers','edits','order'])if(input[key]!=null&&!record(input[key]))throw Error('备份结构有误：'+key);
  for(const k of ['articles','gallery','poems','text','media'])if(input.additions[k]!=null&&!Array.isArray(input.additions[k]))throw Error('内容列表格式有误：'+k);
  for(const k of ['articles','gallery','poems','dom'])if(input.hidden[k]!=null&&(!Array.isArray(input.hidden[k])||input.hidden[k].some(x=>typeof x!=='string')))throw Error('隐藏列表格式有误。');
  if(input.invisible!=null&&(!Array.isArray(input.invisible)||input.invisible.some(x=>typeof x!=='string'))||input.trash!=null&&!Array.isArray(input.trash))throw Error('备份列表结构有误。');
  for(const order of Object.values(input.order||{}))if(!Array.isArray(order)||order.some(x=>typeof x!=='string'))throw Error('排序记录格式有误。');
  if(input.chestnutKeywords!=null&&(!Array.isArray(input.chestnutKeywords)||input.chestnutKeywords.some(x=>typeof x!=='string'||Array.from(x.trim()).length>16||/[\r\n]/.test(x))))throw Error('关键词格式有误。');
  const checkItem=(o,kind,full=false)=>{
   if(!record(o))throw Error('作品记录格式有误。');
   for(const key of ['slug','title','html','text','excerpt','category','date','source','cover','src','thumb','caption','description','id','body','section','anchor'])if(Object.hasOwn(o,key)&&!(key==='anchor'&&o[key]===null)&&typeof o[key]!=='string')throw Error('作品字段必须是文字：'+key);
   for(const key of ['title','category','caption'])if(o[key]!=null&&o[key].length>1000)throw Error('作品标题或分类过长。');
   if(o.slug!=null&&!/^[a-z0-9][a-z0-9_-]{0,159}$/i.test(o.slug))throw Error('文章标识格式有误。');
   if(o.date!=null&&!validDate(o.date))throw Error('文章日期格式有误，请使用有效的年月日。');
   if(o.source&&linkURL(o.source)!==o.source)throw Error('原文链接仅支持 http、https 或站内链接。');
   for(const key of ['src','thumb','cover'])if(o[key]!=null&&!imageURL(o[key]))throw Error('图片地址格式不支持。');
   if(o.section!=null&&!sectionIds.includes(o.section))throw Error('作品板块有误。');
   for(const key of ['width','height'])if(o[key]!=null&&(!Number.isFinite(o[key])||o[key]<=0))throw Error('图片尺寸格式有误。');
   if(full&&kind==='article')for(const key of ['slug','title','date','text','html'])if(typeof o[key]!=='string'||(['slug','title','date'].includes(key)&&!o[key].trim()))throw Error('文章缺少必要字段：'+key);
   if(full&&kind==='poem')for(const key of ['id','title','body'])if(typeof o[key]!=='string')throw Error('诗歌缺少必要字段：'+key);
   if(full&&['text','media'].includes(kind))for(const key of ['id','section',kind==='text'?'html':'src'])if(typeof o[key]!=='string')throw Error('新增内容缺少必要字段：'+key);
   if(full&&kind==='image'&&typeof o.src!=='string')throw Error('图片缺少地址。');
   for(const [key,max]of [['displayCopies',5],['displayChance',100]])if(o[key]!=null&&(!Number.isInteger(o[key])||o[key]<0||o[key]>max))throw Error('卡片数量或概率超出范围。');
   if(o.paper!=null){const p=o.paper;if(!record(p)||!/^#[\da-f]{6}$/i.test(p.color)||!imageURL(p.image)||p.image.startsWith('#')||/^data:image\/svg/i.test(p.image)||!Number.isFinite(p.opacity)||p.opacity<0||p.opacity>100)throw Error('诗卡背景参数有误。');}
  };
  Object.values(input.text).forEach(o=>checkItem(o,'text'));
  for(const [id,o] of Object.entries(input.edits||{}))checkItem(o,id.split(':')[0]);
  for(const kind of ['articles','poems','text','media'])for(const o of input.additions[kind]||[])checkItem(o,kind==='articles'?'article':kind==='poems'?'poem':kind,true);
  for(const o of input.additions.gallery||[]){if(!record(o)||!sectionIds.includes(o.section))throw Error('图片板块记录格式有误。');checkItem(o.item,'image',true);}
  for(const o of input.trash||[])if(!record(o)||typeof o.id!=='string'||o.title!=null&&typeof o.title!=='string')throw Error('回收站记录格式有误。');
  for(const color of Object.values(input.backgrounds||{}))if(typeof color!=='string'||!/^#[\da-f]{6}$/i.test(color))throw Error('背景颜色格式有误。');
  for(const [id,layers]of Object.entries(input.backgroundLayers||{})){if(!sectionIds.includes(id)||!Array.isArray(layers)||layers.length!==2)throw Error('背景层格式有误。');for(const l of layers){if(!record(l)||!/^#[\da-f]{6}$/i.test(l.color))throw Error('背景层颜色格式有误。');for(const [key,max,fallback]of [['sharpness',100,0],['saturation',200,100],['blur',40,0],['opacity',100,100]]){const n=Number(l[key]??fallback);if(!Number.isFinite(n)||n<0||n>max)throw Error('背景层效果超出范围。');}}}
  return input;
 }
 const api={validate,linkURL,validDate};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ShiliDraftSchema=api;
})(typeof window!=='undefined'?window:globalThis);
