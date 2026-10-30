import {useEffect,useRef,useState} from 'react';
import {guideScenes,sceneFor} from './guideScenes.js';
import {FieldProp} from './FieldMarks.jsx';

export function clippedGuideRect(rect,width,height){
 if(!rect||![width,height,rect.left,rect.top,rect.right,rect.bottom].every(Number.isFinite))return null;
 const left=Math.max(8,rect.left-6),top=Math.max(8,rect.top-6),right=Math.min(width-8,rect.right+6),bottom=Math.min(height-8,rect.bottom+6);
 return right>left&&bottom>top?{left,top,width:right-left,height:bottom-top}:null;
}
export function GuideSpotlight({id,onStep,onClose,onReturn}){
 const scene=sceneFor(id),index=guideScenes.findIndex(s=>s.id===scene.id),[rect,setRect]=useState(null),[missing,setMissing]=useState(false),[compact,setCompact]=useState(true),title=useRef(null),closeRef=useRef(onClose);
 closeRef.current=onClose;
 const locate=()=>document.querySelector(scene.target)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});
 useEffect(()=>{
  let frame,arrive;
  const update=()=>{frame=null;const e=document.querySelector(scene.target);setMissing(!e);setRect(e?clippedGuideRect(e.getBoundingClientRect(),innerWidth,innerHeight):null);};
  const request=()=>{if(frame==null)frame=requestAnimationFrame(update);};
  arrive=requestAnimationFrame(()=>{locate();update();title.current?.focus({preventScroll:true});});
  const resize=()=>{locate();request();};
  const escape=e=>{if(e.key==='Escape'){e.preventDefault();closeRef.current();}};
  window.addEventListener('resize',resize);window.addEventListener('scroll',request,{passive:true});document.addEventListener('keydown',escape);
  return()=>{cancelAnimationFrame(arrive);if(frame!=null)cancelAnimationFrame(frame);window.removeEventListener('resize',resize);window.removeEventListener('scroll',request);document.removeEventListener('keydown',escape);};
 },[scene.id]);
 const below=rect&&rect.top<(typeof innerHeight==='number'?innerHeight:800)*.45;
 return <aside className="guide-spotlight" aria-label="真实页面高亮指引">
  <div className="guide-spotlight-focus" aria-hidden="true" style={rect?{left:rect.left,top:rect.top,width:rect.width,height:rect.height}:undefined} hidden={!rect}/>
  <div className={'guide-spotlight-card '+(below?'at-bottom':'at-top')+(compact?' is-compact':'')}>
   <header><FieldProp name={scene.prop}/><span>LIVE FIELD GUIDE / 真实页面定位<br/>{String(index+1).padStart(2,'0')} / {guideScenes.length}</span><button aria-expanded={!compact} onClick={()=>setCompact(v=>!v)}>{compact?'展开说明':'收起说明'}</button><button onClick={onClose} aria-label="结束页面高亮">关闭 ×</button></header>
   <h2 tabIndex={-1} ref={title}>{scene.title}</h2><p aria-live="polite">{missing?'这一布局暂时没有显示目标，可以换下一处或返回指南。':scene.body}</p><small>只定位，不播放、不操作装备、不消耗钥匙、不领取奖励。真实控件仍由你决定是否操作。</small>
   <nav aria-label="页面高亮路线"><button disabled={index===0} onClick={()=>onStep(guideScenes[index-1].id)}>上一处</button><button onClick={locate}>定位此处</button><button onClick={onReturn}>回到指南</button>{index===guideScenes.length-1?<button onClick={onClose}>完成巡览</button>:<button onClick={()=>onStep(guideScenes[index+1].id)}>下一处 →</button>}</nav>
  </div>
 </aside>;
}
