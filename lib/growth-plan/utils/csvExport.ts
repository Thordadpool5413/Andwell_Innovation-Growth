interface CMSDataEntry {
  ffs: number;
  hh: { prov: number; users: number; rate: number; pay: number; ppu: number };
  hos: { prov: number; users: number; ppu: number };
}

interface CompetitiveProvider {
  service: string;
  providerName: string;
  locationCounty: string;
  beneficiaries: number;
  episodes: number;
  payment: number;
  providerVolumeShare: number;
  isAndwellCmsRecord: boolean;
}

interface ExportRow {
  county: string;
  service: string;
  launchGroup: string;
  starts: number[];
  referrals: number[];
  revenue: number[];
  demandPool: number;
  reimbursement: number;
  basis: string;
  meta: { margin: number };
}

function escape(val: unknown): string {
  const str = String(val ?? "");
  return str.includes(",") || str.includes('"') || str.includes("\n")
    ? `"${str.replace(/"/g, '""')}"`
    : str;
}

export function exportCSV(headers: string[], rows: unknown[][], filename: string): void {
  const csv = [
    headers.map(escape).join(","),
    ...rows.map((row: unknown[]) => row.map(escape).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportReferralCSV(rows: ExportRow[]): void {
  const headers = [
    "County", "Service", "Priority",
    "Y1 Starts", "Y1 Referrals", "Y1 Revenue",
    "Y2 Starts", "Y2 Referrals", "Y2 Revenue",
    "Y3 Starts", "Y3 Referrals", "Y3 Revenue",
    "Demand Pool", "Reimbursement", "Basis",
  ];
  const data = rows.map((r: ExportRow) => [
    r.county, r.service, r.launchGroup,
    r.starts[0], r.referrals[0], r.revenue[0],
    r.starts[1], r.referrals[1], r.revenue[1],
    r.starts[2], r.referrals[2], r.revenue[2],
    r.demandPool, r.reimbursement, r.basis,
  ]);
  exportCSV(headers, data, "Andwell-Referral-Plan");
}

export function exportFinancialCSV(rows: ExportRow[]): void {
  const yearData = [0, 1, 2].map((i: number) => ({
    year: `Year ${i + 1}`,
    starts: rows.reduce((s: number, r: ExportRow) => s + r.starts[i], 0),
    referrals: rows.reduce((s: number, r: ExportRow) => s + r.referrals[i], 0),
    revenue: rows.reduce((s: number, r: ExportRow) => s + r.revenue[i], 0),
    contribution: rows.reduce((s: number, r: ExportRow) => s + Math.round(r.revenue[i] * r.meta.margin), 0),
  }));
  const headers = ["Year", "Starts", "Referrals", "Revenue", "Contribution"];
  const data = yearData.map((y: { year: string; starts: number; referrals: number; revenue: number; contribution: number }) => [y.year, y.starts, y.referrals, y.revenue, y.contribution]);
  exportCSV(headers, data, "Andwell-Financial-Model");
}

export function exportCmsCSV(cmsData: Record<string, CMSDataEntry>): void {
  const headers = [
    "County", "FFS Beneficiaries",
    "HH Providers", "HH Users", "HH Rate", "HH Payment", "HH PPU",
    "Hospice Providers", "Hospice Users", "Hospice PPU",
  ];
  const data = Object.entries(cmsData).map(([county, m]: [string, CMSDataEntry]) => [
    county, m.ffs,
    m.hh.prov, m.hh.users, m.hh.rate, m.hh.pay, m.hh.ppu,
    m.hos.prov, m.hos.users, m.hos.ppu,
  ]);
  exportCSV(headers, data, "Andwell-CMS-Data");
}

export function exportCompetitiveCSV(providers: CompetitiveProvider[]): void {
  const headers = [
    "Service", "Provider Name", "Location County",
    "Beneficiaries", "Episodes", "Payment",
    "Provider Volume Share", "Is Andwell",
  ];
  const data = providers.map((p: CompetitiveProvider) => [
    p.service, p.providerName, p.locationCounty,
    p.beneficiaries, p.episodes, p.payment,
    (p.providerVolumeShare * 100).toFixed(1) + "%",
    p.isAndwellCmsRecord ? "Yes" : "No",
  ]);
  exportCSV(headers, data, "Andwell-Competitive-Data");
}
