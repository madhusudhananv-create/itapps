import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelect } from '@angular/material/select';
import { MatOptionModule, MatOption } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { RiskModel } from '../../shared/models/risk.model';
import { enumRoles } from '../../shared/enum';
import { AccessControl } from '../../shared/access-control';
import { RiskchartControlComponent, riskDashboardInputsModel } from '../risk-chart-control/risk-chart-control.component';

@Component({
  selector: 'app-risk-chart',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatButtonModule,
    MatInputModule,
    MatProgressBarModule,
    MatCardModule,
    RiskchartControlComponent
  ],
  templateUrl: './risk-chart.component.html',
  styleUrl: './risk-chart.component.scss'
})
export class RiskchartComponent implements OnInit {
  @Input() customerId: any;
  risk: RiskModel[] = [];
  customer: any;
  customerIds: any;
  _loading: boolean = false;
  allCust: string = "";
  selectedCust: string = "";
  @ViewChild('allSelected') allSelected!: MatOption;
  @ViewChild('select') select!: MatSelect;
  @ViewChild('selectCustomer') selectCustomer!: MatSelect;
  @ViewChild('allCustomerSelected') allCustomerSelected!: MatOption;
  @ViewChild('selectBusinessUnit') selectBusinessUnit!: MatSelect;
  @ViewChild('allBusinessUnitSelected') allBusinessUnitSelected!: MatOption;

  riskStatus: any = [];
  riskStatusList: any = [];
  businessUnit: any = [];
  businessUnits: any = [];
  fromDate: Date | null = null;
  toDate: Date | null = null;
  customeR_IDS: any = [];
  isValid: boolean = false;
  accSelection = '-1';
  riskDashboardInputs: riskDashboardInputsModel = new riskDashboardInputsModel();

  constructor(public _util: MyUtility, public _serv: AppsService,
    public router: Router,
    public _access: AccessControl) {
  }

  ngOnInit() {
    this.selectedCust = this.customerId || '';
    this.getvalue();
  }

  /**
   * Navigate back to customer dashboard
   */
  goBack() {
    if (this.selectedCust) {
      this.router.navigate(['/newdashboard/cust', this.selectedCust, false]);
    } else {
      this.router.navigate(['/newdashboard/custm']);
    }
  }

  getvalue() {
    this.riskStatusList = this.getRiskStatus();
    
    this._serv.getAccountsForCSATDashboard(this.allCust === 'true').subscribe({
      next: (res: any) => {
        // Handle both array and object responses
        // API returns an object with 'customers' property
        this.customer = Array.isArray(res) ? res : (res?.customers || res?.data || []);
        if (this.customer && this.customer.length > 0) {
        }
        if (this.customer != null && this.customer != undefined && this.customer.length != 0) {
          var allCustomer = { cusT_ID: "-1", cusT_NM: "All" };
          var myAccounts = { cusT_ID: "-2", cusT_NM: "My Accounts" };
          var top10 = { cusT_ID: "-3", cusT_NM: "Top 10 Accounts" };
          var exceptTop10 = { cusT_ID: "-4", cusT_NM: "All Accounts Except Top 10 Accounts" };
          var gslab = { cusT_ID: "-5", cusT_NM: "All GS Lab Accounts" };
          var gslabKey = { cusT_ID: "-6", cusT_NM: "GS Lab Key Accounts" };
          this.customer.unshift(gslabKey);
          this.customer.unshift(gslab);
          this.customer.unshift(exceptTop10);
          this.customer.unshift(top10);
          this.customer.unshift(myAccounts);
          this.customer.unshift(allCustomer);
        } else {
          console.warn('No customer data received or empty array');
        }
      },
      error: (error: any) => {
        console.error('Error loading customers:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        this._util.serviceError('Failed to load customer accounts. Please check console for details.');
      }
    });
    
    // Load business units on initialization
    this.getOverallBusinessUnits();
  }


  loadData() {
    // Validate mandatory fields
    if (this.customeR_IDS == null || this.customeR_IDS == undefined || this.customeR_IDS.length == 0) {
      this._util.showWarningPopup('Please select at least one account', 'Validation Error');
      return;
    }
    if (this.businessUnit == null || this.businessUnit == undefined || this.businessUnit.length == 0) {
      this._util.showWarningPopup('Please select at least one Business Unit', 'Validation Error');
      return;
    }
    if (this.riskStatus == null || this.riskStatus == undefined || this.riskStatus.length == 0) {
      this._util.showWarningPopup('Please select at least one Risk Status', 'Validation Error');
      return;
    }
    // Validate date range only if both dates are provided
    if (this.toDate && this.fromDate && this.toDate < this.fromDate) {
      this._util.showWarningPopup(
        "The 'To Date' must be equal to or after the 'From Date'. Please adjust your date selection and try again.",
        "Invalid Date Range"
      );
      return;
    }
    
    // All validations passed, proceed with loading data
    if (this.toDate && this.fromDate) {
      this._util.setLocaleDate(this.toDate);
      this._util.setLocaleDate(this.fromDate);
    }

    this.riskDashboardInputs = new riskDashboardInputsModel();
    var businessUnitIds: string = "";
    if (this.businessUnit != null && this.businessUnit != undefined) {
      this.businessUnit.forEach((element: any) => {
        // Business units are strings, not objects
        businessUnitIds = businessUnitIds + element + ",";
      });
    }
    this.riskDashboardInputs.customeR_IDS = this.getCustomerIds();
    this.riskDashboardInputs.businesS_UNITS = businessUnitIds.slice(0, businessUnitIds.lastIndexOf(','));
    var riskStatusIds: string = "";
    if (this.riskStatus != null && this.riskStatus != undefined) {
      this.riskStatus.forEach((element: any) => {
        riskStatusIds = riskStatusIds + element + ",";
      });
    }
    this.riskDashboardInputs.risK_STATUS = riskStatusIds.slice(0, riskStatusIds.lastIndexOf(','));
    this.riskDashboardInputs.StarT_DATE = this.fromDate!;
    this.riskDashboardInputs.enD_DATE = this.toDate!;
    this.isValid = true;
    
    // Call the API to get risk chart data
    this._util.GetRiskChart(this.riskDashboardInputs);
  }

  openDialog() {
  }

  showRisk(row: any) {
  }

  getAccountsForUser() {
    // Note: Access control role check - commenting out until proper role IDs are available
    // if (this._access.IsAllowed(77, 1, '', '') || this._access.IsAllowed(78, 1, '', '')) {
    //   this._serv.getAccountsForCSATDashboard(true).subscribe((res: any) => {
    //     this.customer = Array.isArray(res) ? res : (res?.customers || res?.data || []);
    //   })
    // }
    // else {
      this._serv.getAccountsForCSATDashboard(false).subscribe((res: any) => {
        // Handle both array and object responses
        // API returns an object with 'customers' property
        this.customer = Array.isArray(res) ? res : (res?.customers || res?.data || []);
      })
    // }
  }

  getCustomerIds(): string {
    var allCustomerIds: string = "";
    if (this.customeR_IDS != null && this.customeR_IDS != undefined) {
      this.customeR_IDS.forEach((element: any) => {
        if (element == "-1") {
          if (this.customer != null && this.customer != undefined && this.customer.length > 0) {
            this.customer.forEach((element: any) => {
              if (element.cusT_ID != "-1" && element.cusT_ID != "-2" && element.cusT_ID != "-3" && element.cusT_ID != "-4" && element.cusT_ID != "-5" && element.cusT_ID != "-6") {
                allCustomerIds = allCustomerIds + element.cusT_ID + ",";
              }
            });
          }
        }

        if (element == "-2") {
          if (this.customer != null && this.customer != undefined && this.customer.length > 0) {
            this.customer.forEach((element: any) => {
              if (element.cusT_ID != "-1" && element.cusT_ID != "-2" && element.cusT_ID != "-3" && element.cusT_ID != "-4" && element.cusT_ID != "-5" && element.cusT_ID != "-6") {
                if (element.mY_ACCOUNT == true) {
                  allCustomerIds = allCustomerIds + element.cusT_ID + ",";
                }
              }
            });
          }
        }

        if (element == "-3") {
          if (this.customer != null && this.customer != undefined && this.customer.length > 0) {
            this.customer.forEach((element: any) => {
              if (element.cusT_ID != "-1" && element.cusT_ID != "-2" && element.cusT_ID != "-3" && element.cusT_ID != "-4" && element.cusT_ID != "-5" && element.cusT_ID != "-6") {
                if (element.toP_10_ACCOUNT == true) {
                  allCustomerIds = allCustomerIds + element.cusT_ID + ",";
                }
              }
            });
          }
        }

        if (element == "-4") {
          if (this.customer != null && this.customer != undefined && this.customer.length > 0) {
            this.customer.forEach((element: any) => {
              if (element.cusT_ID != "-1" && element.cusT_ID != "-2" && element.cusT_ID != "-3" && element.cusT_ID != "-4" && element.cusT_ID != "-5" && element.cusT_ID != "-6") {
                if (element.toP_10_ACCOUNT == false) {
                  allCustomerIds = allCustomerIds + element.cusT_ID + ",";
                }
              }
            });
          }
        }

        if (element == "-5") {
          if (this.customer != null && this.customer != undefined && this.customer.length > 0) {
            this.customer.forEach((element: any) => {
              if (element.cusT_ID != "-1" && element.cusT_ID != "-2" && element.cusT_ID != "-3" && element.cusT_ID != "-4" && element.cusT_ID != "-5" && element.cusT_ID != "-6") {
                if (element.gslaB_ACCOUNT == true) {
                  allCustomerIds = allCustomerIds + element.cusT_ID + ",";
                }
              }
            });
          }
        }

        if (element == "-6") {
          if (this.customer != null && this.customer != undefined && this.customer.length > 0) {
            this.customer.forEach((element: any) => {
              if (element.cusT_ID != "-1" && element.cusT_ID != "-2" && element.cusT_ID != "-3" && element.cusT_ID != "-4" && element.cusT_ID != "-5" && element.cusT_ID != "-6") {
                if (element.gslaB_KEY_ACCOUNT == true) {
                  allCustomerIds = allCustomerIds + element.cusT_ID + ",";
                }
              }
            });
          }
        }

        if (element != "-1" && element != "-2" && element != "-3" && element != "-4" && element != "-5" && element != "-6") {
          allCustomerIds = allCustomerIds + element + ",";
        }
      });
    }
    return allCustomerIds.slice(0, allCustomerIds.lastIndexOf(','));
  }

  getRiskStatus(): any {
    var riskStatus: any = ["Identified", "Assessed", "Planned", "In-Process", "Occurred", "Not-Occurred", "Closed"];
    return riskStatus;
  }

  toggleSelection() {
    if (this.allSelected.selected) {
      this.select
        .options
        .forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
    }
  }

  toggleSelectionForCustomer() {
    if (this.allCustomerSelected.selected) {
      this.selectCustomer
        .options
        .forEach((item: MatOption) => item.select());
    } else {
      this.selectCustomer.options.forEach((item: MatOption) => item.deselect());
    }
  }

  toggleSelectionForBusinessUnit() {
    if (this.allBusinessUnitSelected.selected) {
      this.selectBusinessUnit
        .options
        .forEach((item: MatOption) => item.select());
    } else {
      this.selectBusinessUnit.options.forEach((item: MatOption) => item.deselect());
    }
  }

  getOverallBusinessUnits() {
    this._serv.getBusinessUnits().subscribe({
      next: (res: any) => {
        
        // Extract BU names from response objects
        let buArray: string[] = [];
        
        // Handle both array and object responses
        const data = Array.isArray(res) ? res : (res?.data || []);
        
        if (data.length > 0) {
          buArray = data.map((bu: any) => {
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
        
        this.businessUnits = buArray;
      },
      error: (error: any) => {
        console.error('Error loading business units:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        this._util.serviceError('Failed to load business units. Please check console for details.');
      }
    });
  }

  reset() {
    this.riskStatus = [];
    this.businessUnit = [];
    this.customeR_IDS = [];
    this.fromDate = null;
    this.toDate = null;
    this.isValid = false;
  }

}
