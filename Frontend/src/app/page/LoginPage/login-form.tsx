"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { signInSchema } from "@/lib/type"
import { FormTypeLogin } from "@/app/types/types"
import { onSubmit } from "@/app/page/LoginPage/functions/login-submit-function"
import { useRouter } from "next/navigation"
import { z } from "zod"


export function LoginForm() {

    const router = useRouter();


    const form = useForm<FormTypeLogin>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            password: "",
            email: "",
        },
        mode: "onSubmit",
        disabled: false,
        reValidateMode: "onSubmit",
        delayError: 0,
    })

    const handleLogin = async (values: z.infer<typeof signInSchema>) => {
        console.log("🔹 Form submitted:", values);
        return await onSubmit(values, router);
    };


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6 flex-shrink-0 w-[600px] border-gray-300 rounded-lg p-6 bg-white border-2">
                <div className="flex justify-center">
                    <span className="text-[#294563] justify-center text-3xl font-sans">Login</span>
                </div>


                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold text-[#294563] p-2">Email</FormLabel>
                            <FormControl>
                                <Input className="text-black" placeholder="Enter your email" autoComplete="off" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold text-[#294563] p-2">Password</FormLabel>
                            <FormControl>
                                <Input className="text-black" placeholder="Enter your password" type="password" autoComplete="off"  {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />


                <Button className="!mt-5 w-full bg-[#2F70AF] text-white hover:bg-customBlue hover:shadow-none cursor-pointer" type="submit">
                    Login
                </Button>

                <div className="mt-3">
                    <Link href="/ielts-prep/preparation-tips" className="">
                        <span className="text-[#294563]">Forgot password?</span>
                    </Link>
                </div>

                <div className="flex items-center">
                    <div className="flex-1 bg-customebrightBlue w-full h-[0.25px] rounded-sm"></div>
                    <span className="text-xl text-[#294563] font-bold">Or</span>
                    <div className="flex-1 bg-customebrightBlue w-full h-[0.25px] rounded-sm"></div>
                </div>

                <div className="flex items-center justify-center gap-8 ">
                    <Button onClick={() => {
                        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
                        console.log(backendUrl);
                        window.location.href = `${backendUrl}/auth/google/login`;
                    }}
                        className="bg-[#df4930] rounded-sm p-5 text-white hover:bg-[#df4930] hover:shadow-none w-[450px] point-cursor cursor-pointer">
                        Login with Google
                    </Button>
                </div>

                <div className="flex justify-center">
                    <span className="text-[#294563]">Don’t have an account? </span>
                    <Link href="/page/RegisterPage" className="ml-1">
                        <span className="text-[#294563] font-serif">Sign up now!</span>
                    </Link>
                </div>
            </form>
        </Form>
    );
}
