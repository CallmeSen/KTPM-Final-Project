"use client";


import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {

    const [email, setEmail] = useState("");
    
    const router = useRouter();

    async function handleReset(e: React.FormEvent) {
        e.preventDefault();
        await fetch("http://localhost:8000/auth/ResetPassword", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        await localStorage.setItem("resetEmail", email);
        router.push("/page/postcode");
    }

    return (

        <div className="flex h-screen items-center justify-center bg-gray-100">

            <form onSubmit={handleReset} className="bg-white p-6 rounded-xl shadow-md w-80">

                <h2 className="text-xl font-bold mb-4 text-center">Reset Password</h2>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full mb-3 p-2 border rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <button type="submit" className="w-full bg-blue-950 text-white p-2 rounded cursor-pointer">
                    Reset Password
                </button>

            </form>

        </div>

    );
}
