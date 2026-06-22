const memory = new Map<string, string>();

const AsyncStorage = {
  async getItem(key: string) {
    return memory.has(key) ? memory.get(key)! : null;
  },
  async setItem(key: string, value: string) {
    memory.set(key, value);
  },
  async removeItem(key: string) {
    memory.delete(key);
  },
  async clear() {
    memory.clear();
  },
  async multiGet(keys: string[]) {
    return keys.map((key) => [key, memory.has(key) ? memory.get(key)! : null] as [string, string | null]);
  },
  async multiSet(entries: [string, string][]) {
    entries.forEach(([key, value]) => memory.set(key, value));
  },
  async multiRemove(keys: string[]) {
    keys.forEach((key) => memory.delete(key));
  },
};

export default AsyncStorage;
