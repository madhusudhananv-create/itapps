import { Component, OnInit, NgModule, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field'
import { CommonModule } from '@angular/common';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { AccessControl } from '../../../Shared/accessControl';




@Component({
  selector: 'app-qspoc-popup',
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
  editmode: any = false;
  overallDetails: any;
  scopeList: any;
  isoStandardList: any;
  isLoading: boolean = false;
  OverallScopes: any;
  OverallProjectScopes: any;
  @ViewChild('searchInput') searchInput: ElementRef;

  constructor(public _appservice: AppsService,
    public _util: myUtility,
    public dialogRef: MatDialogRef<QSPOCPopupComponent>,
    public _access: AccessControl,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.getProjectInputDetails();
    this.getProjectCertificationScope();
    this.projname = this.data.projname;
    this.custname = this.data.custname;
    this.custid = this.data.custid;
    this.projids = this.data.projids;
  }

  SaveDetails() {
    this.isLoading = true;
    if ((this.selectedQA == undefined || this.selectedQA == '' || this.selectedQA == null) &&
      this.selectedScope.length == 0 && this.selectedIso.length == 0) {
      alert("Please select any values");
      this.GetProjectHeadsByID(this.projids);
      return false;
    }
    else {
      let params = {
        projecT_ID: this.projids,
        qA_SPOC: this.selectedQA,
        certificatioN_SCOPE: this.selectedScope,
        isO_STANDARD: this.selectedIso
      };
      this._appservice.UpdateProjectDetails(params).subscribe(data => {
        alert("Updated successfully");
        this.GetProjectHeadsByID(this.projids);
        this.Cancel_onClick();
        this.isLoading = false;
      },
        (error) => {
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

  GetProjectHeadsByID(projID) {
    this.isLoading = true;
    this._appservice.GetProjectHeadsByID(projID).subscribe(data => {
      this.result = data;
      this.csM_NAME = this.result.csM_NAME;
      this.selectedQA = this.result.qa;
      if (this.result.isO_STANDARDS != null && this.result.isO_STANDARDS != undefined) {
        let iso = this.result.isO_STANDARDS.split(',').map(Number);
        this.selectedIso = this.isoStandardList.filter(x => iso.includes(x.id)).
          map(selectedItem => selectedItem.id);
        this.filterScopes(this.selectedIso);
      }
      if (this.result.certificatioN_SCOPES != null && this.result.certificatioN_SCOPES != undefined) {
        let scope = this.result.certificatioN_SCOPES.split(',').map(Number);
        this.selectedScope = this.scopeList.filter(x => scope.includes(x.id)).
          map(selectedItem => selectedItem.id);
      }
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
      this._util.serviceError(error);
    },
      () => { }
    );
  }

  getProjectInputDetails() {
    this._appservice.GetProjectDetails().subscribe(data => {
      this.overallDetails = data;
      this.QAEmployeeList = this.overallDetails.qaList;
      this.scopeList = this.overallDetails.certificationScopeList;
      this.isoStandardList = this.overallDetails.isoStandardList;
    }, error => { this._util.serviceError(error); });
  }

  getProjectCertificationScope() {
    this._appservice.getProjectCertificationScope().subscribe(data => {
      this.OverallProjectScopes = data;
      this.GetProjectHeadsByID(this.projids);
    }, error => { this._util.serviceError(error); });
  }

  filterScopes(selectedIso) {
    if (this.OverallProjectScopes != null && this.OverallProjectScopes != undefined && this.OverallProjectScopes.length > 0) {
      let filteredScopes = this.OverallProjectScopes.filter(x => selectedIso.includes(x.isO_STANDARD_ID));
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
        let filteredScopes = this.OverallScopes.map(scope => ({
          ...scope,
          items: scope.items.filter(item => item.scopE_NAME.toLowerCase().includes(value.toLowerCase()))
        })).filter(scope => scope.items.length > 0);
        this.OverallScopes = filteredScopes;
      }
    }
  }

}
