import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {holoThemes,holoBackgrounds,holoForegrounds,listeningLenses,damping} from './holoArt.js';
import {holoVertex,holoFragment} from './holoShaders.js';
import {cardPrintFor,cardTreatment} from './fieldPresentation.js';

function textTexture(draw,w=1000,h=1500){
 const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');draw(ctx,w,h);
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}
function wrap(ctx,text,x,y,maxWidth,lineHeight,maxLines=20){
 let line='',lines=0;for(const char of [...text]){if(ctx.measureText(line+char).width>maxWidth&&line&&!/[，。！？；：、）》”’.,!?;:]/u.test(char)){ctx.fillText(line,x,y);line=char;y+=lineHeight;if(++lines>=maxLines)return y;}else line+=char;}
 if(line)ctx.fillText(line,x,y);return y+lineHeight;
}
function backPrint(card,theme,foreground,region,paper){
 return textTexture((g,w,h)=>{
  const treatment=cardPrintFor(card.type),dark=card.type==='album';
  g.fillStyle=dark?'#131c1e':card.type==='artist'?'#eee2c8':'#dce8ec';g.fillRect(0,0,w,h);
  // Contain the original 3:4 print without stretching it into the 2:3 stock.
  g.drawImage(paper.image,treatment.cell*768,0,768,1024,0,83,w,1334);
  if(card.type==='artist'){g.globalAlpha=.09;g.drawImage(foreground.image,theme.cell*768,0,768,1024,640,560,220,293);g.globalAlpha=1;}
  g.fillStyle=treatment.muted;g.font='25px SonoraUI, sans-serif';g.fillText('SONORA / '+treatment.en,115,205);
  g.fillStyle=treatment.ink;g.font='58px Georgia, "Microsoft YaHei", serif';
  let y=wrap(g,card.title,115,300,w-230,66,3)+15;
  g.fillStyle=treatment.muted;g.font='28px SonoraUI, sans-serif';y=wrap(g,card.subtitle,115,y,w-230,38,2)+36;
  g.fillStyle=treatment.ink;g.font='500 35px SonoraUI, sans-serif';wrap(g,card.body,115,y,w-230,55,5);
  g.fillStyle=treatment.muted;g.font='25px SonoraUI, sans-serif';g.fillText('LISTENING LENS / 聆听透镜',115,925);
  g.fillStyle=treatment.ink;g.font='500 31px SonoraUI, sans-serif';wrap(g,listeningLenses[region],115,985,w-230,46,3);
  g.fillStyle=dark?'#172025e8':'#f3ebd8e8';g.fillRect(90,1385,w-180,53);g.fillStyle=treatment.muted;g.font='24px SonoraUI, sans-serif';g.fillText(card.album+' / 知识索引 · 非装备奖励',115,1420);
 });
}
function frontPrint(card,theme,number,region){
 return textTexture((g,w,h)=>{
  const t=cardTreatment(card.type);g.fillStyle=card.type==='album'?'#0c171ef5':card.type==='artist'?'#f4e9d6f5':'#dfebf0f5';g.fillRect(0,0,w,h);g.fillStyle=t.muted;g.font='29px SonoraUI, sans-serif';g.fillText(card.label+' / '+String(region+1).padStart(2,'0')+'-'+String(number).padStart(2,'0'),35,46);
  g.fillStyle=t.ink;let titleSize=68;g.font=titleSize+'px Georgia, "Microsoft YaHei", serif';
  while(g.measureText(card.title).width>(w-70)*1.95&&titleSize>36){titleSize-=2;g.font=titleSize+'px Georgia, "Microsoft YaHei", serif';}
  const y=wrap(g,card.title,35,128,w-70,titleSize*1.12,2);
  g.fillStyle=t.muted;g.font='28px SonoraUI, sans-serif';wrap(g,card.subtitle,35,Math.min(y+17,300),w-70,35,2);
  g.strokeStyle=theme.ink;g.globalAlpha=.45;g.beginPath();g.moveTo(35,340);g.lineTo(w-35,340);g.stroke();
  for(let i=0;i<54;i++){const x=35+i*11;g.fillRect(x,363+(i%3)*4,2,10+(i%5)*3);}g.globalAlpha=1;
  g.fillStyle=t.muted;g.font='23px SonoraUI, sans-serif';g.fillText('声音索引 · 可翻阅 / 不发放奖励',665,382);
  g.fillStyle=t.muted;g.font='24px SonoraUI, sans-serif';g.fillText(t.en,35,h-29);
 },1100,460);
}
function topPrint(theme,card){
 return textTexture((g,w)=>{const t=cardTreatment(card.type);g.fillStyle=card.type==='album'?'#0c171ef5':card.type==='artist'?'#f4e9d6f5':'#dfebf0f5';g.fillRect(0,0,w,120);g.fillStyle=t.muted;g.font='33px SonoraUI, sans-serif';g.fillText('SONORA / '+t.en,30,50);g.font='26px SonoraUI, sans-serif';g.fillText(theme.motif,30,91);},1200,120);
}
function paperPrint(image,cell){return textTexture((g,w,h)=>g.drawImage(image,cell*768,0,768,1024,0,0,w,h),900,1200);}
function conceptPrint(card,region){return textTexture((g,w)=>{g.fillStyle='#416176';g.font='28px SonoraUI, sans-serif';g.fillText('01 / OBSERVE · 听觉观察',65,100);g.fillStyle='#233b50';g.font='500 43px SonoraUI, sans-serif';wrap(g,card.body,65,190,w-130,68,5);g.fillStyle='#627c8b';g.font='29px SonoraUI, sans-serif';wrap(g,listeningLenses[region],65,570,w-130,48,3);},1000,800);}
export function createHoloRenderer(canvas,getState,onReady,onError){
 let disposed=false,failed=false,visible=true,raf=0,last=0,time=0,revision=0,flip=0,rx=0,ry=0;
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'});
 renderer.setClearColor(0x000000,0);renderer.setPixelRatio(Math.max(1,Math.min(window.devicePixelRatio||1,window.innerWidth<700?1.5:2)));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,30);camera.position.z=9.4;
 const group=new THREE.Group();scene.add(group);
 scene.add(new THREE.HemisphereLight(0xe2f1ff,0x29362e,2.3));
 const key=new THREE.DirectionalLight(0xffefc3,4.8);key.position.set(-3,5,6);scene.add(key);
 const rim=new THREE.DirectionalLight(0x83dfff,3.2);rim.position.set(4,-1,3);scene.add(rim);
 const loader=new THREE.TextureLoader(),materials=new Set(),textures=new Set(),geometries=new Set(),shaderMaterials=[];
 function keepGeometry(g){geometries.add(g);return g;}
 function keepMaterial(m){materials.add(m);return m;}
 function keepTexture(t){textures.add(t);return t;}
 function addMesh(g,m,x=0,y=0,z=0,back=false){const mesh=new THREE.Mesh(keepGeometry(g),keepMaterial(m));mesh.position.set(x,y,z);if(back)mesh.rotation.y=Math.PI;group.add(mesh);return mesh;}
 const bodyMaterial=keepMaterial(new THREE.MeshPhysicalMaterial({color:0xb58a42,metalness:.82,roughness:.19,clearcoat:1,clearcoatRoughness:.12,iridescence:.8,iridescenceIOR:1.34,iridescenceThicknessRange:[180,420]}));
 const body=addMesh(new RoundedBoxGeometry(3.03,4.52,.085,4,.075),bodyMaterial);
 const insetMat=keepMaterial(new THREE.MeshPhysicalMaterial({color:0x0d1b22,metalness:.3,roughness:.35,clearcoat:1}));
 addMesh(new RoundedBoxGeometry(2.96,4.44,.09,3,.065),insetMat,0,0,.008);
 let content=[];
 function contentMesh(g,m,x,y,z,back=false){const mesh=addMesh(g,m,x,y,z,back);content.push(mesh);return mesh;}
 function plane(map,width,height,x,y,z,back=false){return contentMesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map,transparent:true,toneMapped:false}),x,y,z,back);}
 function artMaterial(map,theme,depth,cutout=false){
  const mat=new THREE.ShaderMaterial({uniforms:{uMap:{value:map},uCell:{value:theme.cell},uLook:{value:new THREE.Vector2()},uTint:{value:new THREE.Color(theme.ink)},uTime:{value:0},uFoil:{value:.7},uDepth:{value:depth},uCutout:{value:cutout?1:0}},vertexShader:holoVertex,fragmentShader:holoFragment,transparent:cutout,depthWrite:!cutout});
  shaderMaterials.push(mat);return mat;
 }
 async function load(url){const t=await loader.loadAsync(url);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t;}
 function clearContent(){for(const mesh of content){group.remove(mesh);mesh.geometry.dispose();geometries.delete(mesh.geometry);mesh.material.dispose();materials.delete(mesh.material);}content=[];shaderMaterials.length=0;for(const t of textures)t.dispose();textures.clear();}
 async function updateCard(){
  const token=++revision,s=getState(),theme=holoThemes[s.region]||holoThemes[0],card=s.card;
  failed=false;
  try{
   const treatment=cardPrintFor(card.type);
   await Promise.all([document.fonts.load('500 35px SonoraUI','声音索引'),document.fonts.load('400 28px SonoraUI','SONORA')]).catch(()=>[]);
   if(disposed||token!==revision)return;
   await Promise.all([document.fonts.load('500 35px SonoraUI','声音索引'),document.fonts.load('400 28px SonoraUI','SONORA')]).catch(()=>[]);
   if(disposed||token!==revision)return;
   const loaded=await Promise.all([load(holoBackgrounds[theme.texture]),load(holoForegrounds[theme.texture]),card.cover?load(card.cover):Promise.resolve(null),load(treatment.path)]);
   if(disposed||token!==revision){loaded.forEach(t=>t?.dispose());return;}
   clearContent();loaded.filter(Boolean).forEach(keepTexture);const [background,foreground,cover,paper]=loaded;
   bodyMaterial.color.set(theme.metal);
   const bg=artMaterial(background,theme,.032),fg=artMaterial(foreground,theme,.016,true);
   if(card.type==='album'){
    contentMesh(new THREE.PlaneGeometry(2.79,3.72),bg,0,.13,.068);
    const vinyl=new THREE.MeshPhysicalMaterial({color:0x101313,metalness:.58,roughness:.27,clearcoat:1});
    const disc=contentMesh(new THREE.CylinderGeometry(1.06,1.06,.035,96),vinyl,.30,.30,.14);disc.rotation.x=Math.PI/2;
    for(const radius of [.62,.75,.88,.99])contentMesh(new THREE.TorusGeometry(radius,.003,4,96),new THREE.MeshBasicMaterial({color:0x52615d}),.30,.30,.169);
    if(cover){contentMesh(new THREE.BoxGeometry(2.05,2.05,.035),new THREE.MeshBasicMaterial({color:0xcdbd94}),-.25,.31,.195);plane(cover,1.98,1.98,-.25,.31,.22);}
   }else{
    plane(keepTexture(paperPrint(paper.image,treatment.cell)),2.79,3.72,0,.13,.068);
    if(card.type==='artist')contentMesh(new THREE.PlaneGeometry(2.32,3.093),fg,0,.18,.22);
    else plane(keepTexture(conceptPrint(card,s.region)),2.46,1.968,0,.35,.22);
   }
   plane(keepTexture(topPrint(theme,card)),2.77,.277,0,1.97,.245);
   const print=keepTexture(frontPrint(card,theme,s.number,s.region));
   plane(print,2.77,1.158,0,-1.59,.26);
   plane(keepTexture(backPrint(card,theme,foreground,s.region,paper)),2.86,4.30,0,0,-.064,true);
   flip=s.flipped?Math.PI:0;resize();render(0);
   // Read the actual first frame before hiding the raster fallback. A created
   // WebGL context alone does not mean a usable card was drawn.
   const gl=renderer.getContext(),sample=new Uint8Array(4);
   gl.readPixels(Math.floor(gl.drawingBufferWidth/2),Math.floor(gl.drawingBufferHeight/2),1,1,gl.RGBA,gl.UNSIGNED_BYTE,sample);
   if(import.meta.env.DEV)canvas.dataset.renderCheck=JSON.stringify({sample:[...sample],calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,pose:[rx,ry,flip],size:[gl.drawingBufferWidth,gl.drawingBufferHeight]});
   if(sample[3]===0)throw new Error('Card first frame is empty');
   invalidate();onReady();
  }catch(error){if(!disposed&&token===revision){failed=true;cancelAnimationFrame(raf);raf=0;onError(error);}}
 }
 function resize(){if(disposed)return;const b=canvas.getBoundingClientRect();renderer.setSize(Math.max(1,b.width),Math.max(1,b.height),false);camera.aspect=b.width/Math.max(1,b.height);camera.updateProjectionMatrix();invalidate();}
 function render(dt){
  const s=getState(),moving=!s.paused&&!s.reduced,auto=moving&&s.auto?1:0,a=s.reduced?1:damping(dt||.016,10);
  const px=s.reduced?0:s.x*.76+Math.sin(time*.62)*.29*auto,py=s.reduced?0:s.y*.70+Math.cos(time*.48)*.22*auto;
  const targetFlip=s.flipped?Math.PI:0;flip+=(targetFlip-flip)*a;rx+=(-py*.20-rx)*a;ry+=(px*.29-ry)*a;
  group.rotation.set(rx,flip+ry,-px*.025);
  for(const mat of shaderMaterials){mat.uniforms.uLook.value.set(px,py);mat.uniforms.uTime.value=time;mat.uniforms.uFoil.value=s.foil;mat.uniforms.uDepth.value=(mat.uniforms.uCutout.value>.5?.016:.032)*s.depth;}
  renderer.render(scene,camera);
  return Math.abs(targetFlip-flip)+Math.abs(-py*.20-rx)+Math.abs(px*.29-ry)>.0001;
 }
 function tick(now){
  raf=0;if(disposed||failed)return;const dt=last?Math.min(.05,(now-last)/1000):.016;last=now;const s=getState();
  if(!s.paused&&!s.reduced&&visible&&!document.hidden)time+=dt;
  const settling=render(dt);
  if(visible&&!document.hidden&&((!s.paused&&!s.reduced&&s.auto)||settling))raf=requestAnimationFrame(tick);
 }
 const scrollRoot=canvas.closest('.atlas-scroll, .guide-scroll');
 function isOnscreen(){
  const r=canvas.getBoundingClientRect(),b=scrollRoot?.getBoundingClientRect()||{top:0,left:0,right:window.innerWidth,bottom:window.innerHeight};
  return r.width>0&&r.height>0&&r.bottom>Math.max(0,b.top)&&r.top<Math.min(window.innerHeight,b.bottom)&&r.right>Math.max(0,b.left)&&r.left<Math.min(window.innerWidth,b.right);
 }
 function invalidate(){visible=isOnscreen();if(disposed||failed||raf||!visible||document.hidden)return;last=0;raf=requestAnimationFrame(tick);}
 const observer=new ResizeObserver(resize);observer.observe(canvas);
 // Some Chromium native-dialog implementations report a false viewport
 // intersection for top-layer children. Use their actual rendered rectangles,
 // and listen to the modal's independent scroll root as well.
 const checkVisibility=()=>{visible=isOnscreen();if(visible)invalidate();else{cancelAnimationFrame(raf);raf=0;last=0;}};
 const intersection=new IntersectionObserver(checkVisibility,{root:scrollRoot});intersection.observe(canvas);
 scrollRoot?.addEventListener('scroll',checkVisibility,{passive:true});window.addEventListener('scroll',checkVisibility,{passive:true});
 const onVisibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}else invalidate();};document.addEventListener('visibilitychange',onVisibility);
 const onLost=e=>{e.preventDefault();failed=true;cancelAnimationFrame(raf);raf=0;onError(new Error('WebGL context lost'));};
 canvas.addEventListener('webglcontextlost',onLost,false);
 // Return ownership synchronously: StrictMode/unmount can dispose immediately,
 // even while textures are still loading. Late textures are revision-guarded.
 resize();void updateCard();
 return {updateCard,invalidate,dispose(){
  if(disposed)return;disposed=true;revision++;cancelAnimationFrame(raf);observer.disconnect();intersection.disconnect();scrollRoot?.removeEventListener('scroll',checkVisibility);window.removeEventListener('scroll',checkVisibility);document.removeEventListener('visibilitychange',onVisibility);canvas.removeEventListener('webglcontextlost',onLost);clearContent();
  for(const g of geometries)g.dispose();for(const m of materials)m.dispose();renderer.dispose();renderer.forceContextLoss();
 }};
}
