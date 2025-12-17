import axios from 'axios';


export const fetchUserData = async (accessToken: string, refreshToken: string) => {
    try {
        const response = await axios.get("http://localhost:8080/user/getUserById", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'x-refresh-token': refreshToken,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};