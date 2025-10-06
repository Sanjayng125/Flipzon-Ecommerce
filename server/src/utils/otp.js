import otpGenerator from "otp-generator";

export const generateOTP = () => {
  return otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    digits: true,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
};
