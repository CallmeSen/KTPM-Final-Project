'use client'

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@radix-ui/react-navigation-menu";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";
import Image from "next/image";
import { FaBell } from "react-icons/fa";
import { FaRobot } from "react-icons/fa6";
import { useQuery } from "@apollo/client/react";
import { COUNT_CART_ITEMS, COUNT_NOTIFICATIONS, GET_NOTIFICATIONS } from "@/app/graphQL/queries";
import { Session } from "@/lib/type";
import { useEffect, useRef, useState } from "react";
import { CartCount, NotificationCount, NotificationData } from "@/app/types/types";
import { logout } from "@/app/page/HomePage/functions/functions";

export default function Navbar({ session }: { session: Session | null }) {

  console.log(session)

  const router = useRouter();
  const bellRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: cartData } = useQuery<CartCount>(COUNT_CART_ITEMS, {
    variables: { userId: session?.user.id },
  });

  const { data: notificationData } = useQuery<NotificationCount>(COUNT_NOTIFICATIONS, {
    variables: { userId: session?.user.id },
    skip: !session,
  });

  const { data: notificationsData } = useQuery<NotificationData>(GET_NOTIFICATIONS, {
    variables: { userId: session?.user.id },
    skip: !session,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = notificationsData?.getNotifications || [];
  const cartCount = cartData?.countCartItems || 0;
  const notificationCount = notificationData?.countNotifications ?? 0;

  return (
    <nav className="bg-[#2F70AF] backdrop-blur-md text-white font-bold text-base relative z-50 p-4">
      <NavigationMenu>
        <div className="flex justify-between px-4 mx-auto whitespace-nowrap items-center">

          <div className="flex items-center space-x-5">
            <NavigationMenuList className="flex space-x-6 ">
              <NavigationMenuItem>
                <Link href="/page/BookLibrary" passHref>
                  <NavigationMenuTrigger className="flex items-center text-white hover:underline hover:text-white cursor-pointer">
                    Libraries
                  </NavigationMenuTrigger>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </div>

          {session ? (
            <div className="flex items-center gap-6 mx-5" ref={bellRef}>
              <button
                className="hover:bg-[#FB635D] p-2 rounded-full relative"
                onClick={() => setIsOpen(!isOpen)}
              >
                <FaBell size={22} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full px-1">
                    {notificationCount}
                  </span>
                )}

                {isOpen && notificationCount > 0 && (
                  <div className="absolute right-0 mt-3 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
                      <span className="font-semibold text-[#FB635D]">Notifications</span>
                      <Link
                        href="/page/NotificationPage"
                        className="text-[#173F5F] text-sm font-medium hover:underline"
                      >
                        Mark all as read
                      </Link>
                    </div>

                    <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                      {notifications.map((note: any, index: number) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex-1">
                            <span className="block font-semibold text-[#173F5F] break-words whitespace-normal">
                              {note.title}
                            </span>

                            <Link
                              href={{
                                pathname: "/page/NotificationPage",
                                query: { notification: JSON.stringify(note) },
                              }}
                              className="text-[#173F5F] text-sm font-medium hover:underline mt-2 inline-block"
                            >
                              View details
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </button>

              <button
                className="hover:bg-[#FB635D] p-2 rounded-full"
                onClick={() => window.open("http://127.0.0.1:7861", "_blank")}
              >
                <FaRobot size={22} />
              </button>

              <button
                className="hover:bg-[#FB635D] p-2 rounded-full relative"
                onClick={() => router.push("/page/CartPage")}
              >
                <FaShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-xs rounded-full px-1">
                    {cartCount}
                  </span>
                )}
              </button>

              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>
                      <Image
                        src="/avatar.svg"
                        alt="Avatar"
                        width={40}
                        height={40}
                        className="rounded-full cursor-pointer"
                      />
                    </NavigationMenuTrigger>

                    <NavigationMenuContent className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-[#f7f7f7] text-black shadow-lg p-3 min-w-max">

                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-[#f7f7f7]"></div>
                      
                      <ul className="space-y-2 ">
                        <li>
                          <Link href="/pages/profile" passHref className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
                            <p className="hover:text-[#FB635D] cursor-pointer">Profile</p>
                          </Link>
                        </li>
                        <li>
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                            onClick={() => {
                              logout(session.accessToken)
                              router.push("/page/LoginPage");
                            }}
                          >
                            <p className="hover:text-[#FB635D] cursor-pointer">Logout</p>
                          </button>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href={process.env.LoginPage_URL || "/page/LoginPage"}
                className="text-white hover:underline"
              >
                Login
              </Link>

              <Link
                href={process.env.RegisterPage_URL || "/page/RegisterPage"}
                className="text-white hover:underline"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </NavigationMenu>
    </nav>
  );
}
