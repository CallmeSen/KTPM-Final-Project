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
import { RegisterSchema } from "@/lib/zod"
import 'react-toastify/dist/ReactToastify.css';
import { onSubmit } from "@/app/page/RegisterPage/functions/submit-register"
import { FormTypeRegister } from "@/app/types/types"
import Link from "next/link"

export function RegisterForm() {

    const form = useForm<FormTypeRegister>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            username: "",
            password: "",
            confirmPassword: "",
            email: "",
        },
        mode: "onSubmit",
        disabled: false,
        reValidateMode: "onSubmit",
        delayError: 0,
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-shrink-0 w-[600px] border-2 border-gray-300 rounded-lg p-6 bg-white ">
                <div className="flex justify-center">
                    <span className="text-[#294563] justify-center text-4xl font-sans">Create Account</span>
                </div>

                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold text-[#2c639e] p-2">Username</FormLabel>
                            <FormControl>
                                <Input className="text-black" placeholder="Enter your username" autoComplete="off" {...field} />
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
                            <FormLabel className="font-bold text-[#2c639e] p-2">Password</FormLabel>
                            <FormControl>
                                <Input className="text-black" placeholder="Enter your password" type="password" autoComplete="off" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold text-[#2c639e] p-2">Confirm Password</FormLabel>
                            <FormControl>
                                <Input className="text-black" placeholder="Re-enter your password" type="password" autoComplete="off" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold text-[#2c639e] p-2">Email</FormLabel>
                            <FormControl>
                                <Input
                                    className="text-black"
                                    placeholder="Enter your email"
                                    autoComplete="off"
                                    {...field}
                                />
                            </FormControl>
                            {form.formState.errors.email && (
                                <FormMessage>
                                    {form.formState.errors.email.message}
                                </FormMessage>
                            )}
                        </FormItem>
                    )}
                />

                <Button
                    className="!mt-5 w-full bg-[#2F70AF] text-white hover:bg-customBlue hover:text-customMintBlue hover:shadow-none hover:brightness-100 cursor-pointer"
                    type="submit"
                >
                    Register
                </Button>

                <div className="flex items-center">
                    <div className="flex-1 bg-customebrightBlue w-full h-[0.25px] rounded-sm"></div>
                    <span className="text-xl text-[#2F70AF] font-bold">Or</span>
                    <div className="flex-1 bg-customebrightBlue w-full h-[0.25px] rounded-sm"></div>
                </div>

                <div className="flex items-center justify-center gap-8 ">
                    <Button onClick={() => {
                        window.location.href = 'http://localhost:8000/auth/google/login';
                    }}
                        className="bg-[#df4930] rounded-sm p-5 text-white hover:bg-[#df4930] hover:shadow-none w-[450px] cursor-pointer">
                        Sign in with Google
                    </Button>
                </div>

                <div className="flex justify-center">
                    <span className="text-[#294563]">Already have an account? </span>
                    <Link href="/page/LoginPage" className="ml-1">
                        <span className="text-[#294563] font-serif">Sign in</span>
                    </Link>
                </div>
            </form>
        </Form>
    );
}
