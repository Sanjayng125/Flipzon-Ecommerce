"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export const Search = () => {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const router = useRouter();

  return (
    <div className="w-full flex items-center justify-between  rounded-md bg-[#ebeff2] sm:p-1">
      <input
        className="outline-none border-none flex-1 p-2 font-semibold text-[#1E293B]"
        placeholder="Search..."
        autoFocus={false}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) =>
          e.key === "Enter" &&
          searchQuery !== "" &&
          router.push(`/search?q=${searchQuery}`)
        }
      />
      <Button
        className="p-2 cursor-pointer hover:bg-black/10 bg-transparent"
        onClick={() =>
          searchQuery !== "" && router.push(`/search?q=${searchQuery}`)
        }
      >
        <SearchIcon className="text-sky-800" />
      </Button>
    </div>
  );
};
