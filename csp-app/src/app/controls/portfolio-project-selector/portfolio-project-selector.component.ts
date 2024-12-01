import { Component, OnInit, Input, ViewChild, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { AppsService } from '../../Services/apps.service';
import { myUtility } from '../../Shared/myUtility';
import { ProductModelNew, ProjectModelNew } from '../../models/portfolio-model';
import { MatSelect, MatOption, MatSelectChange } from '@angular/material';
import { SharedService } from '../../Shared/shared.service';


@Component({
  selector: 'app-portfolio-project-selector',
  templateUrl: './portfolio-project-selector.component.html',
  styleUrls: ['./portfolio-project-selector.component.scss']
})
export class PortfolioProjectSelectorComponent implements OnInit {
  @Input("custId") custId: string;
  @Input("portinput") portinput: number[];
  @Input("projinput") projinput: string[];
  @Input("prodinput") prodinput:string[];
  @Input("allproj") allproj: boolean
  portfolioprojectMap: ProjectModelNew[] = [];
  projectList: ProjectModelNew[];
  @ViewChild('mySel') projectSelect: MatSelect;
  @ViewChild('select') portselect: MatSelect;
  @ViewChild('myprodSel') prodSelect: MatSelect;
  projArray: any[];
  portArray: number[];
  portfolioList: any[];
  IsPremier: boolean = false;
  multiProject: boolean = true;
  @ViewChild('allSelected') allSelected: MatOption;
  @ViewChild('allProjectsSelected') allProjectsSelected: MatOption;
  @ViewChild('allProdsSelected') allProdsSelected :MatOption;
  projects: any[] = [];
  @Output() projectsSelected: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() prodSelected: EventEmitter<string[]> = new EventEmitter<string[]>();
  allPortfolio: boolean;
  projectId: string;
  prodArray : any[];
  portfolioprodMap: ProductModelNew[] = [];
  productList: ProductModelNew[];
  constructor(private _appservice: AppsService, public _util: myUtility, private _shared: SharedService,
    private cdref: ChangeDetectorRef) { }

  ngOnInit() {
    if (this._util.IsPremier(this.custId))
      this.service_getPortfolioDetails();
        
    else
      this.getProjectListForACustomer();
  }

  // ngAfterViewChecked() {
  //   this.allProjectsSelected.select();
  //   this.toggleProjectSelection();
  // }

  service_getPortfolioDetails() {
    this._appservice.GetPortfolioList().subscribe(data => {
      this.portfolioList = data;
      this.service_getProductPortfolioMapping();
    }, error => { this._util.serviceError(error); },
      () => { 
          this.service_getProjectPortfolioMapping();
       }
    )
  }
  
  service_getProductPortfolioMapping()
  {
    this._appservice.GetProductList(this.custId, 0).subscribe(data => {
      this.portfolioprodMap = data;
      
    },error => {this._util.serviceError(error);},
    // () => {
    //   if (this.portinput != undefined && this.portinput.length > 0) {
    //     this.portArray = this.portinput;
    //     this.getProdListForPremier(this.portArray);
    //     this.portinput = undefined;
    //     this.projinput = undefined;
    //     return;
    //   }
    //   this.allSelected.select();
    //   this.toggleSelection();
    // }
    );
  }
  service_getProjectPortfolioMapping() {
    this._appservice.getProjectPortfolioMapping(this.custId, this._util.ShouldLoadAllProjects()).subscribe(
      data => {
        this.portfolioprojectMap = data;
      },
      error => { },
      () => {
        if (this.portinput != undefined && this.portinput.length > 0) {
          this.portArray = this.portinput;
          this.getProjectListForPremier1(this.portArray);
          this.portinput = undefined;
          this.projinput = undefined;
          return;
        }
        this.allSelected.select();
        this.toggleSelection();
        //this.service_getProductPortfolioMapping();
      }
    )
  }

  tosslePerOne(all) {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
    if (this.portArray.length == this.portfolioList.length)
      this.allSelected.select();
    this.emitChanges()
  }

  tosslePerProject() {
    if (this.allProjectsSelected.selected) {
      this.allProjectsSelected.deselect();
      return false;
    }
    if (this.projArray.length == this.projectList.length)
      this.allProjectsSelected.select();
    this.emitChanges()
  }
  tosslePerProduct() {
    if (this.allProdsSelected.selected) {
      this.allProdsSelected.deselect();
      return false;
    }
    if (this.prodArray.length == this.productList.length)
       this.allProdsSelected.select();
   this.emitChanges()
  }

  toggleSelection() {
    if (this.allSelected.selected)
      this.portselect.options.forEach((item: MatOption) => item.select());
    else
      this.portselect.options.forEach((item: MatOption) => item.deselect());
  }

  toggleProjectSelection() {
    if (this.allProjectsSelected.selected)
      this.projectSelect.options.forEach((item: MatOption) => item.select());
    else
      this.projectSelect.options.forEach((item: MatOption) => item.deselect());
   // console.log("proj array", this.projArray);
  }
  toggleProdSelection() {
    if (this.allProdsSelected.selected)
      this.prodSelect.options.forEach((item: MatOption) => item.select());
    else
      this.prodSelect.options.forEach((item: MatOption) => item.deselect());
    //console.log("prod array", this.projArray);
  }

  ddProject_Onchange() {
    this.emitChanges();
  }

  ddProduct_Onchange()
  {
    this.emitChanges();
  }
  getProdListForPremier(portfolioArray: number[]){
   this.productList = [];
   portfolioArray.forEach(x => {
    let array = this.portfolioprodMap.filter(y => y.portfoliO_ID == x);
    this.productList.push(...array);
  });
  this.productList.sort((a,b)=>a.producT_TITLE > b.producT_TITLE ? 1 : a.producT_TITLE < b.producT_TITLE ? -1:0);
  this.prodArray = this.productList.map(x => x.id);

    if (this.projinput != undefined && this.projinput.length > 0)
      this.prodArray = this.prodinput;
  }
  getProjectListForPremier1(portfolioArray: number[]) {
    this.projectList = [];
    portfolioArray.forEach(x => {
      let array = this.portfolioprojectMap.filter(y => y.portfolio_id == x);
      this.projectList.push(...array);
    });

    this.projectList.sort((a, b) => a.proj_nm > b.proj_nm ? 1 : a.proj_nm < b.proj_nm ? -1 : 0);

    this.projArray = this.projectList.map(x => x.proj_id);

    if (this.projinput != undefined && this.projinput.length > 0)
      this.projArray = this.projinput;

    this.getProdListForPremier(portfolioArray);
    this.emitChanges();
  }

  async delay(ms: number) {
    await new Promise(resolve => setTimeout(() => resolve(), ms)).then();
  }

  getProjectListForPremier(portfolioArray: number[]) {
    // if(portfolioArray.length == 1 && portfolioArray[0] == -1)
    //   return;

    // if(!this.CheckIfAllSelected())
    // {
    //     portfolioArray.splice(0, 1);
    //     this.portArray = portfolioArray
    // }
    // else
    // {
    //   if(!portfolioArray.includes(-1))
    //   {
    //     portfolioArray.unshift(-1);
    //   }
    //   this.portArray = portfolioArray
    // }

    this.projectList = [];
    
    portfolioArray.forEach(x => {
      let array = this.portfolioprojectMap.filter(y => y.portfolio_id == x);
      this.projectList.push(...array);
    });

    this.projectList.sort((a, b) => a.proj_nm > b.proj_nm ? 1 : a.proj_nm < b.proj_nm ? -1 : 0);

    // giving a small delay so that the mat option will get filled with newly created array
    this.delay(100).then(any => {
      this.projectSelect.options.forEach((item: MatOption) => item.select());
    });

    this.projArray = this.projectList.map(x => x.proj_id);

    this.productList = [];
    portfolioArray.forEach(x => {
      let array = this.portfolioprodMap.filter(y => y.portfoliO_ID == x);
      this.productList.push(...array);
    });
    this.productList.sort((a,b) => a.producT_TITLE > b.producT_TITLE ? 1 : a.producT_TITLE < b.producT_TITLE ? -1 : 0);

    this.delay(100).then(any => {
      this.prodSelect.options.forEach((item: MatOption) => item.select());
    });

    this.prodArray = this.productList.map(x => x.id);

    this.emitChanges();
  }

  CheckIfAllSelected() {
    let selectArray = this.portselect.options.toArray();

    for (let i = 1; i < selectArray.length; i++) {
      if (selectArray[i].selected)
        continue;
      else
        return false
    }
    return true;

  }
  getProjectListForACustomer() {
    this.projectList = [];

    this._appservice.GetCustomerProjectsName(this.custId, this.allproj || this._util.ShouldLoadAllProjects()).subscribe(
      data => {
        this.projects = data;
      },
      (error) => { },
      () => {
        if (this.projects.length < 2) {
          this.multiProject = false;          
        }

        this.projects.forEach(x => {
          let c = new ProjectModelNew()
          c.proj_id = x.proJ_ID;
          c.proj_nm = x.proJ_NM
          this.projectList.push(c);
        })

        this.projectList.sort((a, b) => a.proj_nm > b.proj_nm ? 1 : a.proj_nm < b.proj_nm ? -1 : 0);
        this.cdref.detectChanges();

        this.projArray = this.projectList.map(x => x.proj_id);
        if (this.projArray.length == this.projectList.length)
          this.projArray.push(-1);

          // Fix for single project issue in dashboard filter
        if (this.projectList != undefined && this.projectList.length == 1) {
          this.projectId = this.projectList[0].proj_id;
          this.emitChanges();
        }

        if (this.projinput != undefined && this.projinput.length > 0) {
          this.projArray = this.projinput;

          this.emitChanges();
        }
      }
    )
  }

  emitChanges() {
    let str: string[] = this.projArray

    this._shared.selectedPortfolios = this.portArray;
    this._shared.selectedProjects = this.projArray;
    this.projectsSelected.emit(this._shared.selectedProjects);
    this._shared.selectedProducts = this.prodArray
    this.prodSelected.emit(this._shared.selectedProducts);
  }
}
