import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createDevSession, devLoginEnabled } from "@icebreaker/auth";

export const runtime = "edge";

/**
 * Local dev only (AUTH_DEV_LOGIN=true): signs in as dev@example.com
 * without Google by setting the same session cookie Auth.js would.
 */
export const GET = async (req: NextRequest) => {
  if (!devLoginEnabled) {
    return new NextResponse(null, { status: 404 });
  }

  const session = await createDevSession();
  if (!session) {
    return NextResponse.redirect(
      new URL("/sign-in?error=AccessDenied", req.url),
    );
  }

  const callbackUrl = req.nextUrl.searchParams.get("callbackUrl") ?? "/";
  const secure = req.nextUrl.protocol === "https:";
  const response = NextResponse.redirect(new URL(callbackUrl, req.url));
  response.cookies.set({
    name: `${secure ? "__Secure-" : ""}authjs.session-token`,
    value: session.sessionToken,
    expires: session.expires,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
  });
  return response;
};
