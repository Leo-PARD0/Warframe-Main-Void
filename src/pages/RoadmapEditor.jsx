import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Eye, Edit3, ZoomIn, ZoomOut, Move,
  Star, Palette, RefreshCcw,
} from 'lucide-react';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import CanvasNode from '@/components/roadmap/CanvasNode';
import CanvasEdges from '@/components/roadmap/CanvasEdges';
import CanvasToolbar from '@/components/roadmap/CanvasToolbar';
import AssetPickerModal from '@/components/roadmap/AssetPickerModal';
import { useWarframeItems } from '@/hooks/useWarframeItems';
import { useSemanticProfiles } from '@/hooks/useSemanticProfiles';

const ZOOM_MIN = 0.2;
const ZOOM_MAX = 2.5;
const SNAP = 20;

const BG_PRESETS = [
  '#0e0f14', '#0f1117', '#0d1117', '#0a0f0a',
  '#100d14', '#0d0d0d', '#111827', '#0c1a2e',
];

// Connect tools that handle edges
const CONNECT_TOOLS = ['connect-forward', 'connect-down', 'connect-up'];

function snap(v) { return Math.round(v / SNAP) * SNAP; }

export default function RoadmapEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    roadmaps, updateRoadmap, toggleFavorite,
    getRoadmapData, addNode, moveNode, deleteNode, toggleNodeCompletion, addEdge, deleteEdge,
    updateCompletedComponents,
  } = useRoadmaps();

  const rm = roadmaps.find((r) => r.id === id);

  const roadmapData = getRoadmapData(id);
  const [nodes, setNodes] = useState(() => roadmapData.nodes);
  const [edges, setEdges] = useState(() => roadmapData.edges);
  const [zoom, setZoom] = useState(() => rm?.zoom ?? 1);
  const [pan, setPan] = useState(() => ({ x: rm?.panX ?? 60, y: rm?.panY ?? 60 }));

  const [mode, setMode] = useState(() => location.state?.mode === 'edit' ? 'edit' : 'view');
  const [activeTool, setActiveTool] = useState('connect-forward'); // default tool
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [completedComponents, setCompletedComponents] = useState(() => roadmapData.completedComponents || {}); // nodeId -> Set of component IDs
  
  // Derive activeFarmNodeId from roadmap in context (single source of truth)
  const activeFarmNodeId = rm?.activeFarmNodeId || null;

  // Ref for last inserted node id (for auto-connect)
  const lastNodeId = useRef(null);
  // Ref for manual connect drag
  const connectDragFrom = useRef(null);

  const canvasRef = useRef(null);
  const dragging = useRef(null);
  const panning = useRef(null);
  const spaceDown = useRef(false);

  const { items } = useWarframeItems();
  const { getRole } = useSemanticProfiles();
  const itemMap = useMemo(() => Object.fromEntries(items.map((it) => [it.id, it])), [items]);
  
  // Helper to get role for an item (only for Warframes)
  const getItemRole = useCallback((item) => {
    if (item?.displayCategory !== 'Warframe') return null;
    return getRole(item.name);
  }, [getRole]);

  // Auto-save canvas meta
  useEffect(() => {
    if (!rm) return;
    const t = setTimeout(() => updateRoadmap(id, { zoom, panX: pan.x, panY: pan.y }), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, pan]);

  // Space key for temp pan
  useEffect(() => {
    const kd = (e) => { if (e.code === 'Space') { e.preventDefault(); spaceDown.current = true; } };
    const ku = (e) => { if (e.code === 'Space') spaceDown.current = false; };
    const esc = (e) => { if (e.code === 'Escape') connectDragFrom.current = null; };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      window.removeEventListener('keydown', esc);
    };
  }, []);

  // ── Zoom ──────────────────────────────────────────────────────────────────
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setZoom((z) => {
      const nz = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z * factor));
      setPan((p) => ({
        x: mx - (mx - p.x) * (nz / z),
        y: my - (my - p.y) * (nz / z),
      }));
      return nz;
    });
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // ── Canvas mouse events ───────────────────────────────────────────────────
  const handleCanvasMouseDown = useCallback((e) => {
    if (e.button === 1 || (e.button === 0 && spaceDown.current)) {
      e.preventDefault();
      panning.current = { startX: e.clientX, startY: e.clientY, origPan: { ...pan } };
      return;
    }
    if (e.button === 0) {
      setSelectedNodeId(null);
      connectDragFrom.current = null;
    }
  }, [pan]);

  const handleCanvasMouseMove = useCallback((e) => {
    if (panning.current) {
      const dx = e.clientX - panning.current.startX;
      const dy = e.clientY - panning.current.startY;
      setPan({ x: panning.current.origPan.x + dx, y: panning.current.origPan.y + dy });
      return;
    }
    if (dragging.current) {
      const dx = (e.clientX - dragging.current.startX) / zoom;
      const dy = (e.clientY - dragging.current.startY) / zoom;
      const nx = snap(dragging.current.origX + dx);
      const ny = snap(dragging.current.origY + dy);
      setNodes((prev) => prev.map((n) => n.id === dragging.current.nodeId ? { ...n, x: nx, y: ny } : n));
    }
  }, [zoom]);

  const handleCanvasMouseUp = useCallback((e) => {
    if (panning.current) { panning.current = null; return; }
    if (dragging.current) {
      const { nodeId } = dragging.current;
      const node = nodes.find((n) => n.id === nodeId);
      if (node) moveNode(id, nodeId, node.x, node.y);
      dragging.current = null;
    }
  }, [id, nodes, moveNode]);

  // ── Node interactions ─────────────────────────────────────────────────────
  const handleNodeMouseDown = useCallback((e, nodeId) => {
    if (mode !== 'edit') return;
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    dragging.current = { nodeId, startX: e.clientX, startY: e.clientY, origX: node.x, origY: node.y };
  }, [mode, nodes]);

  const handleConnectStart = useCallback((nodeId) => {
    connectDragFrom.current = nodeId;
  }, []);

  const handleConnectEnd = useCallback((nodeId) => {
    const from = connectDragFrom.current;
    if (from && nodeId !== from) {
      addEdge(id, from, nodeId);
      setEdges((prev) => {
        const exists = prev.some((e) => e.from === from && e.to === nodeId);
        if (exists) return prev;
        return [...prev, { id: 'e_' + Date.now(), from, to: nodeId, type: 'dependency' }];
      });
    }
    connectDragFrom.current = null;
  }, [addEdge, id]);

  const handleDeleteEdge = useCallback((edgeId) => {
    deleteEdge(id, edgeId);
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
  }, [deleteEdge, id]);

  const handleDeleteNode = useCallback((nodeId) => {
    deleteNode(id, nodeId);
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.from !== nodeId && e.to !== nodeId));
    if (lastNodeId.current === nodeId) lastNodeId.current = null;
  }, [deleteNode, id]);  const handleToggleNodeCompletion = useCallback((nodeId) => {
    toggleNodeCompletion(id, nodeId);
    setNodes((previous) => previous.map((node) => node.id === nodeId ? { ...node, completed: !node.completed } : node));
  }, [id, toggleNodeCompletion]);

  const handleNodeClick = useCallback((nodeId) => {
    if (mode === 'view') {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) navigate(`/item/${encodeURIComponent(node.itemId)}`, { state: { from: location.pathname, roadmapId: id } });
    }
  }, [mode, nodes, navigate]);

  // ── Tool change ───────────────────────────────────────────────────────────
  const handleToolChange = useCallback((tool) => {
    if (tool === 'add') {
      setShowAssetPicker(true);
    } else {
      setActiveTool(tool);
    }
  }, []);

  // ── Add item from Asset Picker ────────────────────────────────────────────
  const handleAddItem = useCallback((item) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const cx = rect ? (rect.width / 2 - pan.x) / zoom : 200;
    const cy = rect ? (rect.height / 2 - pan.y) / zoom : 200;

    // Determine position relative to last node
    let x, y;
    const prevNode = nodes.find(n => n.id === lastNodeId.current);
    if (prevNode && CONNECT_TOOLS.includes(activeTool)) {
      if (activeTool === 'connect-forward') {
        x = snap(prevNode.x + 180);
        y = snap(prevNode.y);
      } else if (activeTool === 'connect-down') {
        x = snap(prevNode.x);
        y = snap(prevNode.y + 200);
      } else {
        // connect-up
        x = snap(prevNode.x);
        y = snap(prevNode.y - 200);
      }
    } else {
      x = snap(cx + (Math.random() - 0.5) * 100);
      y = snap(cy + (Math.random() - 0.5) * 80);
    }

    const node = addNode(id, item, x, y);

    // Auto-connect to previous node
    const prevId = lastNodeId.current;
    if (CONNECT_TOOLS.includes(activeTool) && prevId) {
      const edge = addEdge(id, prevId, node.id);
      setEdges((prevEdges) => {
        const exists = prevEdges.some(e => e.from === prevId && e.to === node.id);
        if (exists) return prevEdges;
        return edge ? [...prevEdges, edge] : prevEdges;
      });
    }

    lastNodeId.current = node.id;
    setNodes((prev) => [...prev, node]);
  }, [addNode, addEdge, id, pan, zoom, nodes, activeTool]);

  // ── Early return after all hooks ──────────────────────────────────────────
  if (!rm) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Roadmap não encontrado.{' '}
        <Link to="/roadmaps" className="text-primary hover:underline ml-2">Voltar</Link>
      </div>
    );
  }

  const isConnectTool = mode === 'edit' && CONNECT_TOOLS.includes(activeTool);

  const gridStyle = {
    backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)`,
    backgroundSize: `${SNAP * zoom}px ${SNAP * zoom}px`,
    backgroundPosition: `${pan.x % (SNAP * zoom)}px ${pan.y % (SNAP * zoom)}px`,
  };

  const canvasStyle = {
    background: rm.bgColor,
    cursor: panning.current ? 'grabbing' : spaceDown.current ? 'grab' : isConnectTool ? 'crosshair' : 'default',
  };

  return (
    <div className="h-[calc(100vh-52px)] flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-background/80 backdrop-blur z-30">
        <Link to="/roadmaps" className="text-muted-foreground hover:text-foreground mr-1">
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <span className="text-sm font-semibold truncate max-w-[200px]">{rm.name}</span>

        <button
          onClick={() => toggleFavorite(id)}
          className={`p-1.5 rounded hover:bg-accent transition-colors ${rm.favorite ? 'text-amber-400' : 'text-muted-foreground'}`}
        >
          <Star className="h-4 w-4" fill={rm.favorite ? 'currentColor' : 'none'} />
        </button>

        <div className="flex-1" />

        {/* Mode toggle */}
        <div className="flex items-center bg-muted rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => setMode('edit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === 'edit' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Edit3 className="h-3 w-3" /> Editar
          </button>
          <button
            onClick={() => setMode('view')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === 'view' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye className="h-3 w-3" /> Visualizar
          </button>
        </div>

        {/* Bg picker */}
        {mode === 'edit' && (
          <div className="relative">
            <button
              onClick={() => setShowBgPicker((v) => !v)}
              className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Cor de fundo"
            >
              <Palette className="h-4 w-4" />
            </button>
            {showBgPicker && (
              <div className="absolute right-0 top-full mt-1 p-2 bg-popover border border-border rounded-lg shadow-xl z-50 flex gap-1 flex-wrap w-44">
                {BG_PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { updateRoadmap(id, { bgColor: c }); setShowBgPicker(false); }}
                    className="h-7 w-7 rounded border-2 transition-transform hover:scale-110"
                    style={{ background: c, borderColor: rm.bgColor === c ? '#f59e0b' : 'transparent' }}
                  />
                ))}
                <label className="cursor-pointer h-7 w-7 rounded border border-border/60 flex items-center justify-center hover:bg-accent" title="Personalizado">
                  <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                  <input type="color" className="sr-only" defaultValue={rm.bgColor}
                    onChange={(e) => updateRoadmap(id, { bgColor: e.target.value })} />
                </label>
              </div>
            )}
          </div>
        )}

        {/* Zoom controls */}
        <div className="flex items-center gap-1 ml-1">
          <button onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z / 1.2))}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground">
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs text-muted-foreground w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z * 1.2))}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button onClick={() => { setZoom(1); setPan({ x: 60, y: 60 }); }}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground" title="Resetar view">
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left toolbar */}
        {mode === 'edit' && (
          <CanvasToolbar activeTool={activeTool} onToolChange={handleToolChange} />
        )}

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden"
          style={{ ...canvasStyle, ...gridStyle }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
        >
          {/* Connect mode hint */}
          {isConnectTool && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none bg-background/90 border border-border/60 text-muted-foreground text-xs px-3 py-1.5 rounded-full shadow-lg backdrop-blur">
              {activeTool === 'connect-forward' ? '→ Arraste entre cards para conectar · Adicionar item cria sequência automática' :
               activeTool === 'connect-down' ? '↓ Arraste entre cards para conectar · Adicionar item empilha abaixo' :
               '↑ Arraste entre cards para conectar · Adicionar item empilha acima'}
            </div>
          )}

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-3 pointer-events-none">
              <Move className="h-10 w-10 opacity-20" />
              <p className="text-sm opacity-50">Canvas vazio · use o botão <strong>+</strong> na barra lateral para inserir itens</p>
            </div>
          )}

          {/* Edges */}
          <CanvasEdges
            edges={edges}
            nodes={nodes}
            zoom={zoom}
            pan={pan}
            onDelete={handleDeleteEdge}
            readOnly={mode === 'view'}
          />

          {/* Nodes */}
          {nodes.map((node) => {
            const item = itemMap[node.itemId];
            const role = item?.displayCategory === 'Warframe' ? getItemRole(item) : null;
            return (
              <CanvasNode
                key={node.id}
                node={node}
                item={item}
                selected={selectedNodeId === node.id}
                isConnectTool={isConnectTool}
                canMarkComplete={mode === 'view'}
                onMouseDown={handleNodeMouseDown}
                onDelete={handleDeleteNode}
                onToggleComplete={handleToggleNodeCompletion}
                onConnectStart={handleConnectStart}
                onConnectEnd={handleConnectEnd}
                zoom={zoom}
                pan={pan}
                onClick={handleNodeClick}
                completedComponents={completedComponents[node.id] || []}
                onComponentToggle={(componentId, checked) => {
                  setCompletedComponents(prev => {
                    const nodeComponents = new Set(prev[node.id] || []);
                    if (checked) {
                      nodeComponents.add(componentId);
                    } else {
                      nodeComponents.delete(componentId);
                    }
                    const next = { ...prev, [node.id]: nodeComponents };
                    // Persist to storage
                    updateCompletedComponents(id, node.id, nodeComponents);
                    return next;
                  });
                }}
                role={role}
                isActiveFarm={activeFarmNodeId === node.id}
                onSetActiveFarm={(nodeId) => {
                  updateRoadmap(id, { activeFarmNodeId: activeFarmNodeId === nodeId ? null : nodeId });
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom status */}
      <div className="flex-shrink-0 px-4 py-1.5 border-t border-border/30 bg-background/60 flex items-center gap-4 text-xs text-muted-foreground">
        <span>{nodes.length} nó{nodes.length !== 1 ? 's' : ''}</span>
        <span>{edges.length} conexõe{edges.length !== 1 ? 's' : ''}</span>
        <span className="ml-auto">
          {mode === 'edit'
            ? activeTool === 'select' ? '🖱 Selecionar · arraste para mover'
            : activeTool === 'connect-forward' ? '→ Conectar em sequência'
            : activeTool === 'connect-down' ? '↓ Conectar para baixo'
            : activeTool === 'connect-up' ? '↑ Conectar para cima'
            : ''
            : '👁 Modo visualização · clique no card para detalhes'}
        </span>
      </div>

      {/* Asset Picker Modal */}
      {showAssetPicker && (
        <AssetPickerModal
          onSelect={handleAddItem}
          onClose={() => setShowAssetPicker(false)}
        />
      )}
    </div>
  );
}