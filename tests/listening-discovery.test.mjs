import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createSSRServer} from './ssr-server.mjs';
import {createGame,gameFor,recordAdventure,observeTrack,compareSounds,claimQuest,quests} from '../src/gameplay.js';
import {listeningClues,observationsFor,comparisonFor} from '../src/listeningDiscovery.js';
import {cleanGuide,saveGuide,readGuide,shouldOpenGuide,replayGuide} from '../src/onboarding.js';

const base=()=>({day:'2026-10-27',xp:100,keys:1,frontier:3,claimed:false,game:createGame('2026-10-27')});
const track=(id,genre='JAZZ')=>({id,title:'Track '+id,genre,albumCode:'album-'+id});
test('a clue requires an actual credited track and a valid personal observation, never awarding XP itself',()=>{
 let s=base();assert.equal(observeTrack(s,'a','pulse'),s);s=recordAdventure(s,track('a'));
 assert.equal(observeTrack(s,'a','wrong'),s);assert.equal(claimQuest(s,'first'),s);
 s=observeTrack(s,'a','unsure');assert.equal(s.xp,100);assert.equal(s.keys,1);assert.equal(s.frontier,3);
 assert.equal(quests[0].measure(s.game),1);assert.equal(s.firstSoundNote.focus,'unsure');assert.equal(observeTrack(s,'a','pulse'),s);
 s=claimQuest(s,'first');assert.equal(s.xp,160);assert.equal(claimQuest(s,'first'),s);
});
test('a cross-sea task needs two valid genre clues and an explicit comparison, including uncertainty',()=>{
 const local=observeTrack(recordAdventure(base(),track('x','LOCAL')),'x','unsure');assert.equal(quests[1].measure(local.game),0);
 let s=base();for(const [id,g]of[['a','JAZZ'],['b','JAZZ'],['c','IDM'],['local','LOCAL']])s=observeTrack(recordAdventure(s,track(id,g)),id,'texture');
 assert.equal(compareSounds(s,'a','b','pulse'),s);assert.equal(compareSounds(s,'a','local','pulse'),s);
 assert.equal(compareSounds(s,'a','c','invalid'),s);assert.equal(compareSounds(s,'a','missing','pulse'),s);
 assert.equal(claimQuest(s,'genres'),s);s=compareSounds(s,'a','c','unsure');assert.equal(s.xp,100);
 assert.equal(quests[1].measure(s.game),2);assert.ok(comparisonFor(s.game));assert.equal(compareSounds(s,'c','a','similar'),s);
 s=claimQuest(s,'genres');assert.equal(s.xp,220);assert.equal(claimQuest(s,'genres'),s);
});
test('malformed, duplicate or unearned clues cannot manufacture a completed comparison',()=>{
 const g={heard:[track('a')],observations:[null,{trackId:'missing',focus:'pulse'},{trackId:'a',focus:'wrong'},{trackId:'a',focus:'space'},{trackId:'a',focus:'texture'}],comparison:{left:'a',right:'missing',contrast:'similar'}};
 assert.equal(observationsFor(g).length,1);assert.equal(comparisonFor(g),null);
 assert.deepEqual(observationsFor({heard:{},observations:[{}]}),[]);assert.equal(comparisonFor({comparison:{left:'a',right:'b',contrast:'pulse'}}),null);
});
test('legacy current-day claims and eligibility survive; tomorrow starts clue rules but preserves the keepsake',()=>{
 let s={...base(),game:{day:'2026-10-27',heard:[track('a'),track('b','IDM')],claimed:['first'],voyage:{slots:['a','b','c'],cursor:1,status:'active'},voyageClaimed:false}};
 assert.equal(claimQuest(s,'first'),s);s=claimQuest(s,'genres');assert.equal(s.xp,220);assert.equal(s.game.voyage.cursor,1);
 s=observeTrack(s,'a','space');const note=s.firstSoundNote;s={...s,day:'2026-10-28'};
 assert.equal(gameFor(s).rulesVersion,2);assert.deepEqual(gameFor(s).observations,[]);assert.equal(gameFor(s).comparison,null);assert.equal(s.firstSoundNote,note);
 s=recordAdventure(s,track('c','IDM'));s=observeTrack(s,'c','pulse');assert.equal(s.firstSoundNote,note);
});
test('first-listen routing preserves the v1 storage key, old handbook position and dismissal states',()=>{
 const g=cleanGuide(null);assert.equal(g.route,'first-listen');assert.equal(g.first.step,0);
 const memory=new Map(),storage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};
 saveGuide(storage,{...g,status:'in-progress',first:{step:2,albumCode:'A-004',trackId:'sample'}});
 assert.deepEqual(readGuide(storage).first,{step:2,albumCode:'A-004',trackId:'sample'});
 const legacy=cleanGuide({version:1,status:'in-progress',step:6});assert.equal(legacy.route,'handbook');assert.equal(legacy.step,6);
 for(const status of ['completed','skipped'])assert.equal(shouldOpenGuide({version:1,status,step:8}),false);
 const completed={...readGuide(storage),status:'completed',step:8,first:{step:3,albumCode:'A-004',trackId:'sample'}};
 assert.deepEqual(replayGuide(completed).first,{step:0});assert.equal(replayGuide(completed).step,0);
 assert.equal(replayGuide(readGuide(storage)).first.step,2,'unfinished first listening resumes');
});
test('real first-listen UI has only four progressive steps and reuses the one actual player',async()=>{
 const server=await createSSRServer();try{
  const {FirstListen,ListeningDiscovery}=await server.ssrLoadModule('/src/ListeningDiscovery.jsx');
  const {Onboarding}=await server.ssrLoadModule('/src/Onboarding.jsx');const{albums}=await server.ssrLoadModule('/src/catalog.js');
  const a=albums[0],t={...a.tracks[0],albumCode:a.code,genre:a.genre},player={track:t,playing:false,loading:false};let s=base();
  const tour=step=>({open:true,saved:true,guide:{...cleanGuide(null),status:'in-progress',first:{step,albumCode:a.code,trackId:t.id}}});
  let html=renderToStaticMarkup(React.createElement(Onboarding,{tour:tour(0),state:s,player,power:'on',onChoose:()=>{}}));
  assert.ok(html.includes('第一次聆听的四步'));assert.ok(!html.includes('guide-chapters'));assert.ok(!html.includes('达标聆听演示'));assert.ok(!html.includes('<audio'));
  html=renderToStaticMarkup(React.createElement(FirstListen,{tour:tour(1),state:s,game:s.game,player,power:'on'}));
  assert.ok(html.includes('播放这段声音'));assert.ok(html.includes('disabled=""'));assert.ok(!html.includes('observation-form'));
  s=recordAdventure(s,t);html=renderToStaticMarkup(React.createElement(FirstListen,{tour:tour(2),state:s,game:s.game,player,power:'on'}));
  assert.equal((html.match(/type="radio"/g)||[]).length,4);assert.ok(html.includes('暂时还没辨清'));
  s=observeTrack(s,t.id,'space');s={...s,day:'2026-10-28'};
  html=renderToStaticMarkup(React.createElement(FirstListen,{tour:tour(3),state:s,game:gameFor(s),player,power:'on'}));
  assert.ok(html.includes('我的第一张声音札记'));assert.ok(html.includes('不花钥匙'));assert.ok(!html.includes('guide-chapters'));
  html=renderToStaticMarkup(React.createElement(ListeningDiscovery,{game:gameFor(base())}));assert.ok(html.includes('先真实听一段音乐'));
 }finally{await server.close();}
});
test('guide and discovery styles reuse original assets, readable controls and no extra audio/timer engine',async()=>{
 const [source,css,guide]=await Promise.all(['../src/ListeningDiscovery.jsx','../src/v24.css','../src/onboarding.js'].map(p=>readFile(new URL(p,import.meta.url),'utf8')));
 assert.doesNotMatch(source,/new Audio|<audio|setInterval|setTimeout|\.play\(|unlockRegion|claimRewards/);
 for(const s of ['FIRST, A LITTLE SOUND.','WHAT DID YOU HEAR?','player.toggle','onChoose(a)','ObservationForm','SoundNote',"onNavigate('quest-first')"])assert.ok(source.includes(s));
 for(const s of ['max-width:700px','max-width:360px','safe-area-inset-bottom','font-size:16px','min-height:44px'])assert.ok(css.includes(s));
 assert.ok(css.includes('font-family:SonoraUI'),'new functional copy uses the original locally hosted bilingual UI face');
 assert.ok(!css.includes('url('));assert.ok(guide.includes('比较两种流派'));assert.equal(listeningClues.length,4);
});
