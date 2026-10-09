import {useState} from 'react';
import {genrePages,handbookFor} from './handbook';

export function MusicHandbook({state,onPage,onBookmark,onStamp,onNote,onAlbum}){
 const saved=handbookFor(state),page=Math.max(0,Math.min(genrePages.length-1,saved.page)),topic=genrePages[page],stamp=saved.stamps[topic.id];
 const [armed,setArmed]=useState(false),[ink,setInk]=useState('rust'),[motion,setMotion]=useState('');
 function go(n){if(n<0||n>=genrePages.length||n===page)return;setMotion(n>page?'turn-forward':'turn-back');setArmed(false);onPage(n);}
 function place(e){if(!armed)return;const r=e.currentTarget.getBoundingClientRect();onStamp(topic.id,(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height,ink);setArmed(false);}
 function keys(e){if(e.target.closest('textarea,input,select'))return;if(e.key==='ArrowRight'){e.preventDefault();go(page+1);}if(e.key==='ArrowLeft'){e.preventDefault();go(page-1);}if(e.key==='Escape')setArmed(false);}
 const artPosition={backgroundPosition:`${page%4*100/3}% ${Math.floor(page/4)*100}%`};
 return <article id="sound-handbook" className="music-handbook single-handbook" aria-label="音乐流派历史手账" onKeyDown={keys}>
  <header className="play-panel-heading"><span className="game-number">03</span><div><p className="eyebrow">THE SOUND JOURNAL</p><h3>声音的来处</h3></div><span className="capsule">{Object.keys(saved.stamps).length} / 8 邮戳</span></header>
  <p className="handbook-intro">一页一种声音。把流派的来处，夹进自己的旅途。</p>
  <nav className="book-tabs" aria-label="流派页签">{genrePages.map((t,i)=><button key={t.id} aria-pressed={page===i} onClick={()=>go(i)} style={{'--tab-color':t.color}}>{t.name}{saved.bookmarks.includes(t.id)&&<span aria-label="已夹书签"> ·</span>}</button>)}</nav>
  <div className={'journal-sheet '+motion+(armed?' stamp-armed':'')} onAnimationEnd={()=>setMotion('')}>
   <section className="journal-page" aria-label={topic.name+'单页手账'} key={topic.id}>
    <div className="journal-masthead"><span>SONORA / FIELD ARCHIVE</span><span>VOL. {String(page+1).padStart(2,'0')} — 08</span></div>
    <div className="journal-lead"><div><p className="journal-en">{topic.en}</p><h4>{topic.name}</h4><p className="journal-origin">{topic.origin}</p><span className="journal-tape">A TRACE OF SOUND</span></div><div className="journal-art"><div className="book-plate" aria-hidden="true" style={artPosition}/><small>LISTENING SPECIMEN / 0{page+1}</small></div></div>
    <p className="journal-summary">{topic.summary}</p>
    <div className="journal-how"><b>听法札记</b><p>{topic.listen}</p></div>
    <div className="journal-history"><div className="journal-section-label"><b>声音的时间线</b><span>TRACES & CONNECTIONS</span></div><ol className="genre-timeline">{topic.timeline.map(([date,title,copy])=><li key={date}><span>{date}</span><div><b>{title}</b><p>{copy}</p></div></li>)}</ol></div>
    <div className="journal-tail"><div><p className="history-caveat">简化阅读脉络，不是完整家谱。</p><details className="book-sources"><summary>查阅资料来源</summary>{topic.sources.map(([name,url])=><a key={url} href={url} target="_blank" rel="noreferrer">{name} ↗</a>)}</details><button className="book-listen" onClick={()=>onAlbum(topic.album)}>装载关联唱片 ↗</button></div><div className="stamp-space" onClick={place} title={armed?'点击这里盖章':'邮戳留白区'}><span>POSTMARK / READING MEMORY</span>{stamp&&<div className={'placed-postmark ink-'+stamp.ink} style={{'--stamp-pos':artPosition.backgroundPosition,left:`${stamp.x*100}%`,top:`${stamp.y*100}%`}} role="img" aria-label={topic.name+'阅读邮戳，'+stamp.date}><small>{stamp.date}</small></div>}</div></div>
   </section>
  </div>
  <div className="book-navigation"><button disabled={page===0} onClick={()=>go(page-1)}>← 上一页</button><span>{String(page+1).padStart(2,'0')} / 08</span><button disabled={page===genrePages.length-1} onClick={()=>go(page+1)}>下一页 →</button></div>
  <div className="stamp-tools"><label>印泥 <select aria-label="选择邮戳印泥" value={ink} onChange={e=>setInk(e.target.value)}><option value="rust">赭红</option><option value="green">苔绿</option><option value="blue">靛蓝</option></select></label><button aria-pressed={armed} onClick={()=>setArmed(v=>!v)}>{armed?'收起邮戳':stamp?'移动本页邮戳':'拿起邮戳'}</button><button onClick={()=>{onStamp(topic.id,.52,.58,ink);setArmed(false);}}>盖在留白处</button><button aria-pressed={saved.bookmarks.includes(topic.id)} onClick={()=>onBookmark(topic.id)}>{saved.bookmarks.includes(topic.id)?'取下书签':'夹入书签'}</button></div>
  <p className="stamp-hint" role="status">{armed?'点击单页右下方留白区盖章；也可直接点“盖在留白处”。':'页码、邮戳、书签、笔记自动保存 · 不消耗钥匙，不发放经验'}</p>
  <details className="handbook-notes"><summary>写一条自己的聆听笔记</summary><textarea aria-label={topic.name+'手账笔记'} maxLength={240} value={saved.notes[topic.id]||''} placeholder="今天听到了什么？最多 240 字。" onChange={e=>onNote(topic.id,e.target.value)}/></details>
 </article>;
}
