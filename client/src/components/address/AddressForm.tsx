"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { z } from "zod";
import useFetch from "@/hooks/useFetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Image from "next/image";
import { AddressSchema } from "@/schemas";
import { InputField } from "../forms/fields/InputField";

interface AddressFormProps {
  className?: string;
  setOpen: () => void;
  edit?: boolean;
  data?: Address;
}

export function AddressForm({
  className,
  setOpen,
  edit,
  data,
}: AddressFormProps) {
  const [query, setQuery] = useState(edit && data ? data.country : "India");
  const [countries, setCountries] = useState<CountryProps[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>(
    edit && data ? data.country : "India"
  );
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

    const debounce = setTimeout(fetchCountries, 400);
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

  const form = useForm<z.infer<typeof AddressSchema>>({
    resolver: zodResolver(AddressSchema),
    defaultValues: {
      fullName: edit && data ? data.fullName : "",
      phoneNumber: edit && data ? data.phoneNumber : "",
      streetAddress: edit && data ? data.streetAddress : "",
      city: edit && data ? data.city : "",
      state: edit && data ? data.state : "",
      postalCode: edit && data ? data.postalCode : "",
      country: query,
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: async (data: z.infer<typeof AddressSchema>) => {
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

  const updateAddressMutation = useMutation({
    mutationFn: async (udpateData: z.infer<typeof AddressSchema>) => {
      if (!data) {
        throw new Error("All fields are required!");
      }
      if (!udpateData) {
        throw new Error("All fields are required!");
      }

      const res = await fetchWithAuth(`/address/${data._id}`, {
        method: "PATCH",
        body: JSON.stringify(udpateData),
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to update address!");
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

  const onSubmit = async (data: z.infer<typeof AddressSchema>) => {
    setCountries([]);
    if (edit) {
      updateAddressMutation.mutate(data);
    } else {
      addAddressMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form
        className={`grid items-start gap-4 ${className}`}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <InputField control={form.control} name="fullName" label="Fullname" />
        <InputField
          control={form.control}
          name="phoneNumber"
          label="Phone Number"
        />
        <InputField
          control={form.control}
          name="streetAddress"
          label="Street Address"
        />
        <InputField control={form.control} name="city" label="City" />
        <InputField control={form.control} name="state" label="State" />
        <InputField
          control={form.control}
          name="postalCode"
          label="Postal Code"
        />

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
            className="bg-sky-800 hover:bg-sky-900 text-white disabled:opacity-80"
            disabled={
              addAddressMutation.isPending || updateAddressMutation.isPending
            }
          >
            {edit
              ? updateAddressMutation.isPending
                ? "Updating..."
                : "Update Address"
              : addAddressMutation.isPending
              ? "Adding..."
              : "Add Address"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
