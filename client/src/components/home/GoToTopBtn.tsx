"use client";

import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { ArrowUp } from "lucide-react";

export const GoToTopBtn = () => {
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const btn = document.getElementById("go-to-top");
      if (btn) {
        if (scrollTop > 500) {
          btn.classList.add("translate-y-0");
          btn.classList.remove("translate-y-12");
        } else {
          btn.classList.remove("translate-y-0");
          btn.classList.add("translate-y-12");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Button
      className="flex items-center gap-1 transition-all duration-300 bg-gray-400 hover:bg-gray-500 mx-auto fixed bottom-2 right-1/2 left-1/2 -translate-x-1/2 w-max translate-y-12"
      size={"sm"}
      id="go-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <span>Go to top</span>
      <ArrowUp />
    </Button>
  );
};
