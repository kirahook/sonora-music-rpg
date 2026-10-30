import {useEffect,useRef,useState} from 'react';
import {guideScenes,sceneFor,guideMovieFor,guideFrameTitles} from './guideScenes.js';
import {FieldIcon,FieldProp} from './FieldMarks.jsx';

export const guideRecordingsReady=true;
export function GuideCinema({id='welcome',onLocate,paused=false,embeddedInChapter=false}){
 const scene=sceneFor(id),movie=guideMovieFor(id),ref=useRef(null),[playing,setPlaying]=useState(false),[frame,setFrame]=useState(0),[version,setVersion]=useState(0),[failed,setFailed]=useState(false),[enlarged,setEnlarged]=useState(false);
 const poster=guideRecordingsReady&&!failed?movie.frames[frame]:'/assets/v25-guide-listening-desk.webp';
 useEffect(()=>{setPlaying(false);setFrame(0);setFailed(false);},[id]);
 useEffect(()=>{if(paused)setPlaying(false);},[paused]);
 useEffect(()=>{
  const stop=()=>{if(document.hidden||matchMedia('(prefers-reduced-motion: reduce)').matches)setPlaying(false);};
  const motion=matchMedia('(prefers-reduced-motion: reduce)');motion.addEventListener('change',stop);document.addEventListener('visibilitychange',stop);
  // Native dialogs may report a false non-intersection; confirm actual bounds.
  const check=()=>{const r=ref.current?.querySelector('.guide-cinema-image')?.getBoundingClientRect();if(r&&(r.bottom<=0||r.top>=innerHeight||r.right<=0||r.left>=innerWidth))setPlaying(false);};
  const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(check):null;if(ref.current)observer?.observe(ref.current);
  const scroller=ref.current?.closest('.guide-scroll');scroller?.addEventListener('scroll',check,{passive:true});window.addEventListener('scroll',check,{passive:true});window.addEventListener('resize',check);
  return()=>{motion.removeEventListener('change',stop);document.removeEventListener('visibilitychange',stop);observer?.disconnect();scroller?.removeEventListener('scroll',check);window.removeEventListener('scroll',check);window.removeEventListener('resize',check);};
 },[]);
 function play(){if(!playing){ref.current?.querySelector('.guide-cinema-controls')?.scrollIntoView({behavior:'instant',block:'start'});setVersion(v=>v+1);setFrame(0);}setPlaying(v=>!v);}
 return <section className="guide-cinema" ref={ref} aria-label={scene.label+'网页操作实录'}><header><FieldProp name={scene.prop}/><div><p className="function-pixel-title">{embeddedInChapter?'WATCH. FIND. TRY.':scene.en+'.'}</p><h3>{scene.label} · 看一遍，再自己试</h3></div><span>WEB CAPTURE / {guideRecordingsReady?'网页实录':'制作预览'}</span></header>
  <div className={'guide-cinema-image '+(playing?'is-playing':'')+(enlarged?' is-enlarged':'')} tabIndex={enlarged?0:undefined} aria-label={enlarged?'放大的录制画面，可用方向键横向滚动':undefined}><img key={scene.id+'-'+version+'-'+(playing?'gif':frame)} src={playing?movie.gif+'?play='+version:poster} alt={scene.label+(playing?'实际网页操作关键步骤循环':'操作步骤 '+(frame+1)+'，静态画面')} onError={()=>{setPlaying(false);setFailed(true);}}/><span className="guide-recording-stamp"><FieldIcon name="play"/>{playing?'正在播放关键步骤':'静态预览 · 不自动播放'}</span></div>
  <div className="guide-cinema-controls"><button className="guide-movie-play" disabled={!guideRecordingsReady||failed||paused} aria-pressed={playing} onClick={play}><FieldIcon name="play"/>{playing?'暂停并回到首帧':paused?'恢复动效后可播放':'播放网页实录 GIF'}</button><button aria-pressed={enlarged} onClick={()=>setEnlarged(v=>!v)}>{enlarged?'恢复全景':'放大细节 · 可横向滑动'}</button><div role="group" aria-label="逐步查看录制画面">{movie.frames.map((_,i)=><button key={i} disabled={!guideRecordingsReady} title={guideFrameTitles[scene.id][i]} aria-label={'画面 '+(i+1)+'：'+guideFrameTitles[scene.id][i]} aria-pressed={!playing&&frame===i} onClick={()=>{setPlaying(false);setFrame(i);}}>0{i+1}</button>)}</div>{onLocate&&<button onClick={()=>onLocate(scene.id)}><FieldIcon name="search"/>在页面中高亮找一遍</button>}</div>
  <p className="guide-frame-caption" role="status">{playing?'四个关键画面循环播放 · 暂停后可逐帧阅读':String(frame+1).padStart(2,'0')+' / 04 · '+guideFrameTitles[scene.id][frame]}</p>
  <div className="guide-movie-caption" aria-live="polite"><strong>{scene.title}</strong><p>{scene.body}</p><ol>{scene.steps.map(s=><li key={s}>{s}</li>)}</ol></div><p className="guide-capture-note">网页实录来自独立演示存档，关键停留已压缩；不是手机硬件实拍。播放GIF或逐帧查看不播放音频、不记录聆听、不领奖。暂停回到首帧；需要实操时再用高亮定位。</p>{failed&&<p role="status">录制画面暂不可用，仍可阅读分步说明或使用真实页面高亮。</p>}
 </section>;
}
export function GuidePortal({onLocate,paused=false}){
 const [expanded,setExpanded]=useState(false),[chapter,setChapter]=useState('welcome');
 return <section className={'guide-portal '+(expanded?'expanded':'')} aria-label="旅途全景与操作演示"><div className="guide-portal-ticket"><img className="guide-ticket-art" src="/assets/v25-guide-listening-desk.webp" alt="旅人聆听桌上的海港地图手账、唱片、罗盘和骑士头盔，原创装饰插画"/><div><p className="eyebrow">A RECORD. A MAP. A LITTLE COURAGE.</p><strong>一张唱片，也能打开一整个世界。</strong><span>先听歌；想看全貌时，再展开这张路线卡。</span></div><button aria-label={expanded?'收起全景演示':'看看完整旅程'} aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}>{expanded?'收起全景':'展开全景'}</button></div>{expanded&&<div className="guide-overview"><img className="guide-overview-art" src="/assets/v25-guide-listening-desk.webp" alt="与世界海同一美术语言的立体聆听旅途桌面全景"/><nav aria-label="全局功能实录章节">{guideScenes.map((s,i)=><button key={s.id} aria-current={chapter===s.id?'step':undefined} onClick={()=>setChapter(s.id)}><FieldProp name={s.prop}/><small>{String(i+1).padStart(2,'0')}</small>{s.label}</button>)}</nav><GuideCinema id={chapter} onLocate={onLocate} paused={paused}/></div>}</section>;
}
