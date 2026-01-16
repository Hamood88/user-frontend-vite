import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

function getUserTokenOnly() {
  try {
    return localStorage.getItem("userToken") || localStorage.getItem("token") || "";
  } catch {
    return "";
  }
}

export default function ProtectedRoute() {
  const location = useLocation();
  const token = getUserTokenOnly();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
