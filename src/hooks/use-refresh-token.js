import useAuth from './use-auth';
import axios from '../api/axios';

export default function useRefreshToken() {
    const { auth, login } = useAuth();

    const refresh = async () => {
        const response = await axios.post('/auth/refresh-token');

        const { accessToken, refreshToken } = response.data.data;
        return accessToken;
    }

    return refresh;
}
