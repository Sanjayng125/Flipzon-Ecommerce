import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string()
        .min(5, { message: "Password must be atleast 5 characters long" })
        .max(30, { message: "Password can't be more than 30 characters long" }),
})

export const SignupSchema = z.object({
    name: z
        .string()
        .min(3, { message: "Name must be atleast 3 characters long" })
        .max(30, { message: "Name can't be more than 30 characters long" }),
    email: z.string().email(),
    password: z.string()
        .min(5, { message: "Password must be atleast 5 characters long" })
        .max(30, { message: "Password can't be more than 30 characters long" }),
    phone: z
        .string()
        .min(9, { message: "Phone number must be atleast 9 characters long" }),
})

export const UpdateProfileSchema = z.object({
    name: z
        .string()
        .min(3, { message: "Name must be atleast 3 characters long" })
        .max(30, { message: "Name can't be more than 30 characters long" }),
    phone: z
        .string()
        .min(9, { message: "Phone number must be atleast 9 characters long" }),
});

export const UpdatePasswordSchema = z.object({
    oldPassword: z.string(),
    newPassword: z
        .string()
        .min(5, { message: "Password must be atleast 5 characters long" }),
});

export const UpdateStoreSchema = z.object({
    storeName: z
        .string()
        .min(3, { message: "Name must be atleast 3 characters long" })
        .max(30, { message: "Name can't be more than 30 characters long" }),
    storeDescription: z.string().max(300, {
        message: "Description can't be more than 300 characters long",
    }),
});

export const AddressSchema = z.object({
    fullName: z
        .string()
        .min(3, { message: "Fullname must be atleast 3 characters long" }),
    phoneNumber: z
        .string()
        .min(9, { message: "Phone number must be atleast 9 characters long" }),
    streetAddress: z.string().min(10, {
        message: "Street Address must be atleast 10 characters long",
    }),
    city: z
        .string()
        .min(3, { message: "City must be atleast 3 characters long" }),
    state: z
        .string()
        .min(3, { message: "State must be atleast 3 characters long" }),
    postalCode: z
        .string()
        .min(4, { message: "Postal code must be atleast 4 characters long" }),
    country: z
        .string()
        .min(3, { message: "Country must be atleast 3 characters long" }),
});

export const CategorySchema = z.object({
    name: z.string().min(3, "Name should be at least 3 characters long").max(50, "Name should not exceed 50 characters long"),
    parentCategory: z.string().nullable().optional(),
    isFeatured: z.boolean(),
    showInCategoryBar: z.boolean(),
});

export const productSchema = z.object({
    name: z
        .string()
        .min(5, { message: "Product name must be at least 5 characters long." })
        .max(200, { message: "Product name cannot exceed 200 characters." }),
    description: z
        .string()
        .min(10, { message: "Description must be at least 10 characters long." })
        .max(1500, { message: "Description cannot exceed 1500 characters." }),
    price: z
        .number({ invalid_type_error: "Price must be a number." })
        .positive({ message: "Price must be greater than 0." }),
    stock: z
        .number({ invalid_type_error: "Stock must be a number." })
        .int({ message: "Stock must be an integer." })
        .nonnegative({ message: "Stock cannot be negative." }),
    category: z
        .string()
        .min(1, { message: "Category is required." }),
    images: z.array(
        z.object({
            url: z.string().url(),
            public_id: z.string().min(1),
        })
    ),
    discount: z
        .number({ invalid_type_error: "Discount must be a number." })
        .min(0, { message: "Discount cannot be less than 0%." })
        .max(100, { message: "Discount cannot exceed 100%." })
        .optional(),
    brand: z
        .string()
        .max(50, { message: "Brand name cannot exceed 50 characters." })
        .optional(),
});

export const ReviewSchema = z.object({
    rating: z.number().min(1, "Rating should be atleast 1").max(5, "Rating cannot exceed 5"),
    title: z.string().min(3, "Title should be atleast 3 characters long"),
    reviewContent: z.string().min(50, "Review content should be atleast 50 characters long").optional(),
});