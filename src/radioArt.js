// Projective placement of real raster screen art inside the original CRT glass.
// Points measured against the original square image; the housing is untouched.
export const crtScreenQuad=[[.300,.323],[.782,.179],[.895,.666],[.369,.815]];
export function screenTransform(size=320){
 const w=Number.isFinite(size)&&size>0?size:320;
 const [[x0,y0],[x1,y1],[x2,y2],[x3,y3]]=crtScreenQuad;
 const dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3;
 const dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3,den=dx1*dy2-dx2*dy1;
 const g=(dx3*dy2-dx2*dy3)/den,h=(dx1*dy3-dx3*dy1)/den;
 return [x1-x0+g*x1,y1-y0+g*y1,0,g/w,x3-x0+h*x3,y3-y0+h*y3,0,h/w,0,0,1,0,x0*w,y0*w,0,1];
}
export function screenStyle(size){return {transform:'matrix3d('+screenTransform(size).join(',')+')'};}
export function radioFrameStyle(frame){
 const n=((Math.floor(frame)||0)%4+4)%4;
 return {backgroundPosition:`${n%2*100}% ${Math.floor(n/2)*100}%`};
}
export function nextRadioChannel(current,delta,count){return count>0?((current+delta)%count+count)%count:0;}
