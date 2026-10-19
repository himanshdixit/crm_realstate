import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: { sidebarCollapsed: false, mobileNavigationOpen: false, direction: "ltr" },
  reducers: {
    toggleSidebar(state) { state.sidebarCollapsed = !state.sidebarCollapsed; },
    setMobileNavigation(state, { payload }) { state.mobileNavigationOpen = payload; },
    setDirection(state, { payload }) { state.direction = payload === "rtl" ? "rtl" : "ltr"; },
  },
});

export const { toggleSidebar, setMobileNavigation, setDirection } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
