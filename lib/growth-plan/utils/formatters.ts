export function currency(val: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val || 0);
}

export function number(val: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(val || 0);
}

export function percent(val: number): string {
  return `${((val || 0) * 100).toFixed(1)}%`;
}

export function badgeTone(val: string): string {
  return val.includes("Built in") ? "green" : val.includes("Partially") ? "blue" : "amber";
}
