import { capatilize } from "@/utils";
import { Metadata } from "next";
import React from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Flipzon | ${capatilize(slug.replace(/-/g, " "))}`,
    description: `Explore products in the ${slug.replace(/-/g, " ")} category.`,
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
