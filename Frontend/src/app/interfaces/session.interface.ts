export type Session = {
  user: {
    id: string;
    name: string | null;
    role : string;
  };
  accessToken: string;
  refreshToken: string;
};
