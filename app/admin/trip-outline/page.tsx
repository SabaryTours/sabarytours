"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { buildTripOutlineBody, parseTripOutlineBody } from "../../lib/tripOutline";
import { tourBookingHref } from "../../lib/tourUrls";

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type CardDraft = {
  id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  pickup: string;
  inclusions: string;
  price: string;
  seats_remaining: string;
  total_seats: string;
  show_seats: boolean;
  details: string;
  image_url: string;
  tour_slug: string;
  card_type: "featured" | "upcoming";
  accent_color: string;
  is_published: boolean;
  sort_order: number;
};

type TourOption = {
  slug: string;
  title: string;
  category: string | null;
};

const emptyCard = (sortOrder: number): CardDraft => ({
  title: "",
  description: "",
  date: "",
  time: "",
  pickup: "",
  inclusions: "",
  price: "",
  seats_remaining: "",
  total_seats: "",
  show_seats: false,
  details: "",
  image_url: "",
  tour_slug: "",
  card_type: "upcoming",
  accent_color: "#ff5e00",
  is_published: true,
  sort_order: sortOrder,
});

export default function AdminTripOutlinePage() {
  const currentY = new Date().getFullYear();
  const [year, setYear] = useState(currentY);
  const [byMonth, setByMonth] = useState<Record<number, CardDraft[]>>(() => {
    const o: Record<number, CardDraft[]> = {};
    for (let m = 1; m <= 12; m++) o[m] = [];
    return o;
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [tourOptions, setTourOptions] = useState<TourOption[]>([]);

  const load = useCallback(async (y: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/trip-outline?year=${y}`);
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed to load");
      setTourOptions(Array.isArray(j.tourOptions) ? j.tourOptions : []);
      const next: Record<number, CardDraft[]> = {};
      for (let m = 1; m <= 12; m++) next[m] = [];
      (j.rows || []).forEach((r: {
        id?: string;
        month: number;
        title?: string;
        body?: string | null;
        description?: string | null;
        image_url?: string | null;
        book_url?: string | null;
        card_type?: "featured" | "upcoming";
        accent_color?: string;
        is_published?: boolean;
        sort_order?: number;
      }) => {
        if (r.month < 1 || r.month > 12) return;
        const meta = parseTripOutlineBody(r.body);
        next[r.month].push({
          id: r.id,
          title: r.title || "",
          description: r.description || meta.description || "",
          date: meta.date || "",
          time: meta.time || "",
          pickup: meta.pickup || "",
          inclusions: meta.inclusions || "",
          price: meta.price || "",
          seats_remaining:
            typeof meta.seats_remaining === "number" ? String(meta.seats_remaining) : "",
          total_seats: typeof meta.total_seats === "number" ? String(meta.total_seats) : "",
          show_seats: meta.show_seats === true,
          details: meta.details || "",
          image_url: r.image_url || meta.image_url || "",
          tour_slug: meta.tour_slug || "",
          card_type: r.card_type || meta.card_type || "upcoming",
          accent_color: r.accent_color || "#ff5e00",
          is_published: r.is_published !== false,
          sort_order: Number.isFinite(r.sort_order) ? Number(r.sort_order) : next[r.month].length,
        });
      });

      for (let m = 1; m <= 12; m++) {
        next[m].sort((a, b) => a.sort_order - b.sort_order);
      }
      setByMonth(next);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(year);
  }, [year, load]);

  const rowsPayload = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) =>
        (byMonth[i + 1] || []).map((card, idx) => {
          const bookUrl = card.tour_slug.trim()
            ? tourBookingHref(card.tour_slug.trim(), { date: card.date, time: card.time, pickup: card.pickup })
            : "/contact?from=upcoming-tour";

          return {
          id: card.id,
          month: i + 1,
          title: card.title.trim() || `${MONTH_LABELS[i]} highlights`,
          description: card.description.trim() || null,
          image_url: card.image_url.trim() || null,
          book_url: bookUrl,
          card_type: card.card_type,
          body: buildTripOutlineBody({
            description: card.description,
            image_url: card.image_url,
            book_url: bookUrl,
            tour_slug: card.tour_slug.trim() || undefined,
            card_type: card.card_type,
            date: card.date,
            time: card.time,
            pickup: card.pickup,
            inclusions: card.inclusions,
            price: card.price,
            seats_remaining: card.seats_remaining.trim() ? Number(card.seats_remaining) : null,
            total_seats: card.total_seats.trim() ? Number(card.total_seats) : null,
            show_seats: card.show_seats,
            details: card.details,
          }),
          accent_color: card.accent_color.trim() || "#ff5e00",
          is_published: card.is_published,
          sort_order: idx,
        };
        })
      ).flat(),
    [byMonth]
  );

  const updateCard = (month: number, cardIndex: number, patch: Partial<CardDraft>) => {
    setByMonth((prev) => {
      const cards = [...(prev[month] || [])];
      cards[cardIndex] = { ...cards[cardIndex], ...patch };
      return { ...prev, [month]: cards };
    });
  };

  const addCard = (month: number) => {
    setByMonth((prev) => {
      const cards = [...(prev[month] || [])];
      cards.push(emptyCard(cards.length));
      return { ...prev, [month]: cards };
    });
  };

  const removeCard = (month: number, cardIndex: number) => {
    setByMonth((prev) => {
      const cards = (prev[month] || []).filter((_, i) => i !== cardIndex).map((card, i) => ({
        ...card,
        sort_order: i,
      }));
      return { ...prev, [month]: cards };
    });
  };

  const moveCard = (month: number, cardIndex: number, direction: "up" | "down") => {
    setByMonth((prev) => {
      const cards = [...(prev[month] || [])];
      const target = direction === "up" ? cardIndex - 1 : cardIndex + 1;
      if (target < 0 || target >= cards.length) return prev;
      const temp = cards[cardIndex];
      cards[cardIndex] = cards[target];
      cards[target] = temp;
      return {
        ...prev,
        [month]: cards.map((card, i) => ({ ...card, sort_order: i })),
      };
    });
  };

  const uploadCardImage = async (month: number, cardIndex: number, file: File) => {
    const key = `${month}-${cardIndex}`;
    try {
      setUploadingKey(key);
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.secure_url) throw new Error(data.error || "Upload failed");
      updateCard(month, cardIndex, { image_url: data.secure_url });
      toast.success("Image uploaded");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Image upload failed");
    } finally {
      setUploadingKey(null);
    }
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/trip-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, rows: rowsPayload }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Save failed");
      toast.success(`Saved ${j.saved ?? 0} cards for ${year}.`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-sans">Upcoming tours by month</h1>
          <p className="text-gray-500 text-sm font-sans mt-1">
            Create multiple featured/upcoming cards per month. These cards power the public{" "}
            <span className="font-semibold">Featured &amp; upcoming tours</span> page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-600 font-sans">Year</label>
          <input
            type="number"
            min={currentY - 1}
            max={currentY + 3}
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10) || currentY)}
            className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm font-sans"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => void saveAll()}
        disabled={saving || loading}
        className="rounded-xl bg-[#ff5e00] px-6 py-3 font-bold text-white font-sans hover:bg-[#e55500] disabled:opacity-60"
      >
        {saving ? "Saving…" : `Save all cards (${year})`}
      </button>

      {loading ? (
        <p className="text-gray-500 font-sans">Loading…</p>
      ) : (
        <div className="space-y-6">
          {MONTH_LABELS.map((label, idx) => {
            const month = idx + 1;
            const cards = byMonth[month] || [];
            return (
              <div key={month} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-bold text-gray-800 font-sans">{label}</h2>
                  <button
                    type="button"
                    onClick={() => addCard(month)}
                    className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-200"
                  >
                    + Add card
                  </button>
                </div>
                {cards.length === 0 ? (
                  <p className="text-sm text-gray-400 font-sans italic">No cards added for {label} yet.</p>
                ) : (
                  <div className="space-y-4">
                    {cards.map((card, cardIndex) => {
                      const uploadKey = `${month}-${cardIndex}`;
                      return (
                        <div key={card.id || `${month}-${cardIndex}`} className="rounded-xl border border-gray-200 p-4 space-y-3 bg-gray-50">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                              Card {cardIndex + 1}
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => moveCard(month, cardIndex, "up")}
                                disabled={cardIndex === 0}
                                className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-40"
                              >
                                Up
                              </button>
                              <button
                                type="button"
                                onClick={() => moveCard(month, cardIndex, "down")}
                                disabled={cardIndex === cards.length - 1}
                                className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-40"
                              >
                                Down
                              </button>
                              <button
                                type="button"
                                onClick={() => removeCard(month, cardIndex)}
                                className="rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                Remove
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Short headline"
                              value={card.title}
                              onChange={(e) => updateCard(month, cardIndex, { title: e.target.value })}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-sans"
                            />
                            <select
                              value={card.card_type}
                              onChange={(e) =>
                                updateCard(month, cardIndex, {
                                  card_type: e.target.value === "featured" ? "featured" : "upcoming",
                                })
                              }
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-sans bg-white"
                            >
                              <option value="upcoming">Upcoming</option>
                              <option value="featured">Featured</option>
                            </select>
                          </div>

                          <textarea
                            placeholder="Short tour description"
                            rows={3}
                            value={card.description}
                            onChange={(e) => updateCard(month, cardIndex, { description: e.target.value })}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-sans"
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="date"
                              aria-label="Fixed tour date"
                              value={card.date}
                              onChange={(e) => updateCard(month, cardIndex, { date: e.target.value })}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-sans"
                            />
                            <input
                              type="text"
                              placeholder="Price, e.g. GHS 450"
                              value={card.price}
                              onChange={(e) => updateCard(month, cardIndex, { price: e.target.value })}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-sans"
                            />
                            <input
                              type="time"
                              aria-label="Fixed tour time"
                              value={card.time}
                              onChange={(e) => updateCard(month, cardIndex, { time: e.target.value })}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-sans"
                            />
                            <input
                              type="text"
                              placeholder="Fixed pickup point"
                              value={card.pickup}
                              onChange={(e) => updateCard(month, cardIndex, { pickup: e.target.value })}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-sans"
                            />
                            <input
                              type="number"
                              min="0"
                              placeholder="Spaces remaining (optional)"
                              value={card.seats_remaining}
                              onChange={(e) => updateCard(month, cardIndex, { seats_remaining: e.target.value })}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-sans"
                            />
                            <input
                              type="number"
                              min="0"
                              placeholder="Total seats (optional)"
                              value={card.total_seats}
                              onChange={(e) => updateCard(month, cardIndex, { total_seats: e.target.value })}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-sans"
                            />
                          </div>

                          <label className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={card.show_seats}
                              onChange={(e) => updateCard(month, cardIndex, { show_seats: e.target.checked })}
                              className="mt-0.5"
                            />
                            <span className="text-sm text-gray-700 font-sans">
                              Show seat numbers on the public upcoming-tours page
                            </span>
                          </label>

                          <textarea
                            placeholder="Inclusions, e.g. Transport, guide, lunch, museum fees"
                            rows={2}
                            value={card.inclusions}
                            onChange={(e) => updateCard(month, cardIndex, { inclusions: e.target.value })}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-sans"
                          />

                          <textarea
                            placeholder="Extra details shown on the public card"
                            rows={2}
                            value={card.details}
                            onChange={(e) => updateCard(month, cardIndex, { details: e.target.value })}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-sans"
                          />

                          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
                            <input
                              type="url"
                              placeholder="Card image URL (optional)"
                              value={card.image_url}
                              onChange={(e) => updateCard(month, cardIndex, { image_url: e.target.value })}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-sans"
                            />
                            <label className={`inline-flex cursor-pointer items-center justify-center rounded-lg bg-[#ff5e00] px-3 py-2 text-xs font-bold text-white hover:bg-[#e55500] ${uploadingKey === uploadKey ? "opacity-60" : ""}`}>
                              {uploadingKey === uploadKey ? "Uploading..." : "Upload image"}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingKey === uploadKey}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) void uploadCardImage(month, cardIndex, file);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <select
                              value={card.tour_slug}
                              onChange={(e) => updateCard(month, cardIndex, { tour_slug: e.target.value })}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-sans bg-white md:col-span-2"
                            >
                              <option value="">No linked tour (Book Now goes to contact)</option>
                              {tourOptions.map((tour) => (
                                <option key={tour.slug} value={tour.slug}>
                                  {tour.title} ({tour.slug})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-sans text-gray-600">
                            Booking URL:{" "}
                            <span className="font-semibold text-gray-800">
                              {card.tour_slug.trim()
                                ? tourBookingHref(card.tour_slug.trim())
                                : "/contact?from=upcoming-tour"}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4">
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                              <input
                                type="checkbox"
                                checked={card.is_published}
                                onChange={(e) => updateCard(month, cardIndex, { is_published: e.target.checked })}
                              />
                              Published
                            </label>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 font-sans">Accent</span>
                              <input
                                type="color"
                                value={card.accent_color}
                                onChange={(e) => updateCard(month, cardIndex, { accent_color: e.target.value })}
                                className="h-9 w-14 cursor-pointer rounded border border-gray-200 bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
