import { Component, OnInit, ViewChild } from '@angular/core';
import { CrispCriteriaModel } from '../../../models/crisp-criteria-model';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { CrispCategoryModel } from '../../../models/crisp-category-model';

@Component({
  selector: 'app-crisp-criteria',
  templateUrl: './crisp-criteria.component.html',
  styleUrls: ['./crisp-criteria.component.scss']
})
export class CrispCriteriaComponent implements OnInit {
  categories: CrispCategoryModel[] = [];
  criterias: CrispCriteriaModel[] = [];
  criteria: CrispCriteriaModel = new CrispCriteriaModel();
  displayedColumns = ['index', 'category', 'criteriA_NAME', 'score', 'comments', 'edit', 'delete'];
  dataSource = new MatTableDataSource<any>(this.criterias);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort; 
  }
  constructor(private _util: myUtility, private _appservice: AppsService) { }

  ngOnInit() {
    this.LoadData();
    this.dataSource = new MatTableDataSource(this.criterias);
  }
  ngOnChanges() {
    this.criteria = new CrispCriteriaModel();
    this.LoadData();
    this.dataSource = new MatTableDataSource(this.criterias);
  }
  LoadData(){
    this.service_getCrispCriteria();
    this.service_getCrispCategory();
  }
  SubmitForm_criteria(form) {
    if (!form.valid) {
      alert("Please enter required fields");
      return;
    }
    if (this.criteria.id === 0 || this.criteria.id === undefined) {
      let dbCriteria = this._util.CopyObject(this.criteria);
      dbCriteria.id = 0;
      dbCriteria.createD_BY = localStorage.getItem('empid');
      dbCriteria.createD_DATE = new Date();
      dbCriteria.updateD_BY = localStorage.getItem('empid');
      dbCriteria.updateD_DATE = new Date();
      dbCriteria.isactive = true;
      this.service_addCrispCriteria(dbCriteria);
    }
    else {
      let dbCriteria = this._util.CopyObject(this.criteria);
      dbCriteria.updateD_BY = localStorage.getItem('empid');
      dbCriteria.updateD_DATE = new Date();
      this.service_updateCrispCriteria(dbCriteria);
    }
    this.criteria = new CrispCriteriaModel();
  }
  getCategory(id) {
    if (this.categories.length > 0)
      return this.categories.filter(t => t.id === id)[0].categorY_NAME;
    else
      return "";
  }

  EditRow_onClick(row) {
    this.criteria = row;
  }
  DeleteRow_onClick(row): void {
    if (confirm('Are you sure you want to delete the record?')) {
      this.service_deleteCrispCriteria(row);
    } else {
    }
  }
  RefreshTable() {
    this.dataSource = new MatTableDataSource<any>(this.criterias);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

 
  formreset(goalForm)
  {
    this.criteria = new CrispCriteriaModel();
    //goalForm.reset();
  }
  service_getCrispCategory() {
    this._appservice.GetCrispCategory().subscribe(data => {
      this.categories = data;
      this.RefreshTable();
    }, error => { this._util.serviceError(error); });
  }
  service_getCrispCriteria() {
    this._appservice.GetCrispCriteria().subscribe(data => {
      this.criterias = data;
      this.RefreshTable();
    }, error => { this._util.serviceError(error); });
  }
  service_addCrispCriteria(_criteria) {
    this._appservice.AddCrispCriteria(_criteria).subscribe(data => {
      this.criterias.push(_criteria);
      this.RefreshTable();
      alert("Added Successfully");
    }, error => { this._util.serviceError(error); });
  }
  service_updateCrispCriteria(_criteria) {
    this._appservice.UpdateCrispCriteria(_criteria).subscribe(data => {
      this.RefreshTable();
      alert("Updated Successfully");
    }, error => { this._util.serviceError(error); });
  }
  service_deleteCrispCriteria(row) {
    this._appservice.DeleteCrispCriteria(row).subscribe(data => {
      this.criterias.splice(this.criterias.indexOf(row), 1);
      this.RefreshTable();
      alert("Deleted Successfully");
    }, error => { this._util.serviceError(error); });
  }
}