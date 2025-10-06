"use client";

import { OrderStatus } from "@/components/order/OrderStatus";
import useFetch from "@/hooks/useFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Card, Tag, Select } from "antd";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { capatilize, NOT_FOUND_IMAGE } from "@/utils";
import { CancelOrder } from "@/components/order/CancelOrder";
import { Spinner } from "@/components/Spinner";

const statusOptions = ["pending", "processing", "shipped", "delivered"];

const SellerOrderPage = () => {
  const { fetchWithAuth } = useFetch();
  const { id } = useParams<{ id: string }>();
  const [updating, setUpdating] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: order,
    isPending,
    refetch,
  } = useQuery<Order>({
    queryKey: [`get-seller-order-${id}`],
    queryFn: async () => {
      const res = await fetchWithAuth(`/orders/${id}`);
      return res?.success ? res.order : null;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: async ({
      itemId,
      status,
    }: {
      itemId: string;
      status: string;
    }) => {
      setUpdating(itemId);
      return await fetchWithAuth(`/orders/seller/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ itemId, orderStatus: status }),
      });
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Order status updated!");
        refetch();
        queryClient.invalidateQueries({ queryKey: ["get-seller-overview"] });
      } else {
        toast.error(res.message || "Failed to update status");
      }
      setUpdating(null);
    },
    onError: () => {
      toast.error("Something went wrong!");
      setUpdating(null);
    },
  });

  if (isPending) {
    return <Spinner className="min-h-screen" />;
  }

  if (!order) {
    return <p className="text-center text-lg">Order not found.</p>;
  }

  return (
    <div className="w-full mx-auto p-2 rounded-md flex flex-col gap-2">
      <Card title={`Order #${order._id}`} className="mb-5" size="small">
        <p>
          <strong>Payment Method:</strong> {order.paymentMethod.toUpperCase()}
        </p>
        <p>
          <strong>Payment Status:</strong>{" "}
          <Tag color={order.paymentStatus === "paid" ? "green" : "red"}>
            {order.paymentStatus.toUpperCase()}
          </Tag>
        </p>
      </Card>

      <div>
        {order.items.map((item) => (
          <Card key={item._id} className="mb-3" size="small">
            <div className="flex flex-col gap-3 justify-center">
              <Image
                src={item?.product?.images?.[0]?.url ?? NOT_FOUND_IMAGE}
                alt={item.product?.name ?? ""}
                width={80}
                height={80}
                className="rounded w-24 h-24"
              />
              <div>
                <p className="font-semibold line-clamp-2">
                  {item.product?.name ?? "Product not found!"}
                </p>
                <p>Price: ₹{item.price}</p>
                <p>Quantity: {item.quantity}</p>
                <p className="font-semibold">
                  Total: ₹{item.price * item.quantity}
                </p>
                <p>Tracking Number: {item.trackingNumber ?? "N/A"}</p>

                {item.status === "cancelled" || item.status === "delivered" ? (
                  <p className="font-semibold">
                    Status:{" "}
                    <Tag color={item.status === "cancelled" ? "red" : "green"}>
                      {capatilize(item.status)}
                    </Tag>
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="font-semibold">Status:</p>
                    <OrderStatus status={item.status} />

                    <p className="font-semibold">Update Status:</p>
                    <Select
                      value={item.status}
                      onChange={(value) =>
                        updateStatus({ itemId: item._id, status: value })
                      }
                      loading={updating === item._id}
                      style={{ width: 200 }}
                    >
                      {statusOptions.map((s) => (
                        <Select.Option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </Select.Option>
                      ))}
                    </Select>
                    <CancelOrder
                      orderId={order._id}
                      itemId={item._id}
                      isSeller
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Customer Details" size="small">
        <p>
          <strong>Name:</strong> {order.user.name}
        </p>
        <p>
          <strong>Email:</strong> {order.user.email}
        </p>
        <p>
          <strong>Phone:</strong> {order.user.phone}
        </p>
      </Card>

      <Card title="Shipping Details" size="small">
        <p>
          <strong>Name:</strong> {order.shippingAddress.fullName}
        </p>
        <p>
          <strong>Email:</strong> {order.shippingAddress.email}
        </p>
        <p>
          <strong>Phone:</strong> {order.shippingAddress.phone}
        </p>
        <p>
          <strong>Address:</strong>{" "}
          {`${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.country}, ${order.shippingAddress.postalCode}`}
        </p>
      </Card>
    </div>
  );
};

export default SellerOrderPage;
