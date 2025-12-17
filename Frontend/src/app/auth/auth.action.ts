"use server"

import { signIn, signOut } from "next-auth/react";


export async function handeCredentialsSignin({ password, username, email, }:{
    username?: string
    password?:string
    email?: string
}){
    try {
        const result = await signIn("credentials", {
            username,
            password,
            redirect: false, 
        });

        return result;
    } catch (error) {
        console.error("Error during sign-in:", error);
        throw error;
    }
}

export async function handleSignOut(){
    await signOut()
}