/**
 * Endpoint Registry - Single Source of Truth para endpoints da API Warframe
 * 
 * Cada definição contém:
 * - id: identificador único da categoria
 * - endpoint: path da API (sem base URL)
 * - parser: função de parsing (referência ao mapper)
 * - sourceCategory: categoria de origem na API (para filtro)
 * - critical: se falha crítica (para health check)
 * - logName: nome para logs
 */

import { mapItem } from './WarframeMapper';

const BASE_URL = '/api/warframe';

/**
 * Cria URL completa com idioma
 */
const withLanguage = (path, language) => 
  `${path}${path.includes('?') ? '&' : '?'}language=${encodeURIComponent(language)}`;

/**
 * Parser genérico que aplica o mapper com a sourceCategory correta
 */
const createParser = (sourceCategory) => (rawItem) => mapItem(rawItem, sourceCategory);

/**
 * Filtros de categoria por endpoint
 */
const FILTERS = {
  warframes: (item) => item.category === 'Warframes',
  weapons: (item) => ['Primary', 'Secondary', 'Melee'].includes(item.category),
  mods: () => true, // todos os mods
  relics: () => true, // todos os relics
  arcanes: () => true, // todos os arcanes
  ampComponents: () => true, // todos os amp components
};

/**
 * Registry de endpoints do catálogo
 * Ordem define prioridade de carregamento
 */
export const CATALOG_ENDPOINTS = [
  {
    id: 'warframes',
    endpoint: '/warframes',
    parser: createParser('Warframes'),
    filter: FILTERS.warframes,
    sourceCategory: 'Warframes',
    critical: true,
    logName: 'Warframes'
  },
  {
    id: 'weapons',
    endpoint: '/weapons',
    parser: createParser('Weapons'),
    filter: FILTERS.weapons,
    sourceCategory: 'Weapons',
    critical: true,
    logName: 'Weapons'
  },
  {
    id: 'mods',
    endpoint: '/mods',
    parser: createParser('Mods'),
    filter: FILTERS.mods,
    sourceCategory: 'Mods',
    critical: true,
    logName: 'Mods'
  },
  {
    id: 'relics',
    endpoint: '/items?filter=category:Relics',
    parser: createParser('Relics'),
    filter: FILTERS.relics,
    sourceCategory: 'Relics',
    critical: true,
    logName: 'Relics'
  },
  {
    id: 'arcanes',
    endpoint: '/arcanes',
    parser: createParser('Arcanes'),
    filter: FILTERS.arcanes,
    sourceCategory: 'Arcanes',
    critical: false, // não crítico - pode falhar sem quebrar catálogo
    logName: 'Arcanes'
  },
  {
    id: 'ampComponents',
    endpoint: '/items?filter=type:Amp',
    parser: createParser('AmpComponents'),
    filter: FILTERS.ampComponents,
    sourceCategory: 'AmpComponents',
    critical: false, // não crítico
    logName: 'AmpComponents'
  }
];

/**
 * Endpoints de detalhe (não catálogo)
 */
export const DETAIL_ENDPOINTS = {
  warframes: { endpoint: '/warframes', logName: 'WarframeDetail' },
  weapons: { endpoint: '/weapons', logName: 'WeaponDetail' },
  mods: { endpoint: '/mods', logName: 'ModDetail' },
  arcanes: { endpoint: '/arcanes', logName: 'ArcaneDetail' },
  items: { endpoint: '/items', logName: 'ItemDetail' }
};

/**
 * Obtém endpoint de detalhe para uma categoria de exibição
 */
export function getDetailEndpoint(displayCategory) {
  const map = {
    'Warframe': 'warframes',
    'Weapon': 'weapons',
    'Mod': 'mods',
    'Arcane': 'arcanes',
    'AmpComponent': 'items',
    'Relic': 'items',
    'Component': 'items'
  };
  return DETAIL_ENDPOINTS[map[displayCategory] || 'items'];
}

/**
 * Obtém definição de endpoint por ID
 */
export function getEndpointById(id) {
  return CATALOG_ENDPOINTS.find(e => e.id === id);
}

/**
 * Obtém todos os IDs de endpoints do catálogo
 */
export function getCatalogEndpointIds() {
  return CATALOG_ENDPOINTS.map(e => e.id);
}

/**
 * Obtém endpoints críticos
 */
export function getCriticalEndpoints() {
  return CATALOG_ENDPOINTS.filter(e => e.critical);
}

/**
 * Obtém endpoints não-críticos
 */
export function getNonCriticalEndpoints() {
  return CATALOG_ENDPOINTS.filter(e => !e.critical);
}

/**
 * Constrói URL completa para um endpoint
 */
export function buildUrl(endpointDef, language) {
  return `${BASE_URL}${withLanguage(endpointDef.endpoint, language)}`;
}

export { BASE_URL, withLanguage };