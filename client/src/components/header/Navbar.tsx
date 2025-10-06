"use client";

import { Heart, LogIn, ShoppingCartIcon, User } from "lucide-react";
import Link from "next/link";
import React, { Suspense } from "react";
import { Cart } from "./Cart";
import { Search } from "./Search";
import { Category } from "./Category";
import { VerticalSeperator } from "../VerticalSeperator";
import { Delivery } from "./Delivery";
import { useAuth } from "@/hooks/useAuth";

export const Navbar = () => {
  const { user } = useAuth();

  const isUser = user?.role === "user";

  return (
    <nav className="flex flex-col justify-between bg-white text-[#1E293B] shadow-md">
      {/* Top links */}
      <div className="flex items-center justify-between px-2 py-1 md:px-4 md:py-2 bg-[#f5f5f5] mb-2 sm:mb-4">
        <p className="text-[#494c52] max-[420px]:text-sm">
          Welcome to Flipzon!
        </p>
        <div className="flex items-center gap-2">
          {user && (
            <>
              <Link
                href={
                  user?.role === "admin"
                    ? "/admin/overview"
                    : user?.role === "seller"
                    ? "/seller/overview"
                    : "/profile"
                }
              >
                <span className="flex items-center gap-1 hover:underline text-[#494c52]">
                  <User className="size-5 text-sky-800" />
                  My account
                </span>
              </Link>
              {(!user || isUser) && (
                <>
                  <VerticalSeperator width={2} />
                  <Link href={"/wishlist"}>
                    <span className="flex items-center gap-1 hover:underline text-[#494c52]">
                      <Heart className="size-5 text-sky-800" />
                      Wishlist
                    </span>
                  </Link>
                </>
              )}
            </>
          )}
          {!user && (
            <Link href={"/login"}>
              <span className="flex items-center gap-1 hover:underline text-[#494c52] font-semibold">
                Login
                <LogIn className="size-5 text-sky-800" />
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Logo & Search-Cart */}
      <div className="flex sm:items-center justify-between max-sm:flex-col max-sm:space-y-3 px-2 sm:px-4 mb-1">
        <Link href={"/"}>
          <div className="flex items-center gap-1 text-sky-800">
            <ShoppingCartIcon className="size-8 sm:size-10 aspect-square" />
            <p className="text-2xl font-bold">Flipzon</p>
          </div>
        </Link>
        <div className="w-full sm:w-3/5 flex items-center gap-1 sm:justify-end space-x-1 sm:space-x-3 overflow-x-auto hide-scrollbar">
          <div className="flex-1">
            <Suspense fallback={<div>Loading...</div>}>
              <Search />
            </Suspense>
          </div>
          {(!user || isUser) && <VerticalSeperator height={28} width={2} />}
          <div className="shrink-0">{(!user || isUser) && <Cart />}</div>
        </div>
      </div>

      {/* Delivery & Category bar */}
      {(!user || isUser) && <Delivery />}
      <Category />
    </nav>
  );
};
