import { createContext, useContext, useSyncExternalStore } from 'react';
export const AstraContext = createContext({});
export const useAstra = () => useContext(AstraContext);
export function useLaboratory() {
  const { lab } = useAstra();
  return [lab, useSyncExternalStore(lab.subscribe, lab.getSnapshot, lab.getSnapshot)];
}
