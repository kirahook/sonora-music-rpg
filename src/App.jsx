import {useEffect,useMemo,useRef,useState} from 'react';
import {albums,regions,fmt,clock,dateKey} from './catalog';
import {claimRewards,recordListen,rewards,unlockRegion} from './progression';
import {FieldNotes,HarvestCard,ComicCard} from './FieldNotes';
import {tales,creatures,journalFor,strike,retryBattle,acceptTale,hearTale,claimTale} from './encounters';
import {Armory,CreatureArt} from './Armory';
import {WardrobeAvatar} from './Wardrobe';
import {equip,forge,equipped,tierFor} from './equipment';
import {usePlayer} from './usePlayer';
import {Adventure,allTracks} from './Adventure';
import {turnPage,bookmarkPage,stampPage,notePage} from './handbook';
import {SoundLandscape} from './SoundLandscape';
import {MobileDock,mobileDestinations} from './MobileDock';
import {recordSound,archiveSound} from './soundHistory';
import {gameFor,recordAdventure,claimQuest,editVoyage,beginVoyage,cancelVoyage,claimVoyage} from './gameplay';

const storageKey='sonora-terminal-v3';
const fresh=()=>({day:dateKey(),xp:7420,equipment:1,frontier:3,keys:1,listened:[],viewed:[],knownGenres:['JAZZ','ELECTRONIC','LOCAL'],claimed:false,receipt:null});
function readState(){
  try{
    const value=JSON.parse(localStorage.getItem(storageKey));
    if(value&&Number.isFinite(value.xp)&&Array.isArray(value.listened)&&Array.isArray(value.knownGenres)) return value.day===dateKey()?archiveSound(value):{...archiveSound(value),day:dateKey(),listened:[],viewed:[],claimed:false,receipt:null};
    const legacy=JSON.parse(localStorage.getItem('sonora-rpg-v2'));
    return legacy&&Number.isFinite(legacy.xp)?{...fresh(),xp:legacy.xp,equipment:legacy.equipment||1,frontier:Math.min(6,legacy.frontier||3)}:fresh();
  }catch{return fresh();}
}
const glyphs={audio:0,world:1,knight:2,search:3,play:4,power:5,lock:6,spark:7};
function Icon({name='spark',className=''}){const cell=glyphs[name];return <span aria-hidden="true" className={`dot-icon ${className}`} style={{'--icon-x':`${(cell%4)*100/3}%`,'--icon-y':`${Math.floor(cell/4)*100}%`}}/>;}
function SectionTitle({number,icon,title,subtitle,children}){return <div className="section-heading"><div className="section-title"><Icon name={icon}/><div><p className="eyebrow">{number} / {subtitle}</p><h2>{title}</h2></div></div>{children}</div>;}

export function App(){
  const [state,setState]=useState(readState);
  const [albumIndex,setAlbumIndex]=useState(4);
  const [power,setPower]=useState('booting');
  const [screen,setScreen]=useState('knight');
  const [tint,setTint]=useState('green');
  const [brightness,setBrightness]=useState(85);
  const [nav,setNav]=useState('terminal');
  const [notice,setNotice]=useState('');
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState('all');
  const [hovered,setHovered]=useState(null);
  const [selectedRegion,setSelectedRegion]=useState(3);
  const [selectedTale,setSelectedTale]=useState(null);
  const [zoom,setZoom]=useState(1);
  const [receiptOpen,setReceiptOpen]=useState(false);
  const [comicId,setComicId]=useState(null);
  const [mood,setMood]=useState('探索未知');
  const [suggestion,setSuggestion]=useState(null);
  const shelf=useRef(null),fileInput=useRef(null);
  const album=albums[albumIndex];
  const player=usePlayer({album,power,onNotice:setNotice,onCredit:track=>{
    setState(p=>hearTale(recordAdventure(recordListen(recordSound(p,track),track),{id:track.id,title:track.title,genre:track.genre,albumCode:track.albumCode}),track));
    if(!state.claimed&&!state.listened.some(t=>t.id===track.id))setNotice(`已真实聆听「${track.title}」· +120 XP 待结算`);
  }});
  const level=1+Math.floor(state.xp/2000),levelProgress=state.xp%2000;
  const game=gameFor(state);
  const taleId=selectedTale??tales.find(t=>t.region===selectedRegion&&journalFor(state).quests[t.id]?.status!=='claimed')?.id??selectedRegion;
  const displayAlbum=player.source==='voyage'?albums.find(a=>a.code===player.track?.albumCode)||album:album;
  const reward=rewards(state),displayReward=state.claimed?state.receipt:reward;
  const results=useMemo(()=>albums.filter(a=>`${a.title} ${a.artist} ${a.genre} ${regions[a.region].name}`.toLowerCase().includes(search.toLowerCase())).filter(a=>filter==='all'||(filter==='recent'?state.viewed.includes(a.code):a.genre===filter)),[search,filter,state.viewed]);

  useEffect(()=>{try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{setNotice('当前浏览器无法保存进度，此次会话仍可继续。');}},[state]);
  useEffect(()=>{const timer=setInterval(()=>setState(p=>p.day===dateKey()?p:{...archiveSound(p),day:dateKey(),listened:[],viewed:[],claimed:false,receipt:null}),60000);return()=>clearInterval(timer);},[]);
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),5000);return()=>clearTimeout(timer);},[notice]);
  useEffect(()=>{if(power!=='booting'&&power!=='closing')return;const timer=setTimeout(()=>setPower(power==='booting'?'on':'off'),power==='booting'?1500:380);return()=>clearTimeout(timer);},[power]);
  useEffect(()=>{
    const mobile=window.matchMedia('(max-width: 700px)');let frame;
    const update=()=>{
      frame=null;if(!mobile.matches)return;
      const sections=mobileDestinations.map(([id])=>({id,top:document.getElementById(id)?.getBoundingClientRect().top??Infinity})).sort((a,b)=>a.top-b.top);
      const passed=sections.filter(s=>s.top<=window.innerHeight*.3);
      setNav(passed.at(-1)?.id||'terminal');
    };
    const request=()=>{if(frame==null)frame=requestAnimationFrame(update);};
    window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request);request();
    return()=>{window.removeEventListener('scroll',request);window.removeEventListener('resize',request);if(frame!=null)cancelAnimationFrame(frame);};
  },[]);
  useEffect(()=>{
    const element=shelf.current;if(!element||!results.length)return;
    element.scrollLeft=element.firstElementChild.offsetWidth;
    const wheel=e=>{if(!e.deltaX&&!e.deltaY)return;e.preventDefault();element.scrollLeft+=e.deltaY||e.deltaX;setHovered(null);};
    element.addEventListener('wheel',wheel,{passive:false});return()=>element.removeEventListener('wheel',wheel);
  },[results]);

  function navigate(id){setNav(id);document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});}
  function choose(next,goToPlayer=false){setAlbumIndex(albums.indexOf(next));player.switchAlbum();setHovered(null);setState(p=>p.claimed||p.viewed.includes(next.code)?p:{...p,viewed:[...p.viewed,next.code]});if(goToPlayer){setScreen('music');navigate('terminal');}}
  function wrapShelf(){const element=shelf.current;if(!element?.firstElementChild)return;const width=element.firstElementChild.offsetWidth;if(element.scrollLeft<width/2)element.scrollLeft+=width;else if(element.scrollLeft>width*1.5)element.scrollLeft-=width;}
  function togglePower(){if(power==='on'){player.audio.current?.pause();setPower('closing');}else if(power==='off')setPower('booting');}
  function startExpedition(slots){
    if(power!=='on'||new Set(slots).size!==3||game.voyageClaimed||game.voyage.status==='complete')return;
    const route=game.voyage.status==='active'?game.voyage.slots:slots;
    const tracks=route.slice(game.voyage.status==='active'?game.voyage.cursor:0).map(id=>allTracks.find(t=>t.id===id));
    if(tracks.some(t=>!t))return;
    setState(p=>beginVoyage(p,slots));player.startVoyage(tracks);setScreen('music');navigate('terminal');setNotice('远征已启航：按顺序真实聆听三站，领取经验与探索钥匙。');
  }
  function claim(){if(state.claimed){setReceiptOpen(true);return;}if(!reward.total)return;setState(claimRewards);setReceiptOpen(true);}
  function selectTale(id){setSelectedRegion(tales[id].region);setSelectedTale(id);document.querySelector('.field-notes')?.scrollIntoView({behavior:'smooth'});}
  function listenTale(id){const t=tales[id],q=journalFor(state).quests[id],heard=q?.heard||[];const choices=albums.filter(a=>t.genres.includes(a.genre));const next=choices.find(a=>t.kind==='genres'?!heard.some(h=>h.genre===a.genre):t.kind==='albums'?!heard.some(h=>h.albumCode===a.code):true)||choices[0];if(next)choose(next,true);}
  function unlock(){if(selectedRegion!==state.frontier){setNotice('请沿航线依次解锁相邻海域。');return;}if(!state.keys){setNotice('探索钥匙不足。完成今日聆听并结算可获得一枚。');return;}setState(p=>unlockRegion(p,selectedRegion));setNotice(`${regions[selectedRegion].name} 已解锁 · 迷雾消散`);}
  function recommend(){const genres=mood==='安静专注'?['AMBIENT','IDM','ELECTRONIC']:mood==='蓄满能量'?['ALT ROCK','SOUL','JAZZ']:['DREAM POP','ART POP','TRIP-HOP'];const next=albums.find(a=>genres.includes(a.genre)&&!state.listened.some(t=>t.albumCode===a.code)&&a.code!==suggestion?.code)||albums.find(a=>genres.includes(a.genre));setSuggestion(next);choose(next,true);}
  const currentRegion=regions[selectedRegion],unlocked=selectedRegion<state.frontier;
  const firstTrackName=player.track?.title||'选择你的第一段声音';
  const statusLabel=power==='on'?'SYSTEM ONLINE':power==='booting'?'BOOTING':power==='closing'?'SHUTTING DOWN':'STANDBY';

  return <main className="app-shell">
    <audio ref={player.audio} {...player.events} preload="metadata" playsInline/>
    <input className="visually-hidden" type="file" ref={fileInput} multiple accept="audio/*,.mp3,.m4a,.aac,.wav,.ogg,.flac" onChange={e=>{player.importFiles(e.target.files);e.target.value='';setScreen('music');}} aria-label="导入本地音乐文件"/>
    <header className="topbar"><a href="#terminal" className="brand" onClick={e=>{e.preventDefault();navigate('terminal');}}><Icon name="spark"/><span>SONORA<small>声之旷野 / MUSIC RPG</small></span></a><nav aria-label="主导航">{[['terminal','knight','TERMINAL','骑士终端'],['archive','audio','ARCHIVE','专辑档案'],['world','world','EXPLORE','音乐世界'],['adventure','play','PLAY','玩法远征']].map(([id,icon,en,cn])=><button key={id} aria-current={nav===id?'location':undefined} className={nav===id?'active':''} onClick={()=>navigate(id)}><Icon name={icon}/><span>{en}<small>{cn}</small></span></button>)}</nav><span className={`system-state ${power==='on'?'online':''}`}><i/>{statusLabel}</span></header>

    <section className="intro"><div><p className="eyebrow">A PERSONAL SOUND EXPLORATION SYSTEM — VOL. 003</p><h1>LISTEN. LEVEL UP.<br/><span>GO BEYOND.</span></h1></div><div className="intro-aside"><p>把每一次聆听，<br/>变成向世界边界迈出的一步。</p><div className="color-key"><span><i className="green"/>在线 / 已解锁</span><span><i className="amber"/>待领取</span><span><i/>锁定 / 待机</span></div></div></section>

    <Armory state={state} onEquip={id=>{setState(p=>id==='upgrade'?forge(p):equip(p,id));setScreen('knight');setNotice(id==='upgrade'?'强化完成 · 装备等级 +1':'实时穿搭已更新 · 已保存到骑士档案');}}/>

    <section id="terminal" className={`console ${power}`} aria-label="复古音乐骑士终端">
      <div className="console-label"><span>01 / PERSONAL LISTENING STATION</span><span>STEREO · MODEL S—07</span></div>
      <div className="console-brand"><span className="engraved-lines"/><strong>SONORA SYSTEMS<small>HIGH FIDELITY ADVENTURE</small></strong><span className="engraved-lines"/><button className={`power-key ${power==='on'?'active':''}`} onClick={togglePower} disabled={power==='booting'||power==='closing'} aria-label={power==='on'?'关闭终端电源':'打开终端电源'}><Icon name="power"/><small>{power==='on'?'ON':'OFF'}</small></button></div>
      <div className="console-body">
        <aside className="device-left"><p className="device-label">DISPLAY SELECT / 显示模式</p><div className="key-row"><button className={`physical-key ${screen==='knight'?'selected':''}`} onClick={()=>setScreen('knight')}><Icon name="knight"/><span>KNIGHT</span></button><button className={`physical-key ${screen==='music'?'selected':''}`} onClick={()=>setScreen('music')}><Icon name="audio"/><span>MUSIC</span></button></div>
          <div className="hardware-group"><p className="device-label">PHOSPHOR / 荧光色</p><div className="key-row colors">{[['green','绿色'],['amber','琥珀'],['white','冷白']].map(([value,label])=><button key={value} aria-label={`${label}荧光屏`} className={`physical-key ${tint===value?'selected':''}`} onClick={()=>setTint(value)}><i className={value}/></button>)}</div></div>
          <div className="hardware-group"><label className="device-label" htmlFor="brightness">BRIGHTNESS / 亮度 <b>{brightness}%</b></label><input id="brightness" type="range" min="35" max="100" value={brightness} onChange={e=>setBrightness(+e.target.value)}/></div>
          <div className="hardware-group"><p className="device-label">YOUR LOADOUT / 当前装备</p><button className="equipment-key" onClick={()=>navigate('armory')}><Icon name="knight"/><span>{equipped(state,'weapon').name}<small>UPGRADE +{state.equipment}</small></span></button><button className="equipment-key" onClick={()=>navigate('world')}><Icon name="lock"/><span>探索钥匙<small>{String(state.keys).padStart(2,'0')} AVAILABLE</small></span></button></div>
          <button className="physical-key import-key" onClick={()=>fileInput.current.click()}>IMPORT AUDIO<small>导入本地完整音轨</small></button>
        </aside>

        <div className={`crt-housing tint-${tint}`}>
          <img className="bezel-image" src="/assets/crt-bezel.png" alt="奶油色复古 CRT 显示器外壳"/>
          <div className={`crt-screen ${power}`} style={{'--brightness':brightness/100}}>
            <div className="screen-content">
              {power==='booting'?<div className="boot-screen"><Icon name="power"/><h3>SONORA OS</h3><p>INITIALIZING AUDIO ENGINE...</p><p>MEMORY CHECK ........ OK</p><p>LOADING YOUR ADVENTURE</p><div className="boot-meter"><span/></div><small>请稍候，正在连接音乐世界</small></div>:
              (power==='on'||power==='closing')?<><div className="screen-top"><span>S—07 / {screen==='knight'?'PLAYER DOSSIER':'NOW PLAYING'}</span><span>{player.playing?'SIGNAL ACTIVE':'READY'}</span></div>
                {screen==='knight'?<div className="knight-display"><img className="knight-landscape" src="/assets/knight-lakeside.png" alt="像素风湖畔村庄与山脉背景"/><div className="screen-title"><p>PALADIN OF SOUND</p><h2>旷野漫游者</h2></div><div className="knight-body"><WardrobeAvatar state={state} className="crt-avatar"/><div className="screen-stats"><span>LEVEL</span><strong>{String(level).padStart(2,'0')}</strong><span>EXPERIENCE</span><b>{fmt(state.xp)}</b><span>REGIONS</span><b>{state.frontier} / 6</b></div></div><div className="screen-xp"><span>NEXT LEVEL</span><span>{2000-levelProgress} XP</span></div><div className="screen-meter"><span style={{width:`${levelProgress/20}%`}}/></div></div>:
                <div className="music-display">{player.source==='local'?<Icon name="audio" className="local-art"/>:<img src={displayAlbum.cover} alt={`${displayAlbum.title} 封面`}/>}<span>{player.source==='local'?'LOCAL AUDIO / 完整音轨':player.source==='voyage'?`EXPEDITION / ${displayAlbum.genre}`:`APPLE PREVIEW / ${displayAlbum.genre}`}</span><h2>{firstTrackName}</h2><p>{player.source==='local'?player.track?.artist:player.source==='voyage'?player.track?.artist:displayAlbum.artist}</p><div className={`signal-bars ${player.playing?'playing':''}`} aria-hidden="true">{Array.from({length:24},(_,i)=><i key={i} style={{'--bar':`${18+(i*31)%82}%`,'--delay':`${i*.07}s`}}/>)}</div></div>}
                <div className="screen-bottom"><span>{player.playing?'PLAYING':'IDLE'} / {clock(player.elapsed)}</span><span>{player.source==='local'?'LOCAL FILE':'OFFICIAL PREVIEW'}</span></div></>:null}
            </div><div className="scanlines"/>
          </div>
          <div className={`power-led ${power==='on'?'lit':''}`}/>
        </div>

        <aside className="device-right"><div className="queue-heading"><p className="device-label">{player.source==='voyage'?'EXPEDITION ROUTE / 远征路线':'LOADED RECORD / 已装载唱片'}</p><span>{player.queue.length} TRACKS</span></div><h3>{player.source==='local'?'Local collection':player.source==='voyage'?'三曲远征歌单':displayAlbum.title}</h3><p className="device-artist">{player.source==='local'?'仅本机播放，不上传文件':player.source==='voyage'?'三首歌，三站旅程 · 按顺序聆听':`${displayAlbum.artist} · ${displayAlbum.year}`}</p>
          <div className="track-queue" aria-label="专辑曲目列表">{player.queue.map((track,i)=><button key={track.id} className={i===player.index?'selected':''} onClick={()=>{player.selectTrack(i);setScreen('music');if(player.source==='catalog')setState(p=>p.claimed||p.viewed.includes(album.code)?p:{...p,viewed:[...p.viewed,album.code]});}} aria-label={`播放 ${track.title}`}><span>{String(i+1).padStart(2,'0')}</span><strong>{track.title}</strong><small>{player.source==='local'?'FILE':'试听'}</small></button>)}</div>
          <div className="source-note">{player.source==='catalog'?<><span>真实音频 / 官方试听片段</span><a href={displayAlbum.source} target="_blank" rel="noreferrer">在 Apple Music 收听完整专辑</a></>:player.source==='voyage'?<><span>真实音频 / 三站官方试听</span><button onClick={()=>player.switchAlbum()}>返回唱片档案</button></>:<><span>本地完整音轨 / 仅保留至页面关闭</span><button onClick={()=>player.switchAlbum()}>返回官方专辑试听</button></>}</div>
          <div className="sound-controls"><label htmlFor="volume">VOLUME <span>{Math.round(player.volume*100)}%</span></label><input id="volume" aria-label="音量" type="range" min="0" max="1" step=".01" value={player.volume} onChange={e=>player.setVolume(+e.target.value)}/><button className={`mute-key ${player.muted?'muted':''}`} aria-label={player.muted?'取消静音':'静音'} onClick={()=>player.setMuted(!player.muted)}>{player.muted?'MUTED':'STEREO'}</button></div>
        </aside>
      </div>
      <div className="deck-transport"><div className="transport-keys"><button className="physical-key" aria-label="上一首" disabled={power!=='on'||player.index===0} onClick={()=>player.selectTrack(player.index-1)}>PREV</button><button className="physical-key play-key" disabled={power!=='on'||!player.track} onClick={()=>{void player.toggle();setScreen('music');}} aria-label={player.playing?'暂停音乐':'播放音乐'}><Icon name={player.playing?'audio':'play'}/><span>{player.loading?'LOADING':player.playing?'PAUSE':'PLAY'}</span></button><button className="physical-key" aria-label="下一首" disabled={power!=='on'||player.index>=player.queue.length-1} onClick={()=>player.selectTrack(player.index+1)}>NEXT</button></div><div className="seek-control"><div><span>{firstTrackName}</span><span>{clock(player.elapsed)} / {clock(player.duration)}</span></div><input aria-label="播放进度" type="range" min="0" max={player.duration||1} step=".1" value={Math.min(player.elapsed,player.duration||1)} disabled={!player.duration||power!=='on'} onChange={e=>player.seek(e.target.value)}/></div><div className="deck-stamp"><span>LISTEN TO EXPLORE</span><small>有效播放 20 秒 · +120 XP</small></div></div>
      {player.error&&<div className="audio-error" role="alert">{player.error}<button onClick={()=>void player.toggle()}>重试播放</button></div>}
      <div className="console-foot"><span>DESIGNED FOR CURIOUS EARS</span><span>POWER / {statusLabel}</span><span>EST. 2026 — SONORA AUDIO LAB</span></div>
    </section>

    <section id="archive" className="archive-section"><SectionTitle number="02" icon="audio" title="THE RECORD ARCHIVE" subtitle="唱片档案 / SCROLL TO DISCOVER"><span className="count-label">{String(results.length).padStart(2,'0')} RECORDS / {String(results.reduce((sum,item)=>sum+item.tracks.length,0)).padStart(3,'0')} PREVIEWS</span></SectionTitle>
      <p className="mobile-hint">左右滑动唱片架 · 点选封面查看，再装载到终端</p>
      <div className="archive-tools"><label className="search-field"><Icon name="search"/><input aria-label="搜索专辑、音乐人或流派" placeholder="SEARCH BY ARTIST, ALBUM OR GENRE / 搜索音乐" value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button onClick={()=>setSearch('')}>清空</button>}</label><select aria-label="筛选专辑" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">ALL GENRES / 全部</option><option value="recent">RECENT / 最近查阅</option>{[...new Set(albums.map(a=>a.genre))].map(genre=><option key={genre} value={genre}>{genre}</option>)}</select><div className="shelf-arrows"><button aria-label="上一组专辑" disabled={!results.length} onClick={()=>shelf.current.scrollLeft-=350}>PREV</button><button aria-label="下一组专辑" disabled={!results.length} onClick={()=>shelf.current.scrollLeft+=350}>NEXT</button></div></div>
      <div className="shelf-frame" onMouseLeave={()=>setHovered(null)}>{hovered&&<div className="album-tooltip" role="tooltip"><img src={hovered.cover} alt=""/><div><span>{hovered.genre} / {hovered.year}</span><strong>{hovered.title}</strong><p>{hovered.note}</p><small>{hovered.tracks.length} 首官方试听 · 点击装载</small></div></div>}
      {results.length?<div className="album-library" ref={shelf} onScroll={wrapShelf} aria-label="循环专辑库">{[0,1,2].map(group=><div className="shelf-group" key={group} aria-hidden={group!==1?true:undefined}>{results.map(item=><button tabIndex={group===1?0:-1} className={`album-card ${item.code===album.code?'selected':''}`} key={item.code} aria-label={`查阅 ${item.title}`} onMouseEnter={()=>setHovered(item)} onFocus={()=>setHovered(item)} onBlur={()=>setHovered(null)} onClick={()=>choose(item)}><img src={item.cover} alt=""/><span className="spine-name">{item.artist}</span><small>{item.code}</small></button>)}</div>)}</div>:<div className="empty-state"><Icon name="search"/><h3>NO SIGNAL FOUND</h3><p>未找到唱片，试试其他音乐人或流派。</p><button onClick={()=>{setSearch('');setFilter('all');}}>清除筛选</button></div>}</div>
      <div className="archive-caption"><div><p>{album.artist} / {album.year}</p><h3>{album.title}</h3></div><span>{album.note}</span><button onClick={()=>{setScreen('music');navigate('terminal');}}>OPEN IN TERMINAL <Icon name="play"/></button></div>
      <div className="guide-strip"><Icon name="spark"/><div><strong>YOUR NEXT DISCOVERY</strong><p>{suggestion?`推荐 ${suggestion.title}：${suggestion.note}`:'选择现在的心情，让音乐向导带你驶向下一片海域。'}</p></div><select aria-label="推荐心情" value={mood} onChange={e=>setMood(e.target.value)}><option>探索未知</option><option>安静专注</option><option>蓄满能量</option></select><button onClick={recommend}>为我选片</button><small>本地规则推荐</small></div>
    </section>

    <section id="world" className="world-section"><SectionTitle number="03" icon="world" title="THE WORLD OF SOUND" subtitle="音乐世界海 / EVERY SOUND IS A PLACE"><div className="map-summary"><span>{state.frontier} / 6 DISCOVERED</span><span><Icon name="lock"/>{state.keys} KEY{state.keys!==1?'S':''}</span></div></SectionTitle>
      <div className="world-layout" style={{'--map-zoom':zoom}}><div className="map-view"><div className="map-toolbar"><span>SONORA ATLAS / SEASON 01</span><div><button aria-label="缩小地图" onClick={()=>setZoom(z=>Math.max(1,z-.25))} disabled={zoom===1}>−</button><span>{Math.round(zoom*100)}%</span><button aria-label="放大地图" onClick={()=>setZoom(z=>Math.min(1.75,z+.25))} disabled={zoom===1.75}>+</button><button onClick={()=>setZoom(1)}>复位</button></div></div><p className="mobile-hint map-hint">左右滑动探索海域 · 点选图钉查看详情</p><div className="map-scroll" tabIndex={0} aria-label="音乐地图，可左右滑动"><div className="map-canvas" style={{width:`${zoom*100}%`}}><img className="relief-map" src="/assets/world-biomes.png" alt="六个地形各异的立体音乐海域：暖港、晶洞、紫色湿地、粉色梦境、火山岩与冰川灯塔"/><div className="fog-grid" aria-hidden="true">{regions.map((r,i)=><div key={r.name} className={`fog-cell ${i<state.frontier?'revealed':''}`}/>)}</div>{regions.map((r,i)=><button key={r.name} className={`map-pin ${i<state.frontier?'unlocked':'locked'} ${selectedRegion===i?'selected':''}`} style={{left:`${r.x}%`,top:`${r.y}%`}} onClick={()=>{setSelectedRegion(i);setSelectedTale(null);}} aria-label={`${r.name}，${i<state.frontier?'已解锁':'未解锁'}`}><span className="pin-picture">{i<state.frontier?<img src={albums[r.album].cover} alt=""/>:<Icon name="lock"/>}</span><strong>{i<state.frontier?r.name:`未知海域 0${i+1}`}</strong><small>{i<state.frontier?r.genre:'FOG OF WAR'}</small></button>)}{regions.map((r,i)=>i<state.frontier&&<button className="creature-pin" key={'creature'+i} style={{left:`${r.x+9}%`,top:`${r.y-10}%`}} aria-label={`遇见${creatures[i].name}`} onClick={()=>{setSelectedRegion(i);setSelectedTale(null);document.querySelector('.field-notes')?.scrollIntoView({behavior:'smooth'});}}><CreatureArt region={i}/><span>奇闻</span></button>)}</div></div><div className="map-legend"><span><i className="green"/>已发现</span><span><i className="amber"/>可探索</span><span><i/>迷雾区域</span><span>六种差异地貌 · 放大后可横向滚动</span></div></div>
        <aside className="world-sidebar"><div className="region-details"><div className="region-kicker"><Icon name={unlocked?'world':'lock'}/><span>REGION 0{selectedRegion+1} / {unlocked?'UNLOCKED':'UNMAPPED'}</span></div><h3>{currentRegion.name}</h3><p>{currentRegion.en}</p><span className="region-genre">{currentRegion.genre}</span><p className="region-note">{unlocked?albums[currentRegion.album].note:'浓雾遮住了远处的声音。使用一枚探索钥匙，点亮下一段航线。'}</p>{unlocked?<button className="outline-button" onClick={()=>choose(albums[currentRegion.album],true)}>聆听这片海域</button>:<button className="outline-button amber-button" onClick={unlock} disabled={selectedRegion!==state.frontier||state.keys<1}>{selectedRegion!==state.frontier?'请先解锁前一海域':state.keys<1?'钥匙不足 · 先完成结算':'消耗 1 枚钥匙 · 驱散迷雾'}</button>}<small>{unlocked?'探索进度已保存':`持有 ${state.keys} 枚钥匙 · 每日分档收获获得 1–3 枚`}</small></div>
        <div id="settlement" className="settlement"><p className="reward-preview-label">{state.claimed?(state.receipt?.loot?.title||'探索收获'):reward.total?tierFor(reward.total).name:'开始聆听，积攒收获'} / 每日收获等级</p><p className="eyebrow">DAILY EXPEDITION / {state.day}</p><div className="xp-total"><strong>+{fmt(displayReward?.total||0)}</strong><span>XP</span></div><dl><div><dt>真实聆听 {state.listened.length} 首</dt><dd>+{displayReward?.listen||0}</dd></div><div><dt>查阅 CD {state.viewed.length} 张</dt><dd>+{displayReward?.browse||0}</dd></div><div><dt>发现新流派</dt><dd>+{displayReward?.discovery||0}</dd></div></dl><button className="settle-button" disabled={!reward.total&&!state.claimed} onClick={claim}>{state.claimed?'查看今日战报':'结算 · 向边界进攻'}<Icon name="knight"/></button><p>{state.claimed?'今日已领取 · 奖励与装备已保存':'有效播放 20 秒计入聆听；短于 25 秒的音轨需实际听完 80%。'}</p><details><summary>查看今日聆听记录</summary>{state.listened.length?state.listened.map(t=><div className="log-entry" key={t.id}><span>{t.title}</span><small>+120 XP</small></div>):<p>播放一首音乐，开始今天的远征。</p>}</details></div></aside>
      </div>
    </section>

    <FieldNotes state={state} region={selectedRegion} taleId={taleId} onSelectTale={selectTale} onStrike={move=>setState(p=>strike(p,selectedRegion,move))} onRetry={()=>setState(p=>retryBattle(p,selectedRegion))} onAccept={id=>{setState(p=>acceptTale(p,id));setNotice('已接取奇闻，聆听任务流派即可推进。');}} onListen={listenTale} onClaim={id=>{setState(p=>claimTale(p,id));setComicId(id);}} onComic={setComicId}/>

    <Adventure handbook={{state,onPage:n=>setState(p=>turnPage(p,n)),onBookmark:id=>setState(p=>bookmarkPage(p,id)),onStamp:(id,x,y,ink)=>setState(p=>stampPage(p,id,x,y,ink)),onNote:(id,text)=>setState(p=>notePage(p,id,text)),onAlbum:code=>{const next=albums.find(a=>a.code===code);if(next)choose(next,true);}}} game={game} power={power} onQuest={id=>{setState(p=>claimQuest(p,id));setNotice('探索委托完成 · 经验已加入骑士档案。');}} onEdit={slots=>setState(p=>editVoyage(p,slots))} onStart={startExpedition} onCancel={()=>{player.audio.current?.pause();setState(p=>cancelVoyage(p));setNotice('远征已暂停，三站路线仍保留。');}} onClaim={()=>{setState(p=>claimVoyage(p));setNotice('远征宝箱已开启 · +300 XP · +1 探索钥匙。');}} />

    <SoundLandscape state={state} playing={player.playing}/>

    <section className="icon-directory"><div><p className="eyebrow">SYSTEM LANGUAGE / 符号与颜色</p><h2>SMALL SIGNALS.<br/>CLEAR MEANING.</h2><p>圆点构成符号，颜色说明状态。</p></div><div className="icon-grid">{[['audio','LISTEN','真实聆听','green'],['world','DISCOVER','探索海域','green'],['knight','UPGRADE','经验与装备','amber'],['search','SEARCH','搜索唱片',''],['play','PLAY','播放音轨','green'],['power','POWER','终端电源',''],['lock','LOCKED','迷雾与锁定','muted'],['spark','GUIDE','音乐向导','amber']].map(([icon,title,desc,color])=><div key={icon} className={color}><Icon name={icon}/><span>{title}<small>{desc}</small></span></div>)}</div></section>
    <footer className="footer"><span>SONORA SYSTEMS © 2026</span><span>官方试听由 Apple 提供 / 本地文件不会上传</span><button onClick={()=>{player.audio.current?.pause();setState(fresh());setNotice('探索进度已重置：3 片已发现海域，1 枚初始钥匙。');}}>重置探索进度</button><span>KEEP YOUR EARS OPEN.</span></footer>
    {notice&&<div className="toast" role="status"><Icon name="spark"/>{notice}</div>}
    <MobileDock player={player} power={power} album={displayAlbum} nav={nav} onNavigate={navigate} onDisplay={()=>setScreen('music')} Icon={Icon}/>
    <HarvestCard open={receiptOpen} onClose={()=>setReceiptOpen(false)} state={state} onExplore={()=>{setReceiptOpen(false);navigate('world');}}/>
    <ComicCard id={comicId} onClose={()=>setComicId(null)}/>
  </main>;
}
