// Centralized API base URL. Every page imports this instead of
// hardcoding "http://localhost:5001" — set VITE_API_URL in a .env file
// to point the app at a different backend (e.g. a deployed API) without
// touching any component code.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";