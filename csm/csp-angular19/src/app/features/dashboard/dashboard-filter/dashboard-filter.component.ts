import { Component, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelect } from '@angular/material/select';
import { MatOptionModule, MatOption } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MyUtility } from '../../../shared/my-utility';
import { AppsService } from '../../../core/services/apps.service';
import { NavbarNewComponent } from '../../../components/navbar-new/navbar-new.component';
import { MenuComponent } from '../../../components/menu/menu.component';
import { CsmCustomerDashboardComponent } from '../../csm-dashboard/csm-customer-dashboard/csm-customer-dashboard.component';
import type { ProjectModelNew, PortfolioModel } from '../../../models/portfolio.model';

@Component({
  selector: 'app-dashboard-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatTabsModule,
    MatInputModule,
    NavbarNewComponent,
    MenuComponent,
    CsmCustomerDashboardComponent
  ],
  templateUrl: './dashboard-filter.component.html',
  styleUrls: ['./dashboard-filter.component.scss'],
  host: {
    'style': 'display: block; margin: 0 !important; padding: 0 !important;'
  }
})
export class DashboardFilterComponent implements OnInit {
  
  menuToggleStatus: boolean = false;
  selectedPeriod: string = 'asToday';
  selectedCust: string = '';
  selectedProj: any[] = [];
  selectedPortfolio: number[] = [];
  empid: string = '';
  customerId: string = '';
  projId: string[] = [];
  portId: number[] = [];
  customers: any[] = [];
  projects: any[] = [];
  portfolioList: PortfolioModel[] = [];
  projectList: any[] = [];
  portfolioprojectMap: ProjectModelNew[] = [];
  loading: boolean = false;
  isChecked: boolean = false;
  projectSearchText: string = '';
  filteredProjects: any[] = [];
  
  @ViewChild('allSelected') allSelected!: MatOption;
  @ViewChild('projectSelect') projectSelect!: MatSelect;
  @ViewChild('portSelect') portselect!: MatSelect;
  @Output() toggle: EventEmitter<any> = new EventEmitter();
  
  constructor(
    private _appservice: AppsService,
    public _util: MyUtility
  ) { }

  ngOnInit(): void {
    this.empid = localStorage.getItem('empid') || '';
    this.loadProjects(this.empid);
  }

  loadProjects(empid: string): void {
    this.getCustomerList(empid);
  }

  getCustomerList(empId: string): void {
    this._appservice.getCustomerList(empId, false).subscribe({
      next: (data: any) => {
        this.customers = data;
        
        if (this.customers.length > 0) {
          this.selectedCust = this.customers.filter(x => x.cusT_ID)[0].cusT_ID;
          this.getProjects();
          
          if (this._util.IsPremier(this.selectedCust)) {
            this.service_getPortfolioDetails();
          }
        }
      },
      error: (err: any) => {
        this._util.serviceError(err);
      }
    });
  }

  service_getPortfolioDetails(): void {
    this._appservice.getPortfolioList().subscribe({
      next: (data: PortfolioModel[]) => {
        this.portfolioList = data;
        this.selectedPortfolio = this.portfolioList.map(p => p.id);
        if (this.selectedPortfolio.length == this.portfolioList.length) {
          this.selectedPortfolio.push(-1);
        }
      },
      error: (error: any) => {
        this._util.serviceError(error);
      },
      complete: () => {
        this.service_getProjectPortfolioMapping();
      }
    });
  }

  service_getProjectPortfolioMapping(): void {
    this._appservice.getProjectPortfolioMapping(this.selectedCust, this._util.ShouldLoadAllProjects()).subscribe({
      next: (data: ProjectModelNew[]) => {
        this.portfolioprojectMap = data;
      },
      error: (error: any) => {
        this._util.serviceError(error);
      },
      complete: () => {
        this.getProjectListForPremier(this.selectedPortfolio);
        if (this.allSelected) {
          this.allSelected.select();
          this.toggleSelection();
        }
      }
    });
  }

  getProjectListForPremier(portId: number[]): void {
    this.projects = [];
    portId.forEach(element => {
      let array = this.portfolioprojectMap.filter(y => y.portfolio_id == element);
      this.projects.push(...array);
    });

    this.projects.sort((a, b) => a.proj_nm > b.proj_nm ? 1 : a.proj_nm < b.proj_nm ? -1 : 0);
    this.filteredProjects = [...this.projects];
    this.selectedProj = this.projects.map(x => x.proj_id);
    this.projId = this.selectedProj;
    
    if (this.selectedProj.length == this.projects.length) {
      this.selectedProj.push('-1');
    }
  }

  getProjects(): void {
    if (this.selectedCust == null || this.selectedCust == undefined) {
      return;
    }
    
    this._appservice.getAllProjectsForCustomer(this.selectedCust).subscribe({
      next: (data: any) => {
        this.projects = data;
        this.filteredProjects = [...this.projects];
        this.selectedProj = this.projects.map(p => p.proJ_ID);
        if (this.selectedProj.length == this.projects.length) {
          this.selectedProj.push('-1');
        }
        this.customerId = this.selectedCust;
        this.projId = this.selectedProj;
        this.loading = true;
      },
      error: (err: any) => {
        this._util.serviceError(err);
      }
    });
  }

  tosslePerProjectAll(): void {
    if (this.allSelected && this.allSelected.selected) {
      this.projectSelect.options.forEach((item: MatOption) => item.select());
    } else if (this.projectSelect) {
      this.projectSelect.options.forEach((item: MatOption) => item.deselect());
    }
  }

  toggleSelection(): void {
    if (this.allSelected && this.allSelected.selected) {
      this.portselect?.options.forEach((item: MatOption) => item.select());
    } else if (this.portselect) {
      this.portselect.options.forEach((item: MatOption) => item.deselect());
    }
  }

  tosslePerProject(): void {
    if (this.allSelected && this.allSelected.selected) {
      this.allSelected.deselect();
      return;
    }
    
    if (this.selectedProj.length == this.projects.length && this.allSelected) {
      this.allSelected.select();
    }
  }

  tosslePerOne(): void {
    if (this.allSelected && this.allSelected.selected) {
      this.allSelected.deselect();
      return;
    }
    
    if (this.selectedPortfolio.length == this.portfolioList.length && this.allSelected) {
      this.allSelected.select();
    }
  }

  onMenuToggleChange(value: boolean): void {
    this.menuToggleStatus = value;
  }

  selectedCust_OnChange(event: string): void {
    if (this._util.IsPremier(event)) {
      this.service_getPortfolioDetails();
    }
    this.getProjects();
  }

  portfolio_OnChange(portId: number[]): void {
    this.getProjectListForPremier(portId);
    this.portId = portId;
  }

  selectedProjects_OnChange(projId: string[]): void {
    this.projId = projId;
  }

  filterProjects(): void {
    const searchText = this.projectSearchText.toLowerCase().trim();
    if (!searchText) {
      this.filteredProjects = [...this.projects];
    } else {
      this.filteredProjects = this.projects.filter(proj => {
        const projectName = this._util.IsPremier(this.selectedCust) ? proj.proj_nm : proj.proJ_NM;
        return projectName?.toLowerCase().includes(searchText);
      });
    }
  }

  clearProjectSearch(event: Event): void {
    event.stopPropagation();
    this.projectSearchText = '';
    this.filterProjects();
  }
}
