import React from "react";
import { Navigate } from "react-router-dom";
import SplitAuthPage from "./SplitAuthPage";

function getUserTokenOnly() {
  try {
    return localStorage.getItem("userToken") || localStorage.getItem("token") || "";
  } catch {
    return "";
  }
}

export default function LoginPage() {
  // If user is already logged in, redirect to feed/dashboard
  const token = getUserTokenOnly();
  if (token) {
    return <Navigate to="/feed" replace />;
  }
  
  return <SplitAuthPage />;
}
