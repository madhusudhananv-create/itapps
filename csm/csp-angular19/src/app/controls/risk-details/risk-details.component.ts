import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/**
 * Risk Details Component
 * Migrated from Angular 6 to Angular 19 standalone
 * 
 * Displays detailed risk information in a dialog/popup
 * Shows a table with risk details including:
 * - Customer name
 * - Project name
 * - Identified date
 * - Description
 * - Business impact
 * - Owner
 * - Status
 * 
 * Features:
 * - Click on row to open risk link in new tab
 * - Row highlighting on hover and click
 * - Scrollable table for large datasets
 */
@Component({
  selector: 'app-risk-details',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './risk-details.component.html',
  styleUrl: './risk-details.component.scss'
})
export class RiskDetailsComponent implements OnInit {
  showLegend: boolean = false;
  count: number = 0;
  isSelectedRow: any;
  headerColorClass: string = '';

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<RiskDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.headerColorClass = this.determineHeaderColor();
  }

  /**
   * Handle row click - opens risk link in new tab
   * @param link URL to open
   */
  handleRowClick(link: string) {
    this.isSelectedRow = link;
    window.open(link, '_blank');
  }

  /**
   * Close dialog
   */
  Cancel_onClick() {
    this.dialog.closeAll();
  }

  /**
   * Get initials from owner name for avatar
   * @param name Owner name
   * @returns Initials (first letter of first and last name)
   */
  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  /**
   * Get CSS class for status badge based on status value
   * @param status Risk status
   * @returns CSS class name
   */
  getStatusClass(status: string): string {
    if (!status) return '';
    const statusLower = status.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-');
    return `status-${statusLower}`;
  }

  /**
   * Determine header color based on risk severity from the risk matrix
   * Calculates the highest risk level based on likelihood and consequences scales
   * Matches the risk rating matrix color scheme
   * @returns CSS class name for header color
   */
  determineHeaderColor(): string {
    if (!this.data?.risk || this.data.risk.length === 0) {
      return 'header-default';
    }

    const risks = this.data.risk;
    let highestRiskLevel = 0; // 0=none, 1=low, 2=moderate, 3=high, 4=critical

    // Calculate risk level for each risk based on likelihood and consequence
    risks.forEach((r: any) => {
      const likelihood = r.probabilitY_SCALE || r.neW_LIKELIHOOD_SCALE || 0;
      const consequence = r.impacT_SCALE || r.neW_CONSEQUENCES_SCALE || 0;
      
      const riskLevel = this.getRiskLevel(likelihood, consequence);
      if (riskLevel > highestRiskLevel) {
        highestRiskLevel = riskLevel;
      }
    });

    // Map risk level to header color class
    switch (highestRiskLevel) {
      case 4: return 'header-critical';  // Red
      case 3: return 'header-high';      // Orange
      case 2: return 'header-moderate';  // Yellow
      case 1: return 'header-low';       // Green
      default: return 'header-default';  // Purple
    }
  }

  /**
   * Calculate risk level based on likelihood and consequence scales (1-5)
   * Matches the risk matrix grid color mapping
   * @param likelihood Likelihood scale (1-5): Rare, Remote, Moderate, Likely, Frequent
   * @param consequence Consequence scale (1-5): Insignificant, Minor, Significant, Major, Critical
   * @returns Risk level: 4=Critical(Red), 3=High(Orange), 2=Moderate(Yellow), 1=Low(Green), 0=None
   */
  private getRiskLevel(likelihood: number, consequence: number): number {
    if (!likelihood || !consequence) return 0;

    // Critical (Red) - Highest severity combinations
    if ((likelihood === 5 && consequence >= 4) ||  // Frequent + (Major or Critical)
        (likelihood === 4 && consequence === 5)) { // Likely + Critical
      return 4;
    }

    // High (Orange) - High severity combinations
    if ((likelihood === 5 && consequence >= 2) ||  // Frequent + (Minor or Significant)
        (likelihood === 4 && consequence >= 3) ||  // Likely + (Significant or Major)
        (likelihood === 3 && consequence >= 4) ||  // Moderate + (Major or Critical)
        (likelihood === 2 && consequence === 5)) { // Remote + Critical
      return 3;
    }

    // Moderate (Yellow) - Medium severity combinations
    if ((likelihood === 5 && consequence === 1) ||  // Frequent + Insignificant
        (likelihood === 4 && consequence === 2) ||  // Likely + Minor
        (likelihood === 3 && consequence >= 2 && consequence <= 3) ||  // Moderate + (Minor or Significant)
        (likelihood === 2 && consequence >= 3 && consequence <= 4) ||  // Remote + (Significant or Major)
        (likelihood === 1 && consequence === 5)) { // Rare + Critical
      return 2;
    }

    // Low (Green) - All other combinations
    return 1;
  }

}
