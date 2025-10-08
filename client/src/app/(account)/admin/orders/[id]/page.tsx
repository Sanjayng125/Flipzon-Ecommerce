"use client";

import { OrderStatus } from "@/components/order/OrderStatus";
import useFetch from "@/hooks/useFetch";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Card, Tag } from "antd";
import Image from "next/image";
import { capatilize, NOT_FOUND_IMAGE } from "@/utils";
import { Spinner } from "@/components/Spinner";
import Link from "next/link";

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
    <div className="w-full mx-auto p-2 rounded-md flex flex-col gap-2">
      <Card title={`Order #${order._id}`} className="mb-5" size="small">
        <div>
          {order.items.map((item) => (
            <div
              key={item.product?._id}
              className="flex flex-col gap-3 justify-center mb-3"
            >
              <Image
                src={item?.product?.images?.[0]?.url ?? NOT_FOUND_IMAGE}
                alt={item.product?.name ?? ""}
                width={60}
                height={60}
                className="rounded w-32 h-32 object-contain"
              />
              <div>
                <Link
                  href={`/products/${item.product._id}`}
                  className="font-semibold line-clamp-2 text-black! hover:underline!"
                >
                  {item.product?.name ?? "Product not found!"}
                </Link>
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
          ))}
        </div>
      </Card>

      <Card
        title="Payment Details"
        size="small"
        className="mt-4 border-border-default"
      >
        <p className="flex items-center gap-1">
          <span className="font-semibold">Payment Method:</span>
          <Tag color={order.paymentStatus === "paid" ? "blue" : "red"}>
            {order.paymentMethod.toUpperCase()}
          </Tag>
        </p>
        <p className="flex items-center gap-1 mt-2">
          <span className="font-semibold">Payment Status:</span>{" "}
          <Tag color={order.paymentStatus === "paid" ? "green" : "red"}>
            {order.paymentStatus.toUpperCase()}
          </Tag>
        </p>
      </Card>

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
