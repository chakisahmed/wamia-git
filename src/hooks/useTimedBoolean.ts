import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useTimedBoolean
 * @param initial   – starting value (defaults to false)
 * @param duration  – how long (ms) the value should stay true
 *
 * Returns a tuple:
 *   [currentValue, triggerFunction]
 */
export function useTimedBoolean(
  initial: boolean = false,
  duration: number = 3000
) {
  const [value, setValue] = useState(initial);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const trigger = useCallback(() => {
    setValue(true);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => setValue(false), duration);
  }, [duration]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return [value, trigger] as const;
}
