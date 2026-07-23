/**
 * The visual identity service for all catalog and roadmap cards.
 * Components consume the returned metadata and never infer colors themselves.
 */
const createTheme = ({ label, material, background, surface, border, accent, pips = 0, glow, textColor = '#f8fafc' }) => ({
  label,
  material,
  background,
  surface,
  border,
  accent,
  glow,
  textColor,
  pips,
  badge: { bg: `${accent}24`, color: accent },
});

const THEMES = {
  common: createTheme({
    label: 'Common', material: 'Bronze', pips: 1,
    background: 'linear-gradient(135deg, #17120d 0%, #3d2915 48%, #15100b 100%)',
    surface: 'linear-gradient(135deg, #171411 0%, #221b13 100%)', border: '#a66f2c', accent: '#d39a45', glow: 'rgba(166,111,44,.22)',
  }),
  uncommon: createTheme({
    label: 'Uncommon', material: 'Silver', pips: 2,
    background: 'linear-gradient(135deg, #10171d 0%, #435563 52%, #12191e 100%)',
    surface: 'linear-gradient(135deg, #12171b 0%, #1a2228 100%)', border: '#8fa9b9', accent: '#c4d9e5', glow: 'rgba(143,169,185,.2)',
  }),
  rare: createTheme({
    label: 'Rare', material: 'Gold', pips: 3,
    background: 'linear-gradient(135deg, #201807 0%, #5b4211 52%, #171105 100%)',
    surface: 'linear-gradient(135deg, #19150b 0%, #28200d 100%)', border: '#d2a42c', accent: '#ffd45c', glow: 'rgba(210,164,44,.25)',
  }),
  legendary: createTheme({
    label: 'Legendary', material: 'Platinum', pips: 4,
    background: 'linear-gradient(135deg, #17202a 0%, #728696 50%, #1b2228 100%)',
    surface: 'linear-gradient(135deg, #161c22 0%, #25303a 100%)', border: '#b8d4e6', accent: '#e4f6ff', glow: 'rgba(184,212,230,.25)',
  }),
  primed: createTheme({
    label: 'Primed', material: 'Orokin', pips: 3,
    background: 'linear-gradient(135deg, #342b18 0%, #f0dfae 12%, #b18a35 48%, #f7edcf 86%, #372b14 100%)',
    surface: 'linear-gradient(135deg, #211b11 0%, #342a16 100%)', border: '#e4bd54', accent: '#f7d875', glow: 'rgba(228,189,84,.34)',
  }),
  prime: createTheme({
    label: 'Prime', material: 'Orokin', pips: 3,
    background: 'linear-gradient(135deg, #2b261d 0%, #f3e8c8 14%, #b99342 48%, #d7f6f8 74%, #302819 100%)',
    surface: 'linear-gradient(135deg, #1c1a15 0%, #302817 100%)', border: '#e4c36e', accent: '#dffcff', glow: 'rgba(228,195,110,.3)',
  }),
  umbra: createTheme({
    label: 'Umbra', material: 'Orokin Umbra', pips: 3,
    background: 'linear-gradient(135deg, #11100e 0%, #ddd0aa 18%, #9e792c 53%, #171512 82%, #080807 100%)',
    surface: 'linear-gradient(135deg, #0d0d0c 0%, #201d17 100%)', border: '#c5a048', accent: '#ead8a2', glow: 'rgba(197,160,72,.26)',
  }),
  archon: createTheme({
    label: 'Archon', material: 'Narmer', pips: 5,
    background: 'linear-gradient(135deg, #25080a 0%, #9b211d 48%, #35100b 100%)',
    surface: 'linear-gradient(135deg, #19090a 0%, #35100f 100%)', border: '#e15b38', accent: '#ffd05d', glow: 'rgba(225,91,56,.32)',
  }),
  riven: createTheme({
    label: 'Riven', material: 'Crystal', pips: 5,
    background: 'linear-gradient(135deg, #170b25 0%, #6d3194 50%, #25103b 100%)',
    surface: 'linear-gradient(135deg, #160d22 0%, #2c1440 100%)', border: '#b76aff', accent: '#e5aeff', glow: 'rgba(183,106,255,.34)',
  }),
  galvanized: createTheme({
    label: 'Galvanized', material: 'Metallic', pips: 3,
    background: 'linear-gradient(135deg, #111b20 0%, #355967 48%, #11191e 100%)',
    surface: 'linear-gradient(135deg, #10171b 0%, #19262c 100%)', border: '#6496a8', accent: '#9bc8d4', glow: 'rgba(100,150,168,.24)',
  }),
  amalgam: createTheme({
    label: 'Amalgam', material: 'Sentient',
    background: 'linear-gradient(135deg, #1b1a20 0%, #655b72 50%, #25212b 100%)',
    surface: 'linear-gradient(135deg, #19171d 0%, #28232d 100%)', border: '#a193af', accent: '#d1bfdc', glow: 'rgba(161,147,175,.22)',
  }),
  peculiar: createTheme({ label: 'Peculiar', material: 'Smoke', background: 'linear-gradient(135deg, #191b1d, #4b5155, #1a1c1e)', surface: '#17191b', border: '#818b8f', accent: '#c5ced0' }),
  requiem: createTheme({ label: 'Requiem', material: 'Obsidian', background: 'linear-gradient(135deg, #08090b, #28272b, #090909)', surface: '#101012', border: '#6b3c43', accent: '#b85a65' }),
  tome: createTheme({ label: 'Tome', material: 'Entrati Obols', background: 'linear-gradient(135deg, #071632, #164a82, #0a1836)', surface: '#0c1524', border: '#bd9443', accent: '#d6b363', glow: 'rgba(64,126,200,.24)' }),
  antivirus: createTheme({ label: 'Antivirus', material: 'Circuit Board', background: 'linear-gradient(135deg, #062016, #008565, #08261e)', surface: '#091d18', border: '#09cf9e', accent: '#5bffd0', glow: 'rgba(9,207,158,.25)' }),
  potency: createTheme({ label: 'Potency', material: 'Photocard', background: 'linear-gradient(135deg, #f6d8d6, #c55d63, #fff0de)', surface: '#2c1b20', border: '#f0b4a8', accent: '#ffe2d4' }),
  tektolyst: createTheme({ label: 'Tektolyst', material: 'Sentient', background: 'linear-gradient(135deg, #272629, #b5b0a2, #373437)', surface: '#202023', border: '#ddd6bf', accent: '#fff3c6' }),
  warframe: createTheme({ label: 'Warframe', material: 'Tenno', background: 'linear-gradient(135deg, #071c28, #0a6679, #101d29)', surface: '#0d1920', border: '#399cb5', accent: '#7fe7f7', glow: 'rgba(57,156,181,.2)' }),
  weapon: createTheme({ label: 'Weapon', material: 'Arsenal', background: 'linear-gradient(135deg, #24140c, #934d20, #24130b)', surface: '#1c1410', border: '#d07a38', accent: '#f2ac68', glow: 'rgba(208,122,56,.2)' }),
  mod: createTheme({ label: 'Mod', material: 'Standard', background: 'linear-gradient(135deg, #17151d, #493d68, #191522)', surface: '#17131d', border: '#8970b8', accent: '#c6a7ff' }),
  default: createTheme({ label: '', material: '', background: 'linear-gradient(135deg, #131820, #303944, #131820)', surface: '#12171d', border: '#718096', accent: '#cbd5e1' }),
};

const RARITY = { common: 'common', uncommon: 'uncommon', rare: 'rare', legendary: 'legendary' };
const SPECIAL_TYPES = new Set(['Primed', 'Umbra', 'Archon', 'Galvanized', 'Amalgam', 'Riven', 'Peculiar', 'Requiem', 'Tome', 'Antivirus', 'Potency', 'Tektolyst']);
const NAME_RULES = [
  ['Primed', 'primed'], ['Umbra', 'umbra'], ['Archon', 'archon'], ['Galvanized', 'galvanized'], ['Amalgam', 'amalgam'], ['Riven', 'riven'], ['Peculiar', 'peculiar'], ['Requiem', 'requiem'], ['Tome', 'tome'], ['Antivirus', 'antivirus'], ['Potency', 'potency'], ['Tektolyst', 'tektolyst'],
  ['Prime', 'prime'], ['Kuva', 'archon'], ['Tenet', 'tome'], ['Prisma', 'riven'], ['Wraith', 'archon'], ['Vandal', 'galvanized'], ['Dex', 'rare'], ['Coda', 'requiem'], ['Incarnon', 'riven'],
];

function matchingRule(name) {
  const normalizedName = name || '';
  const match = NAME_RULES.find(([term]) => new RegExp(`\\b${term}\\b`, 'i').test(normalizedName));
  return match?.[1];
}

export const ThemeEngine = {
  getTheme(item) {
    if (!item) return THEMES.default;

    const apiType = item.type || item.productCategory;
    if (item.displayCategory === 'Mod' && SPECIAL_TYPES.has(apiType)) return THEMES[apiType.toLowerCase()];

    const namedTheme = matchingRule(item.name);
    if (namedTheme) return THEMES[namedTheme];

    if (item.displayCategory === 'Mod') {
      const rarity = RARITY[String(item.rarity || '').toLowerCase()];
      if (rarity) return THEMES[rarity];
    }

    return THEMES[String(item.displayCategory || '').toLowerCase()] || THEMES.default;
  },
  getBadge(item) { return this.getTheme(item).badge; },
};