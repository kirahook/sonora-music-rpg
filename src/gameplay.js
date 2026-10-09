export const createGame=day=>({day,heard:[],claimed:[],voyage:{slots:[],cursor:0,status:'draft'},voyageClaimed:false});
export function gameFor(state){return state.game?.day===state.day?state.game:createGame(state.day);}
export const quests=[
  {id:'first',title:'第一封声音来信',description:'有效聆听 1 首音乐',target:1,xp:60,measure:g=>g.heard.length},
  {id:'genres',title:'跨越两种频率',description:'有效聆听 2 种不同流派',target:2,xp:120,measure:g=>new Set(g.heard.map(t=>t.genre)).size},
  {id:'albums',title:'三座唱片岛屿',description:'有效聆听 3 张不同专辑',target:3,xp:180,measure:g=>new Set(g.heard.map(t=>t.albumCode)).size},
];
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
