import * as T from './three.module.min.js';

// The supplied front is deliberately preserved, not approximated with invented metal shading.
// It is a baked photographic surface on an extruded silhouette; the back/edge are real geometry.
export async function createMedalModel(root){
 const image=new Image();image.src='./assets/medal-reference-v8.png';await image.decode();if(!root.isConnected)return null;
 const sample=document.createElement('canvas');sample.width=image.width;sample.height=image.height;const ctx=sample.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,sample.width,sample.height).data;
 const w=4.6,h=w*image.height/image.width,left=[],right=[];
 for(let y=0;y<image.height;y+=6){let a=-1,b=-1;for(let x=0;x<image.width;x++)if(pixels[(y*image.width+x)*4+3]>140){if(a<0)a=x;b=x;}if(a>=0){left.push(new T.Vector2((a/image.width-.5)*w,(.5-y/image.height)*h));right.push(new T.Vector2((b/image.width-.5)*w,(.5-y/image.height)*h));}}
 const shape=new T.Shape([...left,...right.reverse()]);sample.width=sample.height=0;
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.NoToneMapping;
 const canvas=renderer.domElement;canvas.className='medal-webgl';canvas.setAttribute('aria-hidden','true');const stage=root.querySelector('.medal-stage');stage.append(canvas);
 const scene=new T.Scene(),model=new T.Group();scene.add(model);const camera=new T.PerspectiveCamera(33,1,.1,50);camera.position.set(0,0,11.8);
 const resources=[],keep=r=>(resources.push(r),r);const texture=keep(new T.Texture(image));texture.colorSpace=T.SRGBColorSpace;texture.needsUpdate=true;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const body=new T.Mesh(keep(new T.ExtrudeGeometry(shape,{depth:.18,bevelEnabled:true,bevelThickness:.025,bevelSize:.009,bevelSegments:3,steps:1,curveSegments:6})),keep(new T.MeshStandardMaterial({color:0xb4b5b0,metalness:.9,roughness:.28})));body.position.z=-.12;model.add(body);
 const face=new T.Mesh(keep(new T.PlaneGeometry(w,h)),keep(new T.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.025,side:T.FrontSide,depthWrite:true,toneMapped:false})));face.position.z=.095;model.add(face);
 const back=new T.Group();back.rotation.y=Math.PI;back.position.z=-.151;model.add(back);
 const enamel=new T.Mesh(keep(new T.ShapeGeometry(shape)),keep(new T.MeshStandardMaterial({color:0x075d4c,metalness:.35,roughness:.4})));enamel.scale.set(.94,.94,1);back.add(enamel);
 const labels=document.createElement('canvas');labels.width=1024;labels.height=1024;const text=labels.getContext('2d');text.textAlign='center';text.fillStyle='#e6e6d8';text.font='32px sans-serif';text.fillText('个人生涯跑步里程',512,235);text.font='bold 110px Georgia';text.fillText('1000 KM',512,385);text.font='28px sans-serif';text.fillText('第一条记录',512,500);text.font='40px Georgia';text.fillText('2021.02.02',512,564);text.font='28px sans-serif';text.fillText('达成日期',512,678);text.font='40px Georgia';text.fillText('2025.12.18',512,744);
 const labelTexture=keep(new T.CanvasTexture(labels));labelTexture.colorSpace=T.SRGBColorSpace;const marking=new T.Mesh(keep(new T.PlaneGeometry(w*.8,h*.8)),keep(new T.MeshBasicMaterial({map:labelTexture,transparent:true,depthWrite:false})));marking.position.z=.015;back.add(marking);
 scene.add(new T.HemisphereLight(0xffffff,0x393f42,2));for(const [x,y,z,p]of[[-5,5,7,3],[5,0,-6,2],[1,-5,5,1]]){const light=new T.DirectionalLight(0xffffff,p);light.position.set(x,y,z);scene.add(light);}
 let pitch=0,yaw=0,disposed=false;const render=()=>{if(disposed)return;model.rotation.set(-pitch*Math.PI/180,yaw*Math.PI/180,0,'YXZ');renderer.render(scene,camera);};
 const resize=()=>{renderer.setSize(stage.clientWidth,stage.clientHeight);camera.aspect=stage.clientWidth/stage.clientHeight;camera.position.z=Math.max(11.8,w/(Math.tan(33*Math.PI/360)*camera.aspect*1.65));camera.updateProjectionMatrix();render();};const observer=new ResizeObserver(resize);observer.observe(stage);resize();root.classList.add('has-webgl-medal');root.dataset.medalRenderer='reference-relief';
 const lost=e=>{e.preventDefault();root.classList.remove('has-webgl-medal');root.dataset.medalRenderer='fallback';};const restored=()=>{root.classList.add('has-webgl-medal');root.dataset.medalRenderer='reference-relief';render();};canvas.addEventListener('webglcontextlost',lost);canvas.addEventListener('webglcontextrestored',restored);
 return {model,renderer,render(p,y){pitch=p;yaw=y;render();},dispose(){disposed=true;observer.disconnect();canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('webglcontextrestored',restored);resources.forEach(r=>r.dispose());renderer.dispose();renderer.forceContextLoss();canvas.remove();root.classList.remove('has-webgl-medal');}};
}
