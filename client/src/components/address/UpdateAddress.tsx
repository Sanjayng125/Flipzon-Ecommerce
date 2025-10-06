"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import useFetch from "@/hooks/useFetch";
import { useIsMobile } from "@/hooks/use-mobile";

export function UpdateAddress() {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="border-dashed border-2 rounded-md p-2 lg:p-4 flex items-center justify-center cursor-pointer text-lg font-semibold">
            <p className="shrink-0">Add Address</p>
            <Plus className="size-6" />
          </div>
        </DialogTrigger>
        <DialogContent className="max-h-[90dvh] sm:max-w-[425px] bg-white overflow-y-auto hide-scrollbar pb-3">
          <DialogHeader>
            <DialogTitle>Add new Address</DialogTitle>
          </DialogHeader>
          <AddAddressForm setOpen={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div className="border-dashed border-2 rounded-md p-2 lg:p-4 flex items-center justify-center cursor-pointer text-lg font-semibold">
          <p className="shrink-0">Add Address</p>
          <Plus className="size-6" />
        </div>
      </DrawerTrigger>
      <DrawerContent className="bg-white pb-3">
        <DrawerHeader className="text-left">
          <DrawerTitle>Add new Address</DrawerTitle>
        </DrawerHeader>
        <AddAddressForm
          setOpen={() => setOpen(false)}
          className="px-2 py-2 overflow-y-auto"
        />
      </DrawerContent>
    </Drawer>
  );
}

interface CountryProps {
  name: string;
  code: string;
  flag: string;
}

interface ProfileFormProps {
  className?: string;
  setOpen: () => void;
}

function AddAddressForm({ className, setOpen }: ProfileFormProps) {
  const [query, setQuery] = useState("India");
  const [countries, setCountries] = useState<CountryProps[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("India");
  const [loading, setLoading] = useState(false);
  const { fetchWithAuth } = useFetch();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (query.length < 2 || selectedCountry) {
      setCountries([]);
      return;
    }

    const fetchCountries = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://restcountries.com/v3.1/name/${query}`);
        if (!res.ok) throw new Error("Failed to fetch countries");
        const data = await res.json();

        const formattedCountries = data.map((country: any) => ({
          name: country?.name?.common,
          code: country?.cca2,
          flag: country?.flags?.png,
        }));

        setCountries(formattedCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
        setCountries([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchCountries, 500);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleCountrySelect = (name: string) => {
    setQuery(name);
    setSelectedCountry(name);
    form.setValue("country", name);
    setCountries([]);
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCountry("");
    setQuery(e.target.value);
    form.setValue("country", e.target.value);
  };

  const AddAddressSchema = z.object({
    fullName: z
      .string()
      .min(3, { message: "Fullname must be atleast 3 characters long" }),
    phoneNumber: z
      .string()
      .min(9, { message: "Phone number must be atleast 9 characters long" }),
    streetAddress: z.string().min(10, {
      message: "Street Address must be atleast 10 characters long",
    }),
    city: z
      .string()
      .min(3, { message: "City must be atleast 3 characters long" }),
    state: z
      .string()
      .min(3, { message: "State must be atleast 3 characters long" }),
    postalCode: z
      .string()
      .min(4, { message: "Postal code must be atleast 4 characters long" }),
    country: z
      .string()
      .min(3, { message: "Country must be atleast 3 characters long" }),
  });

  const form = useForm<z.infer<typeof AddAddressSchema>>({
    resolver: zodResolver(AddAddressSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      streetAddress: "",
      city: "",
      state: "",
      postalCode: "",
      country: query,
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: async (data: z.infer<typeof AddAddressSchema>) => {
      if (!data) {
        throw new Error("All fields are required!");
      }

      const res = await fetchWithAuth("/address", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to add address!");
      }

      return res;
    },
    onSuccess: (res) => {
      toast.success(res.message);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["get-my-addresses"] });
      setOpen();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = async (data: z.infer<typeof AddAddressSchema>) => {
    setCountries([]);
    addAddressMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form
        className={`grid items-start gap-4 ${className}`}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="grid gap-2">
          <Label>Fullname</Label>
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage className="text-sm text-red-500" />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label>Phone number</Label>
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage className="text-sm text-red-500" />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label>Street Address</Label>
          <FormField
            control={form.control}
            name="streetAddress"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage className="text-sm text-red-500" />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label>City</Label>
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage className="text-sm text-red-500" />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label>State</Label>
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage className="text-sm text-red-500" />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label>Postal Code</Label>
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage className="text-sm text-red-500" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Country</label>
          <Input
            placeholder="Type to search..."
            value={query}
            onChange={handleQueryChange}
            className="w-full border p-2 rounded-md"
          />
          <FormField
            control={form.control}
            name="country"
            render={() => (
              <FormItem>
                <FormMessage className="text-sm text-red-500" />
              </FormItem>
            )}
          />
          {query && countries.length > 0 && (
            <div className="grid gap-2 bg-black/10 max-h-44 max-w-full overflow-y-auto border rounded-md p-2">
              {loading ? (
                <p>Loading...</p>
              ) : countries.length > 0 ? (
                countries.map((country) => (
                  <button
                    type="button"
                    key={country.code}
                    className="p-1 rounded-md hover:bg-sky-800 hover:text-white flex items-center gap-2"
                    onClick={() => handleCountrySelect(country.name)}
                  >
                    {country.flag && (
                      <span>
                        <Image
                          src={country.flag}
                          alt="Flag"
                          width={40}
                          height={40}
                          className="w-6"
                        />
                      </span>
                    )}
                    <p>{country.name}</p>
                  </button>
                ))
              ) : (
                <p>No countries found</p>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <Button
            className="bg-sky-800 text-white disabled:opacity-80"
            disabled={addAddressMutation.isPending}
          >
            {addAddressMutation.isPending ? "Adding..." : "Add Address"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
