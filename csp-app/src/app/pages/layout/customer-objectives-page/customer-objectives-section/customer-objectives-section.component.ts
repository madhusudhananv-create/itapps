import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { myUtility } from '../../../../Shared/myUtility';
import { ScopeModel, modelRow, projectScopes } from '../../../../models/scope-Model';
import { AppsService } from '../../../../Services/apps.service';
import { Router } from '@angular/router';
import { AccessControl } from '../../../../Shared/accessControl';
import { ServiceAreaModelNew } from '../../../../models/requirement-reference.model';
import { MatTableDataSource } from '@angular/material';
import { ServiceAreaProjectMappingModel } from '../../../../models/service-area-project-mapping-model';

@Component({
  selector: 'app-customer-objectives-section',
  templateUrl: './customer-objectives-section.component.html',
  styleUrls: ['./customer-objectives-section.component.scss']
})
export class CustomerObjectivesSectionComponent implements OnInit {

  @Input('selectedProj') input_projectid: string;
  @Input('selectedCust') input_customerid: string;
  panels: any;
  constructor(private _access: AccessControl, private _http: Http, private _util: myUtility, private _appservice: AppsService, private _router: Router) { }

  ngOnInit() {
    this.ResetScope();
  }

  ngOnChanges() {
    this.ResetScope();
  }
  scope_read: boolean = false;
  scope_edit: boolean = false;
  selectedDatanew: ScopeModel;
  ServiceAreaList: ServiceAreaModelNew[] = [];
  InScopeDetailsList: any[] = [];
  dataSource = new MatTableDataSource<modelRow>([]);
  selectedServiceAreaToAdd: ServiceAreaModelNew;

  columnDisplayNames: { [key: string]: string } = {
    'ServiceTower': 'Service Tower',
    'Tools': 'Tools',
    'Technology': 'Technology',
    'Action':'Action'
  };
  columnDisplayNames_read: { [key: string]: string } = {
    'ServiceTower': 'Service Tower',
    'Tools': 'Tools',
    'Technology': 'Technology'

  };

  displayedColumns: string[] = ['ServiceTower', 'Tools', 'Technology', 'Action'];
  displayedColumns_read: string[] = ['ServiceTower', 'Tools', 'Technology'];
  columnWidths = {
    ServiceTower: '35%',
    Tools: '25%',
    Technology: '25',
    Edit: '5%',
    Save: '5%',
    Delete: '5%'
  };

  fields = [
    // { label: 'RAG*', key: 'rag', type: 'select', options: ['green', 'orange', 'red'], required: true },
    { label: 'Objectives', key: 'objectives', type: 'textarea' },
    { label: 'Deliverables', key: 'deliverables', type: 'textarea' },
    { label: 'Constraints', key: 'constraints', type: 'textarea' },
    { label: 'Assumptions', key: 'assumptions', type: 'textarea' },
    { label: 'Out-Scope', key: 'ouT_SCOPE', type: 'textarea' }
  ];

  sections = [
    { title: 'Scope', property: 'scope' },
    { title: 'Objectives', property: 'objectives' },
    { title: 'Deliverables', property: 'deliverables' },
    { title: 'Constraints', property: 'constraints' },
    { title: 'Assumptions', property: 'assumptions' },
    { title: 'Out-Scope', property: 'ouT_SCOPE' }
  ];

  GetProjectScopeByProjId(projectID: string) {

    this._appservice.getProjectScopeByProjId(projectID).subscribe(
      data => {
        this.selectedDatanew = data;
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  Service_GetServiceAreaList() {
    this._appservice.getServiceAreaList().subscribe(data => {
      this.ServiceAreaList = data;
    }, error => { this._util.serviceError(error); });
  }
  GetProjectInScope(projectId) {
    this._appservice.GetProjectInScope(projectId).subscribe(data => {
      for (let r of data) {
        const selectedOption = this.ServiceAreaList.find(option => option.id == r.servicE_AREA_ID);
        if (selectedOption && selectedOption.title) {
          const newRow: modelRow = {
            ID: r.id,
            SERVICE_AREA_ID: r.servicE_AREA_ID,
            ServiceTower: selectedOption ? selectedOption.title : "",
            Tools: r.tools,
            Technology: r.technology,
            Project_Id: r.projecT_ID,
            Cust_Id: r.cusT_ID
          };
          this.dataSource.data.push(newRow);
        }

      }
      this.dataSource.data = [...this.dataSource.data];
    }, error => { this._util.serviceError(error); })
  }

  isEditing: boolean[] = [];

  editRow(row: any) {
    this.isEditing = new Array(this.dataSource.data.length).fill(false);
    const rowIndex = this.dataSource.data.indexOf(row);
    this.isEditing[rowIndex] = true;
  }

  DeleteRow_onClick(element: modelRow): void {
    if (confirm('Are you sure you want to delete the record?')) {
      this._appservice.DeleteInScope(element).subscribe(data => {
        this.dataSource.data.splice(this.dataSource.data.indexOf(element), 1);
        this.dataSource.data = [...this.dataSource.data];
        alert("Deleted successfully");
      }, error => { this._util.serviceError(error); });
    }

  }

  toggleEditMode(rowIndex: number) {
    this.isEditing[rowIndex] = !this.isEditing[rowIndex];
  }

  AddInScope(serviceid, tool, tech) {
    if ((serviceid == null || serviceid == undefined) && (tool == "" || tool == undefined) && (tech == "" || tech == undefined)) {
      alert("Please fill the Inscope Details");
      return;
    }
    if (serviceid > 0)
      var serviceIdExists = this.dataSource.data.find(item => item.SERVICE_AREA_ID === serviceid);
    if (serviceIdExists != null && serviceIdExists.SERVICE_AREA_ID != 0) {
      alert("Service Tower already exists!");
      return;
    }


    const selectedOption = this.ServiceAreaList.find(option => option.id == serviceid);

    const newRow: modelRow = {
      ID: 0,
      SERVICE_AREA_ID: serviceid,
      ServiceTower: selectedOption ? selectedOption.title : "",
      Tools: tool,
      Technology: tech,
      Project_Id: this.input_projectid,
      Cust_Id: this.input_customerid
    };
    this.dataSource.data.push(newRow);
    this.dataSource.data = [...this.dataSource.data];
    if (this.selectedDatanew) {
      this.selectedDatanew.serviceTower = null;
      this.selectedDatanew.tools = '';
      this.selectedDatanew.technologY_USED = '';
    }
  }
  ResetInscope() {
    this.Service_GetServiceAreaList();
    if (this.input_projectid)
      this.GetProjectInScope(this.input_projectid);
  }
  EditonClick() {
    this.dataSource.data = [];
    this.ResetInscope();
    this.scope_read = false;
    this.scope_edit = true;
  }
  ResetScope() {
    this.scope_read = true;
    this.scope_edit = false;
    this.selectedDatanew = null;
    this.dataSource.data = [];
    if (this.input_projectid) {
      this.GetProjectScopeByProjId(this.input_projectid);

    }
    this.ResetInscope();
  }

  SaveScope() {
    //Validations
    const specialCharPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
    const numberPattern = /^[0-9\s]+$/;


    if (!this.selectedDatanew.description) {
      alert("Please enter Description");
      return;
    }
    else if ((specialCharPattern.test(this.selectedDatanew.description)) || numberPattern.test(this.selectedDatanew.description)) {
      alert('Please enter alphanumeric or numeric values along with special characters for description');
      return;
    }

    let scopeModel: ScopeModel = new ScopeModel();
    scopeModel.projecT_ID = this.input_projectid;
    scopeModel.rag = this.selectedDatanew.rag;
    scopeModel.description = this.selectedDatanew.description;
    scopeModel.technologY_USED = this.selectedDatanew.technologY_USED;
    scopeModel.scope = this.selectedDatanew.scope;
    scopeModel.objectives = this.selectedDatanew.objectives;
    scopeModel.deliverables = this.selectedDatanew.deliverables;
    scopeModel.inScope_Id = this.selectedDatanew.inScope_Id;
    scopeModel.constraints = this.selectedDatanew.constraints;
    scopeModel.assumptions = this.selectedDatanew.assumptions;
    scopeModel.ouT_SCOPE = this.selectedDatanew.ouT_SCOPE;
    scopeModel.updateD_BY = localStorage.getItem('empid');
    scopeModel.updateD_DATE = new Date();

    var projectScope = new projectScopes();
    projectScope.PROJECT_SCOPE = scopeModel;
    projectScope.PROJECT_INSCOPE_DETAILS = this.dataSource.data;

    this._appservice.updateScope(projectScope).subscribe(data => {
      alert("Data Save Successfully");    
      this.ResetScope();
    }, error => { this._util.serviceError(error); });
  }
  onSelectionChange(selectedValue: any) {
    this.selectedServiceAreaToAdd = selectedValue;
  }

}
