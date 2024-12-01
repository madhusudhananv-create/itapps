import { Component, OnInit } from '@angular/core';
import { ProcessModelNew1, ControlCategory, ControlReference, ProcessModelRisksNew, ProcessModelControlnew, ControlRisksMappingModel } from '../../../models/process-sqa-model';
import {Classify} from '../../../models/process-sqa-model';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { element, error } from 'protractor';

export interface Control {
  value: string;
  viewValue: string;
  
}

@Component({
  selector: 'app-control-user',
  templateUrl: './control-user.component.html',
  styleUrls: ['./control-user.component.scss']
})
export class ControlUserComponent implements OnInit {
  newRefDescription: string;
  controlRisksMapping: ControlRisksMappingModel[];
  RiskList: ProcessModelRisksNew[] = []
  AssertionList: string[] = ['Completeness', 'Validity', 'Accuracy', 'Existence', 'Valuation & Allocation'];


viewmode : boolean = true;
editmode : boolean = false;
showAddCategory : boolean = false;
showAddReference : boolean = false;
ProcessModel : ProcessModelNew1[] = [];
controlcategories : ControlCategory[] = [];
controlreferences : ControlReference[] = [];

controlnew : ProcessModelControlnew = new ProcessModelControlnew();
risks : ProcessModelRisksNew[] = [];
title : string;
description : string;
processmodel : number;
Category : number;
Category1 : ControlCategory = new ControlCategory();
ControlRef : number;
Controlref1 : ControlReference = new ControlReference();
ReqRef : string;
ControlType : string;
classify : string;
auto : string;
AssertionArray : string[];
RisksArray : number[] = [];
classifications : Classify[] = [];
controlowner : string;
newDescription : string;
newModelId : string;
searchKey;
displayedColumns =['id', 'title', 'risks', 'owner',  'reference', 'description', 'category','model','reqref', 'controltype','classify','assertion','action'];

dataSource = new MatTableDataSource(this.controlRisksMapping);
  assertion: string[];
  originalControlCategories: any[];
  originalControlReferences: any[];
  id: number;



constructor(private _appService : AppsService, private _util : myUtility) { }

  ngOnInit()
 {
   this.Service_GetProcessModel();
   this.Service_GetRisknew();
   this.Service_Loaddata();
   this.Service_GetClassifications();
   this.Service_GetAllControlCategories();
   this.Service_GetAllControlReference();
 }

 Service_Loaddata()
 {
   this._appService.getControlRisksMappingData().subscribe(data => {
    this.controlRisksMapping = data;
    this.refreshTable(this.controlRisksMapping);
   }, error => { this._util.serviceError(error); });
 }

 refreshTable(source)
 {
   this.dataSource = new MatTableDataSource(source);
 }

 Service_GetClassifications()
 {
    this._appService.getClassifications().subscribe(data => {
      this.classifications = data;
     }, error => { this._util.serviceError(error); });
  }

  toggle_AddCategory()
  {
    this.showAddCategory = !this.showAddCategory;
  }

  toggle_AddReference()
  {
    this.showAddReference = !this.showAddReference;
  }

  AddNewCategory()
  {
    if(this.processmodel == undefined && this.newDescription != "")
    {
      alert('Please choose a Process Model and enter decription');
    }
    else
    {
      this.Category1.description = this.newDescription;
      this.Category1.procesS_MODEL_ID = this.processmodel;
      this.Service_AddControlCategory(this.Category1);
      this.newDescription ="";
      this.getControlCategoryByModelId(this.processmodel)
      this.showAddCategory = false;
    }
  }

  clearCategory()
  {
    this.newDescription = "";
    this.newModelId = "";
  }

  ShowCreatepanel()
  {
    this.editmode = true;
    this.viewmode = false;
    this.id = 0;
    this.controlnew = new ProcessModelControlnew();
  }

  CloseEditMode_OnClick()
  {
    this.editmode = false;
    this.viewmode = true;
  }

  AddNewReference()
  {
    if(this.Category == undefined && this.newRefDescription != "")
    {
      alert('Please choose a Control Category and enter Reference decription');
    }
    else
    {
      this.Controlref1.description = this.newRefDescription;
      this.Controlref1.controL_CATEGORY_ID = this.Category;
      this.Service_AddControlReference(this.Controlref1);
      this.newRefDescription ="";
      this.getControlReferenceByCategoryId(this.Category);
      this.showAddReference = false;
    }
  }

  Service_AddControlReference(reference)
  { 
    this._appService.addControlReference(reference).subscribe(data => {
      this.controlreferences = data;
      alert('New Control Reference Added Successfully');
     }, error => { this._util.serviceError(error); });
  }

  Service_AddControlCategory(category)
  {
    this._appService.addControlCategory(category).subscribe(data => {
      this.controlcategories = data;
      alert('New Control Category Added Successfully');
     }, error => { this._util.serviceError(error); });
  }

  Service_GetAllControlCategories()
  {
    this._appService.getAllControlCategories().subscribe(data => {
      this.originalControlCategories = data;
       this.controlcategories = data;
    },
    (error) => {this._util.serviceError(error);})
  }

  Service_GetAllControlReference()
  {
    this._appService.getAllControlReferences().subscribe(data => {
      this.originalControlReferences = data;
      this.controlreferences = data;
   },
   (error) => {this._util.serviceError(error);})
  }

  applyFilter()
  {
    this.controlRisksMapping.filter = this.searchKey;
  }

 Service_GetProcessModel()
 {
   this._appService.getProcessModel().subscribe(data => {
    this.ProcessModel = data;
   }, error => { this._util.serviceError(error); });
 }

 Service_GetRisknew()
 {
   this._appService.GetProcessModelRisksNew().subscribe(data => {
    this.RiskList = data;
   }, error => { this._util.serviceError(error); });
 }

getControlCategoryByModelId(id : number)
{
  this._appService.getControlCategoryByModelId(id).subscribe(data => {
    this.controlcategories = data;
   }, error => { this._util.serviceError(error); });
}

getControlReferenceByCategoryId(categoryid : number)
{
  this._appService.GetControlReferenceByCategoryId(categoryid).subscribe(data => {
    this.controlreferences = data;
   }, error => { this._util.serviceError(error); });
}

submitForm(form)
{
  if(form.valid)
  {
    this.controlnew = new ProcessModelControlnew();
    this.controlnew.id = this.id;
    this.controlnew.title = this.title;
    this.controlnew.description= this.description ;
    this.controlnew.controL_TYPE = this.ControlType;
    this.controlnew.category = this.Category;
    this.controlnew.requiremenT_REFERENCE = this.ReqRef
    this.controlnew.isactive = true;
    this.controlnew.classification = this.classify;
    this.controlnew.automation = this.auto;
    this.controlnew.assertion = this.displayAsString(this.AssertionArray);
    this.controlnew.controL_OWNER = this.controlowner;
    this.risks = this.RiskList.filter(x => this.RisksArray.indexOf(x.id) > -1);
    if(this.id == 0)
    {
      this._appService.addControlAndRisksMapping(this.controlnew, this.risks).subscribe(data => {
        alert('Data loaded successfully');
        form.reset();
        this.Service_Loaddata();
        }, error => { this._util.serviceError(error); });
    }
    else
    {
      let element = new ControlRisksMappingModel();
      element.procesS_MODEL_CONTROL_NEW = this.controlnew;
      element.procesS_MODEL_RISKS_NEW = this.risks;
      this._appService.updateControlAndRisksMapping(element).subscribe(data => {
        alert('Data updated successfully');
        this.viewmode = true;
        this.editmode= false;
        this.Service_Loaddata();
        }, error => { this._util.serviceError(error); });
    }
  }
  else
  {
    alert('Please enter the mandatory fields');
  }
}

displayAsString(array: string[])
{
  if(array == null || array.length == 0) return;
  return Array.prototype.map.call(array, s=> s).toString();
}

displayObjectAsString(object)
{
  if(object != undefined && object.length > 0)
    return Array.prototype.map.call(object, s=> s.title).toString();
  else
   return "Not Mapped";
}

Clear_FormInputs(form)
{
  form.reset();
}

EditRow_onClick(element : ControlRisksMappingModel)
{
  this.controlcategories = this.originalControlCategories;
  this.controlreferences = this.originalControlReferences;
  console.log("control edit element", element);
  this.editmode= true;
  this.viewmode = false;
  this.id = element.procesS_MODEL_CONTROL_NEW.id;
  this.title = element.procesS_MODEL_CONTROL_NEW.title;
  this.description = element.procesS_MODEL_CONTROL_NEW.description;
  this.processmodel = element.procesS_MODELVIEW_FOR_CONTROL.procesS_MODEL.id;
  this.Category = element.procesS_MODELVIEW_FOR_CONTROL.procesS_MODEL_CATEGORY.id;
  this.ControlRef = element.procesS_MODELVIEW_FOR_CONTROL.procesS_MODEL_CONTROL_REFERENCE.id;
  this.ReqRef = element.procesS_MODEL_CONTROL_NEW.requiremenT_REFERENCE;
  this.auto = element.procesS_MODEL_CONTROL_NEW.automation;
  this.ControlType = element.procesS_MODEL_CONTROL_NEW.controL_TYPE;
  this.classify = element.procesS_MODEL_CONTROL_NEW.classification;
  this.AssertionArray = element.procesS_MODEL_CONTROL_NEW.assertion.split(',');
  this.RisksArray = element.procesS_MODEL_RISKS_NEW.map(x => x.id);
  this.controlowner = element.procesS_MODEL_CONTROL_NEW.controL_OWNER;

}
DeleteRow_onClick(element : ControlRisksMappingModel)
{
  if(confirm('Are you sure want to delete?'))
  {
    this._appService.getStatusOfControl(element.procesS_MODEL_CONTROL_NEW.id).subscribe(
      data => {
        if(data)
        {
          alert('This Control cannot be deleted');
          return;
        }
        else
        {
          alert('Please get the consent from CSM/PM to delete this Control');
          return;
        }
      }
    )

    // this._appService.deleteControlRisksmapping(element).subscribe(data => {
    //   alert('Deleted successfully');
    //   this.Service_Loaddata();
    //  }, error => { this._util.serviceError(error); },
    //  () => {this._appService.deleteControlTestMappingByControlId(element.procesS_MODEL_CONTROL_NEW.id)});
  }
}
  ControlTypes: Control[] = [
    {value: 'KeyControl-0', viewValue: 'Key Control'},
    {value: ' SecondaryControl-1', viewValue: ' Secondary Control'},
   
  ];
  users1: Control[] = [
    {value: 'Option-0', viewValue: 'Option-1'},
    {value: 'Option-1', viewValue: 'Option-2'},
    {value: 'Option-2', viewValue: 'Option-3'}
  ];
  // users2: Control[] = [
  //   {value: 'Option-4', viewValue: 'Option-4'},
  //   {value: 'Option-5', viewValue: 'Option-5'},
  //   {value: 'Option-6', viewValue: 'Option-6'}
  // ];
  users3: Control[] = [
    {value: 'Option-7', viewValue: 'Option-7'},
    {value: 'Option-8', viewValue: 'Option-8'},
    {value: 'Option-9', viewValue: 'Option-9'}
  ];
  users4: Control[] = [
    {value: 'Risk-1', viewValue: 'Option-1'},
    {value: 'Risk-2', viewValue: 'Option-2'},
    {value: 'Risk-3', viewValue: 'Option-3'}
  ];
  users5: Control[] = [
    {value: 'preventive-0', viewValue: 'Preventive'},
    {value: 'Detective-1', viewValue: 'Detective'},
   
  ];

}
