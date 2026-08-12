import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AppsService } from '../../../services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';




@Component({
  selector: 'app-qspoc-popup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatProgressBarModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './qspoc-popup.component.html',
  styleUrls: ['./qspoc-popup.component.scss']
})
export class QSPOCPopupComponent implements OnInit {
  projname: any
  custname: any
  custid: any
  projids: any
  result: any = [];
  csM_NAME: any;
  QAEmployeeList: any = [];
  selectedQA: any;
  selectedScope: any = [];
  selectedIso: any = [];
  selectedGovernanceApplicability: any;
  hasExistingGovernanceValue: boolean = false;
  governanceApplicabilityOptions = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
    { value: 'NA', label: 'NA' }
  ];
  editmode: any = false;
  overallDetails: any;
  scopeList: any;
  isoStandardList: any;
  isLoading: boolean = false;
  OverallScopes: any;
  OverallProjectScopes: any;
  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(public _appservice: AppsService,
    public _util: MyUtility,
    public dialogRef: MatDialogRef<QSPOCPopupComponent>,
    public _access: AccessControl,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.projname = this.data.projname;
    this.custname = this.data.custname;
    this.custid = this.data.custid;
    this.projids = this.data.projids;
    this.getProjectInputDetails();
    this.getProjectCertificationScope();
  }

  SaveDetails() {
    this.isLoading = true;
    if ((this.selectedQA == undefined || this.selectedQA == '' || this.selectedQA == null) &&
      this.selectedScope.length == 0 && this.selectedIso.length == 0 &&
      (this.selectedGovernanceApplicability == undefined || this.selectedGovernanceApplicability == '' || this.selectedGovernanceApplicability == null)) {
      this._util.showWarningPopup("Please select any values", "Validation Required");
      this.isLoading = false;
      this.GetProjectHeadsByID(this.projids);
      return;
    }
    else {
      let params = {
        projecT_ID: this.projids,
        qA_SPOC: this.selectedQA,
        certificatioN_SCOPE: this.selectedScope,
        isO_STANDARD: this.selectedIso,
        governancE_APPLICABILITY: this.selectedGovernanceApplicability
      };
      this._appservice.UpdateProjectDetails(params).subscribe((data: any) => {
        this._util.showSuccessPopup("Project configuration updated successfully", "Success");
        this.GetProjectHeadsByID(this.projids);
        this.Cancel_onClick();
        this.isLoading = false;
      },
        (error: any) => {
          this.isLoading = false;
          this._util.serviceError(error);
        })
    }
  }

  close() {
    this.editmode = false;
  }
  Cancel_onClick() {
    this.dialogRef.close();
  }

  GetProjectHeadsByID(projID: any) {
    this.isLoading = true;
    this._appservice.GetProjectHeadsByID(projID).subscribe({
      next: (data: any) => {
        this.result = data;
        this.csM_NAME = this.result.csM_NAME;
        this.selectedQA = this.result.qa;
        
        // Check if governance value exists in database
        const dbGovernanceValue = this.result.governancE_APPLICABILITY || this.result.governance_applicability;
        this.hasExistingGovernanceValue = !!dbGovernanceValue;
        
        // Set governance: use DB value if exists, otherwise default based on DevEx partner
        this.selectedGovernanceApplicability = dbGovernanceValue || (this.selectedQA ? 'Yes' : 'No');
        
        if (this.result.isO_STANDARDS != null && this.result.isO_STANDARDS != undefined) {
          let iso = this.result.isO_STANDARDS.split(',').map(Number);
          this.selectedIso = this.isoStandardList.filter((x: any) => iso.includes(x.id)).
            map((selectedItem: any) => selectedItem.id);
          this.filterScopes(this.selectedIso);
        }
        if (this.result.certificatioN_SCOPES != null && this.result.certificatioN_SCOPES != undefined) {
          let scope = this.result.certificatioN_SCOPES.split(',').map(Number);
          this.selectedScope = this.scopeList.filter((x: any) => scope.includes(x.id)).
            map((selectedItem: any) => selectedItem.id);
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('GetProjectHeadsByID error:', error);
        this.isLoading = false;
        this._util.serviceError(error);
      },
      complete: () => { }
    });
  }

  getProjectInputDetails() {
    this._appservice.GetProjectDetails().subscribe({
      next: (data: any) => {
        this.overallDetails = data;
        this.QAEmployeeList = this.overallDetails.qaList;
        this.scopeList = this.overallDetails.certificationScopeList;
        this.isoStandardList = this.overallDetails.isoStandardList;
      },
      error: (error: any) => { 
        console.error('getProjectInputDetails error:', error);
        this._util.serviceError(error); 
      }
    });
  }

  getProjectCertificationScope() {
    this._appservice.getProjectCertificationScope().subscribe({
      next: (data: any) => {
        this.OverallProjectScopes = data;
        this.GetProjectHeadsByID(this.projids);
      },
      error: (error: any) => { 
        console.error('getProjectCertificationScope error:', error);
        this._util.serviceError(error); 
      }
    });
  }

  filterScopes(selectedIso: any) {
    if (this.OverallProjectScopes != null && this.OverallProjectScopes != undefined && this.OverallProjectScopes.length > 0) {
      let filteredScopes = this.OverallProjectScopes.filter((x: any) => selectedIso.includes(x.isO_STANDARD_ID));
      this.OverallScopes = filteredScopes;
    }
  }

  resetFilterValue(opened: boolean) {
    this.searchInput.nativeElement.value = '';
    this.applyFilterForScope(this.searchInput.nativeElement.value);
  }

  applyFilterForScope(value: string) {
    if (!value) {
      this.filterScopes(this.selectedIso);
    }
    else {
      if (this.OverallScopes != null && this.OverallScopes != undefined && this.OverallScopes.length > 0) {
        let filteredScopes = this.OverallScopes.map((scope: any) => ({
          ...scope,
          items: scope.items.filter((item: any) => item.scopE_NAME.toLowerCase().includes(value.toLowerCase()))
        })).filter((scope: any) => scope.items.length > 0);
        this.OverallScopes = filteredScopes;
      }
    }
  }

  onQSPOCChange() {
    // Only auto-update Governance if no existing value in database
    if (!this.hasExistingGovernanceValue) {
      this.selectedGovernanceApplicability = this.selectedQA ? 'Yes' : 'No';
    }
  }

  onGovernanceApplicabilityChange() {
    // User made an explicit choice; stop auto-deriving it from DevEx Partner selection
    this.hasExistingGovernanceValue = true;
  }

}
