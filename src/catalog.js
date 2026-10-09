import audioCatalog from './audio-catalog.json';
import extraAlbums from './extra-albums.json';
import extraAudio from './extra-audio-catalog.json';

export const albums = [
  ['A-004','Blue Train','John Coltrane','1957','JAZZ',0,'从一段萨克斯独奏出发，驶入蓝色的爵士港湾。'],
  ['A-012','Moon Safari','Air','1998','ELECTRONIC',1,'温暖的合成器与缓慢节拍，适合没有终点的太空漫游。'],
  ['A-017','Dummy','Portishead','1994','TRIP-HOP',2,'采样、低频与若即若离的人声，来自雾中群岛的电波。'],
  ['A-021','Heaven or Las Vegas','Cocteau Twins','1990','DREAM POP',3,'穿过梦境般的吉他与绚丽回声，让人声化作乐器。'],
  ['A-028','In Rainbows','Radiohead','2007','ALT ROCK',4,'从复杂节奏到温柔回响，在摇滚的边界发现新的航线。'],
  ['A-034','Promises','Floating Points · Pharoah Sanders · LSO','2021','AMBIENT',5,'一个反复出现的动机，把爵士、电子与管弦乐连接成海。'],
  ['A-041','The Miseducation of Lauryn Hill','Lauryn Hill','1998','SOUL',0,'在灵魂乐与说唱之间，发现温暖而坚定的力量。'],
  ['A-052','Selected Ambient Works 85–92','Aphex Twin','1992','IDM',1,'漂浮的旋律与细碎鼓点，让电子海域向更远处延伸。'],
  ['A-063','Vespertine','Björk','2001','ART POP',3,'微小的声音层层堆叠，像一封从冬日梦境寄来的信。'],
  ['A-071','Kind of Blue','Miles Davis','1959','JAZZ',0,'爵士港的黄昏：让即兴旋律沿着暖色屋顶慢慢散开。'],
  ['A-082','Discovery','Daft Punk','2001','ELECTRONIC',1,'从晶体山谷出发，把迪斯科的脉冲装进飞船。'],
  ['A-093','Mezzanine','Massive Attack','1998','TRIP-HOP',2,'阴影中的重低音，在紫灰湿地留下深深的回声。'],
  ['A-104','Souvlaki','Slowdive','1993','SHOEGAZE',3,'层叠吉他像粉色薄雾，慢慢覆盖湖面的倒影。'],
  ['A-115','The Wall','Pink Floyd','1979','PROG ROCK',4,'踏上火山剧场，在叙事摇滚中穿越坚硬的边界。'],
  ['A-126','Metaphorical Music','Nujabes','2003','JAZZ HOP',0,'温暖采样与松弛鼓点，记录港口的一次漫游。'],
  ['A-137','Bloom','Beach House','2012','DREAM POP',3,'花木与合成器的微光，把夜色织成柔软的地图。'],
  ['A-148','Black Sands','Bonobo','2010','DOWNTEMPO',2,'有机节拍和细碎弦乐，循着沼泽的水流向前。'],
  ['A-159','Music Has the Right to Children','Boards of Canada','1998','IDM',5,'褪色磁带中的旋律，在冰川上缓慢形成新的纹理。'],
].map(([code,title,artist,year,genre,region,note])=>({code,title,artist,year,genre,region,note,cover:`/assets/${code}.jpg`,...audioCatalog[code]})).concat(extraAlbums.map(album=>({...album,...extraAudio[album.code]})));

export const regions = [
  { name:'蓝调港湾', en:'BLUE NOTE HARBOR', genre:'JAZZ / SOUL', biome:'暖色城镇 · 爵士码头', color:'#bb7951', x:18,y:30, album:0 },
  { name:'电子星海', en:'CRYSTAL FREQUENCY', genre:'ELECTRONIC / IDM', biome:'冰晶柱群 · 电波观测台', color:'#498ca2', x:50,y:26, album:10 },
  { name:'迷雾群岛', en:'THE HAZY ISLES', genre:'TRIP-HOP', biome:'紫灰湿地 · 锈色工业遗迹', color:'#89728b', x:82,y:29, album:11 },
  { name:'梦境浅滩', en:'DREAM COAST', genre:'DREAM POP / ART POP', biome:'粉色花林 · 高山湖泊', color:'#b47d8d', x:18,y:74, album:3 },
  { name:'摇滚峭壁', en:'VOLCANIC AMPHITHEATER', genre:'ALT ROCK / PROG ROCK', biome:'熔岩山脊 · 黑石剧场', color:'#b66440', x:52,y:68, album:13 },
  { name:'无声深海', en:'GLACIER LIGHTHOUSE', genre:'AMBIENT / IDM', biome:'寂静冰川 · 极地灯塔', color:'#7d9daa', x:84,y:75, album:17 },
];
export const fmt = number => Math.round(number).toLocaleString('en-US');
export const clock = seconds => Number.isFinite(seconds) ? `${Math.floor(seconds/60).toString().padStart(2,'0')}:${Math.floor(seconds%60).toString().padStart(2,'0')}` : '00:00';
export const dateKey = () => new Date().toLocaleDateString('sv-SE');
