import { z } from "zod";

const nameRegex = /^[a-zA-Z\s'-]+$/;
const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,12}$/;

export const bookingSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .regex(nameRegex, "First name contains invalid characters"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .regex(nameRegex, "Last name contains invalid characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number is too short")
    .max(25, "Phone number is too long")
    .regex(phoneRegex, "Please enter a valid phone number"),
  package: z.string().trim().min(1, "Please select a package"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid booking date format"),
  timeSlot: z.string().trim().min(1, "Please select a time slot"),
  pickupLocation: z.string().trim().max(200).optional().default(""),
  numberOfPeople: z.coerce.number().int().min(1, "At least one guest is required").max(100),
  paymentReference: z.string().trim().min(3, "Invalid payment reference"),
  paymentOption: z.enum(["full", "deposit"]),
  totalPrice: z.coerce.number().positive("Total price must be greater than zero"),
  paymentAmount: z.coerce.number().positive("Payment amount must be greater than zero"),
  voucherCode: z.string().trim().nullable().optional(),
  voucherDiscount: z.coerce.number().min(0).max(100).default(0),
tierSelections: z.record(z.string(), z.number().int().min(0)).optional(),
  tourId: z.union([z.string(), z.number()]),
  tourSlug: z.string().trim().min(1, "Invalid tour"),
  userId: z.string().uuid().nullable().optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
