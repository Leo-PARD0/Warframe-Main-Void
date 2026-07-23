import { useState, useEffect, useMemo, useCallback } from 'react';

import { load, save, DEFAULT_TAGS } from '@/lib/storage';
import { useWarframeItems } from '@/hooks/useWarframeItems';

const PAGE_SIZE = 48;

export const STATUS_ORDER = ['dont', 'farming', 'have'];
export const STATUS_LABEL = { dont: 'Não possui', farming: 'Farmando', have: 'Possui' };

export function useCatalog() {
  const { items, loading, error: catalogError, language, refresh } = useWarframeItems();
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
  }, [search, categoryFilter, typeFilter, relicStateFilter, selectedTagIds]);

  const tagById = useMemo(
    () => Object.fromEntries(tags.map((t) => [t.id, t])),
    [tags]
  );

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
  }, [items, search, categoryFilter, typeFilter, relicStateFilter, selectedTagIds, itemTags, tagById]);

  const visible = filtered.slice(0, visibleCount);

  const types = useMemo(() => {
    const set = new Set();
    items.forEach((i) => {
      if (i.type) set.add(i.type);
    });
    return Array.from(set).sort();
  }, [items]);

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

  return {
    items,
    loading,
    error: catalogError,
    language,
    apiStatus,
    refreshApiStatus,
    filtered,
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
  };
}