// Personal listening reports, not audio recognition or right/wrong answers.
export const listeningClues=[
 {id:'pulse',title:'节拍在带路',hint:'留意重复的鼓点、低音或拍手；身体会不会想跟着动？',note:'下一次，试着只跟随那个反复出现的声音，看看它什么时候改变。'},
 {id:'texture',title:'音色让我停住',hint:'哪个声音最先抓住你：人声、乐器，还是说不出名字的质感？',note:'不必先认出乐器。用温暖、粗糙、明亮或朦胧，给它一个自己的名字。'},
 {id:'space',title:'听见远近和留白',hint:'有些声音贴近耳边，有些像从远处传来；空下来时是什么感觉？',note:'再听一次声音之间的空隙。留白和回声，也在塑造这段音乐。'},
 {id:'unsure',title:'暂时还没辨清',hint:'这也是有效观察。下一遍只挑一个声音跟着走，不用急着回答。',note:'把问号留下来。下次只追踪鼓、一个人声或一条旋律，就已经比刚才更靠近。'},
];
export const listeningContrasts=[
 {id:'pulse',title:'节奏的感觉不同'}, {id:'texture',title:'声音的质感不同'},
 {id:'similar',title:'我听见了相似之处'}, {id:'unsure',title:'差别还说不清'},
];
export const isNamedGenre=genre=>typeof genre==='string'&&!!genre.trim()&&!['LOCAL','UNKNOWN','未分类'].includes(genre.trim().toUpperCase());
export function observationsFor(game){
 const heard=Array.isArray(game?.heard)?game.heard:[],seen=new Set();return (Array.isArray(game?.observations)?game.observations:[]).filter(o=>{
  if(!o||seen.has(o.trackId)||!listeningClues.some(c=>c.id===o.focus)||!heard.some(t=>t.id===o.trackId))return false;
  seen.add(o.trackId);return true;
 });
}
export const notedGenresFor=game=>new Set(observationsFor(game).map(o=>game.heard.find(t=>t.id===o.trackId)?.genre).filter(isNamedGenre));
export function comparisonFor(game){
 const c=game?.comparison;if(!c||!listeningContrasts.some(o=>o.id===c.contrast))return null;
 const notes=observationsFor(game),left=notes.find(o=>o.trackId===c.left),right=notes.find(o=>o.trackId===c.right);
 const heard=Array.isArray(game.heard)?game.heard:[],a=heard.find(t=>t.id===left?.trackId),b=heard.find(t=>t.id===right?.trackId);
 return a&&b&&a.id!==b.id&&isNamedGenre(a.genre)&&isNamedGenre(b.genre)&&a.genre!==b.genre?c:null;
}
