import {clock} from './catalog';

export const mobileDestinations=[
 ['terminal','audio','聆听'],['armory','knight','装备'],['archive','search','唱片'],
 ['world','world','世界'],['adventure','spark','远征'],
];

// This is a second view of the existing player, never a second audio engine.
export function MobileDock({player,power,album,nav,onNavigate,onDisplay,Icon}){
 const ready=power==='on'&&!!player.track;
 return <aside className="mobile-dock" aria-label="手机快捷操作">
  <div className="mobile-player" aria-label="随行播放器">
   <button className="mobile-track" onClick={()=>{onDisplay();onNavigate('terminal');}} aria-label="查看当前曲目与完整播放器">
    {player.source==='local'?<Icon name="audio"/>:<img src={album.cover} alt=""/>}
    <span><strong>{player.track?.title||'选择一段声音'}</strong><small>{power!=='on'?'终端未开启':player.error?'音源暂不可用 · 前往重试':player.loading?'正在载入…':`${player.playing?'正在聆听':'等待聆听'} · ${clock(player.elapsed)} / ${clock(player.duration)}`}</small></span>
   </button>
   <button className="mobile-play" disabled={!ready||player.loading&&!player.playing} aria-label={player.playing?'随行播放器暂停':'随行播放器播放'} onClick={()=>void player.toggle()}><span aria-hidden="true">{player.playing?'Ⅱ':'▶'}</span></button>
   <button className="mobile-next" disabled={!ready||player.index>=player.queue.length-1} aria-label="随行播放器下一首" onClick={()=>player.selectTrack(player.index+1)}><span aria-hidden="true">↠</span></button>
  </div>
  <nav className="mobile-navigation" aria-label="手机快捷导航">{mobileDestinations.map(([id,icon,label])=><button key={id} aria-current={nav===id?'location':undefined} onClick={()=>onNavigate(id)}><Icon name={icon}/><span>{label}</span></button>)}</nav>
 </aside>;
}
