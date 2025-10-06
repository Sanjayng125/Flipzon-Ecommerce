import { Resend } from "resend";
import {
  ORDER_CANCELLED_TEMPLATE,
  ORDER_PLACED_TEMPLATE,
  OTP_VERIFY_TEMPLATE,
  REFUND_NOTIFICATION_TEMPLATE,
  RESET_PASSWORD_TEMPLATE,
} from "../mail/templates.js";

export const sendOtp = async (to, otp) => {
  if (!process.env.RESEND_API_KEY) {
    console.log("Resend API key is not set");
    return { error: "Resend API key is not set" };
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: "Flipzon <onboarding@resend.dev>",
      to: [to],
      subject: "Verify your account",
      html: OTP_VERIFY_TEMPLATE(otp),
    });

    if (error) {
      return { error };
    }

    return data;
  } catch (error) {
    console.log(error);
    return { error };
  }
};

export const sendResetPassword = async (to, url) => {
  if (!process.env.RESEND_API_KEY) {
    console.log("Resend API key is not set");
    return { error: "Resend API key is not set" };
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: "Flipzon <onboarding@resend.dev>",
      to: [to],
      subject: "Reset Password",
      html: RESET_PASSWORD_TEMPLATE(url),
    });

    if (error) {
      return { error };
    }

    return data;
  } catch (error) {
    console.log(error);
    return { error };
  }
};

export const sendOrderPlaced = async (
  to,
  {
    customerName,
    orderId,
    orderDate,
    items,
    orderAmount,
    shippingAddress,
    orderTrackingUrl,
  }
) => {
  if (!process.env.RESEND_API_KEY) {
    console.log("Resend API key is not set");
    return { error: "Resend API key is not set" };
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: "Flipzon <onboarding@resend.dev>",
      to: [to],
      subject: "Order Confirmation",
      html: ORDER_PLACED_TEMPLATE({
        customerName,
        orderId,
        orderDate,
        items,
        orderAmount,
        shippingAddress,
        orderTrackingUrl,
      }),
    });

    if (error) {
      return { error };
    }

    return data;
  } catch (error) {
    console.log(error);
    return { error };
  }
};

export const sendOrderCancelled = async (
  to,
  { customerName, orderId, reason, orderTrackingUrl }
) => {
  if (!process.env.RESEND_API_KEY) {
    console.log("Resend API key is not set");
    return { error: "Resend API key is not set" };
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: "Flipzon <onboarding@resend.dev>",
      to: [to],
      subject: "Order Cancelled",
      html: ORDER_CANCELLED_TEMPLATE({
        customerName,
        orderId,
        reason,
        orderTrackingUrl,
      }),
    });

    if (error) {
      return { error };
    }

    return data;
  } catch (error) {
    console.log(error);
    return { error };
  }
};

export const sendRefundNotification = async (
  to,
  { customerName, orderId, itemId, refundAmount, refundStatus }
) => {
  if (!process.env.RESEND_API_KEY) {
    console.log("Resend API key is not set");
    return { error: "Resend API key is not set" };
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: "Flipzon <onboarding@resend.dev>",
      to: [to],
      subject: "Refund Notification",
      html: REFUND_NOTIFICATION_TEMPLATE({
        customerName,
        orderId,
        itemId,
        refundAmount,
        refundStatus,
      }),
    });

    if (error) {
      return { error };
    }

    return data;
  } catch (error) {
    console.log(error);
    return { error };
  }
};
