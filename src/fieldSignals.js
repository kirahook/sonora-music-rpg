// Fictional, page-local play. Never receives or mutates RPG progress.
export const signalCharts=[
 {mail:'BRASS HARBOR POST',signals:[['码头汽笛',3,'汽笛把远方，折成一小段铜色的风。','第一声给港口，第二声给船，第三声留给不赶时间的人。'],['留声小巷',8,'旧唱针转过的地方，晚风也有了年轮。','修复师没有擦掉所有沙沙声。她说，唱片也需要记得自己走过的路。'],['夜市脚步',13,'人群的脚步，替归航写下最后一拍。','没有两双鞋踩在同一秒，但整条街仍然一起向夜色走去。']]},
 {mail:'CRYSTAL SIGNAL POST',signals:[['晶洞脉冲',5,'一枚微小脉冲，把山谷接成了星图。','工程师把漏掉的一拍留了下来，新的节奏正好从那个缺口经过。'],['零号天线',11,'天线没有说话，却收到了云的回信。','第零频道只收想象中的讯号。每一次重复，都允许一点不同。'],['合成器桥',2,'走过会发光的桥，鞋底也留下一点电流。','桥上的每块石头有自己的音色，慢一点，才不会把它们听成同一种声音。']]},
 {mail:'MIDNIGHT FERRY POST',signals:[['磁带雨棚',7,'雨滴落在磁带壳上，替旧故事轻轻倒带。','信使把空白的一面留给今晚，雨声却早一步写满了它。'],['雾中渡口',12,'低音先到岸边，渡船才慢慢出现。','摆渡人不看时刻表。他等水面第一次向桥下回声回应。'],['旧钟水巷',4,'慢半拍的钟，把匆忙留在了昨天。','怀表少走的一秒，没有丢失，只是在等另一位夜行人。']]},
 {mail:'MOON GARDEN POST',signals:[['花瓣轻响',2,'花瓣落下的时候，月光没有惊醒。','园丁把听不见的响声夹进书页。来年，书里会先开一朵花。'],['湖心回声',9,'水面替一句没说完的话，留了倒影。','第二个月亮从不解释歌词，它只把声部一层层铺在湖上。'],['风铃温室',14,'风铃把晚风，分成了三种温柔。','花房鹿没有给铃声取名字。每一位路过的人，都可以带走自己的答案。']]},
 {mail:'EMBER STAGE POST',signals:[['黑石试音',6,'山壁留住的不是音量，是下一次出发。','鼓手先敲了一下空舞台。回声回答以后，整座剧场才真正亮起来。'],['山谷安可',1,'没有观众的安可，也值得认真落下。','最后一盏灯还没有熄灭。吉他蜥相信，远方总有人正在听。'],['鼓点矿道',10,'转弯以前，先让鼓点替你探一小段路。','矿车沿旧节拍前进，停顿不是结束，只是给下一个强拍让出位置。']]},
 {mail:'POLAR LETTER POST',signals:[['冰层微声',12,'冰层里的轻响，让寂静有了纹理。','守望者把一百种安静写进观测本，却每天仍能发现第一百零一种。'],['灯塔长音',4,'一束长长的灯光，把夜色慢慢调亮。','灯塔没有催信。它知道有些回声，需要走过一整个海洋。'],['雪邮小站',9,'回信很慢，但星星从来没有忘记地址。','企鹅把空信封放在窗前。天亮时，里面多了一小片会融化的极光。']]},
];
// Each set follows the actual miniature landmarks, not a shared postcard template.
export const signalPositions=[
 [[22,64],[54,34],[82,53]],
 [[25,59],[54,35],[82,63]],
 [[22,52],[54,47],[82,43]],
 [[26,46],[53,29],[81,46]],
 [[22,45],[53,29],[81,54]],
 [[26,54],[54,28],[82,58]],
];
export const signalMoods=[{id:'slow',label:'慢慢寄出',opening:'不赶路的今天，我收到了三段回声。'},{id:'bright',label:'寄向晴天',opening:'把今天的光，分一点给下一程。'},{id:'night',label:'留给夜晚',opening:'夜色还没有结束，回信已经在路上。'}];
export const signalArt=region=>({backgroundImage:'url("/assets/v21-field-relief-scenes.png")',backgroundSize:'200% 300%',backgroundPosition:`${region%2*100}% ${Math.floor(region/2)*50}%`});
export const signalFrequency=dial=>((880+Math.max(0,Math.min(15,Math.round(Number(dial)||0)))*13)/10).toFixed(1);
export const newSignalSession=()=>({active:0,dial:0,found:[],composed:false,back:false,order:[0,1,2],mood:'slow',notice:''});
export function signalSessionReducer(session,action){
 const s=session||newSignalSession(),chart=signalCharts[action.region];if(!chart)return s;
 if(action.type==='select'&&Number.isInteger(action.index)&&action.index>=0&&action.index<3)return {...s,active:action.index,notice:''};
 if(action.type==='tune'&&Number.isFinite(action.value))return {...s,dial:Math.max(0,Math.min(15,Math.round(action.value)))};
 if(action.type==='capture'){
  if(s.found.includes(s.active)||s.dial!==chart.signals[s.active][1])return s;
  const found=[...s.found,s.active];return {...s,found,notice:`已拾得「${chart.signals[s.active][0]}」 · ${found.length} / 3`};
 }
 if(action.type==='compose'&&s.found.length===3)return {...s,composed:true,back:false,notice:'三段回声，已经拼成一张旅途明信片。'};
 if(action.type==='flip'&&s.composed)return {...s,back:!s.back};
 if(action.type==='reorder'&&s.composed)return {...s,order:[...s.order.slice(1),s.order[0]]};
 if(action.type==='mood'&&signalMoods.some(m=>m.id===action.value))return {...s,mood:action.value};
 if(action.type==='reset')return newSignalSession();
 return s;
}
export function signalPostcard(region,session){
 const chart=signalCharts[region];if(!chart||!session.composed||session.found.length!==3)return null;
 const mood=signalMoods.find(m=>m.id===session.mood)||signalMoods[0];
 return {mail:chart.mail,opening:mood.opening,lines:session.order.map(i=>chart.signals[i][2]),notes:session.order.map(i=>({name:chart.signals[i][0],frequency:signalFrequency(chart.signals[i][1]),body:chart.signals[i][3]}))};
}
