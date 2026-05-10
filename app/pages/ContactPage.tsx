"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { contactFormSchema, type ContactFormData } from "../lib/validations/contact";
import type { ZodError } from "zod";
import Footer from "../components/Footer";
import SocialMediaLinks from "../components/SocialMediaLinks";
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
                <SocialMediaLinks variant="circleDark" />
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

