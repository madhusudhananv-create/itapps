import { Component, OnInit, Optional, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AppsService } from '../../services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { MOM, MOM_DETAIL } from '../../shared/models/mom.model';

export interface CustomerProjectIds {
  rowId: number;
  custId: number;
  projId: number;
}

export class EmpInfoModel {
  frsT_NM: string = '';
  emP_ID: number = 0;
}

@Component({
  selector: 'app-minutesofmeeting',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatProgressBarModule
  ],
  templateUrl: './minutesofmeeting.component.html',
  styleUrls: ['./minutesofmeeting.component.scss']
})
export class MinutesofmeetingComponent implements OnInit {
  checked: boolean = false;
  mom: MOM = new MOM();
  editmom: MOM = new MOM();
  meetings: any[] = [];
  meetingscust: any[] = [];
  empInfo: EmpInfoModel[][] = [];
  project_list: any[] = [];
  customer_list: any[] = [];
  selectedMoMId: number = 0;
  updatemode: boolean = false;
  disablediv: boolean = false;
  enableDelete: boolean = false;
  selectedYear: number = 0;
  selectedMonth: string = '';
  allproj: boolean = false;
  _loading: boolean = false;
  custId: number = 0;

  constructor(
    private _service: AppsService,
    public _util: MyUtility,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.checked = data?.checked || false;
    this.custId = data?.custId || 0;
  }

  ngOnInit() {
    this.mom.moM_ITEMS = [];
    this.mom.moM_ITEMS.push(new MOM_DETAIL());
    this.mom.moM_ITEMS.push(new MOM_DETAIL());
    this.mom.moM_ITEMS.push(new MOM_DETAIL());
    
    const date = new Date();
    this.selectedMonth = this.getMonthAbr(date.getMonth());
    this.selectedYear = date.getFullYear();
    
    // Load customers and projects
    this.loadCustomers();
    this.loadProjects();
    
    this.reloadMoMDetail();
  }

  loadCustomers() {
    // Load customer list - you may need to implement getCustomers in AppsService
    // For now using empty array
    this.customer_list = [];
  }

  loadProjects() {
    // Load project list - you may need to implement getProjects in AppsService
    // For now using empty array
    this.project_list = [];
  }

  onProjectChange(rowId: number, projectId: number) {
    if (projectId !== 0) {
      this.GetProjectresource(rowId, [projectId]);
    }
  }

  getMonthAbr(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month] || 'Jan';
  }

  reloadMoMDetail() {
    const date = this.selectedMonth + ' ' + this.selectedYear;
    this.SearchMoMOnDate(date, 0);
  }

  SearchMoMOnDate(date: string, projId: number) {
    this._loading = true;
    this._service.getMomsWithDate(date, this.custId).subscribe({
      next: (data: any) => {
        this._loading = false;
        this.meetings = data;
        this.meetingscust = data;
      },
      error: (error: any) => {
        this._loading = false;
        console.error('Error loading MoMs:', error);
      }
    });
  }

  getMoMDetailbyMomId() {
    if (this.selectedMoMId === 0) {
      return;
    }
    
    this._loading = true;
    this._service.GetMoMbyMoMId(this.selectedMoMId, 0, this._util.IsGAVS()).subscribe({
      next: (data: any) => {
        this._loading = false;
        this.mom = data;
        this.updatemode = true;
        this.disablediv = true;
        this.enableDelete = true;
        
        for (let i = 0; i < this.mom.moM_ITEMS.length; i++) {
          const item = this.mom.moM_ITEMS[i];
          if (item.projecT_ID !== 0) {
            this.GetProjectresource(i, [item.projecT_ID]);
          }
        }
      },
      error: (error) => {
        this._loading = false;
        console.error('Error loading MoM details:', error);
      }
    });
  }

  AddNewRow() {
    this.mom.moM_ITEMS.push(new MOM_DETAIL());
    this.empInfo.push([]);
  }

  GetProjectresource(rowId: number, project_list: number[]) {
    this._loading = true;
    this._service.getProjectResourcebyProjIds(project_list).subscribe({
      next: (data: any) => {
        this._loading = false;
        if (!this.empInfo[rowId]) {
          this.empInfo[rowId] = [];
        }
        this.empInfo[rowId] = data;
      },
      error: (error) => {
        this._loading = false;
        console.error('Error loading project resources:', error);
      }
    });
  }

  SaveMoM(momForm: any, status: string) {
    if (!momForm.valid) {
      this._util.showWarningPopup('Please fill all required fields', 'Validation Error');
      return;
    }

    const emptyData = this.getEmptyData();
    if (status === 'submit' && emptyData.length > 0) {
      this._util.showWarningPopup('Please fill all data in MoM items before submitting', 'Validation Error');
      return;
    }

    this._loading = true;
    this.mom.status = status === 'save' ? 'Draft' : 'Submit';
    this.service_addMOMDetails(this.mom);
  }

  UpdateMoM(momForm: any, status: string) {
    if (!momForm.valid) {
      this._util.showWarningPopup('Please fill all required fields', 'Validation Error');
      return;
    }

    const emptyData = this.getEmptyData();
    if (status === 'submit' && emptyData.length > 0) {
      this._util.showWarningPopup('Please fill all data in MoM items before submitting', 'Validation Error');
      return;
    }

    this._loading = true;
    this.mom.status = status === 'update' ? 'Draft' : 'Submit';
    this.service_updateMoMDetails(this.mom);
  }

  service_addMOMDetails(data: MOM) {
    this._service.addMOMDetails(data).subscribe({
      next: (response: any) => {
        this._loading = false;
        if (response.status === 'Success') {
          this._util.showSuccessPopup('MoM saved successfully', 'Success');
          this.resetForm();
        } else {
          this._util.showWarningPopup('Error saving MoM: ' + response.message, 'Error');
        }
      },
      error: (error) => {
        this._loading = false;
        console.error('Error saving MoM:', error);
        this._util.showError('Error saving MoM');
      }
    });
  }

  service_updateMoMDetails(data: MOM) {
    this._service.updateMoMDetails(data).subscribe({
      next: (response: any) => {
        this._loading = false;
        if (response.status === 'Success') {
          this._util.showSuccessPopup('MoM updated successfully', 'Success');
          this.resetForm();
        } else {
          this._util.showWarningPopup('Error updating MoM: ' + response.message, 'Error');
        }
      },
      error: (error) => {
        this._loading = false;
        console.error('Error updating MoM:', error);
        this._util.showError('Error updating MoM');
      }
    });
  }

  OnChange(event: any) {
    this.allproj = event.checked;
  }

  getEmptyData(): number[] {
    const emptyRows: number[] = [];
    
    for (let i = 0; i < this.mom.moM_ITEMS.length; i++) {
      const item = this.mom.moM_ITEMS[i];
      if (!item.discussioN_POINTS || !item.actioN_ITEM || !item.priority || 
          !item.responsibility || !item.targeT_DATE || item.projecT_ID === 0) {
        emptyRows.push(i);
      }
    }
    
    return emptyRows;
  }

  resetForm() {
    this.mom = new MOM();
    this.mom.moM_ITEMS = [];
    this.mom.moM_ITEMS.push(new MOM_DETAIL());
    this.mom.moM_ITEMS.push(new MOM_DETAIL());
    this.mom.moM_ITEMS.push(new MOM_DETAIL());
    
    this.updatemode = false;
    this.disablediv = false;
    this.enableDelete = false;
    this.selectedMoMId = 0;
    this.empInfo = [];
    
    this.reloadMoMDetail();
  }
}
