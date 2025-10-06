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
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Tag } from "antd";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/PaginationControls";
import { Spinner } from "@/components/Spinner";

const REQUESTS_PER_PAGE = 8;

const AdminRequestsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const { fetchWithAuth } = useFetch();
  const [rejectOpen, setRejectOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-requests", page, sort],
    queryFn: async () => {
      const res = await fetchWithAuth(
        `/users/get-users?requests=true&search=${searchQuery}&sort=${sort}&page=${page}&limit=${REQUESTS_PER_PAGE}`
      );
      return res;
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/users/seller-reject/${id}`, {
        method: "PATCH",
      });
      if (!res?.success) {
        throw new Error(res?.message || "Failed to reject user request!");
      }
      return res;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "User request rejected");
      refetch();
      setRejectOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong while rejecting!");
    },
  });

  const approveRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/users/seller-approve/${id}`, {
        method: "PATCH",
      });
      if (!res?.success) {
        throw new Error(res?.message || "Failed to approve user request!");
      }
      return res;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "User request approved");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong while approving!");
    },
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

  const requests: UserProps[] = data?.users || [];
  const currentPage = data?.currentPage || 1;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="w-full p-2">
      <h1 className="text-2xl font-semibold mb-2">Manage Users</h1>

      <div className="w-full border p-2 rounded-lg flex flex-col gap-2 my-2">
        <Input
          placeholder="Search requests..."
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
      ) : requests.length ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {requests.map((request) => (
              <div
                key={request._id}
                className="border rounded-lg p-2 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border shrink-0">
                    <Image
                      src={request.avatar.url || "/default-avatar.png"}
                      alt={request.name}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="w-full flex flex-col">
                    <div className="w-full flex justify-between">
                      <h3 className="text-lg font-semibold break-all">
                        {request.name}
                      </h3>
                      <Tag
                        color={request.isVerified ? "blue" : "red"}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          height: "auto",
                        }}
                      >
                        <span style={{ lineHeight: 1 }}>
                          {request.isVerified ? "Verified" : "Not Verified"}
                        </span>
                      </Tag>
                    </div>
                    <p className="text-sm text-gray-600 break-all">
                      {request.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      Account created:
                      <br />
                      {new Date(request.createdAt).toLocaleString("en-US", {
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

                <div className="flex gap-2 ml-auto items-center flex-wrap">
                  <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                    <DialogHeader>
                      <DialogTrigger asChild>
                        <Button
                          className="mt-4"
                          variant={"destructive"}
                          disabled={
                            rejectRequestMutation.isPending ||
                            approveRequestMutation.isPending
                          }
                        >
                          Reject
                        </Button>
                      </DialogTrigger>
                    </DialogHeader>
                    <DialogContent className="bg-white">
                      <DialogTitle>
                        Are you sure? You want to reject this request.
                      </DialogTitle>
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={() => setRejectOpen(false)}
                          className="mt-4"
                          variant={"outline"}
                          disabled={
                            rejectRequestMutation.isPending ||
                            approveRequestMutation.isPending
                          }
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() =>
                            rejectRequestMutation.mutate(request._id)
                          }
                          className="mt-4"
                          variant={"destructive"}
                          disabled={
                            rejectRequestMutation.isPending ||
                            approveRequestMutation.isPending
                          }
                        >
                          {rejectRequestMutation.isPending
                            ? "Rejecting..."
                            : "Reject"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    onClick={() => approveRequestMutation.mutate(request._id)}
                    className="mt-4 bg-green-700 text-white hover:bg-green-800"
                    disabled={
                      rejectRequestMutation.isPending ||
                      approveRequestMutation.isPending
                    }
                  >
                    {approveRequestMutation.isPending
                      ? "Approving..."
                      : "Approve"}
                  </Button>
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
        <p className="text-center">No requests found</p>
      )}
    </div>
  );
};

export default AdminRequestsPage;
