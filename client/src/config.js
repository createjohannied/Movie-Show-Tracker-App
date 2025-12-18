// API configuration - automatically switches between dev and production
export const API_BASE_URL = import.meta.env.PROD
  ? 'https://movie-show-tracker-app.onrender.com' // Production URL
  : 'http://localhost:4000'; // Development URL

