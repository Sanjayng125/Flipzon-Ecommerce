import { Loader2 } from "lucide-react";
import React from "react";

interface SpinnerProps {
  className?: string;
  spinnerClassName?: string;
}

export const Spinner = ({ className, spinnerClassName }: SpinnerProps) => {
  return (
    <div className={`flex justify-center items-center my-1 ${className}`}>
      <Loader2 className={`size-10 animate-spin ${spinnerClassName}`} />
    </div>
  );
};
