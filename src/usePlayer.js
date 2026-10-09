import { useEffect,useRef,useState } from 'react';

export function usePlayer({album,power,onCredit,onNotice}) {
  const audio=useRef(null);
  const [locals,setLocals]=useState([]);
  const [expedition,setExpedition]=useState([]);
  const [queueRevision,setQueueRevision]=useState(0);
  const [source,setSource]=useState('catalog');
  const [index,setIndex]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [elapsed,setElapsed]=useState(0);
  const [duration,setDuration]=useState(0);
  const [volume,setVolume]=useState(.65);
  const [muted,setMuted]=useState(false);
  const autoplay=useRef(false);
  const measured=useRef({last:0,seconds:0,credited:false});
  const seeking=useRef(false);
  const localUrls=useRef([]);
  const queue=source==='local'?locals:source==='voyage'?expedition:album.tracks;
  const track=queue[Math.min(index,Math.max(0,queue.length-1))];

  useEffect(()=>{
    const media=audio.current;
    if(!media || !track) return;
    media.pause(); setPlaying(false);setLoading(false);setElapsed(0);setDuration(0);setError('');
    measured.current={last:0,seconds:0,credited:false};seeking.current=false;
    media.src=track.url;media.load();
    if(autoplay.current && power==='on') {
      setLoading(true);
      media.play().catch(error=>{setLoading(false);if(error.name!=='AbortError')setError('暂时无法播放，请重试或导入本地音频。');});
    }
    autoplay.current=false;
  },[track?.id,track?.url,source,queueRevision]);
  useEffect(()=>{if(audio.current){audio.current.volume=volume;audio.current.muted=muted;}},[volume,muted]);
  useEffect(()=>{if(power!=='on'){audio.current?.pause();setPlaying(false);}},[power]);
  useEffect(()=>()=>{localUrls.current.forEach(url=>URL.revokeObjectURL(url));},[]);

  async function toggle() {
    if(power!=='on'){onNotice('请先打开终端电源。');return;}
    const media=audio.current;
    if(!media || !track){onNotice('没有可播放的音轨，请选择专辑或导入本地音乐。');return;}
    if(!media.paused){media.pause();return;}
    if(media.ended) media.currentTime=0;
    setError('');setLoading(true);
    try{await media.play();}catch(error){setLoading(false);if(error.name!=='AbortError')setError('音源未能加载。可重试、切换曲目或导入本地音乐。');}
  }
  function selectTrack(nextIndex,auto=true) {
    if(nextIndex<0||nextIndex>=queue.length) return;
    if(nextIndex===index){if(auto && !playing) void toggle();return;}
    autoplay.current=auto && power==='on';setIndex(nextIndex);
  }
  function switchAlbum() {audio.current?.pause();autoplay.current=false;setSource('catalog');setIndex(0);setQueueRevision(v=>v+1);}
  function startVoyage(tracks){audio.current?.pause();autoplay.current=power==='on';setExpedition(tracks);setIndex(0);setSource('voyage');setQueueRevision(v=>v+1);}
  function importFiles(files) {
    const accepted=[...files].filter(file=>file.type.startsWith('audio/') || /\.(mp3|m4a|aac|wav|ogg|flac)$/i.test(file.name));
    if(!accepted.length){onNotice('请选择 MP3、M4A、WAV、OGG 或 FLAC 音频。');return;}
    audio.current?.pause();localUrls.current.forEach(url=>URL.revokeObjectURL(url));
    const tracks=accepted.map((file,i)=>{const url=URL.createObjectURL(file);return {id:`local:${file.name}:${file.size}:${file.lastModified}`,title:file.name.replace(/\.[^.]+$/,''),artist:'本地音乐 · 仅在此浏览器播放',url,number:i+1};});
    localUrls.current=tracks.map(t=>t.url);setLocals(tracks);setSource('local');setIndex(0);autoplay.current=false;
    onNotice(`已导入 ${tracks.length} 首本地音轨，点击播放开始。文件不会上传。`);
  }
  function seek(value) {if(!audio.current||!duration)return;const next=Math.max(0,Math.min(duration,Number(value)));measured.current.last=next;audio.current.currentTime=next;setElapsed(next);}
  function timeUpdate() {
    const media=audio.current;if(!media||!track)return;
    setElapsed(media.currentTime);
    const stats=measured.current,delta=media.currentTime-stats.last;
    if(!media.paused&&!seeking.current&&delta>0&&delta<2)stats.seconds+=delta;
    stats.last=media.currentTime;
    const threshold=Number.isFinite(media.duration)&&media.duration>0?Math.min(20,media.duration*.8):20;
    if(!stats.credited&&stats.seconds>=threshold){stats.credited=true;onCredit({...track,genre:source==='local'?'LOCAL':track.genre||album.genre,albumCode:source==='local'?'LOCAL':track.albumCode||album.code});}
  }
  const events={
    onPlay:()=>{setPlaying(true);setLoading(false);},onPause:()=>{setPlaying(false);setLoading(false);},
    onWaiting:()=>setLoading(true),onPlaying:()=>{setPlaying(true);setLoading(false);},
    onLoadedMetadata:()=>setDuration(Number.isFinite(audio.current.duration)?audio.current.duration:0),
    onDurationChange:()=>setDuration(Number.isFinite(audio.current.duration)?audio.current.duration:0),
    onTimeUpdate:timeUpdate,
    onSeeking:()=>{seeking.current=true;},onSeeked:()=>{seeking.current=false;measured.current.last=audio.current.currentTime;},
    onError:()=>{setLoading(false);setPlaying(false);setError('此音源暂不可用，请切换曲目或导入本地音乐。');},
    onEnded:()=>{setPlaying(false);if(index<queue.length-1){autoplay.current=true;setIndex(i=>i+1);}else{onNotice(source==='local'?'本地播放列表已播放完毕。':'本张专辑的官方试听已播放完毕。');}},
  };
  return {audio,events,queue,track,index,source,playing,loading,error,elapsed,duration,volume,setVolume,muted,setMuted,toggle,selectTrack,switchAlbum,importFiles,seek,locals,setSource,startVoyage};
}
