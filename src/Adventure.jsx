import {albums} from './catalog';
import {quests} from './gameplay';
import {QuestGarden} from './QuestGarden';
import {MusicHandbook} from './MusicHandbook';
const defaults=[albums[0].tracks[0].id,albums[10].tracks[0].id,albums[11].tracks[0].id];
export const allTracks=albums.flatMap(a=>a.tracks.map(t=>({...t,albumCode:a.code,albumTitle:a.title,genre:a.genre,cover:a.cover})));
export function Adventure({game,onQuest,onEdit,onStart,onCancel,onClaim,power,handbook}){
  const voyage=game.voyage,slots=voyage.slots.length===3?voyage.slots:defaults;
  const frozen=voyage.status==='active'||voyage.status==='complete'||game.voyageClaimed;
  function edit(index,id){const next=[...slots];next[index]=id;onEdit(next);}
  return <section id="adventure" className="adventure-section">
    <div className="section-heading"><div><p className="eyebrow">04 / 把聆听变成一次小冒险</p><h2>MORE WAYS TO WANDER.</h2></div><span className="capsule">3 WAYS TO WANDER</span></div>
    <div className="play-grid">
      <article className="quest-panel"><div className="play-panel-heading"><span className="game-number">01</span><div><p className="eyebrow">DAILY LISTENING QUESTS</p><h3>每日探索委托</h3></div><span className="capsule">每日刷新</span></div><p className="panel-description">三封来自世界海的来信。听见不同声音，领取额外经验。</p>
        <QuestGarden game={game}/>
        <div className="quest-list">{quests.map(q=>{const progress=Math.min(q.measure(game),q.target),claimed=game.claimed.includes(q.id);return <div id={'quest-'+q.id} className={`quest-row ${claimed?'claimed':''}`} key={q.id}><div className="quest-copy"><strong>{q.title}</strong><span>{q.description} · {progress}/{q.target}</span><progress value={progress} max={q.target} aria-label={q.title}/></div><button disabled={claimed||progress<q.target} onClick={()=>onQuest(q.id)}>{claimed?'已领取':progress>=q.target?'领取奖励':`+${q.xp} XP`}</button></div>;})}</div><p className="game-rule">以真实播放进度计数 · 每项每日限领一次 · 与每日结算独立</p>
      </article>
      <div className="voyage-column">
      <article className="voyage-panel"><div className="play-panel-heading"><span className="game-number">02</span><div><p className="eyebrow">THREE-TRACK EXPEDITION</p><h3>三曲远征歌单</h3></div><span className="capsule">+300 XP / +1 KEY</span></div><p className="panel-description">挑选三首不同的歌，按顺序驶过三站。让音乐带你抵达终点。</p>
        <div className="voyage-slots">{slots.map((id,i)=>{const track=allTracks.find(t=>t.id===id)||allTracks[0],album=albums.find(a=>a.code===track.albumCode);return <div className={`voyage-slot ${voyage.cursor>i?'done':''} ${voyage.status==='active'&&voyage.cursor===i?'current':''}`} key={i}><span className="stop-number">0{i+1}</span><img src={track.cover} alt=""/><div><select aria-label={`远征第${i+1}站专辑`} value={album.code} disabled={frozen} onChange={e=>edit(i,albums.find(a=>a.code===e.target.value).tracks[0].id)}>{albums.map(a=><option key={a.code} value={a.code}>{a.title}</option>)}</select><select aria-label={`远征第${i+1}站曲目`} value={id} disabled={frozen} onChange={e=>edit(i,e.target.value)}>{album.tracks.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></div><span className="stop-state">{voyage.cursor>i?'完成':voyage.status==='active'&&voyage.cursor===i?'聆听中':'待抵达'}</span></div>;})}</div>
        <div className="voyage-actions">{game.voyageClaimed?<button disabled>今日远征奖励已领取</button>:voyage.status==='complete'?<button className="primary-action" onClick={onClaim}>领取远征宝箱 · +300 XP +1 KEY</button>:<button className="primary-action" disabled={power!=='on'||new Set(slots).size!==3} onClick={()=>onStart(slots)}>{power!=='on'?'请先开启终端':voyage.status==='active'?`继续第 ${voyage.cursor+1} 站`:'出发 · 播放远征歌单'}</button>}{voyage.status==='active'&&<button className="text-button" onClick={onCancel}>结束本次远征</button>}</div>
        <p className="game-rule">{new Set(slots).size!==3?'请选择三首不同的曲目。':`${Math.min(voyage.cursor,3)}/3 站完成 · 每站有效聆听 20 秒 · 每日奖励一次`}</p>
        <button className="book-jump" onClick={()=>document.getElementById('sound-handbook')?.scrollIntoView({behavior:'smooth',block:'start'})}>翻开声音手账 ↓</button>
      </article>
      <MusicHandbook {...handbook}/>
      </div>
    </div>
  </section>;
}
