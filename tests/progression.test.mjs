import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recordListen,rewards,claimRewards,unlockRegion } from '../src/progression.js';
const base=()=>({xp:7900,equipment:1,keys:1,frontier:3,listened:[],viewed:['A-028'],knownGenres:['JAZZ'],claimed:false});
test('listening credits are unique and claims cannot be repeated',()=>{
  const track={id:'audio-1',title:'test',genre:'ROCK',albumCode:'A-028'};
  const listened=recordListen(base(),track);
  assert.equal(recordListen(listened,track),listened);
  assert.equal(rewards(listened).total,330);
  const claimed=claimRewards(listened);
  assert.equal(claimed.xp,8230);
  assert.equal(claimed.receipt.newLevel,5);
  assert.equal(claimed.keys,2);
  assert.equal(claimRewards(claimed),claimed);
  assert.equal(recordListen(claimed,{...track,id:'audio-2'}),claimed);
});
test('fog unlock consumes one key, requires adjacency, and is idempotent',()=>{
  const original=base();
  assert.equal(unlockRegion(original,5),original);
  const opened=unlockRegion(original,3);
  assert.equal(opened.frontier,4);
  assert.equal(opened.keys,0);
  assert.equal(unlockRegion(opened,3),opened);
  assert.equal(unlockRegion(opened,4),opened);
});
test('zero activity cannot claim a key or equipment upgrade',()=>{
  const state={...base(),viewed:[]};
  assert.equal(claimRewards(state),state);
});
