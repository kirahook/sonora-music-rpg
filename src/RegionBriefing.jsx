import {FieldIcon,FieldProp} from './FieldMarks.jsx';
import {cityArt} from './regionAtlas.js';
import {regionGuide} from './regionGuide.js';

export function RegionBriefing({state,region}){
 const g=regionGuide(state,region);
 return <section className={'region-briefing '+(g.unlocked?'charted':'uncharted')} aria-label="海域行前说明">
  <header><FieldProp name="map"/><div><p className="function-pixel-title">BEFORE YOU WANDER.</p><h4>出发之前，先听懂这片海。</h4></div></header>
  <p className="region-next-note">{g.next}</p>
  {g.unlocked?<><figure className="region-briefing-figure"><div style={cityArt(g.region)} role="img" aria-label={g.name+'想象音乐城市缩影'}/><figcaption><span>0{g.region+1} / FIELD ATLAS</span><span>原创城市意象 · 非真实地理位置</span></figcaption></figure>
  <div className="region-record-note"><img src={g.album.cover} alt={g.album.title+'专辑封面'} width="60" height="60" loading="lazy"/><div><small>本海域的一个聆听入口</small><strong>{g.album.title}</strong><span>{g.album.artist} · {g.album.year}</span></div></div>
  <div className="region-listening-lens"><FieldIcon name="audio"/><div><h5>先留意：{g.listenTitle.split(' / ')[0]}</h5><p>{g.listenBody}</p></div></div>
  <div className="region-journey"><header><h5>你的海域足迹</h5><span>真实存档</span></header><ol><li className="complete"><FieldIcon name="world"/><span>已测绘海域</span><b>已抵达</b></li><li className={g.won?'complete':''}><FieldProp name="battle"/><span>与{g.creature.name}共鸣</span><b>{g.won?'已共鸣':'待相遇'}</b></li><li className={g.claimed===4?'complete':''}><FieldProp name="letter"/><span>区域奇闻</span><b>{g.claimed} / 4 完成</b></li><li className={g.localComics===4?'complete':''}><FieldProp name="seal"/><span>漫画归档</span><b>{g.localComics} / 4 收藏</b></li></ol><p>{g.friend.name} · {g.friend.role}<span>「{g.friend.lines[Math.min(3,g.claimed)]}」</span></p></div>
  <details className="region-reading-notes"><summary>这里可以探索什么？</summary><div className="region-reading-content"><p>四处音乐史地标，从不同年代走近这类声音；再翻阅专辑、音乐家与听觉词条三种知识卡。</p><ul>{g.atlas.nodes.slice(0,2).map(n=><li key={n.id}><time>{n.date}</time><strong>{n.title}</strong></li>)}</ul><p>这是一条简化的阅读路线，不是完整或唯一的发展家谱。</p>{g.atlas.sources.map(([name,url])=><a key={url} href={url} target="_blank" rel="noreferrer">{name} ↗</a>)}</div></details>
  </>:<div className="region-fog-note"><FieldIcon name="lock"/><div><h5>先准备好下一程</h5><p>新海域会带来新的城市地标、支线伙伴与四篇独立漫画。迷雾散开前，具体风景与声音先留作惊喜。</p><p>点击档案或阅读说明不会自动花费钥匙。解锁仍使用上方的明确确认按钮。</p></div></div>}
  <details className="region-reward-rules"><summary>阅读、装载与聆听，有什么不同？</summary><dl><div><dt>浏览城市 / 翻知识卡</dt><dd>不增加经验，不消耗钥匙。</dd></div><div><dt>装载代表唱片</dt><dd>不会自动播放；每日结算前，每张唱片首次查阅记30 XP。</dd></div><div><dt>实际播放达标</dt><dd>有效聆听20秒；短于25秒的音乐需听满80%。任务必须先接取，再按要求聆听。</dd></div><div><dt>完成奇闻</dt><dd>与怪兽首次共鸣后可接取支线。按章节要求完成，手动领取漫画与奖励。</dd></div></dl></details>
  <div className="region-field-seal"><FieldProp name="seal"/><span>SONORA / FIELD COMPANION<small>{g.unlocked?'慢慢听，海图不催你赶路。':'把未知留给下一首歌。'}</small></span></div>
 </section>;
}
