// Native page locations, never gameplay commands. Nine stable chapters + three recent features.
export const guideScenes=[
 {id:'welcome',label:'启程全景',en:'THE WHOLE JOURNEY',target:'#terminal',title:'先找到你的聆听终端',body:'唱片从这里发声，骑士的足迹也从这里开始。下方还有唱片、地图与委托；先听歌，不必一口气学完。',steps:['挑一张真实唱片','亲手播放，再记下一条感受','札记展开后，自由探索'],prop:'map'},
 {id:'listen',label:'真实播放',en:'PRESS PLAY, STAY A WHILE',target:'.deck-transport',title:'播放与暂停都在这里',body:'真实播放才留下足迹，拖动进度不等于听过。GIF只演示操作，网页实录中的停留已压缩，不会替你播放或记奖励。',steps:['选中一首曲目','按播放，随时可以暂停','回到线索记录，描述听见的特点'],prop:'record'},
 {id:'archive',label:'选片与装载',en:'FOLLOW A RECORD SPINE',target:'.archive-tools',title:'先搜索，再把唱片装载到终端',body:'可以按音乐人、唱片或流派寻找。点封面只装载，不自动播放；还可以滑动书脊唱片架继续发现。',steps:['输入关键词或选流派','点封面查看唱片','装载到终端后亲手播放'],prop:'record'},
 {id:'gear',label:'实时换装',en:'WEAR WHAT YOU HEAR',target:'.wardrobe-layout',title:'装备、来源和实际数值在同一处',body:'下拉框只列出可用和未拥有的装备，换装会更新角色。这里的定位不会替你换装备、强化或花碎片。',steps:['查看装备的来历与效果','选择已拥有的武器或护具','角色预览与CRT同步变化'],prop:'shards'},
 {id:'world',label:'世界与城市',en:'A CITY BEHIND EVERY SOUND',target:'.map-scroll',title:'已解锁的图钉，通向一座音乐城市',body:'城市里有年代地标和三类闪卡。未知海域仍需明确确认、依次花钥匙；观看演示与高亮定位都不会解锁。',steps:['点已解锁海域的唱片图钉','沿城市地标阅读声音历史','翻阅专辑、音乐家与听觉词条'],prop:'map'},
 {id:'harvest',label:'结算与战报',en:'BRING SOMETHING HOME',target:'#settlement',title:'先核对清单，再决定今日结算',body:'普通听歌、查阅和新流派经验先进入清单。每日只结算一次，战报保留领取时的明细；实录来自独立演示存档。',steps:['查看逐项计算和装备回馈','确认后手动领取每日收获','重看战报不会重复发奖'],prop:'receipt'},
 {id:'tales',label:'奇闻与对战',en:'MEET, RESONATE, REMEMBER',target:'.encounter-layout',title:'在这里与旅伴共鸣，再接取支线',body:'受击、攻击、低体力与落败对应真实状态。失败可以重试；首次胜利奖励和漫画领取都有原来的条件。',steps:['观察共鸣值与骑士体力','选择回声斩或守拍','获胜后接取委托，再实际聆听'],prop:'battle'},
 {id:'quests',label:'线索与远征',en:'HEAR A CLUE, FOLLOW A ROUTE',target:'.quest-panel',title:'让听见的特点成为任务的一部分',body:'前两封委托需要自己的观察和比较，暂时说不清同样有效。三曲远征仍需按顺序真实聆听，最后手动领取。',steps:['为听过的音乐留下线索','比较两种流派的相似或不同','或挑三首不同曲目，按顺序远征'],prop:'letter'},
 {id:'journal',label:'手账与留痕',en:'LEAVE A MARK ON THE PAGE',target:'#sound-handbook',title:'流派来处、印泥与自己的笔记',body:'翻页、盖章和写笔记不花钥匙、不发经验。笔记留在当前浏览器；定位只是带你找到这里，不会写入内容。',steps:['翻页认识一种声音的来处','选择印泥，盖在留白处','记录自己的听觉感受，自动保存'],prop:'seal'},
 {id:'signals',label:'海上拾音',en:'LET THE SEA WRITE BACK',target:'#field-signals',title:'三处讯号，拼成一张海上明信片',body:'在已测绘海域里选一个地点，对齐虚构频点，再收下它的短笺。这个创作小实验不播放音频、不影响正式探索；刷新后重新开始。',steps:['选择地点，查看目标频点','手动对频，收齐三段回声','拼成明信片，翻面读故事'],prop:'map'},
 {id:'letters',label:'旅伴来信',en:'LETTERS FROM THE SHORE',target:'#companion-letters',title:'海那边的日常，也值得慢慢听',body:'六片海域各有寄信人和三封原创短篇。只展示已测绘海域的来信，手动翻阅不领奖；刷新后从首封开始。',steps:['选择已经测绘的海域','读伙伴故事和声音标签','手动换一封，看看海那边的日常'],prop:'letter'},
 {id:'landscape',label:'聆听地形',en:'THE SHAPE OF YOUR LISTENING',target:'#sound-landscape',title:'听过的声音，长成一片旷野',body:'六种地形归纳实际达标的聆听记录。今日与累计可切换；插画是流派意象，柱高按记录数量相对缩放，不分析音频。',steps:['查看今日或累计足迹','选择地形，展开对应流派','查看实际曲目记录，随时暂停动态'],prop:'record'},
];
export const sceneFor=id=>guideScenes.find(s=>s.id===id)||guideScenes[0];
export const guideMovieFor=id=>({id:sceneFor(id).id,gif:`/assets/guide-v25/${sceneFor(id).id}.gif`,poster:`/assets/guide-v25/${sceneFor(id).id}-poster.webp`,frames:[0,1,2,3].map(i=>`/assets/guide-v25/${sceneFor(id).id}-${i+1}.webp`)});
export const guideFrameTitles={
 welcome:['挑一张真实唱片','亲手开始试听','留下一条听觉观察','展开第一张声音札记'],
 listen:['查看真实曲目','手动播放音乐','切换琥珀荧光','暂停，保留自己的节奏'],
 archive:['输入音乐人关键词','查看唱片详情','选中想听的封面','装载到终端，等待播放'],
 gear:['看装备来历和效果','更换芦笛短剑','换上叶脉轻盾','搭配潮汐披肩'],
 world:['选择已解锁图钉','进入海港微缩城市','阅读年代地标','翻看唱片闪卡背面'],
 harvest:['核对经验与补给','展开实际曲目记录','手动结算生成战报','查看领取时的明细'],
 tales:['观察双方状态','回声斩产生实际共鸣','守拍减轻反击','获胜后接取支线'],
 quests:['给听过的声音留线索','保存主观比较','选择三曲远征','完成后手动领取宝箱'],
 journal:['阅读一种声音的来处','切换电子流派','盖邮戳、夹书签','留下自己的笔记'],
 signals:['选择海港里的讯号','手动对齐虚构频点','三段回声拼成明信片','翻面阅读故事'],
 letters:['选择已测绘海域','手动换第二封来信','阅读第三封短篇','切换另一位寄信人'],
 landscape:['查看今日足迹','切换累计记录','选择电子晶原','展开实际曲目与日期'],
};
