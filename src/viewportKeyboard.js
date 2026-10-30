// Keyboard UI only: never changes the player, save, viewport zoom or scroll.
export function keyboardOccludes({editing=false,layoutHeight=0,visualHeight=0,scale=1}={}){
 return editing&&Number.isFinite(layoutHeight)&&Number.isFinite(visualHeight)&&visualHeight>0&&scale<=1.05&&layoutHeight-visualHeight>120;
}
export function isTextEntry(element){
 return !!element&&(element.tagName==='TEXTAREA'||element.isContentEditable||element.tagName==='INPUT'&&['','text','search','email','url','tel','number','password'].includes((element.type||'').toLowerCase()));
}
