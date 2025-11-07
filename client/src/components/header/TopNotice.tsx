"use client";

import React from "react";
import Marquee from "react-fast-marquee";

const TopNotice = () => {
  const notice = process.env.NEXT_PUBLIC_NOTICE
    ? process.env.NEXT_PUBLIC_NOTICE.split("-").join(" ")
    : null;

  if (!notice) return null;

  return (
    <div className="bg-yellow-100 text-sm font-medium">
      <Marquee speed={50} gradient={false}>
        <span className="px-4">{notice}</span>
      </Marquee>
    </div>
  );
};

export default TopNotice;
