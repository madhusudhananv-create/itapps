import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppsService } from '../../Services/apps.service';
import { AccessControl } from '../../Shared/accessControl';
import { myUtility } from '../../Shared/myUtility';
import { SharedService } from '../../Shared/shared.service';
import { MatPaginator, MatTableDataSource, MatSort, MatTableModule } from '@angular/material';
import { CustomerModel } from '../../models/customer-model';
import { CustomerProjectIds } from "../../models/customer-projects-model";




@Component({
  selector: "app-configext-component",
  templateUrl: "./configext-component.component.html",
  styleUrls: ["./configext-component.component.scss"],
})
export class ConfigextComponentComponent implements OnInit {
  result: any = [];
  editItem: any;
  editmode: boolean = false;
  readonlymode: boolean = true;
  selectedCustomer: any;
  selectedProject: any;
  disableConfig: boolean = false;
  Customer = [];
  customers: any = [];
  Project: any = [];
  custId: any;
  allproj: any;
  filterCriteria: any;
  filteredData: any[];

  dataSource = new MatTableDataSource();
  @ViewChild("TABLE") table: ElementRef;
  displayedColumns = [
    "sno",
    "key",
    "value",
    "Description",
    "customeR_NAME",
    "projecT_NAME",
    "comments",
    "start_DATE",
    "end_DATE",
    "edit",
    "delete",
  ];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatSort) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  constructor(
    private route: ActivatedRoute, private _appservice: AppsService, private _shared: SharedService, private _util: myUtility, private changeDetectorRefs: ChangeDetectorRef, public _access: AccessControl
  ) {
  }

  ngOnInit() {
    this.getConfigextDetails();
  }

  getConfigextDetails() {
    this._appservice.getConfigextDetails().subscribe(
      (data) => {
        this.result = data;
        this.RefreshTable(this.result);
      },
      (error) => {
        this._util.serviceError(error);
      }
    );
  }

  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.getConfigextDetails();
  }

  RefreshTable(data) {
    this.dataSource = new MatTableDataSource<any>(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  Edit_onClick(flag: any = 0) {
    if (flag == 1) {
      this.disableConfig = true;
      this.custId = this.selectedCustomer;
      this.LoadProject();
    }
    else {
      this.editItem = {
        key: "",
        value: "",
        description: "",
        comments: "",
        isencrypt: false
      };
      this.disableConfig = false;
      this.selectedProject = null
    }
    this.readonlymode = false;
    this.editmode = true;
    this.RefreshTable(this.result);    
    this.LoadCustomer();
  }

  EditRow_onClick(element) {
    this.editItem = Object.assign({}, element);
    this.selectedCustomer = this.editItem.cusT_ID;
    this.selectedProject = this.editItem.proJ_ID;
    this.Edit_onClick(1);
  }

  LoadCustomer() {
    this._appservice.GetRASCustomerList().subscribe(
      (data) => {
        this.customers = data;
        this.customers.unshift({
          cusT_ID: "-1",
          cusT_NM: "All"
        });
        this.selectedCustomer = this.editItem.cusT_ID;
      },
      (error) => {
        this._util.serviceError(error);
      }
    );
  }

  ddCustomer_Onchange() {
    this.custId = this.selectedCustomer;
    this.LoadProject();
  }

  ddProject_Onchange() { }

  LoadProject() {
    this._appservice
      .GetMultipleCustomersProjectNames(
        this.custId,
        this.allproj || this._util.ShouldLoadAllProjects()
      )
      .subscribe(
        (data) => {
          this.Project = data;

        },
        (error) => {
          this._util.serviceError(error);
        }
      );
  }

  SubmitForm(isValid) {
    if (!isValid) {
      alert("Please enter valid values for required fields");
      return;
    }

    let body = this.saveReqBody();
    body.id = body.id === null || body.id === undefined ? 0 : body.id;
    if (body.comments != undefined) {
      body.comments = body.comments.trim();
      body.comments = body.comments.replace(/\s+/g, ' ');

    }
    if (body.description != undefined) {
      body.description = body.description.trim();
      body.description = body.description.replace(/\s+/g, ' ');
    }
    const specialCarPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/]+$/;
    const numberPattern = /^[0-9]+$/;
    if (body.description != undefined && (specialCarPattern.test(body.description.trim()) || numberPattern.test(body.description.trim()))) {
      alert('Invalid Description - Please enter alphanumeric or numeric values along with special characters');
      return;
    }

    if (body.comments != undefined && (specialCarPattern.test(body.comments.trim()) || numberPattern.test(body.comments.trim()))) {
      alert('Invalid Comment - Please enter alphanumeric or numeric values along with special characters');
      return;
    }
    if (body.key.trim() == '') {
      alert("Please enter valid value for Key");
      return;
    }
    if ((body.value.trim() == '')) {
      alert("Please enter valid values for Value ");
      return;
    }
    this.AddUpdateConfigext(body);
  }

  AddUpdateConfigext(item) {
    this._appservice.AddUpdateConfigext(item).subscribe(
      (data) => {
        alert("Data Saved Successfully");
        this.readonlymode = true;
        this.editmode = false;
        this.getConfigextDetails();
      },
      (error) => {
        this._util.serviceError(error);
      }
    );
  }

  saveReqBody() {
    let body: ConfigextModel = new ConfigextModel();
    return (body = {
      id: this.editItem.id,
      comments: this.editItem.comments ? this.editItem.comments : null,
      description: this.editItem.description,
      cusT_ID: this.selectedCustomer ? this.selectedCustomer : -1,
      enD_DATE: this.editItem.enD_DATE===null?null:this._util.setLocaleDate(this.editItem.enD_DATE),
      isactive: true,
      isencrypt: this.editItem.isencrypt,
      key: this.editItem.key,
      proJ_ID: this.selectedProject ? this.selectedProject : null,
      starT_DATE: this.editItem.starT_DATE===null || undefined?null:this._util.setLocaleDate(this.editItem.starT_DATE),
      value: this.editItem.value,
    });
  }

  DeleteRow_onClick(element) {
    if (confirm("Are you sure you want to delete the record?")) {
      this._appservice.DeleteConfiguration(element).subscribe(
        (data) => {
          this.getConfigextDetails();
        },
        (error) => {
          this._util.serviceError(error);
        },

        () => {
          alert("Deleted Successfully");
        }
      );
    }
  }
  Filter_onChange($event) {
    this.filteredData = $event;
    this.filterCriteria = $event.criteria;
    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.result);
    this.dataSource = new MatTableDataSource(this.filteredData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


}

export class ConfigextModel {
  id: number;
  comments: string;
  description: string;
  cusT_ID: string;
  enD_DATE: Date;
  isactive: boolean;
  isencrypt: boolean;
  key: string;
  proJ_ID: string;
  starT_DATE: Date;
  value: string;
}
