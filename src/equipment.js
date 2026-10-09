export const gear=[
 {id:'echo-blade',name:'回声之刃',slot:'weapon',art:0,rarity:'基础',attack:2,description:'回声斩共鸣 +2，陪你开启第一段航线。'},
 {id:'record-shield',name:'唱片圆盾',slot:'shield',art:1,rarity:'基础',guard:1,description:'每次受击减少 1 点，刻有港口的唱片纹路。'},
 {id:'wander-cloak',name:'旅人斗篷',slot:'charm',art:2,rarity:'基础',bonus:0,description:'轻装启程。每日收获中可能转化为强化碎片。'},
 {id:'reed-blade',name:'芦笛短剑',slot:'weapon',art:0,rarity:'精良',attack:5,description:'回声斩共鸣 +5，剑柄会随旋律轻轻振动。'},
 {id:'crystal-fork',name:'水晶音叉',slot:'weapon',art:3,rarity:'稀有',attack:8,description:'回声斩共鸣 +8，以晶洞频率击散噪声。'},
 {id:'bass-shield',name:'低频壁垒',slot:'shield',art:1,rarity:'稀有',guard:4,description:'每次受击减少 4 点，适合稳健交战。'},
 {id:'gold-compass',name:'留声罗盘',slot:'charm',art:4,rarity:'史诗',bonus:.08,description:'每日基础聆听与查阅经验额外 +8%。'},
 {id:'ember-blade',name:'余烬安可',slot:'weapon',art:0,rarity:'史诗',attack:13,description:'回声斩共鸣 +13，火山剧场赠予旅人的安可。'},
 {id:'glacier-lantern',name:'极光灯笼',slot:'charm',art:5,rarity:'传奇',bonus:.15,description:'每日基础聆听与查阅经验额外 +15%。'},
 {id:'star-blade',name:'星海共鸣剑',slot:'weapon',art:0,rarity:'传奇',attack:20,description:'回声斩共鸣 +20，传说中通往海洋边界的剑。'},
];
gear.push(
 {id:'wood-lute',name:'旅歌木琴',slot:'weapon',rarity:'基础',attack:3,description:'回声斩共鸣 +3，适合把旅途弹成一首歌。'},
 {id:'bamboo-staff',name:'翠竹笛杖',slot:'weapon',rarity:'稀有',attack:9,description:'回声斩共鸣 +9，晶洞与竹林共同调出的频率。'},
 {id:'moon-sickle',name:'月弦镰',slot:'weapon',rarity:'史诗',attack:15,description:'回声斩共鸣 +15，切开迷雾的紫色月牙。'},
 {id:'leaf-shield',name:'叶脉轻盾',slot:'shield',rarity:'基础',guard:2,description:'每次受击减少 2 点，叶脉记录着第一个春天。'},
 {id:'cassette-buckler',name:'磁带方盾',slot:'shield',rarity:'精良',guard:2,description:'每次受击减少 2 点，倒带声会接住细碎噪音。'},
 {id:'prism-shield',name:'棱晶护盾',slot:'shield',rarity:'稀有',guard:5,description:'每次受击减少 5 点，六角晶体折射回声。'},
 {id:'sun-shield',name:'落日剧场盾',slot:'shield',rarity:'史诗',guard:6,description:'每次受击减少 6 点，留下火山舞台的最后一束光。'},
 {id:'moth-shield',name:'夜蛾翼盾',slot:'shield',rarity:'史诗',guard:7,description:'每次受击减少 7 点，夜色也能成为护甲。'},
 {id:'lighthouse-shield',name:'极地灯塔盾',slot:'shield',rarity:'传奇',guard:9,description:'每次受击减少 9 点，让灯塔挡住远海的风。'},
 {id:'amber-scarf',name:'琥珀长围巾',slot:'charm',rarity:'基础',bonus:0,description:'琥珀色围巾与胸襟，暖色像素穿搭，无额外经验加成。'},
 {id:'tide-sash',name:'潮汐披肩',slot:'charm',rarity:'基础',bonus:0,description:'青绿色短披风与腰带，轻盈航海穿搭，无额外经验加成。'},
 {id:'moss-cloak',name:'苔原兜帽',slot:'charm',rarity:'基础',bonus:0,description:'苔绿色兜帽披风，林间穿搭，无额外经验加成。'},
 {id:'noir-mantle',name:'夜航长斗篷',slot:'charm',rarity:'稀有',bonus:.04,description:'紫灰长斗篷，每日基础聆听与查阅经验 +4%。'},
 {id:'rose-cloak',name:'花信缎带披风',slot:'charm',rarity:'史诗',bonus:.10,description:'粉色缎带披风，每日基础聆听与查阅经验 +10%。'},
);
const pixelOrder=['echo-blade','reed-blade','crystal-fork','ember-blade','star-blade','wood-lute','bamboo-staff','moon-sickle','record-shield','bass-shield','leaf-shield','cassette-buckler','prism-shield','sun-shield','moth-shield','lighthouse-shield','wander-cloak','gold-compass','glacier-lantern','amber-scarf','tide-sash','moss-cloak','noir-mantle','rose-cloak'];
const looks={'wander-cloak':0,'amber-scarf':1,'tide-sash':2,'moss-cloak':3,'noir-mantle':4,'rose-cloak':5,'gold-compass':6,'glacier-lantern':7};
for(const item of gear){item.pixel=pixelOrder.indexOf(item.id);if(item.slot==='charm')item.look=looks[item.id];}
export const starterGear=['echo-blade','record-shield','wander-cloak','reed-blade','wood-lute','leaf-shield','cassette-buckler','amber-scarf','tide-sash','moss-cloak'];
export const slotNames={weapon:'武器',shield:'护具',charm:'旅途饰物'};
export function inventoryFor(s){const saved=s.inventory||{};return {...saved,owned:[...new Set([...starterGear,...(saved.owned||[])])],loadout:{weapon:'echo-blade',shield:'record-shield',charm:'wander-cloak',...saved.loadout},shards:saved.shards||0};}
export const equipped=(s,slot)=>{const i=inventoryFor(s);return gear.find(g=>g.id===i.loadout[slot]&&i.owned.includes(g.id))||gear.find(g=>g.id===inventoryFor({}).loadout[slot]);};
export function equip(s,id){const item=gear.find(g=>g.id===id),i=inventoryFor(s);if(!item||!i.owned.includes(id)||i.loadout[item.slot]===id)return s;return {...s,inventory:{...i,loadout:{...i.loadout,[item.slot]:id}}};}
export function forge(s){const i=inventoryFor(s);if(i.shards<6)return s;return {...s,equipment:(s.equipment||1)+1,inventory:{...i,shards:i.shards-6}};}
export const rewardTiers=[
 {id:'traveler',name:'旅人行囊',min:1,max:299,keys:1,upgrade:1,shards:1,pool:['reed-blade','wander-cloak'],art:'/assets/v6-harvest-traveler.png',story:'小小的声音也值得被记住。沿河扎营的旅人，拾起了一件新的旅途信物。'},
 {id:'explorer',name:'探险家宝匣',min:300,max:899,keys:1,upgrade:1,shards:3,pool:['crystal-fork','bass-shield'],art:'/assets/harvest-engraving.png',story:'旋律穿过青绿巨龙盘旋的山谷，古老宝匣回应了这次探索。'},
 {id:'navigator',name:'领航者遗珍',min:900,max:1799,keys:2,upgrade:2,shards:6,pool:['gold-compass','ember-blade'],art:'/assets/v6-harvest-navigator.png',story:'你听见了不同海域的脉搏。留声罗盘为远航者指明新的航线，并回应这次探索。'},
 {id:'legend',name:'传奇星海秘藏',min:1800,max:Infinity,keys:3,upgrade:3,shards:10,pool:['glacier-lantern','star-blade'],art:'/assets/v6-harvest-legend.png',story:'星鲸从寂静深海升起。它把极光与星辰的力量，交给听见世界边界的骑士。'},
];
export const tierFor=xp=>rewardTiers.find(t=>xp>=t.min&&xp<=t.max)||rewardTiers[0];
const expandedPools={explorer:['bamboo-staff','prism-shield','noir-mantle'],navigator:['moon-sickle','sun-shield','moth-shield','rose-cloak'],legend:['lighthouse-shield']};
for(const tier of rewardTiers)tier.pool.push(...(expandedPools[tier.id]||[]));
export function lootFor(s,xp){const tier=tierFor(xp),inventory=inventoryFor(s);const seed=Array.from(s.day||'').reduce((n,c)=>n+c.charCodeAt(0),0);const offset=seed%tier.pool.length;const pool=[...tier.pool.slice(offset),...tier.pool.slice(0,offset)];const item=pool.find(id=>!inventory.owned.includes(id));return {tier:tier.id,title:tier.name,art:tier.art,story:tier.story,keys:tier.keys,upgrade:tier.upgrade,shards:tier.shards+(item?0:4),item:item||null};}
export const pixelStyle=index=>({backgroundPosition:`${index%4*100/3}% ${Math.floor(index/4)*20}%`});
export function avatarSpec(s){const weapon=equipped(s,'weapon'),shield=equipped(s,'shield'),charm=equipped(s,'charm');return {outfit:charm.look,weapon:weapon.pixel,shield:shield.pixel,names:[weapon.name,shield.name,charm.name],signature:[weapon.id,shield.id,charm.id].join('/')};}
export function grantLoot(s,loot){const i=inventoryFor(s);return {...s,inventory:{...i,owned:[...new Set([...i.owned,...(loot.item?[loot.item]:[])])],shards:i.shards+loot.shards}};}
