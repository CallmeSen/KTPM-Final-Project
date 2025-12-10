import { RegisterSchema, signInSchema } from "@/lib/zod";
import { z } from "zod"

export type CartCount = {
  countCartItems: number;
};
  
export type NotificationCount = { countNotifications: number };

export type NotificationItem = {
  id: string;
  title: string;
  image?: string;
  message: string;
  createdAt: string;
};

export type NotificationData = {
  getNotifications: NotificationItem[];
};

export type NotificationVars = {
  userId: string;
};

export type Notificatio2132 = {
  userId: string;
};


export  type FormTypeLogin = z.infer<typeof signInSchema>

export  type FormTypeRegister = z.infer<typeof RegisterSchema>