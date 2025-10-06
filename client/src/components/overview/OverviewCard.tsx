import React from "react";

export const OverviewCard = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="bg-white rounded-xl shadow p-4">
    <p className="text-sm text-gray-600">{label}</p>
    <p className="text-xl font-semibold mt-1">{value}</p>
  </div>
);
