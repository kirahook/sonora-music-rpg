import {useState} from 'react';
import {interludeChannels} from './codexArt.js';

export function SoundInterlude(){
 const [paused,setPaused]=useState(false),[channel,setChannel]=useState(0);
 const station=interludeChannels[channel];
 return <aside className={'sound-interlude '+(paused?'interlude-paused':'')} aria-label="声音中场循环动画" style={{'--channel-hue':station.hue}}>
  <header><span>SONORA / INTERMISSION</span><span>ART LOOP · 装饰动画</span></header>
  <div className="interlude-main">
   <div className="interlude-device"><img src="/assets/v13-interlude-crt.png" alt="奶油色与青绿色等距复古显示器，屏幕显示彩色调频条" width="1254" height="1254" loading="lazy"/></div>
   <div className="interlude-copy" role="status" aria-live="polite" aria-atomic="true"><p className="interlude-frequency">{station.frequency}<span>FM / IMAGINARY RADIO</span></p><h3>{station.title}</h3><p>{station.copy}</p></div>
  </div>
  <footer><div><span>0{channel+1} / 04 — {station.label}</span><small>装饰频道，不播放音频 · 不计经验</small></div><div className="interlude-actions"><button aria-label={paused?'继续中场动画':'暂停中场动画'} aria-pressed={paused} onClick={()=>setPaused(v=>!v)}>{paused?'继续动画':'暂停动画'}</button><button aria-label="切换中场装饰频道" onClick={()=>setChannel(v=>(v+1)%interludeChannels.length)}>再调一次频 ↗</button></div></footer>
 </aside>;
}
