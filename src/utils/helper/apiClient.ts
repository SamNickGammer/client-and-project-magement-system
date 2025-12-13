import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { ApiConfig } from "../frontend/apiConfig/auth";

// Create Axios instance
const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL || "", // Ensure you have this env var or default to empty for relative paths
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // You can add auth tokens here if needed
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        // standardized error handling
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("API Error Response:", error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error("API Error Request:", error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("API Error Message:", error.message);
        }
        return Promise.reject(error);
    }
);

// Generic API Call Function interface
interface ApiCallParams<TData = unknown> {
    config: ApiConfig;
    data?: TData;
    params?: unknown; // query parameters
    customHeaders?: Record<string, string>;
}

export const makeApiCall = async <TResponse = unknown, TData = unknown>({
    config,
    data,
    params,
    customHeaders,
}: ApiCallParams<TData>): Promise<TResponse> => {
    const { method, endPoint } = config;

    const axiosConfig: AxiosRequestConfig = {
        method,
        url: endPoint,
        data,
        params,
        headers: customHeaders,
    };

    try {
        const response = await axiosInstance(axiosConfig);
        return response.data;
    } catch (error: unknown) {
        // Re-throwing the error to be handled by the component
        // You can also normalize the error here if you want a specific structure
        if (axios.isAxiosError(error) && error.response?.data) {
            throw error.response.data; // Throwing the backend error object
        }
        throw error;
    }
};
