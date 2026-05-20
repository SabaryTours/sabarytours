import { z } from "zod";
import {
  ACCOMMODATION_AREAS,
  ACCOMMODATION_PREFERENCES,
  CONTACT_METHODS,
  PICKUP_LOCATIONS,
  PLANNING_STAGES,
  TOUR_PREFERENCES,
  TRANSPORT_PREFERENCES,
  TRAVEL_PRIORITIES,
  TRAVELER_TYPES,
  TRIP_FEELS,
} from "../customizedPackageOptions";

const optionalString = z.string().max(500).optional().or(z.literal(""));

export const customizedPackageSchema = z
  .object({
    firstName: z.string().min(2, "First name is required").max(50),
    lastName: z.string().min(2, "Last name is required").max(50),
    email: z.string().email("Valid email is required").max(100),
    phone: z.string().min(8, "Phone number is required").max(30),
    organisationOrIndividual: z
      .string()
      .min(2, "Please enter your name or organisation")
      .max(120),
    numberOfPeople: z.string().min(1, "Number of people is required").max(20),
    preferredDate: z.string().min(1, "Preferred date is required").max(100),
    budgetRange: z.string().min(1, "Budget range is required").max(100),

    pickupLocation: z.enum(PICKUP_LOCATIONS, {
      message: "Please select a pickup location",
    }),
    travelerType: z.enum(TRAVELER_TYPES, {
      message: "Please select who is traveling",
    }),
    travelerTypeOther: optionalString,

    accommodationPreference: z
      .enum(ACCOMMODATION_PREFERENCES)
      .optional()
      .or(z.literal("")),
    accommodationArea: z.enum(ACCOMMODATION_AREAS).optional().or(z.literal("")),

    tourPreferences: z
      .array(z.enum(TOUR_PREFERENCES))
      .min(1, "Select at least one tour preference"),
    tourPreferencesOther: optionalString,

    travelPriority: z.enum(TRAVEL_PRIORITIES, {
      message: "Please select what matters most",
    }),
    planningStage: z.enum(PLANNING_STAGES, {
      message: "Please tell us how far along you are",
    }),
    contactMethod: z.enum(CONTACT_METHODS, {
      message: "Please select a contact method",
    }),
    tripFeel: z.enum(TRIP_FEELS, {
      message: "Please select how you'd like your trip to feel",
    }),
    transportPreference: z.enum(TRANSPORT_PREFERENCES, {
      message: "Please select a transport preference",
    }),

    tripDetails: z.string().max(3000).optional().or(z.literal("")),
    dietaryRequirements: z.string().max(500).optional().or(z.literal("")),
    specialOccasion: optionalString,
    subscribeNewsletter: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.travelerType === "Other" && !data.travelerTypeOther?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Please specify traveler type",
        path: ["travelerTypeOther"],
      });
    }
    if (
      data.tourPreferences.includes("Other") &&
      !data.tourPreferencesOther?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Please specify other tour preferences",
        path: ["tourPreferencesOther"],
      });
    }
  });

export type CustomizedPackageFormData = z.infer<typeof customizedPackageSchema>;

export function formatCustomizedPackageMessage(
  data: CustomizedPackageFormData
): string {
  const travelerLabel =
    data.travelerType === "Other"
      ? `Other: ${data.travelerTypeOther}`
      : data.travelerType;

  const prefs = data.tourPreferences.join(", ");
  const prefsLine = data.tourPreferencesOther
    ? `${prefs}\nOther preferences: ${data.tourPreferencesOther}`
    : prefs;

  const lines = [
    "=== CUSTOMIZED TRIP PLANNING REQUEST ===",
    `Organisation / individual: ${data.organisationOrIndividual}`,
    `Number of people: ${data.numberOfPeople}`,
    `Preferred date: ${data.preferredDate}`,
    `Budget range: ${data.budgetRange}`,
    "",
    "--- Traveler & pickup ---",
    `Traveler type: ${travelerLabel}`,
    `Pickup location: ${data.pickupLocation}`,
    `Transport preference: ${data.transportPreference}`,
    "",
    "--- Accommodation (optional) ---",
    data.accommodationPreference
      ? `Preference: ${data.accommodationPreference}`
      : null,
    data.accommodationArea ? `Preferred area: ${data.accommodationArea}` : null,
    "",
    "--- Experience preferences ---",
    `Tour preferences: ${prefsLine}`,
    `Travel priority: ${data.travelPriority}`,
    `Trip feel: ${data.tripFeel}`,
    `Planning stage: ${data.planningStage}`,
    "",
    "--- Contact ---",
    `Preferred contact method: ${data.contactMethod}`,
    data.specialOccasion ? `Special occasion: ${data.specialOccasion}` : null,
    data.dietaryRequirements
      ? `Dietary / special needs: ${data.dietaryRequirements}`
      : null,
    data.tripDetails ? `Trip details / requests:\n${data.tripDetails}` : null,
  ].filter(Boolean);

  return lines.join("\n");
}
