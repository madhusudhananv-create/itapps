import { Component, OnInit, ViewChild } from '@angular/core';
import { CrispCategoryModel } from '../../../models/crisp-category-model';
import { CrispCriteriaModel } from '../../../models/crisp-criteria-model';
import { CrispValidationsModel } from '../../../models/crisp-validations-model';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';

@Component({
  selector: 'app-crisp-validations',
  templateUrl: './crisp-validations.component.html',
  styleUrls: ['./crisp-validations.component.scss']
})
export class CrispValidationsComponent implements OnInit {
  categories: CrispCategoryModel[] = [];
  selectedCategory: CrispCategoryModel = new CrispCategoryModel();
  criterias: CrispCriteriaModel[] = [];
  selectedCriteria: CrispCriteriaModel = new CrispCriteriaModel();
  validations: CrispValidationsModel[] = [];
  validation: CrispValidationsModel = new CrispValidationsModel();
  selectedValidation: CrispValidationsModel = new CrispValidationsModel();
  displayedColumns = ['index', 'scorE_PERCENTAGE', 'validatioN_NAME', 'comments', 'autopopulate', 'validatioN_API_URL', 'edit', 'delete'];
  //displayedColumns = ['index', 'edit', 'delete'];

  dataSource = new MatTableDataSource<any>(this.validations);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort1: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort1;
  }
  constructor(private _util: myUtility, private _appservice: AppsService) { }

  ngOnInit() {
    this.LoadData();
  }
  ngOnChanges() {
    this.validation = new CrispValidationsModel();
    this.LoadData();
  }
  LoadData() {
    this.service_getCrispCategory();
    //this.service_getCrispCriteria();
  }

  RefreshTable() {
    this.dataSource = new MatTableDataSource<any>(this.validations);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort1;
  }
  formreset(validationsForm) {
    this.validation = new CrispValidationsModel();
    //validationsForm.reset();
  }
  EditRow_onClick(row) {
    this.validation = row;
  }
  DeleteRow_onClick(row): void {
    if (confirm('Are you sure you want to delete the record?')) {
      this.service_deleteCrispValidations(row);
    } else {
    }
  }
  ddCategory_Onchange() {
    this.LoadCrispCriterias();
  }
  ddCriteria_Onchange() {
    this.LoadCrispValidations();
  }
  LoadCrispCriterias() {
    this.service_getCrispCriterias();
  }
  LoadCrispValidations() {
    this.service_getCrispValidations();
  }
  SubmitForm_Validations(isValid) {
    if (!isValid) {
      alert("Please enter required fields");
      return;
    }
    if (this.validation.id === 0 || this.validation.id === undefined) {
      let dbvalidation = this._util.CopyObject(this.validation);
      dbvalidation.id = 0;
      //dbvalidation.period = this._util.GetLocalDate(this.validation.period);
      dbvalidation.createD_BY = localStorage.getItem('empid');
      dbvalidation.createD_DATE = new Date();
      dbvalidation.updateD_BY = localStorage.getItem('empid');
      dbvalidation.updateD_DATE = new Date();
      dbvalidation.isactive = true;
      this.service_addCrispValidations(dbvalidation);
    }
    else {
      let dbdetail = this._util.CopyObject(this.validation);
      //dbdetail.period = this._util.GetLocalDate(this.validation.period);
      dbdetail.updateD_BY = localStorage.getItem('empid');
      dbdetail.updateD_DATE = new Date();
      this.service_updateCrispValidations(dbdetail);
    }
    this.validation = new CrispValidationsModel();
  }

  service_getCrispCategory() {
    this._appservice.GetCrispCategory().subscribe(data => {
      this.categories = data;
      this.RefreshTable();
    }, error => { this._util.serviceError(error); });
  }
 
  service_getCrispCriterias() {
    if (this.selectedCategory != undefined && this.selectedCategory.id != undefined) {
      this._appservice.GetCrispCriteriasByCategory(this.selectedCategory.id).subscribe(data => {
        this.criterias = data;
      }, error => { this._util.serviceError(error); });
    }
  }
  service_getCrispValidations() {
    if (this.validation != undefined && this.validation.criteriA_ID != undefined) {
      this._appservice.GetCrispValidationsByCriteria(this.validation.criteriA_ID).subscribe(data => {
        this.validations = data;
        this.RefreshTable();
      }, error => { this._util.serviceError(error); });
    }
  }

  service_addCrispValidations(_validation) {
    this._appservice.AddCrispValidations(_validation).subscribe(data => {
      this.validations.push(_validation);
      this.RefreshTable();
      alert("Added Successfully");
    }, error => { this._util.serviceError(error); });
  }

  service_updateCrispValidations(_validation) {
    this._appservice.UpdateCrispValidations(_validation).subscribe(data => {
      this.RefreshTable();
      alert("Updated Successfully");
    }, error => { this._util.serviceError(error); });
  }
  
  service_deleteCrispValidations(row) {
    this._appservice.DeleteCrispValidations(row).subscribe(data => {
      this.validations.splice(this.validations.indexOf(row), 1);
      this.RefreshTable();
      alert("Deleted Successfully");
    }, error => { this._util.serviceError(error); });
  }
}