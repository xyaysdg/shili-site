import * as T from './three.module.min.js';
import {FontLoader} from './FontLoader.js';

// All silver surfaces below are lit, beveled solids, not illustrations on planes.
export async function createMedalModel(root){
 const response=await fetch('./medal-font.json');if(!response.ok)throw new Error('Medal font unavailable');
 const font=new FontLoader().parse(await response.json());
 if(!root.isConnected)return null;
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x000000,0);
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 const canvas=renderer.domElement;canvas.className='medal-webgl';canvas.setAttribute('aria-hidden','true');
 const stage=root.querySelector('.medal-stage');stage.append(canvas);
 const scene=new T.Scene(),model=new T.Group();scene.add(model);
 const camera=new T.PerspectiveCamera(33,1,.1,100);camera.position.set(0,0,11.3);
 const resources=new Set();const keep=r=>(resources.add(r),r);
 // A local studio environment: actual reflected softboxes, with no image texture.
 const studio=new T.Scene();studio.background=new T.Color(0x667176);
 const panel=(w,h,x,y,z,power)=>{const m=keep(new T.MeshBasicMaterial({color:new T.Color(power,power,power),side:T.DoubleSide}));const p=new T.Mesh(keep(new T.PlaneGeometry(w,h)),m);p.position.set(x,y,z);p.lookAt(0,0,0);studio.add(p);};
 panel(2.5,9,-5,3,5,4);panel(1.5,10,6,1,3,3);panel(8,2,0,6,2,4);panel(2,7,-2,0,-6,2);panel(4,4,3,-5,3,.7);panel(5,9,0,1,8,1.4);panel(.8,12,-3,0,7,.08);panel(1.1,12,3.6,0,7,.16);
 const pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromScene(studio,.035,.1,30);scene.environment=env.texture;pmrem.dispose();
 const key=new T.DirectionalLight(0xffffff,3.1);key.position.set(-3,7,8);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.1,far:25});key.shadow.bias=-.00015;key.shadow.normalBias=.007;scene.add(key);
 const fill=new T.DirectionalLight(0xc0dcff,1.1);fill.position.set(5,-1,4);scene.add(fill);
 const textureCanvas=document.createElement('canvas');textureCanvas.width=textureCanvas.height=256;const grain=textureCanvas.getContext('2d');grain.fillStyle='#777';grain.fillRect(0,0,256,256);
 let seed=741;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<15000;i++){const v=70+Math.floor(random()*110);grain.strokeStyle=`rgb(${v},${v},${v})`;const x=random()*256,y=random()*256;grain.beginPath();grain.moveTo(x,y);grain.lineTo(x+random()*3,y+random()*2);grain.stroke();}
 const enamelGrain=keep(new T.CanvasTexture(textureCanvas));enamelGrain.wrapS=enamelGrain.wrapT=T.RepeatWrapping;enamelGrain.repeat.set(3,3);
 const brushedCanvas=document.createElement('canvas');brushedCanvas.width=512;brushedCanvas.height=128;const brush=brushedCanvas.getContext('2d');
 for(let x=0;x<512;x++){const v=Math.round(128+24*Math.sin(x*.044)+10*Math.sin(x*.19)+random()*18);brush.fillStyle=`rgb(${v},${v},${v})`;brush.fillRect(x,0,1,128);}
 const brushed=keep(new T.CanvasTexture(brushedCanvas));brushed.wrapS=brushed.wrapT=T.RepeatWrapping;brushed.repeat.set(.7,.7);
 const metal=keep(new T.MeshStandardMaterial({color:0xe5e0d8,metalness:1,roughness:.26,envMapIntensity:1.4,bumpMap:brushed,bumpScale:.032}));
 const gold=keep(new T.MeshStandardMaterial({color:0xf2b747,metalness:1,roughness:.19,envMapIntensity:1.3}));
 const copper=keep(new T.MeshStandardMaterial({color:0xef491d,metalness:.9,roughness:.22,envMapIntensity:1.2}));
 const purple=keep(new T.MeshPhysicalMaterial({color:0x8707ad,metalness:.8,roughness:.22,clearcoat:1}));
 const edgeMetal=keep(new T.MeshStandardMaterial({color:0x71828c,metalness:1,roughness:.29,envMapIntensity:1.15}));
 const dark=keep(new T.MeshStandardMaterial({color:0x263d43,metalness:.95,roughness:.3}));
 const mint=keep(new T.MeshPhysicalMaterial({color:0xa5edc6,metalness:.4,roughness:.2,clearcoat:1,clearcoatRoughness:.1}));
 const green=keep(new T.MeshPhysicalMaterial({color:0x005340,metalness:.2,roughness:.42,envMapIntensity:.28,clearcoat:.35,clearcoatRoughness:.22,bumpMap:enamelGrain,bumpScale:.038}));
 const darkerGreen=keep(new T.MeshPhysicalMaterial({color:0x006750,metalness:.5,roughness:.26,clearcoat:.8}));
 // Coordinate conversion retains the supplied shield silhouette.
 const pt=(x,y,s=1)=>new T.Vector2((x-250)/100*s,(280-y)/100*s);
 const outline=new T.Shape();const move=(x,y)=>{const p=pt(x,y);outline.moveTo(p.x,p.y);};const line=(x,y)=>{const p=pt(x,y);outline.lineTo(p.x,p.y);};const quad=(x,y,a,b)=>{const p=pt(x,y),q=pt(a,b);outline.quadraticCurveTo(p.x,p.y,q.x,q.y);};
 move(122,43);line(378,43);quad(423,43,431,89);line(458,374);quad(462,405,437,425);line(273,541);quad(250,557,227,541);line(63,425);quad(38,405,42,374);line(69,89);quad(77,43,122,43);
 const contour=outline.getPoints(30);
 const shield=(scale,hole=0)=>{const s=new T.Shape(contour.map(p=>p.clone().multiplyScalar(scale)));if(hole)s.holes.push(new T.Path(contour.map(p=>p.clone().multiplyScalar(hole)).reverse()));return s;};
 const solid=(shape,depth,z,material,name,bevel=.018,parent=model)=>{
  const geometry=keep(new T.ExtrudeGeometry(shape,{depth,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3,curveSegments:12,steps:1}));
  const mesh=new T.Mesh(geometry,material);mesh.position.z=z;mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 };
 solid(shield(1),.24,-.12,edgeMetal,'structural-metal-body',.025);
 solid(shield(.985,.914),.145,.105,metal,'raised-polished-outer-frame',.047);
 solid(shield(.909,.833),.04,.135,mint,'inset-mint-enamel-ring',.009);
 solid(shield(.841,.785),.09,.145,gold,'raised-inner-gold-bezel',.018);
 solid(shield(.782),.045,.10,green,'recessed-emerald-face',.015);
 const text=(value,size,y,z,depth=.045,parent=model,mat=metal)=>{
  const shapes=font.generateShapes(value,size);const mesh=solid(shapes,depth,z,mat,'embossed-'+value,size>.8?.018:.009,parent);mesh.geometry.computeBoundingBox();const b=mesh.geometry.boundingBox;mesh.position.x=-(b.max.x+b.min.x)/2;mesh.position.y=y;return mesh;
 };
 const numeral=text('1000',.9,.28,.18,.09);
 // Fine raised contours catch light around the machined numerals.
 const shapes=font.generateShapes('1000',.9);
 for(const shape of shapes)for(const path of [shape,...shape.holes]){const points=path.getPoints(32).map(p=>new T.Vector3(p.x+numeral.position.x,p.y+.28,.286));if(points.length>2){points.push(points[0].clone());const tube=new T.Mesh(keep(new T.TubeGeometry(new T.CatmullRomCurve3(points),points.length*2,.009,5,false)),metal);model.add(tube);}}
 text('KM',.43,-.3,.18,.065);
 const polygon=points=>new T.Shape(points.map(p=>pt(...p)));
 solid(polygon([[80,29],[420,29],[428,54],[72,54]]),.09,.15,metal,'top-metal-crossbar',.02);
 solid(polygon([[96,42],[404,42],[250,110]]),.11,.24,darkerGreen,'ribbon-base',.018);
 solid(polygon([[102,41],[250,45],[250,96]]),.05,.35,green,'ribbon-left-facet',.008);
 solid(polygon([[250,45],[398,41],[250,96]]),.025,.35,green,'ribbon-right-facet',.008);
 solid(polygon([[218,16],[282,16],[282,82],[218,82]]),.10,.405,metal,'raised-top-plaque',.025);
 const k=text('K',.43,2.10,.54,.035,model,purple);k.position.x=-.18;
 // Round metal rails have real curved cross sections and cast shadows on enamel.
 const inside=p=>{const poly=contour.map(v=>v.clone().multiplyScalar(.766));let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)yes=!yes;}return yes;};
 const rail=(points,parent=model)=>{if(points.length<2)return;const curve=new T.CatmullRomCurve3(points);const mesh=new T.Mesh(keep(new T.TubeGeometry(curve,Math.max(24,points.length),.038,8,false)),copper);mesh.name='solid-running-track';mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);};
 for(let i=0;i<4;i++){
  const start=pt(63+i*23,393+i*22),control=pt(122+i*17,285+i*26),end=pt(247+i*9,326+i*26),finish=pt(443-i*20,402+i*19);
  const curve=new T.QuadraticBezierCurve(start,control,end);const points=[];
  for(let j=0;j<=120;j++){const t=j/120;const p=t<=.65?curve.getPoint(t/.65):end.clone().lerp(finish,(t-.65)/.35);if(inside(p))points.push(new T.Vector3(p.x,p.y,.208));}rail(points);
 }
 // Back plate and embossed dates are independent geometry too.
 const back=new T.Group();back.rotation.y=Math.PI;model.add(back);
 solid(shield(.93),.025,.14,darkerGreen,'back-enamel',.013,back);
 solid(shield(.962,.926),.035,.155,metal,'back-metal-border',.009,back);
 text('1000km',.43,1.03,.18,.04,back);text('2021.02.02',.25,.05,.18,.025,back);text('2025.12.18',.25,-.91,.18,.025,back);
 // Chinese labels are flat laser markings, not a replacement for raised metal meshes.
 const label=(value,y)=>{const c=document.createElement('canvas');c.width=768;c.height=96;const ctx=c.getContext('2d');ctx.font='40px sans-serif';ctx.fillStyle='#cce5df';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(value,384,48);const texture=keep(new T.CanvasTexture(c));texture.colorSpace=T.SRGBColorSpace;const m=keep(new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));const mesh=new T.Mesh(keep(new T.PlaneGeometry(2.9,.3625)),m);mesh.position.set(0,y,.181);back.add(mesh);};
 label('个人生涯跑步里程',1.8);label('第一条记录',.64);label('达成日期',-.33);
 let pitch=-8,yaw=-14,disposed=false;
 const render=()=>{if(disposed)return;model.rotation.set(-pitch*Math.PI/180,yaw*Math.PI/180,0,'YXZ');renderer.render(scene,camera);};
 const resize=()=>{const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=Math.max(11.3,5.25/(Math.tan(33*Math.PI/360)*camera.aspect*1.5));camera.updateProjectionMatrix();render();};
 const observer=new ResizeObserver(resize);observer.observe(stage);resize();root.classList.add('has-webgl-medal');root.dataset.medalRenderer='webgl';
 const lost=e=>{e.preventDefault();root.classList.remove('has-webgl-medal');root.dataset.medalRenderer='fallback';};
 const restored=()=>{root.classList.add('has-webgl-medal');root.dataset.medalRenderer='webgl';render();};canvas.addEventListener('webglcontextlost',lost);canvas.addEventListener('webglcontextrestored',restored);
 return {model,renderer,render(p,y){pitch=p;yaw=y;render();},dispose(){disposed=true;observer.disconnect();canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('webglcontextrestored',restored);resources.forEach(r=>r.dispose());env.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();root.classList.remove('has-webgl-medal');}};
}
