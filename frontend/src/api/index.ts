import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import useAuthStore from '../store/AuthStore';


const instance = axios.create({
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) : InternalAxiosRequestConfig => {
        return config;
    },
    (error: AxiosError): Promise<AxiosError> => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => response,
    (error: AxiosError): Promise<AxiosError> => {
        if (error.response && error.response.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);