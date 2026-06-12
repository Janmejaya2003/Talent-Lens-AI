export interface CandidateInfo {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experienceYears: number;
}

export interface EvaluationResult {
  candidateInfo: CandidateInfo;
  matchScore: number;
  strengths: string[];
  missingSkills: string[];
  summary: string;
  recommendation: 'Strong Fit' | 'Moderate Fit' | 'Low Fit';
  riskAssessment: string;
}

export interface ScorecardData {
  id: string;
  candidateName: string;
  email: string;
  score: number;
  evaluation: EvaluationResult;
  timestamp: string;
}
