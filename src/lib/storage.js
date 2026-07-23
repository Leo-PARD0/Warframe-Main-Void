const PREFIX = 'wf_catalog_';

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full / unavailable — non-fatal for a PoC */
  }
}

export const DEFAULT_TAGS = [
  { id: 't-early', name: 'Early Game', color: '#34d399', description: 'Itens acessíveis no início' },
  { id: 't-mid', name: 'Mid Game', color: '#60a5fa', description: 'Itens para o meio do jogo' },
  { id: 't-steel', name: 'Steel Path', color: '#f87171', description: 'Recomendado para Steel Path' },
  { id: 't-essential', name: 'Essential', color: '#fbbf24', description: 'Prioridade máxima' },
  { id: 't-boss', name: 'Boss', color: '#a78bfa', description: 'Drop de chefes' },
  { id: 't-rifle', name: 'Rifle', color: '#22d3ee', description: 'Rifle primária' },
  { id: 't-shotgun', name: 'Shotgun', color: '#fb923c', description: 'Escopeta' },
  { id: 't-melee', name: 'Melee', color: '#f472b6', description: 'Corpo a corpo' },
  { id: 't-quest', name: 'Quest', color: '#c084fc', description: 'Recompensa de quest' },
  { id: 't-farm', name: 'Farm Longo', color: '#facc15', description: 'Requer farme extenso' },
];