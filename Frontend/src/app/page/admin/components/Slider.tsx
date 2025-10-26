import { Home, Package, Users, ShoppingCart } from "lucide-react"
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
    {
        title: "Orders",
        url: "http://localhost:3000/page/admin/OrderManagement",
        icon: ShoppingCart,
    },
]

export function AppSidebar() {
    return (
        <Sidebar className="">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-3xl mt-12 flex justify-center">
                        <Image
                            src="/icon-shop.jpg"
                            alt="Shop Icon"
                            width={80}
                            height={80}
                            className="rounded-md object-cover"
                        />
                    </SidebarGroupLabel>
                    <SidebarGroupContent className="mt-10">
                        <SidebarMenu className="gap-4">
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url} className="flex items-center gap-3 hover:text-blue-600 transition-colors">
                                            <item.icon className="w-5 h-5" />
                                            <span className="text-sm font-medium">{item.title}</span>
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
