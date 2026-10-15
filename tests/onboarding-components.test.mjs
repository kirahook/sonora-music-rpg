import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createServer} from 'vite';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {guideSteps,cleanGuide,moveGuide} from '../src/onboarding.js';
test('all nine guide chapters render their explanations, safe demos and links as accessible HTML',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
 try{
  const {Onboarding}=await server.ssrLoadModule('/src/Onboarding.jsx');
  for(let step=0;step<guideSteps.length;step++){
   const html=renderToStaticMarkup(React.createElement(Onboarding,{state:{},tour:{guide:moveGuide(cleanGuide(null),step),open:true,saved:true},onNavigate:()=>{}}));
   assert.ok(html.includes('aria-labelledby="guide-title"'));assert.ok(html.includes(guideSteps[step].title));assert.ok(html.includes('不修改游戏存档'));
   assert.ok(html.includes('暂停动画'));assert.ok(html.includes('跳转引导章节'));assert.ok(html.includes('跳过新手引导'));assert.ok(!html.includes('<audio'));
   assert.equal((html.match(/aria-current="step"/g)||[]).length,1);assert.ok(html.includes('进度保存在当前设备和浏览器'));
   assert.ok(html.includes('guide-tip-phone'));assert.ok(html.includes('guide-tip-desktop'));
   if(step===0)assert.ok(html.includes('用底部五个入口切换页面，随行播放条始终在手边。'));
   if(step===8)assert.ok(html.includes('点页签或上下页翻阅；点盖章按钮，再点留白处。'));
  }
  const closed=renderToStaticMarkup(React.createElement(Onboarding,{state:{},tour:{guide:cleanGuide(null),open:false,saved:true}}));assert.ok(!closed.includes('guide-shell'));
 }finally{await server.close();}
});
test('guide has original raster art, reduced motion, pause, full-height phone layout and no game-storage writes',async()=>{
 const css=await readFile(new URL('../src/onboarding.css',import.meta.url),'utf8');
 const source=await readFile(new URL('../src/Onboarding.jsx',import.meta.url),'utf8');
 assert.ok(css.includes('prefers-reduced-motion'));assert.ok(css.includes('animation-play-state:paused'));assert.ok(css.includes('safe-area-inset-bottom'));assert.ok(css.includes('height:100dvh'));
 assert.ok(source.includes('showModal()'));assert.ok(source.includes("close('skipped')"));assert.ok(source.includes('preventScroll:true'));
 assert.ok(!source.includes('sonora-terminal-v3'));assert.ok(!source.includes('claimRewards('));assert.ok(!source.includes('unlockRegion('));
 assert.ok((await stat(new URL('../public/assets/v11-guide-sound-city.png',import.meta.url))).size>10000);
});
