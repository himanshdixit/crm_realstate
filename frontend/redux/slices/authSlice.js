import { createSlice } from "@reduxjs/toolkit";

const initialState = { user: null, permissions: [], status: "idle" };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionLoaded(state, { payload }) {
      state.user = payload.user;
      state.permissions = payload.permissions || [];
      state.status = "authenticated";
    },
    sessionCleared() {
      return { ...initialState, status: "anonymous" };
    },
    sessionChecking(state) {
      state.status = "checking";
    },
  },
});

export const { sessionLoaded, sessionCleared, sessionChecking } = authSlice.actions;
export const authReducer = authSlice.reducer;
