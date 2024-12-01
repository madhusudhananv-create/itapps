import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { ProjectsModel } from '../../../models/projects-model';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { Router, NavigationExtras} from '@angular/router';
import { Jsonp } from '@angular/http';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
  
  @Input('CustId') custId: string;
  projects: ProjectsModel[] = [];
  selectedProject:ProjectsModel=new ProjectsModel();
  showAddProjectBtn : boolean = false;
  //CustEditPage : boolean = false;
  //constructor(private _util: myUtility, private _appservice: AppsService) { } //bak
  constructor(private router: Router,private _util: myUtility, private _appservice: AppsService) { }  
  ngOnInit() {
    this.LoadData();
  }
  LoadData() {
    this.service_getProjectList(this.custId);
  }
  ngOnChanges(){
    this.LoadData();
  }
  service_getProjectList(custid: string) {
    if (custid != undefined) {
      this._appservice.GetRASProjectList(custid).subscribe(data => {
        this.projects = data;
        this.showAddProjectBtn = true; 
      }, error => { this._util.serviceError(error); });
    }
  }
  Project_OnClick(p:ProjectsModel)
  {          
      this.selectedProject=p;             
  }    
  OnProjectEditbtnClick(p:ProjectsModel)
  {    
      //console.log(this.router.url); ///routename
      this.selectedProject=p;       
      let url = "ras/project";
      //let myurl = `${url}/${p.cusT_ID}/${p.proJ_ID}/${p.proJ_NM}`;
      let myurl = `${url}/${p.proJ_ID}`;      
      this.router.navigateByUrl(myurl).then(e => {
        if (e) {
         // console.log("Navigation is successful!");
        } else {
        //  console.log("Navigation has failed!");
        }
      });      
  }
} 
