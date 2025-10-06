import { capatilize } from "@/utils";
import { Steps } from "antd";

const statusSteps = ["pending", "processing", "shipped", "delivered"];

const getStatusIndex = (status: string) => statusSteps.indexOf(status);

export const OrderStatus = ({ status }: { status: string }) => {
  return (
    <Steps
      current={getStatusIndex(status)}
      items={statusSteps.map((step) => ({
        title: capatilize(step),
      }))}
      status={status === "delivered" ? "finish" : "process"}
      responsive
      size="small"
      className="max-w-4xl"
    />
  );
};
