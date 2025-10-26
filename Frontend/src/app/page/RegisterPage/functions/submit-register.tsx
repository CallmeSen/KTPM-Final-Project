"use client";

import axiosInstance from "@/app/utils/RefeshTokenHandler";
import { RegisterSchema } from "@/lib/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import axios from "axios";

export function useRegisterHandler() {
    
    const router = useRouter();

    const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
        try {
            const response = await axios.post('http://localhost:8000/auth/SignUp', values);

            alert("đăng ký thành công")

            router.push("/page/LoginPage");     
            
        } catch (error: any) {
            if (error.response?.data?.message) {
                toast.error(`Lỗi: ${error.response.data.message}`);
            }
        }
    };

    return { onSubmit };
}
