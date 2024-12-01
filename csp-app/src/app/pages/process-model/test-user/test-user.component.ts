import { Component, OnInit } from '@angular/core';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProcessModelTestsNew, TestControlsMapping, ProcessModelControlnew } from '../../../models/process-sqa-model';
import { MatTableDataSource } from '@angular/material';
import { element } from 'protractor';
export interface Test {
  value: string;
  viewValue: string;
  
}
@Component({
  selector: 'app-test-user',
  templateUrl: './test-user.component.html',
  styleUrls: ['./test-user.component.scss']
})
export class TestUserComponent implements OnInit {
  test: ProcessModelTestsNew = new ProcessModelTestsNew();
  tests: TestControlsMapping[] = [];
  controls : ProcessModelControlnew[]= [];
  newtest : TestControlsMapping = new TestControlsMapping();
  dataSource = new MatTableDataSource(this.tests);
  selectedOptions = new FormControl(); 
  //dataSource = new MatTableDataSource(this.tests);
  ControlList: string[] = ['option1', 'option2', 'option3', 'option4', 'option5', 'option6'];
  

  //viewMode : boolean = true;
  //editmode : boolean = false;

  iEditIndex : number = -1;
  testdata : TestControlsMapping = new TestControlsMapping();
  
  title : string;
  description : string;
  controlmodel : ProcessModelControlnew[] = [];

  displayedColumns = ['id','title','description','controls','action'];
  constructor(private _appService : AppsService, private _util :myUtility) { }

  ngOnInit() {
    this.Service_LoadData();
    this.Service_GetControlList();
  }

  Service_LoadData()
  {
    this._appService.getTestsControlData().subscribe(data => {
      this.tests = data;
      this.dataSource = new MatTableDataSource(this.tests);
     }, error => { this._util.serviceError(error); });
  }

  Service_GetControlList()
  {
      this._appService.getControlList().subscribe(data => {
      this.controls = data;
     }, error => { this._util.serviceError(error); });
  }

  displayAsAString(object : ProcessModelControlnew[])
  {
    if(object != undefined && object.length > 0)
      return Array.prototype.map.call(object, s => s.title).toString();
    else
      return "Not Mapped";
  }

  AddNewTestRow()
  {
    let newtest = new TestControlsMapping();
    newtest.procesS_MODEL_TESTS_NEW = new ProcessModelTestsNew();
    newtest.procesS_MODEL_TESTS_NEW.id = 0;
    this.title ="";
    this.description="";
    this.controlmodel = [];
    this.iEditIndex = this.tests.length;
    this.tests.push(newtest);
    this.dataSource = new MatTableDataSource(this.tests);
  }
  compareFn(x : any , y: any)
  {
    return x && y ? x.id === y.id : x === y;
  }

  SaveRow_onClick(element: TestControlsMapping)
  {
    let mapping = new TestControlsMapping();  

    let test = new ProcessModelTestsNew();
    test.id = element.procesS_MODEL_TESTS_NEW.id;
    test.title = this.title;
    test.description = this.description;

    mapping.procesS_MODEL_TESTS_NEW = test;
    mapping.procesS_MODEL_CONTROL_NEW = this.controlmodel;
    if(test.id == 0)
      this.Service_AddTestControls(mapping);
    else
      this.Service_UpdateTestControls(mapping);
    this.iEditIndex = -1;
  }

  EditRow_onClick(element : TestControlsMapping, id)
  {
    this.iEditIndex = id;
    this.title = element.procesS_MODEL_TESTS_NEW.title;
    this.description = element.procesS_MODEL_TESTS_NEW.description;
    this.controlmodel = element.procesS_MODEL_CONTROL_NEW;
  }

  CancelEdit_onClick(element)
  {
    console.log("cancel element = " , element);
    this.iEditIndex = -1;
  }

  Service_AddTestControls(element : TestControlsMapping)
  {
    this._appService.addTestControls(element).subscribe(data => {
      alert('Test controls Mapping done successfully');
      this.Service_LoadData();
    }, error => { this._util.serviceError(error); });
  }

  Service_UpdateTestControls(element : TestControlsMapping)
  {
    this._appService.updateTestControls(element).subscribe(data => {
      alert('Test controls Mapping updated successfully');
      this.Service_LoadData();
    }, error => { this._util.serviceError(error); });
  }

  DeleteRow_OnClick(element :TestControlsMapping)
  {

    //this.Service_DeleteTestControls(element);
    if(element.procesS_MODEL_TESTS_NEW == null && element.procesS_MODEL_CONTROL_NEW == null)
    {
      this.tests.splice(this.tests.indexOf(element), 1);
      this.dataSource = new MatTableDataSource(this.tests);
    } 
    else
    {
      this.Service_DeleteTestControls(element)
    }
  }

  Service_DeleteTestControls(deletedata)
  {
    this._appService.deleteTestControls(deletedata).subscribe(data => {
      alert('Deleted Successfully');
      this.Service_LoadData();
      }, error => { this._util.serviceError(error); });
  }


  users1: Test[] = [
    {value: 'Option-0', viewValue: 'Option-1'},
    {value: 'Option-1', viewValue: 'Option-2'},
    {value: 'Option-2', viewValue: 'Option-3'}
  ];
  users2: Test[] = [
    {value: 'Option-0', viewValue: 'Option-4'},
    {value: 'Option-1', viewValue: 'Option-5'},
    {value: 'Option-2', viewValue: 'Option-6'}
  ];

}

