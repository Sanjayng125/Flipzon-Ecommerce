declare module "@cashfreepayments/cashfree-js" {
    /** Mode of Cashfree environment */
    type CashfreeMode = "sandbox" | "production";

    /** Options passed when loading Cashfree SDK */
    interface CashfreeInitOptions {
        mode: CashfreeMode;
    }

    interface CheckoutOptions {
        paymentSessionId: string;
        redirectTarget?: "_self" | "_blank" | "_modal" | string;
    }

    /** Cashfree SDK instance */
    interface Cashfree {
        checkout(options: CheckoutOptions): Promise<void>;
    }

    export function load(options: CashfreeInitOptions): Promise<Cashfree>;
}
