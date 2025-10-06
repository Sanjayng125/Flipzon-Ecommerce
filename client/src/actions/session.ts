"use server";

import { revalidateTag } from "next/cache";

export async function refreshSession() {
    revalidateTag("session");
}
