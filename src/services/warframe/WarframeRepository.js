import { WarframeApi } from './WarframeApi';
import { resolveLanguage } from './LanguageResolver';
import { mapItem } from './WarframeMapper';
import { WarframeCache } from './WarframeCache';
const weaponCategories = ['Primary', 'Secondary', 'Melee'];
const endpointFor = (item) => item.displayCategory === 'Mod' ? 'mods' : item.displayCategory === 'Warframe' ? 'warframes' : item.displayCategory === 'Weapon' ? 'weapons' : 'items';
const formatDrops = (raw, item, drops) => { const own = Array.isArray(raw.drops) ? raw.drops.map((drop) => ({ place: drop.place || drop.location, chance: drop.chance, rotation: drop.rotation, rarity: drop.rarity })) : []; const rows = own.length ? own : (Array.isArray(drops) ? drops.filter((drop) => drop.item?.trim().toLowerCase() === item.name.trim().toLowerCase()) : []); return { drops: rows, farmSummary: rows.map((drop) => [drop.place, drop.rotation && `Rotação ${drop.rotation}`, typeof drop.chance === 'number' && `${drop.chance}%`].filter(Boolean).join(' · ')).join('\n'), dropSource: [...new Set(rows.map((drop) => drop.place).filter(Boolean))].join('\n') }; };
export const WarframeRepository = {
  async queryCatalog(language) { const [warframes, weapons, mods, relics] = await Promise.all([resolveLanguage(language, WarframeApi.getWarframes), resolveLanguage(language, WarframeApi.getWeapons), resolveLanguage(language, WarframeApi.getMods), resolveLanguage(language, WarframeApi.getRelics)]); return [...warframes.filter((item) => item.category === 'Warframes').map((item) => mapItem(item, 'Warframes')), ...weapons.filter((item) => weaponCategories.includes(item.category)).map((item) => mapItem(item, 'Weapons')), ...mods.map((item) => mapItem(item, 'Mods')), ...relics.map((item) => mapItem(item, 'Relics'))].filter((item) => item.id && item.name); },
  getCatalog(language) { return this.queryCatalog(language); },
  getCachedDetail(language, itemId) { return WarframeCache.getDetail(language, itemId); },
  async getItem(item, language, { roadmapId } = {}) { const endpoint = endpointFor(item); let raw = await resolveLanguage(language, (locale) => WarframeApi.getItem(endpoint, item.id, locale), null); if (!raw) raw = await resolveLanguage(language, (locale) => WarframeApi.getItemByName(endpoint, item.name, locale), null); if (!raw) return null; const drops = await resolveLanguage(language, (locale) => WarframeApi.getDrops(item.name, locale)); const detail = { ...mapItem(raw, item.category), masteryReq: raw.masteryReq ?? raw.masteryRank ?? null, ...formatDrops(raw, item, drops) }; WarframeCache.setDetail(language, detail); if (roadmapId) WarframeCache.mergeRoadmapItems(roadmapId, [detail]); return detail; },
  async getItemById(itemId, language) {
    // Primeiro verifica se já está em cache
    const cached = WarframeCache.getDetail(language, itemId);
    if (cached) return cached;
    
    // Busca no catálogo para obter informações básicas do item
    const catalog = await this.queryCatalog(language);
    const item = catalog.find((i) => i.id === itemId);
    if (!item) return null;
    
    // Busca detalhes completos via API
    const endpoint = endpointFor(item);
    let raw = await resolveLanguage(language, (locale) => WarframeApi.getItem(endpoint, item.id, locale), null);
    if (!raw) return null;
    
    const drops = await resolveLanguage(language, (locale) => WarframeApi.getDrops(item.name, locale));
    const detail = { ...mapItem(raw, item.category), masteryReq: raw.masteryReq ?? raw.masteryRank ?? null, ...formatDrops(raw, item, drops) };
    
    // Salva no cache
    WarframeCache.setDetail(language, detail);
    WarframeCache.mergeRoadmapItems('__catalog__', [detail]);
    
    return detail;
  },
  getRoadmapSnapshot(roadmapId) { return WarframeCache.getRoadmapSnapshot(roadmapId); },
  setRoadmapSnapshot(roadmapId, snapshot) { WarframeCache.setRoadmapSnapshot(roadmapId, snapshot); },
  async importRoadmapSnapshot(roadmapId, snapshot) { WarframeCache.setRoadmapSnapshot(roadmapId, snapshot); },
  async checkHealth(language) { try { await WarframeApi.heartbeat(language); return { ok: true }; } catch { return { ok: false }; } },
};