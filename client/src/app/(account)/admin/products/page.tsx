"use client";

import { CategorySelector } from "@/components/category/CategorySelector";
import { PaginationControls } from "@/components/PaginationControls";
import { AdminProductCard } from "@/components/product/AdminProductCard";
import { Spinner } from "@/components/Spinner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFetch from "@/hooks/useFetch";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const AdminProductsPage = () => {
  const { api, fetchWithAuth } = useFetch();
  const [sort, setSort] = useState("latest");
  const [featured, setFeatured] = useState(false);
  const [category, setCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(8);

  const { data, isLoading, refetch } = useQuery<{
    products: Product[];
    totalProducts: number;
    currentPage: number;
    totalPages: number;
  }>({
    queryKey: ["admin-products", page, sort, category],
    queryFn: async () => {
      const res = await api(
        `/products?outofstock=true&search=${searchQuery.trim()}&sort=${sort}&category=${category}&page=${page}&limit=${limit}&featured=${featured}`
      );
      if (res?.success) {
        return res;
      }
      toast.error(res?.message || "Failed to fetch products!");
      return null;
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const { mutate: updateFeaturedMutation, isPending: updateFeaturedIsLoading } =
    useMutation({
      mutationFn: async (id: string) => {
        const res = await fetchWithAuth(`/products/featured/${id}`, {
          method: "PATCH",
        });

        if (!res?.success) {
          toast.error(res?.message || "Failed to update featured!");
        }

        return res;
      },
      onSuccess: (res) => {
        toast.success(res?.message);
        refetch();
      },
    });

  useEffect(() => {
    if (sort || category || category === "") {
      refetch();
    }
  }, [sort, category, featured, refetch]);

  useEffect(() => {
    setSort("latest");
    setCategory("");
    const delayDebounce = setTimeout(() => {
      if (searchQuery.length >= 2 || searchQuery.length === 0) {
        refetch();
      }
    }, 700);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, refetch]);

  const products = data?.products || [];
  const currentPage = data?.currentPage || page;
  const totalPages = data?.totalPages || page;

  return (
    <div className="w-full p-2">
      <h1 className="text-2xl font-semibold">Manage Products</h1>

      <div className="w-full border p-2 rounded-lg flex flex-col mt-2">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="w-full flex flex-wrap mt-2 gap-2">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-white w-max">
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="price_asc">Price ascending</SelectItem>
              <SelectItem value="price_desc">Price descending</SelectItem>
            </SelectContent>
          </Select>

          <CategorySelector
            value={category}
            onChange={(val) => setCategory(val === "None" ? "" : val)}
            placeholder="Sort by category"
          >
            <SelectItem value="None">All</SelectItem>
          </CategorySelector>

          <Select
            value={featured ? "true" : "false"}
            onValueChange={(val) => setFeatured(val === "true" ? true : false)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Only Featured" />
            </SelectTrigger>
            <SelectContent className="bg-white w-max">
              <SelectItem value="true">Only Featured: Yes</SelectItem>
              <SelectItem value="false">Only Featured: No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products */}
      {isLoading ? (
        <Spinner className="mt-4" />
      ) : products && products?.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products?.map((product) => (
            <AdminProductCard
              product={product}
              refetch={refetch}
              key={product._id}
              updateFeatured={updateFeaturedMutation}
              isLoading={updateFeaturedIsLoading}
            />
          ))}
        </div>
      ) : (
        <p className="text-center mt-2">No products found</p>
      )}

      <PaginationControls
        currentPage={currentPage}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />
    </div>
  );
};

export default AdminProductsPage;
