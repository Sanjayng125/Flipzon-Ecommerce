interface CloudinaryImage {
    public_id: string
    url: string
}

interface UserProps {
    _id: string
    name: string
    email: string
    avatar: CloudinaryImage
    role: string
    isVerified: boolean
    phone: string
    storeName: string,
    storeLogo: CloudinaryImage
    storeDescription: string,
    isSellerApproved: boolean
    isSellerRequested: boolean
    isSellerRejected: boolean
    isBanned: boolean
    createdAt: string
}

interface Category {
    _id: string
    image: CloudinaryImage
    name: string
    slug: string
    parentCategory?: string
    isFeatured: boolean
    showInCategoryBar: boolean
}

interface Address {
    _id: string
    fullName: string
    phoneNumber: string
    streetAddress: string
    city: string
    state: string
    postalCode: string
    country: string
    isDefault: boolean
}

interface Product {
    _id: string
    name: string
    description: string
    price: number
    discount?: number
    images: CloudinaryImage[]
    category: {
        _id: string
        name: string
        parentCategory?: string
    }
    brand?: string
    stock: number
    sold: number
    seller: {
        _id: string
        name: string
        storeName: string
    }
    isFeatured: boolean
    totalRatings: number
    avgRating: number
    latestReviews: Review[]
}

interface Cart {
    _id: string
    items: CartItem[]
}

interface CartItem {
    product: Product
    quantity: number
}

interface Wishlist {
    _id: string
    items: Product[]
}

interface CountryProps {
    name: string;
    code: string;
    flag: string;
}

interface OrderItem {
    _id: string
    cancelledAt: string | null
    deliveredAt: string | null
    createdAt: string
    price: number
    product: Product
    quantity: number
    seller: {
        _id: string
        name: string
    }
    status: string
    trackingNumber: string | null
}

interface Order {
    _id: string
    items: OrderItem[]
    paymentMethod: string
    paymentStatus: string
    totalAmount: number
    user: {
        name: string
        email: string
        phone: string
        userId: string
    }
    shippingAddress: {
        fullName: string
        email: string
        phone: string
        address: string
        city: string
        state: string
        country: string
        postalCode: string
    }
    createdAt: string
}

interface HeroProps {
    _id: string
    heroLink?: string
    image: CloudinaryImage
}

interface AdminOverview {
    productsCount: number
    usersCount: number
    sellersCount: number
    ordersCount: number
    newSellersCount: number
    newSellerRequestsCount: number
    totalRevenue: number
    totalProductsSold: number
    revenuePerMonth: {
        month: string
        revenue: number
    }[]
    usersPerMonth: {
        month: string
        users: number
    }[]
}

interface SellerOverview {
    productsCount: number
    totalOrdersCount: number
    ordersCount: number
    pendingOrdersCount: number
    cancelledOrdersCount: number
    totalRevenue: number
    totalProductsSold: number
    revenuePerMonth: {
        month: string
        revenue: number
    }[]
    ordersPerMonth: {
        month: string
        orders: number
    }[]
}

interface Review {
    _id: string
    rating: number
    title: string
    reviewContent?: string
    user: {
        _id: string
        name: string
        avatar: CloudinaryImage
    }
    product: Product | string
    createdAt: string
}

interface CheckoutItem {
    product: string
    quantity: number
}

interface CheckoutSession {
    user: string
    items: {
        product: Product
        quantity: number
    }[]
}
