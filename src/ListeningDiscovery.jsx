import {useState} from 'react';
import {albums} from './catalog.js';
import {FieldProp} from './FieldMarks.jsx';
import {GuidePortal} from './GuideCinema.jsx';
import {listeningClues,listeningContrasts,observationsFor,comparisonFor,isNamedGenre} from './listeningDiscovery.js';

export function SoundNote({note}){
 const clue=listeningClues.find(c=>c.id===note?.focus),album=albums.find(a=>a.code===note?.albumCode);
 if(!clue)return null;
 return <article className="first-sound-note" aria-label="我的第一张声音札记"><div className="sound-note-art">{album?<img src={album.cover} alt={album.title+' 专辑封面'}/>:<FieldProp name="letter"/>}<FieldProp name="seal"/></div><div><p className="eyebrow">A LITTLE WORLD, OPENED / 声音札记已展开</p><h3>{clue.title}</h3><strong>{note.title}</strong><p>{clue.note}</p><small>{note.day} · 你的听觉观察，不是标准答案</small></div></article>;
}

export function ObservationForm({track,onSave,saved}){
 const [focus,setFocus]=useState('');
 if(saved)return <p className="discovery-saved" role="status">已记下：{listeningClues.find(c=>c.id===saved.focus)?.title}。这首的线索已归藏，不重复计数。</p>;
 return <form className="observation-form" onSubmit={e=>{e.preventDefault();if(track&&focus)onSave(track.id,focus);}}><fieldset disabled={!track}><legend>刚才这段声音，什么让你停了一下？</legend><div className="clue-options">{listeningClues.map(c=><label key={c.id} className={focus===c.id?'selected':''}><input type="radio" name="listening-focus" value={c.id} checked={focus===c.id} onChange={()=>setFocus(c.id)}/><span><strong>{c.title}</strong><small>{c.hint}</small></span></label>)}</div></fieldset><p className="discovery-help">没有对错，也不做音频识别。“暂时还没辨清”同样可以留下线索。</p><button className="discovery-primary" disabled={!track||!focus}>留下这条线索</button></form>;
}

export function ListeningDiscovery({game,onObserve,onCompare,firstNote}){
 const [selected,setSelected]=useState(''),[left,setLeft]=useState(''),[right,setRight]=useState(''),[contrast,setContrast]=useState('');
 const notes=observationsFor(game),track=game.heard.find(t=>t.id===selected)||game.heard.find(t=>!notes.some(n=>n.trackId===t.id))||game.heard[0];
 const a=game.heard.find(t=>t.id===left&&isNamedGenre(t.genre)&&notes.some(n=>n.trackId===t.id))||game.heard.find(t=>isNamedGenre(t.genre)&&notes.some(n=>n.trackId===t.id));
 const others=a?game.heard.filter(t=>isNamedGenre(t.genre)&&t.genre!==a.genre&&notes.some(n=>n.trackId===t.id)):[];
 const b=others.find(t=>t.id===right)||others[0],comparison=comparisonFor(game);
 return <section className="listening-discovery" aria-label="听觉线索记录"><header><FieldProp name="letter"/><div><p className="function-pixel-title">WHAT DID YOU HEAR?</p><h4>把听见的，带进冒险。</h4></div></header>
  {game.rulesVersion!==2&&<p className="discovery-help">今天的旧版任务进度和奖励资格已保留；明日开始按新线索规则刷新。现在也可以先试记一条。</p>}
  {track?<><label className="discovery-select">为哪一段声音留下线索？<select aria-label="选择已听曲目记录线索" value={track.id} onChange={e=>setSelected(e.target.value)}>{game.heard.map(t=><option key={t.id} value={t.id}>{t.title} · {t.genre}</option>)}</select></label><ObservationForm key={track.id} track={track} saved={notes.find(n=>n.trackId===track.id)} onSave={onObserve}/></>:<p className="discovery-empty">先真实听一段音乐，声音会出现在这里。播放校验通过后，就能记录节拍、音色、空间，或一个问号；拖动进度条不会解锁记录。</p>}
  {notes.length>0&&<div className="discovery-notes"><h5>已拾得的声音线索 · {notes.length}</h5><ul>{notes.map(n=><li key={n.trackId}><span>{game.heard.find(t=>t.id===n.trackId)?.title}</span><b>{listeningClues.find(c=>c.id===n.focus)?.title}</b></li>)}</ul></div>}
  <details className="discovery-comparison"><summary>第二封委托：两片海，有什么不一样？</summary>{comparison?<p role="status">比较已归藏：{listeningContrasts.find(c=>c.id===comparison.contrast)?.title}。可在下方领取委托奖励。</p>:others.length?<form onSubmit={e=>{e.preventDefault();if(a&&b&&contrast)onCompare(a.id,b.id,contrast);}}><label>第一段<select aria-label="比较第一段声音" value={a.id} onChange={e=>{setLeft(e.target.value);setRight('');}}>{game.heard.filter(t=>isNamedGenre(t.genre)&&notes.some(n=>n.trackId===t.id)).map(t=><option key={t.id} value={t.id}>{t.title} · {t.genre}</option>)}</select></label><label>另一种流派<select aria-label="比较第二段声音" value={b?.id||''} onChange={e=>setRight(e.target.value)}>{others.map(t=><option key={t.id} value={t.id}>{t.title} · {t.genre}</option>)}</select></label><fieldset><legend>两段放在一起，你更留意到什么？</legend>{listeningContrasts.map(c=><label key={c.id}><input type="radio" name="sound-contrast" checked={contrast===c.id} onChange={()=>setContrast(c.id)}/>{c.title}</label>)}</fieldset><button className="discovery-primary" disabled={!b||!contrast}>收下这次比较</button></form>:<p>为两种不同流派各留下一条线索，再回来选一个相似或不同之处。暂时说不清也没关系。</p>}</details>
  {firstNote&&<details className="discovery-keepsake"><summary>重看我的第一张声音札记</summary><SoundNote note={firstNote}/></details>}
 </section>;
}

export function FirstListen({tour,state,game,player,power,onChoose,onObserve,onNavigate,onLocate}){
 const first=tour.guide.first||{},album=albums.find(a=>a.code===first.albumCode),track=album?.tracks.find(t=>t.id===first.trackId);
 const heard=game.heard.find(t=>t.id===track?.id),saved=observationsFor(game).find(n=>n.trackId===track?.id);
 const oldNote=state.firstSoundNote?.trackId===track?.id?state.firstSoundNote:null;
 const phase=!album||!track?0:first.step===3&&(saved||oldNote)?3:!heard?Math.min(first.step||0,1):Math.min(first.step||0,2);
 const titles=['先挑一张，其他的慢慢来。','把注意力，交给一个声音。','刚才，你听见了什么？','你已经打开了一小片世界。'];
 function move(step){tour.setFirst({...first,step});}
 function select(a){onChoose(a);tour.setFirst({albumCode:a.code,trackId:a.tracks[0].id,step:1});}
 function play(){if(player.playing){void player.toggle();return;}if(player.track?.id!==track.id)player.selectTrack(album.tracks.findIndex(t=>t.id===track.id),true);else void player.toggle();}
 const result=oldNote||(saved&&{...saved,title:heard.title,albumCode:album.code,day:state.day});
 return <div className="first-listen-flow"><div className="first-listen-copy"><p className="guide-pixel-title function-pixel-title">FIRST, A LITTLE SOUND.</p><h2 id="guide-title" tabIndex={-1}>{titles[phase]}</h2><p id="guide-intro">先不记装备、地图和任务。完成这一次小聆听，就算启程。</p></div>
  <GuidePortal onLocate={onLocate} paused={tour.guide.paused}/>
  <ol className="first-listen-steps" aria-label="第一次聆听的四步"><li aria-current={phase===0?'step':undefined}>01 选唱片</li><li aria-current={phase===1?'step':undefined}>02 听一段</li><li aria-current={phase===2?'step':undefined}>03 拾线索</li><li aria-current={phase===3?'step':undefined}>04 新发现</li></ol>
  {phase===0&&<><p>点封面，选一张现在想靠近的唱片。下一步，再亲手按下播放。</p><div className="first-records">{albums.slice(0,3).map((a,i)=><button key={a.code} aria-pressed={album?.code===a.code} onClick={()=>select(a)}><span className="first-record-code"><FieldProp name="record"/><span>{a.code} / {a.genre}</span></span><img src={a.cover} alt={a.title+' 专辑封面'}/><small>{['跟着一条旋律走','留意反复的节拍','听人声与背景的远近'][i]}</small><strong>{a.title}</strong><span>{a.artist}</span></button>)}</div><p className="discovery-help">选片使用真实唱片库，记入正常查阅；不会自动播放。无需登录或先学完手册。</p></>}
  {phase===1&&<><div className="first-listen-player"><img src={album.cover} alt=""/><div><small>官方短试听 / {album.genre}</small><h3>{track.title}</h3><p>{album.title} · {album.artist}</p><button className="discovery-primary guide-action-glow" disabled={power!=='on'||player.loading&&!player.playing} onClick={play}>{power!=='on'?'终端正在准备':player.loading?'正在连接音源…':player.playing?'暂停播放':'播放这段声音'}</button>{player.setMuted&&<button className="discovery-secondary" aria-pressed={player.muted} onClick={()=>player.setMuted(!player.muted)}>{player.muted?'取消静音':'静音'}</button>}</div></div>{player.playing&&player.track?.id!==track.id&&<p className="discovery-help">播放器已进入下一首；这次线索仍记录刚才选定的「{track.title}」。可暂停播放后再整理感受。</p>}<p className="first-listening-prompt">先跟随一个声音，不用认出乐器，也不用边听边看秒表。</p>{player.error&&<p role="alert">{player.error} 可重新播放，或换一张唱片继续。</p>}<p role="status">{heard?'这段真实聆听已留下足迹，可以去拾一条线索了。':'播放后慢慢听；通过真实播放校验，下一步会亮起。离开或暂停都不会扣分。'}</p><details className="discovery-help"><summary>为什么下一步还没亮？</summary><p>沿用真实播放校验：20秒，短于25秒的曲目听满80%；拖动进度条不等于听过。我们不会识别你是否听懂，接下来由你描述。</p></details><div className="first-listen-actions"><button onClick={()=>move(0)}>换张唱片</button><button className="discovery-primary" disabled={!heard} onClick={()=>move(2)}>去拾一条声音线索</button></div></>}
  {phase===2&&<><p>{track.title} · 不用写乐评，选一个最贴近刚才感受的入口。</p><ObservationForm key={track.id} track={heard} saved={saved} onSave={(id,focus)=>{onObserve(id,focus);move(3);}}/>{saved&&<button className="discovery-primary" onClick={()=>move(3)}>展开声音札记</button>}<button className="discovery-secondary" onClick={()=>move(1)}>回去再听一遍</button></>}
  {phase===3&&result&&<><SoundNote note={result}/><p className="first-discovery-message">新内容已展开。第一张札记会保存在本浏览器，可在「每日探索委托」重看；记录本身不发经验、不花钥匙。</p><p>想继续时，再去领取第一封委托，或带着这个特点听下一张。装备、地图和手账，都可以以后再认识。</p><div className="first-listen-actions"><button className="discovery-primary" onClick={()=>{tour.close('completed');onNavigate('terminal');}}>继续听歌</button><button onClick={()=>{tour.close('completed');onNavigate('quest-first');}}>看看我的第一封委托</button></div></>}
  <div className="first-handbook-link"><span>不用现在认识全部世界。</span><button onClick={tour.handbook}>需要时再看功能手册 · 九章索引</button></div>
 </div>;
}
