import {test} from 'node:test';
import assert from 'node:assert/strict';
import {stat,readFile} from 'node:fs/promises';
import {guideEditorial} from '../src/guideEditorial.js';
import {guideSteps} from '../src/onboarding.js';
import {gear} from '../src/equipment.js';
test('nine chapter sheets have 27 unique speeches and five curated specimens each',async()=>{
 const quotes=[];
 for(const {id} of guideSteps){
  const page=guideEditorial[id];
  assert.equal(page.quotes.length,3);quotes.push(...page.quotes);
  assert.equal(page.words.length,3);assert.equal(page.specimens.length,5);assert.equal(page.captions.length,5);
  assert.equal(new Set(page.captions).size,5);
  for(const item of page.specimens){
   if(item.kind==='gear')assert.ok(gear.some(g=>g.id===item.id));
   if(item.kind==='record')assert.ok(item.index>=0&&item.index<30);
   if(item.kind==='creature'||item.kind==='terrain')assert.ok(item.index>=0&&item.index<6);
   if(item.kind==='plate')assert.ok(item.index>=0&&item.index<8);
   if(item.kind==='flower')assert.ok(item.index>=0&&item.index<3);
   if(item.kind==='harvest')assert.ok((await stat(new URL('../public/assets/v6-harvest-'+item.name+'.png',import.meta.url))).size>1000);
  }
 }
 assert.equal(quotes.length,27);assert.equal(new Set(quotes).size,27);
});
test('editorial controls stay guide-local and responsive without automatic speech timers',async()=>{
 const jsx=await readFile(new URL('../src/GuideEditorial.jsx',import.meta.url),'utf8');
 const css=await readFile(new URL('../src/onboarding.css',import.meta.url),'utf8');
 assert.ok(jsx.includes('aria-live="polite"'));assert.ok(jsx.includes('换一句骑士对白'));assert.ok(jsx.includes('不代表已获得物品'));
 assert.ok(!/localStorage|setInterval|setTimeout|claimRewards|unlockRegion/.test(jsx));
 assert.ok(css.includes('.speech-left'));assert.ok(css.includes('overflow-x:auto'));assert.ok(css.includes('scroll-snap-type:x proximity'));assert.ok(css.includes('prefers-reduced-motion'));
});
