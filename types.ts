export interface EvaluationResult {
  candidateInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  atsScore: number;
  skills: {
    technical: string[];
    soft: string[];
  };
  experience: {
    role: string;
    company: string;
    duration: string;
    description: string;
  }[];
  jobMatch: {
    score: number;
    alignedSkills: string[];
    missingSkills: string[];
    recommendations: string[];
  };
  resumeImprovements: string[];
}

export interface ScorecardData {
  id: string;
  candidateName: string;
  email: string;
  score: number;
  evaluation: EvaluationResult;
  timestamp: string;
}

export interface JDAnalysis {
  title: string;
  requiredSkills: string[];
  experienceLevel: string;
  keywords: string[];
  qualityScore: number;
  marketInsights: {
    skillDemand: string;
    salaryTrend: string;
    hiringCompetitiveness: string;
  };
}

export interface JDData {
  id: string;
  user_id?: string;
  title: string;
  content: string;
  analysis_json: JDAnalysis;
  created_at: string;
}

export interface CandidateMatch {
  name: string;
  score: number;
  skillsMatch: string[];
  experienceRaw: string;
}
