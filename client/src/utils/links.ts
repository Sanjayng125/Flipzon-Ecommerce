import {
    BadgeCheck,
    GalleryHorizontal,
    Heart,
    LayoutDashboard,
    MapPin,
    Package,
    Plus,
    ShoppingCart,
    Store,
    Tags,
    User,
    Users,
} from "lucide-react";

export const userLinks = [
    {
        url: "/profile",
        name: "Your Profile",
        icon: User,
    },
    {
        url: "/cart",
        name: "Your Cart",
        icon: ShoppingCart,
    },
    {
        url: "/addresses",
        name: "Your Adresses",
        icon: MapPin,
    },
    {
        url: "/wishlist",
        name: "Your wishlist",
        icon: Heart,
    },
    {
        url: "/orders",
        name: "Your orders",
        icon: Package,
    },
];

export const adminLinks = [
    {
        url: "/admin/overview",
        name: "Overview",
        icon: LayoutDashboard,
    },
    {
        url: "/admin/profile",
        name: "Your Profile",
        icon: User,
    },
    {
        url: "/admin/products",
        name: "Products",
        icon: Package,
    },
    {
        url: "/admin/categories",
        name: "Categories",
        icon: Tags,
    },
    {
        url: "/admin/orders",
        name: "Orders",
        icon: ShoppingCart,
    },
    {
        url: "/admin/sellers",
        name: "sellers",
        icon: Store,
    },
    {
        url: "/admin/users",
        name: "Users",
        icon: Users,
    },
    {
        url: "/admin/requests",
        name: "Requests",
        icon: BadgeCheck,
    },
    {
        url: "/admin/hero",
        name: "Hero Section",
        icon: GalleryHorizontal,
    },
];

export const sellerLinks = [
    {
        url: "/seller/overview",
        name: "Overview",
        icon: LayoutDashboard,
    },
    {
        url: "/seller/profile",
        name: "Your Profile",
        icon: User,
    },
    {
        url: "/seller/my-products",
        name: "My Products",
        icon: Package,
    },
    {
        url: "/seller/add-product",
        name: "Add New Product",
        icon: Plus,
    },
    {
        url: "/seller/orders",
        name: "Orders",
        icon: ShoppingCart,
    },
];