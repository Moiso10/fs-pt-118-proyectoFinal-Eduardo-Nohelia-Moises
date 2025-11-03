import React, { createContext, useState, useEffect } from "react";

export const Context = createContext(null);

export const ContextProvider = ({ children }) => {
  const [store, setStore] = useState({
    auth: localStorage.getItem("token") ? true : false,
    user: null,
  });

  useEffect(() => {
    // 🔹 Si hay token, podemos simular que el usuario está logueado
    if (store.auth) {
      console.log("Usuario logueado en el contexto");
    }
  }, [store.auth]);

  return (
    <Context.Provider value={{ store, setStore }}>
      {children}
    </Context.Provider>
  );
};
