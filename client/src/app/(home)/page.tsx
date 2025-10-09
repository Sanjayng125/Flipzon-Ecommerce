import HeroCarousel from "@/components/home/HeroCarousel";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { MostSoldProducts } from "@/components/home/MostSoldProducts";
import { LatestProducts } from "@/components/home/LatestProducts";
import { GoToTopBtn } from "@/components/home/GoToTopBtn";

const Page = async () => {
  return (
    <div className="p-2 md:p-4">
      <HeroCarousel />

      <FeaturedProducts />
      <TrendingProducts />
      <FeaturedCategories />
      <MostSoldProducts />
      <LatestProducts />

      <GoToTopBtn />
    </div>
  );
};

export default Page;
