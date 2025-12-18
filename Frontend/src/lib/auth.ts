"use server"



export const refreshToken = async (oldRefreshToken: string) => {
  try {
    const response = await fetch(`${process.env.Backend_URL}/auth/refreshToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: oldRefreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const { accessToken, refreshToken } = await response.json();

    return { accessToken, refreshToken };

  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};
