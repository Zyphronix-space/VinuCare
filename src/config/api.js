// Every backend fetch call in the app goes through this constant. Local
// dev falls back to localhost:5000; set VITE_API_BASE_URL in .env once
// this is deployed so the frontend stops trying to reach a backend that
// only exists on the developer's own machine.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
