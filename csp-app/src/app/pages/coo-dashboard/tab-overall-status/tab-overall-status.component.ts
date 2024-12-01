import { Component, OnInit,Output,ViewChild,EventEmitter } from '@angular/core';
import {FormControl} from '@angular/forms';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { LayoutService } from '../../layout/layout.service';
import { COODashboardService } from '../coo-dashboard.service';
import { MatOption, MatSelect } from '@angular/material';
import { ProjectModelNew } from '../../../models/portfolio-model';
import { DashboardSearchParams } from '../../../models/coo-dashboard-model';



@Component({
  selector: 'app-tab-overall-status',
  templateUrl: './tab-overall-status.component.html',
  styleUrls: ['./tab-overall-status.component.scss']
})
export class TabOverallStatusComponent implements OnInit {
 
  menuToggleStatus: boolean;
  selectedPeriod = 'asToday';
  selectedCust  : string;
  selectedProj : any[] = [];
  selectedPortfolio : number[] ;
  empid: string;
  customerId : string;
  projId : string[];
  portId : number[];
  customers: any[] = [];  
  projects: any[] = [];
  portfolioList: any[];
  projectList : any[]=[];
  portfolioprojectMap: ProjectModelNew[] = [];
  selectedDateType: string="1";
  loading: boolean = false;
  @ViewChild('allSelected') allSelected : MatOption;
  @ViewChild('projectSelect') projectSelect : MatSelect;
  @ViewChild('portSelect') portselect: MatSelect;
  isChecked : boolean = false;
  @Output() toggle: EventEmitter<any> = new EventEmitter();
  constructor(private _appservice: AppsService, private _coodashboardService:COODashboardService,public _util: myUtility) { 
     
  }

  ngOnInit() {
    this.empid = localStorage.getItem('empid');
   
    //this.selectedCust.push('allAccounts')
  }

   

}