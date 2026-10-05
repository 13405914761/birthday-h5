// EXPORTS: store
const NS = 'birthday-binbin';

export const store = {
  get<T>(key: string, fallback: T): T {
    try {
      const value = localStorage.getItem(`${NS}:${key}`);
      return value ? (JSON.parse(value) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(`${NS}:${key}`, JSON.stringify(value));
    } catch {
      // Privacy mode can disable localStorage; the in-memory experience still works.
    }
  },
};
