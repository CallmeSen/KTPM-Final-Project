<<<<<<< Updated upstream
import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}
=======
import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}
>>>>>>> Stashed changes
