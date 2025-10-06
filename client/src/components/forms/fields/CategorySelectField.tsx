"use client";

import { CategorySelector } from "@/components/category/CategorySelector";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control, FieldValues, Path } from "react-hook-form";

interface CategorySelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

export function CategorySelectField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  disabled = false,
}: CategorySelectFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem key={field.value}>
          <FormLabel>{label}</FormLabel>
          <CategorySelector
            value={field.value ?? ""}
            onChange={field.onChange}
            placeholder={placeholder}
            disabled={disabled}
          />
          <FormMessage className="text-sm text-red-500" />
        </FormItem>
      )}
    />
  );
}
