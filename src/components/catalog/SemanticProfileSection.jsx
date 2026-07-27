import SemanticRadarChart from './SemanticRadarChart';
import { getRoleColors, getRoleIcon } from '@/utils/roleColors';
import { SEMANTIC_CATEGORIES, CATEGORY_LABELS } from '@/hooks/useSemanticProfiles';

/**
 * Componente da seção "Perfil Semântico" para a página de detalhes do Warframe
 */
export default function SemanticProfileSection({ profile, role }) {
  if (!profile && !role) {
    return null;
  }

  const roleColors = role ? getRoleColors(role.name) : null;
  const roleIcon = role ? getRoleIcon(role.name) : '';

  return (
    <section className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-6" aria-labelledby="semantic-profile-title">
      <h2 id="semantic-profile-title" className="text-sm font-semibold flex items-center gap-2">
        <span className="text-primary">◆</span> Perfil Semântico
      </h2>

      {/* Badge da Role + Descrição */}
      {role && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border"
              style={{
                backgroundColor: roleColors.bgLight,
                color: roleColors.text,
                borderColor: roleColors.border,
              }}
            >
              <span aria-hidden="true">{roleIcon}</span>
              {role.name}
            </span>
          </div>

          {/* Descrição da Role */}
          {role.description && (
            <p className="text-sm text-foreground/80 leading-relaxed">
              {role.description}
            </p>
          )}

          {/* Justificativa - "Por que esta Role?" */}
          {role.reasoning && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span className="text-amber-500">?</span> Por que esta Role?
              </h3>
              <p className="text-sm text-foreground/75 leading-relaxed whitespace-pre-line">
                {role.reasoning}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Radar Semântico + Lista de Categorias */}
      {profile?.scores?.length && (
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Radar Chart */}
          <div className="flex justify-center lg:justify-start">
            <div className="w-[280px] h-[280px]">
              <SemanticRadarChart profile={profile} width={280} height={280} />
            </div>
          </div>

          {/* Lista de Categorias */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Categorias
            </h3>
            <div className="space-y-2 font-mono text-sm">
              {SEMANTIC_CATEGORIES.map(category => {
                const scoreObj = profile.scores.find(s => s.category === category);
                const score = scoreObj?.score ?? 0;
                const percentage = (score * 100).toFixed(0).padStart(3, ' ');
                const label = CATEGORY_LABELS[category] || category;
                
                return (
                  <div 
                    key={category} 
                    className="flex items-baseline justify-between gap-2 px-2 py-1.5 rounded bg-background/50"
                    title={`${label}: ${(score * 100).toFixed(1)}%`}
                  >
                    <span className="text-foreground/70">{label}</span>
                    <span className="text-amber-400 font-semibold tabular-nums">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Resumo (Summary) */}
      {profile?.summary && (
        <div className="pt-4 border-t border-border/50">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Resumo
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
            {profile.summary}
          </p>
        </div>
      )}
    </section>
  );
}

/**
 * Componente simplificado para exibir apenas a badge da Role (para cards)
 */
export function RoleBadge({ role, size = 'sm' }) {
  if (!role?.name) return null;

  const roleColors = getRoleColors(role.name);
  const roleIcon = getRoleIcon(role.name);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold uppercase tracking-wide rounded-full border ${sizeClasses[size]}`}
      style={{
        backgroundColor: roleColors.bgLight,
        color: roleColors.text,
        borderColor: roleColors.border,
      }}
      title={role.description}
    >
      <span aria-hidden="true">{roleIcon}</span>
      {role.name}
    </span>
  );
}