import type { IdealCustomerProfile } from "@/types/scoring";

export const defaultProfile: IdealCustomerProfile = {
  industries: ["software", "marketing", "comercio electrónico", "servicios profesionales"],
  countries: ["España", "Portugal"],
  jobTitles: ["CEO", "CTO", "director de marketing", "responsable de ventas"],
  minimumCompanySize: 5,
  maximumCompanySize: 250,
  minimumBudget: 1500,
  idealCustomerDescription:
    "Empresa española en crecimiento que necesita mejorar sus procesos comerciales, automatizar tareas y captar más clientes.",
  excludedKeywords: ["estudiante", "trabajo académico", "sin presupuesto", "solo información"],
};
