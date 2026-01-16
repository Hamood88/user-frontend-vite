import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import SplitAuthPage from "./pages/SplitAuthPage";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplitAuthPage />} />
        <Route path="/auth" element={<SplitAuthPage />} />
        <Route path="/dashboard/*" element={<App />} />
        <Route path="/*" element={<SplitAuthPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
