"use client";

import { useState } from "react";
import { GET_ALL_USERS } from "@/app/graphQL/queries";
import Image from "next/image";
import { AppSidebar } from "@/app/page/admin/components/Slider";
import AdminNavbar from "@/app/page/admin/components/admin-navbar";
import { useQuery } from "@apollo/client/react";

type User = {
    id: string;
    username: string;
    email: string;
    role: string;
    status: string; 
    avatarUrl?: string;
};

type UsersResponse = {
    getAllUsers: {
        users: User[];
        total: number;
        page: number;
        limit: number;
    };
};

export default function UsersPage() {

    const [page, setPage] = useState(1);

    const limit = 5;

    const { data, loading, error } = useQuery<UsersResponse>(GET_ALL_USERS, {
        variables: { page, limit },
    });

    if (loading) return <p className="p-6">Loading...</p>;

    if (error) return <p className="p-6 text-red-600">Error: {error.message}</p>;

    const { users = [], total } = data?.getAllUsers ?? { users: [], total: 0 };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="p-6 flex w-full">
           
            <div className="w-64">
                <AppSidebar />
            </div>

            
            <div className="flex-1 w-full">
                <div className="h-14 border-b">
                    <AdminNavbar />
                </div>

                <h1 className="text-2xl font-bold mb-4">Customers</h1>

                <div className="overflow-x-auto rounded-xl shadow bg-white">

                    <table className="w-full border-collapse">
                        
                        <thead>
                            
                            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">

                                <th className="p-3">Avatar</th>

                                <th className="p-3">UserId</th>

                                <th className="p-3">Email</th>

                                <th className="p-3">Role</th>

                                <th className="p-3">Status</th>

                            </tr>

                        </thead>

                        <tbody>

                            {users.map((user :any) => (
                                <tr
                                    key={user.id}
                                    className="border-b hover:bg-gray-50 text-sm"
                                >
                                    <td className="p-3">
                                        <Image
                                            src="/default-avatar.webp"
                                            alt={user.username}
                                            width={40}
                                            height={40}
                                            className="rounded-full object-cover"
                                        />
                                    </td>
                                    <td className="p-3">{user.username}</td>
                                    <td className="p-3">{user.email}</td>
                                    <td className="p-3">{user.role}</td>
                                    <td className="p-3">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${user.status === "Active"
                                                    ? "bg-green-100 text-green-600"
                                                    : "bg-red-100 text-red-600"
                                                }`}
                                        >
                                            {user.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}

                        </tbody>

                    </table>

                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">

                    <span className="text-sm border-1 border-gray-300 p-2">
                       {page} / {totalPages}
                    </span>


                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage((prev) => prev + 1)}
                        className="px-4 py-2 text-gray-200 rounded border-gray-400 border-1 cursor-pointer"
                    >

                        <span className="text-black"> 
                            next
                        </span>

                    </button>
                </div>

            </div>

        </div>
    );
}
