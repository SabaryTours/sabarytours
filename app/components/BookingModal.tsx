"use client";

import { useState, useMemo } from "react";
import { Tour } from "../data/packages";
import BookingSuccess from "./BookingSuccess";
import BookingError from "./BookingError";
import AvailabilityCalendar from "./AvailabilityCalendar";
import PaymentOptions from "./PaymentOptions";
import VoucherCode from "./VoucherCode";
import PickupLocation from "./PickupLocation";
import PaystackPayment from "./PaystackPayment";
import { getUser } from "../lib/authService";
import { useCurrency } from "../context/CurrencyContext";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour: Tour;
}

export default function BookingModal({ isOpen, onClose, tour }: BookingModalProps) {
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [paymentOption, setPaymentOption] = useState<"full" | "deposit">("full");
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [voucherDiscount, setVoucherDiscount] = useState<number>(0);
  const [showPayment, setShowPayment] = useState(false);
  const { symbol, convert } = useCurrency();

  // Generate available dates based on real tour rules
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    
    // Default time slots if none are defined
    const defaultSlots = [
      { time: "09:00 AM", available: true },
      { time: "02:00 PM", available: true }
    ];

    const slotsToUse = (tour.timeSlots && tour.timeSlots.length > 0)
      ? tour.timeSlots.map(t => ({ time: t, available: true }))
      : defaultSlots;

    for (let i = 1; i <= 60; i++) { // Generate next 60 days
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

      // Check if blocked by admin
      const isBlocked = tour.blockedDates?.includes(dateString) || false;
      
      // Check if day of week is allowed
      const isAllowedDay = (!tour.availableDays || tour.availableDays.length === 0) 
                            ? true 
                            : tour.availableDays.includes(dayName);

      const isAvailable = isAllowedDay && !isBlocked;

      dates.push({
        date: dateString,
        available: isAvailable,
        slots: isAvailable ? slotsToUse : [],
        price: tour.priceValue || 100,
      });
    }
    return dates;
  }, [tour.priceValue, tour.availableDays, tour.blockedDates, tour.timeSlots]);

  // Calculate base price based on date and group size
  const basePrice = useMemo(() => {
    let price = tour.priceValue || 100;
    
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const dayOfWeek = selectedDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        price = price * 1.15;
      }
    }

    if (formData.numberOfPeople >= 5) {
      price = price * 0.9;
    } else if (formData.numberOfPeople >= 3) {
      price = price * 0.95;
    }

    return price;
  }, [tour.priceValue, formData.date, formData.numberOfPeople]);

  const subtotal = basePrice * formData.numberOfPeople;
  const discountAmount = (subtotal * voucherDiscount) / 100;
  const totalPrice = subtotal - discountAmount;
  const paymentAmount = paymentOption === "deposit" 
    ? (totalPrice * 30) / 100 
    : totalPrice;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (reference: string) => {
    try {
      const currentUser = await getUser();
      
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
        userId: currentUser?.id || null,
      };

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        setShowSuccess(true);
      } else {
        throw new Error("Booking failed");
      }
    } catch (error) {
      setShowError(true);
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

  const handleClose = () => {
    setShowSuccess(false);
    setShowError(false);
    onClose();
  };

  const handleRetry = () => {
    setShowError(false);
  };

  if (showSuccess) {
    return <BookingSuccess onClose={handleClose} />;
  }

  if (showError) {
    return <BookingError onClose={handleClose} onRetry={handleRetry} />;
  }

  const incrementPeople = () => {
    setFormData({ ...formData, numberOfPeople: formData.numberOfPeople + 1 });
  };

  const decrementPeople = () => {
    if (formData.numberOfPeople > 1) {
      setFormData({ ...formData, numberOfPeople: formData.numberOfPeople - 1 });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="#222"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div>
              <h2 className="text-[#222] text-[20px] sm:text-[24px] font-bold font-sans">
                Book tour
              </h2>
              {tour.rating && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[#666] text-[12px] font-sans">
                    {tour.rating} ⭐ ({tour.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="#222"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] font-sans"
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] font-sans"
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] font-sans"
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] font-sans text-[#222] placeholder:text-[#222] placeholder:text-[14px] placeholder:font-normal placeholder:leading-[24px]"
              required
            />
          </div>

          {/* Package Selection */}
          <div>
            <label className="block text-[#222] text-[14px] font-bold mb-2 font-sans">
              Select Price Package
            </label>
            <select
              value={formData.package}
              onChange={(e) => setFormData({ ...formData, package: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] font-sans appearance-none bg-white text-[#222] placeholder:text-[#222] placeholder:text-[14px] placeholder:font-normal placeholder:leading-[24px]"
              required
            >
              <option value="">--Select--</option>
              <option value="standard">Standard Package</option>
              <option value="premium">Premium Package</option>
            </select>
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
                className="w-10 h-10 bg-[#ff5e00]  rounded-lg flex items-center justify-center font-bold hover:bg-[#e55500] transition-colors text-[#222] placeholder:text-[#222] placeholder:text-[14px] placeholder:font-normal placeholder:leading-[24px]"
              >
                -
              </button>
              <input
                type="number"
                value={formData.numberOfPeople}
                readOnly
                className="w-20 px-4 py-3 rounded-lg border border-gray-300 text-center font-sans font-bold text-[#222] placeholder:text-[#222] placeholder:text-[14px] placeholder:font-normal placeholder:leading-[24px]"
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
          <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-5 space-y-3 border border-gray-200 shadow-md">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#666] text-[14px] font-sans">
                  Base Price × {formData.numberOfPeople}{" "}
                  {formData.numberOfPeople === 1 ? "person" : "people"}
                </span>
                <span className="text-[#222] text-[14px] font-bold font-sans">
                  {symbol} {convert(subtotal, "GHS").toFixed(2)}
                </span>
              </div>
              
              {formData.date && (
                <div className="flex items-center justify-between text-[12px] text-[#666] font-sans">
                  <span>Date: {new Date(formData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  {new Date(formData.date).getDay() === 0 || new Date(formData.date).getDay() === 6 ? (
                    <span className="text-[#ff5e00]">Weekend pricing</span>
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
                  <span>
                    -{symbol} {convert(discountAmount, "GHS").toFixed(2)}
                  </span>
                </div>
              )}
            </div>

              <div className="border-t border-gray-300 pt-3 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#222] text-[16px] font-bold font-sans">
                    Subtotal
                  </span>
                  <span className="text-[#ff5e00] text-[20px] font-bold font-sans">
                    {symbol} {convert(totalPrice, "GHS").toFixed(2)}
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
                    packageName: tour.title,
                    customerName: `${formData.firstName} ${formData.lastName}`.trim(),
                    customerPhone: formData.phone,
                    numberOfPeople: formData.numberOfPeople,
                    date: formData.date,
                    timeSlot: formData.timeSlot,
                    pickupLocation: formData.pickupLocation,
                    paymentOption,
                    voucherCode: voucherCode || null,
                    totalCost: totalPrice,
                    paymentAmount: paymentAmount,
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
              className="w-full bg-[#ff5e00] text-white py-3 rounded-lg font-bold text-[16px] hover:bg-[#e55500] transition-colors font-sans"
            >
              Continue to Payment - {symbol} {convert(paymentAmount, "GHS").toFixed(2)}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

