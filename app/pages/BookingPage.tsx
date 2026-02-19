"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft01Icon } from "hugeicons-react";
import { Tour } from "../data/packages";
import AvailabilityCalendar from "../components/AvailabilityCalendar";
import CustomDropdown from "../components/CustomDropdown";
import PaymentOptions from "../components/PaymentOptions";
import VoucherCode from "../components/VoucherCode";
import PickupLocation from "../components/PickupLocation";
import PaystackPayment from "../components/PaystackPayment";

interface BookingPageProps {
  tour: Tour;
}

export default function BookingPage({ tour }: BookingPageProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    package: "",
    numberOfPeople: 1,
    date: "",
    timeSlot: "",
    pickupLocation: "",
  });
  const [paymentOption, setPaymentOption] = useState<"full" | "deposit">("full");
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [voucherDiscount, setVoucherDiscount] = useState<number>(0);
  const [showPayment, setShowPayment] = useState(false);

  // Mock available dates with slots - replace with API call
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      // Mock: Some dates have time slots, some don't
      const hasSlots = i % 3 !== 0;
      dates.push({
        date: dateString,
        available: true,
        slots: hasSlots ? [
          { time: "09:00 AM", available: true },
          { time: "02:00 PM", available: true },
          { time: "05:00 PM", available: i % 2 === 0 },
        ] : [],
        price: tour.priceValue || 100,
      });
    }
    return dates;
  }, [tour.priceValue]);

  // Calculate base price based on date and group size
  const basePrice = useMemo(() => {
    let price = tour.priceValue || 100;
    
    // Price adjustments based on date (weekend/holiday pricing)
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const dayOfWeek = selectedDate.getDay();
      // Weekend pricing (Saturday = 6, Sunday = 0)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        price = price * 1.15; // 15% increase on weekends
      }
    }

    // Group size discounts
    if (formData.numberOfPeople >= 5) {
      price = price * 0.9; // 10% discount for 5+ people
    } else if (formData.numberOfPeople >= 3) {
      price = price * 0.95; // 5% discount for 3+ people
    }

    return price;
  }, [tour.priceValue, formData.date, formData.numberOfPeople]);

  // Calculate subtotal
  const subtotal = basePrice * formData.numberOfPeople;

  // Apply voucher discount
  const discountAmount = (subtotal * voucherDiscount) / 100;
  const totalPrice = subtotal - discountAmount;

  // Calculate payment amount based on selected option
  const paymentAmount = paymentOption === "deposit" 
    ? (totalPrice * 30) / 100 
    : totalPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.pickupLocation) {
      alert("Please select a pick-up location");
      return;
    }

    // Show payment section
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (reference: string) => {
    try {
      // Send booking confirmation
      const bookingData = {
        ...formData,
        paymentReference: reference,
        paymentOption,
        voucherCode: voucherCode || null,
        voucherDiscount,
        totalPrice,
        paymentAmount,
        tourId: tour.id,
        tourSlug: tour.slug,
      };

      // Call API to save booking
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        router.push(`/booking/success?tour=${tour.slug}&ref=${reference}`);
      } else {
        throw new Error("Booking failed");
      }
    } catch {
      router.push(`/booking/error?tour=${tour.slug}`);
    }
  };

  const handlePaymentError = (error: string) => {
    alert(`Payment error: ${error}`);
  };

  const handleVoucherApply = (code: string, discount: number) => {
    setVoucherCode(code);
    setVoucherDiscount(discount);
  };

  const handleVoucherRemove = () => {
    setVoucherCode("");
    setVoucherDiscount(0);
  };

  const incrementPeople = () => {
    setFormData({ ...formData, numberOfPeople: formData.numberOfPeople + 1 });
  };

  const decrementPeople = () => {
    if (formData.numberOfPeople > 1) {
      setFormData({ ...formData, numberOfPeople: formData.numberOfPeople - 1 });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-10 md:py-12">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-[#666] hover:text-[#222] text-[14px] font-sans mb-4 inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft01Icon className="w-4 h-4" />
              Back
            </button>
            <h1 
              className="text-[28px] sm:text-[32px] md:text-[36px] text-[#ff5e00] font-normal uppercase mb-2"
              style={{
                fontFamily: 'var(--font-unlimited-pie)',
                textShadow: '1px 1px 0px #331300',
              }}
            >
              Book Tour
            </h1>
            <p className="text-[#222] text-[16px] font-bold font-sans">
              {tour.title}
            </p>
            {tour.rating && (
              <div className="mt-2">
                <span className="text-[#666] text-[14px] font-sans">
                  {tour.rating} ⭐ ({tour.reviewCount} reviews)
                </span>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#222] text-[14px] font-bold mb-2 font-sans">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="eg. Jane"
                  className="w-full px-4 py-3 text-[#222] rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] font-sans placeholder:text-[#222] placeholder:text-[14px] placeholder:font-normal placeholder:leading-[24px]"
                  required
                />
              </div>
              <div>
                <label className="block text-[#222] text-[14px] font-bold mb-2 font-sans">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="eg. Doe"
                  className="w-full px-4 py-3 text-[#222] rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] font-sans placeholder:text-[#222] placeholder:text-[14px] placeholder:font-normal placeholder:leading-[24px]"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[#222] text-[14px] font-bold mb-2 font-sans">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="eg. janedoe@gmail.com"
                className="w-full px-4 py-3 text-[#222] rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] font-sans placeholder:text-[#222] placeholder:text-[14px] placeholder:font-normal placeholder:leading-[24px]"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[#222] text-[14px] font-bold mb-2 font-sans">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder=""
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] font-sans"
                required
              />
            </div>

            {/* Package Selection */}
            <div>
              <label className="block text-[#222] text-[14px] font-bold mb-2 font-sans">
                Select Price Package
              </label>
              <CustomDropdown
                options={[
                  { value: "standard", label: "Standard Package" },
                  { value: "premium", label: "Premium Package" },
                ]}
                value={formData.package}
                onChange={(value) => setFormData({ ...formData, package: value })}
                placeholder="--Select--"
              />
            </div>

            {/* Number of People */}
            <div>
              <label className="block text-[#222] text-[14px] font-bold mb-2 font-sans">
                Number of people
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={decrementPeople}
                  className="w-10 h-10 bg-[#ff5e00] text-white rounded-lg flex items-center justify-center font-bold hover:bg-[#e55500] transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={formData.numberOfPeople}
                  readOnly
                  className="w-20 px-4 py-3 rounded-lg border border-gray-300 text-center font-sans font-bold"
                />
                <button
                  type="button"
                  onClick={incrementPeople}
                  className="w-10 h-10 bg-[#ff5e00] text-white rounded-lg flex items-center justify-center font-bold hover:bg-[#e55500] transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Date Picker with Availability */}
            <div>
              <label className="block text-[#222] text-[14px] font-bold mb-2 font-sans">
                Select Date & Time <span className="text-red-500">*</span>
              </label>
              <AvailabilityCalendar
                value={formData.date}
                onChange={(date, timeSlot) => setFormData({ ...formData, date, timeSlot: timeSlot || "" })}
                selectedTimeSlot={formData.timeSlot}
                availableDates={availableDates}
                minDate={new Date().toISOString().split('T')[0]}
              />
              {formData.date && (
                <p className="text-[#666] text-[12px] font-normal mt-2 font-sans">
                  Selected: {new Date(formData.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  {formData.timeSlot && ` at ${formData.timeSlot}`}
                </p>
              )}
            </div>

            {/* Pick-up Location */}
            <PickupLocation
              value={formData.pickupLocation}
              onChange={(location) => setFormData({ ...formData, pickupLocation: location })}
            />

            {/* Voucher Code */}
            <VoucherCode
              onApply={handleVoucherApply}
              onRemove={handleVoucherRemove}
              appliedCode={voucherCode}
              discount={voucherDiscount}
            />

            {/* Live Pricing Breakdown */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 space-y-3 border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#666] text-[14px] font-sans">
                    Base Price × {formData.numberOfPeople} {formData.numberOfPeople === 1 ? "person" : "people"}
                </span>
                <span className="text-[#222] text-[14px] font-bold font-sans">
                    ${subtotal.toFixed(2)}
                </span>
                </div>
                
                {formData.date && (
                  <div className="flex items-center justify-between text-[12px] text-[#666] font-sans">
                    <span>Date: {new Date(formData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    {new Date(formData.date).getDay() === 0 || new Date(formData.date).getDay() === 6 ? (
                      <span className="text-[#ff5e00]">Weekend pricing applied</span>
                    ) : null}
                  </div>
                )}

                {formData.numberOfPeople >= 3 && (
                  <div className="flex items-center justify-between text-[12px] text-green-600 font-sans">
                    <span>Group discount ({formData.numberOfPeople >= 5 ? '10%' : '5%'})</span>
                    <span>-${(subtotal - basePrice * formData.numberOfPeople).toFixed(2)}</span>
                  </div>
                )}

                {voucherDiscount > 0 && (
                  <div className="flex items-center justify-between text-[12px] text-green-600 font-sans">
                    <span>Voucher discount ({voucherDiscount}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-300 pt-3 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#222] text-[16px] font-bold font-sans">Subtotal</span>
                  <span className="text-[#ff5e00] text-[24px] font-bold font-sans">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <PaymentOptions
              totalPrice={totalPrice}
              selectedOption={paymentOption}
              onSelectOption={setPaymentOption}
              depositPercentage={30}
            />

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-4 text-[12px] text-[#666] font-sans">
              {tour.freeCancellation && (
                <div className="flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#00A86B">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span>Free cancellation</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#0060CC">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
                <span>Secure booking</span>
              </div>
              <div className="flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF5E00">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Instant confirmation</span>
              </div>
            </div>

            {/* Payment Section */}
            {showPayment ? (
              <div className="space-y-4">
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-[#222] text-[18px] font-bold mb-4 font-sans">
                    Complete Your Booking
                  </h3>
                  <PaystackPayment
                    amount={paymentAmount}
                    email={formData.email}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    metadata={{
                      tourId: tour.id,
                      tourSlug: tour.slug,
                      numberOfPeople: formData.numberOfPeople,
                      date: formData.date,
                      timeSlot: formData.timeSlot,
                      pickupLocation: formData.pickupLocation,
                      paymentOption,
                      voucherCode: voucherCode || null,
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPayment(false)}
                  className="w-full text-[#666] text-[14px] font-sans underline hover:text-[#ff5e00]"
                >
                  ← Back to edit booking
                </button>
              </div>
            ) : (
            <button
              type="submit"
              className="w-full bg-[#ff5e00] text-white py-4 rounded-lg font-bold text-[16px] hover:bg-[#e55500] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-sans shadow-lg"
            >
                Continue to Payment - ${paymentAmount.toFixed(2)}
            </button>
            )}
          </form>
      </div>
    </div>
  );
}

