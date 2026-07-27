import { useCallback, useEffect, useState } from 'react';
import { getRoleIcon, getRoleColors } from '@/utils/roleColors';

export const SEMANTIC_CATEGORIES = [
  'damage',
  'survivability',
  'support',
  'crowdControl',
  'stealth',
  'complexity',
];

export const CATEGORY_LABELS = {
  damage: 'Damage',
  survivability: 'Survivability',
  support: 'Support',
  crowdControl: 'Crowd Control',
  stealth: 'Stealth',
  complexity: 'Complexity',
};

export function useSemanticProfiles() {
  const [profiles, setProfiles] = useState({});
  const [roles, setRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Carregar todos os arquivos JSON da pasta validated
      const response = await fetch('/src/data/validated/');
      // Como não podemos listar diretórios via fetch, vamos usar import.meta.glob
      // ou carregar dinamicamente. Vamos usar uma abordagem diferente.
      
      // Usar import.meta.glob do Vite para carregar todos os arquivos
      const modules = import.meta.glob('/src/data/validated/*.json', { eager: true });
      
      const loadedProfiles = {};
      const loadedRoles = {};
      
      for (const [path, module] of Object.entries(modules)) {
        const fileName = path.split('/').pop().replace('.json', '');
        
        if (fileName.endsWith('_role')) {
          const warframeName = fileName.replace('_role', '');
          if (module.valid && module.data?.role) {
            loadedRoles[warframeName] = module.data.role;
          }
        } else {
          if (module.valid && module.data) {
            loadedProfiles[fileName] = module.data;
          }
        }
      }
      
      setProfiles(loadedProfiles);
      setRoles(loadedRoles);
    } catch (err) {
      console.error('Erro ao carregar perfis semânticos:', err);
      setError('Não foi possível carregar os perfis semânticos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  // Helper para obter perfil semântico de um warframe
  const getProfile = useCallback((warframeName) => {
    // Normalizar nome: remover _prime, _umbra, etc. para buscar o base
    const normalized = warframeName
      .toLowerCase()
      .replace(/_prime$/, '')
      .replace(/_umbra$/, '')
      .replace(/[^a-z0-9_]/g, '_');
    
    // Tentar busca exata primeiro
    if (profiles[normalized]) return profiles[normalized];
    
    // Tentar busca por prefixo (ex: ash_prime -> ash)
    for (const [key, value] of Object.entries(profiles)) {
      if (key.startsWith(normalized) || normalized.startsWith(key)) {
        return value;
      }
    }
    
    return null;
  }, [profiles]);

  // Helper para obter role de um warframe
  const getRole = useCallback((warframeName) => {
    const normalized = warframeName
      .toLowerCase()
      .replace(/_prime$/, '')
      .replace(/_umbra$/, '')
      .replace(/[^a-z0-9_]/g, '_');
    
    if (roles[normalized]) return roles[normalized];
    
    for (const [key, value] of Object.entries(roles)) {
      if (key.startsWith(normalized) || normalized.startsWith(key)) {
        return value;
      }
    }
    
    return null;
  }, [roles]);

  // Helper para obter score de uma categoria
  const getScore = useCallback((profile, category) => {
    if (!profile?.scores) return 0;
    const scoreObj = profile.scores.find(s => s.category === category);
    return scoreObj?.score ?? 0;
  }, []);

  // Helper para obter todas as roles únicas
  const getAllRoles = useCallback(() => {
    const roleSet = new Set();
    Object.values(roles).forEach(role => {
      if (role?.name) roleSet.add(role.name);
    });
    return Array.from(roleSet).sort();
  }, [roles]);

  return {
    profiles,
    roles,
    loading,
    error,
    getProfile,
    getRole,
    getScore,
    getAllRoles,
    getRoleIcon,
    getRoleColors,
    SEMANTIC_CATEGORIES,
    reload: loadProfiles,
  };
}
