import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {regionAtlas,canExploreRegion,cityArt,atlasCards,nextCard,swipeDirection} from '../src/regionAtlas.js';
import {createServer} from 'vite';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {unlockRegion} from '../src/progression.js';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const metadata={...JSON.parse(read('../src/audio-catalog.json')),...JSON.parse(read('../src/extra-audio-catalog.json'))};
const records=Object.entries(metadata).map(([code,a])=>({code,title:code,artist:'Artist',year:'2001',note:'A listening note',cover:'/assets/'+code+'.jpg',...a}));
test('six distinctive cities contain 24 unique readable, sourced history landmarks',()=>{
 assert.equal(regionAtlas.length,6);
 const ids=[];
 for(const r of regionAtlas){assert.equal(r.nodes.length,4);assert.equal(r.records.length,3);assert.ok(r.sources.length);
  for(const s of r.sources)assert.ok(s[1].startsWith('https://'));
  for(const n of r.nodes){ids.push(n.id);assert.ok(n.body.length>25);assert.ok(metadata[n.album]);assert.ok(n.x>0&&n.x<100&&n.y>0&&n.y<100);}
 }
 assert.equal(new Set(ids).size,24);
 assert.equal(new Set(regionAtlas.map(r=>r.nodes.map(n=>n.place).join())).size,6);
});
test('48 unique flashcards have working album associations, categories and primary sources',()=>{
 const cards=regionAtlas.flatMap(r=>atlasCards(r.id,records));assert.equal(cards.length,48);assert.equal(new Set(cards.map(c=>c.id)).size,48);
 for(const r of regionAtlas){const deck=atlasCards(r.id,records);assert.equal(deck.filter(c=>c.type==='album').length,3);assert.equal(deck.filter(c=>c.type==='artist').length,3);assert.equal(deck.filter(c=>c.type==='concept').length,2);
  for(const c of deck){assert.ok(metadata[c.album]);assert.ok(c.source[1].startsWith('https://'));assert.ok(c.body);}}
 assert.deepEqual(atlasCards(6,records),[]);
});
test('unlocked access is read only; locked, invalid and nonsequential regions stay protected',()=>{
 const s={frontier:3,keys:1,xp:7420};const before=JSON.stringify(s);
 for(const i of [0,1,2])assert.equal(canExploreRegion(s,i),true);
 for(const i of [-1,3,4,5,6,null,NaN,1.5,'1'])assert.equal(canExploreRegion(s,i),false);
 assert.equal(JSON.stringify(s),before);assert.equal(canExploreRegion(null,0),false);
 assert.equal(unlockRegion(s,4),s);const next=unlockRegion(s,3);assert.equal(next.frontier,4);assert.equal(next.keys,0);assert.equal(next.xp,s.xp);assert.equal(canExploreRegion(next,3),true);
 assert.equal(unlockRegion(next,4),next);
});
test('city atlas preserves six separate cells and card navigation wraps both ways',()=>{
 assert.equal(new Set(regionAtlas.map(r=>cityArt(r.id).backgroundPosition)).size,6);
 for(const r of regionAtlas)assert.equal(cityArt(r.id).backgroundSize,'200% 300%');
 assert.equal(nextCard(0,-1,8),7);assert.equal(nextCard(7,1,8),0);assert.equal(nextCard(0,1,0),0);
 for(const a of ['v14-hero-pixels.png','v14-region-cities.png'])assert.ok(existsSync(new URL('../public/assets/'+a,import.meta.url)));
});
test('swiping ignores taps and predominantly vertical scrolling',()=>{
 assert.equal(swipeDirection(64,0),0);assert.equal(swipeDirection(65,0),0);assert.equal(swipeDirection(-90,10),1);assert.equal(swipeDirection(90,-10),-1);
 assert.equal(swipeDirection(80,120),0);assert.equal(swipeDirection(10,200),0);
});
test('all six real components render the correct city, landmarks, album and independent card deck',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
 try{
  const {RegionExplorer}=await server.ssrLoadModule('/src/RegionExplorer.jsx');
  const {HeroPixels}=await server.ssrLoadModule('/src/HeroPixels.jsx');
  for(const atlas of regionAtlas){
   const state={frontier:6,xp:7420,keys:1},before=JSON.stringify(state);
   const html=renderToStaticMarkup(React.createElement(RegionExplorer,{state,region:atlas.id}));
   assert.ok(html.includes('完整像素建筑模型'));assert.ok(html.includes('8 张 / 本海域'));assert.ok(html.includes(atlas.nodes[0].title));
   assert.equal((html.match(/class="atlas-landmark /g)||[]).length,4);
   for(const n of atlas.nodes)assert.ok(html.includes(n.place));
   assert.ok(html.includes('不自动播放'));assert.equal(JSON.stringify(state),before);
   assert.equal(renderToStaticMarkup(React.createElement(RegionExplorer,{state:{frontier:atlas.id},region:atlas.id})),'');
  }
  const hero=renderToStaticMarkup(React.createElement(HeroPixels));assert.ok(hero.includes('暂停像素背景'));assert.ok(hero.includes('aria-hidden="true"'));
 }finally{await server.close();}
});
test('exploration uses native modal, accessible input alternatives and no save writes or reward timers',()=>{
 const jsx=read('../src/RegionExplorer.jsx'),hero=read('../src/HeroPixels.jsx'),css=read('../src/v14.css'),app=read('../src/App.jsx');
 assert.match(jsx,/showModal\(\)/);assert.match(jsx,/onCancel/);assert.match(jsx,/preventScroll:true/);assert.match(jsx,/canExploreRegion\(state,region\)/);
 assert.match(jsx,/onPointerCancel/);assert.match(jsx,/ArrowRight/);assert.match(jsx,/setPointerCapture/);assert.match(jsx,/setPlaying\(false\)/);
 assert.doesNotMatch(jsx+hero,/localStorage|claimRewards|unlockRegion|recordListen|\.play\(/);
 assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/aspect-ratio:9\/4/);assert.match(css,/touch-action:pan-y/);
 assert.match(hero,/prefers-reduced-motion: reduce/);assert.match(hero,/aria-pressed/);assert.match(app,/if\(canExploreRegion\(state,i\)\)setExplorerRegion\(i\)/);
});
