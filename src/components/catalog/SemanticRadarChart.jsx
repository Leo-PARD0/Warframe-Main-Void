import { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend } from 'recharts';
import { SEMANTIC_CATEGORIES, CATEGORY_LABELS } from '@/hooks/useSemanticProfiles';

const CATEGORY_KEYS = SEMANTIC_CATEGORIES;

/**
 * Adapter para o gráfico de radar - permite trocar a biblioteca no futuro
 * Implementação atual usa Recharts
 */
function RadarChartAdapter({ data, width = 280, height = 280, className = '' }) {
  // Preparar dados no formato esperado pelo Recharts
  const chartData = useMemo(() => {
    if (!data || !data.scores) return [];
    
    return CATEGORY_KEYS.map(category => {
      const scoreObj = data.scores.find(s => s.category === category);
      return {
        category: CATEGORY_LABELS[category] || category,
        value: scoreObj?.score ?? 0,
        fullCategory: category,
      };
    });
  }, [data]);

  const maxValue = 1;
  // Reduzir outerRadius para caber no container (280x280) com margens
  const outerRadius = Math.min(width, height) * 0.3;
  const innerRadius = 20;

  return (
    <div className={`w-full h-full ${className}`} style={{ width, height }}>
      <RadarChart 
        width={width} 
        height={height} 
        data={chartData} 
        cx="50%" 
        cy="50%" 
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        margin={{ top: 15, right: 15, bottom: 15, left: 15 }}
      >
        <PolarGrid gridType="polygon" radialLines={false} stroke="#374151" />
        <PolarAngleAxis 
          dataKey="category" 
          tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }}
          axisLine={{ stroke: '#374151' }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, maxValue]}
          tick={{ fill: '#6b7280', fontSize: 9 }}
          axisLine={false}
          ticks={[0.2, 0.4, 0.6, 0.8, 1.0]}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const item = payload[0].payload;
            return (
              <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-3 shadow-lg backdrop-blur-sm">
                <p className="font-semibold text-white mb-1">{item.category}</p>
                <p className="text-amber-400 text-lg font-mono">{(item.value * 100).toFixed(0)}%</p>
              </div>
            );
          }}
        />
        <Legend 
          layout="vertical" 
          align="right" 
          verticalAlign="bottom"
          iconType="circle"
          formatter={() => 'Perfil Semântico'}
        />
        <Radar
          name="Perfil Semântico"
          dataKey="value"
          stroke="#f59e0b"
          strokeWidth={2}
          fill="#f59e0b"
          fillOpacity={0.15}
          dot={{ r: 4, strokeWidth: 2, stroke: '#f59e0b', fill: '#fff' }}
          activeDot={{ r: 6, strokeWidth: 2, stroke: '#f59e0b', fill: '#f59e0b' }}
        />
      </RadarChart>
    </div>
  );
}

/**
 * Componente principal do Radar Semântico
 * Interface desacoplada da implementação
 */
export default function SemanticRadarChart({ 
  profile, 
  width = 280, 
  height = 280, 
  className = '',
  showLegend = false 
}) {
  if (!profile?.scores?.length) {
    return (
      <div 
        className={`flex items-center justify-center text-muted-foreground ${className}`}
        style={{ width, height }}
      >
        <p className="text-sm">Sem dados de perfil semântico</p>
      </div>
    );
  }

  return (
    <RadarChartAdapter 
      data={profile} 
      width={width} 
      height={height} 
      className={className}
    />
  );
}

/**
 * Interface para futuras implementações alternativas
 * Permite trocar a biblioteca sem alterar os componentes consumidores
 */
export const RadarChartInterface = {
  // Props esperadas pelo componente
  propTypes: {
    profile: 'object',      // Objeto com scores[]
    width: 'number',        // Largura do gráfico
    height: 'number',       // Altura do gráfico
    className: 'string',    // Classes CSS adicionais
    showLegend: 'boolean',  // Mostrar legenda
  },
  
  // Categorias esperadas no profile.scores
  expectedCategories: CATEGORY_KEYS,
  
  // Labels de exibição
  categoryLabels: CATEGORY_LABELS,
};
