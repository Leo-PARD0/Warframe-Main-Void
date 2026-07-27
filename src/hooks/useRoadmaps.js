import { useState, useCallback } from 'react';
import {
  loadRoadmaps, saveRoadmaps, createRoadmap,
  loadNodes, saveNodes, createNode,
  loadConnections, saveConnections, createConnection,
  loadItemNotes, saveItemNotes,
  loadCompletedComponents, saveCompletedComponents,
} from '@/lib/roadmapStorage';
import { WarframeRepository } from '@/services/warframe';
import { useApiLanguage } from '@/lib/ApiLanguageContext';

const EXPORT_FORMAT = 'warframe-roadmap';
const EXPORT_VERSION = 1;


function isRecord(value) { return value && typeof value === 'object' && !Array.isArray(value); }
function validNodes(nodes) { return Array.isArray(nodes) && nodes.every((node) => isRecord(node) && typeof node.id === 'string' && typeof node.itemId === 'string' && Number.isFinite(node.x) && Number.isFinite(node.y)); }
function validEdges(edges) { return Array.isArray(edges) && edges.every((edge) => isRecord(edge) && typeof edge.from === 'string' && typeof edge.to === 'string'); }

export function useRoadmaps() {
  const { language } = useApiLanguage();

  const [roadmaps, setRoadmaps] = useState(() => loadRoadmaps());
  const [itemNotes, setItemNotes] = useState(() => loadItemNotes());
  const persist = useCallback((list) => { setRoadmaps(list); saveRoadmaps(list); }, []);

  const addRoadmap = useCallback((opts) => {
    const roadmap = createRoadmap(opts);
    persist([...loadRoadmaps(), roadmap]);
    return roadmap;
  }, [persist]);

  const updateRoadmap = useCallback((id, patch) => {
    persist(loadRoadmaps().map((roadmap) => roadmap.id === id ? { ...roadmap, ...patch, updatedAt: Date.now() } : roadmap));
  }, [persist]);

  const deleteRoadmap = useCallback((id) => persist(loadRoadmaps().filter((roadmap) => roadmap.id !== id)), [persist]);
  const toggleFavorite = useCallback((id) => updateRoadmap(id, { favorite: !loadRoadmaps().find((roadmap) => roadmap.id === id)?.favorite }), [updateRoadmap]);
  const getRoadmapData = useCallback((id) => {
    const roadmaps = loadRoadmaps();
    const roadmap = roadmaps.find(r => r.id === id);
    return { 
      nodes: loadNodes(id), 
      edges: loadConnections(id),
      completedComponents: loadCompletedComponents(id),
      activeFarmNodeId: roadmap?.activeFarmNodeId || null
    };
  }, []);

  const addNode = useCallback((roadmapId, item, x, y) => {
    const node = createNode({ itemId: item.id, x, y });
    saveNodes(roadmapId, [...loadNodes(roadmapId), node]);
    updateRoadmap(roadmapId, {});
    WarframeRepository.getItem(item, language, { roadmapId }).catch(() => {});
    return node;
  }, [language, updateRoadmap]);
  const moveNode = useCallback((roadmapId, nodeId, x, y) => saveNodes(roadmapId, loadNodes(roadmapId).map((node) => node.id === nodeId ? { ...node, x, y } : node)), []);
  const deleteNode = useCallback((roadmapId, nodeId) => {
    saveNodes(roadmapId, loadNodes(roadmapId).filter((node) => node.id !== nodeId));
    saveConnections(roadmapId, loadConnections(roadmapId).filter((edge) => edge.from !== nodeId && edge.to !== nodeId));
    // Also clean up completed components for this node
    const completedComponents = loadCompletedComponents(roadmapId);
    if (completedComponents[nodeId]) {
      delete completedComponents[nodeId];
      saveCompletedComponents(roadmapId, completedComponents);
    }
    updateRoadmap(roadmapId, {});
  }, [updateRoadmap]);
  const toggleNodeCompletion = useCallback((roadmapId, nodeId) => {
    saveNodes(roadmapId, loadNodes(roadmapId).map((node) => node.id === nodeId ? { ...node, completed: !node.completed } : node));
    updateRoadmap(roadmapId, {});
  }, [updateRoadmap]);
  const addEdge = useCallback((roadmapId, from, to) => {
    const edges = loadConnections(roadmapId);
    const duplicate = edges.find((edge) => edge.from === from && edge.to === to);
    if (duplicate) return duplicate;
    const edge = createConnection({ from, to });
    saveConnections(roadmapId, [...edges, edge]);
    updateRoadmap(roadmapId, {});
    return edge;
  }, [updateRoadmap]);
  const deleteEdge = useCallback((roadmapId, edgeId) => { saveConnections(roadmapId, loadConnections(roadmapId).filter((edge) => edge.id !== edgeId)); updateRoadmap(roadmapId, {}); }, [updateRoadmap]);
  const updateItemNote = useCallback((itemId, patch) => setItemNotes((previous) => { const next = { ...previous, [itemId]: { ...(previous[itemId] || {}), ...patch } }; saveItemNotes(next); return next; }), []);
  
  const updateCompletedComponents = useCallback((roadmapId, itemId, componentIds) => {
    const completedComponents = loadCompletedComponents(roadmapId);
    const updated = { ...completedComponents, [itemId]: componentIds };
    saveCompletedComponents(roadmapId, updated);
    updateRoadmap(roadmapId, {});
  }, [updateRoadmap]);

  const exportRoadmap = useCallback((roadmapId) => {
    const roadmap = loadRoadmaps().find((entry) => entry.id === roadmapId);
    if (!roadmap) throw new Error('Roadmap não encontrado.');
    const nodes = loadNodes(roadmapId);
    const itemIds = new Set(nodes.map((node) => node.itemId));
    const snapshot = WarframeRepository.getRoadmapSnapshot(roadmapId);
    const assets = Object.values(snapshot.items).filter((item) => itemIds.has(item.id));
    const notes = loadItemNotes();
    const sharedNotes = Object.fromEntries(Object.entries(notes).filter(([itemId]) => itemIds.has(itemId)));
    return { format: EXPORT_FORMAT, version: EXPORT_VERSION, exportedAt: new Date().toISOString(), snapshot, roadmap: { name: roadmap.name, description: roadmap.description || '', bgColor: roadmap.bgColor, zoom: roadmap.zoom, panX: roadmap.panX, panY: roadmap.panY }, nodes, edges: loadConnections(roadmapId), assets, itemNotes: sharedNotes };
  }, []);

  const exportRoadmapOffline = useCallback(async (roadmapId) => {
    const roadmap = loadRoadmaps().find((entry) => entry.id === roadmapId);
    if (!roadmap) throw new Error('Roadmap não encontrado.');
    const nodes = loadNodes(roadmapId);
    const itemIds = new Set(nodes.map((node) => node.itemId));
    const snapshot = WarframeRepository.getRoadmapSnapshot(roadmapId);
    
    // Buscar itens que não estão no snapshot (detalhes não visualizados)
    const itemsToFetch = [...itemIds].filter((itemId) => !snapshot.items[itemId]);
    const fetchedItems = [];
    
    // Buscar detalhes dos itens que não estão em cache
    for (const itemId of itemsToFetch) {
      try {
        const item = await WarframeRepository.getItemById(itemId, language);
        if (item) {
          fetchedItems.push(item);
          // Adicionar ao snapshot
          snapshot.items[itemId] = item;
        }
      } catch {
        // Ignorar itens que não conseguir carregar
      }
    }
    
    // Atualizar o snapshot com os novos itens
    WarframeRepository.setRoadmapSnapshot(roadmapId, snapshot);
    
    const assets = Object.values(snapshot.items).filter((item) => itemIds.has(item.id));
    const notes = loadItemNotes();
    const sharedNotes = Object.fromEntries(Object.entries(notes).filter(([itemId]) => itemIds.has(itemId)));
    
    return { format: EXPORT_FORMAT, version: EXPORT_VERSION, exportedAt: new Date().toISOString(), offline: true, snapshot, roadmap: { name: roadmap.name, description: roadmap.description || '', bgColor: roadmap.bgColor, zoom: roadmap.zoom, panX: roadmap.panX, panY: roadmap.panY }, nodes, edges: loadConnections(roadmapId), assets, itemNotes: sharedNotes };
  }, [language]);

  const importRoadmap = useCallback((payload) => {
    if (!isRecord(payload) || payload.format !== EXPORT_FORMAT || payload.version !== EXPORT_VERSION || !isRecord(payload.roadmap) || !validNodes(payload.nodes) || !validEdges(payload.edges)) throw new Error('Arquivo de roadmap inválido ou incompatível.');
    const imported = payload.roadmap;
    if (typeof imported.name !== 'string' || !imported.name.trim()) throw new Error('O arquivo não possui um nome de roadmap válido.');

    const roadmap = createRoadmap({ name: imported.name.trim(), description: typeof imported.description === 'string' ? imported.description : '' });
    roadmap.bgColor = typeof imported.bgColor === 'string' ? imported.bgColor : roadmap.bgColor;
    roadmap.zoom = Number.isFinite(imported.zoom) ? imported.zoom : roadmap.zoom;
    roadmap.panX = Number.isFinite(imported.panX) ? imported.panX : roadmap.panX;
    roadmap.panY = Number.isFinite(imported.panY) ? imported.panY : roadmap.panY;
    const nodeIds = new Map();
    const nodes = payload.nodes.map((node) => { const copy = createNode({ itemId: node.itemId, x: node.x, y: node.y, completed: Boolean(node.completed) }); nodeIds.set(node.id, copy.id); return copy; });
    const edges = payload.edges.flatMap((edge) => { const from = nodeIds.get(edge.from); const to = nodeIds.get(edge.to); return from && to && from !== to ? [createConnection({ from, to, type: typeof edge.type === 'string' ? edge.type : 'dependency' })] : []; });
    persist([...loadRoadmaps(), roadmap]);
    saveNodes(roadmap.id, nodes);
    saveConnections(roadmap.id, edges);

    if (Array.isArray(payload.assets)) {
      WarframeRepository.importRoadmapSnapshot(roadmap.id, { version: 1, updatedAt: Date.now(), items: Object.fromEntries(payload.assets.filter((item) => isRecord(item) && typeof item.id === 'string').map((item) => [item.id, item])) });
    }
    if (isRecord(payload.itemNotes)) setItemNotes((previous) => { const next = { ...previous, ...payload.itemNotes }; saveItemNotes(next); return next; });
    return roadmap;
  }, [persist]);

  return { roadmaps, itemNotes, addRoadmap, updateRoadmap, deleteRoadmap, toggleFavorite, getRoadmapData, addNode, moveNode, deleteNode, toggleNodeCompletion, addEdge, deleteEdge, updateItemNote, updateCompletedComponents, exportRoadmap, exportRoadmapOffline, importRoadmap };
}
