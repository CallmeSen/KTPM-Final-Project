"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Session } from "@/app/interfaces/session.interface";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Navbar from "@/app/page/HomePage/components/NavBar/page";

import { UPDATE_USER, GET_USER_BY_ID } from "@/app/graphQL/queries";
import { getSession } from "@/lib/session";
import { useMutation, useQuery } from "@apollo/client/react";

// ---------------- Validation Schema ----------------
const ProfileSchema = z.object({
    firstName: z.string().min(2, { message: "Tên phải có ít nhất 2 kí tự" }),
    lastName: z.string().min(2, { message: "Họ phải có ít nhất 2 kí tự" }),
    gender: z.enum(["male", "female"], { message: "Giới tính là bắt buộc" }),
    dateOfBirth: z.date({ required_error: "Ngày sinh là bắt buộc" }),
    email: z.string().email({ message: "Email không hợp lệ" }),
    address: z.string().optional(),
});

// ---------------- TypeScript Types ----------------
type UpdateUserResponse = {
    updateUser: {
        id: string;
        username: string;
        firstName: string;
        lastName: string;
        email: string;
        gender: string;
        dateOfBirth: string;
        address?: string;
    };
};

type UpdateUserInput = {
    input: {
        id: string;
        firstName: string;
        lastName: string;
        gender: string;
        dateOfBirth: string;
        email: string;
        address?: string;
    };
};

interface GetUserByIdResponse {
    getUserById: {
        id: string;
        firstName: string;
        lastName: string;
        gender: string;
        dateOfBirth: string;
        email: string;
        address?: string;
    };
}


export default function ProfilePage() {
    const [session, setSession] = useState<Session | null>(null);
    const userId = session?.user?.id;

    // --- Mutation + Query ---
    const [updateUser, { loading, error }] = useMutation<
        UpdateUserResponse,
        UpdateUserInput
    >(UPDATE_USER);

  const { data: userData, loading: userLoading } = useQuery<GetUserByIdResponse>(GET_USER_BY_ID, {
  variables: { id: userId },
  skip: !userId,
});


    const form = useForm<z.infer<typeof ProfileSchema>>({
        resolver: zodResolver(ProfileSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            gender: "male",
            dateOfBirth: new Date(),
            email: "",
            address: "",
        },
    });

    const minDate = useMemo(() => new Date("1900-01-01"), []);
    const maxDate = useMemo(() => new Date(), []);

    // --- Lấy session + load user ---
    useEffect(() => {
        (async () => {
            const session = await getSession();
            setSession(session);
        })();
    }, []);

    useEffect(() => {
        if (userData?.getUserById) {
            const u = userData.getUserById;
            form.reset({
                firstName: u.firstName || "",
                lastName: u.lastName || "",
                gender:'female',
                dateOfBirth: u.dateOfBirth ? new Date(u.dateOfBirth) : new Date(),
                email: u.email || "",
                address: u.address || "",
            });
        }
    }, [userData, form]);

    // --- Submit Form ---
    const onSubmit = async (values: z.infer<typeof ProfileSchema>) => {
        if (!userId) {
            alert("Không tìm thấy người dùng!");
            return;
        }

        try {
            const { data } = await updateUser({
                variables: {
                    input: {
                        id: userId,
                        firstName: values.firstName,
                        lastName: values.lastName,
                        gender: values.gender,
                        dateOfBirth: values.dateOfBirth.toISOString(),
                        email: values.email,
                        address: values.address,
                    },
                },
            });

            if (data?.updateUser) {
                alert("✅ Cập nhật thành công!");
                form.reset({
                    ...values,
                    dateOfBirth: new Date(values.dateOfBirth),
                });
            }
        } catch (err) {
            console.error("Update failed:", err);
            alert(" Cập nhật thất bại!");
        }
    };

    if (userLoading)
        return <p className="text-center mt-10 text-gray-500">Đang tải...</p>;

    return (
        <div className="bg-white min-h-screen">
            <Navbar session={session} />

            <div className="bg-white rounded-lg ml-6 mt-7 px-2">
                <h2 className="text-2xl text-customBlue mb-6">My Profile</h2>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-10">
                            {/* First Name + Last Name */}
                            <div className="flex gap-6">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem className="w-1/2">
                                            <FormLabel>First Name *</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="border-2 border-customBlue text-black" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem className="w-1/2">
                                            <FormLabel>Last Name *</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="border-2 border-customBlue text-black" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Date of Birth + Gender */}
                            <div className="flex gap-6">
                                <FormField
                                    control={form.control}
                                    name="dateOfBirth"
                                    render={({ field }) => (
                                        <FormItem className="w-1/2">
                                            <FormLabel>Date of Birth *</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant="outline" className="w-full justify-between">
                                                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                                                            <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => date > maxDate || date < minDate}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem className="w-1/2 ml-8">
                                            <FormLabel>Gender *</FormLabel>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex gap-6 mt-2"
                                            >
                                                <FormItem className="flex items-center space-x-2">
                                                    <FormControl>
                                                        <RadioGroupItem value="male" />
                                                    </FormControl>
                                                    <FormLabel>Male</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2">
                                                    <FormControl>
                                                        <RadioGroupItem value="female" />
                                                    </FormControl>
                                                    <FormLabel>Female</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Email + Address */}
                            <div className="flex gap-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="w-1/2">
                                            <FormLabel>Email *</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="border-2 border-customBlue text-black" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem className="w-1/2">
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="border-2 border-customBlue text-black" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="mt-6 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-800 text-white hover:bg-blue-900"
                                >
                                    {loading ? "Saving..." : "Save changes"}
                                </Button>
                            </div>

                            {error && <p className="text-red-500 mt-2">Error: {error.message}</p>}
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
