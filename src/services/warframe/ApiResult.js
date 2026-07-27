/**
 * ApiResult - Padrão de resiliência para chamadas de API
 * 
 * Cada chamada retorna um objeto { success: boolean, data: T | null, error: Error | null }
 * Isso permite que Promise.allSettled processe todas as chamadas independentemente
 */

export class ApiError extends Error {
  constructor(message, status, endpoint) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.endpoint = endpoint;
  }
}

/**
 * Executa uma chamada de API com tratamento padronizado
 * @param {string} endpoint - Endpoint para logging
 * @param {string} label - Label para logging
 * @param {Function} apiCall - Função que executa a chamada (recebe language)
 * @param {string} language - Idioma
 * @returns {Promise<{success: boolean, data: any, error: ApiError | null}>}
 */
export async function executeApiCall(endpoint, label, apiCall, language) {
  const startTime = Date.now();
  
  try {
    const data = await apiCall(language);
    const duration = Date.now() - startTime;
    
    console.log(`[AUDIT] WarframeApi.${label}:`, { 
      count: Array.isArray(data) ? data.length : 'N/A', 
      sampleCategory: Array.isArray(data) && data[0] ? data[0].category : 'N/A', 
      sampleName: Array.isArray(data) && data[0] ? data[0].name : 'N/A',
      duration: `${duration}ms`,
      success: true
    });
    
    return { success: true, data, error: null };
  } catch (err) {
    const duration = Date.now() - startTime;
    const status = err.status || (err.message?.match(/Warframe API (\d+)/)?.[1] ? parseInt(err.message.match(/Warframe API (\d+)/)[1]) : 0);
    
    const apiError = new ApiError(
      err.message || 'Erro desconhecido',
      status,
      endpoint
    );
    
    console.warn(`[AUDIT] WarframeApi.${label} FALHOU:`, { 
      endpoint, 
      error: apiError.message, 
      status: apiError.status,
      duration: `${duration}ms`,
      success: false
    });
    
    return { success: false, data: null, error: apiError };
  }
}

/**
 * Wrapper para chamadas simples que não precisam do padrão de resiliência
 * (getItem, getItemByName, getDrops, heartbeat)
 */
export async function request(path, language) {
  const BASE_URL = '/api/warframe';
  const withLanguage = (p, lang) => `${p}${p.includes('?') ? '&' : '?'}language=${encodeURIComponent(lang)}`;
  
  const response = await fetch(`${BASE_URL}${withLanguage(path, language)}`, { 
    headers: { 'Accept-Language': language } 
  });
  
  if (!response.ok) throw new Error(`Warframe API ${response.status}`);
  return response.json();
}

/**
 * Combina resultados de múltiplas chamadas, separando sucessos de falhas
 * @param {Array<{success: boolean, data: any, error: ApiError | null}>} results
 * @returns {{successes: Array<{endpoint: string, data: any}>, failures: Array<{endpoint: string, error: ApiError}>}}
 */
export function partitionResults(results) {
  const successes = [];
  const failures = [];
  
  results.forEach((result, index) => {
    if (result.success) {
      successes.push({ endpoint: result.endpoint || `call_${index}`, data: result.data });
    } else {
      failures.push({ endpoint: result.endpoint || `call_${index}`, error: result.error });
    }
  });
  
  return { successes, failures };
}

/**
 * Verifica se há falhas críticas (ex: todas falharam)
 * @param {Array} failures 
 * @param {number} totalCalls 
 * @returns {boolean}
 */
export function hasCriticalFailure(failures, totalCalls) {
  return failures.length === totalCalls && totalCalls > 0;
}