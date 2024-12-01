import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ReportsSPParamsModel } from '../../../models/report-model';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { enumRoles } from '../../../Shared/enum';
import { ActivatedRoute } from '@angular/router';
import { LayoutService } from '../layout.service';
import { ProjectsModel } from '../../../models/projects-model';
import { environment } from '../../../../environments/environment';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MandatoryReportModel } from '../../../models/mandatory-report';





@Component({
  selector: 'app-mandatory-training-report',
  templateUrl: './mandatory-training-report.component.html',
  styleUrls: ['./mandatory-training-report.component.scss']
})
export class MandatoryTrainingReportComponent implements OnInit {

  paramData: ReportsSPParamsModel[] = [];

  dataSource: MatTableDataSource<MandatoryReportModel>;


  @ViewChild('TABLE') table: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumnsTab = ['index', 'proj_nm', 'emp_name', 'allocation_End_Date', 'quality_spoc', 'fundamentals_of_Quality_Certification', 'hipaA_Internal_Compliance_Certification', 'information_Security_Awareness_Certification', 'ohsaS_Internal_Certification', 'pcI_DSS_Compliance_Certification', 'gdpR_Certification', 'secure_Coding_OWASP_Certification', 'infrastructure_Overview_Certification', 'general_Compliance_and_Combating_Certification', 'continual_Improvement_Awareness_Certification'];

  finalData: MandatoryReportModel[] = [];

  input_customerid: string;
  allproj: boolean = false;
  projNames: ProjectsModel[];
  input_projectid: string[] = [];
  startDate: Date;
  endDate: Date;
  showTable: boolean = false;
  showGetDetails: boolean = false;
  _loading: boolean = false;
  generateResults: boolean = false;
  date = new Date();

  financeYearStart: number;
  params: Params = { starDate: new Date(), endDate: new Date(), custId: "0", projId: [] };

  constructor(private _util: myUtility, private _appservice: AppsService, private route: ActivatedRoute, public _layoutService: LayoutService, private _http: Http) { }


  ngOnInit() {


    this.showGetDetails = false;
    this.showTable = false;

    let role = localStorage.getItem('role');
    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;

    this.route.params.subscribe(params => {
      this.input_customerid = params['custid'];
      this._layoutService.selectedCust = this.input_customerid;
    });

    this.route.params.subscribe(params => {
      if (params['projid'] != undefined && params['projid'] != null)
        this.input_projectid.push(params['projid']);

    });
    let month = '';
    this.route.params.subscribe(params => {
      if (params['month'] != undefined && params['month'] != null)
        month = params['month'];

    });
    let year = this._util.Year();
    this.route.params.subscribe(params => {
      if (params['year'] != undefined && params['year'] != null)
        year = +params['year'];
    });

    if (this.date.getMonth() <= 2)
      this.financeYearStart = this.date.getFullYear() - 1;
    else
      this.financeYearStart = this.date.getFullYear();

    if (month != '') {
      this.startDate = new Date(year, this._util.getMonthNum(month), 1);
      this.generateResults = true;
    }
    else
      this.startDate = new Date(this.financeYearStart + "-04-" + "01");



    this.endDate = new Date();

    this.getAllProjectsFromCustomer();

  }

  ngOnchanges() {

  }

  bindData() {
    if (this.startDate > this.endDate)
    {
      alert("Please select end date greater than start date");
      return;
    }
    this.showTable = false;
    this.showGetDetails = false;
    this._loading = true;

    if (this.input_projectid == undefined)
      this.input_projectid = [];

    this.params.starDate = new Date(this.startDate);
    this.params.endDate = new Date(this.endDate);
    this.params.custId = this.input_customerid;
    this.params.projId = this.input_projectid;

    this.service_dispSPResult(this.params);

  }




  service_dispSPResult(outparams: Params) {
    this.finalData = [];

    this._appservice.GetMandatoryTrainingDetails(outparams.starDate.toLocaleDateString(), outparams.endDate.toLocaleDateString(), outparams.custId, outparams.projId).subscribe(data => {

      this.finalData = data;

      this.dataSource = new MatTableDataSource(this.finalData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      this.showTable = true;
      this.showGetDetails = true;
      this._loading = false;
    },
      error => {
        this.showGetDetails = true;
        this._loading = false;
        this._util.serviceError(error);
      });
  }


  ExportTOExcel() {
    let getdate = new Date();
    let fileName = 'Report_' + getdate.toLocaleString();
    this._util.exportToExcel(this.table.nativeElement, fileName);
  }

  getAllProjectsFromCustomer() {
    this._appservice.GetCustomerProjectsName(this.input_customerid, this.allproj).subscribe(
      data => {
        this.projNames = data;
        if (this.projNames != undefined && this.projNames != null && this.projNames.length > 0) {

        }
        this.showGetDetails = true;
        this._loading = false;
        if (this.generateResults) {
          this.bindData();

        }
      },
      error => {
        this.showGetDetails = true;
        this._loading = false;
        this._util.serviceError(error);
      }
    )

  }

  service_getAllparamsbyId() {


    this._appservice.getSpParams(14).subscribe(data => {

      this.paramData = data;

      this.paramData.forEach(x => {
        if (x.paraM_NAME == "CustomerId") {
          x.paraM_VALUE = null;
        }
      });

    },
      error => {

        this._util.serviceError(error);
      });
  }

  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    headers.append('empId', localStorage.getItem('empid'));

    return headers;
  }

  onProjectChange() {

  }

}

class Params {
  starDate: Date;
  endDate: Date;
  custId: string;
  projId: string[];
}
