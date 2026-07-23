import { load, save } from '@/lib/storage';
const detailKey = (language, itemId) => `warframe_detail_v1_${language}_${encodeURIComponent(itemId)}`;
const snapshotKey = (roadmapId) => `roadmap_snapshot_v1_${roadmapId}`;
export const WarframeCache = {
  getDetail: (language, itemId) => load(detailKey(language, itemId), null),
  setDetail: (language, item) => save(detailKey(language, item.id), item),
  getRoadmapSnapshot: (roadmapId) => load(snapshotKey(roadmapId), { version: 1, updatedAt: null, items: {} }),
  setRoadmapSnapshot: (roadmapId, snapshot) => save(snapshotKey(roadmapId), snapshot),
  mergeRoadmapItems(roadmapId, items) { const previous = this.getRoadmapSnapshot(roadmapId); const next = { ...previous, updatedAt: Date.now(), items: { ...previous.items, ...Object.fromEntries(items.map((item) => [item.id, item])) } }; this.setRoadmapSnapshot(roadmapId, next); return next; },
};