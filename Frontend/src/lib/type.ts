import { z } from "zod";

export type FormState = {
    error?:{
        name?: string;
        email?: string;
        password?: string;
    }
    message?: string;
} | undefined


export const SignupFormData = z.object({
    username: z.string().min(2),
    password: z.string().min(5),
    email: z.string().email()
  });

export const signInSchema = z.object({

    username: z.string().min(2, {
        message: "Tên đăng nhập không đúng",
    }),
    password: z.string().optional(),

    email: z.string().email({
        message: "Địa chỉ email không hợp lệ",
    })
})


export type Session = {
  user: {
    id: string;
    name: string | null;
    role : string;
  };
  accessToken: string;
  refreshToken: string;
};
