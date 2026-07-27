import { WarframeApi } from './WarframeApi';
import { resolveLanguage } from './LanguageResolver';
import { mapItem } from './WarframeMapper';
import { WarframeCache } from './WarframeCache';
import { partitionResults, hasCriticalFailure } from './ApiResult';
import { CATALOG_ENDPOINTS, getDetailEndpoint } from './EndpointRegistry';

const weaponCategories = ['Primary', 'Secondary', 'Melee'];
const formatDrops = (raw, item, drops) => { const own = Array.isArray(raw.drops) ? raw.drops.map((drop) => ({ place: drop.place || drop.location, chance: drop.chance, rotation: drop.rotation, rarity: drop.rarity })) : []; const rows = own.length ? own : (Array.isArray(drops) ? drops.filter((drop) => drop.item?.trim().toLowerCase() === item.name.trim().toLowerCase()) : []); return { drops: rows, farmSummary: rows.map((drop) => [drop.place, drop.rotation && `Rotação ${drop.rotation}`, typeof drop.chance === 'number' && `${drop.chance}%`].filter(Boolean).join(' · ')).join('\n'), dropSource: [...new Set(rows.map((drop) => drop.place).filter(Boolean))].join('\n') }; };

/**
 * Obtém endpoint de detalhe para uma categoria de exibição
 */
function getDetailEndpointForCategory(displayCategory) {
  const detail = getDetailEndpoint(displayCategory);
  return detail.endpoint;
}

export const WarframeRepository = {
  async queryCatalog(language) { 
    // Executa todas as chamadas em paralelo usando definições do EndpointRegistry
    const results = await Promise.all(
      CATALOG_ENDPOINTS.map(endpointDef => 
        resolveLanguage(language, WarframeApi[`get${endpointDef.logName}`])
      )
    );
    
    // Separa sucessos de falhas
    const { successes, failures } = partitionResults(results);
    
    // Log de falhas para auditoria
    if (failures.length > 0) {
      console.warn('[AUDIT] WarframeRepository.queryCatalog - Falhas parciais:', 
        failures.map(f => ({ endpoint: f.endpoint, error: f.error.message, status: f.error.status }))
      );
    }
    
    // Se TODAS falharam, propaga erro crítico
    if (hasCriticalFailure(failures, results.length)) {
      throw new Error('Todas as chamadas de catálogo falharam');
    }
    
    // Extrai dados dos sucessos usando parsers do EndpointRegistry
    const mappedResults = CATALOG_ENDPOINTS.map((endpointDef, index) => {
      const result = results[index];
      const rawData = result.success ? result.data : [];
      
      console.log('[AUDIT] WarframeRepository.queryCatalog - Raw count:', {
        [endpointDef.id]: rawData.length
      });
      
      // Aplica filtro e parser do registry
      const filtered = rawData.filter(endpointDef.filter);
      const mapped = filtered.map(endpointDef.parser);
      
      console.log('[AUDIT] WarframeRepository.queryCatalog - Mapped count:', {
        [endpointDef.id]: mapped.length
      });
      
      return mapped;
    });
    
    // Combina todos os itens mapeados
    const allItems = mappedResults.flat().filter((item) => item.id && item.name);
    
    console.log('[AUDIT] WarframeRepository.queryCatalog - Final count:', allItems.length);
    console.log('[AUDIT] WarframeRepository.queryCatalog - DisplayCategories:', [...new Set(allItems.map(i => i.displayCategory))]);
    
    // Monta lista de categorias que falharam para a UI
    const failedCategories = failures.map(f => ({
      category: f.error.endpoint || f.endpoint,
      endpoint: f.endpoint,
      status: f.error.status,
      message: f.error.message
    }));
    
    return { items: allItems, failedCategories }; 
  },
  getCatalog(language) { return this.queryCatalog(language); },
  getCachedDetail(language, itemId) { return WarframeCache.getDetail(language, itemId); },
  async getItem(item, language, { roadmapId } = {}) { 
    const endpoint = getDetailEndpointForCategory(item.displayCategory);
    let raw = await resolveLanguage(language, (locale) => WarframeApi.getItem(endpoint, item.id, locale), null);
    if (!raw) raw = await resolveLanguage(language, (locale) => WarframeApi.getItemByName(endpoint, item.name, locale), null);
    if (!raw) return null;
    const drops = await resolveLanguage(language, (locale) => WarframeApi.getDrops(item.name, locale));
    const detail = { ...mapItem(raw, item.category), masteryReq: raw.masteryReq ?? raw.masteryRank ?? null, ...formatDrops(raw, item, drops) };
    WarframeCache.setDetail(language, detail);
    if (roadmapId) WarframeCache.mergeRoadmapItems(roadmapId, [detail]);
    return detail;
  },
  async getItemById(itemId, language) {
    // Primeiro verifica se já está em cache
    const cached = WarframeCache.getDetail(language, itemId);
    if (cached) return cached;
    
    // Busca no catálogo para obter informações básicas do item
    const catalog = await this.queryCatalog(language);
    const item = catalog.items.find((i) => i.id === itemId);
    if (!item) return null;
    
    // Busca detalhes completos via API
    const endpoint = getDetailEndpointForCategory(item.displayCategory);
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
