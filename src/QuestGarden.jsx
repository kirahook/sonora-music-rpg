import {useState} from 'react';
import {quests} from './gameplay';

export function QuestGarden({game}){
 const [selected,setSelected]=useState('first'),[paused,setPaused]=useState(false),[arranged,setArranged]=useState(false);
 function point(e){const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty('--rx',`${(e.clientX-r.left-r.width/2)/r.width*8}deg`);e.currentTarget.style.setProperty('--ry',`${-(e.clientY-r.top-r.height/2)/r.height*8}deg`);}
 function reset(e){e.currentTarget.style.setProperty('--rx','0deg');e.currentTarget.style.setProperty('--ry','0deg');}
 const active=quests.find(q=>q.id===selected),progress=Math.min(active.measure(game),active.target),claimed=game.claimed.includes(selected);
 return <div className={'quest-garden '+(paused?'garden-paused ':'')+(arranged?'garden-arranged':'')} aria-label="每日声音花园">
  <div className="garden-toolbar"><span>SOUND GARDEN / 每日声音花园</span><div><button onClick={()=>setArranged(v=>!v)} aria-label="重新排列花园卡片">换个排列</button><button aria-pressed={paused} onClick={()=>setPaused(v=>!v)}>{paused?'恢复漂浮':'暂停漂浮'}</button></div></div>
  <div className="garden-stage"><img className="garden-pot" src="/assets/v7-garden-pot.png" alt="深绿色花盆与舒展的枝叶"/>
   {quests.map((q,i)=>{const count=Math.min(q.measure(game),q.target),done=game.claimed.includes(q.id),ready=count===q.target;return <div key={q.id} className={'flower-anchor flower-'+i}>
    <button className={'flower-window '+(selected===q.id?'selected ':'')+(ready?'bloom ':'')+(done?'harvested':'')} aria-label={`花园卡片：${q.title}，${done?'已领取':ready?'可领取':count+'/'+q.target}`} aria-pressed={selected===q.id} onPointerMove={point} onPointerLeave={reset} onClick={()=>setSelected(q.id)}>
     <span className="window-dots" aria-hidden="true"><i/><i/><i/></span><span className="pixel-flower" aria-hidden="true" style={{backgroundPosition:`${i*50}% 50%`}}/>
     <span className="flower-label">{['LETTER_01','FREQUENCY_02','ISLAND_03'][i]}<small>{done?'已归藏':ready?'等待采集':count+'/'+q.target+' 正在生长'}</small></span>
    </button>
   </div>;})}
  </div>
  <div className="garden-caption" aria-live="polite"><div><strong>{active.title}</strong><span>{claimed?'这株声音已经开花，奖励已领取。':progress===active.target?'声音花已盛开，去领取今日奖励。':active.description+'，让这株像素花慢慢开放。'}</span></div><button onClick={()=>document.getElementById('quest-'+selected)?.scrollIntoView({behavior:'smooth',block:'nearest'})}>查看任务 ↓</button></div>
 </div>;
}
