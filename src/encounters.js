import {equipped,grantLoot} from './equipment.js';
export const creatures=[
 {name:'偷拍鸦',style:'爵士报刊 / 金黑网点',art:'harbor',color:'#ad8751',hp:54,hit:13,description:'爱把丢失的节拍藏进唱片袋，用拍翅声向旅人发起挑战。',gift:'reed-blade'},
 {name:'磁带水母',style:'未来丝网 / 青蓝几何',art:'crystal',color:'#488ca8',hp:68,hit:14,description:'每根触须都是一段音频线；它只相信能够对齐的频率。',gift:'crystal-fork'},
 {name:'灯蛾摆渡人',style:'暗夜刮版 / 紫灰木刻',art:'mist',color:'#89728b',hp:62,hit:16,description:'以低频为罗盘，带走失的船穿过没有尽头的浓雾。',gift:'bass-shield'},
 {name:'云眠兔',style:'童话手绘 / 粉彩水色',art:'dream',color:'#b98299',hp:58,hit:12,description:'长耳朵能听见湖底的月亮；竖琴里藏着还没醒来的梦。',gift:'gold-compass'},
 {name:'余烬吉他蜥',style:'朋克印刷 / 锈红油毡',art:'volcano',color:'#b65d3b',hp:82,hit:18,description:'把岩浆当拨片，偏爱强劲的节奏，也会为温柔的歌留下安可。',gift:'ember-blade'},
 {name:'极光海豹',style:'极地版画 / 冰蓝细线',art:'glacier',color:'#7498b1',hp:76,hit:15,description:'负责记录冰层深处的声音，偶尔把星星误认成电台来信。',gift:'glacier-lantern'},
];
const firstTales=[
 {name:'偷拍鸦',title:'被偷走的蓝色拍子',quest:'替港口找回一段爵士旋律',genres:['JAZZ','SOUL','JAZZ HOP'],story:'凌晨三点，灯塔只剩下一声低鸣。偷拍鸦把港口的最后一拍藏进唱片袋，说那是它从没听过的心跳。',ending:'你把蓝色旋律放回灯塔。小怪兽没有逃走，而是第一次跟着节拍点了点头。'},
 {name:'电波鸦',title:'晶洞里的第零频道',quest:'为晶洞接通一段电子信号',genres:['ELECTRONIC','IDM'],story:'晶洞电台收到一封没有文字的来信。电波鸦坚持说，静电里藏着一座无人抵达的城市。',ending:'频率终于对齐。晶体亮起，来信里那座城市在一秒钟里有了声音。'},
 {name:'雾行鸦',title:'午夜渡船的回声',quest:'用一段迷幻节拍唤醒渡船',genres:['TRIP-HOP','DOWNTEMPO'],story:'渡船已经停了七个晚上。雾行鸦守着一张湿透的唱片，等待一个能够穿过浓雾的低音。',ending:'鼓点落下，船灯依次亮起。雾行鸦把最后一张船票留给了你。'},
 {name:'梦游鸦',title:'倒映在湖中的唱片',quest:'为梦境浅滩寻找一首梦幻旋律',genres:['DREAM POP','ART POP','SHOEGAZE'],story:'梦游鸦说湖底有第二个月亮。它每晚潜入水中，却只能带回一小片没有声音的倒影。',ending:'歌声轻轻落在水面。第二个月亮醒了，原来那是一张一直等待唱针的唱片。'},
 {name:'裂响鸦',title:'火山的安可时间',quest:'用一段摇滚旋律回应火山',genres:['ALT ROCK','PROG ROCK'],story:'最后一次演出之后，火山再也没有沉默。裂响鸦拿着断裂的拨片，请你听听山里的安可声。',ending:'最后一个和弦融进晚霞。火山熄灭，拨片上留下了一道温暖的光。'},
 {name:'静音鸦',title:'冰川电台不打烊',quest:'送给冰川一段宁静的环境声',genres:['AMBIENT','IDM'],story:'冰川电台每天播出九十九秒的寂静。静音鸦不知道，那是灯塔写给海洋的情书。',ending:'宁静的声音流过冰层。电台第一次收到回信：海浪在同一个频率上回答了它。'},
];
const secondTales=[
 ['旧码头的双重奏','给两座灯塔送去不同的声音','白色灯塔只记得铜管，红色灯塔只记得手鼓。偷拍鸦请你找到两种声音，让它们在同一个夜晚相认。','两座灯塔交换了节拍，船终于不必在回家和远行之间做选择。'],
 ['失真的机器情书','收集两种电子语言修复来信','磁带水母截到一封破碎的机器情书：一半是舞池节奏，一半是合成器口哨。','电报最后一个缺字被补上。收信人不是某台机器，而是整座城市。'],
 ['雨巷里的反拍信号','寻找两种低频风景','灯蛾的旧雨衣开始播放陌生的节拍。渡船需要两种不同的低音，才知道该停在哪条雨巷。','反拍穿过雨帘，夜行人终于在空荡车站等到了渡船。'],
 ['花林的另一面','为月下花园收集两种旋律','云眠兔把一朵不会开放的花交给你。花瓣一半梦游，一半记得木吉他的温度。','水面响起两种歌声。花开时，整座花园像一张慢慢旋转的唱片。'],
 ['没有结束的彩排','用两种摇滚回应黑石舞台','吉他蜥把试音留在山壁上。你必须找到两种摇滚，告诉剧场安静也可以是力量。','失真的弦与漫长和弦终于彼此听见，彩排成了一场真正的演出。'],
 ['冰层下的室内乐','收集两种宁静频率','海豹听见冰层里有一支看不见的乐队。有人弹着琴，有人只是轻轻呼吸。','极简音型与环境声叠在一起，冰层第一次有了完整的春天。'],
];
const finalTales=[
 ['三张唱片的归航','用三张不同专辑拼出归航歌单','最后一艘船缺了一张航海图。偷拍鸦认为，三张唱片上的记忆足够指明方向。','码头的三盏灯亮起，唱片袋变成了小小的海图。'],
 ['零号城市的日出','从三张专辑采集城市电流','晶洞里的城市只有午夜，没有黎明。水母想借三台唱机的电流，重新启动太阳。','电子日出缓慢上升，第零频道第一次播出了早安。'],
 ['摆渡人的最后一班','从三张专辑找回渡船航线','灯蛾每晚送陌生人回家，却遗忘了自己的岸。它请你拼好最后一班船的歌单。','最后一首歌结束时，灯蛾认出了岸上的那盏旧灯。'],
 ['留给未来的湖心信','把三张专辑封进湖心时间胶囊','云眠兔想把一个尚未醒来的梦寄给十年后的旅人。它缺少三个不同的声音。','时间胶囊沉入水面，第二个月亮把信带向了未来。'],
 ['给寂静的一次安可','以三张专辑完成火山巡演','吉他蜥想为那些没有来到现场的人演出。山谷需要三张唱片，才肯把回声送得更远。','巡演最后一站没有观众，却有整片旷野轻轻跟唱。'],
 ['星鲸经过的九十九秒','用三张专辑点亮极地天线','极光海豹预测星鲸将在午夜经过。它需要三张唱片，来证明寂静里仍有回信。','天线发出蓝色光束，星鲸在九十九秒里把整个海洋照亮。'],
];
const regionGenres=[['JAZZ','SOUL','JAZZ HOP','FUNK','WORLD'],['ELECTRONIC','IDM','BREAKBEAT','SYNTH POP'],['TRIP-HOP','DOWNTEMPO','DUBSTEP','REGGAE'],['DREAM POP','ART POP','SHOEGAZE','FOLK','INDIE FOLK'],['ALT ROCK','PROG ROCK','METAL'],['AMBIENT','IDM','CLASSICAL']];
const bonusTales=[
 ['节拍夜市的找零','替夜市收集两种律动','港口的唱片蟹把零钱换成节拍。偷拍鸦带你逛圆形夜市：每个摊位都欠下一种不同的律动。','夜市合上最后一张票根，两种律动一起成为回家的零钱。','夜市俯瞰 / 彩色票根'],
 ['走出八位迷宫','用两种电子声音唤醒街机','磁带水母跌进一台旧街机。柠檬色阶梯和紫色传送门总在循环，只有两种不同的电子声音能改写出口。','第八次闪光不是游戏结束，而是水母为你打开的第一个新关卡。','八位街机 / 柠绿紫像素'],
 ['钟楼里借来的时间','寻找两种低频修好钟表','灯蛾摆渡人发现钟楼收藏了六枚停止的时刻。借来两种低频，才能把被遗忘的分钟交还夜行人。','钟声落下，六枚时刻各自回到主人的口袋。你得到一张写着明天的车票。','六枚椭圆 / 铜版钟表'],
 ['唱给茶杯的小小歌','用两种旋律招待茶会','云眠兔把邀请函折成礼物签。茶杯里有一场纸偶音乐会，每位小客人想听一种不同的温柔声音。','最后一口茶喝完时，纸偶们把歌叠成纸船，送进了远方的雨。','剪纸茶会 / 五张礼物签'],
 ['矿车上的最后一拍','用两种摇滚完成矿道追逐','余烬吉他蜥追着一枚滚落的拨片跳上矿车。轨道像折断的五线谱，沿途需要两种摇滚节拍才能转弯。','拨片停在终点，矿车的轰鸣变成乐队的鼓点。没有谁再害怕下一个弯道。','斜线追逐 / 版画橙黑'],
 ['极地观星员的唱针','给观测站送来两种宁静声音','极光海豹发现观测站的星盘不再转动。它将唱针接上天线，请你带来两种宁静声音，把星星排回轨道。','星盘重新旋转，海豹在观测本上盖下邮戳：今天，海洋和星空同时来信。','星盘透视 / 极夜靛蓝'],
];
export const tales=[...firstTales.map((t,i)=>({...t,name:creatures[i].name,story:t.story.replace(/偷拍鸦|电波鸦|雾行鸦|梦游鸦|裂响鸦|静音鸦/g,creatures[i].name),id:i,region:i,episode:0,target:1,kind:'tracks',xp:150,art:'/assets/v6-'+creatures[i].art+'.png'})),...secondTales.map(([title,quest,story,ending],i)=>({id:i+6,region:i,episode:1,name:creatures[i].name,title,quest,story,ending,genres:regionGenres[i],target:2,kind:'genres',xp:220,art:'/assets/v6-'+creatures[i].art+'.png'})),...finalTales.map(([title,quest,story,ending],i)=>({id:i+12,region:i,episode:2,name:creatures[i].name,title,quest,story,ending,genres:regionGenres[i],target:3,kind:'albums',xp:300,art:'/assets/v6-'+creatures[i].art+'.png'})),...bonusTales.map(([title,quest,story,ending,style],i)=>({id:i+18,region:i,episode:3,name:creatures[i].name,title,quest,story,ending,style,genres:regionGenres[i],target:2,kind:'genres',xp:240,art:'/assets/v8-comic-'+creatures[i].art+'-4.png'}))];
for(const tale of tales){if(tale.episode===1)tale.art='/assets/v8-comic-'+creatures[tale.region].art+'-2.png';else if(tale.episode===2)tale.art='/assets/v6-'+creatures[tale.region].art+'-3.png';tale.ending=tale.ending.replace(/偷拍鸦|电波鸦|雾行鸦|梦游鸦|裂响鸦|静音鸦/g,creatures[tale.region].name);}
export const journalFor=s=>s.journal||{battles:{},quests:{},comics:[]};
export function strike(s,region,move){
 if(!Number.isInteger(region)||region<0||region>=s.frontier||region>=6||!['echo','guard'].includes(move))return s;
 const journal=journalFor(s),creature=creatures[region],old=journal.battles[region]||{hp:60,enemy:creature.hp,turn:0,won:false,log:'小怪兽发出挑战：用节拍回应我！'};
 if(old.won||old.hp<=0)return s;
 const damage=move==='guard'?8:16+Math.min(s.equipment||1,8)*2+equipped(s,'weapon').attack;
 const enemy=Math.max(0,old.enemy-damage),won=enemy===0;
 const hit=Math.max(1,(move==='guard'?3:creature.hit)-equipped(s,'shield').guard);
 const hp=won?old.hp:Math.max(0,old.hp-hit);
 const battle={hp,enemy,won,turn:old.turn+1,log:won?'旋律共鸣！小怪兽停下挑战，愿意讲出它的故事。':hp===0?'你的节拍暂时散了。整装后可以重新挑战。':`回声造成 ${damage} 点共鸣，小怪兽反击 ${hit} 点。`};
 return {...s,xp:s.xp+(won?90:0),journal:{...journal,battles:{...journal.battles,[region]:battle}}};
}
export function retryBattle(s,region){const j=journalFor(s);if(!creatures[region]||j.battles[region]?.hp!==0)return s;return {...s,journal:{...j,battles:{...j.battles,[region]:{hp:60,enemy:creatures[region].hp,turn:0,won:false,log:'重新调音，准备再次交战。'}}}};}
export function canAccept(s,id){const j=journalFor(s),t=tales[id];return !!t&&t.region<s.frontier&&!!j.battles[t.region]?.won&&!j.quests[id]&&(t.episode===0||j.quests[id-6]?.status==='claimed');}
export function acceptTale(s,id){const j=journalFor(s);if(!canAccept(s,id))return s;return {...s,journal:{...j,quests:{...j.quests,[id]:{status:'active',track:null,heard:[]}}}};}
export function taleProgress(t,q){const heard=q?.heard|| (q?.track?[q.track]:[]);return t.kind==='genres'?new Set(heard.map(x=>x.genre)).size:t.kind==='albums'?new Set(heard.filter(x=>x.albumCode).map(x=>x.albumCode)).size:heard.length;}
export function hearTale(s,track){
 const j=journalFor(s);let changed=false;const quests={...j.quests};
 for(const [id,q] of Object.entries(quests)){const tale=tales[id];if(q.status==='active'&&tale?.genres.includes(track.genre)){const prior=q.heard||[];if(prior.some(t=>t.id===track.id))continue;const item={title:track.title,id:track.id,genre:track.genre,albumCode:track.albumCode};const next={...q,heard:[...prior,item],track:item};quests[id]={...next,status:taleProgress(tale,next)>=tale.target?'ready':'active'};changed=true;}}
 return changed?{...s,journal:{...j,quests}}:s;
}
export function claimTale(s,id){const j=journalFor(s),q=j.quests[id],t=tales[id];if(!t||q?.status!=='ready')return s;const next={...s,xp:s.xp+t.xp,journal:{...j,quests:{...j.quests,[id]:{...q,status:'claimed'}},comics:[...new Set([...j.comics,id])]}};return grantLoot(next,{item:t.episode===2?creatures[t.region].gift:null,shards:t.episode+1});}
