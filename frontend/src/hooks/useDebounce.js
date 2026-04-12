import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value.
 * Delays the update of the debounced value until after the specified delay 
 * has elapsed since the last time the input value changed.
 * 
 * @param {any} value - The actual value to be debounced.
 * @param {number} delay - The delay in milliseconds (default: 300ms).
 * @returns {any} - The debounced value.
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: Clear the timeout if the value changes before the delay ends
    // This is the core 'Anti-Bouncing' logic
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
