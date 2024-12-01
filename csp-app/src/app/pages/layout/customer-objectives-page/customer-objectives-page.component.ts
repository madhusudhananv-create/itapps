import { Component, OnInit } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { myUtility } from '../../../Shared/myUtility';
import { environment } from '../../../../environments/environment';
import { DeliveryModel, DeliveryDetailsModel, DateRangeModel } from '../../../models/delivery-model';
import { AppsService } from '../../../Services/apps.service';
import { enumDateRange, enumRoles } from '../../../Shared/enum';
import { AccessControl } from '../../../Shared/accessControl';
import { LayoutService } from '../layout.service';
import { ActivatedRoute } from '@angular/router';
import { ProjectsModel } from '../../../models/projects-model';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ClientDetailsModel } from '../../../models/client-details-model';
import { RagsModel } from '../../../models/rags-model';
import { ScopeModel } from '../../../models/scope-Model';
import { ResourceModel } from '../../../models/resource-model';
import { ProcessModel } from '../../../models/process-model';
import { RiskModel } from '../../../models/risk-model';
import { IssueModel } from '../../../models/issue-model';
import { InnovationModel } from '../../../models/innovation-model';
import { SuccessModel } from '../../../models/success-model';
import { ValueaddModel } from '../../../models/valueadd-model';
import { ActionitemModel } from '../../../models/actionitem-model';
import { ReportDetailsModel } from '../../../models/report-details-model';

@Component({
  selector: 'app-customer-objectives-page',
  templateUrl: './customer-objectives-page.component.html',
  styleUrls: ['./customer-objectives-page.component.scss']
})
export class CustomerObjectivesPageComponent implements OnInit {

  private sub: any;
  input_projectid: string;
  input_customerid: string;
  _loading: boolean = false;
  selectedDatanew:any[];
  projNames: ProjectsModel[];
  allproj: boolean = false;
  empid : string;

  constructor(private route: ActivatedRoute, private _access: AccessControl, private _http: Http, private _util: myUtility, private _appservice: AppsService, public _layoutService: LayoutService,
    private _spinner: Ng4LoadingSpinnerService) { }

  ngOnInit() {

    let role = localStorage.getItem('role');
    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;

    this.sub = this.route.params.subscribe(params => {
      this.input_customerid = params['custid'];
      this._layoutService.selectedCust = this.input_customerid;
    });

    this.getAllProjectsFromCustomer();
  
  }

  getAllProjectsFromCustomer() {
    this._appservice.GetCustomerProjectsName(this.input_customerid, this.allproj).subscribe(
      data => {
        this.projNames = data;
        if(this.projNames!=undefined && this.projNames!=null && this.projNames.length>0)
        { 
            this.input_projectid = this.projNames[0].proJ_ID;
        }

      },
      error => {
        this._util.serviceError(error);
      }
    )
  }
}
