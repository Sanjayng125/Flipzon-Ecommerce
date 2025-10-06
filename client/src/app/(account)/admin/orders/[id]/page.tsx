"use client";

import { OrderStatus } from "@/components/order/OrderStatus";
import useFetch from "@/hooks/useFetch";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Card, Tag } from "antd";
import Image from "next/image";
import { capatilize, NOT_FOUND_IMAGE } from "@/utils";
import { Spinner } from "@/components/Spinner";

const AdminOrderPage = () => {
  const { fetchWithAuth } = useFetch();
  const { id } = useParams<{ id: string }>();

  const { data: order, isPending } = useQuery<Order>({
    queryKey: ["get-order-admin", id],
    queryFn: async () => {
      const res = await fetchWithAuth(`/orders/${id}`);
      return res?.success ? res.order : null;
    },
    staleTime: 1000 * 60 * 5, // 5mins
  });

  if (isPending) {
    return <Spinner className="min-h-screen" />;
  }

  if (!order) {
    return <p className="text-center text-lg">Order not found.</p>;
  }

  return (
    <div className="w-full mx-auto p-2 sm:p-4 rounded-md flex flex-col gap-2">
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
          <Card key={item.product?._id} className="mb-3" size="small">
            <div className="flex flex-col gap-3 justify-center">
              <Image
                src={item?.product?.images?.[0]?.url ?? NOT_FOUND_IMAGE}
                alt={item.product?.name ?? ""}
                width={60}
                height={60}
                className="rounded w-20 h-20"
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
                <p>
                  Seller:{" "}
                  {item.seller?.name
                    ? `${item.seller.name} - #${item.seller._id}`
                    : "Seller not found!"}
                </p>
                <p>Tracking Number: {item.trackingNumber ?? "N/A"}</p>
                {item.status === "cancelled" ? (
                  <p className="font-semibold">
                    Status: <Tag color="red">{capatilize(item.status)}</Tag>
                  </p>
                ) : (
                  <div className="mt-2">
                    <OrderStatus status={item.status} />
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

export default AdminOrderPage;
