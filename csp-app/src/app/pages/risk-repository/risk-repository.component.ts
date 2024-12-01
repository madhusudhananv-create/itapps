import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppsService } from '../../Services/apps.service';
import { AccessControl } from '../../Shared/accessControl';
import { myUtility } from '../../Shared/myUtility';
import { SharedService } from '../../Shared/shared.service';
import { MatPaginator, MatTableDataSource, MatSort, MatTableModule } from '@angular/material';
@Component({
  selector: 'app-risk-repository',
  templateUrl: './risk-repository.component.html',
  styleUrls: ['./risk-repository.component.scss']
})
export class RiskRepositoryComponent implements OnInit {
  result: any[] = [];
  rst: any = [];
  serviceTowerList: any = [];
  editItem: any;
  editmode: boolean = false;
  readonlymode: boolean = true;
  filterCriteria: any;
  filteredData: any[];
  selectedServiceArea: any[] = [];
  ServiceAreaList: any[] = [];
  selectedServiceTowerIds: number[] = [];
  dataSource = new MatTableDataSource();
  @ViewChild("TABLE") table: ElementRef;
  displayedColumns = [
    "sno",
    "description",
    "impact",
    "likelihood",
    "consequences",
    "risktrtment",
    "serviceTower",
    "threats",
    "vulnerabilities",
    "edit",
    "delete",
  ];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  disableConfig: boolean = false;
  searchValueSAL: any;
  
  @ViewChild(MatSort) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  constructor(
    private route: ActivatedRoute, private _appservice: AppsService, private _shared: SharedService, private _util: myUtility, public _access: AccessControl
  ) {
  }

  ngOnInit() {

    this.GetServiceTower();
    this.GetAllRiskFromRepository();
  }

  GetServiceTower() {
    this._appservice.getServiceAreaList().subscribe(
      (data) => {
        this.serviceTowerList = data;
        this.ServiceAreaList = data;

      },
      (error) => {
        this._util.serviceError(error);
      }
    );
  }
  GetAllRiskFromRepository() {
    this._appservice.GetAllRiskFromRepository().subscribe(
      (data) => {
        this.result = data;
        this.RefreshTable(this.result);

      },
      (error) => {
        this._util.serviceError(error);
      }
    );
  }

  RefreshTable(data) {
    setTimeout(() => {
      this.dataSource = new MatTableDataSource<any>(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    },);

  }

  Filter_onChange($event) {
    this.filteredData = $event;
    this.filterCriteria = $event.criteria;
    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.result);
    this.dataSource = new MatTableDataSource(this.filteredData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  showAll($event) {

  }
  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.GetAllRiskFromRepository();
  }
  Edit_onClick(flag: any = 0) {
    if (flag == 1) {
      this.disableConfig = true;
    }
    else {
      this.selectedServiceArea = [];

      this.editItem = {

      };
      this.disableConfig = false;
    }
    this.readonlymode = false;
    this.editmode = true;
    this.RefreshTable(this.result);
  }

  EditRow_onClick(element) {
    this.editItem = Object.assign({}, element);
    this.selectedServiceArea = this.ServiceAreaList.filter(area => element.servicE_TOWER_LIST.includes(area.id));
    this.Edit_onClick(1);
  }

  getServiceIDs(id) {
    const associatedServiceTowers = this.rst.filter(x => x.risK_REPOSITORY_ID === id);
    this.selectedServiceTowerIds = associatedServiceTowers.map(item => item.servicE_TOWER_ID);
    this.selectedServiceArea = this.ServiceAreaList.filter(x => this.selectedServiceTowerIds.includes(x.id));
  }

  SubmitForm(isValid) {
    if (!isValid) {
      alert("Please enter valid values for required fields");
      return;
    }

    let body = this.saveReqBody();
    body.id = body.id === null || body.id === undefined ? 0 : body.id;
    if (body.risK_DESCRIPTION != undefined) {
      body.risK_DESCRIPTION = body.risK_DESCRIPTION.trim();
      body.risK_DESCRIPTION = body.risK_DESCRIPTION.replace(/\s+/g, ' ');

    }
    if (body.risK_IMPACT != undefined) {
      body.risK_IMPACT = body.risK_IMPACT.trim();
      body.risK_IMPACT = body.risK_IMPACT.replace(/\s+/g, ' ');
    }
    const specialCarPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/]+$/;
    const numberPattern = /^[0-9]+$/;
    if (body.risK_DESCRIPTION != undefined && (specialCarPattern.test(body.risK_DESCRIPTION.trim()) || numberPattern.test(body.risK_DESCRIPTION.trim()))) {
      alert('Invalid Risk Description - Please enter alphanumeric or numeric values along with special characters');
      return;
    }

    if (body.risK_IMPACT != undefined && (specialCarPattern.test(body.risK_IMPACT.trim()) || numberPattern.test(body.risK_IMPACT.trim()))) {
      alert('Invalid Risk Impact - Please enter alphanumeric or numeric values along with special characters');
      return;
    }
    if (body.risK_DESCRIPTION === '') {
      alert('Invalid Risk Description - Please enter alphanumeric or numeric values along with special characters');
      return;
    }
    if (body.risK_IMPACT === '') {
      alert('Invalid Risk Impact - Please enter alphanumeric or numeric values along with special characters');
      return;
    }
    this.AddUpdateRiskRepo(body);
  }


  AddUpdateRiskRepo(item) {
    this._appservice.AddUpdateRiskRepo(item).subscribe(
      (data) => {
        alert("Data Saved Successfully");
        this.readonlymode = true;
        this.editmode = false;
        this.GetAllRiskFromRepository();
      },
      (error) => {
        this._util.serviceError(error);
      }
    );
  }

  saveReqBody() {
    let body: RiskRepositoryModel = new RiskRepositoryModel();
    return (body = {
      id: this.editItem.id,
      risK_DESCRIPTION: this.editItem.risK_DESCRIPTION,
      risK_IMPACT: this.editItem.risK_IMPACT,
      likelihood: this.editItem.likelihood,
      isactive: true,
      risK_TREATMENT_STRATEGY: this.editItem.risK_TREATMENT_STRATEGY,
      consequences: this.editItem.consequences,
      threats: this.editItem.threats,
      vulnerabilities: this.editItem.vulnerabilities,
      servicE_TOWER_LIST: this.selectedServiceArea.map(item => item.id)
    });
  }

  DeleteRow_onClick(element) {
    if (confirm("Are you sure you want to delete the record?")) {
      this._appservice.DeleteRiskFromRepository(element).subscribe(
        (data) => {
          this.GetAllRiskFromRepository();
        },
        (error) => {
          this._util.serviceError(error);
        },

        () => {
          alert("Deleted Successfully");
          this.GetAllRiskFromRepository();

        }
      );
    }
  }
}

export class RiskRepositoryModel {
  id: number;
  risK_DESCRIPTION: string;
  risK_IMPACT: string;
  likelihood: number;
  consequences: number;
  risK_TREATMENT_STRATEGY: string;
  isactive: boolean;
  servicE_TOWER_LIST: number[];
  threats: any;
  vulnerabilities: string;
}
