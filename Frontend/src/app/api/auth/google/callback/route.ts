import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {

  const { searchParams } = new URL(req.url);

  const accessToken = searchParams.get("accessToken");
  let refreshToken = searchParams.get("refreshToken");
  const userId = searchParams.get("userId");
  const name = searchParams.get("name");
  const Role = searchParams.get("role")

  if (!accessToken || !userId || !name || !Role) {
    console.log(accessToken,refreshToken,userId,name,Role)
    return new Response("Missing parameters", { status: 400 });
  }

  if(!refreshToken) refreshToken="key";

  await createSession({
    user: {
      id: userId,
      name: name,
      role: Role
    },
    accessToken,
    refreshToken,
  });

  return redirect("/page/HomePage"); 
}
