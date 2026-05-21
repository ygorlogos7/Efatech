import { auth } from "./auth";
import { enforceIpRateLimit, shouldRateLimitApi } from "@/lib/ratelimit";

export default auth(async (request) => {
  // 1. Rate limit global nas rotas /api (login, esqueci senha, etc.)
  if (shouldRateLimitApi(request.nextUrl.pathname)) {
    const rateLimitResponse = await enforceIpRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;
  }

  // 2. Proteção de rotas: auth.config.ts → callback `authorized`
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|.*\\.png$).*)"],
};
