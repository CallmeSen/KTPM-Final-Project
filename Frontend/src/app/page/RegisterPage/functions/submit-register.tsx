import axiosInstance from "@/app/utils/RefeshTokenHandler";
import { RegisterSchema } from "@/lib/zod";
import router from "next/router";
import { z } from "zod";

export async function onSubmit(values: z.infer<typeof RegisterSchema>) {
    try {
        const response = await axiosInstance.post('http://localhost:8000/auth/sign-up', values);

        if (response.status === 201 || response.status === 200) {
            router.push(process.env.LoginPage_URL || '');

        }
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.message) {
            const errorMessage = error.response.data.message;
            
            console.error("Lỗi đăng ký:", errorMessage);
        }
    }
}