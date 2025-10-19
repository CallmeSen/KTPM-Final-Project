'use client'

import axiosInstance from "@/app/utils/RefeshTokenHandler";
import { createSession } from "@/lib/session";
import { signInSchema } from "@/lib/zod";
import { z } from "zod";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export async function onSubmit(values: z.infer<typeof signInSchema>, router: AppRouterInstance) {
    try {
        const response = await axiosInstance.post('http://localhost:8000/auth/Login', values);

        const Session = {
            user: response.data.user,
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
        };

        await createSession(Session);

         router.push('/page/HomePage');


    } catch (error: any) {
        console.error(" Login failed:", error?.response?.data || error.message);
        alert(error?.response?.data?.message || "Login failed!");
    }
}
