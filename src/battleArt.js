import frames from './battleFrames.json' with {type:'json'};
const names=['harbor','crystal','mist','dream','volcano','glacier'];
const states=['idle','attack','hurt','low','defeated'];
export const battleScenes=[
 {name:'铜管旧码头',en:'BRASS HARBOR'}, {name:'晶原观测台',en:'CRYSTAL SIGNAL'},
 {name:'雨巷渡口',en:'RAINY FERRY'}, {name:'月下花房',en:'MOON GARDEN'},
 {name:'黑石安可台',en:'EMBER STAGE'}, {name:'极光灯塔',en:'POLAR RADIO'},
];
export function battleSceneStyle(region){const i=Math.max(0,Math.min(5,region));return {backgroundImage:'url("/assets/v17-battle-scenes.png")',backgroundSize:'200% 300%',backgroundPosition:`${i%2*100}% ${Math.floor(i/2)*50}%`};}
export function portraitBodyStyle(region,role='monster',state='idle'){
 const art=names[region]||names[0],row=role==='companion'?5:0,index=Math.max(0,states.indexOf(state));
 const [x,y,w,h]=frames[art][row+index],idle=frames[art][row][3];
 return {backgroundImage:`url("/assets/v16-battle-${art}.png")`,backgroundSize:`${1536/w*100}% ${1024/h*100}%`,backgroundPosition:`${x/(1536-w)*100}% ${y/(1024-h)*100}%`,width:`calc(var(--portrait-unit, 160px) * ${w/idle})`,height:`calc(var(--portrait-unit, 160px) * ${h/idle})`,aspectRatio:`${w} / ${h}`};
}
