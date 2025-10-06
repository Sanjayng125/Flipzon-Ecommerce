"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconType } from "react-icons/lib";

interface LinkProps {
  links: {
    url: string;
    name: string;
    icon: IconType;
  }[];
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DashboardSidebarLinks = ({ links, setShow }: LinkProps) => {
  const pathname = usePathname();

  const isActive = (name: string) => {
    return pathname.startsWith(name);
  };

  return (
    <>
      {links.map((link, i) => (
        <Link key={i} href={link.url}>
          <div
            className={`flex items-center gap-2 p-2 hover:bg-sky-900 hover:text-white shrink-0 
          ${isActive(`${link.url}`) ? "bg-sky-800 text-white" : ""}
          `}
            onClick={() => setShow(false)}
          >
            <p>{<link.icon />}</p>
            <p className="shrink-0">{link.name}</p>
          </div>
        </Link>
      ))}
    </>
  );
};
