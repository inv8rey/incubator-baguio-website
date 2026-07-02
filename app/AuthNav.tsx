"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "./AuthProvider";

const ORANGE = "#F26522";
const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function AuthWidget({ mobile }: { mobile: boolean }) {
  const { user, profile, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (loading) return null;

  if (!user) {
    return (
      <a
        href={`${BP}/login/`}
        style={{
          color: "#fff",
          fontWeight: 600,
          fontSize: 14,
          padding: mobile ? "12px 0" : "10px 16px",
          textDecoration: "none",
          display: mobile ? "block" : "inline-block",
        }}
      >
        Log In
      </a>
    );
  }

  const name = profile?.full_name || user.email || "Account";

  if (mobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <a href={`${BP}/dashboard/`} style={{ color: "#fff", fontWeight: 600, fontSize: 14, padding: "12px 0", textDecoration: "none" }}>
          Dashboard ({name.split(" ")[0]})
        </a>
        <button
          onClick={() => signOut().then(() => (window.location.href = `${BP}/`))}
          style={{ color: "rgba(255,255,255,0.65)", fontWeight: 600, fontSize: 14, padding: "8px 0", background: "none", border: "none", textAlign: "left", cursor: "pointer" }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 38,
          height: 38,
          borderRadius: 9999,
          background: ORANGE,
          color: "#fff",
          fontSize: 13,
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label="Account menu"
      >
        {initialsOf(name)}
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            background: "#181819",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 14,
            padding: 8,
            minWidth: 200,
            boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
            zIndex: 60,
          }}
        >
          <div style={{ padding: "8px 12px 10px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 6 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#fff" }}>{name}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{user.email}</div>
          </div>
          {[
            ["Dashboard", "/dashboard/"],
            ["My Startups", "/dashboard/startup/"],
            ["Mentor Hub", "/dashboard/mentor/"],
            ["Organizations", "/dashboard/organizations/"],
            ["Connections", "/dashboard/connections/"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={`${BP}${href}`}
              style={{ display: "block", padding: "9px 12px", fontSize: 13.5, color: "rgba(255,255,255,0.82)", textDecoration: "none", borderRadius: 8 }}
            >
              {label}
            </a>
          ))}
          <button
            onClick={() => signOut().then(() => (window.location.href = `${BP}/`))}
            style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 12px", fontSize: 13.5, color: "#E23A2E", background: "none", border: "none", cursor: "pointer", borderRadius: 8, marginTop: 4 }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function AuthNav() {
  const [desktopSlot, setDesktopSlot] = useState<Element | null>(null);
  const [mobileSlot, setMobileSlot] = useState<Element | null>(null);

  useEffect(() => {
    setDesktopSlot(document.querySelector(".ib-auth-slot"));

    // The mobile menu panel is built asynchronously by Interactive.tsx; poll
    // briefly for it instead of coupling the two components' mount order.
    let tries = 0;
    const id = window.setInterval(() => {
      const panel = document.querySelector(".ib-mobile-menu");
      if (panel) {
        let holder = panel.querySelector(".ib-auth-mobile-slot");
        if (!holder) {
          holder = document.createElement("div");
          holder.className = "ib-auth-mobile-slot";
          (holder as HTMLElement).style.cssText = "margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);";
          panel.appendChild(holder);
        }
        setMobileSlot(holder);
        window.clearInterval(id);
      } else if (++tries > 40) {
        window.clearInterval(id);
      }
    }, 50);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      {desktopSlot && createPortal(<AuthWidget mobile={false} />, desktopSlot)}
      {mobileSlot && createPortal(<AuthWidget mobile />, mobileSlot)}
    </>
  );
}
