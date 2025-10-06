"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { useInView } from "react-intersection-observer";
import useFetch from "@/hooks/useFetch";

interface CategorySelectorProps {
  value?: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  children?:
    | React.ReactElement<typeof SelectItem>
    | React.ReactElement<typeof SelectItem>[];
}

const CategorySearch = React.memo(
  ({
    onSearchChange,
    searchValue,
  }: {
    onSearchChange: (value: string) => void;
    searchValue: string;
  }) => {
    const [localSearch, setLocalSearch] = useState(searchValue);

    useEffect(() => {
      setLocalSearch(searchValue);
    }, [searchValue]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalSearch(value);
        onSearchChange(value);
      },
      [onSearchChange]
    );

    return (
      <div className="p-2 sticky -top-1 bg-background z-10 border-b">
        <Input
          placeholder="Search categories..."
          value={localSearch}
          onChange={handleChange}
          autoComplete="off"
          spellCheck={false}
          autoFocus={false}
          onBlur={(e) => {
            const relatedTarget = e.relatedTarget as HTMLElement;
            if (
              relatedTarget?.closest('[role="listbox"]') ||
              relatedTarget?.closest("[data-radix-select-content]")
            ) {
              e.target.focus();
            }
          }}
        />
      </div>
    );
  }
);

CategorySearch.displayName = "CategorySearch";

export function CategorySelector({
  value,
  onChange,
  className = "",
  placeholder,
  disabled = false,
  children,
}: CategorySelectorProps) {
  const { api } = useFetch();

  const [internalSearch, setInternalSearch] = useState("");
  const debouncedSearch = useDebounce(internalSearch, 500);
  const [ref, inView] = useInView();
  const [notInInitCategory, setNotInInitCategory] = useState<Category | null>(
    null
  );
  const [fetchedNotInInitCategory, setFetchedNotInInitCategory] =
    useState<boolean>(false);
  const [notInInitCategoryError, setNotInInitCategoryError] = useState<
    string | null
  >("");

  const fetchCategory = useCallback(async () => {
    if (!value) return;

    const res = await api(`/categories/${value}`);
    setFetchedNotInInitCategory(true);
    if (!res?.success) {
      setNotInInitCategoryError(res?.message || "Failed to fetch category");
    } else {
      setNotInInitCategory(res.category);
      setNotInInitCategoryError("");
    }
    return res.category;
  }, [api, value]);

  const fetchCategories = useCallback(
    async ({
      pageParam = 1,
      query = "",
    }: {
      pageParam?: number;
      query?: string;
    }) => {
      const res = await api(
        `/categories?page=${pageParam}&limit=10&search=${query}`
      );
      if (!res?.success) throw new Error("Failed to fetch categories");

      if (res?.success) {
        if (
          !fetchedNotInInitCategory &&
          res.categories.length > 0 &&
          res.categories.some((cat: Category) => cat._id === value)
        ) {
          setFetchedNotInInitCategory(true);
        }
        return res;
      } else {
        return { categories: [], currentPage: 1, totalPages: 1 };
      }
    },
    [api, value, fetchedNotInInitCategory]
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["categories", debouncedSearch],
      queryFn: ({ pageParam }) =>
        fetchCategories({ pageParam, query: debouncedSearch }),
      getNextPageParam: (lastPage) =>
        lastPage.currentPage < lastPage.totalPages
          ? lastPage.currentPage + 1
          : undefined,
      initialPageParam: 1,
      staleTime: 1000 * 60 * 10, // 10 minutes
    });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, inView, isLoading]);

  const categories: Category[] = useMemo(
    () => data?.pages.flatMap((page) => page?.categories || []) || [],
    [data]
  );

  const { isLoading: isSingleCategoryLoading } = useQuery({
    queryKey: ["get-not-in-init-category", value],
    queryFn: fetchCategory,
    enabled:
      !!value &&
      !fetchedNotInInitCategory &&
      categories.length > 0 &&
      !categories.some((cat) => cat._id === value),
    refetchOnWindowFocus: false,
    retry: false,
  });

  const handleSearchChange = useCallback((searchValue: string) => {
    setInternalSearch(searchValue);
  }, []);

  const handleValueChange = useCallback(
    (val: string) => {
      if (notInInitCategory) setNotInInitCategory(null);
      if (notInInitCategoryError) setNotInInitCategoryError("");

      setInternalSearch("");
      onChange(val);
    },
    [onChange, notInInitCategory, notInInitCategoryError]
  );

  return (
    <Select
      value={value}
      onValueChange={handleValueChange}
      onOpenChange={(open) => {
        if (!open) {
          setInternalSearch("");
        }
      }}
    >
      <SelectTrigger className={className} disabled={disabled}>
        {notInInitCategory || notInInitCategoryError ? (
          <SelectValue
            placeholder={
              isLoading || isSingleCategoryLoading
                ? "Loading..."
                : placeholder || "Category"
            }
          >
            {notInInitCategoryError
              ? notInInitCategoryError
              : notInInitCategory?.name}
          </SelectValue>
        ) : (
          <SelectValue
            placeholder={
              isLoading || isSingleCategoryLoading
                ? "Loading..."
                : placeholder || "Category"
            }
          />
        )}
      </SelectTrigger>
      <SelectContent className="max-h-72">
        <CategorySearch
          onSearchChange={handleSearchChange}
          searchValue={internalSearch}
        />

        <div className="overflow-y-auto max-h-60">
          {children}
          {isLoading && categories.length === 0 ? (
            <div className="p-2 text-center text-sm">Loading...</div>
          ) : (
            <>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name}
                </SelectItem>
              ))}
              {/* Infinite loader */}
              {hasNextPage && (
                <div ref={ref} className="flex justify-center p-2 mb-2">
                  {isFetchingNextPage && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
              )}
              {categories.length === 0 && !isLoading && (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  No categories found
                </div>
              )}
            </>
          )}
        </div>
      </SelectContent>
    </Select>
  );
}
