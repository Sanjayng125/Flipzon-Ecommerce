"use client";

import { DeleteAccountModal } from "@/components/account/DeleteAccountModal";
import { UpdatePasswordForm } from "@/components/account/UpdatePasswordForm";
import { UpdateProfileForm } from "@/components/account/UpdateProfileForm";
import { UpdateStoreForm } from "@/components/account/UpdateStoreForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "antd";
import { Edit } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

const ProfilePage = () => {
  const [edit, setEdit] = useState(false);
  const [editStore, setEditStore] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex justify-center p-2">
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

          {editStore ? (
            <UpdateStoreForm
              storeName={user.storeName}
              storeDescription={user.storeDescription}
              storeLogoUrl={user.storeLogo.url}
              setEdit={() => setEditStore(false)}
            />
          ) : (
            <div className="w-full flex flex-col space-y-1 mt-5 border-t-2 pt-5">
              <h1 className="text-xl font-semibold">Seller Details</h1>
              <div className="w-full flex flex-col space-y-3 mt-5">
                <div className="p-1 rounded-md bg-gray-400 w-max">
                  <Image
                    src={user.storeLogo.url}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="w-20 h-20 object-contain"
                  />
                </div>
                <Label className="font-semibold">Store Name</Label>
                <Input
                  value={user.storeName}
                  placeholder="Set Store Name"
                  className="outline-none font-semibold disabled:opacity-80"
                  disabled
                  readOnly
                />
                <Label className="font-semibold">Store Description</Label>
                <Textarea
                  rows={4}
                  value={user.storeDescription}
                  placeholder="Set Store Description"
                  className="outline-none font-semibold disabled:opacity-80 resize-none"
                  disabled
                  readOnly
                />
                <Button
                  className="w-max bg-sky-800 hover:bg-sky-900 text-white"
                  onClick={() => setEditStore(true)}
                >
                  Edit <Edit />
                </Button>
              </div>
            </div>
          )}

          <Card title="Danger Zone" size="small" style={{ marginTop: "30px" }}>
            {user && user.role !== "admin" && (
              <DeleteAccountModal className="w-max" />
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
