import axiosInstance from "@/app/utils/RefeshTokenHandler";
import { AccessStored } from "@/app/utils/TokenStore";


export const Logout = {
    async logout(access :string) {
        try {
            
            console.log(access)

            const response = await axiosInstance.post('http://localhost:8080/blacklist/logout', {
                accesstoken: access
            });

             
            console.log(response)
            
            AccessStored.clear();

        } catch (error) {
            console.error('Logout failed:', error);
        }
    }
};
