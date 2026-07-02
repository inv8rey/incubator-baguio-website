"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const DARK = "#141417";

// Baguio City center. Entries don't have real geocoded addresses yet, so
// each pin gets a small, deterministic (name-hash based) offset from here —
// stable across renders, not literal locations. Swap in real lat/lng per
// entry later and this component keeps working unchanged.
const BAGUIO_CENTER: [number, number] = [120.596, 16.4023];

export interface MapPin {
  key: string;
  label: string;
  color: string;
  bg: string;
  name: string;
  sub: string;
}

function hashOffset(key: string): [number, number] {
  let h1 = 0;
  let h2 = 0;
  for (let i = 0; i < key.length; i++) {
    h1 = (h1 * 31 + key.charCodeAt(i)) >>> 0;
    h2 = (h2 * 17 + key.charCodeAt(i)) >>> 0;
  }
  const spread = 0.028; // roughly keeps pins within Baguio's city bounds
  const lng = ((h1 % 2000) / 1000 - 1) * spread;
  const lat = ((h2 % 2000) / 1000 - 1) * spread;
  return [lng, lat];
}

export default function EcosystemMap({ pins }: { pins: MapPin[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: BAGUIO_CENTER,
      zoom: 13.5,
      pitch: 60,
      bearing: -17,
      attributionControl: { compact: true },
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map: maplibregl.Map | null = mapRef.current;
    if (!map) return;

    function renderMarkers() {
      if (!map) return;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      pins.forEach((p) => {
        const [dLng, dLat] = hashOffset(p.key);
        const lngLat: [number, number] = [BAGUIO_CENTER[0] + dLng, BAGUIO_CENTER[1] + dLat];

        const el = document.createElement("div");
        el.style.cssText = `width:34px;height:34px;border-radius:9999px;background:${p.bg};color:${p.color};font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.25);cursor:pointer;`;
        el.textContent = p.label;

        const popup = new maplibregl.Popup({ offset: 20, closeButton: false }).setHTML(
          `<div style="font-family:inherit;padding:2px 2px;"><div style="font-size:13px;font-weight:700;color:${DARK};margin-bottom:2px;">${escapeHtml(p.name)}</div>${p.sub ? `<div style="font-size:12px;color:#6B6B73;">${escapeHtml(p.sub)}</div>` : ""}</div>`
        );

        const marker = new maplibregl.Marker({ element: el }).setLngLat(lngLat).setPopup(popup).addTo(map);
        markersRef.current.push(marker);
      });
    }

    if (map.isStyleLoaded()) renderMarkers();
    else map.once("load", renderMarkers);

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
  }, [pins]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: 480, borderRadius: 20, overflow: "hidden", border: "1px solid rgba(20,20,25,0.10)" }}
    />
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
