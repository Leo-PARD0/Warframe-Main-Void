/**
 * FarmProgressService
 * 
 * Responsável por determinar o próximo objetivo de farm baseado na Farm Ativa.
 * Centraliza toda a lógica de decisão do próximo item a ser farmado.
 */

import { loadRoadmaps, loadNodes, loadConnections, loadCompletedComponents } from '@/lib/roadmapStorage';

/**
 * Encontra a Farm Ativa (roadmap com active: true)
 */
function getActiveFarm() {
  const roadmaps = loadRoadmaps();
  return roadmaps.find(r => r.active === true) || null;
}

/**
 * Ordena os nós topologicamente baseado nas conexões (edges)
 * Retorna os nós na ordem de execução (dependências primeiro)
 */
function getTopologicalOrder(nodes, edges) {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const adjacency = new Map();
  const inDegree = new Map();
  
  // Inicializar
  nodes.forEach(n => {
    adjacency.set(n.id, []);
    inDegree.set(n.id, 0);
  });
  
  // Construir grafo
  edges.forEach(e => {
    if (nodeMap.has(e.from) && nodeMap.has(e.to)) {
      adjacency.get(e.from).push(e.to);
      inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1);
    }
  });
  
  // Kahn's algorithm
  const queue = [];
  nodes.forEach(n => {
    if (inDegree.get(n.id) === 0) queue.push(n.id);
  });
  
  const result = [];
  while (queue.length > 0) {
    const currentId = queue.shift();
    result.push(nodeMap.get(currentId));
    
    adjacency.get(currentId).forEach(neighborId => {
      const newDegree = inDegree.get(neighborId) - 1;
      inDegree.set(neighborId, newDegree);
      if (newDegree === 0) queue.push(neighborId);
    });
  }
  
  // Se houver ciclos, adicionar nós restantes
  if (result.length < nodes.length) {
    nodes.forEach(n => {
      if (!result.find(r => r.id === n.id)) result.push(n);
    });
  }
  
  return result;
}

/**
 * Verifica se um item (ou componente) está completo
 */
function isItemCompleted(node, completedComponents) {
  if (node.completed) return true;
  
  // Para itens compostos, verificar se todos os componentes estão completos
  const nodeCompletedComponents = completedComponents[node.id] || [];
  // Nota: a verificação real dos componentes é feita no nível do item (item.isComposite)
  // Aqui apenas verificamos se o nó foi marcado como completo manualmente
  
  return false;
}

/**
 * Obtém o progresso de um item composto
 */
function getItemProgress(item, completedComponents) {
  if (!item.isComposite || !item.craftParts?.length) {
    return { completed: 0, total: 0, percentage: 0 };
  }
  
  const nodeCompletedComponents = completedComponents || [];
  const completed = item.craftParts.filter(c => 
    nodeCompletedComponents.has ? nodeCompletedComponents.has(c.id) : nodeCompletedComponents.includes(c.id)
  ).length;
  const total = item.craftParts.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { completed, total, percentage };
}

/**
 * Encontra o primeiro componente pendente de um item composto
 */
function findFirstPendingComponent(item, completedComponents) {
  if (!item.isComposite || !item.craftParts?.length) return null;
  
  const nodeCompletedComponents = completedComponents || [];
  
  for (const component of item.craftParts) {
    const isCompleted = nodeCompletedComponents.has 
      ? nodeCompletedComponents.has(component.id) 
      : nodeCompletedComponents.includes(component.id);
    
    if (!isCompleted) {
      return component;
    }
  }
  
  return null;
}

/**
 * Obtém os locais de farm para um item/componente
 */
function getFarmLocations(item) {
  if (!item) return [];
  
  const locations = [];
  
  // Se o item tem drops diretos
  if (item.drops && item.drops.length > 0) {
    item.drops.forEach(drop => {
      locations.push({
        place: drop.place,
        rotation: drop.rotation,
        chance: drop.chance,
        rarity: drop.rarity,
        source: 'direct'
      });
    });
  }
  
  // Se é um componente de craft, verificar drops do componente
  if (item.craftParts) {
    item.craftParts.forEach(component => {
      if (component.drops && component.drops.length > 0) {
        component.drops.forEach(drop => {
          locations.push({
            place: drop.place,
            rotation: drop.rotation,
            chance: drop.chance,
            rarity: drop.rarity,
            source: 'component',
            componentName: component.name
          });
        });
      }
    });
  }
  
  return locations;
}

/**
 * Função principal: determina o próximo alvo de farm
 * 
 * @param {Object} activeFarm - O roadmap ativo (opcional, busca automaticamente se não fornecido)
 * @returns {Object|null} FarmTarget ou null se não houver farm ativo ou tudo completo
 */
export function getNextFarmTarget(activeFarm = null) {
  const farm = activeFarm || getActiveFarm();
  
  if (!farm) {
    return null;
  }
  
  const roadmapId = farm.id;
  const nodes = loadNodes(roadmapId);
  const edges = loadConnections(roadmapId);
  const completedComponents = loadCompletedComponents(roadmapId);
  
  if (nodes.length === 0) {
    return null;
  }
  
  // Ordenar topologicamente
  const orderedNodes = getTopologicalOrder(nodes, edges);
  
  // Encontrar o primeiro nó incompleto
  for (const node of orderedNodes) {
    // Buscar detalhes do item (precisa vir do catálogo ou cache)
    // Por enquanto, usamos os dados básicos do nó
    // O item completo deve ser passado ou buscado externamente
    
    // Verificar se o nó está completo
    if (node.completed) continue;
    
    // Para itens compostos, verificar componentes
    // Nota: precisamos do item completo com craftParts
    // Isso será resolvido pelo consumidor passando o itemMap
    
    return {
      node,
      roadmapId,
      completedComponents: completedComponents[node.id] || []
    };
  }
  
  return null;
}

/**
 * Versão completa que recebe o itemMap e retorna o FarmTarget completo
 * 
 * @param {Object} activeFarm - Farm ativa
 * @param {Map} itemMap - Mapa de itens (id -> item completo)
 * @returns {Object|null} FarmTarget completo
 */
export function getNextFarmTargetWithDetails(activeFarm, itemMap) {
  const farm = activeFarm || getActiveFarm();
  
  if (!farm) {
    return null;
  }
  
  const roadmapId = farm.id;
  const nodes = loadNodes(roadmapId);
  const edges = loadConnections(roadmapId);
  const completedComponents = loadCompletedComponents(roadmapId);
  
  if (nodes.length === 0) {
    return null;
  }
  
  // Ordenar topologicamente
  const orderedNodes = getTopologicalOrder(nodes, edges);
  
  // Encontrar o primeiro nó incompleto
  for (const node of orderedNodes) {
    const item = itemMap.get(node.itemId);
    
    if (!item) {
      // Item não encontrado no catálogo, mas nó não está completo
      return {
        item: { id: node.itemId, name: 'Item desconhecido', displayCategory: 'Unknown' },
        parentItem: null,
        isComponent: false,
        node,
        progress: { completed: 0, total: 0, percentage: 0 },
        locations: [],
        roadmapId,
        farmName: farm.name
      };
    }
    
    // Se o nó está marcado como completo, pular
    if (node.completed) continue;
    
    const nodeCompletedComponents = completedComponents[node.id] || [];
    
    // Se é item composto, verificar componentes pendentes
    if (item.isComposite && item.craftParts?.length > 0) {
      const pendingComponent = findFirstPendingComponent(item, nodeCompletedComponents);
      
      if (pendingComponent) {
        // Retornar o componente pendente
        const progress = getItemProgress(item, nodeCompletedComponents);
        const locations = getFarmLocations(pendingComponent);
        
        return {
          item: pendingComponent,
          parentItem: item,
          isComponent: true,
          node,
          progress,
          locations,
          roadmapId,
          farmName: farm.name
        };
      } else {
        // Todos os componentes estão completos, mas o nó não está marcado
        // Retornar o item principal para o usuário marcar como completo
        const progress = getItemProgress(item, nodeCompletedComponents);
        const locations = getFarmLocations(item);
        
        return {
          item,
          parentItem: null,
          isComponent: false,
          node,
          progress,
          locations,
          roadmapId,
          farmName: farm.name
        };
      }
    }
    
    // Item simples (não composto)
    const progress = { completed: 0, total: 1, percentage: 0 };
    const locations = getFarmLocations(item);
    
    return {
      item,
      parentItem: null,
      isComponent: false,
      node,
      progress,
      locations,
      roadmapId,
      farmName: farm.name
    };
  }
  
  // Todos os nós estão completos
  return {
    completed: true,
    farmName: farm.name,
    roadmapId
  };
}

/**
 * Obtém todos os alvos de farm pendentes (para exibição de lista)
 */
export function getAllPendingFarmTargets(activeFarm, itemMap) {
  const farm = activeFarm || getActiveFarm();
  
  if (!farm) return [];
  
  const roadmapId = farm.id;
  const nodes = loadNodes(roadmapId);
  const edges = loadConnections(roadmapId);
  const completedComponents = loadCompletedComponents(roadmapId);
  
  if (nodes.length === 0) return [];
  
  const orderedNodes = getTopologicalOrder(nodes, edges);
  const targets = [];
  
  for (const node of orderedNodes) {
    const item = itemMap.get(node.itemId);
    if (!item) continue;
    
    if (node.completed) continue;
    
    const nodeCompletedComponents = completedComponents[node.id] || [];
    
    if (item.isComposite && item.craftParts?.length > 0) {
      const pendingComponent = findFirstPendingComponent(item, nodeCompletedComponents);
      
      if (pendingComponent) {
        const progress = getItemProgress(item, nodeCompletedComponents);
        const locations = getFarmLocations(pendingComponent);
        
        targets.push({
          item: pendingComponent,
          parentItem: item,
          isComponent: true,
          node,
          progress,
          locations,
          roadmapId,
          farmName: farm.name
        });
      } else {
        const progress = getItemProgress(item, nodeCompletedComponents);
        const locations = getFarmLocations(item);
        
        targets.push({
          item,
          parentItem: null,
          isComponent: false,
          node,
          progress,
          locations,
          roadmapId,
          farmName: farm.name
        });
      }
    } else {
      const progress = { completed: 0, total: 1, percentage: 0 };
      const locations = getFarmLocations(item);
      
      targets.push({
        item,
        parentItem: null,
        isComponent: false,
        node,
        progress,
        locations,
        roadmapId,
        farmName: farm.name
      });
    }
  }
  
  return targets;
}

export const FarmProgressService = {
  getNextFarmTarget,
  getNextFarmTargetWithDetails,
  getAllPendingFarmTargets,
  getActiveFarm,
  getTopologicalOrder,
  getItemProgress,
  findFirstPendingComponent,
  getFarmLocations
};

export default FarmProgressService;