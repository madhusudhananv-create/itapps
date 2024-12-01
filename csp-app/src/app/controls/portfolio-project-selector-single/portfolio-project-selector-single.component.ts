import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { AppsService } from '../../Services/apps.service';
import { myUtility } from '../../Shared/myUtility';
import { ProjectModelNew } from '../../models/portfolio-model';
import { MatSelect, MatOption, } from '@angular/material';
import { SharedService } from '../../Shared/shared.service';
 

@Component({
  selector: 'app-portfolio-project-selector-single',
  templateUrl: './portfolio-project-selector-single.component.html',
  styleUrls: ['./portfolio-project-selector-single.component.scss']
})
export class PortfolioProjectSelectorSingleComponent implements OnInit {
  @Input("custId") custId: string;
  @Input("portinput") portinput : number[];
  @Input("projinput") projinput : string[];
  @Input("allproj") allproj : boolean = false;
  portfolioprojectMap : ProjectModelNew[] = [];
  projectList : ProjectModelNew[];
  @ViewChild('mySel') projectSelect: MatSelect;
  @ViewChild('select') portselect: MatSelect;
  projArray : string;
  portArray : number;
  portfolioList : any[];
  IsPremier : boolean = false;
  multiProject : boolean = false;
  @ViewChild('allSelected') allSelected : MatOption;
  @ViewChild('allProjectsSelected') allProjectsSelected : MatOption;
  @Output() projectsSelected: EventEmitter<string > = new EventEmitter<string >();
  allPortfolio: boolean;

  constructor(private _appservice: AppsService, public _util : myUtility, private _shared : SharedService) { }

  ngOnInit() 
  {
    if(this._util.IsPremier(this.custId))
      this.service_getPortfolioDetails(); 
    else
      this.getProjectListForACustomer();

    
  }

  ngOnChanges(){
    this.getProjectListForACustomer();
  }

  getprojectTootip(){
    if(this.projectList!= undefined && this.projectList.length >0)
      return this.projectList.filter(x=>x.proj_id == this.projArray)[0].proj_nm;
    return "";  
  }
  service_getPortfolioDetails()
  {
    this._appservice.GetPortfolioList().subscribe(data => {
      this.portfolioList = data;
    }, error => { this._util.serviceError(error); },
    () => {this.service_getProjectPortfolioMapping();}

    )
  }

  service_getProjectPortfolioMapping()
  {
    this._appservice.getProjectPortfolioMapping(this.custId, this._util.ShouldLoadAllProjects()).subscribe(
      data => {
        this.portfolioprojectMap = data;
      },
      error => {},
      () => {
        this.allSelected.select();
        this.toggleSelection()
       
        if(this.portinput != undefined && this.portinput.length > 0)
        {
          this.portArray = this.portinput[0];
          this.getProjectListForPremier1(-1);
        }
        
      }
    )
  }

  tosslePerOne(all) {
    // if (this.allSelected.selected) {
    //   this.allSelected.deselect();
    //   return false;
    // }
    // if (this.portArray.length == this.portfolioList.length)
    //   this.allSelected.select();
    this.emitChanges()
  }

  tosslePerProject()
  {
    // if (this.allProjectsSelected.selected) {
    //   this.allProjectsSelected.deselect();
    //   return false;
    // }
    // if (this.projArray.length == this.projectList.length)
    //   this.allProjectsSelected.select();
    this.emitChanges()
  }

  toggleSelection()
  {
      // if(this.allSelected.selected)
      //  // this.portArray = this.portselect.options.toArray().map(x => x.value);
      //   this.portselect.options.forEach((item : MatOption) => item.select());
      // else
      //   this.portselect.options.forEach((item : MatOption) => item.deselect());

      // this.portArray = [];
      // this.getProjectListForPremier(this.portArray);
  }

  toggleProjectSelection()
  {
      if(this.allProjectsSelected.selected)
        this.projectSelect.options.forEach((item : MatOption) => item.select());
      else
        this.projectSelect.options.forEach((item : MatOption) => item.deselect());
  }
  
  ddProject_Onchange()
  {
    this.emitChanges();
  }

  getProjectListForPremier1(portfolioArray : number )
  {
   
    this.projectList = [];
    if(portfolioArray == undefined || portfolioArray ==null) return;

    if(portfolioArray ==-1)
      this.projectList.push(...this.portfolioprojectMap);

    else{ 
      let array = this.portfolioprojectMap.filter(y => y.portfolio_id == portfolioArray);
      this.projectList.push(...array);
    }

    this.projectList.sort((a, b) => a.proj_nm > b.proj_nm ? 1 : a.proj_nm < b.proj_nm ? -1 : 0);
 
    this.projArray = this.projectList.map(x => x.proj_id)[0];

    if(this.projinput != undefined && this.projinput.length > 0)
      this.projArray = this.projinput[0];
   
    this.emitChanges();
  }

  async delay(ms: number) {
    await new Promise(resolve => setTimeout(()=>resolve(), ms)).then();
  }

  // getProjectListForPremier(portfolioArray : number[])
  // {
  //   this.projectList = [];
     
  //   if(portfolioArray == undefined || portfolioArray ==null) return;
  //   if(portfolioArray.length==0)
  //     this.projectList.push(...this.portfolioprojectMap);

  //   portfolioArray.forEach(x => {
  //     let array = this.portfolioprojectMap.filter(y => y.portfolio_id == x);
  //     this.projectList.push(...array);
  //   });

  //   this.projectList.sort((a, b) => a.proj_nm > b.proj_nm ? 1 : a.proj_nm < b.proj_nm ? -1 : 0);

  //   // giving a small delay so that the mat option will get filled with newly created array
  //   this.delay(100).then(any=>{
  //     this.projectSelect.options.forEach((item : MatOption) => item.select());
  //   });
    
  //   this.projArray = this.projectList.map(x => x.proj_id)[0];
  //   this.emitChanges();
  // }

  CheckIfAllSelected()
  {
    let selectArray = this.portselect.options.toArray();
        
    for(let i = 1 ; i < selectArray.length; i++)
    {
      if(selectArray[i].selected)
        continue;
      else
       return false
    }
    return true;

  }
  
  
  getProjectListForACustomer()
  {
   
    let allProj = false;// this._util.AppRoles.some(t=> t.)
    this._appservice.GetCustomerProjectsName(this.custId, this.allproj && allProj).subscribe(
      data => {
        // if(data.filter(x => x.proJ_ID == x.parenT_PROJ_ID).length < 2)
        // {
        //   this.multiProject = false;
        //   return;
        // }
        this.projectList = [];
        data.forEach(x => {
          let c = new ProjectModelNew()
          c.proj_id = x.proJ_ID;
          c.proj_nm = x.proj_alais_nm !=null? x.proj_alais_nm: x.proJ_NM;
          this.projectList.push(c);
        })

        this.projectList.sort((a, b) => a.proj_nm > b.proj_nm ? 1 : a.proj_nm < b.proj_nm ? -1 : 0);

        if(this.projectList.length>0){  
          this.projArray = this.projectList.map(x=>x.proj_id)[0];
          this.emitChanges();
        }
      },
      (error) => {},
      () => {
       // this.allProjectsSelected.select();
      //  this.toggleProjectSelection();
      }
    )

    if(this.projinput != undefined && this.projinput.length > 0)
      this.projArray = this.projinput[0];
   
   // this.emitChanges();
  }

  emitChanges()
  {
     
    
      this.projectsSelected.emit(this.projArray );
  }
}


 
