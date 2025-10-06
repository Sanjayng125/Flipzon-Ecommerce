import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flipzon: Seller Dashboard",
  description: "Seller Dashboard for Flipzon Ecommerce Store",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
