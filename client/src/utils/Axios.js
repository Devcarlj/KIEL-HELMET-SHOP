import axios from "axios";
import SummaryApi, { baseURL } from "../common/SummaryApi.js";

const Axios = axios.create({
    baseURL: baseURL,
    withCredentials: true
});

// 1. Request Interceptor: Attach Access Token
Axios.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 2. Response Interceptor: Handle Token Refresh
Axios.interceptors.response.use(
    (response) => response, // Return response if successful
    async (error) => {
        const originalRequest = error.config;

        // Check for 401 Unauthorized and ensure we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Use _retry to avoid infinite loops

            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                const newAccessToken = await refreshAccessToken(refreshToken);

                if (newAccessToken) {
                    // Update header and retry the original failed request
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return Axios(originalRequest);
                }
            }
        }
        return Promise.reject(error);
    }
);

// 3. Helper Function to get a New Token
const refreshAccessToken = async (refreshToken) => {
    try {
        const response = await axios({
            method: SummaryApi.refreshToken.method, // Forces 'post'
            url: baseURL + SummaryApi.refreshToken.url, // Ensures absolute path
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${refreshToken}`
            }
        });

        const accessToken = response.data.data.accessToken;
        localStorage.setItem('accessToken', accessToken); // Fixed: setItem instead of getItem
        return accessToken;
    } catch (error) {
        console.error("Token refresh failed", error);
        localStorage.clear();
        window.location.href = "/login"; // Force re-login if refresh fails
        return null;
    }
};

export default Axios;