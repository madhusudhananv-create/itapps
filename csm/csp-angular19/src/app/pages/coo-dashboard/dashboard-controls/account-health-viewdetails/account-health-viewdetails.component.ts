import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { COODashboardCommon } from '../../../../models/coo-dashboard-common.model';
import { COODashboardService } from '../../../../services/coo-dashboard.service';

@Component({
  selector: 'app-account-health-viewdetails',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './account-health-viewdetails.component.html',
  styleUrl: './account-health-viewdetails.component.scss'
})
export class AccountHealthViewdetailsComponent implements OnInit {
  @Input() isvisible: boolean = false;

  public _cooDashboardCommon!: COODashboardCommon;
  selectedCust: string = 'All';
  selectedProject: string = 'All';
  selectedPortfoliovalue: string = 'All';
  ipSearch: string = '';
  loadDonutIp: string = 'NF';
  
  // Local arrays for popup data
  popupCusts: string[] = [];
  popupProjects: string[] = [];
  popupPortfolios: string[] = [];
  customerProjectsScores: any[] = [];

  constructor(
    private _cooDashboardService: COODashboardService,
    private _sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.getAccountOverallHealth();
  }

  onClose(): void {
    this.Reset();
    this.isvisible = false;
  }

  getStatus(score: number): SafeHtml {
    let ophtml = '';
    
    if (score >= 90) {
      ophtml = `<img class="targetImg" style="height: 10px;margin-right: 5px;" src="assets/images/up-arrow.png" /> Above Target`;
    } else if (score >= 80) {
      ophtml = `<img class="targetImg" style="height: 14px;margin-right: 5px;" src="assets/images/target.png" /> On Target`;
    } else {
      ophtml = `<img class="targetImg" style="height: 10px;margin-right: 5px;" src="assets/images/down-arrow.png" /> Below Target`;
    }
    
    return this.transform(ophtml);
  }

  /**
   * SECURITY NOTE: bypassSecurityTrustHtml is used here for hardcoded HTML containing image tags.
   * This is safe because:
   * 1. HTML is hardcoded (not from user input)
   * 2. Contains only static asset paths
   * 3. No dynamic content or JavaScript
   * 
   * Consider refactoring to use [src] binding instead of innerHTML for better security.
   */
  transform(value: string): SafeHtml {
    // Validate that value only contains expected safe patterns
    const hasOnlyImages = /^<img[^>]*src="assets\/images\/[a-z-]+\.png"[^>]*\/>.*$/.test(value);
    if (!hasOnlyImages) {
      console.warn('⚠️ Unexpected HTML content in transform():', value);
    }
    return this._sanitizer.bypassSecurityTrustHtml(value);
  }

  loadDataBySelection(ip: string): void {
    this.loadDonutIp = ip;
    this.Apply();
  }

  toggleCustomerSelection(event: any): void {
    this.getProjectsbyCust();
    this.getPortfoliosbyCust();
  }

  getProjectsbyCust(): void {
    let filteredRecords = this._cooDashboardCommon.accountOverallHealth?.projecT_KPIS || [];
    this.selectedProject = 'All';
    
    if (this.selectedCust !== 'All') {
      filteredRecords = filteredRecords.filter((x: any) => x.cusT_NAME === this.selectedCust);
    }
    
    this.popupProjects = this.getUniqueItems(filteredRecords, 'proJ_NAME')
      .sort((n1, n2) => n1.toLowerCase() > n2.toLowerCase() ? 1 : -1);
    this.popupProjects.unshift('All');
  }

  getPortfoliosbyCust(): void {
    let filteredRecords = this._cooDashboardCommon.accountOverallHealth?.projecT_KPIS || [];
    this.selectedPortfoliovalue = 'All';
    
    if (this.selectedCust !== 'All') {
      filteredRecords = filteredRecords.filter((x: any) => x.cusT_NAME === this.selectedCust);
    }
    
    this.popupPortfolios = this.getUniqueItems(filteredRecords, 'portfoliO_NAME')
      .sort((n1, n2) => n1.toLowerCase() > n2.toLowerCase() ? 1 : -1);
    this.popupPortfolios.unshift('All');
  }

  getUniqueItems(array: any[], fieldName: string): string[] {
    const unique = [...new Set(array.map((item: any) => item[fieldName]))];
    return unique.filter(item => item != null);
  }

  getAccountOverallHealth(): void {
    this.loadDonutIp = 'NF';
    this.popupProjects = [];
    this.popupCusts = [];
    this.popupPortfolios = [];

    const kpis = this._cooDashboardCommon.accountOverallHealth?.projecT_KPIS || [];
    
    this.popupCusts = this.getUniqueItems(kpis, 'cusT_NAME')
      .sort((n1, n2) => n1.toLowerCase() > n2.toLowerCase() ? 1 : -1);
    this.popupCusts.unshift('All');

    this.getProjectsbyCust();
    this.getPortfoliosbyCust();
    this.BindData(kpis);
  }

  BindData(ipdata: any[]): void {
    const dataNF: any[] = [];
    const dataUC: any[] = [];
    const tempcust: any[] = this._cooDashboardCommon.accountOverallHealth?.cusT_KPIS || [];

    ipdata.forEach((value) => {
      const custScore = tempcust.find((x: any) => x.cusT_NAME === value.cusT_NAME);
      if (custScore && custScore.score === 100) {
        dataUC.push(value);
      } else {
        dataNF.push(value);
      }
    });

    const data = this.loadDonutIp === 'NF' ? dataNF : dataUC;
    
    // Build hierarchical structure for display
    this.customerProjectsScores = this.buildCustomerProjectsScores(data, tempcust);
  }

  buildCustomerProjectsScores(data: any[], tempcust: any[]): any[] {
    const customerProjectsScores: any[] = [];
    const sortedData = data.sort((n1, n2) => 
      n1.cusT_NAME.toLowerCase() > n2.cusT_NAME.toLowerCase() ? 1 : -1
    );

    let prevCust = '';
    let i = 0;

    sortedData.forEach((value) => {
      if (prevCust !== value.cusT_NAME) {
        const custScore = tempcust.find((x: any) => x.cusT_NAME === value.cusT_NAME);
        const projects = sortedData.filter((obj: any) => obj.cusT_NAME === value.cusT_NAME);
        
        const projectScores = projects.map((proj: any) => ({
          projName: proj.proJ_NAME,
          score: proj.score,
          projID: proj.proJ_ID,
          portfolioName: proj.portfoliO_NAME
        }));

        customerProjectsScores[i] = {
          custID: value.cusT_ID,
          custName: value.cusT_NAME,
          score: custScore?.score || 0,
          projectScores,
          isExpanded: false
        };
        i++;
      }
      prevCust = value.cusT_NAME;
    });

    return customerProjectsScores;
  }

  Apply(): void {
    let dataView = this._cooDashboardCommon.accountOverallHealth?.projecT_KPIS || [];
    
    dataView = dataView.filter((x: any) =>
      (x.cusT_NAME === this.selectedCust || this.selectedCust === 'All') &&
      (x.proJ_NAME === this.selectedProject || this.selectedProject === 'All') &&
      (x.portfoliO_NAME === this.selectedPortfoliovalue || this.selectedPortfoliovalue === 'All') &&
      (this.ipSearch.trim() === '' ||
        x.proJ_NAME?.toLowerCase().indexOf(this.ipSearch.toLowerCase()) !== -1 ||
        x.portfoliO_NAME?.toLowerCase().indexOf(this.ipSearch.toLowerCase()) !== -1 ||
        x.cusT_NAME?.toLowerCase().indexOf(this.ipSearch.toLowerCase()) !== -1)
    );
    
    this.BindData(dataView);
  }

  Reset(): void {
    this.loadDonutIp = 'NF';
    this.selectedCust = 'All';
    this.toggleCustomerSelection('');
    this.selectedPortfoliovalue = 'All';
    this.selectedProject = 'All';
    this.ipSearch = '';
    this.Apply();
  }

  Search(): void {
    this.Apply();
  }

  ViewBatch_onClick(element: any): void {
    this._cooDashboardCommon.selectedCustomerID = element.custID;
    this._cooDashboardCommon.selectedCustomerName = element.custName;
    // Navigate to dashboard view
  }

  toggleExpand(item: any): void {
    item.isExpanded = !item.isExpanded;
  }
}
