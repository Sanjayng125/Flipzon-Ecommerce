import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/context/QueryProvider";
import Footer from "@/components/footer/Footer";
import { Rubik } from "next/font/google";

// const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"] });

const rubik = Rubik({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Flipzon",
  description:
    "Your one-stop shop for all your needs. Shop, buy, sell, and manage your products, orders, and sellers. All in one place. Easy, fast, and secure. Powered by Cashfree. Built with Next.js. Hosted on Vercel. 100% Open Source. Made with ❤️ for shopping lovers.",
  keywords:
    "flipzon, ecommerce, nextjs, react, express, mongodb, cashfree, vercel, hosting, cloud, payments, shopping, sellers, seller, seller-dashboard, admin-dashboard, admin, store, store-dashboard, store-admin, ecommerce-store, ecommerce-dashboard, ecommerce-admin, flipzon-ecommerce, flipzon-store, flipzon-dashboard, flipzon-admin, flipzon-seller, flipzon-sellers, flipzon-store-admin, flipzon-store-dashboard, flipzon-store-sellers, flipzon-store-seller, flipzon-ecommerce-admin, flipzon-ecommerce-dashboard, flipzon-ecommerce-sellers, flipzon-ecommerce-seller, flipzon-ecommerce-store, flipzon-ecommerce-store-admin, flipzon-ecommerce-store-dashboard, flipzon-ecommerce-store-sellers, flipzon-ecommerce-store-seller",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`w-full max-w-screen-2xl mx-auto min-h-screen flex flex-col justify-between ${rubik.className}`}
      >
        <QueryProvider>
          <Toaster toastOptions={{ style: { backgroundColor: "white" } }} />
          {children}
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
