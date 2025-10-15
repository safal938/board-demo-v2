// API Configuration
// In production (Vercel), use relative paths to /api
// In development, use localhost:3001 or proxy
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 
  (process.env.NODE_ENV === "production" ? "" : "");

export const API_ENDPOINTS = {
  BOARD_ITEMS: `${API_BASE_URL}/api/board-items`,
  TODOS: `${API_BASE_URL}/api/todos`,
  AGENTS: `${API_BASE_URL}/api/agents`,
  LAB_RESULTS: `${API_BASE_URL}/api/lab-results`,
  FOCUS: `${API_BASE_URL}/api/focus`,
  EVENTS: `${API_BASE_URL}/api/events`,
  HEALTH: `${API_BASE_URL}/api/health`,
};
