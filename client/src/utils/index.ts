import CryptoJS from "crypto-js";
import removeMd from "remove-markdown";

export function capatilize(str: string) {
    return `${str.charAt(0).toUpperCase()}` + str.slice(1, str.length);
}

export const getStatusBadgeColor = (status: string) => {
    switch (status) {
        case "pending":
            return "bg-yellow-100 text-yellow-800";
        case "processing":
            return "bg-blue-100 text-blue-800";
        case "shipped":
            return "bg-purple-100 text-purple-800";
        case "delivered":
            return "bg-green-100 text-green-800";
        case "cancelled":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

export const formatDate = (date: string, withTime: boolean = true) => {
    return new Date(date).toLocaleString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        ...(withTime && {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }),
    });
};


const SECRET_KEY =
    process.env.NEXT_PUBLIC_AUTH_STORE_SECRET_KEY || "auth-storage-secret-key";

export const encryptData = (data: any) => {
    try {
        return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
    } catch (error) {
        console.error("Encryption error:", error);
        return null;
    }
};

export const decryptData = (cipherText: string) => {
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        const parsed = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return parsed;
    } catch (error) {
        console.error("Decryption error:", error);
        return null;
    }
};

export function getPlainDescription(markdown: string) {
    return removeMd(markdown, { stripListLeaders: true, gfm: true, useImgAltText: false });
}

export const DEFAULT_CATEGORY_IMAGE = "https://res.cloudinary.com/dnugvoy3m/image/upload/v1742375402/flipzon-ecommerce/defaults/default-category_cy78qk.png"
export const NOT_FOUND_IMAGE = "/not-found.png"
