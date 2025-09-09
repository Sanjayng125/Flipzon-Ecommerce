import otpGenerator from "otp-generator";

export const generateOTP = () => {
  return otpGenerator.generate(6, {
    upperCaseAlphabets: true,
    digits: true,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
};
