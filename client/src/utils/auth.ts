"use server"

import { cookies } from "next/headers";

interface Session {
    message: string;
    success: boolean;
    user: UserProps | null;
}

export const getSession = async (): Promise<Session> => {
    const cookieStore = await cookies();

    const token = cookieStore.get(process.env.COOKIE_NAME!)?.value ?? "";

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/user`, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Cookie": `${process.env.COOKIE_NAME!}=${token}`,
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
