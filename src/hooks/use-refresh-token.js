import useAuth from './use-auth';
import axios from '../api/axios';

export default function useRefreshToken() {
    const { auth, setAuth } = useAuth();

    const refresh = async () => {
        const response = await axios.post('/auth/refresh-token', {
            refreshToken: auth.refreshToken
        });

        const { accessToken, refreshToken } = response.data.data;
        setAuth(prev => {
            return {
                ...prev,
                accessToken,
                refreshToken
            }
        });
        return accessToken;
    }

    return refresh;
}
