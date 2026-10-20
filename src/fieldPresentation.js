import {starterGear,rewardTiers,equipped,lootFor} from './equipment.js';
import {creatures} from './encounters.js';
export const companions=[
 {name:'留声猫',role:'港口唱片修复师',region:0,art:'harbor',bio:'把旧唱片的沙沙声叫作海风。随身带着小号，总能听出被藏起来的那一拍。',lines:['先听它的翅膀，拍子会告诉你什么时候回应。','两座灯塔并不需要唱同一首歌。','把三张唱片放进袋子，回家的航线就有了。','夜市里，最好的找零是一段好律动。']},
 {name:'电路狐',role:'第零频道工程师',region:1,art:'crystal',bio:'用耳机寻找晶洞里的失真，喜欢把小小的错误焊成新的合成器音色。',lines:['重复不是卡住了，留意下一次循环的变化。','一封机器情书，也需要两种表达。','黎明的开关藏在第三张唱片里。','迷宫不只一种出口，试试另一种电子语言。']},
 {name:'旧钟浣熊',role:'雨巷声音信使',region:2,art:'mist',bio:'雨衣口袋里有一台磁带机和一只慢半拍的怀表，替夜行人递送没有地址的回声。',lines:['不要急，低音会先到岸边。','听人声离你有多近，回声又有多远。','有时最后一班船，才会送摆渡人回家。','借来的分钟，记得还给明天。']},
 {name:'花房鹿',role:'月下旋律园丁',region:3,art:'dream',bio:'在温室里记录花开的声音。角上挂着风铃，笔记本里夹满了还没有醒来的旋律。',lines:['不用把每一个词听清，先听见它的颜色。','花瓣的两面，记得不同的声音。','把今天喜欢的声音，寄给未来。','茶会的客人，会喜欢不一样的温柔。']},
 {name:'鼓点獾',role:'黑石剧场鼓手',region:4,art:'volcano',bio:'把军鼓当旅行箱，随时准备给陌生人打一个稳稳的起拍。相信安静也能很有力量。',lines:['听准落点，再让回声出发。','强烈与温柔，也可以一起彩排。','即使没有观众，旷野仍然会听。','转弯前，先找到下一拍。']},
 {name:'雪邮企鹅',role:'极地回信保管员',region:5,art:'glacier',bio:'带着小铃与邮袋巡游冰川，替海洋保管来自星空的回信。走得慢，却从不误点。',lines:['余韵结束以后，也听一听房间。','没有强烈鼓点，也能听见前进。','九十九秒足够让一束光找到你。','今天，海洋与星空同时来信。']},
];
export const portraitStates=['idle','attack','hurt','low','defeated'];
export const portraitLabels={idle:'待机',attack:'攻击',hurt:'受击',low:'低体力',defeated:'落败'};
export function portraitStyle(region,role='monster',state='idle'){
 const i=portraitStates.indexOf(state);return {backgroundImage:`url("/assets/v16-battle-${companions[region]?.art||'harbor'}.png")`,backgroundSize:'500% 200%',backgroundPosition:`${Math.max(0,i)*25}% ${role==='companion'?100:0}%`};
}
export function battlePortraits(battle,creature,phase='idle'){
 const enemy=battle?.enemy??creature.hp,hp=battle?.hp??60;
 return {monster:battle?.won||enemy===0?'defeated':phase==='hit'?'hurt':phase==='counter'?'attack':enemy<=creature.hp*.3?'low':'idle',companion:hp===0?'defeated':phase==='hit'?'attack':phase==='counter'&&!battle?.won?'hurt':hp<=18?'low':'idle'};
}
const originByPixel=[
 '港口铁匠把第一声回响锻入剑脊，细小的音符沿着银色剑刃环绕。','芦苇河岸的旅人把短笛藏入剑柄，挥动时仿佛有风经过。','晶洞电台校准频率时留下的音叉，蓝色棱面保存着纯净的共振。','黑石剧场最后一束灯光凝成剑锋，为每一次安可留下温度。','航海者口耳相传的星海之剑，剑格像展开的群星航线。','林间工匠用旅行木箱与琴弦制成，把漫长路程弹成短歌。','晶洞与竹林交换声音后诞生的笛杖，翠色节间留着风的频率。','月光落进摆渡人的弦，凝成一枚能切开迷雾的紫色月牙。',
 '旧码头淘来的黑胶唱片，铜边包住唱纹，也留住了第一段港口记忆。','低频工坊铸造的厚重盾牌，像一段安稳的贝斯线托住节拍。','花房园丁拓下叶脉的纹路，把第一个春天留在轻盾上。','旧电台废弃的磁带匣重装为护盾，倒带声接住旅途中的杂音。','晶原匠人将六角折光面拼成护盾，每一面都映着不同的天空。','剧场的落日与火山铜矿，被镶进一块仍然温暖的圆盾。','灯蛾把夜航时见过的星点印在翼盾上，为回家的人遮住风。','极地灯塔的轮廓被铸成护盾，守住那些很远才寄来的回信。',
 '出发时系上的朴素旅人斗篷，针脚里没有魔法，只有上路的勇气。','留声罗盘不追逐北方，而会转向你还没认真听过的声音。','极光海豹保管的灯笼，以微小的冰晶保存星空的回信。','琥珀色长围巾来自港口的针织铺，适合把晚风也裹进衣领。','梦境浅滩的青绿披肩，腰带的结像一朵小小的浪。','林间裁缝用苔绿色布料缝成兜帽，轻轻罩住雨天的耳朵。','雨巷信使留下的长斗篷，紫灰的折边藏着一段安静的回声。','花房鹿将春信缎带缝进披风，让下一首歌带来新的颜色。',
];
export function equipmentNote(item){
 const tiers=rewardTiers.filter(t=>t.pool.includes(item.id));
 const quest=creatures.find(c=>c.gift===item.id);
 const origin=starterGear.includes(item.id)?'初始行囊 · 已拥有':[...tiers.map(t=>`${t.name}（${t.min}${Number.isFinite(t.max)?'–'+t.max:'+'} XP）`),...(quest?[quest.name+'支线终章']:[])].join(' / ');
 return {story:originByPixel[item.pixel]||'来自声之旷野的旅途信物。',origin,effect:item.slot==='weapon'?`回声斩共鸣 +${item.attack}`:item.slot==='shield'?`每次受击减伤 ${item.guard}`:item.bonus?`基础聆听与查阅经验 +${Math.round(item.bonus*100)}%`:'像素穿搭 · 无经验加成'};
}
export function settlementLedger(state,reward){
 const r=state.claimed?(state.receipt||{}):reward;
 const listen=r.listen||0,browse=r.browse||0,discovery=r.discovery||0,bonus=r.bonus||0,total=r.total||0;
 const tracks=state.claimed?(r.tracks??listen/120):state.listened.length,cds=state.claimed?(r.cds??browse/30):state.viewed.length;
 return {total,rows:[{id:'listen',name:'真实聆听',formula:`${tracks} 首 × 120`,value:listen},{id:'browse',name:'查阅唱片',formula:`${cds} 张 × 30`,value:browse},{id:'discovery',name:'新流派发现',formula:`${discovery/180} 种 × 180`,value:discovery},{id:'bonus',name:'装备回馈',formula:state.claimed?'按结算时装备记账':`⌊(${listen} + ${browse}) × ${Math.round(equipped(state,'charm').bonus*100)}%⌋`,value:bonus}],loot:state.claimed?r.loot:total?lootFor(state,total):null};
}
export function cardTreatment(type){return {album:{name:'唱片藏品',en:'THE RECORD OBJECT',paper:0,ink:'#efe4c9',muted:'#b5c4bb'},artist:{name:'音乐家档案',en:'THE CREATOR DOSSIER',paper:1,ink:'#263a32',muted:'#5c6e5c'},concept:{name:'听觉观察札记',en:'THE LISTENING FIELDNOTE',paper:2,ink:'#21394f',muted:'#506e7c'}}[type]||cardTreatment('concept');}
export const cardPrints=['/assets/v16-card-prints-a.png','/assets/v16-card-prints-b.png'];
export function cardPrintFor(type){const t=cardTreatment(type);return {path:cardPrints[t.paper===2?1:0],cell:t.paper===1?1:0,...t};}
