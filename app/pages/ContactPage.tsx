"use client";

import { useState } from "react";
import { contactFormSchema, type ContactFormData } from "../lib/validations/contact";
import type { ZodError } from "zod";
import Footer from "../components/Footer";

export default function ContactPage() {
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
      // Mock submission - replace with actual API call later
      await new Promise(resolve => setTimeout(resolve, 1000));
      
        setSubmitStatus("success");
      setSubmitMessage("Thank you! Your message has been sent successfully.");
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
      <section className="w-full px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-7">
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{ backgroundColor: "#893300" }}
        >
          {/* Pattern Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "url(/assets/pattern.svg)",
              backgroundRepeat: "repeat",
              backgroundSize: "auto",
              opacity: 0.3,
              mixBlendMode: "overlay",
            }}
          />

          {/* Central White Box */}
          <div className="container mx-auto px-3 sm:px-4 md:px-6 py-12 sm:py-14 md:py-16 relative z-10">
            <div className="max-w-3xl mx-auto">
              <div
                className="bg-white rounded-xl flex flex-col items-center justify-center gap-[13px] "
                style={{
                  border: '2px solid rgba(99,99,99,0.5)',
                  padding: '32px 24px',
                }}
              >
                <div
                  className="flex flex-col sm:flex-row gap-[12px] items-center leading-none uppercase w-full overflow-hidden"
                  style={{
                    fontFamily: 'var(--font-unlimited-pie)',
                    fontSize: '32px',
                  }}
                >
                  <p className="text-[#222]">You&apos;ve got</p>
                  <p
                    className="text-[#ff5e00]"
                    style={{
                      textShadow: '1px 1px 0px #551f00',
                    }}
                  >
                    questions, suggestions or feedback?
                  </p>
                </div>
                <p
                  className="text-[#222] text-[16px] font-bold text-center leading-[28px] w-full"
                  style={{
                    fontFamily: 'var(--font-quicksand)',
                  }}
                >
                  Send us a message. We&apos;d love to hear from you :)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information and Form Section */}
      <section className="w-full px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-7">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Contact Information */}
            <div>
              <h2 
                className="text-[#222] text-[32px] md:text-[40px] font-bold mb-6"
                style={{
                  fontFamily: 'var(--font-unlimited-pie)',
                }}
              >
                Contact information
              </h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#ff5e00] mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-[#222] text-[16px] font-normal leading-[24px]">
                    NO. 30 2nd Nana Kantom Street, Off El Shadai Ln,
                    Accra-Ghana.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#ff5e00] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a
                    href="tel:+233543093838"
                    className="text-[#222] text-[16px] font-normal leading-[24px] hover:text-[#ff5e00] transition-colors"
                  >
                    +233 543093838
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#ff5e00] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a
                    href="mailto:info@sabarytours.com"
                    className="text-[#222] text-[16px] font-normal leading-[24px] hover:text-[#ff5e00] transition-colors"
                  >
                    info@sabarytours.com
                  </a>
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
            <div>
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
                      placeholder="eg: Jane"
                      className={`w-full px-4 text-[#222] py-3 border rounded-lg focus:outline-none focus:border-[#ff5e00] transition-colors placeholder:text-[#222] placeholder:text-[14px] placeholder:font-normal placeholder:leading-[24px] ${
                        errors.firstName ? "border-red-500" : "border-[#e3e3e3]"
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
                      placeholder="eg: Doe"
                      className={`w-full px-4 text-[#222] py-3 border rounded-lg focus:outline-none focus:border-[#ff5e00] transition-colors placeholder:text-[#222] placeholder:text-[14px] placeholder:font-normal placeholder:leading-[24px] ${
                        errors.lastName ? "border-red-500" : "border-[#e3e3e3]"
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
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="eg: +233 543093838"
                    className={`w-full px-4 text-[#222] py-3 border rounded-lg focus:outline-none focus:border-[#ff5e00] transition-colors placeholder:text-[#222] placeholder:text-[14px] placeholder:font-normal placeholder:leading-[24px] ${
                      errors.phone ? "border-red-500" : "border-[#e3e3e3]"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-[12px] mt-1">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[#222] text-[14px] font-bold mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="eg: janedoe@gmail.com"
                    className={`w-full px-4 text-[#222] py-3 border rounded-lg focus:outline-none focus:border-[#ff5e00] transition-colors placeholder:text-[#222] placeholder:text-[14px] placeholder:font-normal placeholder:leading-[24px] ${
                      errors.email ? "border-red-500" : "border-[#e3e3e3]"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-[12px] mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-[#222] text-[14px] font-bold mb-2"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="eg: Inquiry about tours"
                    className={`w-full px-4 text-[#222] py-3 border rounded-lg focus:outline-none focus:border-[#ff5e00] transition-colors placeholder:text-[#222] placeholder:text-[14px] placeholder:font-normal placeholder:leading-[24px] ${
                      errors.subject ? "border-red-500" : "border-[#e3e3e3]"
                    }`}
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-[12px] mt-1">{errors.subject}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-[#222] text-[14px] font-bold mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Tell us how we can help you..."
                    className={`w-full px-4 text-[#222] py-3 border rounded-lg focus:outline-none focus:border-[#ff5e00] transition-colors resize-none placeholder:text-[#222] placeholder:text-[14px] placeholder:font-normal placeholder:leading-[24px] ${
                      errors.message ? "border-red-500" : "border-[#e3e3e3]"
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
                  className={`w-full bg-[#ff5e00] text-white px-6 py-3 rounded-lg font-bold text-[16px] transition-colors ${
                    isSubmitting
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-[#e55500]"
                  }`}
                >
                  {isSubmitting ? "Sending..." : "Send message"}
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

