"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        const res = await fetch("http://localhost:8000/auth/admin-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
            router.push("dashboard");
        } else {
            alert("Login failed!");
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100 w-full">
            <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl shadow-md w-80">
                <h2 className="text-xl font-bold mb-4 text-center">Admin Login</h2>
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full mb-3 p-2 border rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full mb-3 p-2 border rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded" >
                    Login
                </button>
                <p
                    onClick={() => router.push("/admin/reset-password")}
                    className="text-sm text-blue-500 mt-3 cursor-pointer text-center"
                >
                    Forgot password?
                </p>
            </form>
        </div>
    );
}
