"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import useFetch from "@/hooks/useFetch";

import { toast } from "sonner";
import Image from "next/image";
import { Trash } from "lucide-react";
import { CategoryModal } from "@/components/category/CategoryModal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationControls } from "@/components/PaginationControls";
import { Spinner } from "@/components/Spinner";

const AdminCategoriesPage = () => {
  const { fetchWithAuth } = useFetch();
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [limit] = useState(8);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-categories", page, sort],
    queryFn: async () => {
      const res = await fetchWithAuth(
        `/categories?search=${searchQuery}&sort=${sort}&page=${page}&limit=${limit}`
      );
      return res;
    },
    staleTime: 1000 * 60 * 10,
  });

  const removeCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/categories/${id}`, {
        method: "DELETE",
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to remove category!");
      }

      return res;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Category removed");
      refetch();
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to remove category");
    },
  });

  useEffect(() => {
    if (sort) {
      setPage(1);
      refetch();
    }
  }, [sort, refetch]);

  useEffect(() => {
    setSort("latest");
    const delayDebounce = setTimeout(() => {
      if (searchQuery.length >= 3 || searchQuery.length === 0) {
        refetch();
      }
    }, 700);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, refetch]);

  const categories: Category[] = data?.categories || [];
  const currentPage = data?.currentPage || page;
  const totalPages = data?.totalPages || page;

  return (
    <div className="w-full p-2">
      <h1 className="text-2xl font-semibold">Manage Categories</h1>

      <div className="w-full border p-2 rounded-lg flex flex-col my-2">
        <Input
          placeholder="Search categories..."
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
            </SelectContent>
          </Select>
          <CategoryModal onSuccess={refetch} />
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories?.map((cat: Category) => (
            <div
              className="w-full border rounded-lg grid grid-rows-1 relative"
              key={cat._id}
            >
              {cat.isFeatured && (
                <p className="text-xs p-1 bg-sky-700 text-white rounded-tl-lg rounded-br-lg absolute">
                  Featured
                </p>
              )}
              {cat.showInCategoryBar && (
                <p className="text-xs p-1 bg-gray-700 text-white rounded-tr-lg rounded-bl-lg absolute right-0">
                  Category Bar
                </p>
              )}
              <Image
                src={cat.image.url}
                alt="Category"
                width={100}
                height={100}
                className="w-2/3 p-2 place-self-center aspect-square object-contain"
              />
              <p className="font-semibold px-2 text-lg truncate">{cat.name}</p>
              <div className="flex items-center border-t">
                <div className="w-full">
                  <CategoryModal edit data={cat} onSuccess={refetch} />
                </div>
                <button
                  className="w-full py-2 group flex items-center justify-center disabled:opacity-50 hover:bg-black/10"
                  onClick={() => removeCategoryMutation.mutate(cat._id)}
                  disabled={removeCategoryMutation.isPending}
                >
                  <Trash size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center mt-2">No categories found</p>
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

export default AdminCategoriesPage;
