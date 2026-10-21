import {useEffect,useRef,useState} from 'react';
import {interludeChannels} from './codexArt.js';
import {RadioScreen} from './RadioScreen.jsx';
import {nextRadioChannel} from './radioArt.js';

export function SoundInterlude(){
 const [paused,setPaused]=useState(false),[channel,setChannel]=useState(0);
 const ref=useRef(null),[available,setAvailable]=useState(true),[reduced,setReduced]=useState(false),[inView,setInView]=useState(true);
 useEffect(()=>{
  const q=matchMedia('(prefers-reduced-motion: reduce)'),sync=()=>{setAvailable(!document.hidden);setReduced(q.matches);};
  sync();document.addEventListener('visibilitychange',sync);q.addEventListener('change',sync);
  // Use real rectangles too: some embedded browsers report tall visible cards as non-intersecting.
  const syncView=()=>{const r=ref.current?.getBoundingClientRect();setInView(!!r&&r.bottom>-80&&r.top<innerHeight+80&&r.right>0&&r.left<innerWidth);};
  const observer=new IntersectionObserver(syncView,{rootMargin:'80px'});observer.observe(ref.current);syncView();
  document.addEventListener('scroll',syncView,{passive:true,capture:true});window.addEventListener('resize',syncView);
  return()=>{document.removeEventListener('visibilitychange',sync);q.removeEventListener('change',sync);document.removeEventListener('scroll',syncView,true);window.removeEventListener('resize',syncView);observer.disconnect();};
 },[]);
 const station=interludeChannels[channel];
 const stop=paused||reduced||!available||!inView;
 return <aside ref={ref} data-motion={reduced?'system':paused?'user':!available?'hidden':!inView?'offscreen':'running'} className={'sound-interlude radio-expanded '+(stop?'interlude-paused':'')} aria-label="声音中场循环动画">
  <header><span>SONORA / INTERMISSION</span><span>ART LOOP · 装饰动画</span></header>
  <div className="interlude-main">
   <div className="interlude-device"><RadioScreen key={station.id} station={station}/></div>
   <div className="interlude-copy" role="status" aria-live="polite" aria-atomic="true"><p className="interlude-frequency">{station.frequency}<span>FM / IMAGINARY RADIO</span></p><h3>{station.title}</h3><p>{station.copy}</p></div>
  </div>
  <div className="interlude-band-guide"><p className="function-pixel-title">A LITTLE CHANGE OF SCENE.</p><p>七个虚构频段，换一幅会慢慢变化的风景。</p></div>
  <div className="interlude-band-list" aria-label="中场装饰频段">{interludeChannels.map((s,i)=><button key={s.id} aria-pressed={i===channel} onClick={()=>setChannel(i)}><span>{s.frequency}</span><strong>{s.short}</strong></button>)}</div>
  <label className="interlude-band-select">选择装饰频段<select aria-label="选择中场装饰频段" value={channel} onChange={e=>setChannel(Number(e.target.value))}>{interludeChannels.map((s,i)=><option key={s.id} value={i}>{s.frequency} / {s.short}</option>)}</select></label>
  <p className="interlude-scene-note">{station.caption}<span>{reduced?'已跟随系统减少动态':paused?'动画已暂停':station.art?'四幅手绘画面交叠成循环':'复古电视轻浮动'}</span></p>
  <footer><div><span>{String(channel+1).padStart(2,'0')} / {String(interludeChannels.length).padStart(2,'0')} — {station.label}</span><small>装饰频道，不播放音频 · 不计经验</small><small>频率为虚构设定，画面不分析当前音频。</small></div><div className="interlude-actions"><button aria-label={paused?'继续中场动画':'暂停中场动画'} aria-pressed={paused} disabled={reduced} onClick={()=>setPaused(v=>!v)}>{reduced?'系统减少动态':paused?'继续动画':'暂停动画'}</button><button aria-label="切换中场装饰频道" onClick={()=>setChannel(v=>nextRadioChannel(v,1,interludeChannels.length))}>再调一次频 ↗</button></div></footer>
 </aside>;
}
