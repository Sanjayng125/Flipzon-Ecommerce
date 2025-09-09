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
      <div class="footer">© 2025 Flipzon. All rights reserved.</div>
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
      color: #ffffff;
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
