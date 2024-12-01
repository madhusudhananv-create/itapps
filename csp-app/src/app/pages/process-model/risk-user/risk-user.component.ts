import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { RiskCategory, RiskCategory2, RiskOwner, ProcessSQAObjectiveNew, ProcessModelRisksNew, RiskObjectiveMappingData } from '../../../models/process-sqa-model';
import { AppsService } from '../../../Services/apps.service';
import { Observable } from 'rxjs/Observable';
import { MatInputModule, MatTableDataSource, MatPaginator } from '@angular/material';
import { myUtility } from '../../../Shared/myUtility';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ObjectiveNew, ServiceAreaModelNew } from '../../../models/audit-checklist-based-model';
import { DataSource } from '@angular/cdk/collections';
import { element } from 'protractor';
import { E } from '@angular/core/src/render3';

@Component({
  selector: 'app-risk-user',
  templateUrl: './risk-user.component.html',
  styleUrls: ['./risk-user.component.scss']
})
export class RiskUserComponent implements OnInit {
  allriskList2: RiskCategory2[] = [];
  allriskList3: RiskCategory2[] = [];
  id: number;

  constructor(private _appService: AppsService, private _util: myUtility) { }

  riskList1: RiskCategory[] = [];
  riskList2: RiskCategory2[] = [];
  riskList3: RiskCategory2[] = [];

  riskOwnerList: RiskOwner[] = [];

  selectedRisk1: number;
  //selectedRisk2 : RiskCategory2 = new RiskCategory2();
  selectedRisk2: number

  risk2name: string;
  selectedRisk3: number;
  selectedRisk: ProcessModelRisksNew = new ProcessModelRisksNew();

  risk2: RiskCategory2 = new RiskCategory2();
  risk3: RiskCategory2 = new RiskCategory2();

  ObjectivesList: ObjectiveNew[] = [];

  Objectives: ObjectiveNew[] = [];
  ServiceAreas: ServiceAreaModelNew[] = [];

  title: string;
  description: string;

  selectedOwner: RiskOwner = new RiskOwner();

  RiskModel: ProcessModelRisksNew = new ProcessModelRisksNew();
  riskDetails: ProcessModelRisksNew[] = [];
  ObjectivesMap: ObjectiveNew[] = [];
  ObjectiveString: string;
  showMapScreen: boolean = false;
  riskList: ProcessModelRisksNew[] = [];

  ServiceArea: ServiceAreaModelNew = new ServiceAreaModelNew();

  mappingData: RiskObjectiveMappingData[] = [];
  dataSource: MatTableDataSource<ObjectiveNew>;
  dataSource1: MatTableDataSource<RiskObjectiveMappingData>;
  displayedColumns = ['index', 'title', 'description', 'action'];
  displayedColumns1 = ['index', 'risK_TITLE', 'risK_DESCRIPTION', 'obJ_LIST', 'risK_CATEGORY_LEVEL1', 'risK_CATEGORY_LEVEL2',
    'risK_CATEGORY_LEVEL3', 'action'];
  @ViewChild('paginator') pagintor: MatPaginator;
  @ViewChild('paginator1') pagintor1: MatPaginator;
  viewMode: boolean = true;
  editMode: boolean = false;
  showAddScreen: boolean = false;


  ngOnInit() {
    this.Service_GetRiskCategory1List();
    this.Service_GetRiskCategory2List();
    this.Service_GetRiskCategory3List();
    this.Service_GetObjectivesList();
    this.Service_GetRiskOwnersList();
    this.Service_GetServiceAreaList();
    this.Service_GetRiskObjectivesMappingData();

  }

  Service_GetRiskList() {
    this._appService.GetProcessModelRisksNew().subscribe(data => {
      this.riskList = data;
      this.determineIfMapped();
    },
      (error) => { this._util.serviceError(error) });
  }

  determineIfMapped() {
    this.riskList.forEach(x => x.isMapped = false);
    if (this.mappingData != undefined && this.mappingData.length > 0) {
      this.riskList.forEach(x => {
        let element = this.mappingData.find(y => (y.procesS_MODEL_OBJECTIVES_NEW.length == 0 && y.procesS_MODEL_RISKS_NEW.id == x.id));
        if (element == undefined)
          x.isMapped = true;
        else
          x.isMapped = false;
      });
    }

    this.riskList.sort((a, b) => {
      return Number(a.isMapped) - Number(b.isMapped)
    });
  }

  getRiskCategory1Name(id) {
    let element = this.riskList1.find(x => x.id == id);
    if (element != undefined)
      return element.title;
  }

  getRiskCategory2Name(id) {
    let element = this.allriskList2.find(x => x.id == id);
    if (element != undefined)
      return element.title;
  }

  getRiskCategory3Name(id) {
    let element = this.allriskList3.find(x => x.id == id);
    if (element != undefined)
      return element.title;
  }

  Service_GetObjectivesList() {
    this._appService.getObjectivesList().subscribe(data => {
      this.ObjectivesList = data;
      this.refreshTable(this.ObjectivesList);
    }, error => { this._util.serviceError(error); });
  }

  refreshTable(source) {
    this.dataSource = new MatTableDataSource(source);
    this.dataSource.paginator = this.pagintor;
  }

  CloseMapRisk_OnClick() {
    this.showAddScreen = false;
  }

  openMapScreen() {
    this.viewMode = false;
    this.showAddScreen = false;
    this.showMapScreen = true;
    this.refreshTable(this.ObjectivesList);
  }

  CloseMapScreen_OnClick() {
    this.showMapScreen = false;
    this.viewMode = true;
    this.showAddScreen = false;
  }

  displayAsString(objarray: ObjectiveNew[]) {
    if (objarray != null && objarray.length > 0)
      return Array.prototype.map.call(objarray, s => s.title).toString();
    else
      return "Not Mapped";
  }

  EditRow_onClick(element: RiskObjectiveMappingData) {
    this.showAddScreen = true;
    this.viewMode = true;
    this.showMapScreen = false;
    this.id = element.procesS_MODEL_RISKS_NEW.id;
    this.title = element.procesS_MODEL_RISKS_NEW.title;
    this.description = element.procesS_MODEL_RISKS_NEW.description;
    this.selectedRisk1 = element.procesS_MODEL_RISKS_NEW.risK_CATEGORY_LEVEL1;
    this.selectedRisk2 = element.procesS_MODEL_RISKS_NEW.risK_CATEGORY_LEVEL2;
    this.selectedRisk3 = element.procesS_MODEL_RISKS_NEW.risK_CATEGORY_LEVEL3;
    this.selectedOwner = this.riskOwnerList.find(x => x.title == element.procesS_MODEL_RISKS_NEW.risK_OWNER);
  }

  DeleteRow_onClick(mapdata: RiskObjectiveMappingData) {
    if (confirm('Are you sure you want to delete this ?')) {
      this._appService.getStatusOfRisk(mapdata.procesS_MODEL_RISKS_NEW.id).subscribe(
        data => {
          if (data) {
            alert('This Risk cannot be deleted.');
            return;
          }
          else {
            alert('Please get the consent from CSM/PM to delete this Risk');
            return;
          }
        }
      ),
        (error) => { this._util.serviceError(error) }


      // this._appService.deleteRiskObjectiveMapping(mapdata).subscribe(data => {
      //   alert('Deleted Successfully');
      //   this.Service_GetRiskObjectivesMappingData();
      // }, error => { this._util.serviceError(error); },
      // () => {this._appService.deleteRiskControlMappingByRiskId(mapdata.procesS_MODEL_RISKS_NEW.id).subscribe()});
    }
  }

  ClearInputs() {
    this.title = "";
    this.id = 0;
    this.description = "";
    this.selectedRisk1 = undefined
    this.selectedRisk2 = undefined
    this.selectedRisk3 = undefined
    this.ServiceArea = undefined;
    this.selectedOwner = undefined;
  }

  filterObjectivesByServiceId(id: number) {
    this._appService.GetObjectivesByServiceAreaId(id).subscribe(data => {
      this.ObjectivesList = data;
    }, error => { this._util.serviceError(error); });
  }

  Service_GetServiceAreaList() {
    this._appService.getServiceAreaList().subscribe(data => {
      this.ServiceAreas = data;
    }, error => { this._util.serviceError(error); });
  }

  Service_GetRiskObjectivesMappingData() {
    this._appService.GetRiskObjectivesMappingData().subscribe(data => {
      this.mappingData = data;
      this.refreshTable1(this.mappingData);
      this.Service_GetRiskList();
    }, error => { this._util.serviceError(error); });
  }

  refreshTable1(source) {
    this.dataSource1 = new MatTableDataSource(source);
    this.dataSource1.paginator = this.pagintor1;
  }

  Service_GetRiskCategory1List() {
    this._appService.GetRiskCategory1List().subscribe(data => {
      this.riskList1 = data;
    }, error => { this._util.serviceError(error); });
  }

  Service_GetRiskCategory2List() {
    this._appService.GetAllRiskCategory2List().subscribe(data => {
      this.riskList2 = data;
      this.allriskList2 = this.riskList2;
    }, error => { this._util.serviceError(error); });
  }

  Service_GetRiskCategory3List() {
    this._appService.GetAllRiskCategory3List().subscribe(data => {
      this.riskList3 = data;
      this.allriskList3 = this.riskList3;
    }, error => { this._util.serviceError(error); });
  }

  Service_GetRiskOwnersList() {
    this._appService.GetRiskOwnersList().subscribe(data => {
      this.riskOwnerList = data;
    }, error => { this._util.serviceError(error); });
  }

  filterCategory2(id: number) {
    this._appService.GetRiskCategory2List(id).subscribe(data => {
      this.riskList2 = data;
    }, error => { this._util.serviceError(error); });
  }

  saveRiskMapping_OnClick() {
    this.Objectives = this.ObjectivesList.filter(x => x.bSelected == true);
    this.RiskModel.title = this.selectedRisk.title;
    this.RiskModel.id = this.selectedRisk.id;
    this.RiskModel.description = this.selectedRisk.description;
    this.RiskModel.risK_CATEGORY_LEVEL1 = this.selectedRisk.risK_CATEGORY_LEVEL1;
    this.RiskModel.risK_CATEGORY_LEVEL2 = this.selectedRisk.risK_CATEGORY_LEVEL2;
    this.RiskModel.risK_CATEGORY_LEVEL3 = this.selectedRisk.risK_CATEGORY_LEVEL3;
    this.RiskModel.risK_OWNER = this.selectedRisk.risK_OWNER;
    if (this.Objectives.length > 0) {
      this._appService.UpdateRiskAndRiskObjMapping(this.Objectives, this.RiskModel).subscribe(data => {
        alert("Update Successful");
        this.Service_GetRiskObjectivesMappingData();
        this.ObjectivesList.forEach(x => x.bSelected = false);
        this.selectedRisk = undefined;
      }, error => { this._util.serviceError(error); });
    }
    else {
      alert("Please choose any Risk to map");
    }
  }

  ClearData() {
    this.ObjectivesList.forEach(x => x.bSelected = false);
    this.selectedRisk = undefined;
  }

  filterCategory3(id: number) {
    this._appService.GetRiskCategory3List(id).subscribe(data => {
      this.riskList3 = data;
    }, error => { this._util.serviceError(error); });
  }



  SubmitModelForm(form) {
    if (form.valid) {
      this.RiskModel.title = this.title;
      this.RiskModel.description = this.description;
      this.RiskModel.risK_CATEGORY_LEVEL1 = this.selectedRisk1
      this.RiskModel.risK_CATEGORY_LEVEL2 = this.selectedRisk2
      this.RiskModel.risK_CATEGORY_LEVEL3 = this.selectedRisk3
      this.RiskModel.risK_OWNER = this.selectedOwner.title;
      this._appService.UpdateRiskAndRiskObjMapping(this.Objectives, this.RiskModel).subscribe(data => {
        alert("Update Successful");
        form.reset();
      }, error => { this._util.serviceError(error); });
    }
    else {
      alert("Please enter the mandatory fields");
    }
  }

  getRiskById(id: number) {
    this._appService.getRisk2ById(id).subscribe(data => {
      this.risk2name = data;
    }, error => { this._util.serviceError(error); });

    return this.risk2name;
  }

  CloseEditMode_OnClick() {
    this.editMode = false;
    this.viewMode = true;
  }

  openAddRiskScreen() {
    this.showAddScreen = !this.showAddScreen;
  }

  CloseAddRisk_OnClick() {
    this.showAddScreen = false;
  }

  saveRisk_OnClick() {
    if (this.title && this.description && this.selectedRisk1 && this.selectedRisk2 &&
      this.selectedRisk3 && this.selectedOwner.title ) {
      this.RiskModel = new ProcessModelRisksNew();
      this.RiskModel.title = this.title;
      this.RiskModel.description = this.description;
      this.RiskModel.risK_CATEGORY_LEVEL1 = this.selectedRisk1
      this.RiskModel.risK_CATEGORY_LEVEL2 = this.selectedRisk2;
      this.RiskModel.risK_CATEGORY_LEVEL3 = this.selectedRisk3;
      this.RiskModel.risK_OWNER = this.selectedOwner.title;
      this.RiskModel.id = this.id;

      if (this.RiskModel.id == 0 || this.RiskModel.id == undefined) {
        this._appService.addSQARisk(this.RiskModel).subscribe(data => {
          alert('Risk Added Successfully');
          this.ClearInputs();
          this.Service_GetRiskObjectivesMappingData();
        });
      }
      else {
        this._appService.updateSQARisk(this.RiskModel).subscribe(data => {
          alert('Risk Updated Successfully');
          this.ClearInputs();
          this.Service_GetRiskObjectivesMappingData();
        })
      }
    }
    else {
      alert("Please enter all the required fields");
      return;
    }
  }

}



