"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ArrowDown, ArrowUp, Filter } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { CategorySelector } from "../category/CategorySelector";

export const Filters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState(searchParams.get("q") || "");

  const [sort, setSort] = useState(searchParams.get("sort") || "latest");
  const [category, setCategory] = useState<string | null>(
    searchParams.get("category") || null
  );
  const [priceMin, setPriceMin] = useState(
    Number(searchParams.get("priceMin")) || 1
  );
  const [priceMax, setPriceMax] = useState(
    Number(searchParams.get("priceMax")) || 300000
  );
  const [featured, setFeatured] = useState(
    searchParams.get("featured") === "true"
  );
  const [outofstock, setOutofstock] = useState(
    searchParams.get("outofstock") === "true"
  );

  const resetFilters = () => {
    setSort("latest");
    setCategory(null);
    setPriceMin(1);
    setPriceMax(300000);
    setFeatured(false);
    setOutofstock(false);
  };

  useEffect(() => {
    const q = searchParams.get("q") || "";
    if (q !== search) {
      setSearch(q);

      resetFilters();
    }
  }, [searchParams]);

  const handleFilterClear = () => {
    resetFilters();

    const params = new URLSearchParams();
    if (search) params.set("q", search);

    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const handleApply = () => {
    const params = new URLSearchParams();

    if (search) params.set("q", search);

    if (sort && sort !== "latest") params.set("sort", sort);
    if (category) params.set("category", category);
    if (priceMin && priceMin > 1) params.set("priceMin", priceMin.toString());
    if (priceMax && priceMax < 300000)
      params.set("priceMax", priceMax.toString());
    if (featured) params.set("featured", "true");
    if (outofstock) params.set("outofstock", "true");

    const newQuery = params.toString();
    router.push(
      newQuery
        ? `${window.location.pathname}?${newQuery}`
        : window.location.pathname
    );
  };

  const SortFilters = () => {
    return (
      <div className="mt-2 w-full px-2">
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full border-b data-[state=open]:bg-black/10 border-x-0 border-t-0 focus-visible:ring-0">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="price_asc">
              Price ascending <ArrowUp />
            </SelectItem>
            <SelectItem value="price_desc">
              Price descending <ArrowDown />
            </SelectItem>
            <SelectItem value="rating_asc">
              Rating ascending <ArrowUp />
            </SelectItem>
            <SelectItem value="rating_desc">
              Rating descending <ArrowDown />
            </SelectItem>
            <SelectItem value="bestsellers">Most Sold</SelectItem>
            <SelectItem value="trending">Trending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <>
      <div className="min-w-52 w-[25%] max-w-80 h-fit bg-white pt-2 pb-4 max-md:hidden">
        <h2 className="text-xl font-semibold mb-3 p-2 border-b border-border-default">
          Filters
        </h2>

        {/* Sort */}
        <SortFilters />

        {/* Category */}
        <div className="mt-2 w-full px-2">
          <CategorySelector
            value={category ?? ""}
            onChange={setCategory}
            className="w-full border-b data-[state=open]:bg-black/10 border-x-0 border-t-0 focus-visible:ring-0"
          />
        </div>

        {/* Price */}
        <div className="mt-4 w-full flex items-center space-x-2 px-2">
          <span className="flex flex-col">
            <p className="text-sm">Price Min</p>
            <Input
              type="number"
              min={1}
              step={100}
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.valueAsNumber)}
            />
          </span>
          <span className="flex flex-col">
            <p className="text-sm">Price Max</p>
            <Input
              type="number"
              min={1}
              step={100}
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.valueAsNumber)}
            />
          </span>
        </div>

        {/* Checkboxes */}
        <div className="mt-4 w-full flex flex-col gap-2 px-2">
          <span className="flex items-center space-x-2">
            <Input
              type="checkbox"
              className="size-4"
              id="featured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            <label className="text-sm cursor-pointer" htmlFor="featured">
              Featured
            </label>
          </span>
          <span className="flex items-center space-x-2">
            <Input
              type="checkbox"
              className="size-4"
              id="outofstock"
              checked={outofstock}
              onChange={(e) => setOutofstock(e.target.checked)}
            />
            <label className="text-sm cursor-pointer" htmlFor="outofstock">
              Out of stock
            </label>
          </span>
        </div>

        {/* Buttons */}
        <div className="mt-4 w-full grid lg:grid-cols-2 gap-2 px-2">
          <Button variant={"outline"} onClick={handleFilterClear}>
            Reset
          </Button>
          <Button
            className="bg-sky-700 text-white cursor-pointer hover:bg-sky-800"
            onClick={handleApply}
          >
            Apply
          </Button>
        </div>
      </div>

      {/* mobile */}
      <div className="w-full md:hidden border-b-1 border-border-default">
        <Drawer>
          <div className="grid grid-cols-2">
            <DrawerTrigger className="w-full bg-white shadow-none rounded-none cursor-pointer hover:bg-black/10 flex items-center justify-center space-x-1">
              Filter <Filter className="size-4" />
            </DrawerTrigger>
            <Button
              className="w-full bg-white shadow-none rounded-none cursor-pointer hover:bg-black/10 border-l border-border-default"
              variant={"secondary"}
              onClick={handleFilterClear}
            >
              Reset
            </Button>
          </div>
          <DrawerContent className="bg-white px-3 mb-3">
            <DrawerHeader>
              <DrawerTitle>Filters</DrawerTitle>
            </DrawerHeader>

            {/* Sort */}
            <SortFilters />

            {/* Category */}
            <div className="mt-2 w-full px-2">
              <CategorySelector
                value={category ?? ""}
                onChange={setCategory}
                className="w-full border-b data-[state=open]:bg-black/10 border-x-0 border-t-0 focus-visible:ring-0"
              />
            </div>

            {/* Price */}
            <div className="mt-4 w-full flex items-center space-x-2">
              <span className="flex flex-col">
                <p className="text-sm">Price Min</p>
                <Input
                  type="number"
                  min={1}
                  step={100}
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.valueAsNumber)}
                />
              </span>
              <span className="flex flex-col">
                <p className="text-sm">Price Max</p>
                <Input
                  type="number"
                  min={1}
                  step={100}
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.valueAsNumber)}
                />
              </span>
            </div>

            {/* Checkboxes */}
            <div className="mt-4 w-full flex flex-col gap-2">
              <span className="flex items-center space-x-2">
                <Input
                  type="checkbox"
                  className="size-4"
                  id="featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <label className="text-sm cursor-pointer" htmlFor="featured">
                  Featured
                </label>
              </span>
              <span className="flex items-center space-x-2">
                <Input
                  type="checkbox"
                  className="size-4"
                  id="outofstock"
                  checked={outofstock}
                  onChange={(e) => setOutofstock(e.target.checked)}
                />
                <label className="text-sm cursor-pointer" htmlFor="outofstock">
                  Out of stock
                </label>
              </span>
            </div>

            {/* Buttons */}
            <div className="mt-4 w-full grid lg:grid-cols-2 gap-2">
              <Button variant={"outline"} onClick={handleFilterClear}>
                Reset
              </Button>
              <Button
                className="bg-sky-700 text-white cursor-pointer hover:bg-sky-800"
                onClick={handleApply}
              >
                Apply
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
};
