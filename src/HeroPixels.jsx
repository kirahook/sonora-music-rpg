import {useEffect,useRef,useState} from 'react';
import {createPixelField} from './pixelField.js';
export function HeroPixels(){
 const [paused,setPaused]=useState(false),[reduced,setReduced]=useState(false),[mode,setMode]=useState(0),canvas=useRef(null),engine=useRef(null);
 useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)');const sync=()=>setReduced(q.matches);sync();q.addEventListener('change',sync);return()=>q.removeEventListener('change',sync);},[]);
 useEffect(()=>{engine.current=createPixelField(canvas.current,canvas.current.closest('.intro'));return()=>engine.current?.dispose();},[]);
 useEffect(()=>engine.current?.setPaused(paused||reduced),[paused,reduced]);
 useEffect(()=>engine.current?.setMode(mode),[mode]);
 return <><div className={'hero-pixels live-pixel-field '+(paused||reduced?'is-paused':'')} aria-hidden="true"><canvas ref={canvas} className="hero-flow-canvas"/></div><button className="hero-flow-control" onClick={()=>setMode(m=>(m+1)%3)} aria-label="切换像素流场形态">PIXEL TIDES / {['潮汐','环流','织波'][mode]}</button><button className="hero-motion-control" aria-pressed={paused} disabled={reduced} onClick={()=>setPaused(p=>!p)}>{reduced?'静态像素背景':paused?'播放像素背景':'暂停像素背景'}</button></>;
}
