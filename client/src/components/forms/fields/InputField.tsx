"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Control, FieldValues, Path } from "react-hook-form";

interface InputFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  type?: string;
  number?: boolean;
  password?: boolean;
  disabled?: boolean;
  className?: string;
}

export function InputField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  number = false,
  disabled = false,
  className,
  password,
}: InputFieldProps<T>) {
  const [show, setShow] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="gap-0">
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <div className="relative">
              <Input
                type={password ? (show ? "text" : "password") : type}
                name={name}
                placeholder={
                  placeholder ? placeholder : label ? `Enter ${label}` : ""
                }
                value={field.value}
                onChange={(e) =>
                  number
                    ? field.onChange(
                        e.target.value === ""
                          ? undefined
                          : e.target.valueAsNumber
                      )
                    : field.onChange(e.target.value)
                }
                disabled={disabled}
                className={`${className}`}
              />
              {password && (
                <Button
                  className="absolute right-0 top-0 cursor-pointer"
                  variant={"ghost"}
                  onClick={() => setShow(!show)}
                  type="button"
                >
                  {show ? <Eye /> : <EyeOff />}
                </Button>
              )}
            </div>
          </FormControl>
          <FormMessage className="px-2 text-xs sm:text-sm text-red-500" />
        </FormItem>
      )}
    />
  );
}
