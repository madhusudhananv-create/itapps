export interface SummaryStatistics {
  totalActivities: number;
  totalHoursSaved: number;
  revenueGenerated: number;
  highAdoption: number;
  overallAIAdoptionScore: number;
  overallWorkDoneByAI: number;
}

export interface CorrelationData {
  label: string;
  correlation: number;
  description: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface AIToolMetrics {
  toolName: string;
  activitiesCount: number;
  hoursSaved: number;
  revenueActivities: number;
  averageWorkDone: number;
}

export interface SDLCPhaseAITools {
  phase: string;
  tools: string[];
}

export interface QualitativeBenefitAnalysis {
  benefit: string;
  frequency: number;
  totalHoursSaved: number;
  mostFrequentTool: string;
  associatedTools: string[];
}

export interface CorrelationInsights {
  hoursSavedLeaders: AIToolMetrics[];
  revenueGenerationLeaders: AIToolMetrics[];
  mostBeneficialToBoth: AIToolMetrics[];
  mostImpactfulBenefits: QualitativeBenefitAnalysis[];
}
