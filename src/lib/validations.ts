import { z } from "zod";

// Pakistani mobile/landline numbers, written loosely (0300-1234567, 03001234567,
// +923001234567, 042-1234567 …). Kept permissive but still meaningfully validated.
const phoneRegex = /^(\+92|0)[0-9\- ]{9,13}$/;

export const inquiryTypeValues = ["ORDER", "RESERVATION", "FEEDBACK", "GENERAL"] as const;

export const inquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name (at least 2 characters).")
    .max(80, "Name is too long."),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Enter a valid Pakistani phone number, e.g. 0300-1234567."),
  email: z
    .union([z.string().trim().email("Enter a valid email address."), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
  type: z.enum(inquiryTypeValues, {
    errorMap: () => ({ message: "Choose what this message is about." }),
  }),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more (at least 10 characters).")
    .max(1000, "Message is too long (max 1000 characters)."),
  // Honeypot field — real users never fill this in. Bots that autofill every
  // field will trip it, and we silently drop the submission server-side.
  company: z.string().max(0, "Spam detected.").optional().or(z.literal("")),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export const newsletterSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  company: z.string().max(0, "Spam detected.").optional().or(z.literal("")),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

// ── Checkout / order ───────────────────────────────────────────────────

export const orderLineSchema = z.object({
  kind: z.enum(["menu", "deal"]),
  itemId: z.string().min(1),
  name: z.string().min(1).max(200),
  sizeLabel: z.string().max(60).optional(),
  unitPrice: z.number().int().positive(),
  quantity: z.number().int().min(1).max(50),
});

export const orderSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Enter your full name (at least 2 characters).")
    .max(80, "Name is too long."),
  customerPhone: z
    .string()
    .trim()
    .regex(phoneRegex, "Enter a valid Pakistani phone number, e.g. 0300-1234567."),
  customerEmail: z
    .union([z.string().trim().email("Enter a valid email address."), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
  branchId: z.string().min(1).optional(),
  notes: z.string().trim().max(500).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  discountPercent: z.number().min(0).max(100).default(0),
  lines: z.array(orderLineSchema).min(1, "Your cart is empty."),
  // Honeypot — real users never fill this in.
  company: z.string().max(0, "Spam detected.").optional().or(z.literal("")),
});

export type OrderInput = z.infer<typeof orderSchema>;
