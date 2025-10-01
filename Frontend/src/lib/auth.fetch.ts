import { refreshToken } from "@/lib/auth";
import { getSession } from "@/lib/session";

export const authFreshToken = async (
    url: string | URL,
    options: RequestInit = {}
  ) => {
    const session = await getSession();
  
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
      Authorization: `Bearer ${session?.accessToken}`,
    };
  
    options.headers = headers;
  
    let response = await fetch(url, options);
  
    if (response.status === 401) {

      if (!session?.refreshToken) {
       rediect('/pages/RegisterPage')
      }
  
      const newAccessToken = await refreshToken(session!.refreshToken);

      if (newAccessToken) {
        headers.Authorization = `Bearer ${newAccessToken}`;
        options.headers = headers;
        response = await fetch(url, options);
      }
    }
  
    return response;
  };

function rediect(arg0: string) {
  throw new Error("Function not implemented.");
}
  