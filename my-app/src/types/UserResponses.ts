export type MilitaryBranch = 'Airforce' | 'Army' | 'Marines' | 'Navy' | 'Coast Guard' | 'Space Force';
export type RetirementSystem = 'Final Pay' | 'High-3' | 'BRS';
export type ServiceType = 'Active Duty' | 'Reserves';

export interface UserResponses {
  branch: MilitaryBranch | null;
  entryDate: Date | null;
  rankPayGrade: string | null;
  retirementSystem: RetirementSystem | null;
  serviceType: ServiceType | null;
  yearsOfService: number | null;
  retirementPoints: number | null;
  includeTSP: boolean;
  monthlyTSPContribution: number | null;
  wantLumpSum: boolean;
  lumpSum?: boolean;
  lumpSumPercentage?: 25 | 50;
  lifeExpectancy?: number;
}

export const initialUserResponses: UserResponses = {
  branch: null,
  entryDate: null,
  rankPayGrade: null,
  retirementSystem: null,
  serviceType: null,
  yearsOfService: null,
  retirementPoints: null,
  includeTSP: false,
  monthlyTSPContribution: null,
  wantLumpSum: false,
}; 