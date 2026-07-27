import { executeApiCall, request } from './ApiResult';
import { CATALOG_ENDPOINTS, buildUrl, getDetailEndpoint } from './EndpointRegistry';

const BASE_URL = '/api/warframe';

/**
 * Cria função de fetch para um endpoint do catálogo
 */
function createCatalogFetcher(endpointDef) {
  return async (language) => {
    const url = buildUrl(endpointDef, language);
    const response = await fetch(url, { headers: { 'Accept-Language': language } });
    if (!response.ok) throw new Error(`Warframe API ${response.status}`);
    return response.json();
  };
}

/**
 * Gera métodos da API para cada endpoint do catálogo
 */
const catalogMethods = {};
CATALOG_ENDPOINTS.forEach(endpointDef => {
  catalogMethods[`get${endpointDef.logName}`] = (language) => 
    executeApiCall(endpointDef.endpoint, endpointDef.logName, createCatalogFetcher(endpointDef), language);
});

/**
 * Obtém endpoint de detalhe para uma categoria
 */
function getDetailEndpointForCategory(category) {
  const detail = getDetailEndpoint(category);
  return detail.endpoint;
}

export const WarframeApi = { 
  ...catalogMethods,
  
  getItem: (category, uniqueName, language) => {
    const endpoint = getDetailEndpointForCategory(category);
    return request(`/${endpoint}/${encodeURIComponent(uniqueName)}?by=uniqueName`, language);
  },
  
  getItemByName: (category, name, language) => {
    const endpoint = getDetailEndpointForCategory(category);
    return request(`/${endpoint}/${encodeURIComponent(name)}?by=name`, language);
  },
  
  getDrops: (name, language) => request(`/drops/search/${encodeURIComponent(name)}`, language),
  heartbeat: (language) => request('/heartbeat', language) 
};