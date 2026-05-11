import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { COODashboardCommon } from '../../../../models/coo-dashboard-common.model';
import { COODashboardService } from '../../../../services/coo-dashboard.service';

@Component({
  selector: 'app-css-viewdetails',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './css-viewdetails.component.html',
  styleUrl: './css-viewdetails.component.scss'
})
export class CSSViewdetailsComponent implements OnInit {
  @Input() showCSSViewdetails: boolean = false;

  public _cooDashboardCommon!: COODashboardCommon;
  selectedCust: string = 'All';
  selectedProject: string = 'All';
  selectedPortfoliovalue: string = 'All';
  ipSearch: string = '';
  isSelectedRow: any = null;
  
  // Local arrays for popup data
  vwcustomerSuccessSurvey: any[] = [];
  popupCusts: string[] = [];
  popupProjects: string[] = [];
  popupPortfolios: string[] = [];

  constructor(
    private _cooDashboardService: COODashboardService,
    private router: Router
  ) {
    this._cooDashboardCommon = COODashboardCommon.GetInstance();
  }

  ngOnInit(): void {
    this.vwcustomerSuccessSurvey = [];
    this.getcustomerSuccessSurvey();
  }

  onClose(): void {
    this.Reset();
    this.showCSSViewdetails = false;
  }

  toggleCustomerSelection(event: any): void {
    this.getProjectsbyCust();
  }

  getProjectsbyCust(): void {
    this.vwcustomerSuccessSurvey = this._cooDashboardCommon.customerSuccessSurvey?.csat || [];
    let filteredRecords = this.vwcustomerSuccessSurvey;
    
    if (this.selectedCust !== 'All') {
      filteredRecords = this.vwcustomerSuccessSurvey.filter(
        (x: any) => x.customeR_NAME === this.selectedCust
      );
    }
    
    this.popupProjects = this.getUniqueItems(filteredRecords, 'projecT_NAME')
      .sort((n1, n2) => n1.toLowerCase() > n2.toLowerCase() ? 1 : -1);
    this.popupProjects.unshift('All');
    this.selectedProject = 'All';
  }

  getcustomerSuccessSurvey(): void {
    this.vwcustomerSuccessSurvey = this._cooDashboardCommon.customerSuccessSurvey?.csat || [];
    this.popupProjects = [];
    this.popupCusts = [];
    this.popupPortfolios = [];

    this.popupCusts = this.getUniqueItems(this.vwcustomerSuccessSurvey, 'customeR_NAME')
      .sort((n1, n2) => n1.toLowerCase() > n2.toLowerCase() ? 1 : -1);
    this.popupCusts.unshift('All');
    
    this.getProjectsbyCust();
  }

  getUniqueItems(array: any[], fieldName: string): string[] {
    const unique = [...new Set(array.map((item: any) => item[fieldName]))];
    return unique.filter(item => item != null);
  }

  Apply(): void {
    this.vwcustomerSuccessSurvey = this._cooDashboardCommon.customerSuccessSurvey?.csat || [];
    let dataView = this.vwcustomerSuccessSurvey;
    
    dataView = dataView.filter((x: any) => 
      (x.customeR_NAME === this.selectedCust || this.selectedCust === 'All') &&
      (x.projecT_NAME === this.selectedProject || this.selectedProject === 'All') &&
      (x.portfoliO_NAME === this.selectedPortfoliovalue || this.selectedPortfoliovalue === 'All') &&
      (this.ipSearch.trim() === '' || 
        x.projecT_NAME?.toLowerCase().indexOf(this.ipSearch.toLowerCase()) !== -1 ||
        x.portfoliO_NAME?.toLowerCase().indexOf(this.ipSearch.toLowerCase()) !== -1 ||
        x.customeR_NAME?.toLowerCase().indexOf(this.ipSearch.toLowerCase()) !== -1 ||
        x.respondenT_NAME?.toLowerCase().indexOf(this.ipSearch.toLowerCase()) !== -1)
    );
    
    this.vwcustomerSuccessSurvey = dataView;
  }

  Reset(): void {
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

  navigateToDetails(proj: any): void {
    this.isSelectedRow = proj;
  }
}
