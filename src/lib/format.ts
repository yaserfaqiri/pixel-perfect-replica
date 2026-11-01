const TZ = "Asia/Kabul";

export function formatHijri(date: Date | string, withTime = false) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fa-AF-u-ca-persian", {
    timeZone: TZ,
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(d);
}

export function formatHijriShort(date: Date) {
  return new Intl.DateTimeFormat("fa-AF-u-ca-persian", { timeZone: TZ, weekday: "short", day: "numeric" }).format(date);
}

export function formatAFN(amount: number) {
  return `${new Intl.NumberFormat("fa-AF").format(amount)} افغانی`;
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("fa-AF").format(n);
}
