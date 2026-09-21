import * as T from './three.module.min.js';
import {GLTFLoader} from './GLTFLoader.js';

// Load the user's Blender export unchanged, including its mesh lettering and PBR materials.
export async function createMedalModel(root){
 const gltf=await new GLTFLoader().loadAsync(new URL('./assets/medal-blender-v37.glb',import.meta.url).href);
 const geometry=new Set(),materials=new Set(),textures=new Set(),bitmaps=new Set();
 gltf.scene.traverse(e=>{if(!e.isMesh)return;geometry.add(e.geometry);for(const material of Array.isArray(e.material)?e.material:[e.material]){materials.add(material);for(const value of Object.values(material))if(value?.isTexture){textures.add(value);if(value.source?.data?.close)bitmaps.add(value.source.data);}}});
 const releaseAsset=()=>{geometry.forEach(v=>v.dispose());materials.forEach(v=>v.dispose());textures.forEach(v=>v.dispose());bitmaps.forEach(v=>v.close());};
 if(!root.isConnected){releaseAsset();return null;}
 let renderer,env,observer,disposed=false;const studioResources=[];
 try{
  renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
  const canvas=renderer.domElement;canvas.className='medal-webgl';canvas.setAttribute('aria-hidden','true');const stage=root.querySelector('.medal-stage');
  const scene=new T.Scene(),model=new T.Group();scene.add(model);const camera=new T.PerspectiveCamera(32,1,.1,100);
  const box=new T.Box3().setFromObject(gltf.scene),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3()),scale=4.6/size.x;
  gltf.scene.position.copy(center).multiplyScalar(-scale);gltf.scene.scale.setScalar(scale);model.add(gltf.scene);size.multiplyScalar(scale);
  // Local studio illumination provides real moving reflections without any network HDR dependency.
  const studio=new T.Scene();studio.background=new T.Color(.018,.021,.028);
  for(const [w,h,x,y,z,power] of [[4,8,-5,3,6,2.1],[2,7,5,1,4,.9],[7,2,0,6,3,4],[4,6,0,0,-7,1.3],[2,7,-3,1,-5,1.8],[6,5,0,-2,8,.65]]){
   const geometry=new T.PlaneGeometry(w,h),material=new T.MeshBasicMaterial({color:new T.Color(power,power,power),side:T.DoubleSide});studioResources.push(geometry,material);const panel=new T.Mesh(geometry,material);panel.position.set(x,y,z);panel.lookAt(0,0,0);studio.add(panel);
  }
  const updateEnvironment=()=>{const pmrem=new T.PMREMGenerator(renderer);try{const next=pmrem.fromScene(studio,.04,.1,40);env?.dispose();env=next;scene.environment=env.texture;}finally{pmrem.dispose();}};updateEnvironment();
  const spotlight=new T.SpotLight(0xf1f4ff,125,30,.36,.72,2);spotlight.position.set(0,8,4);spotlight.target.position.set(0,-1,0);scene.add(spotlight,spotlight.target);
  scene.add(new T.HemisphereLight(0xe4edff,0x111319,.35));for(const [x,y,z,power] of [[-4,6,7,.8],[4,2,5,.35],[-3,4,-7,1.1],[0,-1,8,.4]]){const light=new T.DirectionalLight(0xffffff,power);light.position.set(x,y,z);scene.add(light);}
  let pitch=0,yaw=0;const render=()=>{if(disposed||renderer.getContext().isContextLost())return;model.rotation.set(-pitch*Math.PI/180,yaw*Math.PI/180,0,'YXZ');renderer.render(scene,camera);};
  const resize=()=>{if(disposed||!stage.clientWidth||!stage.clientHeight)return;renderer.setSize(stage.clientWidth,stage.clientHeight);camera.aspect=stage.clientWidth/stage.clientHeight;const tan=Math.tan(T.MathUtils.degToRad(camera.fov/2));camera.position.set(0,0,Math.max(size.y/(2*tan*.8),size.x/(2*tan*camera.aspect*.82))+size.z);camera.updateProjectionMatrix();render();};
  const lost=e=>{e.preventDefault();root.classList.remove('has-webgl-medal');root.dataset.medalRenderer='fallback';};const restored=()=>{if(disposed)return;root.classList.add('has-webgl-medal');root.dataset.medalRenderer='blender-glb';updateEnvironment();render();};
  canvas.addEventListener('webglcontextlost',lost);canvas.addEventListener('webglcontextrestored',restored);stage.append(canvas);observer=new ResizeObserver(resize);observer.observe(stage);resize();
  root.classList.add('has-webgl-medal');root.dataset.medalRenderer='blender-glb';root.medalAsset={file:'assets/medal-blender-v37.glb',spotlight:true,sourceMeshes:gltf.parser.json.meshes.length,meshes:0,triangles:0,materials:materials.size,dimensions:size.toArray()};gltf.scene.traverse(e=>{if(e.isMesh){root.medalAsset.meshes++;root.medalAsset.triangles+=(e.geometry.index?.count||e.geometry.attributes.position.count)/3;}});
  return {model,renderer,render(p,y){pitch=p;yaw=y;render();},dispose(){if(disposed)return;disposed=true;observer.disconnect();canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('webglcontextrestored',restored);releaseAsset();studioResources.forEach(v=>v.dispose());env.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();root.classList.remove('has-webgl-medal');delete root.medalAsset;}};
 }catch(error){disposed=true;observer?.disconnect();studioResources.forEach(v=>v.dispose());releaseAsset();env?.dispose();renderer?.dispose();renderer?.domElement.remove();throw error;}
}
