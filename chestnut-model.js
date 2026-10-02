import * as T from './three.module.min.js';
import {GLTFLoader} from './GLTFLoader.js';
// Keep the author's materials and lighting; the gravity renderer owns the GPU.
export async function loadChestnutModel(host){
 const gltf=await new GLTFLoader().loadAsync('./assets/chestnut-v39.glb');
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(32,1,.1,30),pivot=new T.Group();
 scene.add(pivot);camera.position.set(0,.15,4.4);camera.lookAt(0,0,0);
 const box=new T.Box3().setFromObject(gltf.scene),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3()),scale=2.05/Math.max(size.x,size.y,size.z);
 gltf.scene.scale.setScalar(scale);gltf.scene.position.copy(center).multiplyScalar(-scale);pivot.add(gltf.scene);pivot.rotation.z=-.22;
 scene.add(new T.HemisphereLight(0xe9ddc4,0x100d08,.55));
 const light=new T.DirectionalLight(0xffe8bd,1.35);light.position.set(-2,4,3);scene.add(light);
 const rim=new T.DirectionalLight(0xffe6b0,3.3);rim.position.set(-2,3,-2);scene.add(rim);
 const bounce=new T.DirectionalLight(0xb58c55,.4);bounce.position.set(2,-2,1);scene.add(bounce);
 gltf.scene.traverse(o=>{if(o.isMesh){o.material.roughness=T.MathUtils.clamp(o.material.roughness,.4,.8);o.material.metalness=Math.min(.18,o.material.metalness);}});
 let renderer,target,previousSize=0,angle=.3,disposed=false,lastPose='';
 return {
  size:1,opacity:0,rise:0,revision:0,
  attach(sharedRenderer,K){renderer=sharedRenderer;target=new K.Target(1,1,{samples:4,depthBuffer:true,resolveDepthBuffer:false,resolveStencilBuffer:false});target.texture.generateMipmaps=false;this.texture=target.texture;host.dataset.modelRenderer='shared-context';},
  draw({time,paused,handle,delta,clickAge=100,clickPointer=[0,0],holeScreen=[0,0],aspect=1,entrance=20,reduced=false,diskLight=[-.5,1]}){
   if(disposed||!renderer||!handle)return;
   const size=parseFloat(handle.style.width)*.92;if(size<1)return;
   if(Math.abs(size-previousSize)>2){const pixels=Math.max(1,Math.round(size*Math.min(Math.max(devicePixelRatio||1,1.5),2)));target.setSize(pixels,pixels);previousSize=size;lastPose='';}
   if(!paused)angle-=Math.min(delta,.1)*.075;
   pivot.rotation.y=angle;pivot.rotation.x=.12+Math.sin(time*.24)*.065;
   const distance=Math.hypot((holeScreen[0]-clickPointer[0])*aspect,holeScreen[1]-clickPointer[1]);
   const wave=Math.exp(-Math.pow((distance-clickAge*1.15)*4,2))*Math.exp(-clickAge*.8);
   const length=Math.max(.1,Math.hypot(...diskLight)),lx=diskLight[0]/length,ly=diskLight[1]/length;
   rim.position.set(lx*3,ly*3,-1.4);light.position.set(lx*2,ly*3,3);light.intensity=1.35+wave*2.4;rim.intensity=3.3+wave*3;pivot.scale.setScalar(1+wave*.055);
   const arrive=reduced?1:T.MathUtils.smoothstep(entrance,1.3,3.7);
   this.opacity=arrive;this.rise=(1-arrive)*56;this.size=size;
   const pose=[size,angle,pivot.rotation.x,wave,lx,ly].join();
   if((arrive>0&&pose!==lastPose)||this.revision===0){
    const previous=renderer.getRenderTarget(),alpha=renderer.getClearAlpha();
    try{renderer.setClearAlpha(0);renderer.setRenderTarget(target);renderer.render(scene,camera);lastPose=pose;this.revision++;}
    finally{renderer.setRenderTarget(previous);renderer.setClearAlpha(alpha);}
   }
   host.dataset.modelRise=this.rise.toFixed(2);host.dataset.modelOpacity=arrive.toFixed(3);
   host.dataset.modelPulse=wave.toFixed(4);host.dataset.modelPulsePeak=Math.max(+(host.dataset.modelPulsePeak||0),wave).toFixed(4);
   host.dataset.modelLight=lx.toFixed(3)+','+ly.toFixed(3);host.dataset.modelRotation=angle.toFixed(4);
  },
  destroy(){if(disposed)return;disposed=true;const resources=new Set();gltf.scene.traverse(o=>{if(o.geometry)resources.add(o.geometry);if(o.material)for(const m of(Array.isArray(o.material)?o.material:[o.material])){resources.add(m);for(const t of Object.values(m))if(t?.isTexture)resources.add(t);}});resources.forEach(o=>o.dispose());target?.dispose();renderer=null;}
 };
}
