/**
 * Fire-and-forget: asks the server to send the one-time welcome email if
 * this address hasn't been welcomed yet (see
 * supabase/migrations/2026-09-23-newsletter-welcome-email.sql). Never
 * awaited by callers and never throws -- a failed or slow welcome email must
 * never block or error the subscribe flow that triggered it.
 */
export function triggerNewsletterWelcome(email: string): void {
  fetch("/api/newsletter/welcome/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  }).catch(() => {});
}
