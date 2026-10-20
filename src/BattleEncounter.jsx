import {useEffect,useRef,useState} from 'react';
import {creatures,journalFor} from './encounters.js';
import {equipped} from './equipment.js';
import {regions} from './catalog.js';
import {companions,portraitLabels,battlePortraits} from './fieldPresentation.js';
import {portraitBodyStyle,battleSceneStyle,battleScenes} from './battleArt.js';
import {GearArt} from './Armory.jsx';
import {FieldProp} from './FieldMarks.jsx';
export function BattlePortrait({region,role='monster',state='idle',className=''}){return <span role="img" aria-label={`${role==='monster'?creatures[region].name:companions[region].name} · ${portraitLabels[state]}`} className={'battle-portrait '+className} data-state={state} style={portraitBodyStyle(region,role,state)}/>;}
export function BattleScene({region,monster='idle',companion='idle',children,caption}){return <div className="battle-stage"><span className="battle-scene-art" aria-hidden="true" style={battleSceneStyle(region)}/><div className="battle-scene-title"><small>{battleScenes[region].en}</small><span>{battleScenes[region].name}</span></div><div className="combatant enemy-combatant" data-facing="right"><span className="combatant-facing"><BattlePortrait region={region} state={monster}/></span><small>{monster==='defeated'?'已共鸣':portraitLabels[monster]}</small></div><div className="combatant ally-combatant" data-facing="left"><span className="combatant-facing"><BattlePortrait region={region} role="companion" state={companion}/></span><small>{companions[region].name} · 同行</small></div>{children}<div className="battle-stage-caption">{caption||'伙伴画像跟随骑士状态 · 原创海域场景'}</div></div>;}
export function CompanionRoster({region,frontier,onSelect}){return <div className="companion-index"><p className="eyebrow">SIX SIDE-STORY FRIENDS / 六位海域支线伙伴</p><div className="companion-roster" aria-label="支线伙伴图鉴">{companions.map(c=><button key={c.name} aria-label={'认识'+c.name} aria-pressed={region===c.region} onClick={()=>onSelect(c.region)} className={c.region>=frontier?'unmet':''}><BattlePortrait region={c.region} role="companion"/><span><strong>{c.name}</strong><small>{c.region>=frontier?'迷雾中的来信':c.role}</small></span></button>)}</div></div>;}
export function CompanionNote({region,episode,locked}){const c=companions[region];return <aside className="companion-note"><FieldProp name="letter"/><div><small>{c.name} / {c.role}</small><p>{locked?'这位伙伴的来信，还藏在未解锁的海域里。':c.lines[episode]}</p><details><summary>认识这位支线伙伴</summary><p>{locked?'点亮海域后，再来读它的故事。':c.bio}</p></details></div></aside>;}
export function BattleEncounter({state,region,onStrike,onRetry}){
 const creature=creatures[region],companion=companions[region],battle=journalFor(state).battles[region],locked=region>=state.frontier;
 const [fx,setFx]=useState(null),timers=useRef([]),sequence=useRef(0);
 const clearTimers=()=>{timers.current.forEach(clearTimeout);timers.current=[];};
 useEffect(()=>{clearTimers();setFx(null);return clearTimers;},[region]);
 const phase=fx?.region===region?fx.phase:'idle',poses=battlePortraits(battle,creature,phase),busy=phase!=='idle';
 function act(move){
  if(locked||busy||battle?.won||battle?.hp===0)return;
  const event={id:++sequence.current,region,move,phase:'hit',enemy:battle?.enemy??creature.hp,hp:battle?.hp??60};
  setFx(event);onStrike(move);
  timers.current.push(setTimeout(()=>setFx(p=>p?.id===event.id?{...p,phase:'counter'}:p),310),setTimeout(()=>setFx(p=>p?.id===event.id?{...p,phase:'idle'}:p),850));
 }
 const enemyDelta=Math.max(0,(fx?.enemy??creature.hp)-(battle?.enemy??creature.hp)),hpDelta=Math.max(0,(fx?.hp??60)-(battle?.hp??60));
 return <article className={'monster-sheet live-battle phase-'+phase+(locked?' encounter-locked':'')}>
  <BattleScene key={region} region={region} monster={locked?'idle':poses.monster} companion={locked?'idle':poses.companion} caption={<><span>NO. {String(region+1).padStart(2,'0')} / {regions[region].name}</span><small>伙伴画像跟随骑士状态 · {creature.style}</small></>}>{phase==='hit'&&enemyDelta>0&&<span key={'enemy-number-'+fx.id} className="battle-number enemy-battle-number">−{enemyDelta} 共鸣</span>}{phase==='counter'&&hpDelta>0&&<span key={'ally-number-'+fx.id} className="battle-number ally-number">−{hpDelta} 体力</span>}{phase==='hit'&&fx.move==='echo'&&<div key={'weapon-'+fx.id} className="battle-weapon-motion" aria-hidden="true"><GearArt item={equipped(state,'weapon')}/></div>}{phase==='hit'&&fx.move==='guard'&&<div key={'guard-'+fx.id} className="battle-guard-motion" aria-hidden="true"><GearArt item={equipped(state,'shield')}/></div>}</BattleScene>
  <div className="monster-copy"><p className="eyebrow">{locked?'迷雾中尚未发现':battle?.won?'已共鸣 / 支线开放':'WILD ENCOUNTER / 音乐小怪兽'}</p><h3>{creature.name}</h3><p>{locked?'解锁这片海域后，就能遇见它。':creature.description}</p><div className="battle-meters"><label>小怪兽共鸣值 <b>{battle?.enemy??creature.hp}/{creature.hp}</b><progress max={creature.hp} value={battle?.enemy??creature.hp}/></label><label>骑士体力 <b>{battle?.hp??60}/60</b><progress max="60" value={battle?.hp??60}/></label></div><p className="battle-log" role="status">{battle?.log||('已装备 '+equipped(state,'weapon').name+' / '+equipped(state,'shield').name+'。回声斩强攻，守拍减伤。')}</p><div className="encounter-actions">{battle?.won?<span className="capsule"><FieldProp name="seal"/>已交战 · +90 XP 已入账</span>:battle?.hp===0?<button disabled={busy} onClick={()=>{clearTimers();setFx(null);onRetry();}}>重新调音 · 再次挑战</button>:<><button disabled={locked||busy} onClick={()=>act('echo')}><FieldProp name="battle"/>回声斩</button><button disabled={locked||busy} className="secondary" onClick={()=>act('guard')}>守拍</button></>}</div></div>
 </article>;
}
