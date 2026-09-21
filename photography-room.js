import * as T from './three.module.min.js';

// Real perspective geometry. DOM controls remain available for keyboard access and fallback.
export class PhotographyRoom {
 constructor(host){
  this.host=host;this.root=host.root;this.viewport=host.viewport;this.dead=false;this.clock=0;this.frame=0;this.textures=new Map();this.resources=new Set();this.rows=[];this.lastLayout=-1;
  this.renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.outputColorSpace=T.SRGBColorSpace;
  this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.05;
  this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;
  this.canvas=this.renderer.domElement;this.canvas.className='photo-room-canvas';this.canvas.setAttribute('aria-hidden','true');this.viewport.prepend(this.canvas);
  this.scene=new T.Scene();this.camera=new T.PerspectiveCamera(43,1,5,24000);this.camera.position.set(0,0,1100);
  this.raycaster=new T.Raycaster();this.pointer=new T.Vector2();this.projected=new T.Vector3();this.pickables=[];
  this.unitPlane=this.keep(new T.PlaneGeometry(1,1));this.unitBox=this.keep(new T.BoxGeometry(1,1,1));
  this.ambient=new T.HemisphereLight(0xe3ecf5,0x45403a,1.5);this.scene.add(this.ambient);
  this.sun=new T.DirectionalLight(0xffecd1,2.7);this.sun.position.set(2300,2900,1300);this.sun.target.position.set(-1300,-650,-2600);this.sun.castShadow=true;
  Object.assign(this.sun.shadow.camera,{left:-2800,right:2800,top:3300,bottom:-1600,near:10,far:11000});this.sun.shadow.mapSize.set(2048,2048);this.sun.shadow.bias=-.00035;this.sun.shadow.normalBias=1.8;this.scene.add(this.sun,this.sun.target);
  this.floorMaterial=this.keep(new T.MeshStandardMaterial({color:0x696d70,roughness:.96}));
  this.floor=new T.Mesh(this.unitPlane,this.floorMaterial);this.floor.rotation.x=-Math.PI/2;this.floor.scale.set(24000,19000,1);this.floor.position.set(0,-580,-7500);this.floor.receiveShadow=true;this.scene.add(this.floor);
  this.wallMaterial=this.keep(new T.MeshStandardMaterial({color:0x777d81,roughness:1}));
  const wall=new T.Mesh(this.unitPlane,this.wallMaterial);wall.scale.set(24000,9000,1);wall.position.set(0,3800,-14000);wall.receiveShadow=true;this.scene.add(wall);
  // A few widely spaced joints give the floor a vanishing point without a grid overlay.
  const jointMaterial=this.keep(new T.LineBasicMaterial({color:0x646b70,transparent:true,opacity:.22}));
  for(const x of [-6000,-3000,0,3000,6000]){const g=this.keep(new T.BufferGeometry().setFromPoints([new T.Vector3(x,-578,1200),new T.Vector3(x,-578,-14000)]));const line=new T.Line(g,jointMaterial);this.scene.add(line);}
  this.beams=[];const floorY=-580;
  for(let i=0;i<3;i++){
   const source=new T.Vector3(2000+i*370,2500,-1200-i*900),end=new T.Vector3(-1400+i*1050,floorY,-2800-i*1150),length=source.distanceTo(end);
   const geometry=this.keep(new T.CylinderGeometry(45,240+i*55,length,28,1,true));
   const material=this.keep(new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,uniforms:{strength:{value:.055},tint:{value:new T.Color(0xffedca)}},
    vertexShader:'varying vec2 vUv;varying vec3 vNormal;varying vec3 vPosition;void main(){vUv=uv;vNormal=normalMatrix*normal;vec4 p=modelViewMatrix*vec4(position,1.0);vPosition=p.xyz;gl_Position=projectionMatrix*p;}',
    fragmentShader:'varying vec2 vUv;varying vec3 vNormal;varying vec3 vPosition;uniform float strength;uniform vec3 tint;void main(){float side=pow(abs(dot(normalize(vNormal),normalize(-vPosition))),2.0);float ends=smoothstep(0.0,0.25,vUv.y)*(1.0-smoothstep(0.65,1.0,vUv.y));gl_FragColor=vec4(tint,strength*side*ends);}'
   }));
   const beam=new T.Mesh(geometry,material);beam.position.copy(source).add(end).multiplyScalar(.5);beam.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),source.clone().sub(end).normalize());this.scene.add(beam);this.beams.push(beam);
   const light=new T.SpotLight(0xffe4b9,2.8,16000,.17,.8,0);light.position.copy(source);light.target.position.copy(end);this.scene.add(light,light.target);
  }
  for(const row of host.rows){
   const depth=row.depth,z=depth===0?0:depth===1?-800:depth===2?-2450-row.rowIndex*340:-4800-row.rowIndex*650;
   const group=new T.Group();group.rotation.y=depth===0?(row.rowIndex===1?.12:-.08):Math.sin(row.rowIndex*2+depth)*.16;this.scene.add(group);
   const ropeMaterial=this.keep(new T.MeshStandardMaterial({color:depth<2?0xa5815c:0x94948a,roughness:.95}));
   const data={row,z,group,ropeMaterial,cards:new Map(),points:[],hovered:false};this.rows.push(data);
  }
  this.themeObserver=new MutationObserver(()=>{this.theme();this.invalidate();});this.themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  this.lost=e=>{e.preventDefault();this.lostContext=true;cancelAnimationFrame(this.frame);this.frame=0;this.root.classList.remove('has-photo-room');this.root.dataset.photoRenderer='fallback';this.host.paint();};
  this.restored=()=>{this.lostContext=false;this.root.classList.add('has-photo-room');this.root.dataset.photoRenderer='webgl';this.resize();this.sync();};
  this.canvas.addEventListener('webglcontextlost',this.lost);this.canvas.addEventListener('webglcontextrestored',this.restored);
  this.root.classList.add('has-photo-room');this.root.dataset.photoRenderer='webgl';this.theme();this.resize();this.sync();
 }
 keep(resource){this.resources.add(resource);return resource;}
 theme(){this.dark=document.documentElement.dataset.theme==='dark';const fog=this.dark?0x242b31:0x81898e;this.scene.background=new T.Color(fog);this.scene.fog=new T.FogExp2(fog,.00021);this.floorMaterial.color.set(this.dark?0x262c32:0x545d64);this.wallMaterial.color.set(this.dark?0x303941:0x777d81);this.ambient.intensity=this.dark?.65:1.5;this.sun.intensity=this.dark?1.2:2.7;}
 texture(index){if(this.textures.has(index))return this.textures.get(index);const item=this.host.items[index],texture=new T.TextureLoader().load(item.thumb||item.src,()=>{if(this.dead){texture.dispose();return;}this.invalidate();});texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy());this.textures.set(index,texture);return texture;}
 resize(){if(this.dead)return;const h=this.host;this.width=h.width;this.height=h.height;if(!this.width||!this.height)return;this.unit=2*Math.tan(T.MathUtils.degToRad(this.camera.fov/2))*1100/this.height;this.camera.aspect=this.width/this.height;this.camera.updateProjectionMatrix();this.renderer.setSize(this.width,this.height);this.lastLayout=-1;this.invalidate();}
 makeCard(data,element){
  const group=new T.Group(),paperMat=this.keep(new T.MeshStandardMaterial({color:0xf2eee4,roughness:.94})),imageMat=this.keep(new T.MeshStandardMaterial({roughness:.95,side:T.DoubleSide})),pinMat=this.keep(new T.MeshStandardMaterial({color:0xb58b5f,roughness:.87}));
  const paper=new T.Mesh(this.unitBox,paperMat);paper.castShadow=data.row.depth<2;paper.receiveShadow=true;group.add(paper);
  const image=new T.Mesh(this.unitPlane,imageMat);image.position.z=1.3;image.receiveShadow=true;group.add(image);
  const pin=new T.Mesh(this.unitBox,pinMat);pin.castShadow=data.row.depth<2;group.add(pin);data.group.add(group);
  const card={group,paper,image,pin,element,materials:[paperMat,imageMat,pinMat],index:-1};image.userData.card=card;image.userData.depth=data.row.depth;paper.userData.card=card;paper.userData.depth=data.row.depth;this.pickables.push(image,paper);data.cards.set(element,card);return card;
 }
 layout(){
  const h=this.host;if(this.lastLayout===h.layoutVersion)return;this.lastLayout=h.layoutVersion;
  for(const data of this.rows){
   const row=data.row,k=(1100-data.z)/1100,u=this.unit*k;data.k=k;data.u=u;
   const shift=h.offset*row.speed,points=[];for(let x=-64;x<=this.width+96;x+=48)points.push(new T.Vector3((x-this.width*.5)*u,(this.height*.5-h.y(row,x-shift))*u,0));
   // Thin real tubes, not blurred screen-space strokes.
   const curve=new T.CatmullRomCurve3(points),geometry=new T.TubeGeometry(curve,Math.max(48,points.length*2),row.depth===0?2.1*u:row.depth===1?1.35*u:.65*u,5,false);
   if(data.rope){data.rope.geometry.dispose();data.rope.geometry=geometry;}else{data.rope=new T.Mesh(geometry,data.ropeMaterial);data.rope.castShadow=row.depth<2;data.group.add(data.rope);}
   for(const [el,c] of data.cards)if(!row.cards.includes(el)){data.group.remove(c.group);c.materials.forEach(m=>{m.dispose();this.resources.delete(m);});data.cards.delete(el);this.pickables=this.pickables.filter(m=>m!==c.image&&m!==c.paper);}
   for(const element of row.cards){const p=element.photoPlacement;if(!p)continue;const c=data.cards.get(element)||this.makeCard(data,element);c.p=p;c.group.visible=!(row.depth>1&&p.x<this.width*.34&&p.y>this.height*.12&&p.y<this.height*.46);
    if(c.index!==+element.dataset.photoIndex){c.index=+element.dataset.photoIndex;c.image.material.map=this.texture(c.index);c.image.material.needsUpdate=true;}
    const w=(p.w+12)*u,hh=(p.h+16)*u;c.w=w;c.h=hh;
    c.paper.scale.set(w,hh,2);c.paper.position.y=-hh*.5-10*u;
    c.image.scale.set(p.w*u,p.h*u,1);c.image.position.y=-hh*.5-8*u;
    c.pin.scale.set(8*u,29*u,5);c.pin.position.set(0,-5*u,4);
    c.group.position.set((p.x-this.width*.5)*u,(this.height*.5-p.y)*u,0);
    c.baseRotation=Math.sin(p.slot*4.13+row.depth)*.06;
   }
  }
 }
 draw(){
  if(this.dead||this.lostContext||!this.width)return;this.layout();const h=this.host,t=this.clock,reduce=h.motion.matches;
  const alphas=h.configs.map(c=>+getComputedStyle(this.root.querySelector('.photo-depth-'+c.name)).opacity);
  const copy=this.root.querySelector('.photo-copy').getBoundingClientRect(),bounds=this.viewport.getBoundingClientRect();
  // A subtle camera response changes actual perspective during dragging.
  this.camera.position.x=h.lift*.65+(reduce?0:Math.sin(h.offset/1200)*65);this.camera.position.y=h.lift*.3;this.camera.lookAt(0,0,-2000);this.camera.updateMatrixWorld();
  for(const data of this.rows){
   const {row,group,u,z}=data,alpha=alphas[row.depth]??1,float=[18,10,5,3][row.depth],phase=t/(2.1+row.depth*.4+row.rowIndex*.18)+row.rowIndex*2+row.depth;
   group.position.set(0,reduce?0:Math.sin(phase)*float*u-h.lift*row.speed*u,z-(1-alpha)*1800);group.visible=alpha>.001;
   for(const c of data.cards.values()){
    c.group.rotation.set(reduce?0:Math.sin(phase+c.p.slot)*.025,Math.sin(c.p.slot*1.9+row.rowIndex)*.16,c.baseRotation+(reduce?0:Math.sin(phase*.8+c.p.slot)*.018));
    for(const m of c.materials){const transparent=alpha<.999;if(m.transparent!==transparent){m.transparent=transparent;m.needsUpdate=true;}m.opacity=alpha;}
   }
   if(data.ropeMaterial.transparent!==(alpha<.999)){data.ropeMaterial.transparent=alpha<.999;data.ropeMaterial.needsUpdate=true;}data.ropeMaterial.opacity=alpha;
  }
  this.sun.position.x=2300+(reduce?0:Math.sin(t*.09)*130);this.beams.forEach((b,i)=>{b.material.uniforms.strength.value=(this.dark?.014:.022)*(reduce?1:.86+Math.sin(t*.16+i)*.14);});
  this.scene.updateMatrixWorld(true);
  // Project the very same meshes for accessible DOM hit areas; image pixels come only from WebGL.
  for(const data of this.rows)for(const c of data.cards.values()){
   const el=c.element;if(data.row.depth>1)continue;let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
   for(const [x,y] of [[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]]){this.projected.set(x,y,0).applyMatrix4(c.image.matrixWorld).project(this.camera);const px=(this.projected.x*.5+.5)*this.width,py=(-this.projected.y*.5+.5)*this.height;left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);}
   el.style.width=(right-left)+'px';el.style.height=(bottom-top)+'px';el.style.transform='translate('+left+'px,'+top+'px)';
   const cx=(left+right)/2+bounds.left,cy=(top+bottom)/2+bounds.top,covered=cx>copy.left-12&&cx<copy.right+12&&cy>copy.top-12&&cy<copy.bottom+12;
   el.tabIndex=left>4&&right<this.width-4&&top>0&&bottom<Math.min(this.height,innerHeight)-55&&!covered?0:-1;el.style.pointerEvents=covered?'none':'';
  }
  this.renderer.render(this.scene,this.camera);this.root.dataset.photoDepthRange='0…-9350';
 }
 pick(x,y){const r=this.viewport.getBoundingClientRect();this.pointer.set((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);this.raycaster.setFromCamera(this.pointer,this.camera);const hit=this.raycaster.intersectObjects(this.pickables,false).find(i=>i.object.parent.visible&&i.object.parent.parent.visible);return hit&&hit.object.userData.depth<2?hit.object.userData.card:null;}
 sync(){if(this.dead||this.lostContext)return;this.active=this.host.visible&&!document.hidden&&!this.host.blurred&&!document.body.classList.contains('modal-open');if(!this.active){cancelAnimationFrame(this.frame);this.frame=0;this.previous=0;return;}this.invalidate();}
 invalidate(){if(this.dead||this.lostContext||this.frame)return;this.frame=requestAnimationFrame(t=>this.tick(t));}
 tick(t){this.frame=0;if(this.dead||this.lostContext)return;if(this.active&&!this.host.motion.matches){this.clock+=this.previous?Math.min(.04,(t-this.previous)/1000):0;}this.previous=t;this.draw();if(this.active&&!this.host.motion.matches)this.invalidate();}
 dispose(){if(this.dead)return;this.dead=true;cancelAnimationFrame(this.frame);this.themeObserver.disconnect();this.canvas.removeEventListener('webglcontextlost',this.lost);this.canvas.removeEventListener('webglcontextrestored',this.restored);this.rows.forEach(d=>d.rope?.geometry.dispose());this.resources.forEach(r=>r.dispose());this.textures.forEach(t=>t.dispose());this.sun.shadow.dispose();this.renderer.dispose();this.renderer.forceContextLoss();this.canvas.remove();this.root.classList.remove('has-photo-room');}
}
