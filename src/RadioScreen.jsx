import {useEffect,useRef,useState} from 'react';
import {radioFrameStyle,screenStyle} from './radioArt.js';

export function RadioScreen({station}){
 const ref=useRef(null),[size,setSize]=useState(320),[ready,setReady]=useState(false);
 useEffect(()=>{
  const element=ref.current;
  const measure=()=>setSize(element.clientWidth||320);
  measure();const observer=new ResizeObserver(measure);observer.observe(element);
  return()=>observer.disconnect();
 },[]);
 return <div ref={ref} className="interlude-hardware" data-ready={!station.art||ready}>
  <img className="interlude-housing" src="/assets/v13-interlude-crt.png" alt={'奶油白与青绿色复古电视 · '+station.short+'装饰画面'} width="1254" height="1254" loading="lazy"/>
  {station.art&&<><img className="interlude-source-probe" src={station.art} alt="" aria-hidden="true" onLoad={()=>setReady(true)} onError={()=>setReady(false)}/>{ready&&<div className={'interlude-glass screen-'+station.id} style={{...screenStyle(size),'--screen-art':'url("'+station.art+'")','--screen-loop':station.loop+'s'}} aria-hidden="true"><div className="interlude-screen-drift">{[0,1,2,3].map(i=><span key={i} className={'radio-frame radio-frame-'+i} style={radioFrameStyle(i)}/>)}</div></div>}</>}
 </div>;
}
