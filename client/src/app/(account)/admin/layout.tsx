import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flipzon: Admin Dashboard",
  description: "Admin Dashboard for Flipzon Ecommerce Store",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
