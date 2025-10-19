import { Session } from '@/app/interfaces/session.interface';

/**
 * Client-side function to fetch session from API route
 * Use this in Client Components instead of the server-side getSession()
 */
export async function fetchSessionClient(): Promise<Session | null> {
  try {
    const response = await fetch('/api/session', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const session = await response.json();
    return session;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}
