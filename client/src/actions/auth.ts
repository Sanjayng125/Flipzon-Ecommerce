"use server";

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";

interface Session {
    message: string;
    success: boolean;
    user: UserProps | null;
}

export const getSession = async (): Promise<Session> => {
    const cookieStore = await cookies();

    const token = cookieStore.get(process.env.COOKIE_NAME!)?.value ?? "";

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/user`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        cache: "force-cache",
        next: { tags: ["session"] },
    });

    if (!res.ok) {
        return {
            message: "Failed to fetch session",
            success: false,
            user: null,
        };
    }

    const data = await res.json();
    return data;
};

export async function refreshSession() {
    revalidateTag("session");
}

export const login = async (email: string, password: string) => {
    const cookieStore = await cookies();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!data?.success) throw new Error(data?.message || "Login failed");

    cookieStore.set(process.env.COOKIE_NAME!, data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
    });

    return data;
}

export const logout = async () => {
    const cookieStore = await cookies();

    cookieStore.delete(process.env.COOKIE_NAME!);
}

export const getToken = async () => {
    const cookieStore = await cookies();

    const token = cookieStore.get(process.env.COOKIE_NAME!)?.value;

    if (!token) {
        return null;
    }

    return token;
}