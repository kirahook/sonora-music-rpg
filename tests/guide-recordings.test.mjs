import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createSSRServer} from './ssr-server.mjs';
import {guideSteps} from '../src/onboarding.js';
import {guideScenes,sceneFor,guideMovieFor} from '../src/guideScenes.js';

test('the optional global tour includes all nine stable handbook chapters and three recent features',()=>{
 assert.deepEqual(guideScenes.slice(0,9).map(s=>s.id),guideSteps.map(s=>s.id));
 assert.deepEqual(guideScenes.slice(9).map(s=>s.id),['signals','letters','landscape']);
 assert.equal(new Set(guideScenes.map(s=>s.target)).size,12);
 assert.equal(sceneFor('missing').id,'welcome');assert.equal(guideMovieFor('../bad').id,'welcome');
 for(const scene of guideScenes){assert.equal(scene.steps.length,3);assert.ok(scene.label&&scene.body&&scene.en);assert.equal(guideMovieFor(scene.id).frames.length,4);}
});

test('cinema, portal and real-page tour are audio-free controls with accessible static defaults',async()=>{
 const server=await createSSRServer();
 try{
  const {GuideCinema,GuidePortal}=await server.ssrLoadModule('/src/GuideCinema.jsx');
  const {GuideSpotlight,clippedGuideRect}=await server.ssrLoadModule('/src/GuideSpotlight.jsx');
  for(const scene of guideScenes){
   const html=renderToStaticMarkup(React.createElement(GuideCinema,{id:scene.id,onLocate:()=>{}}));
   assert.ok(html.includes(scene.label));assert.ok(html.includes('网页实录'));assert.ok(html.includes('关键停留已压缩'));
   assert.ok(html.includes('逐步查看录制画面'));assert.ok(html.includes('静态预览'));assert.ok(html.includes('在页面中高亮找一遍'));
   assert.ok(!/<audio|<video|autoplay/i.test(html));assert.ok(!html.includes(scene.id+'.gif?play='));
  }
  const portal=renderToStaticMarkup(React.createElement(GuidePortal));assert.ok(portal.includes('aria-expanded="false"'));assert.ok(!portal.includes('guide-overview-art'));
  const last=renderToStaticMarkup(React.createElement(GuideSpotlight,{id:'landscape'}));assert.ok(last.includes('12 / 12'));assert.ok(last.includes('完成巡览'));
  assert.deepEqual(clippedGuideRect({left:-10,top:-20,right:900,bottom:900},393,852),{left:8,top:8,width:377,height:836});
  for(const r of [null,{left:NaN,top:0,right:10,bottom:10},{left:500,top:0,right:600,bottom:10}])assert.equal(clippedGuideRect(r,393,852),null);
 }finally{await server.close();}
});

test('GIF playback stops on pause, reduced-motion changes, hidden pages and actual offscreen bounds',async()=>{
 const cinema=await readFile(new URL('../src/GuideCinema.jsx',import.meta.url),'utf8');
 const spotlight=await readFile(new URL('../src/GuideSpotlight.jsx',import.meta.url),'utf8');
 assert.ok(cinema.includes('document.hidden'));assert.ok(cinema.includes('prefers-reduced-motion'));assert.ok(cinema.includes('getBoundingClientRect'));
 assert.ok(cinema.includes('observer?.disconnect()'));assert.ok(cinema.includes("removeEventListener('scroll'"));
 assert.ok(spotlight.includes("e.key==='Escape'"));assert.ok(spotlight.includes('cancelAnimationFrame'));
 for(const text of [cinema,spotlight])assert.ok(!/localStorage|claimQuest|claimRewards|unlockRegion|\.play\(/.test(text));
 const css=await readFile(new URL('../src/v25.css',import.meta.url),'utf8');assert.ok(css.includes('prefers-reduced-motion'));assert.ok(css.includes('min-height:44px'));assert.ok(css.includes('safe-area-inset-bottom'));
});

test('each guide GIF is backed by four real captured stills and a bounded provenance manifest',async()=>{
 const dir=new URL('../public/assets/guide-v25/',import.meta.url);
 const manifest=JSON.parse(await readFile(new URL('recording-manifest.json',dir),'utf8'));
 assert.equal(manifest.clips.length,guideScenes.length);
 for(const scene of guideScenes){
  const clip=manifest.clips.find(c=>c.id===scene.id);assert.ok(clip);assert.equal(clip.width,800);assert.equal(clip.height,600);assert.ok(clip.frames>=3);assert.ok(clip.durationMs>0&&clip.durationMs<=20000);
  const gif=await readFile(new URL(scene.id+'.gif',dir));assert.equal(gif.subarray(0,6).toString(),'GIF89a');assert.equal(gif.readUInt16LE(6),800);assert.equal(gif.readUInt16LE(8),600);
  for(let i=1;i<=4;i++)assert.ok((await stat(new URL(scene.id+'-'+i+'.webp',dir))).size>1000);
 }
});
