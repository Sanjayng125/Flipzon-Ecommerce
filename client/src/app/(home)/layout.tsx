import { Navbar } from "@/components/header/Navbar";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="w-full min-h-screen flex-1 bg-layout overflow-x-hidden">
        {children}
      </main>
    </>
  );
}
