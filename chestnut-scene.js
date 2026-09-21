/* Local scene: Chinese lettering on flowing spatial ribbons; no remote runtime. */
import * as T from './three.module.min.js';
import {GLTFLoader} from './GLTFLoader.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export async function createChestnutScene(host){
 const mobile=host.clientWidth<700,reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const renderer=new T.WebGLRenderer({antialias:false,alpha:false,powerPreference:'high-performance'});
 renderer.setClearColor(0x020304);renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1:1.35));renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 const canvas=renderer.domElement;canvas.setAttribute('aria-label','金色中文曲面环绕自动旋转的栗子，拖动栗子探索引力空间');canvas.setAttribute('role','img');host.prepend(canvas);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(44,1,.1,210),field=new T.Group();scene.add(field);
 const resources=[],track=o=>(resources.push(o),o),clock={value:0},pointer={value:new T.Vector2(9,9)},pulse={value:0};
 let disposed=false,active=false,paused=false,frame=0,last=0,time=0,progress=0,progressTarget=0,rotation=0,frames=0;
 const mouse=new T.Vector2(),smoothMouse=new T.Vector2(),offset=new T.Vector2(),smoothOffset=new T.Vector2();
 // A shared Chinese glyph atlas: every moving mark is real lettering, no Latin/digits.
 const words='栗子灵魂碰撞宇宙耀眼交流十里期待深度相信';
 const ink=document.createElement('canvas');ink.width=2048;ink.height=1024;const ctx=ink.getContext('2d');ctx.clearRect(0,0,2048,1024);ctx.fillStyle='white';ctx.textBaseline='middle';ctx.textAlign='center';
 ctx.font='54px "Songti SC", "Noto Serif CJK SC", "SimSun", serif';
 for(let y=0;y<16;y++)for(let x=0;x<32;x++){const seed=(x*17+y*11)%words.length;ctx.fillText(words[seed],x*64+32,y*64+32);}
 const atlas=track(new T.CanvasTexture(ink));atlas.wrapS=atlas.wrapT=T.RepeatWrapping;atlas.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
 const warp=`uniform vec2 uShift; vec3 bend(vec3 p){float influence=1.-smoothstep(2.6,26.,length(p.xy));p.xy+=uShift*influence;return p;}`;
 const shared={uTime:clock,uAtlas:{value:atlas},uPointer:pointer,uPulse:pulse,uShift:{value:new T.Vector2()}};
 const ribbons=[];
 for(let lane=0;lane<8;lane++){
  const length=mobile?150:240,across=mobile?10:18,pos=[],uv=[],index=[];let arc=0,prev=null;
  const foreground=new T.CatmullRomCurve3([new T.Vector3(-30,24,6),new T.Vector3(-22,12,8),new T.Vector3(-15,-2,9),new T.Vector3(-6,-7,5),new T.Vector3(5,-5,-1),new T.Vector3(2.8,-.3,-1.2)]); 
  for(let i=0;i<=length;i++){
   const t=i/length,r=2.55+Math.pow(t,1.2)*34,angle=[0,.61,1.52,2.4,3.15,4.17,4.9,5.72][lane]+.28+Math.pow(t,.82)*2.25;
   const center=lane===0?foreground.getPoint(t):new T.Vector3(Math.cos(angle)*r,Math.sin(angle)*r*.78,Math.sin(t*5+lane*.95)*t*5-1.1);
   if(prev)arc+=center.distanceTo(prev);prev=center;
   const width=lane===0?12*Math.pow(1-t,.65)+.2:(.6+Math.pow(t,.8)*13.8)*(lane%3===0?1.35:.83);
   for(let j=0;j<=across;j++){
    const a=j/across-.5;const rr=r+a*width;
    if(lane===0){const tangent=foreground.getTangent(t),side=new T.Vector3(-tangent.y,tangent.x,Math.sin(t*6)*.75).normalize();const p=center.clone().addScaledVector(side,a*width);pos.push(p.x,p.y,p.z);}else pos.push(Math.cos(angle)*rr,Math.sin(angle)*rr*.78,center.z+a*width*Math.sin(t*3+lane)*.8);
    uv.push(arc/(lane===0?30:20),a*width/(lane===0?15:10)+lane*.123);
    if(i<length&&j<across){const k=i*(across+1)+j;index.push(k,k+across+1,k+1,k+1,k+across+1,k+across+2);}
   }
  }
  const geo=track(new T.BufferGeometry());geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(index);geo.computeVertexNormals();
  const mat=track(new T.ShaderMaterial({uniforms:{...shared,uLane:{value:lane},uStrength:{value:lane===0?2.1:lane%3===0?1.8:1.05}},vertexShader:`${warp}
uniform float uTime,uLane;varying vec2 vUv;varying vec3 vWorld;varying vec2 vScreen;
void main(){vUv=uv;vec3 p=position;float outside=smoothstep(2.6,12.,length(p.xy));p.z+=sin(p.x*.23+p.y*.16+uTime*.18+uLane)*.35*outside;p=bend(p);vWorld=(modelMatrix*vec4(p,1.)).xyz;vec4 clip=projectionMatrix*viewMatrix*vec4(vWorld,1.);vScreen=clip.xy/clip.w;gl_Position=clip;}`,
fragmentShader:`uniform sampler2D uAtlas;uniform float uTime,uLane,uStrength,uPulse;uniform vec2 uPointer;varying vec2 vUv;varying vec3 vWorld;varying vec2 vScreen;
void main(){vec2 flow=vUv+vec2(-uTime*.009,0.);float mainInk=texture2D(uAtlas,flow).a;float fine=texture2D(uAtlas,flow*vec2(3.,3.)+uLane*.123).a;float tiny=texture2D(uAtlas,flow*vec2(7.,6.)).a;float band=.35+.65*pow(.5+.5*sin(vUv.y*60.+uLane),6.);float shimmer=.8+.2*sin(vUv.x*80.-uTime*.6+uLane);float hover=exp(-dot(vScreen-uPointer,vScreen-uPointer)*10.);float power=(mainInk*band*.95+fine*.19+tiny*.065)*shimmer*uStrength;vec3 gold=mix(vec3(1.,.38,.055),vec3(1.,.79,.4),mainInk);gl_FragColor=vec4(gold*power*(1.+hover*.65+uPulse*.4),clamp(power,0.,1.));}`,
transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending}));
  const mesh=new T.Mesh(geo,mat);mesh.frustumCulled=false;field.add(mesh);ribbons.push(mesh);
 }
 // Black event horizon, with bright radial filaments around its silhouette.
 const core=new T.Group();field.add(core);
 const globe=new T.Mesh(track(new T.SphereGeometry(2.38,48,32)),track(new T.MeshBasicMaterial({color:0x000000})));core.add(globe);
 const haloMaterial=track(new T.ShaderMaterial({uniforms:{uTime:clock,uPulse:pulse},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform float uTime,uPulse;varying vec2 vUv;
void main(){vec2 p=(vUv-.5)*13.;float r=length(p),a=atan(p.y,p.x);float edge=2.42;float d=r-edge;if(d<-.045)discard;float threads=.64+.18*sin(a*84.+r*102.-uTime*.6)+.12*sin(a*137.-r*160.+uTime);float narrow=exp(-abs(d)*34.)*2.8;float bands=exp(-max(0.,d)*4.6)*threads*(.3+.7*pow(.5+.5*sin(r*125.+sin(a*19.)*3.-uTime*.7),3.));float glow=exp(-max(0.,d)*2.1)*.16;float streak=pow(.5+.5*sin(a*12.+sin(a*29.)*.45-r*7.+uTime*.11),8.)*exp(-max(0.,d)*2.5)*.6;float intensity=narrow+bands+glow+streak;vec3 gold=mix(vec3(1.,.49,.12),vec3(1.,.93,.72),exp(-abs(d)*6.));gl_FragColor=vec4(gold*intensity*(1.+uPulse*.3),1.);}`,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));
 const halo=new T.Mesh(track(new T.PlaneGeometry(13,13)),haloMaterial);halo.position.z=.05;core.add(halo);
 // Distant stars use one draw call.
 let seed=81173;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296};
 const starPos=[],starCol=[];for(let i=0;i<(mobile?3500:11000);i++){starPos.push((random()-.5)*180,(random()-.5)*130,-18-random()*75);const v=.15+random()**5*.85;starCol.push(v,v*.9,v*.78);}
 const starsGeo=track(new T.BufferGeometry());starsGeo.setAttribute('position',new T.Float32BufferAttribute(starPos,3));starsGeo.setAttribute('color',new T.Float32BufferAttribute(starCol,3));
 const stars=new T.Points(starsGeo,track(new T.PointsMaterial({size:.085,vertexColors:true,transparent:true,opacity:.8,depthWrite:false})));scene.add(stars);
 // Close readable glyph fragments spiral towards the core, remaining in 3D.
 const glyphs=[],glyphGeo=track(new T.PlaneGeometry(.55,.55));
 for(let i=0;i<(mobile?32:64);i++){
  const mat=track(new T.ShaderMaterial({uniforms:{uAtlas:{value:atlas},uCell:{value:new T.Vector2(i%32,Math.floor(i/32))},uAlpha:{value:1}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform sampler2D uAtlas;uniform vec2 uCell;uniform float uAlpha;varying vec2 vUv;void main(){float a=texture2D(uAtlas,(uCell+vUv)/vec2(32.,16.)).a;gl_FragColor=vec4(vec3(1.,.72,.3)*a*1.5,a*uAlpha);}`,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));
  const mesh=new T.Mesh(glyphGeo,mat);field.add(mesh);glyphs.push({mesh,phase:random(),angle:random()*Math.PI*2,rate:.006+random()*.006});
 }
 scene.add(new T.HemisphereLight(0xffecd9,0x332011,.8));const key=new T.DirectionalLight(0xffebd0,2);key.position.set(2,5,8);scene.add(key);const rim=new T.DirectionalLight(0xffc68a,1.5);rim.position.set(-5,1,2);scene.add(rim);
 const modelPivot=new T.Group();core.add(modelPivot);modelPivot.position.z=2.25;modelPivot.rotation.z=-.16;
 let gltf;
 try{gltf=await new GLTFLoader().loadAsync('./assets/chestnut-v39.glb');}catch(e){renderer.dispose();canvas.remove();resources.forEach(r=>r.dispose());throw e;}
 const box=new T.Box3().setFromObject(gltf.scene),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3()),scale=2.6/Math.max(size.x,size.y,size.z);
 gltf.scene.scale.setScalar(scale);gltf.scene.position.copy(center).multiplyScalar(-scale);modelPivot.add(gltf.scene);
 gltf.scene.traverse(o=>{if(!o.isMesh)return;track(o.geometry);for(const m of(Array.isArray(o.material)?o.material:[o.material])){track(m);m.roughness=Math.max(.65,m.roughness);m.metalness=Math.min(.35,m.metalness);for(const t of Object.values(m))if(t?.isTexture)track(t);}});
 // A low-resolution glow pass rather than large CSS filters or per-letter DOM.
 const rt=track(new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType})),blurA=track(new T.WebGLRenderTarget(1,1,{depthBuffer:false})),blurB=track(new T.WebGLRenderTarget(1,1,{depthBuffer:false}));
 const postScene=new T.Scene(),postCamera=new T.OrthographicCamera(-1,1,1,-1,0,1),quad=new T.Mesh(track(new T.PlaneGeometry(2,2)));postScene.add(quad);
 const screenVertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
 const blur=track(new T.ShaderMaterial({uniforms:{uMap:{value:rt.texture},uStep:{value:new T.Vector2()},uExtract:{value:1}},vertexShader:screenVertex,fragmentShader:`uniform sampler2D uMap;uniform vec2 uStep;uniform float uExtract;varying vec2 vUv;vec3 sampleAt(vec2 p){vec3 c=texture2D(uMap,p).rgb;return mix(c,max(c-.62,0.),uExtract);}void main(){vec3 c=sampleAt(vUv)*.227027;c+=(sampleAt(vUv+uStep*1.384615)+sampleAt(vUv-uStep*1.384615))*.316216;c+=(sampleAt(vUv+uStep*3.230769)+sampleAt(vUv-uStep*3.230769))*.07027;gl_FragColor=vec4(c,1.);}`}));
 const compose=track(new T.ShaderMaterial({uniforms:{uMap:{value:rt.texture},uGlow:{value:blurB.texture}},vertexShader:screenVertex,fragmentShader:`uniform sampler2D uMap,uGlow;varying vec2 vUv;void main(){vec3 c=texture2D(uMap,vUv).rgb+texture2D(uGlow,vUv).rgb*.75;gl_FragColor=vec4(c,1.);#include <tonemapping_fragment>\n#include <colorspace_fragment>}`}));
 // Shader chunks must start on their own lines.
 compose.fragmentShader=compose.fragmentShader.replace(';#include',';\n#include');
 let w=1,h=1;const handle=host.querySelector('[data-chestnut-handle]');
 function resize(){w=host.clientWidth;h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.fov=w<700?54:44;camera.updateProjectionMatrix();const ratio=renderer.getPixelRatio();rt.setSize(w*ratio,h*ratio);blurA.setSize(Math.max(1,w*ratio/4),Math.max(1,h*ratio/4));blurB.setSize(Math.max(1,w*ratio/4),Math.max(1,h*ratio/4));request();}
 function paint(dt){
  if(!paused&&!reduce.matches){time+=dt;rotation+=dt*.18;}clock.value=time;pulse.value=Math.max(0,pulse.value-dt*.65);progress+=(progressTarget-progress)*(1-Math.exp(-dt*5));smoothMouse.lerp(mouse,1-Math.exp(-dt*3));smoothOffset.lerp(offset,1-Math.exp(-dt*7));shared.uShift.value.copy(smoothOffset);
  const narrow=w<700;field.position.set(narrow?0:5.3,narrow?2.8:.3,0);core.position.set(smoothOffset.x,smoothOffset.y,0);
  camera.position.set(Math.sin(progress*.7)*7+smoothMouse.x*.35,Math.sin(progress*.9)*3+smoothMouse.y*.25,23-progress*3);camera.lookAt(0,0,0);
  halo.quaternion.copy(camera.quaternion);modelPivot.rotation.y=rotation;modelPivot.rotation.x=.1+Math.sin(time*.25)*.075;
  glyphs.forEach((g,i)=>{const t=1-((g.phase+time*g.rate)%1),r=2.5+t*26,a=g.angle+t*3;g.mesh.position.set(Math.cos(a)*r+smoothOffset.x*(1-t),Math.sin(a)*r*.78+smoothOffset.y*(1-t),Math.sin(a+i)*t*3+.25);g.mesh.quaternion.copy(camera.quaternion);g.mesh.scale.setScalar(.45+t*1.6);g.mesh.material.uniforms.uAlpha.value=Math.min(1,t*8);});
  scene.updateMatrixWorld(true);const screen=core.getWorldPosition(new T.Vector3()).project(camera),diameter=4.8/(2*Math.tan(camera.fov*Math.PI/360)*camera.position.distanceTo(core.getWorldPosition(new T.Vector3())))*h;
  handle.style.left=(screen.x+1)*w/2+'px';handle.style.top=(1-screen.y)*h/2+'px';handle.style.width=handle.style.height=diameter+'px';
  renderer.setRenderTarget(rt);renderer.render(scene,camera);
  quad.material=blur;blur.uniforms.uMap.value=rt.texture;blur.uniforms.uExtract.value=1;blur.uniforms.uStep.value.set(1/blurA.width,0);renderer.setRenderTarget(blurA);renderer.render(postScene,postCamera);
  blur.uniforms.uMap.value=blurA.texture;blur.uniforms.uExtract.value=0;blur.uniforms.uStep.value.set(0,1/blurA.height);renderer.setRenderTarget(blurB);renderer.render(postScene,postCamera);
  quad.material=compose;renderer.setRenderTarget(null);renderer.render(postScene,postCamera);
  host.dataset.rotation=rotation.toFixed(4);host.dataset.time=time.toFixed(3);host.dataset.frames=String(++frames);host.dataset.offset=offset.toArray().join(',');
 }
 function tick(now){frame=0;if(disposed||!active||document.hidden)return;const dt=Math.min((now-(last||now-16))/1000,.05);last=now;try{paint(dt);}catch(e){host.dataset.error=e.message;host.dispatchEvent(new Event('chestnut-error'));return;}if(!reduce.matches&&!paused||Math.abs(progressTarget-progress)>.001||smoothOffset.distanceTo(offset)>.001)frame=requestAnimationFrame(tick);}
 function request(){if(!frame&&!disposed&&active&&!document.hidden)frame=requestAnimationFrame(tick);}
 const visibility=()=>{last=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;}else request();};document.addEventListener('visibilitychange',visibility);
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 const contextLost=e=>{e.preventDefault();host.dispatchEvent(new Event('chestnut-error'));};canvas.addEventListener('webglcontextlost',contextLost);
 return {setActive(v){active=v;last=0;if(v)request();else{cancelAnimationFrame(frame);frame=0;}},setProgress(v){progressTarget=clamp(v,0,1);request();},move(x,y){mouse.set(x,y);pointer.value.set(x,y);request();},shift(x,y){offset.set(clamp(x,-5,5),clamp(y,-3.5,3.5));request();},getOffset(){return offset.clone();},pulse(){pulse.value=1;request();},pause(v){paused=v;request();},destroy(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',contextLost);new Set(resources).forEach(r=>r.dispose());renderer.dispose();renderer.forceContextLoss();canvas.remove();}};
}
