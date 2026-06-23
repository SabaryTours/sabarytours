import type { SupabaseClient } from "@supabase/supabase-js";

type BookingForSeats = {
  id: string;
  tour_id?: string | null;
  number_of_people?: number | null;
  booking_status?: string | null;
  payment_reference?: string | null;
  payment_status?: string | null;
  seats_applied?: boolean | null;
};

function parseGuestCount(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
}

function parseSeatCount(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.floor(parsed) : null;
}

export function normalizeTourId(tourId: string | number | null | undefined): string | null {
  if (tourId == null) return null;
  const id = String(tourId).trim();
  return id || null;
}

/** Whether this booking should hold a seat (paid online or cash reservation). */
export function shouldDeductSeatsForBooking(booking: Pick<BookingForSeats, "booking_status" | "payment_reference">): boolean {
  if (booking.booking_status === "confirmed") return true;
  const reference = String(booking.payment_reference || "");
  return booking.booking_status === "pending" && reference.startsWith("CASH-");
}

/** Subtract guest count from tour seats. */
export async function decrementTourSeats(
  supabaseAdmin: SupabaseClient,
  tourId: string | number | null | undefined,
  guests: number,
): Promise<boolean> {
  const id = normalizeTourId(tourId);
  const guestCount = parseGuestCount(guests);
  if (!id || guestCount <= 0) return false;

  const { data: tour, error } = await supabaseAdmin
    .from("tours")
    .select("id, seats_remaining")
    .eq("id", id)
    .maybeSingle();

  if (error || !tour) {
    console.error("decrementTourSeats: tour lookup failed", { id, error: error?.message });
    return false;
  }

  const remaining = parseSeatCount(tour.seats_remaining);
  if (remaining == null) return false;

  const next = Math.max(0, remaining - guestCount);
  const { error: updateError } = await supabaseAdmin
    .from("tours")
    .update({ seats_remaining: next })
    .eq("id", id);

  if (updateError) {
    console.error("decrementTourSeats: update failed", { id, updateError: updateError.message });
    return false;
  }

  return true;
}

/** Idempotent seat deduction tied to a booking row. */
export async function applyBookingSeatDeduction(
  supabaseAdmin: SupabaseClient,
  booking: BookingForSeats,
): Promise<void> {
  if (booking.seats_applied) return;
  if (!shouldDeductSeatsForBooking(booking)) return;
  if (!booking.tour_id) return;

  const applied = await decrementTourSeats(
    supabaseAdmin,
    booking.tour_id,
    booking.number_of_people || 1,
  );

  if (!applied) return;

  const { error } = await supabaseAdmin
    .from("bookings")
    .update({ seats_applied: true })
    .eq("id", booking.id);

  if (error && !/seats_applied/i.test(error.message)) {
    console.error("applyBookingSeatDeduction: failed to mark seats_applied", {
      bookingId: booking.id,
      error: error.message,
    });
  }
}

export async function loadBookingForSeatDeduction(
  supabaseAdmin: SupabaseClient,
  bookingId: string,
): Promise<BookingForSeats | null> {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("id, tour_id, number_of_people, booking_status, payment_reference, payment_status, seats_applied")
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !data) return null;
  return data as BookingForSeats;
}
