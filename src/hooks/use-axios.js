import axios from "../api/axios";
import { useEffect } from "react";
import useRefreshToken from "./use-refresh-token";
import useAuth from "./use-auth";
import { useNavigate } from "react-router-dom";

export default function useAxios() {
    const refresh = useRefreshToken();
    const { auth, logout, setNewToken } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {

        const requestIntercept = axios.interceptors.request.use(config => {
            const exceptedRoutes = [
                '/auth/login',
                '/auth/register',
                '/auth/forgot-password',
                '/auth/refresh-token',
            ];

            const isPublic = exceptedRoutes.some(route =>
                config.url?.endsWith(route)
            );

            if (isPublic) {
                delete config.headers['Authorization'];
                return config;
            }

            if (!config.headers['Authorization']) {
                config.headers['Authorization'] = `Bearer ${auth?.accessToken}`;
            }
            return config;
        }, (error) => Promise.reject(error));

        const responseIntercept = axios.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;
                if (prevRequest.url?.includes('/refresh')) {
                    logout();
                    navigate('/login');
                    return Promise.reject(error);
                }
                if (error?.response?.status === 401) {
                    prevRequest.sent = true;
                    const newAccessToken = await refresh();
                    // Verify token exists before retrying
                    if (!newAccessToken) {
                        logout();
                        navigate('/login');
                        return Promise.reject(error);
                    }
                    setNewToken(newAccessToken);
                    prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return axios(prevRequest);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestIntercept);
            axios.interceptors.response.eject(responseIntercept);
        }
    }, []);

    return axios;
}