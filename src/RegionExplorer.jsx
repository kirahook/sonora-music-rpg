import {useEffect,useMemo,useRef,useState} from 'react';
import {albums,regions} from './catalog';
import {atlasCards,canExploreRegion,cityArt,nextCard,regionAtlas,swipeDirection} from './regionAtlas.js';
import {HoloCard} from './HoloCard.jsx';
import {holoArtStyle,holoThemes,normalizedLook} from './holoArt.js';
import {cardTreatment} from './fieldPresentation.js';
import {FieldProp} from './FieldMarks.jsx';

const filters=[['all','全部'],['album','专辑'],['artist','音乐家'],['concept','听觉词条']];
export function FlashDeck({region,onAlbum}){
 const [filter,setFilter]=useState('all'),[index,setIndex]=useState(0),[flipped,setFlipped]=useState(false),[drag,setDrag]=useState(0);
 const [renderStatus,setRenderStatus]=useState('loading'),[auto,setAuto]=useState(true),[foil,setFoil]=useState(.85),[reduced,setReduced]=useState(false);
 const motion=useRef({x:0,y:0,flipped:false,auto:true,paused:false,reduced:false,foil:.85,depth:1});
 Object.assign(motion.current,{flipped,auto,paused:!auto,reduced,foil,depth:1});
 useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)'),sync=()=>setReduced(q.matches);sync();q.addEventListener('change',sync);return()=>q.removeEventListener('change',sync);},[]);
 function look(x,y){Object.assign(motion.current,normalizedLook(x,y));motion.current.invalidate?.();}
 const pointer=useRef(null),suppress=useRef(false),cardRef=useRef(null);
 const deck=useMemo(()=>atlasCards(region,albums),[region]),cards=deck.filter(c=>filter==='all'||c.type===filter),card=cards[index]||cards[0];
 function move(direction){setIndex(i=>nextCard(i,direction,cards.length));setFlipped(false);setDrag(0);resetTilt();}
 function resetTilt(){look(0,0);const el=cardRef.current;if(el){el.style.setProperty('--tilt-x','0deg');el.style.setProperty('--tilt-y','0deg');el.style.setProperty('--glare-x','50%');}}
 function onDown(e){if(e.button!==0)return;pointer.current={id:e.pointerId,x:e.clientX,y:e.clientY,captured:false};suppress.current=false;}
 function onMove(e){
  const p=pointer.current,el=e.currentTarget,r=el.getBoundingClientRect();
  if(e.pointerType==='mouse'&&!p){look((e.clientX-r.left)/r.width*2-1,(e.clientY-r.top)/r.height*2-1);el.style.setProperty('--tilt-x',((e.clientY-r.top)/r.height-.5)*-9+'deg');el.style.setProperty('--tilt-y',((e.clientX-r.left)/r.width-.5)*12+'deg');el.style.setProperty('--glare-x',(e.clientX-r.left)/r.width*100+'%');}
  if(!p||p.id!==e.pointerId)return;
  const dx=e.clientX-p.x,dy=e.clientY-p.y;
  if(!p.captured&&Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)){el.setPointerCapture(e.pointerId);p.captured=true;suppress.current=true;}
  if(p.captured)setDrag(Math.max(-150,Math.min(150,dx)));
 }
 function onUp(e){const p=pointer.current;if(!p||p.id!==e.pointerId)return;const direction=swipeDirection(e.clientX-p.x,e.clientY-p.y);pointer.current=null;if(p.captured&&direction)move(direction);else setDrag(0);}
 function onCancel(){pointer.current=null;setDrag(0);resetTilt();}
 const selected=albums.find(a=>a.code===card.album),artPage=[0,4,3,6,1,7][region];
 return <section className="atlas-deck" aria-label="海域音乐闪卡">
  <div className="atlas-section-head"><div><p className="eyebrow">THE POCKET INDEX / 口袋音乐索引</p><h3>把一段声音，握在手里。</h3></div><span>{deck.length} 张 / 本海域</span></div>
  <div className="atlas-filters" aria-label="闪卡类别">{filters.map(([id,label])=><button key={id} aria-pressed={filter===id} onClick={()=>{setFilter(id);setIndex(0);setFlipped(false);}}>{label}<small>{id==='all'?deck.length:deck.filter(c=>c.type===id).length}</small></button>)}</div>
  <div className="flash-layout">
   <div className="flash-stage" onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();move(1);}if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}}}>
    <div className="flash-stack" aria-hidden="true"/><div className="flash-stack second" aria-hidden="true"/>
    <button ref={cardRef} className={'music-flashcard holographic-card holo-'+renderStatus+' '+(flipped?'is-flipped':'')} style={{'--drag':drag+'px','--holo-ink':holoThemes[region].ink}}
     onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onCancel} onPointerLeave={()=>{if(!pointer.current)resetTilt();}}
     onClick={()=>{if(suppress.current){suppress.current=false;return;}setFlipped(v=>!v);}} aria-pressed={flipped} aria-label={(flipped?'翻回正面：':'翻看背面：')+card.title}>
     <HoloCard card={card} region={region} number={index+1} motion={motion} onStatus={setRenderStatus}/>
     <span className="flash-turner" aria-hidden="true">
      <span className="flash-face flash-front" aria-hidden={flipped}>
       <span className="flash-meta"><span>{card.label}</span><span>0{region+1} / {String(index+1).padStart(2,'0')}</span></span>
       {card.cover?<img className="flash-cover" src={card.cover} alt="" draggable="false"/>:card.type==='artist'?<span className="flash-portrait" style={{backgroundPosition:`${artPage%4*100/3}% ${Math.floor(artPage/4)*100}%`}}/>:<span className="flash-city-art" style={cityArt(region)}/>}
       {card.type==='artist'&&<small className="flash-art-caption">流派意象插画 · 非本人肖像</small>}
       {card.type==='concept'&&<span className="flash-front-note">{card.body}</span>}
       <span className="flash-title">{card.title}</span><span className="flash-subtitle">{card.subtitle}</span><span className="flash-bottom">SONORA / FIELD CARD<span>点按翻面</span></span>
      </span>
      <span className="flash-face flash-back" aria-hidden={!flipped}><span className="flash-meta">{card.label} / FIELD NOTES</span><strong>{card.title}</strong><span className="flash-body">{card.body}</span><span className="flash-back-note">一次只追踪一种声音。先听见，再命名。</span><span className="flash-bottom">NO. {String(index+1).padStart(2,'0')}<span>点按翻回</span></span></span>
     </span>
    </button>
   </div>
   <div className="flash-reading">
    <div className="card-kind-label"><FieldProp name={card.type==='album'?'record':card.type==='artist'?'letter':'map'}/>{cardTreatment(card.type).name}</div>
    <p className="eyebrow">{card.label} / {holoThemes[region].en}</p><h4 aria-live="polite">{card.title}</h4><p>{card.subtitle}</p>
    <p className="flash-selected-note">{card.body}</p>
    <div className="holo-material-badges"><span>立体视差</span><span>光栅镭射</span><span>金属包边</span><span>{renderStatus==='ready'?'实时 3D 材质':renderStatus==='fallback'?'静态美术模式':'材质载入中'}</span></div>
    <div className="holo-inspect-controls" aria-label="闪卡材质交互"><div><button aria-label="预览左侧视差" onClick={()=>{setAuto(false);look(-.95,.2);}}>左侧视差</button><button aria-label="闪卡正面居中" onClick={()=>{setAuto(false);look(0,0);}}>居中</button><button aria-label="预览右侧视差" onClick={()=>{setAuto(false);look(.95,-.2);}}>右侧视差</button></div><label>镭射强度<output>{Math.round(foil*100)}%</output><input aria-label="镭射强度" type="range" min="0" max="1.4" step="0.05" value={foil} onChange={e=>setFoil(Number(e.target.value))}/></label><button className="holo-auto" disabled={reduced} aria-pressed={auto&&!reduced} onClick={()=>setAuto(v=>!v)}>{reduced?'跟随系统 · 减少动态':auto?'暂停材质演示':'播放材质演示'}</button></div>
    <div className="flash-controls"><button onClick={()=>move(-1)} aria-label="上一张闪卡">上一张</button><output aria-live="polite">{String(index+1).padStart(2,'0')} / {String(cards.length).padStart(2,'0')}</output><button onClick={()=>move(1)} aria-label="下一张闪卡">下一张</button></div>
    <p className="flash-instructions">点按翻面 · 横向滑动换卡 · 左右键换卡<br/>移动鼠标或点选视差角度，观察前景、建筑与反光的不同位移。</p>
    <p className="card-art-explainer">{card.type==='album'?'唱片藏品：真实专辑封面与唱片装帧，翻面阅读唱片札记。':card.type==='artist'?'音乐家档案：原创流派守护者意象，非本人肖像；从作品认识创作者。':'听觉观察札记：蓝晒手稿与聆听练习，记录一种声音的观察方式。'}</p>
    <p className="flash-art-caption">{card.type==='artist'?'原创流派守护者意象 · 非本人肖像 / 非装备奖励':card.type==='album'?'专辑封面来自 Apple Music · 知识索引 / 非装备奖励':'原创蓝晒装帧 · 观察与练习 / 非装备奖励'}</p>
    <button className="primary-button" onClick={()=>onAlbum(selected)}>装载代表专辑 · 不自动播放</button>
    {card.source?.[1]&&<a href={card.source[1]} target="_blank" rel="noreferrer">{card.source[0]} ↗</a>}
    <small>浏览与演示不增加经验，不消耗钥匙。卡牌是知识索引，不是装备奖励。</small>
   </div>
  </div>
 </section>;
}

export function RegionExplorer({state,region,onClose,onAlbum}){
 const dialog=useRef(null),title=useRef(null),returnTo=useRef(null);
 const [node,setNode]=useState(0),[zoom,setZoom]=useState(1),[playing,setPlaying]=useState(false);
 const permitted=canExploreRegion(state,region),atlas=regionAtlas[region],place=regions[region];
 useEffect(()=>{
  if(!permitted)return;
  returnTo.current=document.activeElement;const el=dialog.current,body=document.body,scrollY=window.scrollY;
  const previous={overflow:body.style.overflow,position:body.style.position,top:body.style.top,width:body.style.width};
  // Fixed-body locking also prevents the page behind a dialog drifting on iOS.
  Object.assign(body.style,{overflow:'hidden',position:'fixed',top:-scrollY+'px',width:'100%'});
  el.showModal();title.current.focus({preventScroll:true});
  return()=>{Object.assign(body.style,previous);el.close();window.scrollTo({top:scrollY,behavior:'instant'});returnTo.current?.focus?.({preventScroll:true});};
 },[permitted]);
 useEffect(()=>{
  if(!playing)return;
  const timer=setTimeout(()=>{if(node===3)setPlaying(false);else setNode(n=>n+1);},4500);
  return()=>clearTimeout(timer);
 },[node,playing]);
 if(!permitted)return null;
 const selected=atlas.nodes[node],record=albums.find(a=>a.code===selected.album);
 function select(n){setNode(n);setPlaying(false);}
 function load(a){if(!a)return;onClose();requestAnimationFrame(()=>onAlbum(a));}
 return <dialog ref={dialog} className="region-explorer" aria-labelledby="atlas-title" onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
  <header className="atlas-header"><div><p className="eyebrow">SONORA / EXPLORE / REGION 0{region+1}</p><p className="atlas-pixel-title function-pixel-title">THE SOUND ATLAS.</p><h2 id="atlas-title" ref={title} tabIndex={-1}>{place.name}<span>{place.en}</span></h2></div><button className="atlas-close" onClick={onClose} aria-label="关闭海域探索">返回世界地图</button></header>
  <div className="atlas-scroll">
   <div className="atlas-introduction"><span>一座城市，几条声音的来路。</span><p>点亮地标，沿着年代漫游；翻开唱片、音乐家与听觉词条。</p></div>
   <div className="atlas-top">
    <section className="atlas-map-panel" aria-label="像素音乐城市">
     <div className="atlas-map-toolbar"><span>MINIATURE CITY / 0{region+1}</span><div><button aria-label="缩小城市地图" disabled={zoom===1} onClick={()=>setZoom(z=>Math.max(1,z-.25))}>−</button><output>{Math.round(zoom*100)}%</output><button aria-label="放大城市地图" disabled={zoom===1.75} onClick={()=>setZoom(z=>Math.min(1.75,z+.25))}>+</button><button onClick={()=>setZoom(1)}>复位</button></div></div>
     <div className="atlas-map-scroll" tabIndex={0} aria-label="城市模型地图，可横向滚动"><div className="atlas-city" style={{width:`${zoom*100}%`}}>
      <div className="atlas-city-image" style={cityArt(region)} role="img" aria-label={place.name+'完整像素建筑模型，含四个可探索地标'}/>
      {atlas.nodes.map((n,i)=><button key={n.id} className={'atlas-landmark '+(i===node?'selected':'')} aria-pressed={node===i} style={{left:n.x+'%',top:n.y+'%'}} aria-label={'地标 '+(i+1)+'：'+n.place} onClick={()=>select(i)}><b>{String(i+1).padStart(2,'0')}</b><span>{n.place}</span></button>)}
     </div></div>
     <div className="atlas-map-caption"><span>原创像素城市意象 · 非真实地理位置</span><span>放大后可左右滑动</span></div>
     <nav className="atlas-route" aria-label="音乐发展路线">{atlas.nodes.map((n,i)=><button key={n.id} aria-current={i===node?'step':undefined} onClick={()=>select(i)}><small>0{i+1} / {n.date}</small><strong>{n.place}</strong></button>)}</nav>
    </section>
    <section className="atlas-history" aria-label="音乐历史节点">
     <div className="atlas-history-top"><span className="eyebrow">SOUND LINEAGE / 阅读路线</span><button aria-pressed={playing} onClick={()=>{if(!playing&&node===3)setNode(0);setPlaying(p=>!p);}}>{playing?'暂停演示':'演示发展脉络'}</button></div>
     <div className="atlas-node-copy" aria-live="polite"><span className="atlas-date">{selected.date}</span><h3>{selected.title}</h3><p>{selected.body}</p></div>
     <button className="atlas-related" onClick={()=>load(record)}><img src={record.cover} alt=""/><span><small>关联聆听 / 装载至终端</small><strong>{record.title}</strong><span>{record.artist} · {record.year}</span></span></button>
     <figure className="atlas-history-illustration"><span className="atlas-scene-art" style={holoArtStyle(region)}/><figcaption><small>SOUND SPECIMEN / 声音标本</small><strong>{holoThemes[region].name}</strong><span>{holoThemes[region].motif}</span></figcaption></figure>
     <p className="atlas-caveat">这是一条简化的阅读路线，不是唯一家谱。旁支与对照作品不代表严格师承；演示只切换讲解，不播放音乐。</p>
     <details><summary>史料与唱片来源</summary><ul>{atlas.sources.map(([label,url])=><li key={url}><a href={url} target="_blank" rel="noreferrer">{label} ↗</a></li>)}<li><a href={record.source} target="_blank" rel="noreferrer">Apple Music · 当前唱片资料 ↗</a></li></ul></details>
    </section>
   </div>
   <FlashDeck key={region} region={region} onAlbum={load}/>
   <footer className="atlas-footer">KEEP YOUR EARS OPEN.<span>6 海域 · 24 地标 · 48 张知识闪卡 / 随海域解锁开放</span></footer>
  </div>
 </dialog>;
}
