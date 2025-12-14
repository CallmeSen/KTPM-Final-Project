    "use client";

    import { deleteSession } from "@/lib/session";

    export async function logout(accessToken: string) {
        try {
            const res = await fetch(`http://localhost:8000/auth/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ accessToken }),
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Logou");
            }
            
            await deleteSession();

            return true;
            
        } catch (error) {
            console.error("Error during logout:", error);
            return false;
        }
    }
