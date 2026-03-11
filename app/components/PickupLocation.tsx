"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface PickupLocationProps {
  value: string;
  onChange: (location: string) => void;
}

// Google Maps types
declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (element: HTMLElement, options: unknown) => {
          setCenter: (location: { lat: number; lng: number }) => void;
          getBounds: () => { contains: (location: { lat: number; lng: number }) => boolean } | null;
          addListener: (event: string, callback: (e: unknown) => void) => void;
        };
        Marker: new (options: {
          map: unknown;
          draggable: boolean;
          position: { lat: number; lng: number };
        }) => {
          setPosition: (location: { lat: number; lng: number }) => void;
          getPosition: () => { lat: () => number; lng: () => number } | null;
          addListener: (event: string, callback: () => void) => void;
        };
        Geocoder: new () => {
          geocode: (
            request: { location: { lat: number; lng: number } },
            callback: (results: Array<{ formatted_address: string }> | null, status: string) => void
          ) => void;
        };
        places: {
          SearchBox: new (input: HTMLInputElement) => {
            setBounds: (bounds: unknown) => void;
            addListener: (event: string, callback: () => void) => void;
            getPlaces: () => Array<{
              geometry?: {
                location: { lat: () => number; lng: () => number };
              };
              formatted_address?: string;
              name?: string;
            }>;
          };
        };
        LatLng: new (lat: number, lng: number) => { lat: () => number; lng: () => number };
      };
    };
    initMap?: () => void;
  }
}

// Default center for Accra, Ghana
const DEFAULT_CENTER = { lat: 5.6037, lng: -0.1870 };

export default function PickupLocation({ value, onChange }: PickupLocationProps) {
  const [inputMode, setInputMode] = useState<"map" | "text">("map");
  const [customLocation, setCustomLocation] = useState("");
  const [mapLocation, setMapLocation] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markerRef = useRef<unknown>(null);
  const mapInstanceRef = useRef<unknown>(null);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current || !window.google || !window.google.maps) return;

    const google = window.google;
    const map = new google.maps.Map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    } as unknown);

    mapInstanceRef.current = map;

    // Add marker
    const marker = new google.maps.Marker({
      map,
      draggable: true,
      position: DEFAULT_CENTER,
    });

    markerRef.current = marker;

    // Geocoder for reverse geocoding
    const geocoder = new google.maps.Geocoder();

    // Update location when marker is dragged
    marker.addListener("dragend", () => {
      const position = marker.getPosition();
      if (position) {
        const lat = position.lat();
        const lng = position.lng();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const address = results[0].formatted_address;
            setMapLocation({
              address,
              lat,
              lng,
            });
            onChange(address);
          }
        });
      }
    });

    // Update location when map is clicked
    map.addListener("click", (e: unknown) => {
      const event = e as { latLng?: { lat: () => number; lng: () => number } };
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        const latLng = { lat, lng };
        marker.setPosition(latLng);
        geocoder.geocode({ location: latLng }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const address = results[0].formatted_address;
            setMapLocation({
              address,
              lat,
              lng,
            });
            onChange(address);
          }
        });
      }
    });

    // Search box for address autocomplete
    const searchInput = document.getElementById("map-search") as HTMLInputElement;
    if (searchInput) {
      const searchBox = new google.maps.places.SearchBox(searchInput);

      map.addListener("bounds_changed", () => {
        const bounds = map.getBounds();
        if (bounds) {
          searchBox.setBounds(bounds);
        }
      });

      searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();
        if (places && places.length > 0) {
          const place = places[0];
          if (place.geometry && place.geometry.location) {
            const location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };
            map.setCenter(location);
            marker.setPosition(location);
            
            const address = place.formatted_address || place.name || "";
            setMapLocation({
              address,
              lat: location.lat,
              lng: location.lng,
            });
            onChange(address);
          }
        }
      });
    }
  }, [onChange]);

  // Load Google Maps script
  useEffect(() => {
    if (inputMode === "map" && !mapLoaded) {
      // Check if Google Maps is already loaded
      if (window.google) {
        // Use setTimeout to avoid calling setState synchronously in effect
        setTimeout(() => setMapLoaded(true), 0);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = () => {
        setTimeout(() => setMapLoaded(true), 0);
      };

      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
        delete window.initMap;
      };
    }
  }, [inputMode, mapLoaded]);

  // Initialize map when loaded
  useEffect(() => {
    if (mapLoaded && inputMode === "map" && mapRef.current && !mapInstanceRef.current && window.google) {
      initializeMap();
    }
  }, [mapLoaded, inputMode, initializeMap]);

  const handleCustomLocationChange = (location: string) => {
    setCustomLocation(location);
    onChange(location);
  };

  return (
    <div className="space-y-3">
      <label className="block text-[#222] text-[14px] font-bold mb-2 font-sans">
        Pick-up Location <span className="text-xs text-gray-500 font-normal">(optional)</span>
      </label>

      {/* Mode Selector */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setInputMode("map")}
          className={`px-4 py-2 text-[13px] font-semibold font-sans rounded-lg transition-colors ${
            inputMode === "map"
              ? "bg-[#ff5e00] text-white"
              : "bg-gray-100 text-[#666] hover:bg-gray-200"
          }`}
        >
          Select on Map
        </button>
        <button
          type="button"
          onClick={() => setInputMode("text")}
          className={`px-4 py-2 text-[13px] font-semibold font-sans rounded-lg transition-colors ${
            inputMode === "text"
              ? "bg-[#ff5e00] text-white"
              : "bg-gray-100 text-[#666] hover:bg-gray-200"
          }`}
        >
          Enter Address
        </button>
      </div>

      {/* Map Selector */}
      {inputMode === "map" && (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-[#0060CC] text-[12px] font-normal font-sans">
              💡 Click on the map or drag the marker to select your pick-up location. You can also search for an address.
            </p>
          </div>

          {/* Search Box */}
          <input
            id="map-search"
            type="text"
            placeholder="Search for an address..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] font-sans text-[#222] placeholder:text-gray-400"
          />

          {/* Map Container */}
          <div
            ref={mapRef}
            className="w-full h-[400px] rounded-lg border border-gray-300 overflow-hidden"
            style={{ minHeight: "400px" }}
          />

          {/* Selected Location Display */}
          {mapLocation && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-[#00A86B] text-[13px] font-semibold font-sans mb-1">
                ✓ Location Selected
              </p>
              <p className="text-[#222] text-[14px] font-normal font-sans">
                {mapLocation.address}
              </p>
              <p className="text-[#666] text-[11px] font-normal font-sans mt-1">
                Coordinates: {mapLocation.lat.toFixed(6)}, {mapLocation.lng.toFixed(6)}
              </p>
            </div>
          )}

          {!mapLoaded && (
            <div className="w-full h-[400px] rounded-lg border border-gray-300 bg-gray-100 flex items-center justify-center">
              <p className="text-[#666] text-[14px] font-sans">Loading map...</p>
            </div>
          )}
        </div>
      )}

      {/* Text Input */}
      {inputMode === "text" && (
        <div className="space-y-2">
          <input
            type="text"
            value={customLocation}
            onChange={(e) => handleCustomLocationChange(e.target.value)}
            placeholder="Enter your pick-up address (e.g., 123 Main Street, Accra)"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] font-sans text-[#222] placeholder:text-gray-400"
          />
          <p className="text-[#666] text-[11px] font-normal font-sans">
            Enter the full address if you&apos;d like to be picked up from a specific location.
          </p>
        </div>
      )}

      {/* Selected Location Summary */}
      {value && inputMode === "text" && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-[#666] text-[12px] font-normal font-sans">
            Selected: <span className="font-semibold text-[#222]">{value}</span>
          </p>
        </div>
      )}
    </div>
  );
}

