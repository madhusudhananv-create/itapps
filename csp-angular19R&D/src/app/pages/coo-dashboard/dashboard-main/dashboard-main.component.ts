import { Component, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule, MatOption } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { AppsService } from '../../../services/apps.service';
import { SharedService } from '../../../shared/shared.service';
import { SurveyService } from '../../../core/services/survey.service';
import { MyUtility } from '../../../shared/my-utility';
import { COODashboardCommon } from '../../../models/coo-dashboard-common.model';
import { TabOverallStatusComponent } from '../tab-overall-status/tab-overall-status.component';
import { RiskchartControlComponent, riskDashboardInputsModel } from '../../../controls/risk-chart-control/risk-chart-control.component';
import { CssdashboardCssTableComponent } from '../../../pages/cssdashboard/cssdashboard-css-table/cssdashboard-css-table.component';
import { CssdashboardNextPage1Component } from '../../../pages/cssdashboard/cssdashboard-next-page1/cssdashboard-next-page1.component';
import { CssdashboardNextPage2Component } from '../../../pages/cssdashboard/cssdashboard-next-page2/cssdashboard-next-page2.component';
import { NavbarNewComponent } from '../../../components/navbar-new/navbar-new.component';
// Additional child components will be imported as they are migrated

@Component({
  selector: 'app-dashboard-main',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatIconModule,
    TabOverallStatusComponent,
    RiskchartControlComponent,
    CssdashboardCssTableComponent,
    CssdashboardNextPage1Component,
    CssdashboardNextPage2Component,
    NavbarNewComponent
    // Add additional child components here as they are migrated
  ],
  templateUrl: './dashboard-main.component.html',
  styleUrl: './dashboard-main.component.scss'
})
export class DashboardMainComponent implements OnInit {
  menuToggleStatus: boolean = false;
  selectedPeriod: string = 'asToday';
  selectedCust: string = '';
  selectedProj: any[] = [];
  selectedPortfolio: number[] = [];
  empid: string = '';
  customerId: string = '';
  projId: string[] = [];
  portId: number[] = [];
  customers: any[] = [];
  projects: any[] = [];
  portfolioList: any[] = [];
  projectList: any[] = [];
  portfolioprojectMap: any[] = [];
  selectedDateType: string = '1';
  loading: boolean = false;
  isChecked: boolean = false;
  CSMList: any[] = [];
  allCust: boolean = false;
  currIndex: number = 0;
  cssInputs: any;
  riskDashboardInputs!: riskDashboardInputsModel;
  overallBusinessUnit: any[] = [];
  businessUnit: any[] = [];
  progress: boolean = false;
  trendQuarter: string = '';

  @ViewChild('allSelected') allSelected!: MatOption;
  @ViewChild('select') select!: MatSelect;
  @ViewChild('allSelectedCSM') allSelectedCSM!: MatOption;
  @ViewChild('selectCSM') selectCSM!: MatSelect;
  @ViewChild('selectBusinessUnit') selectBusinessUnit!: MatSelect;
  @ViewChild('allBusinessUnitSelected') allBusinessUnitSelected!: MatOption;
  @ViewChild(TabOverallStatusComponent) tabOverallStatus!: TabOverallStatusComponent;

  @Output() toggle: EventEmitter<any> = new EventEmitter();

  public _cooDashboardCommon!: COODashboardCommon;

  constructor(
    private _appservice: AppsService,
    private _sharedService: SharedService,
    private _surveyService: SurveyService,
    private _util: MyUtility,
    private dialog: MatDialog
  ) {
    this._cooDashboardCommon = COODashboardCommon.GetInstance();
  }

  ngOnInit(): void {
    this.empid = localStorage.getItem('empid') || '';
    this.service_GetCSMList();
    this.getOverallBusinessUnits();
    
    setTimeout(() => {
      this.riskReset();
      this.CSATReset();
    }, 2000);
  }

  service_GetCSMList(): void {
    this._surveyService.GetCSMListDistinct().subscribe(
      (data: any) => {
        this.CSMList = data;
      }, 
      (error: any) => { 
        this._util.serviceError(error); 
      }
    );
  }

  onMenuToggleChange(value: boolean): void {
    this.menuToggleStatus = value;
  }

  // Risk Dashboard Methods
  riskApply(): void {
    // Validate mandatory fields
    if (!this._cooDashboardCommon.customerIds || this._cooDashboardCommon.customerIds.length === 0) {
      this._util.showWarningPopup('Please select at least one account from Top 10 Accounts', 'Validation Error');
      return;
    }

    if (!this._cooDashboardCommon.businessUnit || this._cooDashboardCommon.businessUnit.length === 0) {
      this._util.showWarningPopup('Please select at least one Business Unit', 'Validation Error');
      return;
    }

    if (!this._cooDashboardCommon.riskStatus || this._cooDashboardCommon.riskStatus.length === 0) {
      this._util.showWarningPopup('Please select at least one Risk Status', 'Validation Error');
      return;
    }

    // Validate date range only if both dates are provided
    if (this._cooDashboardCommon.dashboardStartdate && this._cooDashboardCommon.dashboardEnddate) {
      if (this._cooDashboardCommon.dashboardStartdate > this._cooDashboardCommon.dashboardEnddate) {
        this._util.showWarningPopup('Please select To date greater than or equal to From date', 'Validation Error');
        return;
      }
    }

    // All validations passed, proceed with loading dashboard
    this.riskDashboardInputs = this.loadRiskDashboardInputs(
      this._cooDashboardCommon.riskStatus,
      this._cooDashboardCommon.businessUnit
    );
  }

  riskReset(): void {
    if (this.allBusinessUnitSelected) {
      this.allBusinessUnitSelected.select();
    }
    this.toggleSelectionForBusinessUnit();
    
    if (this.allSelected) {
      this.allSelected.select();
    }
    this.toggleSelection();
    
    this.riskDashboardInputs = this.loadRiskDashboardInputs(
      this._cooDashboardCommon.riskStatus,
      this._cooDashboardCommon.businessUnit
    );
  }

  private loadRiskDashboardInputs(riskStatus: any, businessUnit: any): riskDashboardInputsModel {
    const inputs = new riskDashboardInputsModel();
    
    // Convert customerIds array to comma-separated string (include -1 for "All")
    inputs.customeR_IDS = this._cooDashboardCommon.customerIds.length > 0 
      ? this._cooDashboardCommon.customerIds.join(',') 
      : '-1';
    
    // Set dates
    inputs.StarT_DATE = this._cooDashboardCommon.dashboardStartdate;
    inputs.enD_DATE = this._cooDashboardCommon.dashboardEnddate;
    
    // Convert businessUnit array to comma-separated string (include -1 for "All")
    if (businessUnit && Array.isArray(businessUnit) && businessUnit.length > 0) {
      inputs.businesS_UNITS = businessUnit.join(',');
    } else {
      inputs.businesS_UNITS = '-1';
    }
    
    // Convert riskStatus array to comma-separated string (include -1 for "All")
    if (riskStatus && Array.isArray(riskStatus) && riskStatus.length > 0) {
      inputs.risK_STATUS = riskStatus.join(',');
    } else {
      inputs.risK_STATUS = '-1';
    }
    
    return inputs;
  }

  // CSAT Methods
  CSATReset(): void {
    if (this.allSelectedCSM) {
      this.allSelectedCSM.select();
    }
    this.toggleCSMSelection(null);
    this.CSATApply();
  }

  CSATApply(): void {
    if (this._cooDashboardCommon.csmIds && this._cooDashboardCommon.csmIds.length > 0) {
      this.bindCSATInputs();
    } else {
      alert('Please choose any CSM');
      return;
    }
  }

  bindCSATInputs(): void {
    this._cooDashboardCommon.loadCSATInsightsInputs(this._cooDashboardCommon.csmIds);
  }

  private loadCSATInsightsInputs(csmIds: any[]): void {
    // This method is now delegated to COODashboardCommon
    this._cooDashboardCommon.loadCSATInsightsInputs(csmIds);
  }

  ViewCSSDetails(): void {
    // Will need ViewCssDetailsComponent migrated
    /*
    const dialogRef = new MatDialogConfig();
    dialogRef.autoFocus = true;
    dialogRef.data = {
      cssInputs: this._cooDashboardCommon.cssDashboardInputs
    };
    dialogRef.maxWidth = '80%';
    dialogRef.width = '80%';
    dialogRef.height = '80%';
    const dialogInstance = this.dialog.open(ViewCssDetailsComponent, dialogRef);
    dialogInstance.afterClosed().subscribe(res => {
      // Handle close
    });
    */
  }

  // Tab Change Handler
  selectedTabChange($event: any): void {
    let clickedIndex = $event.index;
    if (clickedIndex === 0) {
      // Overall Status tab - load account health data
      if (this.tabOverallStatus) {
        this.tabOverallStatus.loadData();
      }
    } else if (clickedIndex === 1) {
      this.LoadRiskDashboard();
    }
  }

  private LoadRiskDashboard(): void {
    // Placeholder for loading risk dashboard
  }

  // Risk Status Selection
  toggleSelection(): void {
    if (this.select && this.select.options) {
      if (this.allSelected && this.allSelected.selected) {
        this.select.options.forEach((item: MatOption) => item.select());
      } else if (this.allSelected) {
        this.select.options.forEach((item: MatOption) => item.deselect());
      }
    }
  }

  tosslePerOne($event?: any): void {
    if (this.allSelected && this.allSelected.selected) {
      this.allSelected.deselect();
      return;
    }
    
    let allSelect: boolean = true;
    if (this.select && this.select.options) {
      this.select.options.forEach((item: MatOption) => {
        if (!item.selected && item.value !== -1) {
          allSelect = false;
        }
      });
      
      if (allSelect && this.allSelected) {
        this.allSelected.select();
      }
    }
  }

  // CSM Selection
  toggleCSMSelection($event: any): void {
    if (this.selectCSM && this.selectCSM.options) {
      if (this.allSelectedCSM && this.allSelectedCSM.selected) {
        this.selectCSM.options.forEach((item: MatOption) => item.select());
      } else if (this.allSelectedCSM) {
        this.selectCSM.options.forEach((item: MatOption) => item.deselect());
      }
    }
  }

  tosslePerOneCSM($event?: any): void {
    if (this.allSelectedCSM && this.allSelectedCSM.selected) {
      this.allSelectedCSM.deselect();
      return;
    }

    let allSelect: boolean = true;
    if (this.selectCSM && this.selectCSM.options) {
      this.selectCSM.options.forEach((item: MatOption) => {
        if (!item.selected && item.value !== -1) {
          allSelect = false;
        }
      });
      
      if (allSelect && this.allSelectedCSM) {
        this.allSelectedCSM.select();
      }
    }
  }

  // Business Unit Methods
  getOverallBusinessUnits(): void {
    this._appservice.getBusinessUnits().subscribe(
      (data: any) => {
        // Extract BU names from response objects
        let buArray: string[] = [];
        
        // Handle both array and object responses
        const responseData = Array.isArray(data) ? data : (data?.data || []);
        
        if (responseData.length > 0) {
          buArray = responseData.map((bu: any) => {
            // If it's already a string, use it
            if (typeof bu === 'string') {
              return bu;
            }
            // Otherwise extract the BU name from the object
            const buName = bu.BUSINESS_UNIT || bu.businesS_UNIT || bu.bU_NM || bu.business_unit || bu.name;
            return buName;
          })
          .filter((name: any) => {
            // Filter out invalid values
            return name && 
                   typeof name === 'string' && 
                   name.trim() !== '' && 
                   name !== 'null' && 
                   name !== 'undefined' &&
                   name !== '[object Object]';
          })
          .map((name: string) => name.trim());
          
          // Remove duplicates and sort
          buArray = Array.from(new Set(buArray)).sort();
        }
        
        this.overallBusinessUnit = buArray;
        if (this.overallBusinessUnit.length > 0) {
          this.businessUnit = this.overallBusinessUnit.slice();
          this.businessUnit.unshift('-1');
          
          // Set all business units as selected by default (including '-1' for All)
          this._cooDashboardCommon.businessUnit = this.businessUnit.slice();
        }
      },
      (error: any) => {
        console.error('Error loading business units:', error);
      }
    );
  }

  toggleSelectionForBusinessUnit(): void {
    if (this.selectBusinessUnit && this.selectBusinessUnit.options) {
      if (this.allBusinessUnitSelected && this.allBusinessUnitSelected.selected) {
        this.selectBusinessUnit.options.forEach((item: MatOption) => item.select());
      } else if (this.allBusinessUnitSelected) {
        this.selectBusinessUnit.options.forEach((item: MatOption) => item.deselect());
      }
    }
  }

  businessUnitTosslePerOne(): void {
    if (this.allBusinessUnitSelected && this.allBusinessUnitSelected.selected) {
      this.allBusinessUnitSelected.deselect();
      return;
    }
    
    let count = 0;
    if (this.selectBusinessUnit && this.selectBusinessUnit.options) {
      this.selectBusinessUnit.options.forEach((item: MatOption) => {
        if (item.selected) {
          count++;
        }
      });
      
      if (this.overallBusinessUnit.length === count && this.allBusinessUnitSelected) {
        this.allBusinessUnitSelected.select();
      }
    }
  }

  // Navigation Methods
  onPrev(): void {
    this.currIndex--;
  }

  onNext(): void {
    this.currIndex++;
  }
}
