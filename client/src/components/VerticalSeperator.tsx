import React from "react";

export const VerticalSeperator = React.memo(
  ({
    height = 20,
    width = 2,
    className = "",
  }: {
    height?: number;
    width?: number;
    className?: string;
  }) => {
    return (
      <div className="mx-0">
        <div
          style={{
            borderLeftWidth: `${width}px`,
            height: `${height}px`,
          }}
          className={`border-[#82858b] ${className}`}
        />
      </div>
    );
  }
);

VerticalSeperator.displayName = "VerticalSeperator";
