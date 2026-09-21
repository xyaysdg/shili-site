import * as T from './three.module.min.js';

// Reference-aligned relief: separate physical materials share photographic detail UVs.
// The reference contains baked lighting; it is retained as detail, not claimed to be a recovered albedo.
export async function createMedalModel(root){
 const image=new Image();image.src='./assets/medal-reference-v8.png';await image.decode();if(!root.isConnected)return null;
 const sample=document.createElement('canvas');sample.width=image.width;sample.height=image.height;const ctx=sample.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,sample.width,sample.height).data;
 const w=4.6,h=w*image.height/image.width,left=[],right=[],resources=[],keep=r=>(resources.push(r),r);
 const pixel=(u,v)=>{const x=Math.max(0,Math.min(image.width-1,Math.round(u*(image.width-1)))),y=Math.max(0,Math.min(image.height-1,Math.round(v*(image.height-1)))),i=(y*image.width+x)*4;return [pixels[i]/255,pixels[i+1]/255,pixels[i+2]/255,pixels[i+3]/255];};
 const classify=(p,u,v)=>{const [r,g,b,a]=p,max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,s=max?d/max:0;let hue=0;if(d)hue=(max===r?(g-b)/d+(g<b?6:0):max===g?(b-r)/d+2:(r-g)/d+4)*60;
  if(a<.2)return -1;
  if(hue>250&&hue<330&&s>.3)return 5;
  if(hue<36&&s>.45&&r>g*1.25)return 4;
  if(hue>=30&&hue<75&&s>.28)return 3;
  if(hue>=80&&hue<205&&s>.12){if(max>.57&&s<.49)return 1;return 2;}
  if(max<.16&&u>.19&&u<.82&&v>.17&&v<.8)return 2;
  return 0;
 };
 const level=(kind,u,v)=>{if(kind<0)return .005;if(kind===2)return .045;if(kind===1)return .145;if(kind===3)return .235;if(kind===4)return .30;if(kind===5)return .43;if(u>.25&&u<.8&&v>.22&&v<.52)return .35;if(u>.39&&u<.61&&v<.15)return .36;if(u>.16&&u<.86&&v>.52&&v<.79)return .3;return .205;};
 for(let y=0;y<image.height;y+=6){let a=-1,b=-1;for(let x=0;x<image.width;x++)if(pixels[(y*image.width+x)*4+3]>140){if(a<0)a=x;b=x;}if(a>=0){left.push(new T.Vector2((a/image.width-.5)*w,(.5-y/image.height)*h));right.push(new T.Vector2((b/image.width-.5)*w,(.5-y/image.height)*h));}}
 const shape=new T.Shape([...left,...right.reverse()]);
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 const canvas=renderer.domElement;canvas.className='medal-webgl';canvas.setAttribute('aria-hidden','true');const stage=root.querySelector('.medal-stage');stage.append(canvas);
 const scene=new T.Scene(),model=new T.Group();scene.add(model);const camera=new T.PerspectiveCamera(33,1,.1,50);camera.position.set(0,0,11.8);
 const texture=keep(new T.Texture(image));texture.colorSpace=T.SRGBColorSpace;texture.needsUpdate=true;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const studio=new T.Scene();studio.background=new T.Color(0x87939a);
 for(const [pw,ph,x,y,z,p]of[[3,8,-4,3,6,2.8],[1,8,5,0,5,3],[8,2,0,5,5,2.5],[5,8,0,0,8,1.1],[1,9,-2,0,7,.04]]){const panel=new T.Mesh(keep(new T.PlaneGeometry(pw,ph)),keep(new T.MeshBasicMaterial({color:new T.Color(p,p,p),side:T.DoubleSide})));panel.position.set(x,y,z);panel.lookAt(0,0,0);studio.add(panel);}
 const pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromScene(studio,.03,.1,30);scene.environment=env.texture;pmrem.dispose();
 const grainCanvas=document.createElement('canvas');grainCanvas.width=grainCanvas.height=128;const gc=grainCanvas.getContext('2d'),noise=gc.createImageData(128,128);let seed=842;for(let i=0;i<noise.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const v=90+(seed>>>25);noise.data[i]=noise.data[i+1]=noise.data[i+2]=v;noise.data[i+3]=255;}gc.putImageData(noise,0,0);const grain=keep(new T.CanvasTexture(grainCanvas));grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(10,10);
 const materials=[
  keep(new T.MeshPhysicalMaterial({name:'silver-metal',map:texture,metalness:1,roughness:.23,envMapIntensity:1.05,clearcoat:.2,alphaTest:.1})),
  keep(new T.MeshPhysicalMaterial({name:'mint-glass',map:texture,color:0xd9ffe7,metalness:0,roughness:.085,transmission:.65,thickness:.2,ior:1.46,attenuationColor:0x91e4b9,attenuationDistance:1.2,envMapIntensity:1.3,clearcoat:1,transparent:true,alphaTest:.1})),
  keep(new T.MeshStandardMaterial({name:'emerald-frosted',map:texture,metalness:0,roughness:.96,envMapIntensity:.18,bumpMap:grain,bumpScale:.019,alphaTest:.1})),
  keep(new T.MeshStandardMaterial({name:'gold-bezel',map:texture,metalness:.94,roughness:.22,envMapIntensity:1,alphaTest:.1})),
  keep(new T.MeshPhysicalMaterial({name:'copper-tracks',map:texture,metalness:.82,roughness:.25,clearcoat:.5,alphaTest:.1})),
  keep(new T.MeshPhysicalMaterial({name:'purple-emblem',map:texture,metalness:.6,roughness:.17,clearcoat:1,alphaTest:.1}))
 ];
 const nx=300,ny=Math.round(nx*image.height/image.width),stride=nx+1,count=stride*(ny+1),positions=new Float32Array(count*3),uvs=new Float32Array(count*2),heights=new Float32Array(count),kinds=new Int8Array(count),alphas=new Float32Array(count),indices=Array.from({length:6},()=>[]),all=[];
 for(let y=0;y<=ny;y++)for(let x=0;x<=nx;x++){const u=x/nx,v=y/ny,i=y*stride+x,p=pixel(u,v),kind=classify(p,u,v);kinds[i]=kind;alphas[i]=p[3];heights[i]=level(kind,u,v);uvs[i*2]=u;uvs[i*2+1]=1-v;positions[i*3]=(u-.5)*w;positions[i*3+1]=(.5-v)*h;}
 // Denoise material islands and round relief shoulders; texture grain must not become torn geometry.
 const sourceKinds=kinds.slice();for(let y=1;y<ny;y++)for(let x=1;x<nx;x++){const i=y*stride+x;if(sourceKinds[i]<0)continue;const votes=[0,0,0,0,0,0];votes[sourceKinds[i]]=3;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const k=sourceKinds[(y+dy)*stride+x+dx];if(k>=0)votes[k]++;}kinds[i]=votes.indexOf(Math.max(...votes));heights[i]=level(kinds[i],x/nx,y/ny);}
 for(let pass=0;pass<4;pass++){const source=heights.slice();for(let y=1;y<ny;y++)for(let x=1;x<nx;x++){const i=y*stride+x;heights[i]=(source[i]*4+source[i-1]+source[i+1]+source[i-stride]+source[i+stride])/8;}}
 for(let i=0;i<count;i++)positions[i*3+2]=heights[i];
 const tri=(a,b,c)=>{if(Math.min(alphas[a],alphas[b],alphas[c])<.15)return;const k=kinds[a]===kinds[b]||kinds[a]===kinds[c]?kinds[a]:kinds[b];if(k<0)return;indices[k].push(a,b,c);all.push(a,b,c);};
 for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){const a=y*stride+x;tri(a,a+stride,a+1);tri(a+1,a+stride,a+stride+1);}
 const base=keep(new T.BufferGeometry());base.setAttribute('position',new T.BufferAttribute(positions,3));base.setAttribute('uv',new T.BufferAttribute(uvs,2));base.setIndex(all);base.computeVertexNormals();
 materials.forEach((material,i)=>{const geometry=keep(new T.BufferGeometry());for(const key of ['position','uv','normal'])geometry.setAttribute(key,base.getAttribute(key));geometry.setIndex(indices[i]);const mesh=new T.Mesh(geometry,material);mesh.name=material.name;model.add(mesh);});
 root.medalLayers=materials.map((m,i)=>({name:m.name,metalness:m.metalness,roughness:m.roughness,transmission:m.transmission||0,triangles:indices[i].length/3}));
 const body=new T.Mesh(keep(new T.ExtrudeGeometry(shape,{depth:.13,bevelEnabled:true,bevelThickness:.018,bevelSize:.008,bevelSegments:3,steps:1})),keep(new T.MeshStandardMaterial({color:0xb4b5b0,metalness:1,roughness:.3})));body.position.z=-.15;model.add(body);
 const back=new T.Group();back.rotation.y=Math.PI;back.position.z=-.18;model.add(back);const enamel=new T.Mesh(keep(new T.ShapeGeometry(shape)),keep(new T.MeshStandardMaterial({color:0x075d4c,metalness:.1,roughness:.9,bumpMap:grain,bumpScale:.015})));enamel.scale.set(.94,.94,1);back.add(enamel);
 const labels=document.createElement('canvas');labels.width=labels.height=1024;const text=labels.getContext('2d');text.textAlign='center';text.fillStyle='#e6e6d8';for(const [value,font,y]of[['个人生涯跑步里程','32px sans-serif',235],['1000 KM','bold 110px Georgia',385],['第一条记录','28px sans-serif',500],['2021.02.02','40px Georgia',564],['达成日期','28px sans-serif',678],['2025.12.18','40px Georgia',744]]){text.font=font;text.fillText(value,512,y);}const labelTexture=keep(new T.CanvasTexture(labels));labelTexture.colorSpace=T.SRGBColorSpace;const marking=new T.Mesh(keep(new T.PlaneGeometry(w*.8,h*.8)),keep(new T.MeshBasicMaterial({map:labelTexture,transparent:true,depthWrite:false})));marking.position.z=.015;back.add(marking);
 scene.add(new T.HemisphereLight(0xffffff,0x4c5553,1.1));for(const [x,y,z,p]of[[-5,5,7,2],[5,0,-6,1.5],[1,-5,5,.7]]){const light=new T.DirectionalLight(0xffffff,p);light.position.set(x,y,z);scene.add(light);}
 sample.width=sample.height=0;let pitch=0,yaw=0,disposed=false;const render=()=>{if(disposed)return;model.rotation.set(-pitch*Math.PI/180,yaw*Math.PI/180,0,'YXZ');renderer.render(scene,camera);};
 const resize=()=>{renderer.setSize(stage.clientWidth,stage.clientHeight);camera.aspect=stage.clientWidth/stage.clientHeight;camera.position.z=Math.max(11.8,w/(Math.tan(33*Math.PI/360)*camera.aspect*1.65));camera.updateProjectionMatrix();render();};const observer=new ResizeObserver(resize);observer.observe(stage);resize();root.classList.add('has-webgl-medal');root.dataset.medalRenderer='layered-materials';
 const lost=e=>{e.preventDefault();root.classList.remove('has-webgl-medal');root.dataset.medalRenderer='fallback';};const restored=()=>{root.classList.add('has-webgl-medal');root.dataset.medalRenderer='layered-materials';render();};canvas.addEventListener('webglcontextlost',lost);canvas.addEventListener('webglcontextrestored',restored);
 return {model,renderer,render(p,y){pitch=p;yaw=y;render();},dispose(){disposed=true;observer.disconnect();canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('webglcontextrestored',restored);resources.forEach(r=>r.dispose());env.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();root.classList.remove('has-webgl-medal');delete root.medalLayers;}};
}
