export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Safely parse a date string that may be date-only ("2026-09-25")
 * or a full ISO datetime ("2026-09-25T16:40:27"). Always returns
 * a Date at midnight local time for the given calendar date.
 */
function parseDate(s: string): Date {
  // Take only the "YYYY-MM-DD" portion (first 10 chars)
  const dateOnly = s.includes("T") ? s.split("T")[0] : s;
  return new Date(dateOnly + "T00:00:00");
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const d = parseDate(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatDateRange(checkIn: string, checkOut: string): string {
  if (!checkIn || !checkOut) return "";
  const d1 = parseDate(checkIn);
  const d2 = parseDate(checkOut);

  const m1 = d1.toLocaleDateString("en-US", { month: "short" });
  const m2 = d2.toLocaleDateString("en-US", { month: "short" });
  const y1 = d1.getFullYear();
  const y2 = d2.getFullYear();

  if (y1 === y2) {
    if (m1 === m2) {
      return `${m1} ${d1.getDate()} – ${d2.getDate()}, ${y1}`;
    }
    return `${m1} ${d1.getDate()} – ${m2} ${d2.getDate()}, ${y1}`;
  }
  return `${m1} ${d1.getDate()}, ${y1} – ${m2} ${d2.getDate()}, ${y2}`;
}

export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const d1 = parseDate(checkIn);
  const d2 = parseDate(checkOut);
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}
