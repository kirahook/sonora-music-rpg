import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {genrePages,handbookFor,turnPage,bookmarkPage,stampPage,notePage} from '../src/handbook.js';
import {tales,acceptTale,hearTale,claimTale} from '../src/encounters.js';
const base=()=>({day:'2026-10-08',xp:8660,keys:4,equipment:4,frontier:3});
test('eight source-backed genres have three reading milestones and loadable albums',()=>{
 const extras=JSON.parse(readFileSync(new URL('../src/extra-albums.json',import.meta.url),'utf8'));
 const audio=JSON.parse(readFileSync(new URL('../src/audio-catalog.json',import.meta.url),'utf8'));
 assert.equal(genrePages.length,8);assert.equal(new Set(genrePages.map(p=>p.id)).size,8);
 for(const p of genrePages){assert.equal(p.timeline.length,3);assert.ok(p.sources.every(x=>x[1].startsWith('https://')));assert.ok(audio[p.album]||extras.some(a=>a.code===p.album),p.album);}
 for(const name of ['paper','plates'])assert.ok(existsSync(new URL('../public/assets/v8-handbook-'+name+'.png',import.meta.url)));
 assert.ok(existsSync(new URL('../public/assets/v8-postmarks.png',import.meta.url)));
});
test('page navigation is bounded and bookmarks toggle independently',()=>{
 let s=base();assert.equal(handbookFor(s).page,0);for(const n of [-1,8,1.5,NaN])assert.equal(turnPage(s,n),s);
 s=turnPage(s,7);s=bookmarkPage(s,'ambient');s=bookmarkPage(s,'jazz');assert.deepEqual(s.handbook.bookmarks,['ambient','jazz']);s=bookmarkPage(s,'ambient');assert.deepEqual(s.handbook.bookmarks,['jazz']);assert.equal(bookmarkPage(s,'unknown'),s);
});
test('postmarks are one per genre, repositionable, clamped and never grant RPG rewards',()=>{
 let s=base();s=stampPage(s,'jazz',-2,3,'blue');assert.deepEqual(s.handbook.stamps.jazz,{x:.1,y:.9,ink:'blue',date:s.day});
 s=stampPage(s,'jazz',.3,.4,'green');assert.equal(Object.keys(s.handbook.stamps).length,1);assert.equal(s.handbook.stamps.jazz.x,.3);assert.equal(s.xp,8660);assert.equal(s.keys,4);assert.equal(s.equipment,4);
 for(const args of [['no',.2,.2,'blue'],['jazz',NaN,.2,'blue'],['jazz',.2,.2,'pink']])assert.equal(stampPage(s,...args),s);
});
test('per-genre notes survive serialization and day rollover without losing other progress',()=>{
 let s=notePage(bookmarkPage(stampPage(base(),'jazz'),'jazz'),'jazz','x'.repeat(300));s=notePage(s,'rock','节拍和重复段');assert.equal(s.handbook.notes.jazz.length,240);
 const next=JSON.parse(JSON.stringify({...s,day:'2026-10-09',listened:[],viewed:[],claimed:false}));assert.deepEqual(handbookFor(next),s.handbook);assert.equal(next.xp,8660);assert.equal(notePage(s,'wrong','abc'),s);
});
test('bonus chapters require final chapter and reward two distinct genres once',()=>{
 let s={...base(),journal:{battles:{0:{won:true}},quests:{6:{status:'claimed'}},comics:[0,6]}};assert.equal(acceptTale(s,18),s);
 s={...s,journal:{...s.journal,quests:{...s.journal.quests,12:{status:'claimed'}},comics:[0,6,12]}};s=acceptTale(s,18);
 s=hearTale(s,{id:'one',genre:'JAZZ',title:'one',albumCode:'one'});s=hearTale(s,{id:'two',genre:'JAZZ',title:'two',albumCode:'two'});assert.equal(s.journal.quests[18].status,'active');
 s=hearTale(s,{id:'three',genre:'SOUL',title:'three',albumCode:'three'});s=claimTale(s,18);assert.equal(s.xp,8900);assert.equal(s.inventory.shards,4);assert.deepEqual(s.journal.comics,[0,6,12,18]);assert.equal(claimTale(s,18),s);assert.equal(tales.filter(t=>t.episode===3).length,6);
});
