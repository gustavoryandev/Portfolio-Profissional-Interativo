import { createContext, useContext } from 'react';
export const AstraContext = createContext({ openAstra: undefined, openFull: undefined, returnPortfolio: undefined });
export const useAstra = () => useContext(AstraContext);
