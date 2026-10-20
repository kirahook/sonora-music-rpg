import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import frames from '../src/battleFrames.json' with {type:'json'};
import {battleScenes,battleSceneStyle,portraitBodyStyle} from '../src/battleArt.js';
import {guideSteps,guideVersion,guideStorageKey} from '../src/onboarding.js';
import {claimRewards} from '../src/progression.js';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');

test('sixty measured frames preserve pixel proportions and stay within their own sprite cell',()=>{
 const states=['idle','attack','hurt','low','defeated'],names=['harbor','crystal','mist','dream','volcano','glacier'];
 for(const [region,name] of names.entries())for(let i=0;i<10;i++){
  const [x,y,w,h]=frames[name][i],col=i%5,row=Math.floor(i/5);
  assert.ok(w>100&&h>100);assert.ok(x>=col*1536/5);assert.ok(x+w<=(col+1)*1536/5+1);assert.ok(y>=row*512&&y+h<=(row+1)*512);
  const style=portraitBodyStyle(region,row?'companion':'monster',states[col]);
  assert.equal(style.aspectRatio,`${w} / ${h}`);
  const [sx,sy]=style.backgroundSize.split(' ').map(parseFloat);
  assert.ok(Math.abs(w*sx/(h*sy)-1.5)<1e-12,'background scaling must preserve the full atlas aspect ratio');
  assert.ok(style.height.includes('var(--portrait-unit'));
 }
});

test('all six named arenas use six unique cells of the real generated background atlas',()=>{
 assert.equal(battleScenes.length,6);assert.equal(new Set(battleScenes.map(s=>s.name)).size,6);
 assert.equal(new Set(battleScenes.map((_,i)=>battleSceneStyle(i).backgroundPosition)).size,6);
 const png=readFileSync(new URL('../public/assets/v17-battle-scenes.png',import.meta.url));assert.equal(png.readUInt32BE(16),1536);assert.equal(png.readUInt32BE(20),1024);
 for(let i=0;i<6;i++)assert.equal(battleSceneStyle(i).backgroundSize,'200% 300%');
 const css=read('../src/v17.css');for(const value of ['aspect-ratio:9/4','bottom:21%','transform:scaleX(-1)','prefers-reduced-motion:reduce','--portrait-unit:118px'])assert.ok(css.includes(value));
});

test('nine existing guide chapters retain progress IDs and explain new cards, scenes and receipts',()=>{
 assert.equal(guideVersion,1);assert.equal(guideStorageKey,'sonora-onboarding-v1');assert.equal(guideSteps.length,9);
 const world=guideSteps.find(s=>s.id==='world'),tales=guideSteps.find(s=>s.id==='tales'),harvest=guideSteps.find(s=>s.id==='harvest');
 assert.match(world.lead,/二级像素城市/);assert.match(world.cards.flat().join(' '),/音乐家.*听觉词条/);
 assert.match(tales.lead,/六位同行伙伴/);assert.match(tales.cards.flat().join(' '),/攻击.*受击.*低体力.*落败/);
 assert.match(harvest.lead,/逐项列出计算/);assert.match(harvest.cards.flat().join(' '),/信物名称或重复转化/);
 const source=read('../src/GuideFeatures.jsx');assert.doesNotMatch(source,/localStorage|claimRewards\(|unlockRegion\(|recordListen\(|\.play\(/);
 const battleSource=read('../src/BattleEncounter.jsx');for(const prefix of ['enemy-number-','ally-number-','weapon-','guard-'])assert.ok(battleSource.includes("key={'"+prefix+"'+fx.id}"));
 assert.match(read('../src/Onboarding.jsx'),/e.defaultPrevented/);assert.match(read('../src/holoRenderer.js'),/\.atlas-scroll, \.guide-scroll/);
});

test('real scenes, safe guide exercises, map and report render with bilingual typography and no reward mutations',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
 try{
  const {BattleScene}=await server.ssrLoadModule('/src/BattleEncounter.jsx');
  const {GuideBattle,GuideWorld,GuideSettlement,GuideGear}=await server.ssrLoadModule('/src/GuideFeatures.jsx');
  const {HarvestCard}=await server.ssrLoadModule('/src/FieldNotes.jsx');const {RegionExplorer}=await server.ssrLoadModule('/src/RegionExplorer.jsx');
  for(let i=0;i<6;i++){const html=renderToStaticMarkup(React.createElement(BattleScene,{region:i,monster:'hurt',companion:'attack'}));assert.ok(html.includes('data-facing="right"'));assert.ok(html.includes('data-facing="left"'));assert.ok(html.includes(battleScenes[i].name));assert.ok(html.includes('受击'));assert.ok(html.includes('攻击'));}
  const battle=renderToStaticMarkup(React.createElement(GuideBattle));for(const text of ['演示回声斩','低体力','挑战失利','不会交战或增加经验'])assert.ok(battle.includes(text));
  assert.ok(renderToStaticMarkup(React.createElement(GuideWorld)).includes('演示驱散迷雾'));
  const ledger=renderToStaticMarkup(React.createElement(GuideSettlement));for(const text of ['演示饰物回馈','不发放奖励','150','不是你的真实收获'])assert.ok(ledger.includes(text));assert.ok(!ledger.includes('id="settlement"'));
  assert.ok(renderToStaticMarkup(React.createElement(GuideGear)).includes('港口铁匠'));
  const state=claimRewards({day:'2026-10-20',xp:7420,keys:1,equipment:1,frontier:6,listened:[{id:'one',title:'One',genre:'JAZZ'}],viewed:['a'],knownGenres:['JAZZ']}),before=JSON.stringify(state);
  const report=renderToStaticMarkup(React.createElement(HarvestCard,{open:true,state}));assert.ok(report.includes('DAILY FIELD REPORT.'));assert.ok(report.includes('每日归航战报'));assert.ok(report.includes('report-ledger-summary'));
  const map=renderToStaticMarkup(React.createElement(RegionExplorer,{state,region:0}));assert.ok(map.includes('THE SOUND ATLAS.'));assert.equal(JSON.stringify(state),before);
 }finally{await server.close();}
});
