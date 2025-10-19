"use client";

import { useEffect, useState } from "react";

export default function PostcodePage() {
    
    const [email, setEmail] = useState("");

    const [postcode, setPostcode] = useState("");

    const [loading, setLoading] = useState(false);

    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        const savedEmail = localStorage.getItem("resetEmail");
        if (savedEmail) setEmail(savedEmail);
    }, []);

    async function handleLookup(e: React.FormEvent) {
        e.preventDefault();
        if (!postcode.trim()) return;

        setLoading(true);
        setResult(null);

        try {
            const res = await fetch("http://localhost:8000/auth/checkPostcode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, postcode }),
            });

            console.log(res)

            if (!res.ok) throw new Error("Invalid or expired OTP");

            const data = await res.json();
            setResult(data);
        } catch (err: any) {
            setResult({ error: err.message });
        } finally {
            setLoading(false);
        }
    }

    return (

        <div className="flex h-screen items-center justify-center bg-gray-100">

            <div className="bg-white p-6 rounded-xl shadow-md w-[500px]">

                <h2 className="text-xl font-bold mb-4 text-center">Please input your Postcode</h2>

                <form onSubmit={handleLookup} className="flex gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Enter US postcode"
                        className="flex-1 border p-2 rounded"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-950 text-white px-4 py-2 rounded cursor-pointer"
                    >
                        {loading ? "Searching..." : "Send"}
                    </button>
                </form>

                {result && (
                    <div className="border rounded p-4">
                        {result.error ? (
                            <p className="text-red-600">{result.error}</p>
                        ) : (
                            <p className="text-green-600">✅ Postcode valid for {email}</p>
                        )}
                    </div>
                )}
            </div>

        </div>

    );
}
