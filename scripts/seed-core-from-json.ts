import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

function readJson<T = any>(fileName: string): T[] {
  const filePath = path.join(process.cwd(), "migration_output", fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`Skipping ${fileName} (file not found).`);
    return [];
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T[];
}

async function seedAnnouncements() {
  type Ann = {
    title: string;
    content: string;
    type?: string | null;
    created_at?: string | null;
    image?: string | null;
  };

  const items = readJson<Ann>("announcements.json");
  if (!items.length) return;

  console.log(`Seeding ${items.length} announcements...`);

  const rows = items.map((a) => ({
    title: a.title,
    content: a.content,
    type: a.type ?? null,
    image_url: a.image ?? null,
    created_at: a.created_at ?? new Date().toISOString(),
  }));

  const { error } = await supabase.from("announcements").insert(rows);
  if (error) {
    console.error("Error seeding announcements:", error);
    process.exit(1);
  }
}

async function seedPartners() {
  type Partner = { name: string; image?: string | null };
  const items = readJson<Partner>("partners.json");
  if (!items.length) return;

  console.log(`Seeding ${items.length} partners...`);

  const rows = items.map((p) => ({
    name: p.name,
    image_url: p.image ?? null,
  }));

  const { error } = await supabase.from("partners").insert(rows);
  if (error) {
    console.error("Error seeding partners:", error);
    process.exit(1);
  }
}

async function seedReviews() {
  type Testimonial = {
    name: string;
    position?: string | null;
    message: string;
    image?: string | null;
    date?: string | null;
  };

  const items = readJson<Testimonial>("testimonials.json");
  if (!items.length) return;

  console.log(`Seeding ${items.length} reviews...`);

  const rows = items.map((t) => ({
    name: t.name,
    position: t.position ?? null,
    message: t.message,
    image_url: t.image ?? null,
    rating: 5,
    source: "website",
    status: "approved",
    created_at: t.date ?? new Date().toISOString(),
  }));

  const { error } = await supabase.from("reviews").insert(rows);
  if (error) {
    console.error("Error seeding reviews:", error);
    process.exit(1);
  }
}

async function seedInquiries() {
  type Inquiry = {
    name: string;
    email: string;
    subject?: string | null;
    message: string;
    date?: string | null;
    type?: string | null;
  };

  const items = readJson<Inquiry>("inquiries.json");
  if (!items.length) return;

  console.log(`Seeding ${items.length} inquiries...`);

  const rows = items.map((q) => ({
    name: q.name,
    email: q.email,
    phone: null,
    subject: q.subject ?? null,
    message: q.message,
    type: q.type ?? "general",
    package_name: null,
    status: "new",
    created_at: q.date ?? new Date().toISOString(),
    updated_at: q.date ?? new Date().toISOString(),
  }));

  const { error } = await supabase.from("inquiries").insert(rows);
  if (error) {
    console.error("Error seeding inquiries:", error);
    process.exit(1);
  }
}

async function seedBookings() {
  type LegacyBooking = {
    legacy_id: number;
    tour_title: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date: string;
    number_of_people: number;
    total_price: number;
    payment_amount: number;
    payment_option: string;
    payment_status: string;
    status: string;
    created_at: string;
  };

  const items = readJson<LegacyBooking>("bookings.json");
  if (!items.length) return;

  console.log(`Seeding ${items.length} bookings...`);

  const rows = items.map((b) => ({
    legacy_id: b.legacy_id,
    user_id: null,
    tour_id: null,
    customer_name: `${b.first_name} ${b.last_name}`.trim(),
    customer_email: b.email,
    customer_phone: b.phone,
    tour_date: b.date,
    number_of_people: b.number_of_people,
    total_cost: b.total_price,
    amount_paid: b.payment_amount,
    payment_option: b.payment_option,
    payment_status: b.payment_status,
    booking_status: b.status,
    package_name: b.tour_title,
    time_slot: null,
    pickup_location: null,
    payment_reference: null,
    voucher_code: null,
    voucher_discount: null,
    created_at: b.created_at,
    updated_at: b.created_at,
  }));

  const batchSize = 200;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from("bookings").insert(batch);
    if (error) {
      console.error("Error seeding bookings batch:", error);
      process.exit(1);
    }
    console.log(
      `Inserted ${Math.min(i + batchSize, rows.length)} / ${rows.length} bookings`
    );
  }
}

async function main() {
  await seedAnnouncements();
  await seedPartners();
  await seedReviews();
  await seedInquiries();
  await seedBookings();

  console.log("Core data seeding complete.");
}

main().catch((err) => {
  console.error("Unexpected error while seeding core data:", err);
  process.exit(1);
});

