export const holoThemes=[
 {name:'铜管星港',en:'BRASS CONSTELLATION',ink:'#d9bb73',metal:'#b58a42',color:'#24483f',texture:0,cell:0,motif:'铜管 / 即兴 / 星轨'},
 {name:'频率圣殿',en:'CRYSTAL FREQUENCY',ink:'#8fdfeb',metal:'#99c8db',color:'#16445c',texture:0,cell:1,motif:'合成 / 电路 / 晶体'},
 {name:'磁带夜航',en:'TAPE NOCTURNE',ink:'#cdb7e9',metal:'#9b829e',color:'#352a4d',texture:1,cell:0,motif:'采样 / 磁带 / 夜雨'},
 {name:'玻璃梦园',en:'GLASS REVERIE',ink:'#f0d3c4',metal:'#c89f8e',color:'#4b3d4c',texture:1,cell:1,motif:'回声 / 花房 / 微光'},
 {name:'黑曜回响',en:'OBSIDIAN ANTHEM',ink:'#ffc493',metal:'#b7774b',color:'#4d2b23',texture:2,cell:0,motif:'电弦 / 熔岩 / 共鸣'},
 {name:'月汐观测',en:'LUNAR RESONANCE',ink:'#b8dcf0',metal:'#a6c2d4',color:'#273e58',texture:2,cell:1,motif:'空间 / 冰川 / 留白'},
];
export const holoBackgrounds=['/assets/v15-holo-worlds-01-02.png','/assets/v15-holo-worlds-03-04.png','/assets/v15-holo-worlds-05-06.png'];
export const holoForegrounds=['/assets/v15-holo-guardians-01-02.png','/assets/v15-holo-guardians-03-04.png','/assets/v15-holo-guardians-05-06.png'];
export const listeningLenses=[
 '先找贝斯与鼓的落点，再听独奏怎样留白、怎样回应乐队。',
 '一层层辨认鼓机和音序，追踪循环中细小的音色变化。',
 '暂时放下旋律，留意采样边缘、低频与人声混响的距离。',
 '选一条若隐若现的声音线，再退后听它如何融入整片声墙。',
 '记住一个吉他重复段，听鼓和贝斯怎样一起推动它前进。',
 '放慢注意力，听声音的起落、余韵，以及音乐之外的房间。',
];
export function holoArtStyle(region){const t=holoThemes[region]||holoThemes[0];return {backgroundImage:`url("${holoBackgrounds[t.texture]}")`,backgroundSize:'200% 100%',backgroundPosition:t.cell?'100% 50%':'0% 50%'};}
export function holoForegroundStyle(region){const t=holoThemes[region]||holoThemes[0];return {...holoArtStyle(region),backgroundImage:`url("${holoForegrounds[t.texture]}")`};}
export function normalizedLook(x,y){return {x:Math.max(-1,Math.min(1,Number.isFinite(x)?x:0)),y:Math.max(-1,Math.min(1,Number.isFinite(y)?y:0))};}
export function damping(dt,speed=9){return 1-Math.exp(-Math.max(0,Math.min(.1,dt))*speed);}
