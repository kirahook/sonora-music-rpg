import {useState} from 'react';
import {BattleScene} from './BattleEncounter.jsx';
import {companions,equipmentNote} from './fieldPresentation.js';
import {portraitLabels} from './fieldPresentation.js';
import {regionAtlas,cityArt} from './regionAtlas.js';
import {FlashDeck} from './RegionExplorer.jsx';
import {SettlementPanel} from './SettlementPanel.jsx';
import {rewards} from './progression.js';
import {lootFor,rewardTiers,gear} from './equipment.js';
import {GearArt} from './Armory.jsx';
import {tales} from './encounters.js';

export function GuideGear(){
 const [choice,setChoice]=useState(0),items=['echo-blade','reed-blade','wood-lute'].map(id=>gear.find(g=>g.id===id)),item=items[choice],note=equipmentNote(item);
 return <div className="guide-feature-demo"><p className="guide-demo-title">WEAR A SOUND. CARRY A STORY.</p><div className="guide-demo-controls">{items.map((g,i)=><button key={g.id} aria-pressed={choice===i} onClick={()=>setChoice(i)}><GearArt item={g}/>{g.name}</button>)}</div><div className="guide-gear-note"><strong>{note.effect}</strong><p>{note.story}</p><small>来源 · {note.origin}</small></div><p className="guide-demo-note">这里只查看样例，不改变实际穿搭。正式装备栏会同步更新首页角色与 CRT。</p></div>;
}

export function GuideBattle(){
 const [region,setRegion]=useState(0),[pose,setPose]=useState(0);
 const poses=[['idle','idle','相遇'],['hurt','attack','演示回声斩'],['attack','hurt','演示反击'],['low','low','低体力'],['defeated','idle','共鸣成功'],['idle','defeated','挑战失利']];
 const [monster,companion,label]=poses[pose];
 return <div className="guide-feature-demo guide-battle-preview"><p className="guide-demo-title">MEET. RESONATE. REMEMBER.</p><p className="guide-companion-label">六位同行伙伴，六片专属场景。此处只演示画像，不会交战或增加经验。</p><div className="guide-demo-controls" aria-label="演示海域伙伴">{companions.map((c,i)=><button key={c.name} aria-pressed={region===i} onClick={()=>{setRegion(i);setPose(0);}}>{c.name}</button>)}</div><div key={region+'-'+pose} className={'guide-demo-combat phase-'+(pose===1?'hit':pose===2?'counter':'idle')}><BattleScene region={region} monster={monster} companion={companion} caption={label+' / '+portraitLabels[companion]+' · 仅为引导演示'}>{pose===1&&<div className="battle-weapon-motion" aria-hidden="true"><GearArt item={gear[0]}/></div>}</BattleScene></div><div className="guide-demo-controls" aria-label="演示战斗状态">{poses.map((p,i)=><button key={p[2]} aria-pressed={pose===i} onClick={()=>setPose(i)}>{p[2]}</button>)}</div><div className="guide-comic-legend"><img src={tales[region].art} alt="已收藏漫画的彩色美术示例"/><p>正式对战中，画像跟随真实共鸣与体力变化。已收藏漫画呈现完整色彩、收藏印记和微光；未收藏则以灰阶预览保留探索感。失败可重新调音，胜利奖励只记首次。</p></div></div>;
}

export function GuideWorld(){
 const [revealed,setRevealed]=useState(false),[cards,setCards]=useState(false),[node,setNode]=useState(0),[notice,setNotice]=useState('');
 const atlas=regionAtlas[0],selected=atlas.nodes[node];
 return <div className="guide-feature-demo guide-atlas-preview"><p className="guide-demo-title">A CITY BEHIND EVERY SOUND.</p><div className="guide-demo-controls"><button aria-pressed={revealed} onClick={()=>setRevealed(v=>!v)}>{revealed?'迷雾已散开 · 重看':'演示驱散迷雾'}</button>{revealed&&<button aria-pressed={cards} onClick={()=>setCards(v=>!v)}>{cards?'返回像素城市':'翻开知识闪卡'}</button>}</div>{revealed?(cards?<FlashDeck region={0} onAlbum={a=>setNotice('演示选中 '+a.title+' · 未装载、未播放、未记查阅')}/>:<><div className="atlas-city"><div className="atlas-city-image" style={cityArt(0)} role="img" aria-label="蓝调港湾像素城市演示"/>{atlas.nodes.map((n,i)=><button key={n.id} className={'atlas-landmark '+(node===i?'selected':'')} style={{left:n.x+'%',top:n.y+'%'}} aria-pressed={node===i} onClick={()=>setNode(i)} aria-label={'引导地标 '+n.place}><b>0{i+1}</b><span>{n.place}</span></button>)}</div><div className="atlas-node-copy" aria-live="polite"><span className="atlas-date">{selected.date}</span><h3>{selected.title}</h3><p>{selected.body}</p></div></>):<p className="guide-demo-note">正式解锁后，再点海域图钉进入二级像素城市：四个历史地标、一条发展路线，以及专辑、音乐家、听觉词条三种知识卡。这里只使用第一片已知海域作示例。</p>}<p className="guide-demo-note" role="status">{notice||'演示不消耗你的探索钥匙；地标、翻卡和材质演示不发放奖励。'}</p></div>;
}

export function GuideSettlement(){
 const [choice,setChoice]=useState(0),[calculated,setCalculated]=useState(false),[boost,setBoost]=useState(false);
 const counts=[1,3,8,15],count=counts[choice];
 const s={day:'演示清单',xp:0,equipment:1,frontier:3,keys:0,knownGenres:['JAZZ'],viewed:['sample-view'],listened:Array.from({length:count},(_,i)=>({id:'sample-'+i,title:'引导演示曲目 '+(i+1),genre:'JAZZ'}))};
 if(boost)s.inventory={owned:['gold-compass'],loadout:{charm:'gold-compass'},shards:0};
 const reward=rewards(s),loot=lootFor(s,reward.total),receipt={...reward,loot,tracks:count,cds:1,equipment:1+loot.upgrade};
 return <div className="guide-feature-demo guide-calculation-preview"><p className="guide-demo-title">COUNT THE SOUNDS. KEEP THE STORY.</p><p className="guide-demo-note">以下是明确标记的样例，不是你的真实收获。切换档位查看计算清单和不同奖励。</p><div className="guide-demo-controls">{rewardTiers.map((t,i)=><button key={t.id} aria-pressed={choice===i} onClick={()=>{setChoice(i);setCalculated(false);}}>{t.name}</button>)}<button aria-pressed={boost} onClick={()=>{setBoost(v=>!v);setCalculated(false);}}>演示饰物回馈 +8%</button></div><SettlementPanel demo state={{...s,claimed:calculated,receipt:calculated?receipt:null}} reward={reward} onClaim={()=>setCalculated(v=>!v)}/></div>;
}
