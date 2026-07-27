// Mapeamento de cores para cada Role
// Cores escolhidas para serem visualmente distintas e acessíveis
export const ROLE_COLORS = {
  Assassin: {
    bg: '#ef4444',      // red-500
    bgLight: '#fef2f2', // red-50
    text: '#dc2626',    // red-600
    border: '#fca5a5',  // red-300
    icon: '🗡',
  },
  Guardian: {
    bg: '#3b82f6',      // blue-500
    bgLight: '#eff6ff', // blue-50
    text: '#2563eb',    // blue-600
    border: '#93c5fd',  // blue-300
    icon: '🛡',
  },
  Mage: {
    bg: '#8b5cf6',      // violet-500
    bgLight: '#f5f3ff', // violet-50
    text: '#7c3aed',    // violet-600
    border: '#c4b5fd',  // violet-300
    icon: '🔮',
  },
  Controller: {
    bg: '#06b6d4',      // cyan-500
    bgLight: '#f0f9ff', // cyan-50
    text: '#0891b2',    // cyan-600
    border: '#67e8f9',  // cyan-300
    icon: '🎮',
  },
  Tank: {
    bg: '#f59e0b',      // amber-500
    bgLight: '#fffbeb', // amber-50
    text: '#d97706',    // amber-600
    border: '#fcd34d',  // amber-300
    icon: '🏰',
  },
  Support: {
    bg: '#10b981',      // emerald-500
    bgLight: '#ecfdf5', // emerald-50
    text: '#059669',    // emerald-600
    border: '#6ee7b7',  // emerald-300
    icon: '💚',
  },
  Duelist: {
    bg: '#f97316',      // orange-500
    bgLight: '#fff7ed', // orange-50
    text: '#ea580c',    // orange-600
    border: '#fdba74',  // orange-300
    icon: '⚔',
  },
  Specialist: {
    bg: '#ec4899',      // pink-500
    bgLight: '#fdf2f8', // pink-50
    text: '#db2777',    // pink-600
    border: '#f9a8d4',  // pink-300
    icon: '⚡',
  },
};

// Cor padrão para roles não mapeadas
export const DEFAULT_ROLE_COLOR = {
  bg: '#6b7280',       // gray-500
  bgLight: '#f9fafb',  // gray-50
  text: '#4b5563',     // gray-600
  border: '#d1d5db',   // gray-300
  icon: '❓',
};

/**
 * Obtém as cores para uma role específica
 * @param {string} roleName - Nome da role
 * @returns {Object} Objeto com bg, bgLight, text, border, icon
 */
export function getRoleColors(roleName) {
  if (!roleName) return DEFAULT_ROLE_COLOR;
  return ROLE_COLORS[roleName] || DEFAULT_ROLE_COLOR;
}

/**
 * Obtém apenas o ícone da role
 * @param {string} roleName - Nome da role
 * @returns {string} Emoji da role
 */
export function getRoleIcon(roleName) {
  return getRoleColors(roleName).icon;
}

/**
 * Obtém todas as roles disponíveis com suas cores
 * @returns {Array} Array de objetos { name, colors }
 */
export function getAllRolesWithColors() {
  return Object.entries(ROLE_COLORS).map(([name, colors]) => ({
    name,
    ...colors,
  }));
}