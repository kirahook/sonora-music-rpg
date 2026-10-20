const TAU=Math.PI*2;
const mix=(a,b,t)=>a+(b-a)*t;
export const smoothStep=t=>{const n=Math.max(0,Math.min(1,t));return n*n*(3-2*n);};
export function blendPixel(a,b,t){const k=smoothStep(t);return {x:mix(a.x,b.x,k),y:mix(a.y,b.y,k)};}
export function createPixels(count,seed=1719){
 let s=seed>>>0;const random=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
 return Array.from({length:count},()=>({u:random(),v:random()*2-1,z:random(),side:random()<.5?-1:1,phase:random()*TAU,size:.7+random()*2}));
}
function formation(p,t,w,h,shape){
 const u=p.u,layer=.45+p.z*.55;
 if(shape===0){const x=((u+t*.012*layer)%1)*w;return {x,y:h*(.66+.18*Math.sin(x/w*TAU*1.15+t*.33+p.z*.65)+p.v*.12*layer)};}
 if(shape===1){const a=u*TAU+t*.22*layer,r=.75+p.v*.22;return {x:w*(p.side<0?.13:.87)+Math.cos(a)*w*.19*r,y:h*.54+Math.sin(a)*h*.43*r};}
 const y=((u+t*.018*layer)%1)*h;
 return {x:w*(p.side<0?.085:.915)+p.side*Math.sin(y/h*TAU*1.4+t*.42+p.z)*w*.10+p.v*w*.035,y};
}
export function pixelPoint(p,t,w,h,mode=0){
 const cycle=t/15+mode,shape=Math.floor(cycle)%3,next=(shape+1)%3,f=cycle-Math.floor(cycle);
 const blend=f<.55?0:(1-Math.cos((f-.55)/.45*Math.PI))/2;
 const a=formation(p,t,w,h,shape),b=formation(p,t,w,h,next);
 return {x:mix(a.x,b.x,blend),y:mix(a.y,b.y,blend)};
}
export function createPixelField(canvas,host){
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return {setPaused(){},setMode(){},dispose(){}};
 let w=1,h=1,points=[],protectedAreas=[],paused=false,visible=true,disposed=false,raf=0,last=0,time=0,mode=0,palette=null,morph=1,previous=[];
 const cursor={x:-1000,y:-1000},image=new Image();
 image.src='/assets/v14-hero-pixels.png';
 image.onload=()=>{if(disposed)return;const c=document.createElement('canvas');c.width=96;c.height=64;const g=c.getContext('2d');g.drawImage(image,0,0,96,64);palette=g.getImageData(0,0,96,64).data;paint();};
 function resize(){
  const r=host.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);
  const dpr=Math.min(window.devicePixelRatio||1,w<700?1.25:1.6);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  points=createPixels(w<700?1100:2300);
  previous=[];morph=1;
  protectedAreas=[...host.querySelectorAll('.eyebrow,h1,.intro-aside>p,.color-key')].filter(e=>e.getBoundingClientRect().height).map(e=>{const b=e.getBoundingClientRect();return {x:b.left-r.left-8,y:b.top-r.top-7,w:b.width+16,h:b.height+14};});paint();
 }
 function paint(){
  ctx.clearRect(0,0,w,h);ctx.save();ctx.beginPath();ctx.rect(0,0,w,h);for(const r of protectedAreas)ctx.rect(r.x,r.y,r.w,r.h);ctx.clip('evenodd');
  for(let i=0;i<points.length;i++){
   const p=points[i],target=pixelPoint(p,time,w,h,mode),q=morph<1&&previous[i]?blendPixel(previous[i],target,morph):target,dx=q.x-cursor.x,dy=q.y-cursor.y,d=Math.hypot(dx,dy),push=Math.max(0,1-d/105)*12;
   q.x+=dx/(d||1)*push;q.y+=dy/(d||1)*push;
   const edge=Math.min(1,Math.abs(q.x/w-.5)*2+.12),twinkle=.84+.16*Math.sin(time*.8+p.phase),a=(.12+p.z*.33)*edge*twinkle;
   let color=i%19===0?'160,111,72':i%5===0?'66,115,135':'82,111,101';
   if(palette&&i%5!==0){const n=(Math.floor(p.u*95)+Math.floor((p.v+1)*.5*63)*96)*4;const darkness=1-(palette[n]+palette[n+1]+palette[n+2])/765;if(darkness>.1)color=palette[n]+','+palette[n+1]+','+palette[n+2];}
   const size=p.size*(.6+p.z*.75);ctx.fillStyle='rgba('+color+','+a+')';ctx.fillRect(q.x,q.y,size,size);
   if(p.z>.7&&morph===1){const tail=pixelPoint(p,time-.14,w,h,mode);ctx.fillStyle='rgba('+color+','+(a*.25)+')';ctx.fillRect(tail.x,tail.y,size*.7,size*.7);}
   if(i%97===0){ctx.fillStyle='rgba('+color+','+(a*.55)+')';ctx.fillRect(q.x-size*1.5,q.y,size*4,size);ctx.fillRect(q.x,q.y-size*1.5,size,size*4);}
  }
  ctx.restore();
 }
 function tick(now){raf=0;if(disposed)return;const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(!paused&&visible&&!document.hidden){time+=dt;morph=Math.min(1,morph+dt/1.8);}paint();schedule();}
 function schedule(){if(!disposed&&!raf&&!paused&&visible&&!document.hidden)raf=requestAnimationFrame(tick);}
 const onVisibility=()=>{last=0;schedule();},onPointer=e=>{const r=host.getBoundingClientRect();cursor.x=e.clientX-r.left;cursor.y=e.clientY-r.top;},onLeave=()=>{cursor.x=-1000;cursor.y=-1000;};
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
 const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;last=0;schedule();});intersection.observe(host);
 host.addEventListener('pointermove',onPointer,{passive:true});host.addEventListener('pointerleave',onLeave);document.addEventListener('visibilitychange',onVisibility);
 resize();schedule();
 return {
  setPaused(value){paused=value;last=0;if(value){cancelAnimationFrame(raf);raf=0;paint();}else schedule();},
  setMode(value){if(value===mode)return;previous=points.map((p,i)=>{const target=pixelPoint(p,time,w,h,mode);return morph<1&&previous[i]?blendPixel(previous[i],target,morph):target;});mode=value;morph=paused?1:0;paint();schedule();},
  dispose(){disposed=true;cancelAnimationFrame(raf);resizeObserver.disconnect();intersection.disconnect();host.removeEventListener('pointermove',onPointer);host.removeEventListener('pointerleave',onLeave);document.removeEventListener('visibilitychange',onVisibility);image.onload=null;},
 };
}
