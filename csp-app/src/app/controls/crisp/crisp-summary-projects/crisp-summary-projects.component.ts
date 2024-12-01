import { Component, OnInit, Inject, Input } from '@angular/core';
import { CrispProjectSummaryModel } from '../../../models/crisp-project-summary-model';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { MatDialogConfig, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { CrispDialogValidationsComponent } from '../crisp-dialog-validations/crisp-dialog-validations.component';

@Component({
  selector: 'app-crisp-summary-projects',
  templateUrl: './crisp-summary-projects.component.html',
  styleUrls: ['./crisp-summary-projects.component.scss']
})
export class CrispSummaryProjectsComponent implements OnInit {
  @Input('ProjectIds') projectIds: string[];
  @Input('month') month: string;
  @Input('year') year: number;
  @Input('selectedProject') selectedProject : string;
  summary: CrispProjectSummaryModel[] = [];
  details = [];
  _loading: boolean = false;
  constructor(private _util: myUtility, private _appservice: AppsService, public dialog: MatDialog) { }

  ngOnInit() {
    this.LoadData();
    //red - #fb8f73
    //green - #b1d57e
    //amber - #feeb84
  }
  LoadData() {
    this.service_getCrispProjectSummary(this.projectIds, this.month, this.year);
  }
  ngOnChanges() {
    this.service_getCrispProjectSummary(this.projectIds, this.month, this.year);
  }
  ShowCrispDetails(proj, category) {
    this.service_getCrispDetails(proj.projecT_ID, this.month, this.year, category);
    //alert(proj.projecT_ID);
  }
  ShowProjectCrispDetails(proj){
     
    this.service_getProjectCrispDetails(proj.projecT_ID, this.month, this.year);
  }
  showRisk(category) {
    
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      summary: this.details[0],
      category: category
    }
    const dialogRef = this.dialog.open(CrispDialogValidationsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    this._dialogOpen =false;
    });
  }
   _dialogOpen : boolean =false;
  service_getCrispProjectSummary(projectIds, month, year) {
    this._loading = true;
   
    this._appservice.GetCrispProjectSummary(projectIds, month, year).subscribe(data => {
      this.summary = data;
      this._loading = false;
      if(this.selectedProject!=undefined && this.selectedProject!="")
      {
        //this.service_getProjectCrispDetails(this.selectedProject, this.month, this.year);
      }
    }, error => {
      this._loading = false;
      this._util.serviceError(error);
    });
  }
  service_getCrispDetails(ProjectIds, month, year, category) {
   // if( this._dialogOpen  ) { alert("dailog open with category"); return;}
    if(ProjectIds ==undefined || ProjectIds =="") return;
    this._appservice.GetCrispDetails(ProjectIds, month, year).subscribe(data => {
      this.details = data;
      if (this.details.length > 0)
        this.details[0].validations = this.details[0].validations.filter(t => t.categorY_ID === category.id);
      this.showRisk(category.name);
    }, error => { this._util.serviceError(error); });
  }

  service_getProjectCrispDetails(ProjectIds, month, year) {
   // if( this._dialogOpen  ) { alert("dailog open"); return;}
    if(ProjectIds ==undefined || ProjectIds =="") return;
   
    this._appservice.GetCrispDetails(ProjectIds, month, year).subscribe(data => {
      this._dialogOpen =true;
      this.details = data;
      this.showRisk('');
    }, error => { this._util.serviceError(error);this._dialogOpen =false; });
  }

}
