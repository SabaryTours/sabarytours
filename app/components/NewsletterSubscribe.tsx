"use client";

import { useState } from "react";

interface NewsletterSubscribeProps {
  variant?: "inline" | "card";
  className?: string;
}

export default function NewsletterSubscribe({
  variant = "card",
  className = "",
}: NewsletterSubscribeProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          firstName: "Newsletter",
          lastName: "Subscriber",
          source: "newsletter_component",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Subscription failed");
      setStatus("success");
      setMessage(data.message || "You're subscribed!");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const isCard = variant === "card";

  return (
    <div
      className={`${isCard ? "rounded-2xl border border-[#ffdfcc] bg-gradient-to-br from-[#fff7f0] to-white p-6 sm:p-8" : ""} ${className}`}
    >
      <h3
        className={`font-bold text-[#222] mb-2 ${isCard ? "text-xl" : "text-base"}`}
        style={{ fontFamily: "var(--font-unlimited-pie)" }}
      >
        Subscribe to our newsletter
      </h3>
      <p className="text-[#666] text-sm font-sans mb-4 leading-relaxed">
        Get travel tips, Ghana stories, and tour updates in your inbox.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          required
          disabled={status === "loading"}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-sans text-[#222] focus:outline-none focus:border-[#ff5e00] focus:ring-2 focus:ring-[#ff5e00]/20"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-5 py-3 rounded-xl bg-[#ff5e00] text-white text-sm font-bold font-sans hover:bg-[#e55500] disabled:opacity-60 whitespace-nowrap"
        >
          {status === "loading" ? "…" : "Subscribe"}
        </button>
      </form>
      {message && (
        <p
          className={`mt-2 text-xs font-sans whitespace-pre-line leading-relaxed ${status === "success" ? "text-green-700" : "text-red-600"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
