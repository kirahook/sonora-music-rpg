import {listeningClues,listeningContrasts,observationsFor,comparisonFor,notedGenresFor} from './listeningDiscovery.js';
export const createGame=day=>({day,rulesVersion:2,heard:[],observations:[],comparison:null,claimed:[],voyage:{slots:[],cursor:0,status:'draft'},voyageClaimed:false});
export function gameFor(state){return state.game?.day===state.day?state.game:createGame(state.day);}
export const quests=[
  {id:'first',title:'听见一枚声音线索',description:'听一段音乐，记录一个特点或一个还没听清的问题',target:1,xp:60,measure:g=>g.rulesVersion===2?observationsFor(g).length:g.heard.length},
  {id:'genres',title:'带着线索跨越两片海',description:'记录两种流派的观察，再留下一处相似或不同',target:2,xp:120,measure:g=>g.rulesVersion===2?(comparisonFor(g)?2:Math.min(1,notedGenresFor(g).size)):new Set(g.heard.map(t=>t.genre)).size},
  {id:'albums',title:'三座唱片岛屿',description:'有效聆听 3 张不同专辑',target:3,xp:180,measure:g=>new Set(g.heard.map(t=>t.albumCode)).size},
];
export function observeTrack(state,trackId,focus){
 const game=gameFor(state),track=game.heard.find(t=>t.id===trackId);
 if(!track||!listeningClues.some(c=>c.id===focus)||observationsFor(game).some(o=>o.trackId===trackId))return state;
 const note={trackId,focus};
 return {...state,firstSoundNote:state.firstSoundNote||{...note,day:state.day,title:track.title,albumCode:track.albumCode,genre:track.genre},game:{...game,observations:[...observationsFor(game),note]}};
}
export function compareSounds(state,left,right,contrast){
 const game=gameFor(state);
 if(comparisonFor(game)||!listeningContrasts.some(c=>c.id===contrast))return state;
 const next={...game,comparison:{left,right,contrast}};
 return comparisonFor(next)?{...state,game:next}:state;
}
export function recordAdventure(state,track){
  const game=gameFor(state),heard=game.heard.some(t=>t.id===track.id)?game.heard:[...game.heard,track];
  let voyage=game.voyage;
  if(voyage.status==='active'&&voyage.slots[voyage.cursor]===track.id){const cursor=voyage.cursor+1;voyage={...voyage,cursor,status:cursor===3?'complete':'active'};}
  return {...state,game:{...game,heard,voyage}};
}
export function claimQuest(state,id){
  const game=gameFor(state),quest=quests.find(q=>q.id===id);
  if(!quest||game.claimed.includes(id)||quest.measure(game)<quest.target)return state;
  return {...state,xp:state.xp+quest.xp,game:{...game,claimed:[...game.claimed,id]}};
}
export function editVoyage(state,slots){
  const game=gameFor(state);
  if(game.voyage.status==='active'||game.voyage.status==='complete')return state;
  return {...state,game:{...game,voyage:{slots,cursor:0,status:'draft'}}};
}
export function beginVoyage(state,slots){
  const game=gameFor(state);
  if(slots.length!==3||new Set(slots).size!==3||game.voyageClaimed||game.voyage.status==='complete')return state;
  if(game.voyage.status==='active')return state;
  return {...state,game:{...game,voyage:{slots,cursor:0,status:'active'}}};
}
export function cancelVoyage(state){const game=gameFor(state);return {...state,game:{...game,voyage:{...game.voyage,status:'draft',cursor:0}}};}
export function claimVoyage(state){
  const game=gameFor(state);
  if(game.voyage.status!=='complete'||game.voyageClaimed)return state;
  return {...state,xp:state.xp+300,keys:state.keys+1,game:{...game,voyageClaimed:true}};
}
