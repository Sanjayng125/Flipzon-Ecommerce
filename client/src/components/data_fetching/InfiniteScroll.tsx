"use client";

import React, { useEffect, useRef } from "react";

type InfiniteScrollProps = {
  children: React.ReactNode;
  hasNextPage?: boolean;
  onLoadMore: () => void;
  isLoading?: boolean;
  threshold?: number;
  direction?: "vertical" | "horizontal";
  loader?: React.ReactNode;
  endPlaceholder?: string;
};

export const InfiniteScroll = ({
  children,
  hasNextPage,
  onLoadMore,
  isLoading,
  threshold = 200,
  direction = "vertical",
  loader = <p className="text-center py-4">Loading...</p>,
  endPlaceholder,
}: InfiniteScrollProps) => {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage && !isLoading) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin:
          direction === "vertical"
            ? `0px 0px ${threshold}px 0px`
            : `0px ${threshold}px 0px 0px`,
        threshold: 0,
      }
    );

    const node = triggerRef.current;
    if (node) observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [hasNextPage, onLoadMore, isLoading, threshold, direction]);

  return (
    <div
      className={
        direction === "horizontal"
          ? "flex overflow-x-visible gap-2"
          : "flex flex-col"
      }
    >
      {children}

      <div ref={triggerRef} className="h-1 w-1" />

      {isLoading && loader}
      {!hasNextPage && !isLoading && endPlaceholder && (
        <p className="text-center my-1 text-sm">{endPlaceholder}</p>
      )}
    </div>
  );
};
