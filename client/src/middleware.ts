import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PROTECTED_ROUTES, ROUTES } from "./utils/routes";
import { getSession } from "./actions/auth";

export async function middleware(req: NextRequest) {
    const token = req.cookies.get(process.env.COOKIE_NAME || "token")?.value;
    const { pathname } = req.nextUrl;

    const isOnLoginSignupPage = pathname.startsWith("/login") || pathname.startsWith("/sign-up") || pathname.startsWith("/forgot-password") || pathname.startsWith("/reset-password");

    const isProtected = PROTECTED_ROUTES.some((p) => pathname.startsWith(p));
    if (!isProtected && !isOnLoginSignupPage) {
        return NextResponse.next();
    }

    if (isOnLoginSignupPage && !token) {
        return NextResponse.next();
    }

    if (!token) {
        return handleUnauthorized(req);
    }

    const { user } = await getSession();
    if (!user) {
        return handleUnauthorized(req);
    }

    const isUser = user.role === "user";
    const isSeller = user.role === "seller";
    const isAdmin = user.role === "admin";

    if (isOnLoginSignupPage) {
        let redirectPath = "/";
        if (isSeller) redirectPath = "/seller/overview";
        if (isAdmin) redirectPath = "/admin/overview";
        return NextResponse.redirect(new URL(redirectPath, req.url));
    }

    const isOnUserPage = ROUTES.USER.some((page) => pathname.startsWith(page));
    const isOnSellerPage = ROUTES.SELLER.some((page) => pathname.startsWith(page));
    const isOnAdminPage = ROUTES.ADMIN.some((page) => pathname.startsWith(page));

    if (isUser && (isOnSellerPage || isOnAdminPage)) {
        return NextResponse.redirect(new URL("/profile", req.url));
    }
    if (isSeller && (isOnUserPage || isOnAdminPage)) {
        return NextResponse.redirect(new URL("/seller/overview", req.url));
    }
    if (isAdmin && (isOnUserPage || isOnSellerPage)) {
        return NextResponse.redirect(new URL("/admin/overview", req.url));
    }

    return NextResponse.next();
}

function handleUnauthorized(req: NextRequest) {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete(process.env.COOKIE_NAME || "token");
    response.headers.set("x-clear-session", "true");
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Pragma", "no-cache");
    return response;
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
};
