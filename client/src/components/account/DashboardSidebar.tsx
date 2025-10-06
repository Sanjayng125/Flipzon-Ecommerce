"use client";

import { useAuth } from "@/hooks/useAuth";
import { adminLinks, sellerLinks, userLinks } from "@/utils/links";
import React, { RefObject } from "react";
import { DashboardSidebarLinks } from "./DashboardSidebarLinks";

interface DashboardSidebarProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarRef: RefObject<HTMLDivElement | null>;
}

const DashboardSidebar = ({
  show,
  setShow,
  sidebarRef,
}: DashboardSidebarProps) => {
  const { user } = useAuth();

  const getLinks = () => {
    return user
      ? user.role === "admin"
        ? adminLinks
        : user.role === "seller"
        ? sellerLinks
        : user.role === "user"
        ? userLinks
        : []
      : [];
  };

  if (!user) return null;

  return (
    <div
      ref={sidebarRef}
      className={`min-w-56 h-max md:min-h-[calc(100vh-85px)] bg-white border-border-default z-40 md:rounded-md overflow-hidden max-md:w-full max-md:absolute max-md:transition-all max-md:duration-300 ${
        show ? "max-md:translate-y-0" : "max-md:-translate-y-full"
      }
    `}
    >
      <DashboardSidebarLinks links={getLinks()} setShow={setShow} />
    </div>
  );
};

export default DashboardSidebar;
