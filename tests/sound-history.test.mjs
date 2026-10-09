import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recordSound,archiveSound,soundReport,soundLogFor} from '../src/soundHistory.js';
import {weaponGrips,heldPose,handAnchors} from '../src/wardrobePose.js';
const base=()=>({day:'2026-10-09',xp:8660,keys:4,frontier:3,listened:[],knownGenres:['JAZZ'],claimed:false});
const track=(id,genre='JAZZ')=>({id,title:'Track '+id,genre,albumCode:'A-'+id});
test('real credits deduplicate by track/day without awarding XP or consuming keys',()=>{
 let s=recordSound(base(),track('a'));s=recordSound(s,track('a'));assert.equal(soundReport(s).total,1);assert.equal(s.xp,8660);assert.equal(s.keys,4);
 s=recordSound(s,track('b','SOUL'));assert.equal(soundReport(s).regions[0].count,2);assert.equal(soundReport(s).genreCount,2);assert.equal(soundReport(s).max,2);
});
test('today and lifetime windows preserve the same track on different days',()=>{
 let s=recordSound(base(),track('a'));s=recordSound({...archiveSound(s),day:'2026-10-10',listened:[]},track('a'));assert.equal(soundReport(s).total,1);assert.equal(soundReport(s,'all').total,2);assert.equal(soundReport(s,'all').uniqueTracks,1);assert.equal(soundReport(s,'all').days,2);
 const next=JSON.parse(JSON.stringify({...s,day:'2026-10-11'}));assert.equal(soundReport(next).total,0);assert.equal(soundReport(next,'all').total,2);
});
test('legacy current-day lists migrate once, never infer counts from discovered genres',()=>{
 let s={...base(),knownGenres:['JAZZ','ELECTRONIC'],listened:[track('a')],game:{day:'2026-10-09',heard:[track('a'),track('b','IDM')]}};
 s=archiveSound(s);assert.equal(soundReport(s).total,2);assert.equal(soundReport(archiveSound(s)).total,2);assert.deepEqual(Object.keys(soundLogFor(s)),['2026-10-09']);
 assert.equal(soundReport({...base(),game:{day:'2026-10-08',heard:[track('old')]}}).total,0);assert.equal(soundReport(base()).total,0);
});
test('post-settlement listens still enter history and local audio stays outside six biome counts',()=>{
 let s=recordSound({...base(),claimed:true},track('a','LOCAL'));s=recordSound(s,track('b','METAL'));
 const r=soundReport(s);assert.equal(r.total,2);assert.equal(r.other.length,1);assert.equal(r.regions.reduce((n,x)=>n+x.count,0),1);assert.equal(r.regions[4].count,1);assert.equal(s.claimed,true);
});
test('invalid credits and empty states are safe, reports do not mutate save',()=>{
 const s=base();assert.equal(recordSound(s,{id:'a'}),s);assert.equal(recordSound(s,{genre:'JAZZ'}),s);const before=JSON.stringify(s);assert.equal(soundReport(s).max,1);assert.equal(JSON.stringify(s),before);assert.equal(archiveSound(s),s);
});
test('each held weapon has its own atlas grip and an invariant body-hand attachment',()=>{
 assert.equal(weaponGrips.length,8);assert.equal(new Set(weaponGrips.map(g=>[g.x,g.y,g.angle].join('/'))).size,8);
 for(let i=0;i<8;i++){const pose=heldPose(i,'weapon');assert.equal(pose.left,handAnchors.weapon.x*100+'%');assert.equal(pose.top,handAnchors.weapon.y*100+'%');assert.ok(pose.transformOrigin.includes(weaponGrips[i].x*100+'%'));assert.ok(pose.transform.includes('translate('));}
 const shield=heldPose(10,'shield');assert.equal(shield.left,handAnchors.shield.x*100+'%');assert.ok(shield.transform.includes('rotate(-7deg)'));
});
