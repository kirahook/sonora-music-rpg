import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createPixels,pixelPoint,blendPixel,smoothStep} from '../src/pixelField.js';
import {holoThemes,holoBackgrounds,holoForegrounds,holoArtStyle,holoForegroundStyle,listeningLenses,normalizedLook,damping} from '../src/holoArt.js';
import {holoVertex,holoFragment} from '../src/holoShaders.js';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');

test('six foil themes use six separate natural 3:4 artwork cells',()=>{
 assert.equal(holoThemes.length,6);assert.equal(new Set(holoThemes.map(t=>t.en)).size,6);
 assert.equal(new Set(holoThemes.map(t=>t.texture+':'+t.cell)).size,6);
 for(const path of [...holoBackgrounds,...holoForegrounds]){
  const png=readFileSync(new URL('../public'+path,import.meta.url));
  assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),1536);assert.equal(png.readUInt32BE(20),1024);
  if(path.includes('guardians'))assert.equal(png[25],6,'foreground must retain RGBA, not a flattened background');
 }
 for(let i=0;i<6;i++){assert.equal(holoArtStyle(i).backgroundSize,'200% 100%');assert.ok(holoArtStyle(i).backgroundImage.includes(holoBackgrounds[holoThemes[i].texture]));}
});
test('seeded pixels are reproducible and all flow formations remain finite',()=>{
 const points=createPixels(75);assert.deepEqual(points,createPixels(75));assert.notDeepEqual(points,createPixels(75,24));
 for(const p of points)for(const mode of [0,1,2])for(const t of [0,8.25,14.99999,15,30,1e4]){
  const q=pixelPoint(p,t,391,430,mode);assert.ok(Number.isFinite(q.x)&&Number.isFinite(q.y));
 }
});
test('backs contain six separate listening lenses and fallback keeps both original artwork layers',()=>{
 assert.equal(listeningLenses.length,6);assert.equal(new Set(listeningLenses).size,6);
 for(let i=0;i<6;i++)assert.ok(holoForegroundStyle(i).backgroundImage.includes(holoForegrounds[holoThemes[i].texture]));
 assert.match(read('../src/HoloCard.jsx'),/holo-raster-guardian/);
 assert.match(read('../src/holoRenderer.js'),/drawImage\(foreground.image/);
 assert.match(read('../src/RegionExplorer.jsx'),/原创流派守护者意象/);
});
test('automatic formations meet continuously and manual change has eased endpoints',()=>{
 for(const p of createPixels(40))for(const t of [8.25,15,23.25,30,38.25,45]){
  const a=pixelPoint(p,t-1e-5,1200,420),b=pixelPoint(p,t+1e-5,1200,420);
  assert.ok(Math.hypot(b.x-a.x,b.y-a.y)<.05);
 }
 const a={x:30,y:15},b={x:280,y:370};assert.deepEqual(blendPixel(a,b,0),a);assert.deepEqual(blendPixel(a,b,1),b);
 assert.equal(smoothStep(-1),0);assert.equal(smoothStep(2),1);assert.ok(smoothStep(.01)<.001);assert.ok(smoothStep(.99)>.999);
});
test('material input is bounded and damping is frame-rate independent',()=>{
 assert.deepEqual(normalizedLook(NaN,Infinity),{x:0,y:0});assert.deepEqual(normalizedLook(-8,7),{x:-1,y:1});
 assert.equal(damping(-1),0);assert.ok(damping(.016)>0&&damping(.016)<1);
 assert.ok(Math.abs((1-damping(1/60))**60-(1-damping(1/30))**30)<1e-12);
 assert.equal(damping(100),damping(.1));
});
test('WebGL material implements separate foreground alpha, view parallax, bump and angular grating',()=>{
 assert.match(holoVertex,/normalMatrix/);assert.match(holoVertex,/vView=-mv.xyz/);
 for(const s of ['uLook*uDepth','heightAt','reflect(-L,N)','spectrum(','uCutout>.5','tex.a<.015','colorspace_fragment'])assert.ok(holoFragment.includes(s));
 assert.match(holoFragment,/i<7/);assert.match(holoFragment,/clamp\(uv.x,.002,.998\)/);
 const renderer=read('../src/holoRenderer.js');assert.match(renderer,/RoundedBoxGeometry/);assert.match(renderer,/MeshPhysicalMaterial/);
 assert.match(renderer,/clearcoat/);assert.match(renderer,/readPixels/);assert.match(renderer,/sample\[3\]===0/);
});
test('GPU resources are owned synchronously, offscreen motion stops and native-dialog visibility is measured',()=>{
 const renderer=read('../src/holoRenderer.js'),component=read('../src/HoloCard.jsx');
 assert.doesNotMatch(renderer,/export async function createHoloRenderer/);assert.match(renderer,/void updateCard\(\)/);
 assert.match(renderer,/token!==revision/);assert.match(renderer,/loaded.forEach\(t=>t\?\.dispose\(\)\)/);
 assert.match(renderer,/isOnscreen/);assert.match(renderer,/getBoundingClientRect/);assert.match(renderer,/root:scrollRoot/);
 for(const s of ['observer.disconnect()','intersection.disconnect()','renderer.dispose()','renderer.forceContextLoss()','document.hidden','s.reduced','webglcontextlost'])assert.ok(renderer.includes(s));
 assert.match(component,/cancelled=true/);assert.match(component,/engine.current\?\.dispose\(\)/);
 assert.match(read('../src/v15.css'),/\.region-explorer::backdrop\{backdrop-filter:none\}/);
});
test('flow supports real pause, eased manual morphs, reduced motion and protected typography',()=>{
 const flow=read('../src/pixelField.js'),hero=read('../src/HeroPixels.jsx');
 for(const s of ['clip(\'evenodd\')','protectedAreas','cancelAnimationFrame(raf)','document.hidden','intersection.disconnect()','morph+dt/1.8'])assert.ok(flow.includes(s));
 assert.match(hero,/prefers-reduced-motion: reduce/);assert.match(hero,/setPaused\(paused\|\|reduced\)/);
 assert.doesNotMatch(flow+hero,/localStorage|recordListen|\.play\(/);
});
test('native Blender source includes editable layered stock and an honest provenance notice',()=>{
 const source=read('../art-source/build_holo_cards.py'),notice=read('../art-source/README.md');
 for(const s of ['bpy','ShaderNode','BEVEL','pack()','save_as_mainfile'])assert.ok(source.includes(s),s);
 assert.ok(notice.includes('not binary-identical'));assert.ok(notice.includes('not copied'));
});
