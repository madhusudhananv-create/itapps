import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import { MatDialog, MatDialogConfig, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { AppsService } from '../../../Services/apps.service';
import { AccessControl } from '../../../Shared/accessControl';
import { myUtility } from '../../../Shared/myUtility';
import { SharedService } from '../../../Shared/shared.service';
import { AppreciationModelExt } from '../../../models/appreciation-model';
import { ProjectsModel } from '../../../models/projects-model';
import { enumRoles } from '../../../Shared/enum';
import { EmpInfoModel } from '../../../models/emp-info-model';
import { EntityBaseInfoComponent } from '../entity-base-info/entity-base-info.component';

@Component({
  selector: 'app-appreciation',
  templateUrl: './appreciation.component.html',
  styleUrls: ['./appreciation.component.scss']
})
export class AppreciationComponent implements OnInit {
  result: any = [];
  tempData: any = [];
  selectedCust: string;
  private sub: any;
  selectedProject: string = "All Projects";
  selectedPortfolio: string = "All Portfolios";
  editmode: boolean = false;
  readonlymode: boolean = true;
  projects: string[] = []
  projNames: ProjectsModel[];
  editItem: AppreciationModelExt = new AppreciationModelExt;
  dataSource = new MatTableDataSource(this.result);
  @ViewChild('TABLE') table: ElementRef;
  displayedColumns = ['index', 'portfoliO_NAME', 'proJ_NM', 'appreciateD_BY', 'designation', 'comments', 'recipienT_NM', 'receiveD_DATE', 'info', 'edit', 'delete'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatSort) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  allcust: boolean = false;
  allproj: boolean = false;
  ownerList: EmpInfoModel[];

  constructor(private route: ActivatedRoute, private _appservice: AppsService, private _shared: SharedService, private _util: myUtility, private changeDetectorRefs: ChangeDetectorRef, public _access: AccessControl, public dialog: MatDialog) { }

  ngOnInit() {
    let role = localStorage.getItem('role');
    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;

    this.sub = this.route.params.subscribe(params => {
      this.selectedCust = params['custid'];
      if (params['projid'] != undefined) {
        this._shared.selectedProjects.push(params['projid']);
      }
    });

    if (!this._util.IsPremier(this.selectedCust))
      this.displayedColumns = ['index', 'proJ_NM', 'appreciateD_BY', 'designation', 'comments', 'recipienT_NM', 'receiveD_DATE', 'info', 'edit', 'delete'];
    this.getAppreciationDetails();
    this.getAllProjectsFromCustomer();

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  getAppreciationDetails() {

    this._appservice.getAppreciationDetails(this.selectedCust, this.allproj).subscribe(
      data => {
        this.result = data;
        this.tempData = data;
        // if (this.result.length == 0)
        //   this.bShowFilter = false;
      },
      error => { },
      () => {
        //this.filter_projectPortfolio(this.result);

        if (this._util.IsPremier(this.selectedCust)) {
          if (this._shared.savedportfolioId != 0)
            this.tempData = this.tempData.filter(x => x.portfoliO_ID == this._shared.savedportfolioId);

          if (this._shared.savedportfolioId != 0)
            this.selectedPortfolio = this.tempData[0].portfoliO_NAME;
          else
            this.selectedPortfolio = "All Portfolios";
        }
        this.RefreshTableForProject(this.tempData);

      });
  }

  getAllProjectsFromCustomer() {
    let role = localStorage.getItem('role');

    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allcust = true;
    else
      this.allcust = false;

    this._appservice.GetCustomerProjectsName(this.selectedCust, this.allcust).subscribe(
      data => {
        this.projNames = data;
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  RefreshTableForProject(data) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ExportTOExcel() {
    let name = 'Appreciation Details'
    this._util.exportToExcel(this.table.nativeElement, name)
    // const ws: XLSX.WorkSheet=XLSX.utils.table_to_sheet(this.table.nativeElement);
    // const wb: XLSX.WorkBook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // /* save to file */
    // XLSX.writeFile(wb, 'ActionItem.xlsx');

  }

  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
    this.RefreshTable();
    this.getRecipientList();
  }

  RefreshTable() {
    this.dataSource = new MatTableDataSource<any>(this.result);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getotherDetails() {
    this.getPortfolioName();
    this.getRecipientList();
  }

  getPortfolioName() {
    this._appservice.getPortfolioName(this.editItem.proJ_ID).subscribe(
      data => {
        this.editItem.portfoliO_NAME = data;
      }
    )
  }

  getRecipientList() {
    debugger;
    if (this.editItem.proJ_ID == undefined || this.editItem.proJ_ID == null) {
      return;
    }
    this._appservice.getAuditeeDetails(this.selectedCust, this.editItem.proJ_ID).subscribe(
      data => {
        this.ownerList = data;
      },
      error => { }
    )
  }

  getprojectsNameForAPortfolio(portid) {
    this.projects = this.result.filter(x => x.portfoliO_ID == portid).map(x => x.proJ_NM).filter((x, i, a) => a.indexOf(x) == i).sort();
    this.projects.unshift("All Projects");
  }

  SubmitForm(isValid) {

    debugger;
    if (!isValid) {
      alert("Please enter valid values for required fields");
      return;
    }
    if (this.editItem.id === 0 || this.editItem.id === undefined) {
      this.editItem.cusT_ID = this.selectedCust;
      this.editItem.proJ_NM = this.projNames.find(x => x.proJ_ID == this.editItem.proJ_ID).proJ_NM;
      this.editItem.createD_BY = localStorage.getItem('empid');
      this.editItem.createD_DATE = new Date();
      this.editItem.updateD_BY = localStorage.getItem('empid');
      this.editItem.updateD_DATE = new Date();
      this.editItem.receiveD_DATE = this._util.setLocaleDate(this.editItem.receiveD_DATE);
      this.updateAppreciation(this.editItem);
      this.getAppreciationDetails();
    }
    else {
      this.editItem.receiveD_DATE = this._util.setLocaleDate(this.editItem.receiveD_DATE);
      this.editItem.updateD_BY = localStorage.getItem('empid');
      this.editItem.updateD_DATE = new Date();
      this.updateAppreciation(this.editItem);

    }
    this.neweditItem();
    this.changeDetectorRefs.detectChanges();
  }

  getProjectName() {
    let projectName;
    projectName = this.projNames.find(x => x.proJ_ID == this.editItem.proJ_ID);
    if (projectName != undefined && projectName != null)
      this.editItem.proJ_NM = projectName.proJ_NM
  }

  updateAppreciation(item) {
    this._appservice.updateAppreciation(item).subscribe(data => {
      alert("Data Saved Successfully");
      this.readonlymode = true;
      this.editmode = false;
      this.getAppreciationDetails();
    },
      (error) => {
        this._util.serviceError(error);
      })
  }

  neweditItem() {
    this.editItem = new AppreciationModelExt();
  }

  EditRow_onClick(element) {
    this.editItem = Object.assign({}, element);
    this.Edit_onClick()
  }
  DeleteRow_onClick(element): void {
    if (confirm('Are you sure you want to delete the record?')) {
      this._appservice.deleteAppreciation(element).subscribe(data => { }, error => { this._util.serviceError(error); },
        () => {
          alert("Deleted Successfully");
          this.getAppreciationDetails();
          //this.RefreshTableForProject(this.result);
          //this.filterData(this.selectedPortfolio, this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
        });

    }
    else {

    }
  }

  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    // this.service_getActionItems();
    this.neweditItem();
    this.getAppreciationDetails();
  }
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;

    // k >= 65 && k <= 90 || // A-Z
    //         k >= 97 && k <= 122 || // a-z
    //         k >= 48 && k <= 57; // 0-9 keyCode=49,

    if (charCode == 40 || charCode == 41 || charCode == 44 || charCode == 46 || charCode == 20 || charCode == 188 || charCode == 32 || charCode == 8 || (charCode >= 44 && charCode <= 57) || charCode >= 97 && charCode <= 122 || charCode >= 65 && charCode <= 90 || charCode == 32) {
      return true;
    }
    return false;
  }
  OpenEntityInfoPopup(element) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      entity: element,
      entityType: 'appreciation',
      header: 'Appreciation',
      project: element.proJ_NM
    }

    dialogConfig.maxWidth = "80%",
      dialogConfig.maxHeight = 'fit-content',
      dialogConfig.height = 'auto'

    const dialogRef = this.dialog.open(EntityBaseInfoComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    });
  }
}
