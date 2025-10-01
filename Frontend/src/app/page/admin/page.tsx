
"use client"
import AdminNavbar from "@/app/page/admin/components/admin-navbar"
import { AppSidebar } from "@/app/page/admin/components/Slider";


export default function AdminTestPage() {
 
    return (
        <div className="flex h-screen w-full">
          
            <div className="w-80">
                <AppSidebar />
            </div>
    
            <AdminNavbar />
        </div>
     
    );
}
