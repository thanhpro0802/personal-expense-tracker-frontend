/**
 * Custom hook for managing localStorage operations
 */

import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item || item === 'undefined') {
        return initialValue;
      }

      // Nếu T là string (ví dụ token), không JSON.parse
      if (typeof initialValue === 'string') {
        return item as T;
      }

      return JSON.parse(item);
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
          typeof valueToStore === 'string'
              ? valueToStore
              : JSON.stringify(valueToStore);
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
