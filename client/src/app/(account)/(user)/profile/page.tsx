"use client";

import { DeleteAccountModal } from "@/components/account/DeleteAccountModal";
import { UpdatePasswordForm } from "@/components/account/UpdatePasswordForm";
import { UpdateProfileForm } from "@/components/account/UpdateProfileForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import useFetch from "@/hooks/useFetch";
import { useMutation } from "@tanstack/react-query";
import { Card } from "antd";
import { Edit } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";

const ProfilePage = () => {
  const { fetchWithAuth } = useFetch();
  const [edit, setEdit] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  const { user, setUser } = useAuth();

  const becomeSellerMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("Bad request!");
      }
      const res = await fetchWithAuth("/users/become-seller");

      if (!res?.success) {
        throw new Error(res?.message || "Failed to request for seller!");
      }

      return res;
    },
    onSuccess: (res) => {
      toast.success(res.message);
      setUser(res.user);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <div className="flex flex-col justify-center p-2">
      {user && (
        <div className="w-full">
          {edit ? (
            <UpdateProfileForm
              name={user.name}
              phone={user.phone}
              avatar={user.avatar.url}
              setEdit={() => setEdit(false)}
            />
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="p-1 rounded-md bg-gray-400">
                  <Image
                    src={user.avatar.url}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="w-20 h-20 object-contain"
                  />
                </div>
                <div className="w-full flex flex-col space-y-1">
                  <Label className="font-semibold">Name</Label>
                  <Input
                    value={user.name}
                    className="outline-none font-semibold disabled:opacity-80"
                    disabled
                    readOnly
                  />
                </div>
              </div>

              <div className="w-full flex flex-col space-y-3 mt-5">
                <Label className="font-semibold">Phone Number</Label>
                <Input
                  value={user.phone}
                  className="outline-none font-semibold disabled:opacity-80"
                  disabled
                  readOnly
                />
                <Button
                  className="w-max bg-sky-800 hover:bg-sky-900 text-white"
                  onClick={() => setEdit(true)}
                >
                  Edit <Edit />
                </Button>
              </div>
            </>
          )}

          <div className="w-full flex flex-col space-y-3 mt-5">
            <Label className="font-semibold">Email</Label>
            <Input
              value={user.email}
              disabled
              className="outline-none font-semibold disabled:opacity-80"
            />
          </div>

          <div className="w-full flex flex-col space-y-3 mt-5">
            {editPassword ? (
              <UpdatePasswordForm setEdit={() => setEditPassword(false)} />
            ) : (
              <>
                <Label className="font-semibold">Password</Label>
                <Input
                  type="password"
                  className="outline-none font-semibold disabled:opacity-80"
                  placeholder="************"
                  readOnly
                  disabled
                />
                <Button
                  className="w-max bg-sky-800 hover:bg-sky-900 text-white"
                  onClick={() => setEditPassword(true)}
                >
                  Edit <Edit />
                </Button>
              </>
            )}
          </div>

          {user && user.role === "user" && !user.isSellerApproved && (
            <div className="w-full flex flex-col space-y-1 mt-5">
              <Label className="font-semibold">
                Become Seller:
                {user && (
                  <span>
                    {user?.isSellerRequested
                      ? "Requested"
                      : user.isSellerRejected
                      ? "Rejected"
                      : ""}
                  </span>
                )}
              </Label>
              {user && !user.isSellerRequested && !user.isSellerRejected && (
                <Button
                  className="w-max bg-sky-800 hover:bg-sky-900 text-white disabled:opacity-50"
                  disabled={!user || becomeSellerMutation.isPending}
                  onClick={() => becomeSellerMutation.mutate()}
                >
                  {becomeSellerMutation.isPending ? "Requesting..." : "Request"}
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      <Card title="Danger Zone" size="small" style={{ marginTop: "30px" }}>
        {user && user.role !== "admin" && (
          <DeleteAccountModal className="w-max" />
        )}
      </Card>
    </div>
  );
};

export default ProfilePage;
