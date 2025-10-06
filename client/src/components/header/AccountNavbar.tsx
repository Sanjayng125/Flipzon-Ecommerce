import { Loader2, LogOut, ShoppingCartIcon, Sidebar } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface AccountNavbarProps {
  setShow: (show: React.SetStateAction<boolean>) => void;
  manualLogoutRef: React.RefObject<boolean>;
  isLoading: boolean;
  Logout: (fromAllDevices?: boolean) => void;
}

export const AccountNavbar = ({
  setShow,
  manualLogoutRef,
  isLoading,
  Logout,
}: AccountNavbarProps) => {
  return (
    <nav className="z-50 bg-white">
      <div className="w-full p-2">
        <div className="w-max">
          <Link href={"/"}>
            <div className="flex items-center gap-1 text-sky-800">
              <ShoppingCartIcon className="size-8 sm:size-10 aspect-square" />
              <p className="text-2xl font-bold">Flipzon</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="border-border-default border-b-2 flex items-center justify-between p-2 pt-0">
        <div className="flex items-center">
          <button
            onClick={() => {
              setShow((prev) => !prev);
            }}
            className="md:hidden border-r pr-2"
          >
            <Sidebar />
          </button>
          <h1 className="font-bold text-xl ml-2">Dashboard</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isLoading}>
            <Button variant={"destructive"} disabled={isLoading} size={"sm"}>
              <span className="max-sm:hidden">
                {isLoading ? "Loading..." : "Logout"}
              </span>
              <span>
                {isLoading ? <Loader2 className="animate-spin" /> : <LogOut />}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              disabled={isLoading}
              onClick={() => {
                manualLogoutRef.current = true;
                Logout();
              }}
              className="border border-border-default mb-1 text-blue-600"
            >
              <span>
                {isLoading ? "Loading..." : "Logout from: This device"}
              </span>
              <span>{isLoading && <Loader2 className="animate-spin" />}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isLoading}
              onClick={() => {
                manualLogoutRef.current = true;
                Logout(true);
              }}
              className="border border-border-default text-blue-600"
            >
              <span>
                {isLoading ? "Loading..." : "Logout from: All devices"}
              </span>
              <span>{isLoading && <Loader2 className="animate-spin" />}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};
