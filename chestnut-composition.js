// Shared final composition: the model is linear light, underneath disk ink.
export const coreSampling = `
uniform sampler2D uCoreTexture;
uniform vec2 uCoreCenter,uCoreHalfSize;
uniform float uCoreOpacity;
vec4 coreAt(vec2 screen){
 vec2 uv=(screen-uCoreCenter)/(2.*max(uCoreHalfSize,vec2(.0001)))+.5;
 float inside=step(0.,uv.x)*step(uv.x,1.)*step(0.,uv.y)*step(uv.y,1.);
 vec4 core=texture2D(uCoreTexture,clamp(uv,0.,1.));
 core.a*=inside*uCoreOpacity;
 return core;
}`;

export function createChestnutComposition(K,model,renderer){
 model.attach(renderer,K);
 const texture=model.texture;
 const uniforms={uCoreTexture:{value:texture},uCoreCenter:{value:new K.Vec2},uCoreHalfSize:{value:new K.Vec2(1,1)},uCoreOpacity:{value:0}};
 const revealUniforms={...uniforms,tDiffuse:{value:null},uReveal:{value:0},uAspect:{value:1}};
 const material=new K.Material({uniforms:revealUniforms,depthTest:false,depthWrite:false,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`varying vec2 vUv;uniform sampler2D tDiffuse;uniform float uReveal,uAspect;${coreSampling}
   void main(){vec2 screen=vUv*2.-1.;vec4 core=coreAt(screen);
    float radius=length((screen-uCoreCenter)*vec2(uAspect,1.));
    float spread=(1.-smoothstep(uReveal*5.,uReveal*5.+.35,radius))*uReveal;
    if(uReveal>=.999)spread=1.;
    gl_FragColor=vec4(mix(core.rgb*core.a,texture2D(tDiffuse,vUv).rgb,spread),1.);
   }`});
 const geometry=new K.Plane(2,2),scene=new K.Scene(),camera=new K.Camera();scene.add(new K.Mesh(geometry,material));
 return {uniforms,pass:{enabled:true,needsSwap:true,clear:false,renderToScreen:false,setSize(){},
  render(renderer,write,read){revealUniforms.tDiffuse.value=read.texture;renderer.setRenderTarget(this.renderToScreen?null:write);renderer.render(scene,camera);},
  dispose(){geometry.dispose();material.dispose();}},
  update(state,host,reveal){
   // After entrance, bypass the full-frame reveal pass entirely.
   this.pass.enabled=reveal<1;
   uniforms.uCoreCenter.value.set(state.holeScreen[0],state.holeScreen[1]-2*model.rise/host.clientHeight);
   uniforms.uCoreHalfSize.value.set(model.size/host.clientWidth,model.size/host.clientHeight);
   uniforms.uCoreOpacity.value=model.opacity;
   revealUniforms.uReveal.value=reveal;revealUniforms.uAspect.value=state.aspect;
  }};
}

// Only the far sheet's position differs. Geometry, arc-length UVs, motion,
// lighting and interaction are all constructed by the normal ribbon factory.
export function createDistantRibbonPath(K,diskRotation,inverseDiskRotation,target){
 const camera=new K.Camera(46,1.8,.08,220);
 camera.position.set(-11.1400,2.7862,14.9334);
 camera.lookAt(new K.Vec3(...target).applyQuaternion(diskRotation));camera.updateMatrixWorld();
 const tangent=Math.tan(46*Math.PI/360),point=new K.Vec3();
 return (_index,u,v)=>{
  const x=(u*2.-1.)*1.12;
  const top=.15+.60*(u-.5)**2+.025*Math.sin(u*10.);
  const bottom=.255+.395*(1.-u)**3+.08*u**6;
  const y=bottom+(top-bottom)*v;
  // Place the full surface beyond the central disk; depth also changes across
  // the sheet so folds and lettering retain genuine perspective.
  const depth=62+8*Math.cos(u*Math.PI*1.4)+5*Math.sin(v*Math.PI);
  point.set(x*depth*tangent*1.8,(1-2*y)*depth*tangent,-depth);
  return point.applyMatrix4(camera.matrixWorld).applyQuaternion(inverseDiskRotation).toArray();
 };
}

// A depth-tested coverage buffer subtracts ONLY the hidden model contribution.
// Alpha blending the sheet over the final scene would incorrectly erase the
// luminous accretion disk, leaving a dark triangle inside the foreground band.
export function createRibbonOcclusion(K,sourceGroup,sphere,sheets,vertexShader){
 const target=new K.Target(1,1,{samples:4,depthBuffer:true,resolveDepthBuffer:false,resolveStencilBuffer:false});
 const scene=new K.Scene(),group=new K.Group();group.quaternion.copy(sourceGroup.quaternion);scene.add(group);
 const depth=sphere.clone();group.add(depth);
 const materials=[],pairs=[];
 for(const sheet of sheets){const material=new K.Material({uniforms:sheet.material.uniforms,vertexShader,
  fragmentShader:'uniform float uVisibility;void main(){float cover=.94*smoothstep(.03,.24,uVisibility);gl_FragColor=vec4(vec3(cover),1.);}',
  transparent:true,depthTest:true,depthWrite:false,side:2,forceSinglePass:true,blending:5,blendEquation:104,blendSrc:201,blendDst:201});
  materials.push(material);const mesh=new K.Mesh(sheet.geometry,material);mesh.frustumCulled=false;group.add(mesh);pairs.push([mesh,sheet]);
 }
 return {texture:target.texture,render(renderer,camera,host,coreUniforms){
  for(const [mesh,sheet] of pairs)mesh.visible=sheet.visible;
  const ratio=Math.min(1,1024/Math.max(host.clientWidth,host.clientHeight));target.setSize(Math.max(1,Math.round(host.clientWidth*ratio)),Math.max(1,Math.round(host.clientHeight*ratio)));
  // The mask contributes only inside the model rectangle. Keep the original
  // full-size viewport/texture so projection and sample coordinates do not change.
  // A two-texel guard preserves bilinear filtering and multisample edge coverage.
  const center=coreUniforms?.uCoreCenter.value,half=coreUniforms?.uCoreHalfSize.value;
  if(center&&half){
   const clamp=(v,max)=>Math.max(0,Math.min(max,v));
   const left=clamp(Math.floor((center.x-half.x+1)*.5*target.width)-2,target.width);
   const bottom=clamp(Math.floor((center.y-half.y+1)*.5*target.height)-2,target.height);
   const right=clamp(Math.ceil((center.x+half.x+1)*.5*target.width)+2,target.width);
   const top=clamp(Math.ceil((center.y+half.y+1)*.5*target.height)+2,target.height);
   target.scissor.set(left,bottom,right-left,top-bottom);target.scissorTest=true;
  }else target.scissorTest=false;
  depth.position.copy(sphere.position);const previous=renderer.getRenderTarget();
  try{renderer.setRenderTarget(target);renderer.render(scene,camera);}
  finally{renderer.setRenderTarget(previous);}
 },dispose(){target.dispose();materials.forEach(m=>m.dispose());}};
}

// Cache only rays with zero/one disk crossing. Multi-crossing rays retain the
// original integrator, including all photon-ring detail and capture behavior.
export function createRayPathCache(K,renderer,mesh,allowed){
 const uniforms=mesh.material.uniforms;
 uniforms.uRayPath={value:null};uniforms.uRayPathEnabled={value:0};
 uniforms.uRayOrigin={value:new K.Vec2(0,0)};uniforms.uRaySpan={value:new K.Vec2(1,1)};
 const noop={update(){},dispose(){}};
 if(!allowed||!renderer.getContext().getExtension('EXT_color_buffer_float'))return noop;
 const source=mesh.material.fragmentShader;
 const begin=source.indexOf(' for(int i=0;i<TRACE_STEPS;i++){');
 const finish=source.indexOf('\n light+=bodyLight',begin);
 const loop=source.slice(begin,finish),crossStart=loop.indexOf('   if(p.y*next.y<0.){');
 const crossEnd=loop.indexOf('\n   p=next;',crossStart);
 if(begin<0||finish<0||crossStart<0||crossEnd<0)return noop;
 const crossing=loop.slice(crossStart,crossEnd);
 const shade=crossing.slice(crossing.indexOf('\n')+1,crossing.lastIndexOf('}'))
  .replace('vec3 crossing=mix(p,next,p.y/(p.y-next.y));','vec3 crossing=path.xyz;')
  // Cached crossings outside the luminous annulus or behind the body add no light.
  // Keep transmission and opacity math, but skip their unused atlas samples.
  .replace('vec3 e=emission(crossing)*inFront*mix(.3,1.,max(upperImage,nearImage));',
    'vec3 e=vec3(0.);if(inFront>0.&&diskRadius>1.28&&diskRadius<14.)e=emission(crossing)*inFront*mix(.3,1.,max(upperImage,nearImage));');
 const cachedLoop=loop.slice(0,crossStart)+`   if(p.y*next.y<0.){
     crossings+=1.;
     if(crossings>1.)break;
     firstCrossing=mix(p,next,p.y/(p.y-next.y));
   }`+loop.slice(crossEnd);
 const cacheShader=source.slice(0,begin)+'\n float crossings=0.;vec3 firstCrossing=vec3(0.);\n'+cachedLoop+
  '\n gl_FragColor=vec4(firstCrossing,captured+2.*crossings);\n}';
 mesh.material.fragmentShader='uniform sampler2D uRayPath;uniform float uRayPathEnabled;uniform vec2 uRayOrigin,uRaySpan;\n'+source.slice(0,begin)+`
 vec2 rayUv=(vScreen*.5+.5-uRayOrigin)/uRaySpan;
 bool cached=uRayPathEnabled>.5&&all(greaterThanEqual(rayUv,vec2(0.)))&&all(lessThan(rayUv,vec2(1.)));
 vec4 path=cached?texture2D(uRayPath,rayUv):vec4(0.,0.,0.,4.);
 if(path.a<4.){
   captured=mod(path.a,2.);
   if(path.a>=2.){${shade}}
 }else{${loop}}
`+source.slice(finish);
 mesh.material.needsUpdate=true;
 const target=new K.Target(1,1,{type:1015,minFilter:1003,magFilter:1003,depthBuffer:false,stencilBuffer:false});
 target.texture.generateMipmaps=false;uniforms.uRayPath.value=target.texture;
 const material=new K.Material({vertexShader:mesh.material.vertexShader,fragmentShader:cacheShader,defines:{...mesh.material.defines},uniforms,depthTest:false,depthWrite:false});
 const geometry=new K.Plane(2,2),scene=new K.Scene(),camera=new K.Camera();scene.add(new K.Mesh(geometry,material));
 let lastKey='',validKey='',stable=0,builds=0;
 return {update(host,active){
   const width=renderer.domElement.width,height=renderer.domElement.height;
   const key=[width,height,...uniforms.uEye.value.toArray(),...uniforms.uRight.value.toArray(),...uniforms.uUp.value.toArray(),...uniforms.uForward.value.toArray(),uniforms.uAspect.value,uniforms.uTanFov.value,...uniforms.uVisibleY.value.toArray()].join(',');
   uniforms.uRayPathEnabled.value=0;
   if(host.clientWidth<700){target.setSize(1,1);validKey='';stable=0;lastKey='';return;}
   if(!active){stable=0;lastKey='';return;}
   if(lastKey!==key){lastKey=key;stable=0;}else stable++;
   if(stable<2)return;
   if(validKey!==key){
     // Keep full-resolution pixels and projection, but budget only a vertical
     // region centred on the visible viewport. Rays outside it use the original
     // integrator; a large screen must not disable the whole cache.
     const cacheHeight=Math.max(1,Math.min(height,Math.floor(4200000/width)));
     const clampY=y=>Math.max(0,Math.min(height,y));
     const visible=uniforms.uVisibleY.value;
     const center=(clampY((visible.x+1)*.5*height)+clampY((visible.y+1)*.5*height))*.5;
     const bottom=Math.max(0,Math.min(height-cacheHeight,Math.floor(center-cacheHeight*.5)));
     target.setSize(width,cacheHeight);target.viewport.set(0,-bottom,width,height);
     uniforms.uRayOrigin.value.set(0,bottom/height);uniforms.uRaySpan.value.set(1,cacheHeight/height);
     host.dataset.rayCachePixels=String(width*cacheHeight);
     const previous=renderer.getRenderTarget();
     try{renderer.setRenderTarget(target);renderer.render(scene,camera);validKey=key;builds++;}
     finally{renderer.setRenderTarget(previous);}
   }
   uniforms.uRayPathEnabled.value=1;
   if(host.dataset.rayCacheBuilds!==String(builds))host.dataset.rayCacheBuilds=String(builds);
 },dispose(){target.dispose();geometry.dispose();material.dispose();}};
}
