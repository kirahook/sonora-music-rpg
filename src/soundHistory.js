export const soundRegions=[
 {id:'harbor',name:'暖色港湾',label:'JAZZ / SOUL',color:'#c5a252',genres:['JAZZ','SOUL','FUNK','WORLD','JAZZ HOP']},
 {id:'crystal',name:'电子晶原',label:'ELECTRONIC / IDM',color:'#7dc8c5',genres:['ELECTRONIC','IDM','SYNTH POP','BREAKBEAT','DUBSTEP']},
 {id:'mist',name:'低频湿地',label:'TRIP-HOP / REGGAE',color:'#afa0d1',genres:['TRIP-HOP','DOWNTEMPO','REGGAE']},
 {id:'dream',name:'梦游花园',label:'DREAM / FOLK',color:'#e2a2af',genres:['DREAM POP','ART POP','SHOEGAZE','FOLK','INDIE FOLK']},
 {id:'volcano',name:'摇滚山脊',label:'ROCK / METAL',color:'#e59264',genres:['ALT ROCK','PROG ROCK','METAL','ROCK']},
 {id:'glacier',name:'寂静冰原',label:'AMBIENT / CLASSICAL',color:'#a7c7d7',genres:['AMBIENT','CLASSICAL']},
];
const clean=tracks=>[...new Map((tracks||[]).filter(t=>t&&t.id&&t.genre).map(t=>[String(t.id),{id:String(t.id),title:t.title||'未命名音轨',genre:t.genre,albumCode:t.albumCode||'LOCAL'}])).values()];
export function soundLogFor(s){
 const saved=s.soundLog||{},log={...saved};
 if(!s.day)return log;
 const legacy=[...(s.listened||[]),...(s.game?.day===s.day?s.game.heard||[]:[])];
 const tracks=clean([...(log[s.day]||[]),...legacy]);
 if(tracks.length)log[s.day]=tracks;
 return log;
}
export function archiveSound(s){const log=soundLogFor(s);return Object.keys(log).length?{...s,soundLog:log}:s;}
export function recordSound(s,track){
 if(!s.day||!track?.id||!track.genre)return s;
 const log=soundLogFor(s),tracks=log[s.day]||[];
 if(tracks.some(t=>t.id===String(track.id)))return archiveSound(s);
 return {...s,soundLog:{...log,[s.day]:clean([...tracks,track])}};
}
export function soundReport(s,range='today'){
 const log=soundLogFor(s),days=Object.keys(log).filter(day=>range==='all'||day===s.day).sort();
 const records=days.flatMap(day=>clean(log[day]).map(t=>({...t,day})));
 const genres={};for(const t of records)genres[t.genre]=(genres[t.genre]||0)+1;
 const regions=soundRegions.map(r=>({...r,count:records.filter(t=>r.genres.includes(t.genre)).length}));
 const other=records.filter(t=>!soundRegions.some(r=>r.genres.includes(t.genre)));
 return {records,genres,regions,other,total:records.length,days:days.length,genreCount:Object.keys(genres).length,uniqueTracks:new Set(records.map(t=>t.id)).size,max:Math.max(1,...regions.map(r=>r.count))};
}
