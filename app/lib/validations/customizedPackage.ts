import { z } from "zod";

export const customizedPackageSchema = z.object({
  firstName: z.string().min(2, "First name is required").max(50),
  lastName: z.string().min(2, "Last name is required").max(50),
  email: z.string().email("Valid email is required").max(100),
  phone: z.string().min(8, "Phone number is required").max(30),
  organisationOrIndividual: z
    .string()
    .min(2, "Please enter your name or organisation")
    .max(120),
  numberOfPeople: z.string().min(1, "Number of people is required").max(20),
  interests: z.string().min(3, "Please describe your interests").max(500),
  preferredDate: z.string().min(1, "Preferred date is required").max(100),
  budgetRange: z.string().min(1, "Budget range is required").max(100),
  specialOccasion: z.string().max(200).optional().or(z.literal("")),
  preferredDestination: z.string().max(300).optional().or(z.literal("")),
  duration: z.string().max(100).optional().or(z.literal("")),
  transportation: z.string().max(200).optional().or(z.literal("")),
  accommodation: z.string().max(200).optional().or(z.literal("")),
  dietaryRequirements: z.string().max(500).optional().or(z.literal("")),
  additionalNotes: z.string().max(2000).optional().or(z.literal("")),
  subscribeNewsletter: z.boolean().optional(),
});

export type CustomizedPackageFormData = z.infer<typeof customizedPackageSchema>;

export function formatCustomizedPackageMessage(data: CustomizedPackageFormData): string {
  const lines = [
    "=== CUSTOMIZED PACKAGE REQUEST ===",
    `Organisation / individual: ${data.organisationOrIndividual}`,
    `Number of people: ${data.numberOfPeople}`,
    `Interest(s) / preferred experience: ${data.interests}`,
    `Preferred date: ${data.preferredDate}`,
    `Budget range: ${data.budgetRange}`,
    data.specialOccasion ? `Special occasion: ${data.specialOccasion}` : null,
    data.preferredDestination ? `Preferred destination/area: ${data.preferredDestination}` : null,
    data.duration ? `Duration: ${data.duration}` : null,
    data.transportation ? `Transportation: ${data.transportation}` : null,
    data.accommodation ? `Accommodation: ${data.accommodation}` : null,
    data.dietaryRequirements ? `Dietary / special needs: ${data.dietaryRequirements}` : null,
    data.additionalNotes ? `Additional notes:\n${data.additionalNotes}` : null,
  ].filter(Boolean);

  return lines.join("\n");
}
