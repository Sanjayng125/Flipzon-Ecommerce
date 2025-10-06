export const OTP_VERIFY_TEMPLATE = (otp) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OTP Verification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 500px;
        margin: 20px auto;
        background: #ffffff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        text-align: center;
      }
      .logo {
        width: 100px;
        margin-bottom: 20px;
      }
      .otp {
        font-size: 24px;
        font-weight: bold;
        background: #f3f3f3;
        display: inline-block;
        padding: 10px 20px;
        border-radius: 5px;
        margin: 10px 0;
      }
      .footer {
        font-size: 12px;
        color: #777;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <img src="https://via.placeholder.com/100" alt="Logo" class="logo" />
      <h2>OTP Verification</h2>
      <p>Your One-Time Password (OTP) for verification is:</p>
      <div class="otp">${otp}</div>
      <p>This OTP is valid for only 5 minutes. Do not share it with anyone.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <div class="footer">© ${new Date().getFullYear()} Flipzon. All rights reserved.</div>
    </div>
  </body>
</html>
`;

export const RESET_PASSWORD_TEMPLATE = (resetLink) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Flipzon</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
      background: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #007bff;
      margin-bottom: 10px;
    }
    .btn {
      display: inline-block;
      padding: 12px 20px;
      font-size: 16px;
      color: #ffffff !important;
      background: #007bff;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 20px;
    }
    .btn:hover {
      background: #0056b3;
    }
    .footer {
      font-size: 12px;
      color: #666;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Flipzon</div>
    <h2>Reset Your Password</h2>
    <p>We received a request to reset your Flipzon account password. Click the button below to proceed:</p>
    <a href="${resetLink}" class="btn">Reset Password</a>
    <p class="footer">
      This link will expire in <strong>10 minutes</strong>.  
      If you did not request a password reset, please ignore this email or contact Flipzon support.
    </p>
  </div>
</body>
</html>
`;

export const ORDER_PLACED_TEMPLATE = ({
  customerName,
  orderId,
  orderDate,
  items,
  orderAmount,
  shippingAddress,
  orderTrackingUrl,
}) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Order Confirmation</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f8f9fa;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      }
      .header {
        background: #2563eb;
        color: #ffffff;
        padding: 20px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 22px;
      }
      .content {
        padding: 20px;
        color: #333333;
      }
      .order-summary {
        margin-top: 20px;
        border-top: 1px solid #ddd;
        padding-top: 15px;
      }
      .btn {
        display: inline-block;
        background: #2563eb;
        color: #ffffff !important;
        padding: 10px 18px;
        border-radius: 6px;
        text-decoration: none;
        font-size: 14px;
        margin-top: 20px;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        text-align: center;
        color: #888;
        padding: 15px;
        background: #f1f1f1;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1>Thank you for your order!</h1>
      </div>

      <!-- Content -->
      <div class="content">
        <p>Hi <strong>${customerName}</strong>,</p>
        <p>
          We’ve received your order <strong>#${orderId}</strong> placed on
          <strong>${orderDate}</strong>.
        </p>
        <p>
          Sit tight — we’ll send you another update once your order is shipped!
        </p>

        <!-- Order Summary -->
        <div class="order-summary">
          <h3>Order Summary</h3>
          <p><strong>Items:</strong> ${items}</p>
          <p><strong>Total:</strong> ₹${orderAmount}</p>
          <p><strong>Shipping Address:</strong><br /></p>
          <p>
            ${shippingAddress.fullName}<br />
            ${shippingAddress.address}<br />
            ${shippingAddress.city}, ${shippingAddress.state} - ${
  shippingAddress.postalCode
}<br />
            ${shippingAddress.country}<br />
            Phone: ${shippingAddress.phone}<br />
            Email: ${shippingAddress.email}
            <br />
          </p>
        </div>

        <a href="${orderTrackingUrl}" class="btn">Track My Order</a>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>© ${new Date().getFullYear()} Flipzon. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`;

export const ORDER_CANCELLED_TEMPLATE = ({
  customerName,
  orderId,
  reason,
  orderTrackingUrl,
}) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Order Cancelled</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f8f9fa;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      }
      .header {
        background: #dc2626;
        color: #ffffff;
        padding: 20px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 22px;
      }
      .content {
        padding: 20px;
        color: #333333;
      }
      .order-summary {
        margin-top: 20px;
        border-top: 1px solid #ddd;
        padding-top: 15px;
      }
      .btn {
        display: inline-block;
        background: #2563eb;
        color: #ffffff !important;
        padding: 10px 18px;
        border-radius: 6px;
        text-decoration: none;
        font-size: 14px;
        margin-top: 20px;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        text-align: center;
        color: #888;
        padding: 15px;
        background: #f1f1f1;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1>Your Order Has Been Cancelled</h1>
      </div>

      <!-- Content -->
      <div class="content">
        <p>Hi <strong>${customerName}</strong>,</p>
        <p>
          This mail is to inform you that your order
          <strong>#${orderId}</strong> has been cancelled.
        </p>

        <div class="order-summary">
          <h3>Cancellation Details</h3>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>
            You can check the latest status of this order on your order
            tracking page.
          </p>
        </div>

        <a href="${orderTrackingUrl}" class="btn">View Order Status</a>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>© ${new Date().getFullYear()} Flipzon. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`;

export const REFUND_NOTIFICATION_TEMPLATE = ({
  customerName,
  orderId,
  itemId,
  refundAmount,
  refundStatus,
}) => `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #d9534f;">Refund Update</h2>
      <p>Hi <strong>${customerName}</strong>,</p>

      <p>
        We wanted to update you regarding your refund for 
        <strong>Order ID:</strong> ${orderId}, <strong>Item ID:</strong> ${itemId}, Refund Amount: <strong>${refundAmount}</strong>
      </p>

      <p>
        <strong>Status:</strong> ${
          refundStatus === "SUCCESS"
            ? "✅ Refund Successful"
            : refundStatus === ("PENDING" || "ONHOLD")
            ? "⏳ Refund In Progress"
            : "❌ Refund Failed"
        }
      </p>

      ${
        refundStatus === "SUCCESS"
          ? `<p>The amount has been initiated and should reflect in your account soon.</p>`
          : refundStatus === ("PENDING" || "ONHOLD")
          ? `<p>Your refund request has been received and is currently being processed. We’ll notify you once it’s complete.</p>`
          : `<p>Your refund could not be processed. Please contact our support team for assistance.</p>`
      }

      <p style="margin-top: 20px;">Thank you for shopping with us.<br />Team Flipzon 🛒</p>
    </div>
`;
