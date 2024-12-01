import { Component, OnInit, ViewChild } from '@angular/core';
import { CrispCategoryModel } from '../../../models/crisp-category-model';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';

@Component({
  selector: 'app-crisp-category',
  templateUrl: './crisp-category.component.html',
  styleUrls: ['./crisp-category.component.scss']
})
export class CrispCategoryComponent implements OnInit {
  categories: CrispCategoryModel[] = [];
  category: CrispCategoryModel = new CrispCategoryModel();
  displayedColumns = ['index', 'categorY_NAME', 'comments', 'edit', 'delete'];
  dataSource = new MatTableDataSource<any>(this.categories);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort; 
  }
  constructor(private _util: myUtility, private _appservice: AppsService) { }

  ngOnInit() {

    this.LoadData();
    this.dataSource = new MatTableDataSource(this.categories);
  }
  ngOnChanges() {
    this.category = new CrispCategoryModel();
    this.LoadData();
    this.dataSource = new MatTableDataSource(this.categories);
  }
  LoadData(){
    this.service_getCrispCategory();
  }
  SubmitForm_category(form) {
    if (!form.valid) {
      alert("Please enter required fields");
      return;
    }
    if (this.category.id === 0 || this.category.id === undefined) {
      let dbCategory = this._util.CopyObject(this.category);
      dbCategory.id = 0;
      dbCategory.createD_BY = localStorage.getItem('empid');
      dbCategory.createD_DATE = new Date();
      dbCategory.updateD_BY = localStorage.getItem('empid');
      dbCategory.updateD_DATE = new Date();
      dbCategory.isactive = true;
      this.service_addCrispCategory(dbCategory);
    }
    else {
      let dbCategory = this._util.CopyObject(this.category);
      dbCategory.updateD_BY = localStorage.getItem('empid');
      dbCategory.updateD_DATE = new Date();
      this.service_updateCrispCategory(dbCategory);
    }
    this.category = new CrispCategoryModel();
  }


  EditRow_onClick(row) {
    this.category = row;
  }
  DeleteRow_onClick(row): void {
    if (confirm('Are you sure you want to delete the record?')) {
      this.service_deleteCrispCategory(row);
    } else {
    }
  }
  RefreshTable() {
    this.dataSource = new MatTableDataSource<any>(this.categories);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

 
  formreset(goalForm)
  {
    this.category = new CrispCategoryModel();
    //goalForm.reset();
  }
  service_getCrispCategory() {
    this._appservice.GetCrispCategory().subscribe(data => {
      this.categories = data;
      this.RefreshTable();
    }, error => { this._util.serviceError(error); });
  }
  service_addCrispCategory(_category) {
    this._appservice.AddCrispCategory(_category).subscribe(data => {
      this.categories.push(_category);
      this.RefreshTable();
      alert("Added Successfully");
    }, error => { this._util.serviceError(error); });
  }
  service_updateCrispCategory(_category) {
    this._appservice.UpdateCrispCategory(_category).subscribe(data => {
      this.RefreshTable();
      alert("Updated Successfully");
    }, error => { this._util.serviceError(error); });
  }
  service_deleteCrispCategory(row) {
    this._appservice.DeleteCrispCategory(row).subscribe(data => {
      this.categories.splice(this.categories.indexOf(row), 1);
      this.RefreshTable();
      alert("Deleted Successfully");
    }, error => { this._util.serviceError(error); });
  }
}