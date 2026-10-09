import {test} from 'node:test';
import assert from 'node:assert/strict';
import {strike,retryBattle,acceptTale,hearTale,claimTale,journalFor} from '../src/encounters.js';
const base=()=>({xp:7420,equipment:1,frontier:3});
test('locked regions cannot fight; win gives XP exactly once',()=>{
 let s=base();assert.equal(strike(s,3,'echo'),s);assert.equal(strike(s,0,'invalid'),s);
 s=strike(strike(strike(s,0,'echo'),0,'echo'),0,'echo');
 assert.equal(s.xp,7510);assert.equal(journalFor(s).battles[0].won,true);assert.equal(strike(s,0,'echo'),s);
});
test('a quest requires a win and a qualifying listen after acceptance, then awards one comic',()=>{
 let s=base();assert.equal(acceptTale(s,0),s);
 const track={id:'jazz1',title:'Blue Train',genre:'JAZZ'};
 s=hearTale(s,track);assert.equal(journalFor(s).quests[0],undefined);
 for(let i=0;i<3;i++)s=strike(s,0,'echo');s=acceptTale(s,0);
 const before=s;s=hearTale(s,{...track,genre:'IDM'});assert.equal(s,before);
 s=hearTale(s,track);assert.equal(journalFor(s).quests[0].status,'ready');
 s=claimTale(s,0);assert.equal(s.xp,7660);assert.deepEqual(journalFor(s).comics,[0]);assert.equal(claimTale(s,0),s);
 assert.equal(journalFor({...s,day:'tomorrow'}).comics.length,1);
});
test('defeated knight can retry without receiving a reward; partial battles survive serialization',()=>{
 let s={...base(),journal:{battles:{0:{hp:1,enemy:54,turn:0,won:false}},quests:{},comics:[]}};
 s=strike(s,0,'echo');assert.equal(s.journal.battles[0].hp,0);assert.equal(s.xp,7420);
 const restored=JSON.parse(JSON.stringify(s));assert.equal(strike(restored,0,'echo'),restored);
 s=retryBattle(restored,0);assert.equal(s.journal.battles[0].hp,60);assert.equal(s.xp,7420);
});
