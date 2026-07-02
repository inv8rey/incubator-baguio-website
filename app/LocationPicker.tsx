"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { BAGUIO_CENTER } from "./ecosystem/EcosystemMap";

const ORANGE = "#F26522";

// Roughly greater Baguio City — biases/bounds Nominatim search results so a
// same-named street elsewhere in the Philippines doesn't win the match.
const BAGUIO_VIEWBOX = "120.55,16.45,120.64,16.36";

export interface LocationValue {
  lat: number;
  lng: number;
  address: string;
}

async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ph&viewbox=${BAGUIO_VIEWBOX}&bounded=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const results = await res.json();
  if (!Array.isArray(results) || results.length === 0) return null;
  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
}

export default function LocationPicker({ value, onChange }: { value: LocationValue | null; onChange: (next: LocationValue) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  const [addressInput, setAddressInput] = useState(value?.address ?? "");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const start: [number, number] = value ? [value.lng, value.lat] : BAGUIO_CENTER;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: start,
      zoom: 14.5,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    const marker = new maplibregl.Marker({ color: ORANGE, draggable: true }).setLngLat(start).addTo(map);
    marker.on("dragend", () => {
      const { lng, lat } = marker.getLngLat();
      onChange({ lat, lng, address: valueRef.current?.address ?? addressInput });
    });
    map.on("click", (e) => {
      marker.setLngLat(e.lngLat);
      onChange({ lat: e.lngLat.lat, lng: e.lngLat.lng, address: valueRef.current?.address ?? addressInput });
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the marker/map in sync if the value changes from outside (e.g. edit modal loading a different startup).
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !value) return;
    markerRef.current.setLngLat([value.lng, value.lat]);
    mapRef.current.setCenter([value.lng, value.lat]);
  }, [value?.lat, value?.lng]);

  async function search() {
    if (!addressInput.trim()) return;
    setSearching(true);
    setError("");
    try {
      const result = await geocode(addressInput.trim());
      if (!result) {
        setError("No match found in Baguio for that address — try a nearby landmark, or drag the pin manually.");
        return;
      }
      markerRef.current?.setLngLat([result.lng, result.lat]);
      mapRef.current?.flyTo({ center: [result.lng, result.lat], zoom: 15.5 });
      onChange({ lat: result.lat, lng: result.lng, address: addressInput.trim() });
    } catch {
      setError("Couldn't reach the location search — try again in a moment.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          value={addressInput}
          onChange={(e) => setAddressInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              search();
            }
          }}
          placeholder="e.g. Session Road, Baguio City"
          style={{ flex: 1, fontSize: 13.5, padding: "9px 12px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", outline: "none", boxSizing: "border-box" }}
        />
        <button
          type="button"
          onClick={search}
          disabled={searching}
          style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", background: "#141417", border: "none", borderRadius: 9, padding: "0 16px", cursor: searching ? "default" : "pointer", opacity: searching ? 0.7 : 1 }}
        >
          {searching ? "Searching…" : "Search"}
        </button>
      </div>
      {error && <p style={{ color: "#E23A2E", fontSize: 11.5, margin: "0 0 8px" }}>{error}</p>}
      <div ref={containerRef} style={{ width: "100%", height: 220, borderRadius: 12, overflow: "hidden", border: "1.5px solid rgba(20,20,25,0.12)" }} />
      <div style={{ fontSize: 11, color: "#9A958B", marginTop: 6 }}>
        Search an address or click/drag the pin to set the exact spot. {value ? `Currently at ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}.` : "No location set yet — defaults to Baguio center on the map."}
      </div>
    </div>
  );
}
