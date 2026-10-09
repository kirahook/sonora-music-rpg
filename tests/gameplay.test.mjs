import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGame,gameFor,recordAdventure,claimQuest,editVoyage,beginVoyage,cancelVoyage,claimVoyage} from '../src/gameplay.js';

const base=()=>({day:'2026-09-28',xp:1000,keys:1,game:createGame('2026-09-28')});
const song=(id,genre,albumCode)=>({id,title:id,genre,albumCode});

test('daily quests measure unique heard tracks, genres and albums and cannot double claim',()=>{
  let state=base();
  state=recordAdventure(state,song('a','JAZZ','A-1'));
  state=recordAdventure(state,song('a','JAZZ','A-1'));
  assert.equal(gameFor(state).heard.length,1);
  state=claimQuest(state,'first');
  assert.equal(state.xp,1060);
  assert.equal(claimQuest(state,'first'),state);
  state=recordAdventure(state,song('b','IDM','A-2'));
  state=claimQuest(state,'genres');
  assert.equal(state.xp,1180);
  state=recordAdventure(state,song('c','SOUL','A-3'));
  state=claimQuest(state,'albums');
  assert.equal(state.xp,1360);
});

test('three-track expedition advances only in order and reward is idempotent',()=>{
  let state=base();
  state=editVoyage(state,['a','b','c']);
  state=beginVoyage(state,['a','b','c']);
  state=recordAdventure(state,song('b','IDM','A-2'));
  assert.equal(gameFor(state).voyage.cursor,0);
  state=recordAdventure(state,song('a','JAZZ','A-1'));
  assert.equal(gameFor(state).voyage.cursor,1);
  state=recordAdventure(state,song('b','IDM','A-2'));
  state=recordAdventure(state,song('c','SOUL','A-3'));
  assert.equal(gameFor(state).voyage.status,'complete');
  state=claimVoyage(state);
  assert.equal(state.xp,1300);
  assert.equal(state.keys,2);
  assert.equal(claimVoyage(state),state);
});

test('cancel returns to draft and a new day gets a clean game state',()=>{
  let state=base();
  state=beginVoyage(state,['a','b','c']);
  state=cancelVoyage(state);
  assert.equal(gameFor(state).voyage.status,'draft');
  const next={...state,day:'2026-09-29'};
  assert.equal(gameFor(next).heard.length,0);
  assert.equal(gameFor(next).voyage.status,'draft');
});
