"use client";
import { useRouter } from "next/navigation";

export default function Navigation(url:string) {

    const router = useRouter();

    return router.push(url);

}
