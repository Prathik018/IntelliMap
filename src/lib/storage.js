const STORAGE_PREFIX = 'intellimap_history_';

export const saveMapToHistory = (userId, mapData) => {
  if (!userId) return;
  const key = `${STORAGE_PREFIX}${userId}`;
  const history = getHistory(userId);

  // Add new map to the beginning of the list
  const newEntry = {
    id: Date.now().toString(),
    ...mapData,
    createdAt: new Date().toISOString(),
  };

  const updatedHistory = [newEntry, ...history];
  localStorage.setItem(key, JSON.stringify(updatedHistory));
  return newEntry;
};

export const getHistory = (userId) => {
  if (!userId) return [];
  const key = `${STORAGE_PREFIX}${userId}`;
  const stored = localStorage.getItem(key);
  try {
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to parse history', e);
    return [];
  }
};

export const deleteMapFromHistory = (userId, mapId) => {
  if (!userId) return;
  const key = `${STORAGE_PREFIX}${userId}`;
  const history = getHistory(userId);
  const updatedHistory = history.filter((item) => item.id !== mapId);
  localStorage.setItem(key, JSON.stringify(updatedHistory));
  return updatedHistory;
};
