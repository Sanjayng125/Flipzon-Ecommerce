"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import useFetch from "@/hooks/useFetch";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";

const HeroCarousel = () => {
  const { api } = useFetch();

  const { data: heros, isPending } = useQuery<HeroProps[]>({
    queryKey: ["get-hero"],
    queryFn: async () => {
      const res = await api("/hero");

      return res.heros;
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  if (!isPending && !heros) return null;

  if (isPending) {
    return (
      <Skeleton className="w-full h-40 sm:h-60 md:h-80 bg-skeleton rounded-lg"></Skeleton>
    );
  }

  return (
    <div className="w-full mx-auto overflow-hidden rounded-lg">
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
        }}
        modules={[Autoplay, Pagination]}
      >
        <SwiperSlide key={0} className="w-full flex items-center">
          <Link href={"/"}>
            <div className="w-full flex items-center my-auto">
              <Image
                src={
                  "https://res.cloudinary.com/dnugvoy3m/image/fetch/w_1500,h_500,c_fill/" +
                  "https://res.cloudinary.com/dnugvoy3m/image/upload/v1759647593/flipzon-ecommerce/defaults/Welcome_Hero_Image_srapfy.png"
                }
                priority
                quality={100}
                alt={`Welcom Hero`}
                width={500}
                height={300}
                className="w-full object-contain"
              />
            </div>
          </Link>
        </SwiperSlide>
        {heros.map((hero, index) => (
          <SwiperSlide key={hero._id} className="w-full flex items-center">
            <Link href={hero.heroLink ?? "#"}>
              <div className="w-full flex items-center my-auto">
                <Image
                  src={
                    "https://res.cloudinary.com/dnugvoy3m/image/fetch/w_1500,h_500,c_fill/" +
                    hero.image.url
                  }
                  priority
                  quality={100}
                  alt={`Hero ${index + 1}`}
                  width={500}
                  height={300}
                  className="w-full object-contain"
                />
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroCarousel;
