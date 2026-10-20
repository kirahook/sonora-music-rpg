import {useEffect,useRef,useState} from 'react';
import {holoArtStyle,holoForegroundStyle,holoThemes} from './holoArt.js';
import {cardPrintFor} from './fieldPresentation.js';
export function HoloCard({card,region,number,motion,onStatus}){
 const canvas=useRef(null),engine=useRef(null),latest=useRef(null),[status,setStatus]=useState('loading');
 latest.current={card,region,number};
 useEffect(()=>{
  let cancelled=false;
  const updateStatus=s=>{if(!cancelled){setStatus(s);onStatus(s);}};
  import('./holoRenderer.js').then(module=>{
   if(cancelled)return;
   const api=module.createHoloRenderer(canvas.current,()=>({...latest.current,...motion.current}),()=>updateStatus('ready'),()=>updateStatus('fallback'));
   engine.current=api;motion.current.invalidate=api.invalidate;
  }).catch(()=>updateStatus('fallback'));
  return()=>{cancelled=true;motion.current.invalidate=null;engine.current?.dispose();engine.current=null;};
 },[]);
 useEffect(()=>{engine.current?.updateCard();},[card.id,region]);
 useEffect(()=>{motion.current.invalidate?.();});
 const theme=holoThemes[region],paper=cardPrintFor(card.type),fallbackStyle=card.type==='album'?holoArtStyle(region):{backgroundImage:`url("${paper.path}")`,backgroundSize:'200% 100%',backgroundPosition:paper.cell?'100% 50%':'0% 50%',backgroundColor:card.type==='artist'?'#f4e9d6':'#dfebf0'};
 return <span className={'holo-render-surface card-type-'+card.type+' '+status} aria-hidden="true">
  <span className="holo-raster-fallback" style={fallbackStyle}>{card.type==='artist'&&<span className="holo-raster-guardian" style={holoForegroundStyle(region)}/>} {card.type==='album'&&card.cover&&<img className="holo-fallback-cover" src={card.cover} alt=""/>}{card.type==='concept'&&<p className="holo-fallback-concept">{card.body}</p>}<span>{theme.en}</span><strong>{card.title}</strong><small>{status==='fallback'?'静态美术模式 / 设备不支持 WebGL':theme.motif}</small></span>
  <canvas ref={canvas} className="holo-webgl-canvas"/>
 </span>;
}
