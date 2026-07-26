export interface IdealCustomerProfile {
  industries: string[];
  countries: string[];
  jobTitles: string[];
  minimumCompanySize?: number;
  maximumCompanySize?: number;
  minimumBudget?: number;
  idealCustomerDescription: string;
  excludedKeywords: string[];
}

export interface ScoringConfiguration {
  id: string;
  workspaceId: string;
  name: string;
  version: number;
  profile: IdealCustomerProfile;
  updatedAt: string;
}
