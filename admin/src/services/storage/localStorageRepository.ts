export interface Repository<T extends { id: string }> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  save(entity: T): Promise<T>;
  remove(id: string): Promise<void>;
}

export function createLocalStorageRepository<T extends { id: string }>(key: string, initialData: T[]): Repository<T> {
  const read = (): T[] => {
    const raw = localStorage.getItem(key);
    if (!raw) { localStorage.setItem(key, JSON.stringify(initialData)); return initialData; }
    try { return JSON.parse(raw) as T[]; } catch { localStorage.setItem(key, JSON.stringify(initialData)); return initialData; }
  };
  const write = (items: T[]) => localStorage.setItem(key, JSON.stringify(items));
  return {
    async list() { return structuredClone(read()); },
    async get(id) { return structuredClone(read().find((item) => item.id === id)); },
    async save(entity) { const items = read(); const index = items.findIndex((item) => item.id === entity.id); index < 0 ? items.push(entity) : items.splice(index, 1, entity); write(items); return structuredClone(entity); },
    async remove(id) { write(read().filter((item) => item.id !== id)); },
  };
}
