// utils/imageUrl.js - Centralized image URL handling
import { API_BASE } from "../api.jsx";

/**
 * Convert any image URL to absolute production URL
 * Fixes localhost:5000 URLs to use production API base
 */
export function toImageUrl(url) {
  if (!url) return "";
  const s = String(url).trim();
  
  // Fix localhost URLs to use production API_BASE
  if (s.includes("localhost:5000")) {
    return s.replace(/http:\/\/localhost:5000/g, API_BASE);
  }
  if (s.includes("127.0.0.1:5000")) {
    return s.replace(/http:\/\/127\.0\.0\.1:5000/g, API_BASE);
  }
  
  // Already absolute URL
  if (s.startsWith("http://") || s.startsWith("https://")) {
    return s;
  }
  
  // Relative path - add API_BASE
  if (s.startsWith("/")) {
    return `${API_BASE}${s}`;
  }
  
  // Otherwise prepend API_BASE with slash
  return `${API_BASE}/${s}`;
}
