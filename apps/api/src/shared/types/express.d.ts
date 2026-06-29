// Extiende Express.Request con el contexto de autenticación poblado por
// el middleware `authenticate`.
import { type AuthContext } from "../security/jwt";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export {};
