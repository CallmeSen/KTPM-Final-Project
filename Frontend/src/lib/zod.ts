import { z } from "zod";

export const signInSchema = z.object({

    username: z.string().min(2, {
        message: "Tên đăng nhập không đúng",
    }),
    password: z.string().optional(),

    email: z.string().email({
        message: "Địa chỉ email không hợp lệ",
    })
})


export const RegisterSchema = z.object({
    username: z.string().min(2, {
        message: "Tên đăng nhập phải có ít nhất 2 kí tự",
    }),
    password: z.string().min(5, {
        message: "Mật khẩu quá ngắn",
    }),

    confirmPassword: z.string(),

    email: z.string().email({
        message: "Địa chỉ email không hợp lệ",
    })
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu và xác nhận mật khẩu không trùng khớp",
    path: ["confirmPassword"],
});    