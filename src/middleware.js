import { NextResponse } from "next/server";
import * as jose from "jose";

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const url = req.nextUrl.pathname;

  // if(url==="/"){
  //   return NextResponse.redirect(new URL("/vis",req.url))
  // }
  if (url.startsWith("/login") || url.startsWith("/superadmin/login") || url.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (!token) {
    if (url.startsWith("/superadmin")) {
      return NextResponse.redirect(new URL("/vis/superadmin/login", req.url));
    } else {
      return NextResponse.redirect(new URL("/vis/login", req.url));
    }
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    if (url.startsWith("/superadmin") && payload.role !== "superadmin") {
      return NextResponse.redirect(new URL("/vis/superadmin/login", req.url));
    }
    if (url.startsWith("/manager") && payload.role !== "manager") {
      return NextResponse.redirect(new URL("/vis/login", req.url));
    }
    if (url.startsWith("/workforce") && payload.role !== "workforce") {
      return NextResponse.redirect(new URL("/vis/login", req.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("❌ Invalid Token", err);
    if (url.startsWith("/superadmin")) {
      return NextResponse.redirect(new URL("/vis/superadmin/login", req.url));
    } else {
      return NextResponse.redirect(new URL("/vis/login", req.url));
    }
  }
}

export const config = {
  matcher: [
    "/superadmin/:path*",
    "/manager/:path*",
    "/workforce/:path*",
  ]
};
