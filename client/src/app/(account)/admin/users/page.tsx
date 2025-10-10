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
import { PaginationControls } from "@/components/PaginationControls";
import { Spinner } from "@/components/Spinner";
import { DeleteUser } from "@/components/account/DeleteUser";
import { BanUser } from "@/components/account/BanUser";
import { useDebounce } from "@/hooks/useDebounce";

const USERS_PER_PAGE = 8;

const AdminUsersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery.trim(), 500, 3);
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const { fetchWithAuth } = useFetch();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-users", page, sort, debouncedSearchQuery],
    queryFn: async () => {
      const res = await fetchWithAuth(
        `/users/get-users?search=${debouncedSearchQuery}&sort=${sort}&page=${page}&limit=${USERS_PER_PAGE}`
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
  }, [sort, debouncedSearchQuery]);

  const users: UserProps[] = data?.users || [];
  const currentPage = data?.currentPage || 1;
  const totalPages = data?.totalPages || 1;
  const totalUsers = data?.totalUsers || 0;

  return (
    <div className="w-full p-2">
      <h1 className="text-2xl font-semibold mb-2">Manage Users</h1>

      <div className="w-full border p-2 rounded-lg flex flex-col gap-2 my-2">
        <Input
          placeholder="Search users by name/email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="w-full flex flex-wrap items-center gap-2">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-white w-max">
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>

          <p className="text-sm text-gray-500">Total Users: {totalUsers}</p>
        </div>
      </div>

      {isLoading ? (
        <Spinner className="mt-4" />
      ) : users.length ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {users.map((user) => (
              <div
                key={user._id}
                className="border rounded-lg p-2 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border shrink-0">
                    <Image
                      src={user.avatar.url || "/default-avatar.png"}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="w-full flex flex-col">
                    <div className="w-full flex justify-between">
                      <h3 className="text-lg font-semibold break-all">
                        {user.name}
                      </h3>
                      <Tag
                        color={user.isVerified ? "blue" : "red"}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          height: "auto",
                        }}
                      >
                        <span style={{ lineHeight: 1 }}>
                          {user.isVerified ? "Verified" : "Not Verified"}
                        </span>
                      </Tag>
                    </div>
                    <p className="text-sm text-gray-600 break-all">
                      {user.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      Account created:
                      <br />
                      {new Date(user.createdAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <BanUser user={user} onSuccess={refetch} />
                  <DeleteUser user={user} onSuccess={refetch} />
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
        <p className="text-center">No users found</p>
      )}
    </div>
  );
};

export default AdminUsersPage;
