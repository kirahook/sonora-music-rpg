import {useEffect,useState} from 'react';
import {keyboardOccludes,isTextEntry} from './viewportKeyboard.js';

export function useViewportKeyboard(){
 const [open,setOpen]=useState(false);
 useEffect(()=>{
  const viewport=window.visualViewport;
  let baseline={width:window.innerWidth,height:window.innerHeight};
  const update=()=>{
   const editing=isTextEntry(document.activeElement);
   if(Math.abs(window.innerWidth-baseline.width)>2)baseline={width:window.innerWidth,height:window.innerHeight};
   else if(!editing)baseline.height=Math.max(baseline.height,window.innerHeight);
   setOpen(keyboardOccludes({editing,layoutHeight:baseline.height,visualHeight:viewport?.height||window.innerHeight,scale:viewport?.scale||1}));
  };
  // Resize/focus are already discrete events. Do not defer critical keyboard UI
  // through a frame callback that can be suspended in a background tab.
  window.addEventListener('resize',update);viewport?.addEventListener('resize',update);
  document.addEventListener('focusin',update);document.addEventListener('focusout',update);document.addEventListener('visibilitychange',update);update();
  return()=>{window.removeEventListener('resize',update);viewport?.removeEventListener('resize',update);document.removeEventListener('focusin',update);document.removeEventListener('focusout',update);document.removeEventListener('visibilitychange',update);};
 },[]);
 return open;
}
