"use client";

import { useEffect } from "react";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";
const DEST = `${BP}/calendar/`;

export default function EventsRedirect() {
  useEffect(() => {
    window.location.replace(DEST);
  }, []);

  return (
    <main style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <p>
        This page has moved to <a href={DEST}>/calendar</a>.
      </p>
    </main>
  );
}
