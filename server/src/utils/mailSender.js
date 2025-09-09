import { Resend } from "resend";
import {
  OTP_VERIFY_TEMPLATE,
  RESET_PASSWORD_TEMPLATE,
} from "../mail/templates.js";

export const sendOtp = async (to, otp) => {
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
