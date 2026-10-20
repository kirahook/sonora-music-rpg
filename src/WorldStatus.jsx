import {regions} from './catalog.js';
import {FieldIcon,FieldProp} from './FieldMarks.jsx';
import {worldStatus} from './worldStatus.js';

export function MapStatusBar({state}){
 const s=worldStatus(state);
 return <section className="map-status" aria-label="海域航行状态">
  <header><FieldProp name="map"/><div><p className="function-pixel-title">CHARTED WATERS.</p><h3>世界海 · 航行状态</h3></div><small>你的进度<br/>当前浏览器存档</small></header>
  <dl className="map-status-grid">
   <div><FieldIcon name="world"/><dt>已测绘海域</dt><dd>{s.frontier}<span> / 6</span></dd></div>
   <div><FieldProp name="key"/><dt>探索钥匙</dt><dd>{s.keys}<span> 枚</span></dd></div>
   <div><FieldProp name="battle"/><dt>已共鸣相遇</dt><dd>{s.won}<span> / {s.frontier}</span></dd></div>
   <div><FieldProp name="seal"/><dt>奇闻收藏</dt><dd>{s.comics}<span> / 24</span></dd></div>
  </dl>
 </section>;
}

export function MapWorldNotes({state,selected,onSelect,onExplore,onInspect}){
 const s=worldStatus(state,selected);
 return <section className="map-world-notes" aria-label="海域航行档案">
  <header><FieldIcon name={s.unlocked?'audio':'lock'}/><div><p className="function-pixel-title">FIELD FREQUENCY.</p><h3>{s.name}<small>{s.unlocked?regions[s.region].genre:'UNMAPPED / 尚未测绘'}</small></h3></div><span className="map-region-number">0{s.region+1} / 06</span></header>
  <p className="map-lore-copy">{s.note?s.note.note:'雾后的故事还没有写进海图。先在右侧或下方查看解锁条件；只有明确确认解锁时，才会消耗钥匙。'}</p>
  {s.note&&<div className="map-dossier-tags"><span><FieldProp name="record"/>{s.albumCount} 张代表唱片</span><span><FieldIcon name="world"/>4 处音乐史地标</span><span><FieldProp name="letter"/>{s.localComics} / 4 篇奇闻收藏</span></div>}
  <nav className="map-region-index" aria-label="切换海域航行档案">{regions.map((r,i)=><button key={r.en} aria-pressed={i===s.region} onClick={()=>onSelect(i)}><span>0{i+1}</span><FieldIcon name={i<s.frontier?'world':'lock'}/><strong>{i<s.frontier?r.name:'未知海域'}</strong></button>)}</nav>
  <div className="map-dossier-bottom"><details><summary>航海札记与世界设定</summary><p>{s.note?`${s.note.place} · ${s.note.signal}。`:'迷雾依次开启，不会因为查阅档案而自动解锁。'}海域、场所与来信为虚构世界观；音乐史地标和唱片资料在二级地图中单独注明来源。这里不显示实时天气或定位数据。</p></details><button onClick={s.unlocked?()=>onExplore(s.region):onInspect}>{s.unlocked?'进入音乐城市':'查看解锁条件'}</button></div>
 </section>;
}
