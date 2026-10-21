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
 {id:'forest',short:'林间慢频',label:'FOREST FREQUENCY',frequency:'88.3',title:'偶尔走神，也是一种调频。',copy:'给耳朵一小段留白，下一首歌会带来新的方向。',art:'/assets/v19-radio-forest.png',loop:12,caption:'树梢轻摇，云慢慢经过。',hue:'0deg'},
 {id:'midnight',short:'午夜来信',label:'MIDNIGHT SIGNAL',frequency:'91.6',title:'世界很大，先听完这一首。',copy:'远方没有催促你，地图也会等这一段旋律结束。',art:'/assets/v19-radio-midnight.png',loop:10,caption:'窗灯明灭，城市还醒着。',hue:'0deg'},
 {id:'crystal',short:'晶体信号',label:'CRYSTAL SIGNAL',frequency:'94.8',title:'重复之间，藏着一点新变化。',copy:'让整齐的频率折一次光，熟悉的声音也会露出新的切面。',art:'/assets/v19-radio-crystal.png',loop:8,caption:'晶面折光，微小脉冲。',hue:'0deg'},
 {id:'garden',short:'花园电波',label:'GARDEN FREQUENCY',frequency:'99.4',title:'让一朵花，替你慢下来。',copy:'不必填满每一秒。等花叶轻轻舒展，下一段旋律自然会来。',art:'/assets/v19-radio-garden.png',loop:12,caption:'花叶呼吸，风从纸上来。',hue:'0deg'},
 {id:'tide',short:'慢海浪',label:'SLOW WAVE RADIO',frequency:'104.2',title:'不赶路的时候，也在旅行。',copy:'让声音慢一点，让想象比脚步多走一段。',art:'/assets/v19-radio-tide.png',loop:8,caption:'浪峰起伏，落日留在海面。',hue:'0deg'},
 {id:'polar',short:'极地回声',label:'POLAR RADIO',frequency:'106.7',title:'安静，也会寄来一封回信。',copy:'灯塔不催促远方。给微小的变化留一点空间，听见寂静的层次。',art:'/assets/v19-radio-polar.png',loop:14,caption:'极光慢行，灯塔守着夜色。',hue:'0deg'},
 {id:'homebound',short:'归航彩条',label:'HOMEBOUND STATION',frequency:'108.0',title:'好声音，总会找到它的旅人。',copy:'把今天听到的小小回声，装进明天的行囊。',art:null,loop:8,caption:'原始彩条台，保留出发时的模样。',hue:'0deg'},
];
