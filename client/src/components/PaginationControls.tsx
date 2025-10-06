import { ArrowLeft, ArrowRight } from "lucide-react";
import React from "react";

interface PaginationControlsProps {
  currentPage: number;
  page: number;
  setPage: (value: React.SetStateAction<number>) => void;
  totalPages: number;
}

export const PaginationControls = ({
  currentPage,
  page,
  setPage,
  totalPages,
}: PaginationControlsProps) => {
  return (
    <div className="mt-6 flex justify-center items-center gap-4">
      <button
        disabled={page === 1}
        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        className="disabled:opacity-50"
      >
        <ArrowLeft />
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        disabled={page === totalPages}
        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        className="disabled:opacity-50"
      >
        <ArrowRight />
      </button>
    </div>
  );
};
