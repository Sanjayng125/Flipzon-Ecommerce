"use client";

import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Rating } from "@smastrom/react-rating";
import { Control } from "react-hook-form";

interface RatingFieldProps {
  control: Control<any>;
  name: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function RatingField({
  control,
  name,
  label,
  className,
  disabled,
}: RatingFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <label className="text-sm font-medium">{label}</label>}
          <FormControl>
            <Rating
              value={field.value}
              onChange={(val: number) => field.onChange(val)}
              className={className || "max-w-28"}
              isDisabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
