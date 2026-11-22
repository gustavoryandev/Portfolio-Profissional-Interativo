import { createContext } from 'react';

// Keep the context identity independent from animated components and hot updates.
export const ThemeContext = createContext(null);
