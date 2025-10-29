import axios from 'axios'; //used to make HTTP requests

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === 'development' ? "http://localhost:5001/api" : "/api",
    withCredentials: true,
    timeout: 120000,
});

