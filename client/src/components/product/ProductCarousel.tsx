"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs, Zoom } from "swiper/modules";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/zoom";

interface ProductCarouselProps {
  images: { url: string }[];
}

export const ProductCarousel = ({ images }: ProductCarouselProps) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);

  return (
    <div className="w-full mx-auto relative">
      {/* Custom Nav Buttons */}
      <button className="custom-prev absolute left-2 top-2/5 z-10 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow cursor-pointer">
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>
      <button className="custom-next absolute right-2 top-2/5 z-10 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow cursor-pointer">
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </button>

      {/* Main carousel */}
      <Swiper
        loop
        spaceBetween={10}
        zoom={{ maxRatio: 3 }}
        navigation={{
          prevEl: ".custom-prev",
          nextEl: ".custom-next",
        }}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[FreeMode, Navigation, Thumbs, Zoom]}
        className="w-full"
      >
        {images.map((img, idx) => (
          <SwiperSlide key={idx}>
            <div className="swiper-zoom-container flex items-center justify-center !h-[400px] bg-white">
              <Image
                src={img.url}
                alt={`product-${idx}`}
                width={500}
                height={400}
                className="object-contain max-h-[400px] w-auto h-auto"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbnails */}
      <Swiper
        onSwiper={setThumbsSwiper}
        loop
        spaceBetween={5}
        slidesPerView={5}
        freeMode
        watchSlidesProgress
        modules={[FreeMode, Navigation, Thumbs]}
        className="mt-1 md:mt-2"
      >
        {images.map((img, idx) => (
          <SwiperSlide key={idx}>
            <div className="relative w-full h-[70px] md:h-[100px] cursor-pointer border-2 border-sky-700 rounded-md bg-white">
              <Image
                src={img.url}
                alt={`thumb-${idx}`}
                fill
                sizes="100px"
                className="object-contain rounded-md"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
