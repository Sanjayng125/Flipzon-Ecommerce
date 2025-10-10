"use client";

import React from "react";

export function useDebounce(value: string, delay = 400, minLength = 2): string {
    const [debounced, setDebounced] = React.useState(value);

    React.useEffect(() => {
        const shouldTrigger = value.length >= minLength || value.length === 0;

        const timer = setTimeout(() => {
            if (shouldTrigger) {

                setDebounced(value)
            }
        }, delay);

        return () => clearTimeout(timer);

    }, [value, delay]);

    return debounced;
}