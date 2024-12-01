import { Component, OnInit, ViewChild } from '@angular/core';
//import {MatTableDataSource} from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule, MatTableDataSource, MatPaginator } from '@angular/material';
import { MatInputModule } from '@angular/material';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { FormsModule } from '@angular/forms';
import { ProcessSQAObjectiveNew } from '../../../models/process-sqa-model';
import { MatDialog, MatDialogConfig } from '@angular/material'
//import { create } from 'domain';
import { CreateComponent } from '../create/create.component';
import { createComponent } from '@angular/compiler/src/core';
import { ObjectiveNew, ProcessObjectiveMapping, ServiceAreaModelNew, ProcessServiceAreaMapping, ProcessModelProcessMapping } from '../../../models/audit-checklist-based-model';
import { ProcessAreaModelNew, ProcessModelNew } from '../../../models/audit-checklist-based-model';

@Component({
  selector: 'app-objective-user',
  templateUrl: './objective-user.component.html',
  styleUrls: ['./objective-user.component.scss']
})
export class ObjectiveUserComponent implements OnInit {

  // l;m;n;

  // searchKey : string;

  // modelList : ProcessSQAObjectiveNew[] =[];

  // SubmitModelForm(roWForm){}

  //  numbers=[];

  //  displayedColumns : string[] = ['serialno','processid', 'title', 'description', 'actions']; //, 'description', 'Process'];

  //  constructor(private _util: myUtility, 
  //   private _appservice: AppsService,
  //   private dialog : MatDialog ) { }

  //  ngOnInit()
  //   {
  //      this.LoadData();
  //      let inp=20;
  //      for(var i=1; i<=inp; i++){
  //      this.numbers.push(i)
  //          }
  //    }
  //    LoadData() {
  //      this._appservice.GetProcessModelObjectives().subscribe(data => {
  //        this.modelList = data;
  //      }, error => { this._util.serviceError(error); });
  //    }

  //    ngOnChanges(){
  //      this.LoadData();
  //    }

  //    onCreate(){
  //       const dialogConfig = new MatDialogConfig();
  //       dialogConfig.autoFocus= true;
  //       dialogConfig.width = "55%";
  //       let dialogRef = this.dialog.open(CreateComponent, dialogConfig);

  //      dialogRef.afterClosed().subscribe(result => {
  //         this.modelList.push(result);
  //         this.LoadData();
  //     });
  // }

  // deleteObjective(row)
  // {
  //   if(confirm('Are you sure want to delete ?'))
  //   {
  //       this._appservice.deleteProcessModelObjective(row).subscribe(data => {
  //       this.LoadData()
  //       alert("Deleted Successfully");
  //     }, 
  //       error => { this._util.serviceError(error); });
  //   }
  // }

  // editObjective(row)
  // {
  //   const dialogRef = this.dialog.open(CreateComponent, {
  //     width : '55%',
  //     data : row
  //   });
  // }
  selectedProcessModel: ProcessModelNew = new ProcessModelNew();
  selectedProcessArea: ProcessAreaModelNew = new ProcessAreaModelNew();
  ServiceAreaList: ServiceAreaModelNew[] = [];
  bAddNewObjective: Boolean = false;
  ProcessList: ProcessModelNew[] = [];
  iEditIndex = -1;

  ObjectivesList: ObjectiveNew[] = [];
  selectedObjective: ObjectiveNew = new ObjectiveNew();

  newObjective: ObjectiveNew = new ObjectiveNew();

  ProcessAreaList: ProcessAreaModelNew[] = [];
  originalProcessAreaList: ProcessAreaModelNew[] = [];

  processObjectiveMapping: ProcessObjectiveMapping[] = [];
  dataSource: MatTableDataSource<ProcessModelNew>;

  displayedColumns = ["index", "procesS_AREA_ID", "procesS_NAME", "procesS_DESCRIPTION", "edit"];
  ProcessModelList: ProcessModelNew[];
  processModelProcessMapping: ProcessModelProcessMapping[];
  tempList: ProcessModelNew[];
  allMapping: ProcessModelProcessMapping[] = [];
  allServiceAreaMapping: ProcessServiceAreaMapping[] = [];
  originalServiceAreaList: ServiceAreaModelNew[] = [];
  selectedServiceArea: ServiceAreaModelNew = new ServiceAreaModelNew();
  allObjectivesMapping: ProcessObjectiveMapping[] = [];
  originalObjectivesList: ObjectiveNew[];
  @ViewChild('paginator') paginator: MatPaginator;

  constructor(private _util: myUtility, private _appservice: AppsService) { }
  ngOnInit() {
    this.Service_GetProcessList();
    this.Service_GetProcessAreaList();
    this.Service_GetProcessModelList();
    this.Service_GetServiceAreaList();
    this.Service_GetProcessModelProcessMapping();
    this.Service_GetServiceAreaProcessMapping();
    this.Service_GetObjectivesProcessMapping();
  }

  ngOnChanges() {
    this.Service_GetObjectivesList();
  }

  async Service_GetObjectivesProcessMapping() {
    this._appservice.getAllProcessObjectiveMapping().subscribe(
      data => {
        this.allObjectivesMapping = data;
        this.Service_GetObjectivesList();
      },
      (error) => { this._util.serviceError(error) }
    )
  }

  Service_GetProcessModelProcessMapping() {
    this._appservice.GetAllProcessProcessModelMapping().subscribe(
      data => {
        this.allMapping = data;
      },
      (error) => { this._util.serviceError(error) }
    )
  }

  Service_GetServiceAreaProcessMapping() {
    this._appservice.getServiceAreaProcessMapping().subscribe(data => {
      this.allServiceAreaMapping = data;
      this.Service_GetServiceAreaList();
    },
      (error) => { this._util.serviceError(error) })
  }

  getServiceAreaForAModel() {
    this.ProcessList.forEach(x => x.bSelected = false);
    let processIds = [];
    let serviceAreaIds = [];
    processIds = this.allMapping.filter(x => x.procesS_MODEL_ID == this.selectedProcessModel.id).map(y => y.procesS_ID);
    // serviceAreaIds = this.allServiceAreaMapping.filter(x => processIds.indexOf(x.procesS_ID) > -1).map(y => y.servicE_AREA_ID);
    // this.ServiceAreaList = this.originalServiceAreaList.filter(x => serviceAreaIds.indexOf(x.id) > -1);

    this.ProcessList.forEach(x => {
      if (processIds.indexOf(x.id) > -1) {
        x.bSelected = true;
      }
    });
    this.ProcessList.sort((a, b) => Number(b.bSelected) - Number(a.bSelected));
    this.refreshtable(this.ProcessList);
  }

  getProcessAreaForServiceArea() {
    this.ProcessList.forEach(x => x.bSelected = false);
    let processIds = [];
    let processAreaIds = [];
    processIds = this.allServiceAreaMapping.filter(x => x.servicE_AREA_ID == this.selectedServiceArea.id).map(x => x.procesS_ID);
    // processAreaIds = this.ProcessList.filter(x => processIds.indexOf(x.id) > -1).map(y => y.procesS_AREA_ID);
    // this.ProcessAreaList = this.originalProcessAreaList.filter(x => processAreaIds.indexOf(x.id) > -1);
    this.ProcessList.forEach(x => {
      if (processIds.indexOf(x.id) > -1) {
        x.bSelected = true;
      }
    });
    this.ProcessList.sort((a, b) => Number(b.bSelected) - Number(a.bSelected));
    this.refreshtable(this.ProcessList);
  }

  getObjectivesForProcessArea() {
    this.ProcessList.forEach(x => x.bSelected = false);
    let processIds = [];
    let objectiveIds = [];
    processIds = this.ProcessList.filter(x => x.procesS_AREA_ID == this.selectedProcessArea.id).map(y => y.id);
    // objectiveIds = this.allObjectivesMapping.filter(x => processIds.indexOf(x.procesS_ID) > -1).map(y => y.objectiveS_ID);
    // this.ObjectivesList = this.originalObjectivesList.filter(x => objectiveIds.indexOf(x.id) > -1);
    this.ProcessList.forEach(x => {
      if (processIds.indexOf(x.id) > -1) {
        x.bSelected = true;
      }
    });
    this.ProcessList.sort((a, b) => Number(b.bSelected) - Number(a.bSelected));
    this.refreshtable(this.ProcessList);
  }


  btnAddObjective_Onclick() {
    this.bAddNewObjective = true;
    this.newObjective = new ObjectiveNew();
  }

  btnCancelObjective_Onclick() {
    this.bAddNewObjective = false;
  }

  btnSaveObjective_Onclick() {
    if (this.newObjective.title != undefined && this.newObjective.description != undefined) {
      this.service_AddObjective(this.newObjective);
    }
    else{
      alert("Please enter required fields");
      return;
    }
  }

  Service_GetServiceAreaList() {
    this._appservice.getServiceAreaList().subscribe(data => {
      this.ServiceAreaList = data;
      this.originalServiceAreaList = data;
    }, error => { this._util.serviceError(error); });
  }

  ddProcessModelChange() {
    this.Service_GetProcessByProcessModel(this.selectedProcessModel.id);

  }

  Service_GetProcessByProcessModel(processModelId: number) {
    // this._appservice.GetProcessByProcessModel(processModelId).subscribe(data => {
    //   this.processModelProcessMapping = data;
    //   let ids: number[] = this.processModelProcessMapping.map(x => x.procesS_ID);
    //   this.tempList  = this.ProcessList.filter(function (itm) {
    //     return ids.indexOf(itm.id) > -1;
    //   });
    //   this.refreshtable(this.tempList);

    // }, error => { this._util.serviceError(error); });
  }
  service_AddObjective(objective: ObjectiveNew) {
    this._appservice.AddObjectiveNew(objective).subscribe(data => {
      this.Service_GetObjectivesList();
      alert("Objective Added Successfully");
      this.bAddNewObjective = false;
    }, error => { this._util.serviceError(error); });
  }

  Service_GetProcessModelList() {
    this._appservice.getProcessModel().subscribe(data => {
      this.ProcessModelList = data;
    }, error => { this._util.serviceError(error); });
  }

  Service_GetObjectivesList() {
    this._appservice.getObjectivesList().subscribe(data => {
      this.ObjectivesList = data;
      this.originalObjectivesList = data;
      this.determineIfMapped();
    }, error => { this._util.serviceError(error); });
  }

  determineIfMapped() {
    this.ObjectivesList.forEach(x => {
      let element = this.allObjectivesMapping.find(y => y.objectiveS_ID == x.id)
      if (element == undefined)
        x.isMapped = false;
      else
        x.isMapped = true;
    });
    this.ObjectivesList.sort((a, b) => {
      return Number(a.isMapped) - Number(b.isMapped)
    });
  }

  Service_GetProcessList() {
    this._appservice.getProcessList().subscribe(data => {
      this.ProcessList = data;
      this.refreshtable(this.ProcessList);
    }, error => { this._util.serviceError(error); });
  }

  refreshtable(data) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
  }

  Service_GetProcessAreaList() {
    this._appservice.getProcessAreaList().subscribe(data => {
      this.ProcessAreaList = data;
      this.originalProcessAreaList = data;
    }, error => { this._util.serviceError(error); });
  }

  clear() {
    this.selectedProcessArea = undefined;
    this.selectedProcessModel = undefined;
    this.selectedServiceArea = undefined;
    this.selectedObjective = undefined;
    this.ProcessAreaList = this.originalProcessAreaList;
    this.ServiceAreaList = this.originalServiceAreaList;
    this.ObjectivesList = this.originalObjectivesList;
    this.ProcessList.forEach(x => x.bSelected = false);
    this.refreshtable(this.ProcessList);
  }

  getProcessArea(id) {
    let processA: ProcessAreaModelNew[] = this.originalProcessAreaList.filter(t => t.id == id);
    if (processA != null && processA != undefined && processA.length > 0) {
      return processA[0].title;
    }
  }

  SaveRow_onClick() {
    let checkedProcess = this.ProcessList.filter(t => t.bSelected);
    if(checkedProcess.length > 0 && this.selectedObjective != undefined){
      this.service_UpdateProcessObjectiveMapping(this.selectedObjective, checkedProcess);
    }
    else{
      alert("Please choose required fields");
      return;
    }
  }

  service_UpdateProcessObjectiveMapping(objective: ObjectiveNew, checkedProcess: ProcessModelNew[]) {
    this._appservice.UpdateProcessObjectiveMapping(objective, checkedProcess).subscribe(data => {
      alert("Objective - Process Mapping done Successfully");
      this.newObjective = undefined;
    }, error => { this._util.serviceError(error); },
      async () => {
        this.clear();
        await this.Service_GetObjectivesProcessMapping();
        this.determineIfMapped();
      });
  }

  ddObjectiveChange() {
    let processIds = [];
    this.ProcessList.forEach((el) => { el.bSelected = false; })
    //this.Service_GetProcessByObjective(this.selectedObjective.id);
    processIds = this.allObjectivesMapping.filter(x => x.objectiveS_ID == this.selectedObjective.id).map(y => y.procesS_ID);
    this.ProcessList.forEach(x => {
      if (processIds.indexOf(x.id) > -1) {
        x.bSelected = true;
      }
    });

    this.ProcessList.sort((a, b) => Number(b.bSelected) - Number(a.bSelected));
    this.refreshtable(this.ProcessList);
  }

  Service_GetProcessByObjective(Objectiveid) {
    this._appservice.GetProcessByObjective(Objectiveid).subscribe(data => {
      this.processObjectiveMapping = data;
      let ids: number[] = this.processObjectiveMapping.map(x => x.procesS_ID);
      var filteredProcess = this.ProcessList.filter(function (itm) {
        return ids.indexOf(itm.id) > -1;
      });
      filteredProcess.forEach((el) => { el.bSelected = true; })

    }, error => { this._util.serviceError(error); });
  }
}
