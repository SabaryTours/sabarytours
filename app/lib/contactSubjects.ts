export const CONTACT_SUBJECTS = [
  "General Inquiry",
  "Tour Booking",
  "Booking Issues",
  "Travel Advice",
  "Corporate & Group Travel",
  "Become a Tour Guide",
  "Partnership",
  "Internship Application",
  "Refund Request",
  "Feedback & Complaints",
  "Website/Technical Issues",
  "Other",
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

export const DEFAULT_CONTACT_SUBJECT: ContactSubject = "General Inquiry";
