"use client";

import Script from "next/script";
import { useId } from "react";

interface TripAdvisorWidgetProps {
  locationId?: string;
  widgetType?: "cdsratingsonlywide" | "selfserveprop";
  className?: string;
}

/**
 * Official TripAdvisor embed — shows live rating badge / review widget from your listing.
 * Set NEXT_PUBLIC_TRIPADVISOR_LOCATION_ID (numeric ID from your TripAdvisor business URL).
 */
export default function TripAdvisorWidget({
  locationId,
  widgetType = "cdsratingsonlywide",
  className = "",
}: TripAdvisorWidgetProps) {
  const uniq = useId().replace(/:/g, "");
  const locId =
    locationId || process.env.NEXT_PUBLIC_TRIPADVISOR_LOCATION_ID || "";

  if (!locId) {
    return (
      <p className="text-sm text-gray-500 font-sans text-center">
        TripAdvisor widget: add{" "}
        <code className="text-xs bg-gray-100 px-1 rounded">
          NEXT_PUBLIC_TRIPADVISOR_LOCATION_ID
        </code>{" "}
        to your environment.
      </p>
    );
  }

  const scriptSrc = `https://www.jscache.com/wejs?wtype=${widgetType}&uniq=${uniq}&locationId=${locId}&lang=en_US&border=false&shadow=false&display_version=2${
    widgetType === "selfserveprop"
      ? "&rating=true&nreviews=5&writereviewlink=true&popIdx=true"
      : ""
  }`;

  return (
    <div className={`min-h-[80px] flex items-center justify-center ${className}`}>
      <div id={`TA_${widgetType}_${uniq}`} className={`TA_${widgetType}`}>
        <ul id={`TA_links_${uniq}`} className={`TA_links TA_${uniq}`}>
          <li id={`TA_link_${uniq}`} className={uniq}>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={
                process.env.NEXT_PUBLIC_TRIPADVISOR_URL ||
                "https://www.tripadvisor.com/"
              }
            >
              TripAdvisor
            </a>
          </li>
        </ul>
      </div>
      <Script src={scriptSrc} strategy="lazyOnload" />
    </div>
  );
}
