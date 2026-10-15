import {test} from 'node:test';
import assert from 'node:assert/strict';
import {guideStorageKey,guideSteps,cleanGuide,readGuide,saveGuide,shouldOpenGuide,moveGuide,finishGuide} from '../src/onboarding.js';

const memory=()=>{const items=new Map();return {getItem:k=>items.get(k)||null,setItem:(k,v)=>items.set(k,v),items};};
test('first visit opens the nine-chapter guide without a login or RPG save dependency',()=>{
 const storage=memory();const g=readGuide(storage);assert.equal(g.status,'new');assert.equal(g.step,0);assert.ok(shouldOpenGuide(g));
 assert.equal(guideSteps.length,9);assert.equal(new Set(guideSteps.map(s=>s.id)).size,9);
 assert.ok(guideSteps.every(s=>s.cards.length===3&&s.target&&s.action));assert.notEqual(guideStorageKey,'sonora-terminal-v3');
});
test('progress resumes, skip suppresses automatic opening, and replay is independent of game progress',()=>{
 const storage=memory();storage.setItem('sonora-terminal-v3','{"xp":7420,"keys":1,"receipt":"unchanged"}');
 const before=storage.getItem('sonora-terminal-v3');let g=moveGuide(readGuide(storage),4);assert.ok(saveGuide(storage,g));
 assert.equal(readGuide(storage).step,4);assert.ok(shouldOpenGuide(readGuide(storage)));
 g=finishGuide(g,'skipped');saveGuide(storage,g);assert.ok(!shouldOpenGuide(readGuide(storage)));assert.equal(readGuide(storage).step,4);
 g=moveGuide(g,g.step);assert.equal(g.step,4);assert.ok(shouldOpenGuide(g));assert.equal(storage.getItem('sonora-terminal-v3'),before);
});
test('completed guide stays dismissed; independent devices start fresh; corrupted or unavailable storage is safe',()=>{
 const storage=memory();saveGuide(storage,finishGuide(moveGuide(cleanGuide(null),8)));assert.ok(!shouldOpenGuide(readGuide(storage)));
 assert.ok(shouldOpenGuide(readGuide(memory())));storage.setItem(guideStorageKey,'not JSON');assert.equal(readGuide(storage).step,0);
 const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};assert.equal(readGuide(blocked).status,'new');assert.equal(saveGuide(blocked,cleanGuide(null)),false);
 assert.equal(readGuide(null).status,'new');assert.equal(saveGuide(null,cleanGuide(null)),false);
});
test('step bounds, version and animation preference are normalized without changing rewards',()=>{
 const g=cleanGuide({version:1,status:'in-progress',step:999,paused:true});assert.equal(g.step,8);assert.equal(g.paused,true);
 assert.equal(moveGuide(g,-99).step,0);assert.equal(moveGuide(g,Infinity).step,8);assert.equal(moveGuide(g,NaN).step,0);
 assert.equal(cleanGuide({version:999,status:'completed'}).status,'new');assert.equal(finishGuide(g,'anything').status,'completed');
 assert.ok(!Object.keys(g).some(k=>['xp','keys','inventory','handbook','receipt'].includes(k)));
});
