import { useEffect, useState } from 'react';

/**
 * Debounces a rapidly-changing value (rule.md §4.4: at least 400ms before
 * firing API calls). Returns the settled value.
 */
export const useDebouncedValue = <T,>(value: T, delayMs = 400): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
};