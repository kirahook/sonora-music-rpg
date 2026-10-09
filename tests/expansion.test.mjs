import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {equip,equipped,inventoryFor,forge,tierFor,rewardTiers} from '../src/equipment.js';
import {claimRewards,rewards} from '../src/progression.js';
import {acceptTale,hearTale,claimTale,taleProgress,tales,strike} from '../src/encounters.js';
const base=()=>({day:'2026-09-30',xp:8440,equipment:4,keys:4,frontier:3,listened:[],viewed:[],knownGenres:['JAZZ'],claimed:false});
test('tier boundaries award increasing keys, upgrades and persisted one-time loot',()=>{
 assert.deepEqual([299,300,899,900,1799,1800].map(x=>tierFor(x).id),['traveler','explorer','explorer','navigator','navigator','legend']);
 const original={...base(),viewed:Array.from({length:60},(_,i)=>String(i))};
 const next=claimRewards(original);assert.equal(next.receipt.total,1800);assert.equal(next.keys,7);assert.equal(next.equipment,7);assert.equal(next.inventory.shards,10);assert.ok(next.inventory.owned.includes(next.receipt.loot.item));assert.equal(claimRewards(next),next);
 assert.deepEqual(JSON.parse(JSON.stringify(next)).receipt.loot,next.receipt.loot);
});
test('locked equipment cannot be selected, selected equipment changes battle and XP, forging spends shards',()=>{
 const s=base();assert.equal(equip(s,'star-blade'),s);
 const selected=equip(s,'reed-blade');assert.equal(equipped(selected,'weapon').attack,5);
 assert.ok(strike(selected,2,'echo').journal.battles[2].enemy<strike(s,2,'echo').journal.battles[2].enemy);
 const armored=equip({...s,inventory:{...inventoryFor(s),owned:[...inventoryFor(s).owned,'bass-shield']}},'bass-shield');
 assert.ok(strike(armored,2,'echo').journal.battles[2].hp>strike(s,2,'echo').journal.battles[2].hp);
 const withCompass={...s,inventory:{...inventoryFor(s),owned:[...inventoryFor(s).owned,'gold-compass']},listened:[{id:'one',genre:'JAZZ'}],viewed:['one']};
 const boosted=equip(withCompass,'gold-compass');assert.equal(rewards(boosted).bonus,12);assert.equal(rewards(boosted).total,162);
 assert.equal(forge(boosted),boosted);const forged=forge({...boosted,inventory:{...boosted.inventory,shards:6}});assert.equal(forged.inventory.shards,0);assert.equal(forged.equipment,5);
});

test('expanded catalog and all twenty-four illustrated chapters have distinct usable assets',()=>{
 const extra=JSON.parse(readFileSync(new URL('../src/extra-albums.json',import.meta.url),'utf8'));
 const newer=JSON.parse(readFileSync(new URL('../src/extra-audio-catalog.json',import.meta.url),'utf8'));
 const older=JSON.parse(readFileSync(new URL('../src/audio-catalog.json',import.meta.url),'utf8'));
 assert.equal(extra.length,12);assert.equal(Object.keys(older).length,18);
 const tracks=[...Object.values(older),...Object.values(newer)].flatMap(a=>a.tracks);
 assert.equal(tracks.length,367);assert.ok(tracks.every(t=>t.id&&t.title&&t.url.startsWith('https://audio-ssl.itunes.apple.com/')));
 assert.equal(new Set(extra.map(a=>a.code)).size,12);
 for(const a of extra){assert.ok(newer[a.code]?.tracks.length);assert.ok(existsSync(new URL('../public'+a.cover,import.meta.url)));}
 assert.equal(tales.length,24);assert.equal(new Set(tales.map(t=>t.art)).size,24);
 for(const t of tales)assert.ok(existsSync(new URL('../public'+t.art,import.meta.url)));
});
test('second and final chapters require preceding completion and distinct genres/albums, duplicates do not advance',()=>{
 let s={...base(),journal:{battles:{0:{won:true}},quests:{},comics:[]}};
 assert.equal(acceptTale(s,6),s);
 s=acceptTale(s,0);s=hearTale(s,{id:'a',title:'A',genre:'JAZZ',albumCode:'one'});s=claimTale(s,0);s=acceptTale(s,6);
 s=hearTale(s,{id:'a',title:'A',genre:'JAZZ',albumCode:'one'});const prior=s;assert.equal(hearTale(s,{id:'a',title:'A',genre:'JAZZ',albumCode:'one'}),s);
 s=hearTale(s,{id:'b',title:'B',genre:'JAZZ',albumCode:'two'});assert.equal(taleProgress(tales[6],s.journal.quests[6]),1);assert.equal(s.journal.quests[6].status,'active');
 s=hearTale(s,{id:'c',title:'C',genre:'FUNK',albumCode:'three'});s=claimTale(s,6);assert.equal(s.xp,prior.xp+220);assert.equal(claimTale(s,6),s);
 s=acceptTale(s,12);for(const [id,albumCode] of [['d','one'],['e','one'],['f','two']])s=hearTale(s,{id,title:id,genre:'JAZZ',albumCode});assert.equal(s.journal.quests[12].status,'active');
 s=hearTale(s,{id:'g',title:'G',genre:'SOUL',albumCode:'three'});s=claimTale(s,12);assert.deepEqual(s.journal.comics,[0,6,12]);assert.ok(s.inventory.owned.includes('reed-blade'));
});
test('duplicate daily gear converts to shards and legacy progress remains usable',()=>{
 const legacy={...base(),journal:{battles:{0:{won:true}},quests:{0:{status:'claimed',track:{id:'old',genre:'JAZZ'}}},comics:[0]}};
 assert.equal(acceptTale(legacy,6).journal.quests[6].status,'active');
 const allRare={...legacy,viewed:Array.from({length:10},(_,i)=>String(i)),inventory:{...inventoryFor(legacy),owned:[...inventoryFor(legacy).owned,...rewardTiers.find(t=>t.id==='explorer').pool],shards:0}};
 const next=claimRewards(allRare);assert.equal(next.receipt.loot.item,null);assert.equal(next.inventory.shards,7);assert.deepEqual(next.journal.comics,[0]);
});
