import { createContext, useContext } from 'react';

export const InAppContext = createContext(false);

/** True when a page renders inside the signed-in app shell (so it can drop its own page padding). */
export const useInApp = () => useContext(InAppContext);
