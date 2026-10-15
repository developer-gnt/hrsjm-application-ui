export function createMMKV(config) {
  const prefix = config && config.id ? `${config.id}:` : '';
  return {
    getBoolean: key => {
      const val = typeof window !== 'undefined' ? window.localStorage?.getItem(prefix + key) : null;
      return val === null || val === undefined ? undefined : val === 'true';
    },
    set: (key, val) => {
      if (typeof window !== 'undefined') {
        window.localStorage?.setItem(prefix + key, String(val));
      }
    },
    getString: key => {
      if (typeof window === 'undefined') return undefined;
      return window.localStorage?.getItem(prefix + key) ?? undefined;
    },
    remove: key => {
      if (typeof window !== 'undefined') {
        window.localStorage?.removeItem(prefix + key);
      }
    },
    delete: key => {
      if (typeof window !== 'undefined') {
        window.localStorage?.removeItem(prefix + key);
      }
    },
    clearAll: () => {
      if (typeof window !== 'undefined') {
        window.localStorage?.clear();
      }
    },
  };
}

export default { createMMKV };
