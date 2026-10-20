import {albums,regions} from './catalog.js';
import {tales} from './encounters.js';

// Fictional field notes, not weather, live telemetry or a historical claim.
export const worldNotes=[
 {signal:'铜管 / 木贝斯 / 摇摆',place:'留声巷与旧码头',note:'修复师把旧唱片的沙沙声留在港口。沿着铜管回声走，码头、唱片店与夜市会给出不同的答案。'},
 {signal:'合成器 / 脉冲 / 采样',place:'第零频道观测站',note:'晶柱是一座座收信天线。工程师用合成器与节拍搭桥，把遥远的频率接成一张会发光的海图。'},
 {signal:'低频 / 反拍 / 磁带',place:'雨巷与午夜渡口',note:'摆渡人只在低频经过时开船。旧磁带、湿石阶与慢拍鼓声，藏着这座群岛不急着说完的故事。'},
 {signal:'朦胧人声 / 延音 / 吉他',place:'湖心花房',note:'花房的窗会收藏月光。把人声当作一件乐器，沿层叠的吉他与回声，寻找水面另一侧的旋律。'},
 {signal:'失真 / 强拍 / 安可',place:'黑石露天剧场',note:'山谷把每次试音记成一道纹路。跟随吉他、鼓与人群的呼应，安静的片刻也是下一次安可的入口。'},
 {signal:'持续音 / 留白 / 微小变化',place:'极地电台与灯塔',note:'灯塔不催促任何一首歌结束。守望者在漫长音色里记录微小变化，把留白也当作一封来信。'},
];

export function worldStatus(state,selected=0){
 const frontier=Math.max(0,Math.min(regions.length,Math.floor(Number(state.frontier)||0)));
 const region=Math.max(0,Math.min(regions.length-1,Math.floor(Number(selected)||0)));
 const journal=state.journal||{},comics=new Set((journal.comics||[]).filter(id=>tales[id]&&tales[id].region<frontier));
 const won=regions.filter((_,i)=>i<frontier&&journal.battles?.[i]?.won).length;
 const unlocked=region<frontier;
 return {frontier,region,unlocked,keys:Math.max(0,Math.floor(Number(state.keys)||0)),won,comics:comics.size,
  name:unlocked?regions[region].name:`未知海域 ${String(region+1).padStart(2,'0')}`,
  localComics:[...comics].filter(id=>tales[id].region===region).length,
  albumCount:unlocked?albums.filter(a=>a.region===region).length:0,
  note:unlocked?worldNotes[region]:null,
 };
}
