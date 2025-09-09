import bcrypt from "bcrypt";

export const hashPassword = async (pass) => {
  return await bcrypt.hash(pass, 10);
};

export const verifyPassword = async (pass, userPass) => {
  return await bcrypt.compare(pass, userPass);
};
