import { useState, useEffect } from "react";

export function useLocalStorage<T>(
  key: string,
  defaultValue: T | null = null
): T | null {
  const [value, setValue] = useState<T | null>(defaultValue);

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        setValue(JSON.parse(item));
      } else {
        setValue(defaultValue);
      }
    } catch (error) {
      `Error parsing localStorage key "${key}":`, error;
      setValue(defaultValue);
    }
  }, [key]);

  return value;
}
