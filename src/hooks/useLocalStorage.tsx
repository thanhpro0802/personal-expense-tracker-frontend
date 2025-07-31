import { useState } from 'react';

/**
 * Check if a string is likely to be JSON (starts with '{' or '[')
 */
function isLikelyJSON(value: string): boolean {
  return typeof value === 'string' && /^[{\[]/.test(value.trim());
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item || item === 'undefined') {
        return initialValue;
      }

      return isLikelyJSON(item) ? JSON.parse(item) : (item as unknown as T);
    } catch (error) {
      console.error(`❌ Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      const serialized =
          typeof valueToStore === 'string' ? valueToStore : JSON.stringify(valueToStore);
      window.localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`❌ Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`❌ Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
}
