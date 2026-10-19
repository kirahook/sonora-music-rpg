import {useState} from 'react';
import {guideEditorial} from './guideEditorial.js';
import {WardrobeAvatar} from './Wardrobe';
import {GearArt,CreatureArt} from './Armory';
import {gear} from './equipment';
import {albums} from './catalog';

export function GuideSpeech({id,index}){
 const [line,setLine]=useState(0),quotes=guideEditorial[id].quotes;
 return <aside className={'guide-speech '+(index>4?'speech-left':'speech-right')} aria-label="骑士的旅途碎碎念">
  <div className="guide-speech-meta"><span>骑士的碎碎念</span><small>{line+1} / {quotes.length}</small></div>
  <p role="status" aria-live="polite" aria-atomic="true" key={line}>{quotes[line]}</p>
  <button aria-label="换一句骑士对白" onClick={()=>setLine(v=>(v+1)%quotes.length)}>换一句</button>
 </aside>;
}

function Specimen({item,state}){
 if(item.kind==='knight')return <WardrobeAvatar state={state}/>;
 if(item.kind==='record')return <img src={albums[item.index].cover} alt={albums[item.index].title+' 专辑封面'} loading="lazy"/>;
 if(item.kind==='gear')return <GearArt item={gear.find(g=>g.id===item.id)}/>;
 if(item.kind==='creature')return <CreatureArt region={item.index}/>;
 if(item.kind==='harvest')return <img src={'/assets/v6-harvest-'+item.name+'.png'} alt="归航收获卡插画" loading="lazy"/>;
 const grids={plate:[4,2,'/assets/v8-handbook-plates.png'],terrain:[3,2,'/assets/v9-sound-terrains.png'],flower:[3,1,'/assets/v7-pixel-flowers.png']};
 const [cols,rows,src]=grids[item.kind];
 return <span className={'guide-atlas guide-atlas-'+item.kind} role="img" aria-label={{plate:'音乐流派手账插画',terrain:'音乐海域地貌标本',flower:'每日声音花园像素花'}[item.kind]} style={{backgroundImage:`url('${src}')`,backgroundSize:`${cols*100}% ${rows*100}%`,backgroundPosition:`${item.index%cols*100/(cols-1)}% ${rows===1?0:Math.floor(item.index/cols)*100/(rows-1)}%`}}/>;
}

export function GuideEditorial({step,index,state}){
 const page=guideEditorial[step.id];
 return <section className="guide-editorial" aria-label="本章玩法说明">
  <header className="guide-editorial-folio"><span>SONORA / FIELD NOTES</span><span>CHAPTER {String(index+1).padStart(2,'0')} — 09</span></header>
  <div className="guide-editorial-route" aria-hidden="true"><img src="/assets/v11-guide-sound-city.png" alt=""/>{page.words.map(word=><span key={word}>{word}</span>)}</div>
  <div className="guide-facts">{step.cards.map(([en,title,body],i)=><article key={title}><span className="guide-fact-number">0{i+1}</span><div className="guide-fact-copy"><p>{en}</p><h3>{title}</h3><div>{body}</div></div></article>)}</div>
  <div className="guide-specimen-heading"><span>观察标本 / OBJECTS OF A JOURNEY</span><small>插画索引 · 不代表已获得物品</small></div>
  <div className="guide-specimens" tabIndex={0} role="group" aria-label="五枚本章插画标本，手机可左右滑动">{page.specimens.map((item,i)=><figure key={i}><div className={'guide-specimen-art specimen-'+item.kind}><Specimen item={item} state={state}/></div><figcaption><b>0{i+1}</b><span>{page.captions[i]}</span></figcaption></figure>)}</div>
  <p className="guide-specimen-end">{step.label} / 每个声音，都有自己的形状。<span>END OF NOTE {String(index+1).padStart(2,'0')}</span></p>
 </section>;
}
