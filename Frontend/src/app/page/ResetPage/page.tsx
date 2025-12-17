"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {

    const [email, setEmail] = useState("");
    const [newpassword, setNewPassword] = useState("");
    const [confirmpassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const savedEmail = localStorage.getItem("resetEmail");
        if (savedEmail) setEmail(savedEmail);
    }, []);

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault();
        setResult(null);

        if (!newpassword.trim() || !confirmpassword.trim()) {
            setResult({ error: "Please fill in all fields" });
            return;
        }

        if (newpassword !== confirmpassword) {
            setResult({ error: "Passwords do not match" });
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("http://localhost:8000/auth/changePassword", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, newpassword, confirmpassword }),
            });

            if (!res.ok) throw new Error("Failed to reset password");

            const data = await res.json();
            setResult(data);

            localStorage.removeItem("resetEmail");

            router.push("/page/LoginPage")


        } catch (err: any) {
            setResult({ error: err.message });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded-xl shadow-md w-[500px]">
                <h2 className="text-xl font-bold mb-4 text-center">Reset Password</h2>

                <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                    <input
                        type="password"
                        placeholder="New Password"
                        className="border p-2 rounded"
                        value={newpassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        className="border p-2 rounded"
                        value={confirmpassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-950 text-white px-4 py-2 rounded cursor-pointer"
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                {result && (
                    <div className="border rounded p-4 mt-4">
                        {result.error ? (
                            <p className="text-red-600">{result.error}</p>
                        ) : (
                            <p className="text-green-600">✅ {result.message}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
