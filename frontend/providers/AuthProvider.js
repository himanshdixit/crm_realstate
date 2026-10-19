"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { sessionChecking, sessionCleared, sessionLoaded } from "@/redux/slices/authSlice";
import { authService } from "@/services/authService";

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  useEffect(() => {
    let active = true;
    dispatch(sessionChecking());
    if (!Cookies.get("crm_csrf")) {
      dispatch(sessionCleared());
      return () => { active = false; };
    }
    authService.currentUser()
      .then((session) => active && dispatch(sessionLoaded(session)))
      .catch(() => active && dispatch(sessionCleared()));
    return () => { active = false; };
  }, [dispatch]);
  return children;
}
