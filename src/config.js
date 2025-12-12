// src/config.js

export const BASE_URL = import.meta.env.VITE_BASE_URL;

// --- FIX: We are hardcoding this to prevent the double /api/api error ---
// The correct URL is just the domain, WITHOUT /api at the end.
export const API_BASE_URL = "https://backend1-cube.onrender.com";

// OLD LINE (Commented out because it was causing issues):
// export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;