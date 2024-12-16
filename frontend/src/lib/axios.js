import axios from 'axios'; //used to make HTTP requests

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === 'development' ? "http://localhost:5001/api" : "/api",
    withCredentials: true,
});

//The code creates a reusable Axios instance with a `baseURL` that switches between a local server (`http://localhost:5001/api`) in development and `/api` in production, determined by `import.meta.env.MODE`. The `withCredentials: true` option ensures credentials like cookies are sent with cross-origin requests.