"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

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

type MonthDraft = { title: string; body: string; accent_color: string; is_published: boolean };

const emptyMonth = (): MonthDraft => ({
  title: "",
  body: "",
  accent_color: "#ff5e00",
  is_published: true,
});

export default function AdminTripOutlinePage() {
  const currentY = new Date().getFullYear();
  const [year, setYear] = useState(currentY);
  const [byMonth, setByMonth] = useState<Record<number, MonthDraft>>(() => {
    const o: Record<number, MonthDraft> = {};
    for (let m = 1; m <= 12; m++) o[m] = emptyMonth();
    return o;
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (y: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/trip-outline?year=${y}`);
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed to load");
      const next: Record<number, MonthDraft> = {};
      for (let m = 1; m <= 12; m++) next[m] = emptyMonth();
      (j.rows || []).forEach((r: { month: number; title?: string; body?: string | null; accent_color?: string; is_published?: boolean }) => {
        if (r.month < 1 || r.month > 12) return;
        next[r.month] = {
          title: r.title || "",
          body: r.body || "",
          accent_color: r.accent_color || "#ff5e00",
          is_published: r.is_published !== false,
        };
      });
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
      Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const d = byMonth[month] || emptyMonth();
        return {
          month,
          title: d.title.trim() || `${MONTH_LABELS[i]} highlights`,
          body: d.body.trim() || null,
          accent_color: d.accent_color.trim() || "#ff5e00",
          is_published: d.is_published,
        };
      }),
    [byMonth]
  );

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
      toast.success(`Saved ${j.saved ?? 12} months for ${year}.`);
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
          <h1 className="text-2xl font-bold text-gray-800 font-sans">Year trip outline</h1>
          <p className="text-gray-500 text-sm font-sans mt-1">
            One story per month for the public &quot;Year at a glance&quot; on the homepage. Leave body empty to hide
            detail for that month (title still shows if published).
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
        className="rounded-xl bg-[#0060cc] px-6 py-3 font-bold text-white font-sans hover:bg-[#004a9e] disabled:opacity-60"
      >
        {saving ? "Saving…" : `Save all 12 months (${year})`}
      </button>

      {loading ? (
        <p className="text-gray-500 font-sans">Loading…</p>
      ) : (
        <div className="space-y-6">
          {MONTH_LABELS.map((label, idx) => {
            const month = idx + 1;
            const d = byMonth[month] || emptyMonth();
            return (
              <div key={month} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-bold text-gray-800 font-sans">{label}</h2>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                    <input
                      type="checkbox"
                      checked={d.is_published}
                      onChange={(e) =>
                        setByMonth((prev) => ({
                          ...prev,
                          [month]: { ...d, is_published: e.target.checked },
                        }))
                      }
                    />
                    Published
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Short headline"
                  value={d.title}
                  onChange={(e) =>
                    setByMonth((prev) => ({
                      ...prev,
                      [month]: { ...d, title: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-sans"
                />
                <textarea
                  placeholder="What’s happening this month? (optional)"
                  rows={3}
                  value={d.body}
                  onChange={(e) =>
                    setByMonth((prev) => ({
                      ...prev,
                      [month]: { ...d, body: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-sans"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-sans">Accent</span>
                  <input
                    type="color"
                    value={d.accent_color}
                    onChange={(e) =>
                      setByMonth((prev) => ({
                        ...prev,
                        [month]: { ...d, accent_color: e.target.value },
                      }))
                    }
                    className="h-9 w-14 cursor-pointer rounded border border-gray-200 bg-white"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
