import { Component, OnInit, Input } from '@angular/core';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { CustomerModel } from '../../../models/customer-model';
import { ProjectsModel } from '../../../models/projects-model';
import { RASPageModule } from '../raspage.module';
import { RasService } from '../ras.service';

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.scss']
})
export class CustomerDetailsComponent implements OnInit {
  projects: ProjectsModel[] = [];

  constructor(public _rasUtil:RasService, private _util: myUtility, private _appservice: AppsService) { }

  ngOnInit() {
    //this.LoadData();
  }
  // LoadData() {
  //   if (this.customer != undefined && this.customer.cusT_ID != undefined)
  //     this.service_getProjectList();
  // }
  // Customer_OnClick(cusT_ID) {

  // }
  // service_getProjectList() {
  //   this._appservice.GetRASProjectList(this.customer.cusT_ID).subscribe(data => {
  //     this.projects = data;
  //   }, error => { this._util.serviceError(error); });
  // }
}
