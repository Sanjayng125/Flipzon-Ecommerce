"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AddressForm } from "./AddressForm";

export function AddUpdateAddress({
  edit = false,
  disabled = false,
  data,
}: {
  edit?: boolean;
  disabled?: boolean;
  data?: Address;
}) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild className="hover:scale-95">
          {edit ? (
            <button
              className="cursor-pointer pr-2 text-sm text-sky-800 shrink-0 disabled:opacity-80"
              disabled={disabled}
            >
              Edit
            </button>
          ) : (
            <div className="border-dashed border-2 border-border-default rounded-md p-2 lg:p-4 flex items-center justify-center cursor-pointer text-lg font-semibold">
              <p className="shrink-0">Add Address</p>
              <Plus className="size-6" />
            </div>
          )}
        </DialogTrigger>
        <DialogContent className="max-h-[90dvh] sm:max-w-[425px] bg-white overflow-y-auto hide-scrollbar pb-3">
          <DialogHeader>
            <DialogTitle>
              {edit ? "Update Address" : "Add new Address"}
            </DialogTitle>
          </DialogHeader>
          <AddressForm setOpen={() => setOpen(false)} edit={edit} data={data} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild className="hover:scale-95">
        {edit ? (
          <button
            className="cursor-pointer pr-2 text-sm text-sky-800 shrink-0 disabled:opacity-80"
            disabled={disabled}
          >
            Edit
          </button>
        ) : (
          <div className="border-dashed border-2 rounded-md p-2 lg:p-4 flex items-center justify-center cursor-pointer text-lg font-semibold">
            <p className="shrink-0">Add Address</p>
            <Plus className="size-6" />
          </div>
        )}
      </DrawerTrigger>
      <DrawerContent className="bg-white pb-3">
        <DrawerHeader className="text-left">
          <DrawerTitle>
            {edit ? "Update Address" : "Add new Address"}
          </DrawerTitle>
        </DrawerHeader>
        <AddressForm
          setOpen={() => setOpen(false)}
          className="px-2 py-2 overflow-y-auto"
          data={data}
          edit={edit}
        />
      </DrawerContent>
    </Drawer>
  );
}
