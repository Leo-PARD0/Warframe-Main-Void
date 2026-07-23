import { load, save } from '@/lib/storage';

// ── Roadmaps ──────────────────────────────────────────────────────────────────
export function loadRoadmaps() {
  return load('roadmaps', []);
}
export function saveRoadmaps(list) {
  save('roadmaps', list);
}

export function createRoadmap({ name = 'Novo Roadmap', description = '' } = {}) {
  return {
    id: 'rm_' + Date.now(),
    name,
    description,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    favorite: false,
    active: false,
    bgColor: '#0e0f14',
    zoom: 1,
    panX: 0,
    panY: 0,
  };
}

// ── Nodes ─────────────────────────────────────────────────────────────────────
export function loadNodes(roadmapId) {
  return load(`nodes_${roadmapId}`, []);
}
export function saveNodes(roadmapId, nodes) {
  save(`nodes_${roadmapId}`, nodes);
}

export function createNode({ itemId, x = 100, y = 100, completed = false }) {
  return { id: 'n_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6), itemId, x, y, completed };
}

// ── Connections ───────────────────────────────────────────────────────────────
export function loadConnections(roadmapId) {
  return load(`edges_${roadmapId}`, []);
}
export function saveConnections(roadmapId, edges) {
  save(`edges_${roadmapId}`, edges);
}

export function createConnection({ from, to, type = 'dependency' }) {
  return { id: 'e_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6), from, to, type };
}

// ── Item notes (manual info) ───────────────────────────────────────────────────
export function loadItemNotes() {
  return load('item_notes', {});
}
export function saveItemNotes(notes) {
  save('item_notes', notes);
}