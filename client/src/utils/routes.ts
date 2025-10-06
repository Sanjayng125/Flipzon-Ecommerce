export const ROUTES = {
    USER: ["/profile", "/cart", "/wishlist", "/orders", "/addresses", "/checkout"],
    SELLER: ["/seller"],
    ADMIN: ["/admin"],
};

export const PROTECTED_ROUTES = [
    ...ROUTES.USER,
    ...ROUTES.SELLER,
    ...ROUTES.ADMIN,
];
