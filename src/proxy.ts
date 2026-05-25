import { auth } from "./auth";
import { enforceIpRateLimit, shouldRateLimitApi } from "@/lib/ratelimit";
import {
  csrfOriginForbiddenResponse,
  shouldEnforceCsrfOrigin,
  validateRequestOrigin,
} from "@/lib/csrf-origin";

export default auth(async (request) => {
  const { pathname } = request.nextUrl;

  if (shouldEnforceCsrfOrigin(request.method, pathname)) {
    if (!validateRequestOrigin(request)) {
      return csrfOriginForbiddenResponse();
    }
  }

  if (shouldRateLimitApi(pathname)) {
    const rateLimitResponse = await enforceIpRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|.*\\.png$).*)"],
};
