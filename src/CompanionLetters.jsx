import {useEffect,useState} from 'react';
import {regions} from './catalog.js';
import {companions} from './fieldPresentation.js';
import {BattlePortrait} from './BattleEncounter.jsx';
import {FieldIcon,FieldProp} from './FieldMarks.jsx';
import {companionLetters,letterFrontier,readableLetterRegion,nextLetterIndex} from './companionLetters.js';

export function CompanionLetters({state,selectedRegion=0}){
 const frontier=letterFrontier(state),[choice,setChoice]=useState(()=>readableLetterRegion(state,selectedRegion)),[pages,setPages]=useState({});
 useEffect(()=>{setChoice(old=>Number.isInteger(selectedRegion)&&selectedRegion>=0&&selectedRegion<frontier?selectedRegion:readableLetterRegion(state,old));},[selectedRegion,frontier]);
 const region=readableLetterRegion(state,choice),c=companions[region],mail=companionLetters[region],page=pages[region]||0,letter=mail?.letters[page];
 return <section id="companion-letters" className="companion-letters" aria-labelledby="companion-letters-title">
  <header><FieldProp name="letter"/><div><p className="function-pixel-title">LETTERS FROM THE SHORE.</p><h3 id="companion-letters-title">旅伴来信</h3></div></header>
  <p className="letters-intro">海那边的日常，也值得慢慢听。</p>
  {region===null?<div className="letters-awaiting"><FieldIcon name="lock"/><h4>信箱还在等第一片海域。</h4><p>解锁海域后，伙伴会把沿途的小事寄到这里。未测绘的寄信人与故事，暂时留在雾里。</p></div>:<>
   <label className="letters-select">寄信海域<select aria-label="选择旅伴来信海域" value={region} onChange={e=>{const n=Number(e.target.value);if(readableLetterRegion(state,n)===n)setChoice(n);}}>{regions.map((r,i)=><option key={r.en} value={i} disabled={i>=frontier}>{i<frontier?r.name:`未知海域 0${i+1} · 信件未通`}</option>)}</select></label>
   {readableLetterRegion(state,selectedRegion)!==selectedRegion&&<p className="letters-fog-note">正在阅读已测绘海域的来信，雾后的寄信人尚未公开。</p>}
   <div className="letters-sender"><div className="letters-portrait"><BattlePortrait region={region} role="companion"/></div><div><small>FROM / 寄信人</small><strong>{c.name}</strong><span>{c.role}</span></div></div>
   <div className="letters-reading"><div className="letters-postmark"><FieldIcon name="world"/><span>{regions[region].name}<small>寄自 · {mail.place}</small></span><span className="letters-edition">0{region+1}<small>FIELD POST</small></span></div>
   <article className="letters-page" aria-live="polite" aria-atomic="true"><small>给正在远行的你 / {String(page+1).padStart(2,'0')} — 03</small><h4>{letter.title}</h4><p>{letter.body}</p><footer>{c.name} · 留在海风里</footer></article>
   <ul className="letters-tags" aria-label="来信海域标签">{mail.tags.map(t=><li key={t}>{t}</li>)}</ul></div>
   <button className="letters-next" onClick={()=>setPages(old=>({...old,[region]:nextLetterIndex(region,old[region])}))}><span>换一封来信</span><FieldIcon name="search"/></button>
  </>}
  <footer className="letters-footnote"><FieldProp name="seal"/><p>世界海原创短篇 · 非历史资料<small>手动翻阅，不发放奖励；刷新后从首封开始。</small></p></footer>
 </section>;
}
