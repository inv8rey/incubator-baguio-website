/**
 * Fire-and-forget: asks the server to refresh the signups Google Sheet.
 * Never awaited by callers and never throws, so it can't slow or break a signup.
 */
export function triggerSignupsSheetSync(): void {
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || "";
  fetch(`${bp}/api/signups-sheet/`, { method: "POST" }).catch(() => {});
}
