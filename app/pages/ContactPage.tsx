"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { contactFormSchema, type ContactFormData } from "../lib/validations/contact";
import type { ZodError } from "zod";
import Footer from "../components/Footer";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Location01Icon, CallIcon, Mail01Icon } from "hugeicons-react";

export default function ContactPage() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    const q = (searchParams.get("q") || searchParams.get("search") || "").trim();
    const from = searchParams.get("from") || "";
    if (!q && from !== "year-plan") return;

    setFormData((prev) => {
      if (prev.subject || prev.message) return prev;
      if (from === "year-plan") {
        return {
          ...prev,
          subject: "Year plan / custom trip",
          message:
            "I'm interested in learning more about your seasonal trips or arranging a private experience.\n\n",
        };
      }
      if (from === "packages" && q) {
        return {
          ...prev,
          subject: `Tour enquiry: ${q}`,
          message: `I searched for "${q}" on your packages page and didn't find a match. I'd like to discuss a private trip or future availability.\n\n`,
        };
      }
      if (q) {
        return {
          ...prev,
          subject: prev.subject || `Enquiry: ${q}`,
          message: prev.message || `I'm looking for: ${q}\n\n`,
        };
      }
      return prev;
    });
  }, [searchParams]);

  const validateForm = (): boolean => {
    try {
      contactFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Error && "issues" in error) {
        const zodError = error as ZodError;
        const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
        
        zodError.issues.forEach((issue) => {
          const field = issue.path[0] as keyof ContactFormData;
          if (field) {
            fieldErrors[field] = issue.message;
          }
        });
        
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ContactFormData];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setSubmitMessage("");

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message.');
      }
      
      setSubmitStatus("success");
      setSubmitMessage(data.message || "Thank you! Your message has been sent successfully.");
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(error instanceof Error ? error.message : "Failed to send message. Please try again later.");
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Main Banner/Call to Action Section */}
      <section className="relative w-full pt-20 pb-20 overflow-hidden bg-gradient-to-br from-[#ff5e00] to-[#e55500]">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle at 20% 150%, white 0%, transparent 50%), radial-gradient(circle at 80% -50%, white 0%, transparent 50%)' }}
        />
        <div className="absolute inset-0 opacity-10"
             style={{ backgroundImage: 'url("/assets/pattern.svg")', backgroundSize: '200px', mixBlendMode: 'overlay' }} 
        />
        
        <div className="container mx-auto px-4 sm:px-6 md:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 
              className="text-4xl md:text-6xl text-white tracking-tight"
              style={{ fontFamily: 'var(--font-unlimited-pie)' }}
            >
              Let&apos;s <span className="text-[#ffe0cc]">Connect</span>
            </h1>
            <p 
              className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed"
              style={{ fontFamily: 'var(--font-quicksand)' }}
            >
              Have questions about our tours or want a custom travel package? Send us a message and our team will get back to you immediately!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information and Form Section */}
      <section className="w-full px-4 sm:px-6 md:px-12 py-12 sm:py-16 md:py-24 bg-white relative">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">
            {/* Left Column - Contact Information */}
            <div className="lg:col-span-2 space-y-12">
              <div>
                <h2 
                  className="text-gray-900 text-3xl md:text-4xl mb-8"
                  style={{ fontFamily: 'var(--font-unlimited-pie)' }}
                >
                  Get in Touch
                </h2>
                <div className="space-y-6">
                  {/* Info Cards */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-orange-50/50 border border-orange-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-[#ff5e00]">
                      <Location01Icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Office Location</h4>
                      <p className="text-gray-600 font-medium leading-relaxed">
                        Greda Estate, 6th Avenue,<br/>Accra, Ghana
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-orange-50/50 border border-orange-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-[#ff5e00]">
                      <CallIcon size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Call Us</h4>
                      <a href="tel:+233576093838" className="text-gray-600 font-medium hover:text-[#ff5e00] transition-colors block">
                        +233 576 093 838
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-orange-50/50 border border-orange-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-[#ff5e00]">
                      <Mail01Icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Email Support</h4>
                      <a href="mailto:bookings@sabarytours.com" className="text-gray-600 font-medium hover:text-[#ff5e00] transition-colors block">
                        bookings@sabarytours.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-[#222] text-[18px] font-bold mb-4">
                  Connect with us:
                </h3>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-[#222] text-white flex items-center justify-center hover:bg-[#ff5e00] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-[#222] text-white flex items-center justify-center hover:bg-[#ff5e00] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-[#222] text-white flex items-center justify-center hover:bg-[#ff5e00] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-[#222] text-white flex items-center justify-center hover:bg-[#ff5e00] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-[#222] text-white flex items-center justify-center hover:bg-[#ff5e00] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-[#222] text-white flex items-center justify-center hover:bg-[#ff5e00] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="lg:col-span-3">
              <p className="text-[#222] text-[16px] font-normal leading-[24px] mb-6">
                Fill out the form below, we will get back to you with more
                information.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-[#222] text-[14px] font-bold mb-2"
                    >
                      First name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Jane"
                      className={`w-full px-5 py-3.5 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5e00]/20 focus:border-[#ff5e00] transition-all text-sm font-medium text-gray-900 ${
                        errors.firstName ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : "border-gray-200"
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-[12px] mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-[#222] text-[14px] font-bold mb-2"
                    >
                      Last name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className={`w-full px-5 py-3.5 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5e00]/20 focus:border-[#ff5e00] transition-all text-sm font-medium text-gray-900 ${
                        errors.lastName ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : "border-gray-200"
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-[12px] mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-[#222] text-[14px] font-bold mb-2"
                  >
                    Phone
                  </label>
                  <PhoneInput
                    country="gh"
                    value={formData.phone}
                    onChange={(val: string) => {
                      setFormData((prev) => ({ ...prev, phone: val ? `+${val}` : "" }));
                      if (errors.phone) {
                        setErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.phone;
                          return newErrors;
                        });
                      }
                    }}
                    containerClass={`!w-full !rounded-xl !border ${errors.phone ? "!border-red-400" : "!border-gray-200"}`}
                    inputClass="!w-full !py-3.5 !bg-gray-50/50 !rounded-xl !text-sm !font-medium !text-gray-900 !border-0 focus:!ring-2 focus:!ring-[#ff5e00]/20"
                    buttonClass="!bg-gray-50/50 !border-0 !rounded-l-xl"
                    enableSearch
                    searchPlaceholder="Search country..."
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-[12px] mt-1">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold text-gray-900 mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="janedoe@example.com"
                    className={`w-full px-5 py-3.5 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5e00]/20 focus:border-[#ff5e00] transition-all text-sm font-medium text-gray-900 ${
                      errors.email ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : "border-gray-200"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-[12px] mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-bold text-gray-900 mb-2"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    className={`w-full px-5 py-3.5 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5e00]/20 focus:border-[#ff5e00] transition-all text-sm font-medium text-gray-900 ${
                      errors.subject ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : "border-gray-200"
                    }`}
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-[12px] mt-1">{errors.subject}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-bold text-gray-900 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Type your message here..."
                    className={`w-full px-5 py-3.5 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5e00]/20 focus:border-[#ff5e00] transition-all resize-none text-sm font-medium text-gray-900 ${
                      errors.message ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : "border-gray-200"
                    }`}
                  />
                  {errors.message && (
                    <p className="text-red-500 text-[12px] mt-1">{errors.message}</p>
                  )}
                </div>
                {/* Status Messages */}
                {submitStatus === "success" && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-[14px] font-medium">{submitMessage}</p>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-[14px] font-medium">{submitMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-[#ff5e00] text-white px-6 py-4 rounded-xl font-bold text-[16px] transition-all shadow-md  ${
                    isSubmitting
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:bg-[#e55500] hover:shadow-lg hover:-translate-y-0.5"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       Sending...
                    </div>
                  ) : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

