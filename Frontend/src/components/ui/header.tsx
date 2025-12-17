import { ModeToggle } from "@/components/ui/modetoggle";
import Link from "next/link";

export default function Headers() {
   return (
    <div>
        <ul>
            <li>
                <Link href="/login">Đăng nhập</Link>
            </li>

            <li>
               <Link href="/register">Đăng ký</Link>
            </li>

            <li>
                <ModeToggle />
            </li>
        </ul>
    </div>
   )
}