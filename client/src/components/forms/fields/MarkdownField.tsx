"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control, FieldValues, Path } from "react-hook-form";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

export function MarkdownField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  disabled,
}: MarkdownFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem data-color-mode="light">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="border rounded-md">
              <MDEditor
                value={field.value ?? ""}
                onChange={(val) => field.onChange(val === "" ? undefined : val)}
                preview="edit"
                height={200}
                visibleDragbar={false}
                textareaProps={{
                  placeholder: placeholder ?? `Enter ${label}`,
                  disabled,
                }}
                className="[&_ul]:list-disc [&_ol]:list-decimal"
              />
            </div>
          </FormControl>
          <FormMessage className="text-sm text-red-500" />
        </FormItem>
      )}
    />
  );
}
