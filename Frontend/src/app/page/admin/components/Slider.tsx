import { Home, Package, Users } from "lucide-react"
import Image from "next/image";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
    {
        title: "Dashboard",
        url: "http://localhost:3000/page/admin/dashboard",
        icon: Home,
    },
    {
        title: "Products",
        url: "http://localhost:3000/page/admin/products",
        icon: Package,
    },
    {
        title: "Customers",
        url: "http://localhost:3000/page/admin/customers",
        icon: Users,
    },
]

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-3xl mt-12">
                        <Image
                            src={"/icon-shop.jpg"}
                            alt={"icon"}
                            width={100}
                            height={100}
                            className="rounded-md object-cover"
                        />
                    </SidebarGroupLabel>
                    <SidebarGroupContent className="mt-13">
                        <SidebarMenu className="gap-6">
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url} className="flex items-center gap-2">
                                            <item.icon className="w-5 h-5" />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
