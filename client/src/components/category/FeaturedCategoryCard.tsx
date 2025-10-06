import Image from "next/image";
import Link from "next/link";
import React from "react";

interface FeaturedCategoryCardProps {
  category: Category;
}

export const FeaturedCategoryCard = ({
  category,
}: FeaturedCategoryCardProps) => {
  return (
    <Link href={`/category/${category.slug}`}>
      <div className="flex flex-col items-center w-24">
        <Image
          src={category.image.url}
          width={80}
          height={80}
          alt="Category img"
          className="min-w-20 min-h-20 rounded-full object-cover"
        />
        <p className="font-semibold text-sm text-center truncate w-full text-clip">
          {category.name}
        </p>
      </div>
    </Link>
  );
};
