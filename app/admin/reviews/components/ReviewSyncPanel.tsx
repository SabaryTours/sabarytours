"use client";

import { useState } from "react";

export default function ReviewSyncPanel({ onSynced }: { onSynced?: () => void }) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [googleMessage, setGoogleMessage] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importJson, setImportJson] = useState("");

  const syncGoogle = async () => {
    setGoogleLoading(true);
    setGoogleMessage(null);
    try {
      const res = await fetch("/api/admin/reviews/sync/google", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      setGoogleMessage(data.message || "Google reviews synced.");
      onSynced?.();
    } catch (err) {
      setGoogleMessage(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const importTripAdvisor = async () => {
    setImportLoading(true);
    setImportMessage(null);
    try {
      let reviews: unknown;
      try {
        const parsed = JSON.parse(importJson);
        reviews = Array.isArray(parsed) ? parsed : parsed.reviews;
      } catch {
        throw new Error("Paste valid JSON (array of reviews or { reviews: [...] }).");
      }

      if (!Array.isArray(reviews) || reviews.length === 0) {
        throw new Error("No reviews found in JSON.");
      }

      const res = await fetch("/api/admin/reviews/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "tripadvisor", reviews }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setImportMessage(data.message || "Imported successfully.");
      setImportJson("");
      onSynced?.();
    } catch (err) {
      setImportMessage(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#0060cc]/20 bg-gradient-to-br from-[#f0f7ff] to-white p-5 sm:p-6 mb-8 font-sans space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Import from Google & TripAdvisor</h2>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          Sync Google reviews automatically (requires API keys in your hosting env). For
          TripAdvisor, use the live widget on your site or paste a JSON export below.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
          <h3 className="font-semibold text-gray-800 text-sm">Google Business</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Set <code className="bg-gray-100 px-1 rounded">GOOGLE_PLACES_API_KEY</code> and{" "}
            <code className="bg-gray-100 px-1 rounded">GOOGLE_PLACE_ID</code> in Vercel / .env.local.
            Google returns up to 5 reviews per sync.
          </p>
          <button
            type="button"
            onClick={syncGoogle}
            disabled={googleLoading}
            className="px-4 py-2 bg-[#0060cc] text-white rounded-lg text-sm font-semibold hover:bg-[#004a9e] disabled:opacity-60"
          >
            {googleLoading ? "Syncing…" : "Sync Google reviews"}
          </button>
          {googleMessage && (
            <p
              className={`text-xs ${googleMessage.toLowerCase().includes("sync") ? "text-green-700" : "text-red-600"}`}
            >
              {googleMessage}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
          <h3 className="font-semibold text-gray-800 text-sm">TripAdvisor import</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            TripAdvisor has no free public API. Paste JSON:{" "}
            <code className="bg-gray-100 px-1 rounded">
              {`[{ "name": "...", "rating": 5, "text": "..." }]`}
            </code>
          </p>
          <textarea
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            rows={4}
            placeholder='[{"name":"Jane","rating":5,"text":"Amazing tour!","date":"2024-06-01"}]'
            className="w-full text-xs border border-gray-200 rounded-lg p-2 font-mono text-gray-800 outline-none focus:border-[#ff5e00]"
          />
          <button
            type="button"
            onClick={importTripAdvisor}
            disabled={importLoading || !importJson.trim()}
            className="px-4 py-2 bg-[#00aa6c] text-white rounded-lg text-sm font-semibold hover:bg-[#008f5c] disabled:opacity-60"
          >
            {importLoading ? "Importing…" : "Import TripAdvisor JSON"}
          </button>
          {importMessage && (
            <p
              className={`text-xs ${importMessage.toLowerCase().includes("import") ? "text-green-700" : "text-red-600"}`}
            >
              {importMessage}
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 border-t border-gray-100 pt-4">
        <strong>Env for live widgets:</strong>{" "}
        <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_TRIPADVISOR_LOCATION_ID</code>,{" "}
        <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_TRIPADVISOR_URL</code>,{" "}
        <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_GOOGLE_REVIEWS_URL</code>
      </p>
    </div>
  );
}
