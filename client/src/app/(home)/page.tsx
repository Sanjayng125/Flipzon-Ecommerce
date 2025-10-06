import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import HeroCarousel from "@/components/home/HeroCarousel";
import { LatestProducts } from "@/components/home/LatestProducts";
import { MostSoldProducts } from "@/components/home/MostSoldProducts";
import { TrendingProducts } from "@/components/home/TrendingProducts";

const Page = async () => {
  return (
    <div className="p-2 md:p-4">
      <HeroCarousel />

      <FeaturedProducts />
      <TrendingProducts />
      <MostSoldProducts />
      <FeaturedCategories />
      <LatestProducts />
    </div>
  );
};

export default Page;
