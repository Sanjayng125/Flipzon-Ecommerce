import { Cashfree } from "cashfree-pg";

const {
  CASHFREE_CLIENT_ID,
  CASHFREE_CLIENT_SECRET,
  CASHFREE_VERSION,
  CASHFREE_APP_ENV,
} = process.env;

if (!CASHFREE_CLIENT_ID || !CASHFREE_CLIENT_SECRET || !CASHFREE_VERSION) {
  throw new Error("❌ Cashfree environment variables are missing!");
}

Cashfree.XClientId = CASHFREE_CLIENT_ID;
Cashfree.XClientSecret = CASHFREE_CLIENT_SECRET;
Cashfree.XEnvironment =
  CASHFREE_APP_ENV === "production"
    ? Cashfree.Environment.PRODUCTION
    : Cashfree.Environment.SANDBOX;

export { Cashfree };
