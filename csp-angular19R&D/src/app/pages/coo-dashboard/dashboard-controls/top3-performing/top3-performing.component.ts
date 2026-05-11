import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { COODashboardCommon } from '../../../../models/coo-dashboard-common.model';
import { NameValuePair } from '../../../../models/coo-dashboard-model';

@Component({
  selector: 'app-top3-performing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './top3-performing.component.html',
  styleUrl: './top3-performing.component.scss'
})
export class Top3PerformingComponent implements OnInit {
  @Input() widgetname: string = '';
  @Input() top3Performing: string = 'P';

  public _cooDashboardCommon!: COODashboardCommon;
  performDataAccounts: NameValuePair[] = [];
  performDataPortfolios: NameValuePair[] = [];
  performDataProjects: NameValuePair[] = [];
  nonPerformDataAccounts: NameValuePair[] = [];
  nonPerformDataPortfolios: NameValuePair[] = [];
  nonPerformDataProjects: NameValuePair[] = [];

  constructor() {
    this._cooDashboardCommon = COODashboardCommon.GetInstance();
  }

  ngOnInit(): void {
    this.loaddata(this.widgetname);
  }

  binddata(widgetname: string): void {
    if (this.widgetname === 'CustomerSuccessSurvey' || widgetname === 'CustomerSuccessSurvey') {
      const d = this._cooDashboardCommon.customerSuccessSurvey?.customerSuccessScoresResults;
      if (!d) return;

      const performDataAccounts: NameValuePair[] = [];
      const performDataPortfolios: NameValuePair[] = [];
      const performDataProjects: NameValuePair[] = [];
      const nonPerformDataAccounts: NameValuePair[] = [];
      const nonPerformDataPortfolios: NameValuePair[] = [];
      const nonPerformDataProjects: NameValuePair[] = [];

      // Process Customers
      if (d.cusT_CSAT) {
        d.cusT_CSAT.forEach((value: any) => {
          if (value.nps === 100) {
            performDataAccounts.push(new NameValuePair(value.cusT_NAME, value.nps));
          } else {
            nonPerformDataAccounts.push(new NameValuePair(value.cusT_NAME, value.nps));
          }
        });
      }

      // Process Portfolios
      if (d.portfoliO_CSAT) {
        d.portfoliO_CSAT.forEach((value: any) => {
          if (value.nps === 100) {
            performDataPortfolios.push(new NameValuePair(value.portfoliO_NAME, value.nps));
          } else {
            nonPerformDataPortfolios.push(new NameValuePair(value.portfoliO_NAME, value.nps));
          }
        });
      }

      // Process Projects
      if (d.projecT_CSAT) {
        d.projecT_CSAT.forEach((value: any) => {
          if (value.nps === 100) {
            performDataProjects.push(new NameValuePair(value.proJ_NAME, value.nps));
          } else {
            nonPerformDataProjects.push(new NameValuePair(value.proJ_NAME, value.nps));
          }
        });
      }

      // Sort and store data
      this.performDataAccounts = this.sortData(performDataAccounts, true);
      this.performDataPortfolios = this.sortData(performDataPortfolios, true);
      this.performDataProjects = this.sortData(performDataProjects, true);
      this.nonPerformDataAccounts = this.sortData(nonPerformDataAccounts);
      this.nonPerformDataPortfolios = this.sortData(nonPerformDataPortfolios);
      this.nonPerformDataProjects = this.sortData(nonPerformDataProjects);
    }
  }

  loaddata(widgetname: string): void {
    this.binddata(widgetname);
    this.ontop3PerformingChange(this.top3Performing);
  }

  ontop3PerformingChange(event: string): void {
    this.top3Performing = event;
    this.binddata('');
    
    this._cooDashboardCommon.top3Accounts = [];
    this._cooDashboardCommon.top3Portfolios = [];
    this._cooDashboardCommon.top3Projects = [];

    if (this.top3Performing === 'NP') {
      if (this.nonPerformDataAccounts) {
        this._cooDashboardCommon.top3Accounts = this.nonPerformDataAccounts.slice(0, 3);
      }
      if (this.nonPerformDataPortfolios) {
        this._cooDashboardCommon.top3Portfolios = this.nonPerformDataPortfolios.slice(0, 3);
      }
      if (this.nonPerformDataProjects) {
        this._cooDashboardCommon.top3Projects = this.nonPerformDataProjects.slice(0, 3);
      }
    } else {
      if (this.performDataAccounts) {
        this._cooDashboardCommon.top3Accounts = this.performDataAccounts.slice(0, 3);
      }
      if (this.performDataPortfolios) {
        this._cooDashboardCommon.top3Portfolios = this.performDataPortfolios.slice(0, 3);
      }
      if (this.performDataProjects) {
        this._cooDashboardCommon.top3Projects = this.performDataProjects.slice(0, 3);
      }
    }
  }

  OntabChange(): void {
    // Tab change handler if needed
  }

  sortData(data: NameValuePair[], descending: boolean = false): NameValuePair[] {
    return data.sort((a, b) => {
      return descending ? b.value - a.value : a.value - b.value;
    });
  }
}
