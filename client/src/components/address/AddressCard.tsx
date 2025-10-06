import React from "react";
import { VerticalSeperator } from "../VerticalSeperator";
import { AddUpdateAddress } from "./AddUpdateAddress";

interface AddressCardProps {
  isPending: boolean;
  removeAddress: (id: string) => void;
  updateDefaultAddress: (id: string) => void;
  data: Address;
}

export const AddressCard = ({
  data,
  isPending,
  updateDefaultAddress,
  removeAddress,
}: AddressCardProps) => {
  const {
    fullName,
    city,
    country,
    isDefault,
    phoneNumber,
    _id,
    postalCode,
    state,
    streetAddress,
  } = data;

  return (
    <div className="w-full border-2 rounded-md flex flex-col overflow-hidden">
      {isDefault && (
        <h3 className="font-semibold truncate border-b-[#CBD5E1] border-b-2 p-2 px-4">
          Default
        </h3>
      )}
      <div className="w-full h-full p-4 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold truncate text-sm">{fullName}</h3>
          <p className="text-sm truncate">{streetAddress}</p>
          <p className="text-sm truncate">{postalCode}</p>
          <p className="text-sm truncate">{city}</p>
          <p className="text-sm truncate">{state}</p>
          <p className="text-sm truncate">Phone number: {phoneNumber}</p>
          <p className="text-sm truncate">{country}</p>
        </div>

        <div className="flex items-center gap-1 mt-3">
          <AddUpdateAddress edit disabled={isPending} data={data} />
          <VerticalSeperator height={18} width={2} />
          <button
            className={`cursor-pointer px-2 text-sm text-sky-800 shrink-0 disabled:opacity-80 hover:scale-95`}
            disabled={isPending}
            onClick={() => {
              removeAddress(_id);
            }}
          >
            Remove
          </button>
          {!isDefault && (
            <>
              <VerticalSeperator height={18} width={2} />
              <button
                className="cursor-pointer text-sm pl-2 text-sky-800 shrink-0 disabled:opacity-80 hover:scale-95"
                disabled={isPending}
                onClick={() => {
                  updateDefaultAddress(_id);
                }}
              >
                Make Default
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
