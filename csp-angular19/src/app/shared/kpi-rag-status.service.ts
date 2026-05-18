import { Injectable } from '@angular/core';

/**
 * KPI RAG (Red-Amber-Green) Status Service
 * 
 * Centralized service for calculating and managing KPI RAG status based on predefined benchmarks.
 * This service provides consistent color coding across all KPI displays in the application.
 * 
 * RAG Status Levels:
 * - Red (#f60000): Not Met - Performance significantly below target
 * - Amber/Orange (#f9a400): Below Target - Performance below target but not critical
 * - Green (#237f00): Met - Performance meets target
 * - Blue (#00bfff): Exceeded - Performance exceeds target
 */
@Injectable({
  providedIn: 'root'
})
export class KpiRagStatusService {

  /**
   * Predefined color codes for RAG status
   */
  readonly RAG_COLORS = {
    RED: '#f60000',          // Not Met
    AMBER: '#f9a400',        // Below Target
    GREEN: '#237f00',        // Met
    BLUE: '#00bfff',         // Exceeded
    GRAY: '#9e9e9e'          // Not Applicable / No Data
  } as const;

  /**
   * Predefined benchmarks for percentage-based KPIs
   * These can be overridden per KPI if needed
   */
  readonly DEFAULT_BENCHMARKS = {
    EXCEEDED: 95,      // >= 95% = Blue (Exceeded)
    MET: 85,          // >= 85% = Green (Met)
    BELOW: 70,        // >= 70% = Amber (Below)
    NOT_MET: 0        // < 70% = Red (Not Met)
  } as const;

  /**
   * Get RAG color based on percentage score
   * Automatically applies predefined benchmarks
   * 
   * @param score - The actual score/achievement percentage
   * @param customBenchmarks - Optional custom benchmarks (overrides defaults)
   * @returns Color hex code
   */
  getColorByPercentage(score: number, customBenchmarks?: {
    exceeded?: number;
    met?: number;
    below?: number;
  }): string {
    if (score === null || score === undefined || isNaN(score)) {
      return this.RAG_COLORS.GRAY;
    }

    const benchmarks = {
      exceeded: customBenchmarks?.exceeded ?? this.DEFAULT_BENCHMARKS.EXCEEDED,
      met: customBenchmarks?.met ?? this.DEFAULT_BENCHMARKS.MET,
      below: customBenchmarks?.below ?? this.DEFAULT_BENCHMARKS.BELOW
    };

    if (score >= benchmarks.exceeded) {
      return this.RAG_COLORS.BLUE;  // Exceeded
    } else if (score >= benchmarks.met) {
      return this.RAG_COLORS.GREEN;  // Met
    } else if (score >= benchmarks.below) {
      return this.RAG_COLORS.AMBER;  // Below
    } else {
      return this.RAG_COLORS.RED;    // Not Met
    }
  }

  /**
   * Get RAG color by comparing actual vs target
   * Uses target thresholds (Low, Medium, High, Very High)
   * 
   * @param actual - The actual achieved value
   * @param targets - Object containing target thresholds
   * @returns Color hex code
   */
  getColorByTarget(actual: number, targets: {
    low?: number;
    medium?: number;
    high?: number;
    veryHigh?: number;
  }): string {
    if (actual === null || actual === undefined || isNaN(actual)) {
      return this.RAG_COLORS.GRAY;
    }

    // If very high target exists and actual meets it
    if (targets.veryHigh !== undefined && actual >= targets.veryHigh) {
      return this.RAG_COLORS.BLUE;  // Exceeded
    }
    
    // If high target exists and actual meets it
    if (targets.high !== undefined && actual >= targets.high) {
      return this.RAG_COLORS.GREEN;  // Met
    }
    
    // If medium target exists and actual meets it
    if (targets.medium !== undefined && actual >= targets.medium) {
      return this.RAG_COLORS.AMBER;  // Below
    }
    
    // Below all targets or only meets low target
    return this.RAG_COLORS.RED;  // Not Met
  }

  /**
   * Get status label based on color code
   * 
   * @param colorCode - The RAG color hex code
   * @returns Human-readable status label
   */
  getStatusLabel(colorCode: string): string {
    switch (colorCode) {
      case this.RAG_COLORS.BLUE:
        return 'Exceeded';
      case this.RAG_COLORS.GREEN:
        return 'Met';
      case this.RAG_COLORS.AMBER:
        return 'Below Target';
      case this.RAG_COLORS.RED:
        return 'Not Met';
      case this.RAG_COLORS.GRAY:
        return 'N/A';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get Material icon based on color code
   * 
   * @param colorCode - The RAG color hex code
   * @returns Material icon name
   */
  getStatusIcon(colorCode: string): string {
    switch (colorCode) {
      case this.RAG_COLORS.BLUE:
        return 'trending_up';
      case this.RAG_COLORS.GREEN:
        return 'check_circle';
      case this.RAG_COLORS.AMBER:
        return 'warning';
      case this.RAG_COLORS.RED:
        return 'error';
      case this.RAG_COLORS.GRAY:
        return 'remove_circle_outline';
      default:
        return 'help_outline';
    }
  }

  /**
   * Get CSS class name based on color code
   * Used for applying styles in templates
   * 
   * @param colorCode - The RAG color hex code
   * @returns CSS class name
   */
  getStatusClass(colorCode: string): string {
    switch (colorCode) {
      case this.RAG_COLORS.BLUE:
        return 'status-exceeded';
      case this.RAG_COLORS.GREEN:
        return 'status-met';
      case this.RAG_COLORS.AMBER:
        return 'status-below';
      case this.RAG_COLORS.RED:
        return 'status-not-met';
      case this.RAG_COLORS.GRAY:
        return 'status-na';
      default:
        return 'status-unknown';
    }
  }

  /**
   * Check if RAG status requires CAPA (Corrective Action Plan)
   * CAPA is required for Red and Amber statuses
   * 
   * @param colorCode - The RAG color hex code
   * @returns True if CAPA is required
   */
  requiresCAPA(colorCode: string): boolean {
    return colorCode === this.RAG_COLORS.RED || colorCode === this.RAG_COLORS.AMBER;
  }

  /**
   * Get achievement percentage calculation
   * Calculates percentage based on actual vs target
   * 
   * @param actual - Actual achieved value
   * @param target - Target value
   * @returns Achievement percentage
   */
  calculateAchievementPercentage(actual: number, target: number): number {
    if (!target || target === 0) {
      return 0;
    }
    return Math.round((actual / target) * 100);
  }

  /**
   * Get benchmark description for display
   * 
   * @param customBenchmarks - Optional custom benchmarks
   * @returns Object with benchmark descriptions
   */
  getBenchmarkDescription(customBenchmarks?: {
    exceeded?: number;
    met?: number;
    below?: number;
  }): {
    exceeded: string;
    met: string;
    below: string;
    notMet: string;
  } {
    const benchmarks = {
      exceeded: customBenchmarks?.exceeded ?? this.DEFAULT_BENCHMARKS.EXCEEDED,
      met: customBenchmarks?.met ?? this.DEFAULT_BENCHMARKS.MET,
      below: customBenchmarks?.below ?? this.DEFAULT_BENCHMARKS.BELOW
    };

    return {
      exceeded: `≥ ${benchmarks.exceeded}% - Exceeded (Blue)`,
      met: `${benchmarks.met}% - ${benchmarks.exceeded - 1}% - Met (Green)`,
      below: `${benchmarks.below}% - ${benchmarks.met - 1}% - Below Target (Amber)`,
      notMet: `< ${benchmarks.below}% - Not Met (Red)`
    };
  }
}
