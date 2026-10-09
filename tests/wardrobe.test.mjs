import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gear,starterGear,inventoryFor,equip,avatarSpec,lootFor,rewardTiers} from '../src/equipment.js';
import {claimRewards} from '../src/progression.js';

test('24 unique pixel items cover eight weapons, eight shields and eight outfits',()=>{
 assert.equal(gear.length,24);assert.equal(new Set(gear.map(g=>g.id)).size,24);
 assert.deepEqual(['weapon','shield','charm'].map(slot=>gear.filter(g=>g.slot===slot).length),[8,8,8]);
 assert.equal(new Set(gear.map(g=>g.pixel)).size,24);
 assert.deepEqual(gear.filter(g=>g.slot==='charm').map(g=>g.look).sort((a,b)=>a-b),[0,1,2,3,4,5,6,7]);
 assert.equal(starterGear.length,10);
});
test('legacy inventory gains basic choices without losing loot, shards, selection or progress',()=>{
 const s={xp:9000,journal:{comics:[0,6]},inventory:{owned:['star-blade','wander-cloak'],loadout:{weapon:'star-blade',shield:'record-shield',charm:'wander-cloak'},shards:11}};
 const inv=inventoryFor(s);assert.equal(inv.shards,11);assert.ok(inv.owned.includes('star-blade'));assert.ok(starterGear.every(id=>inv.owned.includes(id)));
 assert.equal(inv.loadout.weapon,'star-blade');assert.equal(inventoryFor({...s,inventory:inv}).owned.length,inv.owned.length);
 const next=equip(s,'amber-scarf');assert.equal(next.xp,9000);assert.deepEqual(next.journal.comics,[0,6]);assert.equal(next.inventory.shards,11);
});
test('each equipment slot changes its matching visual layer and persists independently',()=>{
 const s={},base=avatarSpec(s);
 const w=avatarSpec(equip(s,'wood-lute'));assert.notEqual(w.weapon,base.weapon);assert.equal(w.shield,base.shield);assert.equal(w.outfit,base.outfit);
 const sh=avatarSpec(equip(s,'leaf-shield'));assert.notEqual(sh.shield,base.shield);assert.equal(sh.weapon,base.weapon);
 const dressed=equip(equip(equip(s,'wood-lute'),'leaf-shield'),'tide-sash');const look=avatarSpec(dressed);
 assert.notEqual(look.outfit,base.outfit);assert.deepEqual(look.names,['旅歌木琴','叶脉轻盾','潮汐披肩']);
 assert.deepEqual(avatarSpec(JSON.parse(JSON.stringify(dressed))),look);assert.equal(equip(s,'rose-cloak'),s);
});
test('every nonstarter item is obtainable in daily loot and can immediately update the outfit',()=>{
 for(const item of gear.filter(g=>!starterGear.includes(g.id))){
  const tier=rewardTiers.find(t=>t.pool.includes(item.id));assert.ok(tier,item.id);
  const s={day:'2026-10-08',xp:7420,equipment:1,keys:1,claimed:false,knownGenres:[],listened:[],viewed:Array.from({length:Math.ceil(tier.min/30)},(_,i)=>i),inventory:{...inventoryFor({}),owned:gear.filter(g=>g.id!==item.id).map(g=>g.id)}};
  assert.equal(lootFor(s,tier.min).item,item.id);const awarded=claimRewards(s);assert.ok(awarded.inventory.owned.includes(item.id));
  const worn=equip(awarded,item.id);assert.ok(avatarSpec(worn).signature.includes(item.id));assert.equal(claimRewards(awarded),awarded);
 }
});
