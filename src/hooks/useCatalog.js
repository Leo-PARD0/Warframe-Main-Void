import { useState, useEffect, useMemo, useCallback } from 'react';

import { load, save, DEFAULT_TAGS } from '@/lib/storage';
import { useWarframeItems } from '@/hooks/useWarframeItems';
import { useSemanticProfiles } from '@/hooks/useSemanticProfiles';

const PAGE_SIZE = 48;

export const STATUS_ORDER = ['dont', 'farming', 'have'];
export const STATUS_LABEL = { dont: 'Não possui', farming: 'Farmando', have: 'Possui' };

// Opções de ordenação disponíveis
export const SORT_OPTIONS = [
  { value: 'name', label: 'Nome' },
  { value: 'role', label: 'Role' },
  { value: 'damage', label: 'Damage' },
  { value: 'survivability', label: 'Survivability' },
  { value: 'support', label: 'Support' },
  { value: 'crowdControl', label: 'Crowd Control' },
  { value: 'stealth', label: 'Stealth' },
  { value: 'complexity', label: 'Complexity' },
];

export function useCatalog() {
  const { items, loading, error: catalogError, language, refresh } = useWarframeItems();
  const { getProfile, getRole, getScore, getAllRoles, loading: semanticLoading } = useSemanticProfiles();
  const [apiStatus, setApiStatus] = useState({ checking: false, ok: true, status: 200, latency: null, checkedAt: null });

  const [tags, setTags] = useState(() => load('tags', DEFAULT_TAGS));
  const [friends, setFriends] = useState(() => load('friends', []));
  const [itemTags, setItemTags] = useState(() => load('item_tags', {}));
  const [friendStatusMap, setFriendStatusMap] = useState(() => load('friend_status', {}));

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [relicStateFilter, setRelicStateFilter] = useState('all');
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  
  // Novos estados para ordenação e filtro por role
  const [sortBy, setSortBy] = useState('name');
  // Nome: A-Z (asc), Numéricos: Maior primeiro (desc)
  const [sortOrder, setSortOrder] = useState('asc'); 
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => save('tags', tags), [tags]);
  useEffect(() => save('friends', friends), [friends]);
  useEffect(() => save('item_tags', itemTags), [itemTags]);
  useEffect(() => save('friend_status', friendStatusMap), [friendStatusMap]);

  const refreshApiStatus = useCallback(async () => {
    setApiStatus((previous) => ({ ...previous, checking: true }));
    try { await refresh(); setApiStatus({ checking: false, ok: true, status: 200, latency: null, checkedAt: Date.now() }); } catch { setApiStatus({ checking: false, ok: false, status: null, latency: null, checkedAt: Date.now() }); }
  }, [refresh]);

  // Reset pagination on filter change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, categoryFilter, typeFilter, relicStateFilter, selectedTagIds, roleFilter, sortBy, sortOrder]);

  const tagById = useMemo(
    () => Object.fromEntries(tags.map((t) => [t.id, t])),
    [tags]
  );

  // Função para obter role do item (apenas para Warframes)
  const getItemRole = useCallback((item) => {
    if (item.displayCategory !== 'Warframe') return null;
    return getRole(item.name);
  }, [getRole]);

  // Função para obter score de uma categoria semântica
  const getItemScore = useCallback((item, category) => {
    if (item.displayCategory !== 'Warframe') return 0;
    const profile = getProfile(item.name);
    return getScore(profile, category);
  }, [getProfile, getScore]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (categoryFilter !== 'all' && it.displayCategory !== categoryFilter) return false;
      if (typeFilter !== 'all' && (it.type || '') !== typeFilter) return false;
      if (relicStateFilter !== 'all' && it.displayCategory === 'Relic' && (it.vaulted ? 'vaulted' : 'available') !== relicStateFilter) return false;
      if (selectedTagIds.length) {
        const itTags = itemTags[it.id] || [];
        if (!selectedTagIds.every((t) => itTags.includes(t))) return false;
      }
      // Filtro por Role
      if (roleFilter !== 'all') {
        const itemRole = getItemRole(it);
        if (!itemRole || itemRole.name !== roleFilter) return false;
      }
      if (q) {
        const hay = [
          it.name,
          it.displayCategory,
          it.type,
          it.category,
          it.description,
          ...(it.attributes || []),
          ...(itemTags[it.id] || []).map((id) => tagById[id]?.name),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, search, categoryFilter, typeFilter, relicStateFilter, selectedTagIds, itemTags, tagById, roleFilter, getItemRole]);

  // Ordenação
  const sorted = useMemo(() => {
    const sortedItems = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'role': {
          const roleA = getItemRole(a);
          const roleB = getItemRole(b);
          const nameA = roleA?.name || 'ZZZ';
          const nameB = roleB?.name || 'ZZZ';
          comparison = nameA.localeCompare(nameB);
          break;
        }
        case 'damage':
        case 'survivability':
        case 'support':
        case 'crowdControl':
        case 'stealth':
        case 'complexity': {
          const scoreA = getItemScore(a, sortBy);
          const scoreB = getItemScore(b, sortBy);
          comparison = scoreA - scoreB;
          break;
        }
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return sortedItems;
  }, [filtered, sortBy, sortOrder, getItemRole, getItemScore]);

  const visible = sorted.slice(0, visibleCount);

  const types = useMemo(() => {
    const set = new Set();
    items.forEach((i) => {
      if (i.type) set.add(i.type);
    });
    return Array.from(set).sort();
  }, [items]);

  // Roles disponíveis para filtro (apenas das Warframes carregadas)
  const availableRoles = useMemo(() => {
    const roleSet = new Set();
    items.forEach((item) => {
      if (item.displayCategory === 'Warframe') {
        const role = getItemRole(item);
        if (role?.name) roleSet.add(role.name);
      }
    });
    return Array.from(roleSet).sort();
  }, [items, getItemRole]);

  // Tag actions
  const createTag = useCallback((name, color, description) => {
    const t = {
      id: 't_' + Date.now(),
      name,
      color: color || '#fbbf24',
      description: description || '',
    };
    setTags((prev) => [...prev, t]);
    return t;
  }, []);

  const updateTag = useCallback(
    (id, patch) => setTags((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    []
  );

  const deleteTag = useCallback((id) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
    setItemTags((prev) => {
      const next = {};
      Object.keys(prev).forEach((k) => {
        next[k] = prev[k].filter((x) => x !== id);
      });
      return next;
    });
    setSelectedTagIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const toggleItemTag = useCallback((itemId, tagId) => {
    setItemTags((prev) => {
      const cur = prev[itemId] || [];
      return {
        ...prev,
        [itemId]: cur.includes(tagId) ? cur.filter((x) => x !== tagId) : [...cur, tagId],
      };
    });
  }, []);

  // Friend actions
  const addFriend = useCallback(
    (name) => setFriends((prev) => [...prev, { id: 'f_' + Date.now(), name: name.trim() }]),
    []
  );
  const renameFriend = useCallback(
    (id, name) => setFriends((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f))),
    []
  );
  const deleteFriend = useCallback((id) => {
    setFriends((prev) => prev.filter((f) => f.id !== id));
    setFriendStatusMap((prev) => {
      const next = {};
      Object.keys(prev).forEach((k) => {
        const copy = { ...prev[k] };
        delete copy[id];
        next[k] = copy;
      });
      return next;
    });
  }, []);

  const cycleFriendStatus = useCallback((itemId, friendId) => {
    setFriendStatusMap((prev) => {
      const cur = prev[itemId]?.[friendId] || 'dont';
      const next = cur === 'dont' ? 'farming' : cur === 'farming' ? 'have' : 'dont';
      return { ...prev, [itemId]: { ...(prev[itemId] || {}), [friendId]: next } };
    });
  }, []);

  const setFriendStatus = useCallback((itemId, friendId, status) => {
    setFriendStatusMap((prev) => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || {}), [friendId]: status },
    }));
  }, []);

  // Toggle sort order
  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  // Set sort by (reset order based on field type)
  const setSortByField = useCallback((field) => {
    setSortBy(field);
    // Nome e Role: A-Z (asc), Numéricos: Maior primeiro (desc)
    const isNumeric = ['damage', 'survivability', 'support', 'crowdControl', 'stealth', 'complexity'].includes(field);
    setSortOrder(isNumeric ? 'desc' : 'asc');
  }, []);

  return {
    items,
    loading: loading || semanticLoading,
    error: catalogError,
    language,
    apiStatus,
    refreshApiStatus,
    filtered: sorted, // Retornar já ordenado
    visible,
    visibleCount,
    setVisibleCount,
    PAGE_SIZE,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    typeFilter,
    setTypeFilter,
    relicStateFilter,
    setRelicStateFilter,
    selectedTagIds,
    setSelectedTagIds,
    types,
    tags,
    tagById,
    friends,
    itemTags,
    friendStatusMap,
    createTag,
    updateTag,
    deleteTag,
    toggleItemTag,
    addFriend,
    renameFriend,
    deleteFriend,
    cycleFriendStatus,
    setFriendStatus,
    // Novos retornos para ordenação e filtro por role
    sortBy,
    setSortBy: setSortByField,
    sortOrder,
    toggleSortOrder,
    roleFilter,
    setRoleFilter,
    availableRoles,
    SORT_OPTIONS,
    getItemRole,
    getItemScore,
  };
}
