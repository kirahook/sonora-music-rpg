const marks={key:0,receipt:1,map:2,record:3,battle:4,letter:5,seal:6,shards:7};
export function FieldProp({name='seal',className=''}){const n=marks[name]??6;return <span aria-hidden="true" className={'field-prop '+className} style={{backgroundPosition:`${n%4*100/3}% ${Math.floor(n/4)*100}%`}}/>;}
const glyphs={audio:0,world:1,knight:2,search:3,play:4,power:5,lock:6,spark:7};
export function FieldIcon({name='spark'}){const n=glyphs[name]??7;return <span aria-hidden="true" className="dot-icon" style={{'--icon-x':`${n%4*100/3}%`,'--icon-y':`${Math.floor(n/4)*100}%`}}/>;}
