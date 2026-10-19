import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import { authReducer } from "./slices/authSlice";
import { uiReducer } from "./slices/uiSlice";

const storage = {
  getItem(key) {
    if (typeof window === "undefined") return Promise.resolve(null);
    return Promise.resolve(window.localStorage.getItem(key));
  },
  setItem(key, value) {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
    return Promise.resolve(value);
  },
  removeItem(key) {
    if (typeof window !== "undefined") window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};

const persistedUiReducer = persistReducer({ key: "ui", storage, whitelist: ["sidebarCollapsed", "direction"] }, uiReducer);
const rootReducer = combineReducers({ auth: authReducer, ui: persistedUiReducer });

export function createStore(preloadedState) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    devTools: process.env.NODE_ENV !== "production",
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE", "persist/PAUSE", "persist/PURGE", "persist/FLUSH", "persist/REGISTER"],
      },
    }),
  });
}
