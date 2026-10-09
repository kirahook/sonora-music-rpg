// Grip coordinates are normalized within each square atlas cell, not its center.
export const weaponGrips=[
 {x:.58,y:.85,angle:-18,size:.64},
 {x:.57,y:.83,angle:-22,size:.62},
 {x:.52,y:.82,angle:-12,size:.65},
 {x:.50,y:.85,angle:-18,size:.64},
 {x:.58,y:.86,angle:-20,size:.65},
 {x:.44,y:.87,angle:-18,size:.66},
 {x:.42,y:.80,angle:-24,size:.66},
 {x:.56,y:.86,angle:-6,size:.66},
];
export const handAnchors={weapon:{x:.35,y:.605},shield:{x:.685,y:.605}};
export function heldPose(index,slot){
 const grip=slot==='weapon'?weaponGrips[index]||weaponGrips[0]:{x:.5,y:.49,angle:-7,size:.58};
 const hand=handAnchors[slot]||handAnchors.weapon;
 return {left:`${hand.x*100}%`,top:`${hand.y*100}%`,width:`${grip.size*100}%`,transformOrigin:`${grip.x*100}% ${grip.y*100}%`,transform:`translate(-${grip.x*100}%,-${grip.y*100}%) rotate(${grip.angle}deg)`};
}
