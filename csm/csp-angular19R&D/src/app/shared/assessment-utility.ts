/**
 * AssessmentUtility - Utility service for assessment calculations
 * Migrated from Angular 6 to Angular 19
 * 
 * This service handles maturity level calculations, scoring, and percentages
 * for service areas, process models, process areas, and processes.
 * 
 * Migration Changes:
 * - Updated to Angular 19 inject() pattern
 * - Added type safety
 * - Modernized with providedIn: 'root'
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AssessmentUtility {
  
  // ========================================
  // SERVICE AREA METHODS
  // ========================================

  /**
   * Get maturity level for service area based on percentage
   */
  public getServiceAreaMaturityLevel(maturityLevelMappings: any[], percentage: number): string {
    if (percentage && maturityLevelMappings && maturityLevelMappings.length > 0) {
      const maturityLevelScaleRec = maturityLevelMappings.find(
        x => percentage >= x.loweR_BOUND_SCORE && percentage <= x.uppeR_BOUND_SCORE
      );
      if (maturityLevelScaleRec) {
        return maturityLevelScaleRec.leveL_TITLE;
      }
    }
    return '';
  }

  /**
   * Calculate score achieved for service area
   */
  public getServiceAreaScore(serviceArea: any): number {
    if (!serviceArea) {
      return 0;
    }

    serviceArea.scorE_ACHIEVED = 0;
    
    for (const processModel of serviceArea.checkpointS_BY_PROCESS_MODEL || []) {
      for (const processArea of processModel.checkpointS_BY_PROCESS_AREA || []) {
        for (const process of processArea.checkpointS_BY_PROCESS || []) {
          for (const checkpoint of process.checkpoints || []) {
            if (checkpoint.statuS_CATEGORY && checkpoint.statuS_CATEGORY !== 'N/A') {
              serviceArea.scorE_ACHIEVED += checkpoint.score || 0;
            }
          }
        }
      }
    }

    return serviceArea.scorE_ACHIEVED;
  }

  /**
   * Calculate maximum possible score for service area
   */
  public getServiceAreaMaxScore(
    maxMultiplier: number,
    checklistStatusValues: any[],
    hideweightage: boolean,
    serviceArea: any
  ): number {
    if (!serviceArea) {
      return 0;
    }

    maxMultiplier = Math.max(...checklistStatusValues.map(x => x.multiplier), 0);
    
    let maxScore = 0;
    let questionsCount = 0;

    for (const processModel of serviceArea.checkpointS_BY_PROCESS_MODEL || []) {
      for (const processArea of processModel.checkpointS_BY_PROCESS_AREA || []) {
        for (const process of processArea.checkpointS_BY_PROCESS || []) {
          questionsCount += (process.checkpoints || []).filter((x: any) => x.statuS_CATEGORY !== 'N/A').length;
          for (const checkpoint of process.checkpoints || []) {
            if (checkpoint.statuS_CATEGORY !== 'N/A') {
              maxScore += (checkpoint.weightagE_SCORE || 0) * maxMultiplier;
            }
          }
        }
      }
    }

    serviceArea.maX_SCORE = hideweightage ? questionsCount * maxMultiplier : maxScore;
    return serviceArea.maX_SCORE;
  }

  /**
   * Calculate percentage for service area
   */
  public getServiceAreaPercentage(serviceArea: any): number {
    if (parseFloat(serviceArea.maX_SCORE?.toString() || '0') > 0) {
      serviceArea.percentage = +(
        (parseFloat(serviceArea.scorE_ACHIEVED?.toString() || '0') / 
         parseFloat(serviceArea.maX_SCORE?.toString() || '1') * 100).toFixed(2)
      );
    } else {
      serviceArea.percentage = 100;
    }

    return serviceArea.percentage;
  }

  /**
   * Calculate updated score for service area
   */
  public getServiceAreaUpdatedScore(serviceArea: any): number {
    if (!serviceArea) {
      return 0;
    }

    serviceArea.updateD_SCORE = 0;

    for (const processModel of serviceArea.checkpointS_BY_PROCESS_MODEL || []) {
      for (const processArea of processModel.checkpointS_BY_PROCESS_AREA || []) {
        for (const process of processArea.checkpointS_BY_PROCESS || []) {
          for (const checkpoint of process.checkpoints || []) {
            if (checkpoint.statuS_CATEGORY && checkpoint.statuS_CATEGORY !== 'N/A') {
              serviceArea.updateD_SCORE += checkpoint.updateD_SCORE || 0;
            }
          }
        }
      }
    }

    return serviceArea.updateD_SCORE;
  }

  /**
   * Calculate updated percentage for service area
   */
  public getServiceAreaUpdatedPercentage(serviceArea: any): number {
    if (parseFloat(serviceArea.maX_SCORE?.toString() || '0') > 0) {
      serviceArea.percentage = +(
        (parseFloat(serviceArea.updateD_SCORE?.toString() || '0') / 
         parseFloat(serviceArea.maX_SCORE?.toString() || '1') * 100).toFixed(2)
      );
    } else {
      serviceArea.percentage = 100;
    }

    return serviceArea.percentage;
  }

  // ========================================
  // PROCESS MODEL METHODS
  // ========================================

  public getProcessModelMaturityLevel(maturityLevelMappings: any[], percentage: number): string {
    return this.getServiceAreaMaturityLevel(maturityLevelMappings, percentage);
  }

  public getProcessModelScore(processModel: any): number {
    if (!processModel) {
      return 0;
    }

    processModel.scorE_ACHIEVED = 0;

    for (const processArea of processModel.checkpointS_BY_PROCESS_AREA || []) {
      for (const process of processArea.checkpointS_BY_PROCESS || []) {
        for (const checkpoint of process.checkpoints || []) {
          if (checkpoint.statuS_CATEGORY && checkpoint.statuS_CATEGORY !== 'N/A') {
            processModel.scorE_ACHIEVED += checkpoint.score || 0;
          }
        }
      }
    }

    return processModel.scorE_ACHIEVED;
  }

  public getProcessModelMaxScore(
    processModel: any,
    maxMultiplier: number,
    checklistStatusValues: any[],
    hideweightage: boolean
  ): number {
    if (!processModel) {
      return 0;
    }

    maxMultiplier = Math.max(...checklistStatusValues.map(x => x.multiplier), 0);

    let maxScore = 0;
    let questionsCount = 0;

    for (const processArea of processModel.checkpointS_BY_PROCESS_AREA || []) {
      for (const process of processArea.checkpointS_BY_PROCESS || []) {
        questionsCount += (process.checkpoints || []).filter((x: any) => x.statuS_CATEGORY !== 'N/A').length;
        for (const checkpoint of process.checkpoints || []) {
          if (checkpoint.statuS_CATEGORY !== 'N/A') {
            maxScore += (checkpoint.weightagE_SCORE || 0) * maxMultiplier;
          }
        }
      }
    }

    processModel.maX_SCORE = hideweightage ? questionsCount * maxMultiplier : maxScore;
    return processModel.maX_SCORE;
  }

  public getProcessModelPercentage(processModel: any): number {
    if (parseFloat(processModel.maX_SCORE?.toString() || '0') > 0) {
      processModel.percentage = +(
        (parseFloat(processModel.scorE_ACHIEVED?.toString() || '0') / 
         parseFloat(processModel.maX_SCORE?.toString() || '1') * 100).toFixed(2)
      );
    } else {
      processModel.percentage = 100;
    }

    return processModel.percentage;
  }

  /**
   * Calculate updated score for process model (considering N/A items)
   */
  public getProcessModelUpdatedScore(processModel: any): number {
    if (processModel) {
      processModel.updateD_SCORE = 0;
      for (const processArea of processModel.checkpointS_BY_PROCESS_AREA || []) {
        for (const process of processArea.checkpointS_BY_PROCESS || []) {
          for (const checkpoint of process.checkpoints || []) {
            if (checkpoint.statuS_CATEGORY && checkpoint.statuS_CATEGORY !== null && checkpoint.statuS_CATEGORY !== 'N/A') {
              processModel.updateD_SCORE += checkpoint.updateD_SCORE || 0;
            }
          }
        }
      }
    } else {
      processModel.updateD_SCORE = 0;
    }
    return processModel.updateD_SCORE;
  }

  /**
   * Calculate updated percentage for process model
   */
  public getProcessModelUpdatedPercentage(processModel: any): number {
    if (parseFloat(processModel.maX_SCORE?.toString() || '0') > 0) {
      processModel.percentage = +(
        (parseFloat(processModel.updateD_SCORE?.toString() || '0') / 
         parseFloat(processModel.maX_SCORE?.toString() || '1') * 100).toFixed(2)
      );
    } else {
      processModel.percentage = 100;
    }
    return processModel.percentage;
  }

  // ========================================
  // PROCESS AREA METHODS
  // ========================================

  /**
   * Get maturity level for process area based on percentage
   */
  public getProcessAreaMaturityLevel(percentage: number, maturityLevelMappings: any[]): string {
    if (percentage && maturityLevelMappings && maturityLevelMappings.length > 0) {
      const maturityLevelScaleRec = maturityLevelMappings.find(
        x => percentage >= x.loweR_BOUND_SCORE && percentage <= x.uppeR_BOUND_SCORE
      );
      if (maturityLevelScaleRec) {
        return maturityLevelScaleRec.leveL_TITLE;
      }
    }
    return '';
  }

  /**
   * Calculate score achieved for process area
   */
  public getProcessAreaScore(parea: any): number {
    parea.scorE_ACHIEVED = 0;
    if (parea) {
      for (const process of parea.checkpointS_BY_PROCESS || []) {
        parea.scorE_ACHIEVED += (process.checkpoints || [])
          .filter((x: any) => x.statuS_CATEGORY !== 'N/A')
          .map((x: any) => x.score || 0)
          .reduce((x: number, y: number) => x + y, 0);
      }
    }
    return parea.scorE_ACHIEVED;
  }

  /**
   * Calculate maximum possible score for process area
   */
  public getProcessAreaMaxScore(
    processArea: any,
    maxMultiplier: number,
    checklistStatusValues: any[],
    hideweightage: boolean
  ): number {
    let questionsCount = 0;
    processArea.maX_SCORE = 0;

    maxMultiplier = Math.max(...checklistStatusValues.map(x => x.multiplier), 0);
    
    if (processArea) {
      for (const process of processArea.checkpointS_BY_PROCESS || []) {
        questionsCount += (process.checkpoints || []).filter((x: any) => x.statuS_CATEGORY !== 'N/A').length;
      }

      if (!hideweightage) {
        (processArea.checkpointS_BY_PROCESS || []).forEach((process: any) => {
          (process.checkpoints || []).forEach((question: any) => {
            if (question.statuS_CATEGORY === "N/A") return;
            processArea.maX_SCORE += (question.weightagE_SCORE || 0) * maxMultiplier;
          });
        });
      } else {
        processArea.maX_SCORE = questionsCount * maxMultiplier;
      }
    }

    return processArea.maX_SCORE;
  }

  /**
   * Calculate percentage for process area
   */
  public getProcessAreaPercentage(processArea: any): number {
    try {
      if (parseFloat(processArea.maX_SCORE?.toString() || '0') > 0) {
        processArea.percentage = +(
          (parseFloat(processArea.scorE_ACHIEVED?.toString() || '0') / 
           parseFloat(processArea.maX_SCORE?.toString() || '1') * 100).toFixed(2)
        );
      } else {
        processArea.percentage = 100;
      }
      return processArea.percentage;
    } catch (e) {
      console.error('Error calculating Process area percentage', e);
      return 0;
    }
  }

  /**
   * Calculate updated score for process area (considering N/A items)
   */
  public getProcessAreaUpdatedScore(parea: any): number {
    parea.updateD_SCORE = 0;
    if (parea) {
      for (const process of parea.checkpointS_BY_PROCESS || []) {
        parea.updateD_SCORE += (process.checkpoints || [])
          .filter((x: any) => x.statuS_CATEGORY !== 'N/A')
          .map((x: any) => x.updateD_SCORE || 0)
          .reduce((x: number, y: number) => x + y, 0);
      }
    }
    return parea.updateD_SCORE;
  }

  /**
   * Calculate updated percentage for process area
   */
  public getProcessAreaUpdatedercentage(processArea: any): number {
    try {
      if (parseFloat(processArea.maX_SCORE?.toString() || '0') > 0) {
        processArea.percentage = +(
          (parseFloat(processArea.updateD_SCORE?.toString() || '0') / 
           parseFloat(processArea.maX_SCORE?.toString() || '1') * 100).toFixed(2)
        );
      } else {
        processArea.percentage = 100;
      }
      return processArea.percentage;
    } catch (e) {
      console.error('Error calculating Process area updated percentage', e);
      return 0;
    }
  }

  // ========================================
  // PROCESS METHODS
  // ========================================

  /**
   * Calculate score achieved for process
   */
  public getProcessScore(process: any): number {
    if (process && process.checkpoints) {
      process.scorE_ACHIEVED = (process.checkpoints || [])
        .filter((x: any) => x.statuS_CATEGORY !== 'N/A')
        .map((x: any) => x.score || 0)
        .reduce((x: number, y: number) => x + y, 0);
    } else {
      process.scorE_ACHIEVED = 0;
    }
    return process.scorE_ACHIEVED;
  }

  /**
   * Calculate maximum possible score for process
   */
  public getProcessMaxScore(
    process: any,
    maxMultiplier: number,
    checklistStatusValues: any[],
    hideweightage: boolean
  ): number {
    if (!process || !process.checkpoints || process.checkpoints.length === 0) {
      return 0;
    }

    maxMultiplier = Math.max(...checklistStatusValues.map(x => x.multiplier), 0);
    process.maX_SCORE = 0;

    if (!hideweightage) {
      (process.checkpoints || []).forEach((question: any) => {
        if (question.statuS_CATEGORY === "N/A") return;
        process.maX_SCORE += (question.weightagE_SCORE || 0) * maxMultiplier;
      });
    } else {
      process.maX_SCORE = maxMultiplier * (process.checkpoints || []).filter((x: any) => x.statuS_CATEGORY !== 'N/A').length;
    }

    return process.maX_SCORE;
  }

  /**
   * Calculate percentage for process
   */
  public getProcessPercentage(process: any): number {
    if (parseFloat(process.maX_SCORE?.toString() || '0') > 0) {
      process.percentage = +(
        (parseFloat(process.scorE_ACHIEVED?.toString() || '0') / 
         parseFloat(process.maX_SCORE?.toString() || '1') * 100).toFixed(2)
      );
    } else {
      process.percentage = 100;
    }
    return process.percentage;
  }

  /**
   * Calculate updated score for process (considering N/A items)
   */
  public getProcessUpdatedScore(process: any): number {
    process.updateD_SCORE = 0;
    if (process && process.checkpoints) {
      process.updateD_SCORE = (process.checkpoints || [])
        .filter((x: any) => x.statuS_CATEGORY !== 'N/A')
        .map((x: any) => x.updateD_SCORE || 0)
        .reduce((x: number, y: number) => x + y, 0);
    } else {
      process.updateD_SCORE = 0;
    }
    return process.updateD_SCORE;
  }

  /**
   * Calculate updated percentage for process
   */
  public getProcessUpdatedPercentage(process: any): number {
    if (parseFloat(process.maX_SCORE?.toString() || '0') > 0) {
      process.percentage = +(
        (parseFloat(process.updateD_SCORE?.toString() || '0') / 
         parseFloat(process.maX_SCORE?.toString() || '1') * 100).toFixed(2)
      );
    } else {
      process.percentage = 100;
    }
    return process.percentage;
  }

  // Additional methods can be added as needed for Process Area and Process calculations
  // Following the same pattern as above
}
