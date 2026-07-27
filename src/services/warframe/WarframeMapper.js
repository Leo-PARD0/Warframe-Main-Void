const IMAGE_BASE = 'https://cdn.warframestat.us/img';
const WEAPONS = ['Primary', 'Secondary', 'Melee'];
const ARCANES = ['Arcane', 'Arcanes'];
const AMP_COMPONENTS = ['Amp', 'Amp Components', 'AmpComponent', 'AmpComponents'];

const category = (raw, source) => { 
  const value = raw.category || source; 
  const result = (() => {
    // Check type first for Amp components (they have type: "Amp" but category: "Misc")
    if (raw.type === 'Amp') return 'AmpComponent';
    if (value === 'Warframes') return 'Warframe'; 
    if (value === 'Mods') return 'Mod'; 
    if (WEAPONS.includes(value)) return 'Weapon'; 
    if (value === 'Relics') return 'Relic'; 
    if (ARCANES.includes(value)) return 'Arcane';
    if (AMP_COMPONENTS.includes(value)) return 'AmpComponent';
    return value; 
  })();
  console.log(`[AUDIT] WarframeMapper.category:`, { rawCategory: raw.category, source, value, result, rawType: raw.type });
  return result;
};

const maxStats = (raw) => raw.levelStats?.at(-1)?.stats?.filter(Boolean) || [];

// Weapon variant detection
const WEAPON_VARIANTS = {
  'Prisma': { variant: 'Prisma', theme: 'Prisma' },
  'Kuva': { variant: 'Kuva', theme: 'Kuva' },
  'Tenet': { variant: 'Tenet', theme: 'Tenet' },
  'Coda': { variant: 'Coda', theme: 'Coda' },
  'Prime': { variant: 'Prime', theme: 'Prime' },
  'Wraith': { variant: 'Wraith', theme: 'Wraith' },
  'Vandal': { variant: 'Vandal', theme: 'Vandal' },
  'Dex': { variant: 'Dex', theme: 'Dex' },
  'Syndicate': { variant: 'Syndicate', theme: 'Syndicate' },
};

function detectWeaponVariant(name) {
  if (!name) return null;
  const normalizedName = name.toLowerCase();
  for (const [key, value] of Object.entries(WEAPON_VARIANTS)) {
    if (normalizedName.includes(key.toLowerCase())) {
      return value;
    }
  }
  return null;
}

function mapComponent(raw) {
  const drops = Array.isArray(raw.drops) ? raw.drops.map((drop) => ({
    place: drop.place || drop.location,
    chance: drop.chance,
    rotation: drop.rotation,
    rarity: drop.rarity
  })) : [];
  
  const isResource = raw.category === 'Resource' || (raw.type === 'Resource' && drops.length === 0);
  const isPart = !isResource;
  
  return {
    id: raw.uniqueName,
    uniqueName: raw.uniqueName,
    name: raw.name,
    imageName: raw.imageName || null,
    imageUrl: raw.imageName ? `${IMAGE_BASE}/${raw.imageName}` : null,
    drops,
    crafting: raw.crafting ? {
      components: raw.crafting.components || [],
      buildTime: raw.crafting.buildTime,
      buildQuantity: raw.crafting.buildQuantity,
      buildPrice: raw.crafting.buildPrice,
      skipBuildPrice: raw.crafting.skipBuildPrice,
      consumedOnBuild: raw.crafting.consumedOnBuild
    } : null,
    type: raw.type || null,
    rarity: raw.rarity || null,
    category: raw.category || null,
    displayCategory: category(raw, 'Component'),
    vaulted: raw.vaulted === true || raw.isVaulted === true || raw.vaulted === 'true' ? true : null,
    isPart,
    isResource
  };
}

export function mapItem(raw, source) {
  const displayCategory = category(raw, source);
  const allComponents = Array.isArray(raw.components) ? raw.components.map(mapComponent) : [];
  
  const craftParts = allComponents.filter(c => c.isPart);
  const craftResources = allComponents.filter(c => c.isResource);
  
  // Detect weapon variant for proper classification
  const weaponVariant = displayCategory === 'Weapon' ? detectWeaponVariant(raw.name) : null;
  
  // Use uniqueName or name as fallback for id (Arcanes don't have uniqueName)
  const itemId = raw.uniqueName || raw.name;
  
  // Arcane-specific handling: use thumbnail for image, effect for description
  const isArcane = displayCategory === 'Arcane';
  const imageName = isArcane ? raw.thumbnail : raw.imageName;
  const description = isArcane ? raw.effect : (displayCategory === 'Mod' ? null : raw.description || raw.wikiaDescription || null);
  
  return {
    id: itemId,
    name: raw.name,
    category: raw.category || source,
    displayCategory,
    type: raw.type || null,
    rarity: raw.rarity || null,
    productCategory: raw.productCategory || null,
    imageName: imageName || null,
    imageUrl: imageName ? `${IMAGE_BASE}/${imageName}` : null,
    description,
    attributes: displayCategory === 'Mod' ? maxStats(raw) : [],
    levelStats: raw.levelStats || [],
    vaulted: displayCategory === 'Relic' ? raw.vaulted === true || raw.isVaulted === true || raw.vaulted === 'true' : null,
    components: allComponents,
    craftParts,
    craftResources,
    isComposite: craftParts.length > 0,
    // New fields for weapon variant classification
    variant: weaponVariant?.variant || null,
    theme: weaponVariant?.theme || null,
    subcategory: displayCategory === 'Weapon' ? raw.category : null,
  };
}

export const WarframeMapper = { mapItem, mapComponent };
