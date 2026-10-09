import {equipped,lootFor,grantLoot} from './equipment.js';
export function rewards(state) {
  const discoveries = [...new Set(state.listened.map(track=>track.genre))].filter(genre=>!state.knownGenres.includes(genre));
  const listen=state.listened.length*120,browse=state.viewed.length*30,discovery=discoveries.length*180,bonus=Math.floor((listen+browse)*equipped(state,'charm').bonus);
  return {listen,browse,discovery,bonus,discoveries,total:listen+browse+discovery+bonus};
}
export function recordListen(state,track) {
  if(state.claimed || state.listened.some(item=>item.id===track.id)) return state;
  return {...state,listened:[...state.listened,{id:track.id,title:track.title,genre:track.genre,albumCode:track.albumCode}]};
}
export function claimRewards(state) {
  const reward=rewards(state);
  if(state.claimed || !reward.total) return state;
  const loot=lootFor(state,reward.total);
  const receipt={...reward,loot,day:state.day,oldLevel:1+Math.floor(state.xp/2000),newLevel:1+Math.floor((state.xp+reward.total)/2000),damage:reward.total*2,equipment:state.equipment+loot.upgrade,tracks:state.listened.length,cds:state.viewed.length};
  return grantLoot({...state,xp:state.xp+reward.total,equipment:state.equipment+loot.upgrade,keys:state.keys+loot.keys,knownGenres:[...new Set([...state.knownGenres,...reward.discoveries])],claimed:true,receipt},loot);
}
export function unlockRegion(state,index) {
  if(index!==state.frontier || state.keys<1 || index>=6) return state;
  return {...state,frontier:state.frontier+1,keys:state.keys-1};
}
