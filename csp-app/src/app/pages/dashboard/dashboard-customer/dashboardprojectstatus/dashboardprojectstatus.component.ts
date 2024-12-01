import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { AppsService } from './../../../../Services/apps.service';
import { myUtility } from './../../../../Shared/myUtility';
import {enumRoles} from '../../../../Shared/enum';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboardprojectstatus',
  templateUrl: './dashboardprojectstatus.component.html',
  styleUrls: ['./dashboardprojectstatus.component.scss']
})
export class DashboardprojectstatusComponent implements OnInit {
 // @Input() legendPosition : string ;
  
  isProjectStatusEmpty: boolean;
  dashboardDetails: any;
  CustomerIds : string[] = [];
  @Input() customerLevel :boolean;
  @Input() type5;
  @Input() width5;
  @Input() height5;
  @Input() columnNames5;
  @Input() data5 ; 
  @Input() options5;
  @Input() containerCss;
  @Input() childclass;
  totalProjects = 0;
  type: any;

  constructor(private _appService : AppsService, private _myUtil : myUtility) { }
    
  ngOnInit() 
  {
    if(this.customerLevel) 
      return;

    this.getCustomerbasedProjectstatus(); 
  }

  getCustomerbasedProjectstatus()
  {
    this._appService.GetAllCustomerLevelProjectStatus().subscribe(
      data => {
        this.dashboardDetails = data;
        this._myUtil.determineCustIdsBasedOnRole().subscribe(
          data => {
            this.CustomerIds = data;
          },
          (error) => {},
          () => {
            this.populateChartValues();
          }
        )
      },
      (error) => {}
    )
  }

  // determineDataForProjectStatusBasedOnRole()
  // {
  //   if(this._myUtil.IsCSM())
  //   {
  //     this.getTaggedCustomerIds();
  //   }
  //   else if(this._myUtil.IsCustomer())
  //   {
  //     this.getCustomerId()
  //   }
  //   else if(this._myUtil.IsBUHead())
  //   {
  //     this.getAllCustomerIds()
  //   }
  // }

  // getAllCustomerIds()
  // {
  //   this._appService.getAllCustomerIds().subscribe(
  //     data => {
  //       this.CustomerIds = data;
  //       console.log(this.CustomerIds);
  //     },
  //     (error) => {},
  //     () => {
  //       this.populateChartValues()
  //     }
  //   )
  // }

  // getCustomerId()
  // {
  //   this._appService.getCustomerId(this._myUtil.AppSettings.empid).subscribe(
  //     data => {
  //       this.CustomerIds = data;
  //       console.log(this.CustomerIds);
  //     },
  //     (error) => {},
  //     () => {
  //       this.populateChartValues()
  //     }
  //   )
  // }

  // getTaggedCustomerIds()
  // {
  //   this._appService.getTaggedCustomerIds(this._myUtil.AppSettings.empid).subscribe(
  //     data => {
  //       this.CustomerIds = data;
  //       console.log(this.CustomerIds);
  //     },
  //     (error) => {},
  //     () => {
  //       this.populateChartValues();
  //     }
  //   )
  // }

  populateChartValues()
  {
//console.log("Method called");
      this.data5 = [];
      let data1 = 0;
      let data2 = 0; 
      let filteredValue;

      this.CustomerIds.forEach(y =>{
        filteredValue = +this.dashboardDetails.filter(x => (x.title == "PROJECT_TO_START") && (x.cusT_ID == y)).map(z => z.content)[0]
        if(!Number.isNaN(filteredValue))
            data1 = data1 + filteredValue;

        filteredValue = +this.dashboardDetails.filter(x => (x.title == "PROJECT_TO_END") && (x.cusT_ID == y)).map(z => z.content)[0];
        if(!Number.isNaN(filteredValue))
            data2 = data2 +  filteredValue
        
      });
      
      this.data5.push(["To Start", data1]);
      this.data5.push(["To End", data2]);
      this.totalProjects =  data1 + data2;
      this.isProjectStatusEmpty = this.totalProjects == 0 ? true : false;
      this.data5.push([null, this.totalProjects]);
  }
}
