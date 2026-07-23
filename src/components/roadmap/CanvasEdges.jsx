import { Trash2 } from 'lucide-react';

const NODE_W = 140;
const NODE_H = 160;

function getCenter(node, zoom, pan) {
  return {
    x: node.x * zoom + pan.x + (NODE_W * zoom) / 2,
    y: node.y * zoom + pan.y + (NODE_H * zoom) / 2,
  };
}

function Arrow({ x1, y1, x2, y2, id, onDelete, readOnly }) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  // Arrow head angle
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  // Shorten end to not overlap node
  const shorten = Math.min(20, len / 3);
  const ratio = shorten / (len || 1);
  const ex = x2 - (x2 - x1) * ratio;
  const ey = y2 - (y2 - y1) * ratio;

  return (
    <g>
      <defs>
        <marker id={`arr-${id}`} markerWidth="8" markerHeight="8" refX="4" refY="2.5" orient="auto">
          <polygon points="0 0, 5 2.5, 0 5" fill="#f59e0b" fillOpacity="0.7" />
        </marker>
      </defs>
      <line
        x1={x1} y1={y1} x2={ex} y2={ey}
        stroke="#f59e0b" strokeOpacity={0.4} strokeWidth={1.5}
        strokeDasharray="4 3"
        markerEnd={`url(#arr-${id})`}
      />
      {!readOnly && (
        <foreignObject x={mx - 10} y={my - 10} width={20} height={20} style={{ overflow: 'visible' }}>
          <button
            onClick={() => onDelete(id)}
            className="h-5 w-5 rounded-full bg-background border border-border/60 flex items-center justify-center hover:bg-destructive/20 hover:border-destructive opacity-0 hover:opacity-100 transition-opacity"
            title="Remover conexão"
          >
            <Trash2 className="h-2.5 w-2.5 text-muted-foreground" />
          </button>
        </foreignObject>
      )}
    </g>
  );
}

export default function CanvasEdges({ edges, nodes, zoom, pan, onDelete, readOnly }) {
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}
    >
      {edges.map((e) => {
        const from = nodeMap[e.from];
        const to = nodeMap[e.to];
        if (!from || !to) return null;
        const p1 = getCenter(from, zoom, pan);
        const p2 = getCenter(to, zoom, pan);
        return (
          <g key={e.id} style={{ pointerEvents: 'all' }}>
            <Arrow x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} id={e.id} onDelete={onDelete} readOnly={readOnly} />
          </g>
        );
      })}
    </svg>
  );
}