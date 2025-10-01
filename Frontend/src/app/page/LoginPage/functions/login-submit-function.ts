import axiosInstance from "@/app/utils/RefeshTokenHandler";
import { createSession } from "@/lib/session";
import { signInSchema } from "@/lib/zod";
import router from "next/router";
import { z } from "zod";

export async function onSubmit(values: z.infer<typeof signInSchema>) {

        const response = await axiosInstance.post('http://localhost:8000/auth/login', values);

        const Session = {
            user: response.data.user,
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token
        }

        await createSession(Session)

        router.push(process.env.HomePage_URL || '');

    }