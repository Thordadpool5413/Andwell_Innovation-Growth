import { COLORS } from "./constants";

export type ServiceName = "Home Healthcare" | "Mobile Wound" | "Therapy Care" | "GUIDE" | "Hospice";

export interface ServiceInfo {
  color: string;
  role: string;
  unit: string;
  reimbursement: number;
  margin: number;
  conversion: number;
  demandRate: number;
}

export const services: Record<string, ServiceInfo> = {
  "Home Healthcare": { color: COLORS.blue, role: "Foundation service line", unit: "admissions", reimbursement: 3189, margin: 0.18, conversion: 0.75, demandRate: 0.08 },
  "Mobile Wound": { color: COLORS.red, role: "Specialty growth line", unit: "wound service starts", reimbursement: 1800, margin: 0.24, conversion: 0.75, demandRate: 0.025 },
  "Therapy Care": { color: COLORS.green, role: "Referral retention line", unit: "therapy service starts", reimbursement: 1650, margin: 0.2, conversion: 0.75, demandRate: 0.05 },
  GUIDE: { color: COLORS.purple, role: "Validation only line", unit: "validated dementia care enrollments", reimbursement: 0, margin: 0, conversion: 0.75, demandRate: 0 },
  Hospice: { color: "#9333ea", role: "Future expansion line", unit: "hospice admissions", reimbursement: 0, margin: 0, conversion: 0.75, demandRate: 0 },
};

export const SERVICE_COLORS: Record<string, string> = {
  "Home Healthcare": COLORS.blue,
  "Mobile Wound": COLORS.red,
  "Therapy Care": COLORS.green,
  GUIDE: COLORS.purple,
  Hospice: "#9333ea",
};

export default services;
