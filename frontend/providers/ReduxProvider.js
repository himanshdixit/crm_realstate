"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { createStore } from "@/redux/store";

export function ReduxProvider({ children }) {
  const [store] = useState(() => createStore());
  useEffect(() => {
    const persistor = persistStore(store);
    return () => persistor.pause();
  }, [store]);
  return <Provider store={store}>{children}</Provider>;
}
