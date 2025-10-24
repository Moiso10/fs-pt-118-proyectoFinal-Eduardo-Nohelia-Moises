import React, { createContext, useReducer } from "react";
import storeReducer, { initialStore } from "./store";

//  Creamos el contexto global
export const Context = createContext(null);

//  Proveedor del contexto
export const ContextProvider = ({ children }) => {
  const [store, dispatch] = useReducer(storeReducer, initialStore());

  return (
    <Context.Provider value={{ store, dispatch }}>
      {children}
    </Context.Provider>
  );
};
