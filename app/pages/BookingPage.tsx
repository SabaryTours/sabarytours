"use client";

import { useState, useMemo } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useRouter } from "next/navigation";
import { ArrowLeft01Icon, CheckmarkBadge01Icon, Calendar01Icon, UserIcon, CreditCardIcon } from "hugeicons-react";
import { Tour } from "../data/packages";
import { getUser } from "../lib/authService";
import AvailabilityCalendar from "../components/AvailabilityCalendar";
import CustomDropdown from "../components/CustomDropdown";
import PaymentOptions from "../components/PaymentOptions";
import VoucherCode from "../components/VoucherCode";
import PaystackPayment from "../components/PaystackPayment";
import TourGrid from "../components/TourGrid";
import { useCurrency } from "../context/CurrencyContext";
import { inferTierCurrency, currencySymbol } from "../lib/tourPricing";

function tierSelectionKey(index: number) {
  return String(index);
}

function buildInitialTierSelections(tour: Tour): Record<string, number> {
  const tiers = tour.price_tiers;
  if (tiers && tiers.length > 0) {
    const init: Record<string, number> = {};
    tiers.forEach((_, i) => {
      init[tierSelectionKey(i)] = i === 0 ? 1 : 0;
    });
    return init;
  }
  return { Base: 1 };
}

function tierHeadingLabel(
  tier: NonNullable<Tour["price_tiers"]>[number],
  index: number,
  tiers: Tour["price_tiers"],
) {
  const list = tiers ?? [];
  const rawName = (tier.name && tier.name.trim()) || "";
  const peersWithSameName = list.filter(
    (t) => (t.name?.trim() || "") === rawName,
  ).length;
  const labelBase = rawName || `Price option ${index + 1}`;
  return peersWithSameName > 1 ? `${labelBase} (rate ${index + 1})` : labelBase;
}

interface BookingPageProps {
  tour: Tour;
  otherTours?: Tour[];
}

export default function BookingPage({ tour, otherTours = [] }: BookingPageProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    package: "",
    date: "",
    timeSlot: "",
    pickupLocation: "",
  });
  
  // Price tier quantities keyed by tier index ("0", "1", …).
  const [tierSelections, setTierSelections] = useState<Record<string, number>>(() =>
    buildInitialTierSelections(tour),
  );

  const totalPeople = Object.values(tierSelections).reduce((a, b) => a + b, 0);
  const [paymentOption, setPaymentOption] = useState<"full" | "deposit" | "cash">("full");
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [voucherDiscount, setVoucherDiscount] = useState<number>(0);
  const [showPayment, setShowPayment] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { symbol, convert, toGhs, hasGhsRate, loading: currencyLoading } = useCurrency();

  /** Unit for raw totals (matches server sum of `tour_prices.amount`). */
  const pricingBase = useMemo((): "USD" | "GHS" => {
    if (tour.price_tiers && tour.price_tiers.length > 0) {
      return inferTierCurrency(tour.price_tiers[0], tour.price_tiers);
    }
    return "GHS";
  }, [tour.price_tiers]);

  // Available dates driven by tour's availableDays, blockedDates, and timeSlots
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();

    const defaultSlots = [
      { time: "09:00 AM", available: true },
      { time: "02:00 PM", available: true },
    ];

    const slotsToUse =
      tour.timeSlots && tour.timeSlots.length > 0
        ? tour.timeSlots.map((t) => ({ time: t, available: true }))
        : defaultSlots;

    for (let i = 1; i <= 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split("T")[0];

      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

      const isBlocked = tour.blockedDates?.includes(dateString) || false;
      const isAllowedDay =
        !tour.availableDays || tour.availableDays.length === 0
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

  // Raw subtotal in the tour's pricing currency.
  const baseSubtotal = useMemo(() => {
    if (tour.price_tiers && tour.price_tiers.length > 0) {
      return tour.price_tiers.reduce((sum, tier, i) => {
        const qty = tierSelections[tierSelectionKey(i)] ?? 0;
        return sum + (tier.amount || 0) * qty;
      }, 0);
    }
    return (tour.priceValue || 100) * totalPeople;
  }, [tour.priceValue, tour.price_tiers, tierSelections, totalPeople]);

  const subtotal = baseSubtotal;

  const discountAmount = (subtotal * voucherDiscount) / 100;
  const totalPrice = subtotal - discountAmount;
  const paymentAmount =
    paymentOption === "cash" ? 0 : paymentOption === "deposit" ? (totalPrice * 30) / 100 : totalPrice;
  const requiresExchangeRate = pricingBase === "USD";
  const exchangeRateUnavailable = requiresExchangeRate && !currencyLoading && !hasGhsRate;
  const exchangeRatePending = requiresExchangeRate && currencyLoading;

  const handleVoucherApply = (code: string, discount: number) => {
    setVoucherCode(code);
    setVoucherDiscount(discount);
  };

  const handleVoucherRemove = () => {
    setVoucherCode("");
    setVoucherDiscount(0);
  };

  const handleNextStep = async () => {
    setFormError(null);
    if (step === 1) {
      if (!formData.package) {
        setFormError("Please select a package.");
        return;
      }
      if (totalPeople < 1) {
        setFormError("Please select at least one guest.");
        return;
      }
      if (!formData.date || !formData.timeSlot) {
        setFormError("Please select a date and time slot.");
        return;
      }

      // Pre-fill user data if logged in
      const userData = await getUser();
      if (userData) {
        setUserId(userData.id);
        setFormData(prev => ({
          ...prev,
          firstName: prev.firstName || userData.first_name || "",
          lastName: prev.lastName || userData.last_name || "",
          email: prev.email || userData.email || "",
          phone: prev.phone || userData.phone || "",
        }));
      }

      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (step === 2) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        setFormError("Please fill in all required personal details.");
        return;
      }
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const createBooking = async (reference: string) => {
    const userData = await getUser();
    const bookingData = {
      ...formData,
      numberOfPeople: totalPeople,
      tierSelections,
      paymentReference: reference,
      paymentOption,
      voucherCode: voucherCode || null,
      voucherDiscount,
      totalPrice,
      paymentAmount,
      tourId: tour.id,
      tourSlug: tour.slug,
      userId: userData?.id || null,
    };

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || "Booking failed");
    }

    return result;
  };

  const handlePaymentSuccess = async (reference: string) => {
    try {
      await createBooking(reference);
      router.push(`/booking/success?tour=${tour.slug}&ref=${reference}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Booking failed";
      setFormError(message);
      router.push(`/booking/error?tour=${tour.slug}`);
    }
  };

  const handleCashBooking = async () => {
    try {
      setFormError(null);
      const reference = `CASH-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      await createBooking(reference);
      router.push(`/booking/success?tour=${tour.slug}&ref=${reference}&payment=cash`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Booking failed";
      setFormError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Top Banner */}
      <div className="relative pt-10 pb-20 px-4 sm:px-6 md:px-12 w-full overflow-hidden" style={{ backgroundColor: "#893300" }}>
        
        {/* Pattern Overlay Layer */}
        <div
          className="absolute inset-y-0 left-0 w-full pointer-events-none z-0"
          style={{
            backgroundImage: "url(/assets/pattern.svg)",
            backgroundRepeat: "repeat",
            backgroundSize: "auto",
            opacity: 0.3,
            mixBlendMode: "overlay",
          }}
        />

        <div className="max-w-4xl mx-auto relative z-10">
          <button
            onClick={() => step > 1 ? setStep(step - 1 as 1 | 2) : router.back()}
            className="text-gray-300 hover:text-white text-[14px] font-sans mb-6 inline-flex items-center gap-2 transition-colors relative z-20"
          >
            <ArrowLeft01Icon className="w-4 h-4" />
            {step > 1 ? "Go Back" : "Cancel Booking"}
          </button>
          
          <h1 
            className="text-[28px] sm:text-[36px] text-white font-normal uppercase mb-2 relative z-20"
            style={{ fontFamily: 'var(--font-unlimited-pie)', textShadow: "1px 1px 0px #551f00" }}
          >
            Complete your booking
          </h1>
          <div className="text-gray-200 text-[16px] font-sans relative z-20">
            {tour.title}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 -mt-12 relative z-20">
        
        {/* Progress Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6 flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-[10%] right-[10%] h-1 bg-gray-100 -translate-y-1/2 z-0 hidden sm:block">
            <div 
              className="h-full bg-[#ff5e00] transition-all duration-500" 
              style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
            />
          </div>

          {[
            { num: 1, label: "Date & Guests", Icon: Calendar01Icon },
            { num: 2, label: "Your Details", Icon: UserIcon },
            { num: 3, label: "Review & Pay", Icon: CreditCardIcon },
          ].map((s) => (
            <div key={s.num} className="relative z-10 flex flex-col items-center gap-2 w-1/3">
              <div 
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  step >= s.num ? 'bg-[#ff5e00] text-white' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step > s.num ? <CheckmarkBadge01Icon size={24} /> : <s.Icon size={20} />}
              </div>
              <span className={`text-[12px] sm:text-[14px] font-medium font-sans text-center ${
                step >= s.num ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 lg:p-10">
          
          {/* STEP 1: Date & Guests */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-in">
              <h2 className="text-2xl font-bold font-sans text-gray-900 border-b border-gray-100 pb-4">
                1. Select Date & Guests
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="block text-gray-900 text-[14px] font-bold mb-2 font-sans">
                    Number of people
                  </label>

                  {tour.price_tiers && tour.price_tiers.length > 0 ? (
                    tour.price_tiers.map((tier, index) => {
                      const tierCur = inferTierCurrency(tier, tour.price_tiers ?? []);
                      return (
                      <div key={tierSelectionKey(index)} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100 gap-4">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 font-sans">{tierHeadingLabel(tier, index, tour.price_tiers)}</p>
                          <p className="text-sm text-gray-500 font-sans">
                            {currencySymbol(tierCur)} {(tier.amount ?? 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const key = tierSelectionKey(index);
                              const currentQty = tierSelections[key] || 0;
                              if (currentQty > 0) {
                                setTierSelections({ ...tierSelections, [key]: currentQty - 1 });
                              }
                            }}
                            className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-200 text-gray-700 rounded-lg flex items-center justify-center font-bold hover:border-[#ff5e00] hover:text-[#ff5e00] transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-sans font-bold text-lg text-gray-900">
                            {tierSelections[tierSelectionKey(index)] || 0}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const key = tierSelectionKey(index);
                              const currentQty = tierSelections[key] || 0;
                              setTierSelections({ ...tierSelections, [key]: currentQty + 1 });
                            }}
                            className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-200 text-gray-700 rounded-lg flex items-center justify-center font-bold hover:border-[#ff5e00] hover:text-[#ff5e00] transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      );
                    })
                  ) : (
                    // Legacy Fallback
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 w-fit">
                      <button
                        type="button"
                        onClick={() => {
                          const currentQty = tierSelections["Base"] || 0;
                          if (currentQty > 1) {
                            setTierSelections({ "Base": currentQty - 1 });
                          }
                        }}
                        className="w-10 h-10 bg-white border border-gray-200 text-gray-700 rounded-lg flex items-center justify-center font-bold hover:border-[#ff5e00] hover:text-[#ff5e00] transition-colors"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-sans font-bold text-lg text-gray-900">
                        {tierSelections["Base"] || 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const currentQty = tierSelections["Base"] || 0;
                          setTierSelections({ "Base": currentQty + 1 });
                        }}
                        className="w-10 h-10 bg-white border border-gray-200 text-gray-700 rounded-lg flex items-center justify-center font-bold hover:border-[#ff5e00] hover:text-[#ff5e00] transition-colors"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-900 text-[14px] font-bold mb-2 font-sans">
                    Select Package
                  </label>
                  <CustomDropdown
                    options={[
                      { value: "standard", label: "Standard Package" },
                      { value: "premium", label: "Premium Package (+ Amenities)" },
                    ]}
                    value={formData.package}
                    onChange={(value) => setFormData({ ...formData, package: value })}
                    placeholder="--Select--"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 text-[14px] font-bold mb-2 font-sans">
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
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end">
                {formError && <p className="mr-auto text-sm text-red-600">{formError}</p>}
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-[#ff5e00] text-white px-8 py-4 rounded-xl font-bold text-[16px] hover:bg-[#e55500] hover:shadow-lg transition-all"
                >
                  Continue to Details
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Personal Details */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-in">
              <h2 className="text-2xl font-bold font-sans text-gray-900 border-b border-gray-100 pb-4">
                2. Your Details
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-900 text-[14px] font-bold mb-2 font-sans">First Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="eg. Jane"
                      className="w-full px-4 py-3 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-900 text-[14px] font-bold mb-2 font-sans">Last Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="eg. Doe"
                      className="w-full px-4 py-3 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-900 text-[14px] font-bold mb-2 font-sans">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="eg. janedoe@gmail.com"
                      className="w-full px-4 py-3 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-900 text-[14px] font-bold mb-2 font-sans">Phone Number <span className="text-red-500">*</span></label>
                    <PhoneInput
                      country="gh"
                      value={formData.phone}
                      onChange={(value) => setFormData({ ...formData, phone: `+${value}` })}
                      enableSearch
                      inputStyle={{
                        width: "100%",
                        height: "48px",
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        backgroundColor: "#f9fafb",
                        fontSize: "14px",
                        color: "#111827",
                        paddingLeft: "52px",
                      }}
                      buttonStyle={{
                        borderRadius: "12px 0 0 12px",
                        border: "1px solid #e5e7eb",
                        backgroundColor: "#f9fafb",
                      }}
                      containerStyle={{ width: "100%" }}
                    />
                  </div>
                </div>

                {/* Map-enabled pickup selector disabled on booking page; keep address input only.
                <div>
                  <PickupLocation
                    value={formData.pickupLocation}
                    onChange={(location) => setFormData({ ...formData, pickupLocation: location })}
                  />
                </div>
                */}
                <div>
                  <label className="block text-gray-900 text-[14px] font-bold mb-2 font-sans">
                    Pick-up Address <span className="text-xs text-gray-500 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.pickupLocation}
                    onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                    placeholder="Enter your pick-up address"
                    className="w-full px-4 py-3 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] font-sans"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                {formError && <p className="text-sm text-red-600">{formError}</p>}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-500 font-bold font-sans hover:text-[#ff5e00]"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-[#ff5e00] text-white px-8 py-4 rounded-xl font-bold text-[16px] hover:bg-[#e55500] hover:shadow-lg transition-all"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Payment */}
          {step === 3 && (
            <div className="space-y-8 animate-fade-in">
              <h2 className="text-2xl font-bold font-sans text-gray-900 border-b border-gray-100 pb-4">
                3. Review & Pay
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Summary Panel */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 h-fit">
                  <h3 className="text-lg font-bold font-sans text-gray-900 mb-4">Booking Summary</h3>
                  
                  <ul className="space-y-3 mb-6 text-sm font-sans text-gray-600">
                    <li className="flex justify-between">
                      <span>Tour</span>
                      <span className="font-bold text-gray-900 text-right">{tour.title}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Date</span>
                      <span className="font-bold text-gray-900 text-right">
                        {new Date(formData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {formData.timeSlot && ` at ${formData.timeSlot}`}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Guests</span>
                      <span className="font-bold text-gray-900 text-right">{totalPeople} People</span>
                    </li>
                  </ul>

                  <VoucherCode
                    onApply={handleVoucherApply}
                    onRemove={handleVoucherRemove}
                    appliedCode={voucherCode}
                    discount={voucherDiscount}
                  />

                  <div className="border-t border-gray-200 mt-6 pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600 font-sans">
                      <span>Subtotal</span>
                      <span>{symbol} {convert(baseSubtotal, pricingBase).toFixed(2)}</span>
                    </div>
                    {voucherDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600 font-sans">
                        <span>Voucher discount ({voucherDiscount}%)</span>
                        <span>-{symbol} {convert(discountAmount, pricingBase).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold font-sans text-gray-900 pt-2">
                      <span>Total</span>
                      <span className="text-[#ff5e00]">
                        {symbol} {convert(totalPrice, pricingBase).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Panel */}
                <div className="space-y-6">
                  {!showPayment ? (
                    <>
                      {formError && <p className="text-sm text-red-600">{formError}</p>}
                      {exchangeRatePending && (
                        <p className="text-sm text-gray-600">
                          Loading current exchange rate before payment...
                        </p>
                      )}
                      {exchangeRateUnavailable && (
                        <p className="text-sm text-red-600">
                          We cannot load the current GHS exchange rate right now. Please try again before paying.
                        </p>
                      )}
                      {!exchangeRateUnavailable && (
                        <PaymentOptions
                          totalPrice={toGhs(totalPrice, pricingBase)}
                          selectedOption={paymentOption}
                          onSelectOption={setPaymentOption}
                          depositPercentage={30}
                        />
                      )}
                      <button
                        type="button"
                        onClick={paymentOption === "cash" ? handleCashBooking : () => {
                          setFormError(null);
                          setShowPayment(true);
                        }}
                        disabled={exchangeRatePending || exchangeRateUnavailable}
                        className="w-full bg-[#ff5e00] text-white py-4 rounded-xl font-bold text-[16px] hover:bg-[#e55500] hover:shadow-xl transition-all font-sans"
                      >
                        {paymentOption === "cash"
                          ? `Reserve Booking — Pay ${symbol} ${convert(totalPrice, pricingBase).toFixed(2)} in Person`
                          : `Confirm & Pay ${symbol} ${convert(paymentAmount, pricingBase).toFixed(2)}`}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full text-center text-gray-500 font-bold font-sans hover:text-[#ff5e00]"
                      >
                        Go Back
                      </button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                        <PaystackPayment
                          amount={toGhs(paymentAmount, pricingBase)}
                          email={formData.email}
                          onSuccess={handlePaymentSuccess}
                          onError={(err) => alert(`Payment error: ${err}`)}
                          metadata={{
                            tourId: tour.id,
                            tourSlug: tour.slug,
                            userId: userId,
                            packageName: tour.title,
                            customerName: `${formData.firstName} ${formData.lastName}`.trim(),
                            customerPhone: formData.phone,
                            numberOfPeople: totalPeople,
                            date: formData.date,
                            timeSlot: formData.timeSlot,
                            pickupLocation: formData.pickupLocation,
                            paymentOption,
                            tierSelections,
                            totalCost: toGhs(totalPrice, pricingBase),
                            paymentAmount: toGhs(paymentAmount, pricingBase),
                            voucherCode: voucherCode || null,
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPayment(false)}
                        className="w-full text-gray-500 font-bold font-sans hover:text-[#ff5e00] underline"
                      >
                        Change Payment Option
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Cross-Sell Section */}
      {otherTours && otherTours.length > 0 && (
        <section className="bg-gray-50 py-12 md:py-16 border-t border-gray-100">
          <div className="container mx-auto px-4 sm:px-6 md:px-12">
            <h2 className="text-[20px] md:text-[24px] font-bold text-gray-900 mb-6 uppercase tracking-wide" style={{ fontFamily: "var(--font-unlimited-pie)" }}>
              Check out other tours
            </h2>
            <TourGrid tours={otherTours} categorySlug={tour.categorySlug || 'tours'} />
          </div>
        </section>
      )}

    </div>
  );
}
