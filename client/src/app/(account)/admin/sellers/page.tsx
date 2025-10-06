"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFetch from "@/hooks/useFetch";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Tag } from "antd";
import { formatDate } from "@/utils";
import { PaginationControls } from "@/components/PaginationControls";
import { Spinner } from "@/components/Spinner";
import { BanUser } from "@/components/account/BanUser";
import { DeleteUser } from "@/components/account/DeleteUser";

const SELLERS_PER_PAGE = 8;

const AdminSellersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const { fetchWithAuth } = useFetch();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-sellers", page, sort],
    queryFn: async () => {
      const res = await fetchWithAuth(
        `/users/get-users?seller=true&search=${searchQuery}&sort=${sort}&page=${page}&limit=${SELLERS_PER_PAGE}`
      );
      return res;
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  useEffect(() => {
    setPage(1);
    if (sort) refetch();
  }, [sort, refetch]);

  useEffect(() => {
    setSort("latest");
    const delayDebounce = setTimeout(() => {
      if (searchQuery.length >= 2 || searchQuery.length === 0) {
        setPage(1);
        refetch();
      }
    }, 600);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, refetch]);

  const sellers: UserProps[] = data?.users || [];
  const currentPage = data?.currentPage || 1;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="w-full p-2">
      <h1 className="text-2xl font-semibold mb-2">Manage Sellers</h1>

      <div className="w-full border p-2 rounded-lg flex flex-col gap-2 my-2">
        <Input
          placeholder="Search sellers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger>
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent className="bg-white w-max">
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Spinner className="mt-4" />
      ) : sellers.length ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sellers.map((seller) => (
              <div
                key={seller._id}
                className="border rounded-lg p-2 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border shrink-0">
                    <Image
                      src={seller.avatar.url || "/default-avatar.png"}
                      alt={seller.name}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="w-full flex flex-col">
                    <div className="w-full flex justify-between">
                      <h3 className="text-lg font-semibold break-all">
                        {seller.name}
                      </h3>
                      <Tag
                        color={seller.isVerified ? "blue" : "red"}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          height: "auto",
                        }}
                      >
                        <span style={{ lineHeight: 1 }}>
                          {seller.isVerified ? "Verified" : "Not Verified"}
                        </span>
                      </Tag>
                    </div>
                    <p className="text-sm text-gray-600 break-all">
                      {seller.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      Account created:
                      <br />
                      {formatDate(seller.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <BanUser user={seller} onSuccess={refetch} />
                  <DeleteUser user={seller} onSuccess={refetch} />
                </div>
              </div>
            ))}
          </div>

          <PaginationControls
            currentPage={currentPage}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
          />
        </>
      ) : (
        <p className="text-center">No sellers found</p>
      )}
    </div>
  );
};

export default AdminSellersPage;
