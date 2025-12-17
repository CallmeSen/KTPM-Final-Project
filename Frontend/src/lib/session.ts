"use server"

import { Session } from '@/lib/type';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from "next/headers";
import { redirect } from "next/navigation"; 


const secretKey = process.env.SessionKey;

if (!secretKey) {
  throw new Error("SessionKey is not defined in environment variables.");
}

const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(payload: Session) {
  
  const expireAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

  const session = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expireAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(): Promise<Session | null> {

  const cookie = (await cookies()).get("session")?.value;

  if (!cookie) return null;

  try {
    const { payload } = await jwtVerify(cookie, encodedKey, {
      algorithms: ["HS256"],
    });

    return payload as Session;

  } catch (error) {
    console.error("Error verifying session:", error);
    redirect("/login");
  }
}

export async function updateSession(update: Partial<Session["user"]>) {

  const cookie = (await cookies()).get("session")?.value;
  if (!cookie) return;

  const { payload } = await jwtVerify<Session>(cookie, encodedKey);

  const newSession: Session = {
    user: {
      ...payload.user,
      ...update,
    },
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  };

  await createSession(newSession);
}

export async function deleteSession() {
  (await cookies()).delete("session");
}


export async function updateToken({
  accessToken,
  refreshToken
}:{
  accessToken:string,
  refreshToken:string
}){
  const cookie = (await cookies()).get("session")?.value;

  if(!cookie) return null;

  const {payload} = await jwtVerify<Session>(cookie,encodedKey)

  if(!payload) throw new Error("Session is not found")

  const newPayload: Session = {
    user:{
      ...payload.user
    },
    accessToken,
    refreshToken,
  }

  await createSession(newPayload)

}