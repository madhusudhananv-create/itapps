import type { ActivityWithProjectInfo } from '../../features/activities/types/activityTypes';
import type {
  SummaryStatistics,
  CorrelationData,
  AIToolMetrics,
  SDLCPhaseAITools,
  QualitativeBenefitAnalysis,
  CorrelationInsights,
} from '../types/dashboardTypes';

const getCorrelationDescription = (correlation: number): string => {
  let description =
    correlation > 0.4 ? 'Moderate correlation' : 'Weak correlation';
  description = correlation > 0.7 ? 'Strong correlation' : description;

  return description;
};

const getBiasCorrelationDescription = (correlation: number): string => {
  let strength =
    correlation > 0.4 ? 'Moderate positive correlation' : 'Weak correlation';
  strength = correlation > 0.7 ? 'Strong positive correlation' : strength;
  return strength;
};

/**
 * Calculate summary statistics from activities data
 */
export const calculateSummaryStatistics = (
  activities: ActivityWithProjectInfo[]
): SummaryStatistics => {
  const totalActivities = activities.length;

  const totalHoursSaved = activities.reduce((sum, activity) => {
    return sum + (activity.hoursSaved || 0);
  }, 0);

  const revenueGenerated = activities.reduce((sum, activity) => {
    return sum + (activity.revenueGenerated === 'Yes' ? 1 : 0);
  }, 0);

  const highAdoption = activities.reduce((sum, activity) => {
    const score = parseFloat(activity.aiAdoptionScore);
    return sum + (score >= 4 ? 1 : 0);
  }, 0);

  // Calculate overall AI adoption score
  const validAdoptionScores = activities
    .map((activity) => {
      const score = activity.aiAdoptionScore;
      if (score === '') return null;
      const numScore = parseFloat(score);
      return isNaN(numScore) ? null : numScore;
    })
    .filter((score): score is number => score !== null);

  const overallAIAdoptionScore =
    validAdoptionScores.length > 0
      ? Math.round(
          (validAdoptionScores.reduce((sum, score) => sum + score, 0) /
            validAdoptionScores.length) *
            100
        ) / 100
      : 0;

  // Calculate overall work done by AI
  const validWorkDone = activities
    .map((activity) => activity.workDoneByAI)
    .filter((work) => work > 0);

  const overallWorkDoneByAI =
    validWorkDone.length > 0
      ? Math.round(
          (validWorkDone.reduce((sum, work) => sum + work, 0) /
            validWorkDone.length) *
            100
        ) / 100
      : 0;

  return {
    totalActivities,
    totalHoursSaved,
    revenueGenerated,
    highAdoption,
    overallAIAdoptionScore,
    overallWorkDoneByAI,
  };
};

/**
 * Calculate AI tool metrics
 */
export const calculateAIToolMetrics = (
  activities: ActivityWithProjectInfo[]
): AIToolMetrics[] => {
  const toolMetrics: Record<string, AIToolMetrics> = {};

  activities.forEach((activity) => {
    const tools = Array.isArray(activity.aiToolUsed)
      ? activity.aiToolUsed
      : [activity.aiToolUsed];

    tools.forEach((tool) => {
      if (!toolMetrics[tool]) {
        toolMetrics[tool] = {
          toolName: tool,
          activitiesCount: 0,
          hoursSaved: 0,
          revenueActivities: 0,
          averageWorkDone: 0,
        };
      }

      toolMetrics[tool].activitiesCount += 1;
      toolMetrics[tool].hoursSaved += activity.hoursSaved || 0;
      if (activity.revenueGenerated === 'Yes') {
        toolMetrics[tool].revenueActivities += 1;
      }
    });
  });

  // Calculate average work done for each tool
  Object.values(toolMetrics).forEach((tool) => {
    const toolActivities = activities.filter((activity) => {
      const tools = Array.isArray(activity.aiToolUsed)
        ? activity.aiToolUsed
        : [activity.aiToolUsed];
      return tools.includes(tool.toolName);
    });

    const workDoneValues = toolActivities
      .map((a) => a.workDoneByAI)
      .filter((w) => w > 0);
    tool.averageWorkDone =
      workDoneValues.length > 0
        ? Math.round(
            (workDoneValues.reduce((sum, w) => sum + w, 0) /
              workDoneValues.length) *
              100
          ) / 100
        : 0;
  });

  return Object.values(toolMetrics).sort((a, b) => b.hoursSaved - a.hoursSaved);
};

/**
 * Get AI tools by SDLC phase
 */
export const getAIToolsBySDLCPhase = (
  activities: ActivityWithProjectInfo[]
): SDLCPhaseAITools[] => {
  const phaseTools: Record<string, Set<string>> = {};

  activities.forEach((activity) => {
    const phase = activity.sdlcPhase;
    const tools = Array.isArray(activity.aiToolUsed)
      ? activity.aiToolUsed
      : [activity.aiToolUsed];

    if (!phaseTools[phase]) {
      phaseTools[phase] = new Set();
    }

    tools.forEach((tool) => {
      phaseTools[phase].add(tool);
    });
  });

  return Object.entries(phaseTools).map(([phase, tools]) => ({
    phase,
    tools: Array.from(tools),
  }));
};

/**
 * Analyze qualitative benefits
 */
export const analyzeQualitativeBenefits = (
  activities: ActivityWithProjectInfo[]
): QualitativeBenefitAnalysis[] => {
  const benefitAnalysis: Record<string, QualitativeBenefitAnalysis> = {};

  activities.forEach((activity) => {
    const benefits = activity.qualitativeBenefits || [];
    const tools = Array.isArray(activity.aiToolUsed)
      ? activity.aiToolUsed
      : [activity.aiToolUsed];

    benefits.forEach((benefit) => {
      if (!benefitAnalysis[benefit]) {
        benefitAnalysis[benefit] = {
          benefit,
          frequency: 0,
          totalHoursSaved: 0,
          mostFrequentTool: '',
          associatedTools: [],
        };
      }

      benefitAnalysis[benefit].frequency += 1;
      benefitAnalysis[benefit].totalHoursSaved += activity.hoursSaved || 0;

      tools.forEach((tool) => {
        if (!benefitAnalysis[benefit].associatedTools.includes(tool)) {
          benefitAnalysis[benefit].associatedTools.push(tool);
        }
      });
    });
  });

  // Calculate most frequent tool for each benefit
  Object.values(benefitAnalysis).forEach((analysis) => {
    const toolFrequency: Record<string, number> = {};

    activities.forEach((activity) => {
      const benefits = activity.qualitativeBenefits || [];
      const tools = Array.isArray(activity.aiToolUsed)
        ? activity.aiToolUsed
        : [activity.aiToolUsed];

      if (benefits.includes(analysis.benefit)) {
        tools.forEach((tool) => {
          toolFrequency[tool] = (toolFrequency[tool] || 0) + 1;
        });
      }
    });

    const mostFrequentTool = Object.entries(toolFrequency).sort(
      ([, a], [, b]) => b - a
    )[0];

    let mostFrequentToolStr = '';
    if (mostFrequentTool) {
      mostFrequentToolStr = `${mostFrequentTool[0]} (${mostFrequentTool[1]} time${mostFrequentTool[1] > 1 ? 's' : ''})`;
    }
    analysis.mostFrequentTool = mostFrequentToolStr;
  });

  return Object.values(benefitAnalysis).sort(
    (a, b) => b.frequency - a.frequency
  );
};

/**
 * Calculate correlation insights
 */
export const calculateCorrelationInsights = (
  activities: ActivityWithProjectInfo[]
): CorrelationInsights => {
  const toolMetrics = calculateAIToolMetrics(activities);
  const benefitAnalysis = analyzeQualitativeBenefits(activities);

  // Hours saved leaders (top 3)
  const hoursSavedLeaders = toolMetrics.slice(0, 3);

  // Revenue generation leaders (top 3)
  const revenueGenerationLeaders = toolMetrics
    .filter((tool) => tool.revenueActivities > 0)
    .sort((a, b) => b.revenueActivities - a.revenueActivities)
    .slice(0, 3);

  // Most beneficial to both (high hours saved and revenue)
  const mostBeneficialToBoth = toolMetrics
    .filter((tool) => tool.hoursSaved > 0 && tool.revenueActivities > 0)
    .sort(
      (a, b) =>
        b.hoursSaved +
        b.revenueActivities * 100 -
        (a.hoursSaved + a.revenueActivities * 100)
    )
    .slice(0, 3);

  // Most impactful benefits (top 3)
  const mostImpactfulBenefits = benefitAnalysis.slice(0, 3);

  return {
    hoursSavedLeaders,
    revenueGenerationLeaders,
    mostBeneficialToBoth,
    mostImpactfulBenefits,
  };
};

/**
 * Calculate correlation between AI Tool Used and SDLC Phase
 */
export const calculateAIToolSDLCPhaseCorrelation = (
  activities: ActivityWithProjectInfo[]
): CorrelationData => {
  if (activities.length === 0) {
    return {
      label: 'AI Tool Used vs. SDLC Phase',
      correlation: 0,
      description: 'No data available',
    };
  }

  // Create frequency matrix
  const toolPhaseMatrix: Record<string, Record<string, number>> = {};

  activities.forEach((activity) => {
    const tools = Array.isArray(activity.aiToolUsed)
      ? activity.aiToolUsed
      : [activity.aiToolUsed];
    const phase = activity.sdlcPhase;

    tools.forEach((tool) => {
      if (!toolPhaseMatrix[tool]) {
        toolPhaseMatrix[tool] = {};
      }
      toolPhaseMatrix[tool][phase] = (toolPhaseMatrix[tool][phase] || 0) + 1;
    });
  });

  // Calculate correlation using chi-square test approximation
  const correlation = calculateChiSquareCorrelation(toolPhaseMatrix);

  return {
    label: 'AI Tool Used vs. SDLC Phase',
    correlation: Math.round(correlation * 100) / 100,
    description: getCorrelationDescription(correlation),
  };
};

/**
 * Calculate correlation between Qualitative Benefit and Practice
 */
export const calculateQualitativeBenefitPracticeCorrelation = (
  activities: ActivityWithProjectInfo[]
): CorrelationData => {
  if (activities.length === 0) {
    return {
      label: 'Qualitative Benefit vs. Practice',
      correlation: 0,
      description: 'No data available',
    };
  }

  // Create frequency matrix
  const benefitPracticeMatrix: Record<string, Record<string, number>> = {};

  activities.forEach((activity) => {
    const benefits = activity.qualitativeBenefits || [];
    const practice = activity.practice;

    benefits.forEach((benefit) => {
      if (!benefitPracticeMatrix[benefit]) {
        benefitPracticeMatrix[benefit] = {};
      }
      benefitPracticeMatrix[benefit][practice] =
        (benefitPracticeMatrix[benefit][practice] || 0) + 1;
    });
  });

  const correlation = calculateChiSquareCorrelation(benefitPracticeMatrix);

  return {
    label: 'Qualitative Benefit vs. Practice',
    correlation: Math.round(correlation * 100) / 100,
    description: getCorrelationDescription(correlation),
  };
};

/**
 * Calculate correlation between % Work Done by AI and Hours Saved
 */
export const calculateWorkDoneHoursSavedCorrelation = (
  activities: ActivityWithProjectInfo[]
): CorrelationData => {
  if (activities.length === 0) {
    return {
      label: '% Work Done by AI vs. Hours Saved',
      correlation: 0,
      description: 'No data available',
    };
  }

  const validActivities = activities.filter(
    (activity) => activity.workDoneByAI > 0 && activity.hoursSaved > 0
  );

  if (validActivities.length === 0) {
    return {
      label: '% Work Done by AI vs. Hours Saved',
      correlation: 0,
      description: 'No valid data available',
    };
  }

  const correlation = calculatePearsonCorrelation(
    validActivities.map((a) => a.workDoneByAI),
    validActivities.map((a) => a.hoursSaved)
  );

  return {
    label: '% Work Done by AI vs. Hours Saved',
    correlation: Math.round(correlation * 100) / 100,
    description: getBiasCorrelationDescription(correlation),
  };
};

/**
 * Calculate correlation between Revenue Generated and AI Adoption Score
 */
export const calculateRevenueAdoptionCorrelation = (
  activities: ActivityWithProjectInfo[]
): CorrelationData => {
  if (activities.length === 0) {
    return {
      label: 'Revenue Generated vs. AI Adoption Score',
      correlation: 0,
      description: 'No data available',
    };
  }

  const validActivities = activities.filter(
    (activity) => activity.aiAdoptionScore !== ''
  );

  if (validActivities.length === 0) {
    return {
      label: 'Revenue Generated vs. AI Adoption Score',
      correlation: 0,
      description: 'No valid data available',
    };
  }

  const adoptionScores = validActivities.map((a) =>
    parseFloat(a.aiAdoptionScore)
  );
  const revenueValues = validActivities.map((a) =>
    a.revenueGenerated === 'Yes' ? 1 : 0
  );

  const correlation = calculatePearsonCorrelation(
    adoptionScores,
    revenueValues
  );

  return {
    label: 'Revenue Generated vs. AI Adoption Score',
    correlation: Math.round(correlation * 100) / 100,
    description: getBiasCorrelationDescription(correlation),
  };
};

/**
 * Calculate Pearson correlation coefficient
 */
const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
  const n = x.length;
  if (n !== y.length || n === 0) return 0;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );

  return denominator === 0 ? 0 : numerator / denominator;
};

/**
 * Calculate chi-square based correlation approximation
 */
const calculateChiSquareCorrelation = (
  matrix: Record<string, Record<string, number>>
): number => {
  const rows = Object.keys(matrix);
  const cols = new Set<string>();

  // Get all unique columns
  rows.forEach((row) => {
    Object.keys(matrix[row]).forEach((col) => cols.add(col));
  });

  const columnArray = Array.from(cols);

  if (rows.length === 0 || columnArray.length === 0) return 0;

  // Calculate expected frequencies and chi-square
  let chiSquare = 0;
  let totalObserved = 0;

  rows.forEach((row) => {
    columnArray.forEach((col) => {
      const observed = matrix[row][col] || 0;
      totalObserved += observed;
    });
  });

  rows.forEach((row) => {
    const rowTotal = columnArray.reduce(
      (sum, col) => sum + (matrix[row][col] || 0),
      0
    );
    columnArray.forEach((col) => {
      const colTotal = rows.reduce((sum, r) => sum + (matrix[r][col] || 0), 0);
      const expected = (rowTotal * colTotal) / totalObserved;
      const observed = matrix[row][col] || 0;

      if (expected > 0) {
        chiSquare += Math.pow(observed - expected, 2) / expected;
      }
    });
  });

  // Convert chi-square to correlation-like measure (0-1)
  const maxChiSquare =
    totalObserved * (Math.min(rows.length, columnArray.length) - 1);
  return maxChiSquare > 0 ? Math.min(1, chiSquare / maxChiSquare) : 0;
};
