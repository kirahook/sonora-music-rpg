import {albums,regions} from './catalog.js';
import {creatures,tales} from './encounters.js';
import {companions} from './fieldPresentation.js';
import {regionAtlas} from './regionAtlas.js';
import {worldStatus} from './worldStatus.js';

export function regionGuide(state,region){
 const s=worldStatus(state,region),journal=state.journal||{},stories=tales.filter(t=>t.region===s.region);
 const claimed=stories.filter(t=>journal.quests?.[t.id]?.status==='claimed').length;
 const accepted=stories.filter(t=>!!journal.quests?.[t.id]).length;
 const album=s.unlocked?albums[regions[s.region].album]:null,atlas=s.unlocked?regionAtlas[s.region]:null;
 const lens=atlas?.concepts[0];
 return {...s,claimed,accepted,
  won:s.unlocked&&!!journal.battles?.[s.region]?.won,
  album,listenTitle:lens?.title||null,listenBody:lens?.body||null,
  friend:s.unlocked?companions[s.region]:null,creature:s.unlocked?creatures[s.region]:null,
  atlas,
  next:s.unlocked?'从代表唱片或音乐城市开始，不必先完成战斗。':s.region===s.frontier?(s.keys?'可以使用一枚钥匙，明确确认后解锁。':'先聆听并结算，领取下一程的探索钥匙。'):'需要先沿航线解锁前一片海域。',
 };
}
