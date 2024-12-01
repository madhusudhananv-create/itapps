import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { LayoutService } from '../layout.service';
import { BvdEntryService } from '../../bvd-entry/services/bvd-entry.service';
import { FailureModeInput } from '../../../models/fmea/fm-project-mapping';
import { enumRoles } from '../../../Shared/enum';

@Component({
  selector: 'app-fmea-project-setup',
  templateUrl: './fmea-project-setup.component.html',
  styleUrls: ['./fmea-project-setup.component.scss']
})
export class FmeaProjectSetupComponent implements OnInit {

  taskList: any[];
  menuToggleStatus: boolean;
  sub: any;
  input_customerid: string;
  projNames: any[] = [];
  serviceAreas: any[] = [];
  processes: any[] = [];
  ServiceLevelList: any[] = [];
  fmeafilter = new FailureModeInput();
  mappings: any[] = [];
  input_projectid: string; 
  allproj: boolean = false;

  constructor(private route: ActivatedRoute, private _util: myUtility, private _appService: AppsService,
    public _layoutService: LayoutService) { }

  ngOnInit() {
    let role = localStorage.getItem('role');
    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;

    this.sub = this.route.params.subscribe(params => {
      this.input_customerid = params['custid'];
      this._layoutService.selectedCust = this.input_customerid;

      if (params['projid'] != undefined && params['projid'] != null) {
        this.input_projectid = params['projid'];
        this._layoutService.selectedProj = this.input_projectid;
      }
    });
    this.getAllProjectsFromCustomer();
  }

  getAllProjectsFromCustomer() {
    this._appService.GetCustomerProjectsName(this.input_customerid, true).subscribe(
      data => {
        this.projNames = data;
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }


  onMenuToggleChange(value: boolean) {
    this.menuToggleStatus = value;
  }

  onProjectChange() {
    this._appService.getServiceAreasForProject(this.fmeafilter.projectid).subscribe(data => {
      this.serviceAreas = data;
    },
      error => {
        this._util.serviceError(error);
      })
  }

  onServiceAreaChange() {
    this.Service_GetServiceLevelList();
    this.service_GetProcesses();
  }

  service_GetProcesses() {
    this._appService.GetAllProcessesByServiceArea(this.fmeafilter.serviceareaId).subscribe(data => {
      this.processes = data;
    },
      error => {
        this._util.serviceError(error);
      })
  }

  getApplicableFailures() {
    if (
      !this.fmeafilter ||
      Object.values(this.fmeafilter).every((value) => value === undefined || value === null)
    ) {
      alert("Please select a project");
      return;
    }


    this._layoutService.GetProjectSpecificFailures(this.fmeafilter).subscribe(data => {
      this.mappings = data;
      this._layoutService.approvedMappings = this.mappings.filter(x => x.mappinG_ID > 0 && x.isapproved == true);

    },
      error => {
        this._util.serviceError(error);
      })
  }

  Service_GetServiceLevelList() {
    this._appService.GetServiceLevelIdentifier(this.fmeafilter.serviceareaId).subscribe(data => {
      this.ServiceLevelList = data;
    }, error => { this._util.serviceError(error); });
  }

  onProcessChange() {
    if (!this.fmeafilter.serviceareaId || this.fmeafilter.serviceareaId == 0)
      return;

    if (!this.fmeafilter.processId || this.fmeafilter.processId == 0)
      return;

    if (!this.fmeafilter.servicelevel || this.fmeafilter.servicelevel == 0)
      return;

    this.Service_FMEATaskList();
  }

  Service_FMEATaskList() {

    this._appService.GetFMEATasks(this.fmeafilter.serviceareaId, this.fmeafilter.processId, this.fmeafilter.servicelevel).subscribe(data => {
      this.taskList = data;


    }, error => { this._util.serviceError(error); });
  }
}
