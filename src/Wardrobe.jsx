import {avatarSpec,pixelStyle} from './equipment';
import {heldPose} from './wardrobePose';

export function WardrobeAvatar({state,className=''}){
 const look=avatarSpec(state);
 return <div className={'wardrobe-avatar '+className} role="img" aria-label={'骑士实时穿搭：'+look.names.join('、')} data-loadout={look.signature}>
  <span className="avatar-body" aria-hidden="true" style={{backgroundPosition:`${look.outfit%4*100/3}% ${Math.floor(look.outfit/4)*100}%`}}/>
  <span className="avatar-weapon" aria-hidden="true" data-grip="weapon" data-pixel={look.weapon} style={{...pixelStyle(look.weapon),...heldPose(look.weapon,'weapon')}}/>
  <span className="avatar-shield" aria-hidden="true" data-grip="shield" style={{...pixelStyle(look.shield),...heldPose(look.shield,'shield')}}/>
  <span className="avatar-hand" aria-hidden="true" style={{backgroundPosition:`${look.outfit%4*100/3}% ${Math.floor(look.outfit/4)*100}%`}}/>
 </div>;
}
