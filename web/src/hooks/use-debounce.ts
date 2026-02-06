import * as React from "react";

/**
 * Hook para debounce de valores
 * @param value - Valor a ser "debounced"
 * @param delay - Delay em milliseconds (default: 300ms)
 */
export function useDebounce<T>(value: T, delay = 300): T {
	const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

	React.useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(timer);
		};
	}, [value, delay]);

	return debouncedValue;
}
