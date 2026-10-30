import {useEffect,useRef,useState} from 'react';
import {guideSteps,readGuide,saveGuide,shouldOpenGuide,moveGuide,finishGuide,replayGuide} from './onboarding';
import {WardrobeAvatar} from './Wardrobe';
import {GearArt} from './Armory';
import {gear,rewardTiers} from './equipment';
import {albums} from './catalog';
import {tales} from './encounters';
import {GuideSpeech,GuideEditorial} from './GuideEditorial.jsx';
import {GuideBattle,GuideWorld,GuideSettlement,GuideGear} from './GuideFeatures.jsx';
import {FirstListen} from './ListeningDiscovery.jsx';
import {gameFor} from './gameplay.js';
import {GuideCinema} from './GuideCinema.jsx';

export function useOnboarding(){
 const storage=()=>{try{return window.localStorage;}catch{return null;}};
 const [guide,setGuide]=useState(()=>readGuide(storage()));
 const [open,setOpen]=useState(()=>shouldOpenGuide(guide));
 const [saved,setSaved]=useState(true);
 function persist(next){setGuide(next);setSaved(saveGuide(storage(),next));}
 function go(step){persist(moveGuide(guide,step));}
 function close(status){persist(finishGuide(guide,status));setOpen(false);}
 function replay(){persist(replayGuide(guide));setOpen(true);}
 useEffect(()=>{if(open&&guide.status==='new'){const next=moveGuide(guide,0);setGuide(next);setSaved(saveGuide(storage(),next));}},[open,guide.status]);
 return {guide,open,saved,go,close,replay,resume:()=>{persist({...guide,status:'in-progress'});setOpen(true);},handbook:()=>persist({...moveGuide(guide,guide.step),route:'handbook'}),setFirst:first=>persist({...guide,status:'in-progress',route:'first-listen',first}),pause:()=>persist({...guide,paused:!guide.paused})};
}

function GuideDemo({id}){
 const [choice,setChoice]=useState(0);
 if(id==='listen')return <div className="guide-demo"><div className="guide-demo-meter"><span>实际聆听（演示）</span><progress aria-label="达标聆听演示" max="20" value={choice?20:0}/><b>{choice?'20 / 20 SEC · +120 XP 待结算':'00 / 20 SEC'}</b></div><button onClick={()=>setChoice(v=>v?0:1)}>{choice?'重看达标前':'演示达标反馈'}</button></div>;
 if(id==='archive')return <div className="guide-demo guide-record-demo"><div>{albums.slice(0,3).map((a,i)=><button key={a.code} aria-label={'示范查看 '+a.title} aria-pressed={choice===i} onClick={()=>setChoice(i)}><img src={a.cover} alt=""/><span>{a.genre}</span></button>)}</div><p><b>{albums[choice].title}</b><span>{albums[choice].artist} · 点选只在指南里预览，不播放、不计查阅。</span></p></div>;
 if(id==='gear')return <GuideGear/>;
 if(id==='world')return <GuideWorld/>;
 if(id==='harvest')return <GuideSettlement/>;
 if(id==='tales')return <GuideBattle/>;
 if(id==='quests')return <div className="guide-demo guide-expedition-demo"><div>{[0,1,2].map(i=><button key={i} disabled={choice!==i} onClick={()=>setChoice(i+1)} aria-label={'演示远征第'+(i+1)+'站'}>{choice>i?'✓':'0'+(i+1)}<span>{choice>i?'已抵达':'点选抵达'}</span></button>)}</div><p>{choice===3?'三站抵达，正式远征还要手动领取宝箱。':'按顺序点选三站，了解路线推进。'}</p>{choice===3&&<button onClick={()=>setChoice(0)}>重看路线</button>}</div>;
 if(id==='journal')return <div className="guide-demo guide-stamp-demo"><div className={choice?'guide-demo-stamp stamped':'guide-demo-stamp'} aria-label={choice?'引导演示邮戳已盖好':'引导演示邮戳留白区'}>{choice?<span>SONORA<br/><b>READ / 01</b><br/>SOUND JOURNAL</span>:<small>给阅读留一个记号</small>}</div><div><button onClick={()=>setChoice(v=>v?0:1)}>{choice?'收起演示邮戳':'试盖一枚邮戳'}</button><p>只作演示，不改变真实手账。</p></div></div>;
 return <div className="guide-demo guide-welcome-demo">{[['聆听','LET IT PLAY'],['积累','LET IT GROW'],['结算','BRING IT HOME'],['探索','WANDER ON']].map(([title,en],i)=><div key={en}><small>0{i+1} / {en}</small><b>{title}</b></div>)}<p>没有倒计时，也不强制播放。旅程由你按下开始。</p></div>;
}

export function Onboarding({tour,state,onNavigate,player,power,onChoose,onObserve,onLocate}){
 const ref=useRef(null),scroll=useRef(null),heading=useRef(null),returnTarget=useRef(null);
 const {guide,open,saved,go,close,pause}=tour;
 const step=guideSteps[guide.step],last=guide.step===guideSteps.length-1;
 const firstRoute=guide.route==='first-listen'&&!!player&&!!onChoose;
 useEffect(()=>{
  if(!open){if(ref.current?.open)ref.current.close();return;}
  returnTarget.current=document.activeElement;
  if(!ref.current.open)ref.current.showModal();
  const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
  return()=>{document.body.style.overflow=overflow;if(ref.current?.open)ref.current.close();returnTarget.current?.focus?.({preventScroll:true});};
 },[open]);
 useEffect(()=>{if(open){scroll.current?.scrollTo({top:0,behavior:'instant'});(firstRoute?ref.current?.querySelector('#guide-title'):heading.current)?.focus({preventScroll:true});}},[guide.step,guide.route,guide.first?.step,open]);
 function visit(target){close(last?'completed':'skipped');requestAnimationFrame(()=>onNavigate(target));}
 function keys(e){if(firstRoute||e.defaultPrevented||e.target.closest('select,input,textarea,.atlas-deck,.guide-cinema,.guide-portal'))return;if(e.key==='ArrowRight'&&!last){e.preventDefault();go(guide.step+1);}if(e.key==='ArrowLeft'&&guide.step>0){e.preventDefault();go(guide.step-1);}}
 return <dialog ref={ref} className={'guide-dialog '+(guide.paused?'guide-paused':'')} aria-labelledby="guide-title" aria-describedby="guide-intro" onCancel={e=>{e.preventDefault();close('skipped');}} onKeyDown={keys}>
  {open&&firstRoute?<div className="guide-shell first-guide-shell"><header className="guide-header"><div className="guide-wordmark">SONORA<small>旅人指南 / FIRST LISTEN</small></div><button className="first-guide-motion" aria-pressed={guide.paused} onClick={pause}>{guide.paused?'恢复动效':'暂停动效'}</button><button className="first-guide-close" onClick={()=>close('skipped')} aria-label="稍后完成第一次聆听">稍后再听 ×</button></header><div className="guide-scroll first-guide-scroll" ref={scroll}><FirstListen tour={tour} state={state} game={gameFor(state)} player={player} power={power} onChoose={onChoose} onObserve={onObserve} onNavigate={onNavigate} onLocate={onLocate}/>{!saved&&<p className="guide-storage-warning" role="status">当前不能保存引导进度，仍可继续体验。</p>}</div></div>:open&&<div className="guide-shell">
   <header className="guide-header"><div className="guide-wordmark"><span aria-hidden="true">✳</span><div>SONORA<small>旅人入门手册 / FIELD GUIDE</small></div></div><div className="guide-header-actions"><span className="guide-edition guide-edition-phone">POCKET / 手机版</span><span className="guide-edition guide-edition-desktop">DESKTOP / 网页版</span><button onClick={()=>close('skipped')} aria-label="跳过新手引导">稍后再看 <span aria-hidden="true">×</span></button></div></header>
   <div className="guide-progress"><progress aria-label="新手引导阅读进度" max={guideSteps.length} value={guide.step+1}/><span>{String(guide.step+1).padStart(2,'0')} / {String(guideSteps.length).padStart(2,'0')}</span></div>
   {tour.replay&&<button className="first-guide-return" onClick={tour.replay}>先完成一次小聆听 · 四步启程</button>}
   <nav className="guide-chapters" aria-label="新手引导章节">{guideSteps.map((s,i)=><button key={s.id} aria-current={guide.step===i?'step':undefined} onClick={()=>go(i)}><small>{String(i+1).padStart(2,'0')}</small>{s.label}</button>)}</nav>
   <label className="guide-jump">阅读章节<select aria-label="跳转引导章节" value={guide.step} onChange={e=>go(+e.target.value)}>{guideSteps.map((s,i)=><option key={s.id} value={i}>{String(i+1).padStart(2,'0')} / {s.label}</option>)}</select></label>
   <div className="guide-scroll" ref={scroll}>
    <div className="guide-intro" key={step.id+'intro'}><div><p className="guide-kicker">{String(guide.step+1).padStart(2,'0')} / FIELD GUIDE</p><p className="guide-pixel-title function-pixel-title">{step.en.replace(/^\d+\s*\/\s*/,'')}.</p><h2 id="guide-title" tabIndex={-1} ref={heading}>{step.title}</h2></div><p id="guide-intro">{step.lead}</p></div>
    <GuideCinema key={step.id+'movie'} id={step.id} onLocate={onLocate} paused={guide.paused} embeddedInChapter/>
    <details className="guide-story-fold"><summary>旅伴旁白与世界插画 · 展开看看</summary><div className={'guide-stage stage-'+step.id} style={{'--journey':guide.step/(guideSteps.length-1)*100+'%','--traveller-left':22+guide.step*6+'%'}} aria-label="米白黑灰剪影音乐世界旅程插画">
     <div className="guide-city guide-city-far"/><div className="guide-city guide-city-near"/>
     <div className="guide-scene-top"><span>THE WORLD IS WAITING.</span><button onClick={pause} aria-pressed={guide.paused}>{guide.paused?'恢复动画':'暂停动画'}</button></div>
     <div className="guide-traveller" key={step.id}><WardrobeAvatar state={state} className="guide-knight"/><span className="guide-traveller-shadow"/></div>
     <GuideSpeech key={step.id+'speech'} id={step.id} index={guide.step}/>
     <div className="guide-sound-trail" aria-hidden="true"><i>♪</i><i>·</i><i>♫</i><i>·</i><i>✦</i></div>
     <div className="guide-scene-caption"><span>0{guide.step+1} / {step.label}</span><b>{['一张唱片，就是一个世界。','让旋律成为你的第一步。','沿着唱片的书脊，发现远方。','带上你的声音。','迷雾背后，还有新的频率。','每一次归航，都有收获。','和陌生的声音，交换一个故事。','三首歌，三站旅途。','把喜欢的声音，留在纸上。'][guide.step]}</b></div>
    </div></details>
    <div className="guide-device-tip"><div className="guide-tip-desktop"><span>POINTER + KEYS / 网页操作</span><p>{['用顶部导航切换页面；本指南可用 ← / → 翻阅。','在终端右侧选择曲目，使用 PLAY 或上一首 / 下一首。','鼠标悬停看唱片信息；滚轮横向循环，支持搜索筛选。','在角色预览旁选择装备，首页与 CRT 同步变化。','点击海域 / 怪兽图钉；放大后可横向滚动地图。','在地图右侧查看每日清单，再点击结算。','图鉴选择区域，用回声斩或守拍完成首次交战。','花卡支持指针倾斜与换位；远征歌单在右侧选择。','页签与 ← / → 翻页；选择印泥，在留白处盖章。'][guide.step]}</p></div><div className="guide-tip-phone"><span>TOUCH / 手机操作</span><p>{['用底部五个入口切换页面，随行播放条始终在手边。','点按播放 / 暂停；音乐需要由你亲手启动。','左右滑动唱片架；点封面查看，再装载播放。','点「装备」进入，使用下拉框选择已拥有的装备。','左右滑动地图，点 + / − 缩放，再点图钉看详情。','到「世界」页往下滑，查看每日结算。','点怪兽图钉或图鉴，再点交战与任务按钮。','点「远征」进入，选择三站曲目；花卡也可点按。','点页签或上下页翻阅；点盖章按钮，再点留白处。'][guide.step]}</p></div></div>
    <GuideEditorial step={step} index={guide.step} state={state}/>
    <section className="guide-practice" aria-label="不计入存档的交互演示"><div className="guide-practice-label"><div><span>FIELD EXERCISE / 纸上练习</span><h3>把这一页，试着走一遍。</h3></div><small>演示不计经验、不消耗道具、不修改游戏存档</small></div><GuideDemo key={step.id} id={step.id}/></section>
    <details className="guide-faq"><summary>旅人速查 · 存档、奖励与播放</summary><dl><dt>第一次使用需要注册吗？</dt><dd>不需要。当前是浏览器内的音乐工具，没有登录系统，也没有账号云存档。</dd><dt>什么时候经验到账？</dt><dd>普通聆听、查阅和新流派先进入每日待结算清单；交战、委托、远征和支线在各自领取条件下到账。同首同日不重复计奖。</dd><dt>结算以后还能继续听吗？</dt><dd>可以，继续记录聆听地形，也可推进已接取的奇闻和每日玩法，但不会追加已领取的当日结算。</dd><dt>为什么没声音？</dt><dd>检查终端电源、静音和设备音量。官方试听可能受地区或音源变更影响，可切换曲目或导入本地音频。</dd><dt>换手机能带走存档吗？</dt><dd>目前不能自动同步。进度保存在当前设备和浏览器；清除网站数据会丢失存档，请勿用「重置探索进度」测试引导。</dd></dl></details>
    {!saved&&<p className="guide-storage-warning" role="status">此浏览器暂时不能保存引导状态。关闭后仍可使用网站，下次访问可能再次显示。</p>}
   </div>
   <footer className="guide-footer"><div><button className="guide-back" disabled={guide.step===0} onClick={()=>go(guide.step-1)}>← 上一步</button>{guide.step>0&&<button className="guide-restart" onClick={()=>go(0)}>从头阅读</button>}</div><div><button className="guide-visit" onClick={()=>visit(step.target)}>{last?step.action:'先'+step.action} ↗</button><button className="guide-next" onClick={()=>last?visit('archive'):go(guide.step+1)}>{last?'完成，去选第一张唱片':'下一步'} <span aria-hidden="true">→</span></button></div></footer>
  </div>}
 </dialog>;
}
