// Decorative identities only: these titles never grant equipment or change genre history.
export const codexPortraits=[
 {title:'Jazz Knight',name:'铜管与星辰的守夜人',motif:'BRASS / IMPROVISATION',tone:'蓝调 · 即兴 · 呼应'},
 {title:'Rock Knight',name:'为山脊留下回声的人',motif:'STRINGS / DISTORTION',tone:'电弦 · 重拍 · 释放'},
 {title:'Soul Knight',name:'将温度唱进夜色的人',motif:'VOICE / GROOVE',tone:'人声 · 情感 · 律动'},
 {title:'Hip-Hop Knight',name:'把街巷刻进唱片的人',motif:'SAMPLE / RHYME',tone:'采样 · 韵律 · 社区'},
 {title:'Electric Knight',name:'编织未知频率的旅人',motif:'SYNTHESIS / PATTERN',tone:'合成 · 实验 · 循环'},
 {title:'Reggae Knight',name:'在反拍里等待海风的人',motif:'OFFBEAT / BASS',tone:'反拍 · 低音 · 回响'},
 {title:'Folk Knight',name:'将故事交给下一阵风',motif:'STORIES / TRADITION',tone:'传唱 · 记忆 · 叙事'},
 {title:'Ambient Knight',name:'替寂静留一盏灯的人',motif:'SPACE / ATTENTION',tone:'空间 · 留白 · 注意力'},
];
export function codexArtStyle(page,detail=false){return {'--codex-shift':`-${(page%4+.5)/4*100}%`,'--codex-top':`${-Math.floor(page/4)*(detail?300:100)-(detail?8:0)}%`};}
export const interludeChannels=[
 {label:'FOREST FREQUENCY',frequency:'88.3',title:'偶尔走神，也是一种调频。',copy:'给耳朵一小段留白，下一首歌会带来新的方向。',hue:'0deg'},
 {label:'MIDNIGHT SIGNAL',frequency:'91.6',title:'世界很大，先听完这一首。',copy:'远方没有催促你，地图也会等这一段旋律结束。',hue:'38deg'},
 {label:'SLOW WAVE RADIO',frequency:'104.2',title:'不赶路的时候，也在旅行。',copy:'让声音慢一点，让想象比脚步多走一段。',hue:'-28deg'},
 {label:'HOMEBOUND STATION',frequency:'108.0',title:'好声音，总会找到它的旅人。',copy:'把今天听到的小小回声，装进明天的行囊。',hue:'78deg'},
];
