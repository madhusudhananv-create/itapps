import { Component, OnInit, OnChanges, SimpleChanges, AfterViewInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelect } from '@angular/material/select';
import { MatOptionModule, MatOption } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AppsService } from '../../../core/services/apps.service';
import { UtilityService } from '../../../core/services/utility.service';
import { SharedService } from '../../shared.service';
import { ProductModelNew, ProjectModelNew, PortfolioModel } from '../../../models/portfolio.model';

@Component({
  selector: 'app-portfolio-project-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './portfolio-project-selector.component.html',
  styleUrls: ['./portfolio-project-selector.component.scss']
})
export class PortfolioProjectSelectorComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() custId: string = '';
  @Input() portinput?: number[];
  @Input() projinput?: string[];
  @Input() prodinput?: number[];
  @Input() allproj: boolean = false;  // Load all or active projects only
  @Input() showProduct: boolean = false;
  @Input() singleSelect: boolean = false;  // Force single-select mode (for KPI)

  @Output() projectsSelected = new EventEmitter<string[]>();
  @Output() prodSelected = new EventEmitter<number[]>();

  @ViewChild('mySel') projectSelect!: MatSelect;
  @ViewChild('select') portselect!: MatSelect;
  @ViewChild('myprodSel') prodSelect!: MatSelect;
  @ViewChild('allSelected') allSelected!: MatOption;
  @ViewChild('allProjectsSelected') allProjectsSelected!: MatOption;
  @ViewChild('allProdsSelected') allProdsSelected!: MatOption;

  portfolioprojectMap: ProjectModelNew[] = [];
  projectList: ProjectModelNew[] = [];
  filteredProjectList: ProjectModelNew[] = [];
  projectSearchText: string = '';
  projArray: string[] = [];

  portArray: number[] = [];
  portfolioList: PortfolioModel[] = [];

  prodArray: number[] = [];
  portfolioprodMap: ProductModelNew[] = [];
  productList: ProductModelNew[] = [];

  multiProject: boolean = true;
  projectId: string = '';
  projects: any[] = [];
  
  private dataLoaded: boolean = false; // Track if initial data is loaded

  private appService = inject(AppsService);
  public utilityService = inject(UtilityService);
  private sharedService = inject(SharedService);
  private cdref = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadProjectsForCustomer();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // When custId changes, reload the projects and clear selections
    if (changes['custId'] && !changes['custId'].firstChange) {
      // Clear existing selections
      this.projArray = [];
      this.portArray = [];
      this.prodArray = [];
      this.projectId = '';
      
      // Reload projects for new customer
      this.loadProjectsForCustomer();
      
      // Emit empty selection
      this.projectsSelected.emit([]);
    }
  }

  private loadProjectsForCustomer(): void {
    if (this.utilityService.IsPremier(this.custId)) {
      this.service_getPortfolioDetails();
    } else {
      this.getProjectListForACustomer();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      // Select all projects if "-1" is in projArray
      if (this.projArray.includes('-1') && this.projectSelect && this.multiProject) {
        this.projectSelect.options.forEach((item) => item.select());
        this.cdref.detectChanges();
      }
      // Select all portfolios (Premier) - only if portArray wasn't already set with specific values
      // or if it contains all portfolio IDs
      if (this.allSelected && this.portselect && this.utilityService.IsPremier(this.custId)) {
        // Only auto-select if portArray is empty (initial state) or contains all portfolios
        if (this.portArray.length === 0 || this.portArray.length === this.portfolioList.length) {
          this.allSelected.select();
          this.portselect.options.forEach((item) => item.select());
        }
        this.cdref.detectChanges();
      }
    }, 100); // slight increase to ensure options are rendered
  }

  service_getPortfolioDetails(): void {
    this.appService.getPortfolioList().subscribe({
      next: (data) => {
        this.portfolioList = data;
        this.service_getProductPortfolioMapping();
      },
      error: (error) => {
        this.utilityService.serviceError(error);
      },
      complete: () => {
        this.service_getProjectPortfolioMapping();
      }
    });
  }

  service_getProductPortfolioMapping(): void {
    this.appService.getProductList(this.custId, 0).subscribe({
      next: (data) => {
        this.portfolioprodMap = data;
      },
      error: (error) => {
        this.utilityService.serviceError(error);
      }
    });
  }

  service_getProjectPortfolioMapping(): void {
    this.appService.getProjectPortfolioMapping(
      this.custId,
      this.utilityService.ShouldLoadAllProjects()
    ).subscribe({
      next: (data) => {
        this.portfolioprojectMap = data;
      },
      error: () => { },
      complete: () => {
        
        // Check if portinput was provided with values
        if (this.portinput && this.portinput.length > 0) {
          this.portArray = this.portinput;
          this.getProjectListForPremier1(this.portArray);
          this.portinput = undefined;
          this.projinput = undefined;
          return;
        }
        
        // If portArray is empty or only has -1, auto-select all portfolios
        if (this.portArray.length === 0 || (this.portArray.length === 1 && this.portArray[0] === -1)) {
          // Select all portfolio IDs
          this.portArray = this.portfolioList.map(p => p.id);
          // Add -1 to mark "All" as selected
          this.portArray.unshift(-1);
        }
        
        // Always call getProjectListForPremier1 to populate projects
        this.getProjectListForPremier1(this.portArray);
      }
    });
  }

  tosslePerOne(): boolean {
    if (this.allSelected?.selected) {
      this.allSelected.deselect();
      return false;
    }
    // Check if all portfolio IDs are selected (excluding the -1 marker)
    const allPortfoliosSelected = this.portfolioList.every(port => this.portArray.includes(port.id));
    if (allPortfoliosSelected && this.allSelected && !this.portArray.includes(-1)) {
      this.allSelected.select();
      this.portArray.unshift(-1); // Add -1 marker when all are selected
    }
    
    // Update project list based on selected portfolios
    this.getProjectListForPremier(this.portArray);
    
    return true;
  }

  tosslePerProject(): boolean {
    if (this.allProjectsSelected?.selected) {
      this.allProjectsSelected.deselect();
      return false;
    }
    // Check if all project IDs are selected (excluding the '-1' marker)
    const allProjectsSelected = this.projectList.every(proj => this.projArray.includes(proj.proj_id));
    if (allProjectsSelected && this.allProjectsSelected && !this.projArray.includes('-1')) {
      this.allProjectsSelected.select();
      this.projArray.unshift('-1'); // Add '-1' marker when all are selected
    }
    this.emitChanges();
    return true;
  }

  tosslePerProduct(): boolean {
    if (this.allProdsSelected?.selected) {
      this.allProdsSelected.deselect();
      return false;
    }
    // Check if all product IDs are selected (excluding the -1 marker)
    const allProductsSelected = this.productList.every(prod => this.prodArray.includes(prod.id));
    if (allProductsSelected && this.allProdsSelected && !this.prodArray.includes(-1)) {
      this.allProdsSelected.select();
      this.prodArray.unshift(-1); // Add -1 marker when all are selected
    }
    this.emitChanges();
    return true;
  }

  toggleSelection(): void {
    if (this.allSelected?.selected) {
      this.portselect.options.forEach((item: MatOption) => item.select());
    } else {
      this.portselect.options.forEach((item: MatOption) => item.deselect());
    }
    // Emit changes after toggling portfolio selection
    setTimeout(() => {
      this.emitChanges();
    }, 100);
  }

  toggleProjectSelection(): void {
    if (this.allProjectsSelected?.selected) {
      this.projectSelect.options.forEach((item: MatOption) => item.select());
    } else {
      this.projectSelect.options.forEach((item: MatOption) => item.deselect());
    }
    // Emit changes after toggling project selection
    setTimeout(() => {
      this.emitChanges();
    }, 100);
  }

  toggleProdSelection(): void {
    if (this.allProdsSelected?.selected) {
      this.prodSelect.options.forEach((item: MatOption) => item.select());
    } else {
      this.prodSelect.options.forEach((item: MatOption) => item.deselect());
    }
  }

  ddProject_Onchange(): void {
    this.emitChanges();
  }

  ddProduct_Onchange(): void {
    this.emitChanges();
  }

  getProdListForPremier(portfolioArray: number[]): void {
    this.productList = [];
    
    // If only -1 is selected, expand to all portfolio IDs
    let actualPortfolios: number[];
    if (portfolioArray.length === 1 && portfolioArray[0] === -1) {
      // "All" is selected - use all portfolio IDs
      actualPortfolios = this.portfolioList.map(p => p.id);
    } else {
      // Filter out -1 marker from the array
      actualPortfolios = portfolioArray.filter(id => id !== -1);
    }
    
    actualPortfolios.forEach(x => {
      const array = this.portfolioprodMap.filter(y => y.portfoliO_ID === x);
      this.productList.push(...array);
    });
    this.productList.sort((a, b) =>
      a.producT_TITLE > b.producT_TITLE ? 1 : a.producT_TITLE < b.producT_TITLE ? -1 : 0
    );
    
    if (this.prodinput && this.prodinput.length > 0) {
      this.prodArray = this.prodinput;
    } else {
      // Select all products by default
      this.prodArray = this.productList.map(x => x.id);
      if (this.productList.length > 0) {
        this.prodArray.unshift(-1); // Add -1 to mark "All" as selected
      }
    }
  }

  getProjectListForPremier1(portfolioArray: number[]): void {
    this.projectList = [];
    
    // If only -1 is selected, expand to all portfolio IDs
    let actualPortfolios: number[];
    if (portfolioArray.length === 1 && portfolioArray[0] === -1) {
      // "All" is selected - use all portfolio IDs
      actualPortfolios = this.portfolioList.map(p => p.id);
    } else {
      // Filter out -1 marker from the array
      actualPortfolios = portfolioArray.filter(id => id !== -1);
    }
    
    actualPortfolios.forEach(x => {
      const array = this.portfolioprojectMap.filter(y => y.portfolio_id === x);
      this.projectList.push(...array);
    });

    this.projectList.sort((a, b) =>
      a.proj_nm > b.proj_nm ? 1 : a.proj_nm < b.proj_nm ? -1 : 0
    );
    
    this.filteredProjectList = [...this.projectList];
    this.projectSearchText = '';

    // Handle project selection based on number of projects
    if (this.projinput && this.projinput.length > 0) {
      // Use provided input
      this.projArray = this.projinput;
    } else if (this.projectList.length === 1) {
      // Single project - auto-select it (no '-1')
      this.projArray = [this.projectList[0].proj_id];
      this.projectId = this.projectList[0].proj_id;
    } else if (this.projectList.length > 1) {
      // Multiple projects - select all by default
      this.projArray = this.projectList.map(x => x.proj_id);
      this.projArray.unshift('-1'); // Add '-1' to mark "All" as selected
    } else {
      // No projects
      this.projArray = [];
    }

    this.getProdListForPremier(portfolioArray);
    
    // Detect changes after modifying projectList and projArray
    this.cdref.detectChanges();
    
    // Mark data as loaded after first initialization
    this.dataLoaded = true;
    
    this.emitChanges();
    // At the end of both methods, after setting projArray:
    setTimeout(() => {
      if (this.projectList.length > 1) {
        // Only select all project checkboxes if all projects are in projArray
        if (this.allProjectsSelected && this.projectSelect && this.projArray.includes('-1')) {
          this.allProjectsSelected.select();
          this.projectSelect.options.forEach((item) => item.select());
        }
      }
      // Portfolio auto-selection - select all checkboxes when -1 is in portArray
      if (this.allSelected && this.portselect && this.portArray.includes(-1)) {
        this.allSelected.select();
        this.portselect.options.forEach((item) => item.select());
      }
      if (this.productList.length > 0 && this.allProdsSelected && this.prodSelect && this.prodArray.includes(-1)) {
        this.allProdsSelected.select();
        this.prodSelect.options.forEach((item) => item.select());
      }
      this.cdref.detectChanges();
    }, 150);
  }



  getProjectListForPremier(portfolioArray: number[]): void {
    // If data not loaded yet, skip - getProjectListForPremier1 will be called from initialization
    if (!this.dataLoaded) {
      return;
    }
    
    // If portfolio list not loaded yet, can't expand "All"
    if (this.portfolioList.length === 0) {
      return;
    }
    
    // If only -1 is selected, expand to all portfolio IDs
    let actualPortfolios: number[];
    if (portfolioArray.length === 1 && portfolioArray[0] === -1) {
      // "All" is selected - use all portfolio IDs
      actualPortfolios = this.portfolioList.map(p => p.id);
    } else {
      // Filter out -1 marker from the array
      actualPortfolios = portfolioArray.filter(id => id !== -1);
    }
    
    this.projectList = [];

    actualPortfolios.forEach(x => {
      const array = this.portfolioprojectMap.filter(y => y.portfolio_id === x);
      this.projectList.push(...array);
    });

    this.projectList.sort((a, b) =>
      a.proj_nm > b.proj_nm ? 1 : a.proj_nm < b.proj_nm ? -1 : 0
    );
    
    this.filteredProjectList = [...this.projectList];
    this.projectSearchText = '';

    // Handle project selection based on number of projects
    if (this.projectList.length === 1) {
      // Single project - auto-select it (no '-1')
      this.projArray = [this.projectList[0].proj_id];
      this.projectId = this.projectList[0].proj_id;
    } else if (this.projectList.length > 1) {
      // Multiple projects - select all by default
      this.projArray = this.projectList.map(x => x.proj_id);
      this.projArray.unshift('-1'); // Add '-1' to mark "All" as selected
    } else {
      // No projects
      this.projArray = [];
    }

    this.productList = [];
    actualPortfolios.forEach(x => {
      const array = this.portfolioprodMap.filter(y => y.portfoliO_ID === x);
      this.productList.push(...array);
    });
    this.productList.sort((a, b) =>
      a.producT_TITLE > b.producT_TITLE ? 1 : a.producT_TITLE < b.producT_TITLE ? -1 : 0
    );

    // Select all products by default
    this.prodArray = this.productList.map(x => x.id);
    if (this.productList.length > 0) {
      this.prodArray.unshift(-1); // Add -1 to mark "All" as selected
    }

    // Detect changes after modifying projectList and productList
    this.cdref.detectChanges();

    // Auto-select UI checkboxes based on current selections
    setTimeout(() => {
      if (this.projectList.length > 1) {
        // Only select all project checkboxes if all projects are in projArray
        if (this.allProjectsSelected && this.projectSelect && this.projArray.includes('-1')) {
          this.allProjectsSelected.select();
          this.projectSelect.options.forEach((item) => item.select());
        }
      }
      // Don't auto-select portfolios here - it causes re-selection on deselect
      // Portfolio selection is already handled by user clicks and portArray binding
      
      if (this.productList.length > 0 && this.allProdsSelected && this.prodSelect && this.prodArray.includes(-1)) {
        this.allProdsSelected.select();
        this.prodSelect.options.forEach((item) => item.select());
      }
      this.cdref.detectChanges();
    }, 100);
    this.emitChanges();

  }

  CheckIfAllSelected(): boolean {
    if (!this.portselect) return false;

    const selectArray = this.portselect.options.toArray();

    for (let i = 1; i < selectArray.length; i++) {
      if (!selectArray[i].selected) {
        return false;
      }
    }
    return true;
  }

  getProjectListForACustomer(): void {
    this.projectList = [];

    this.appService.getCustomerProjectsName(
      this.custId,
      this.allproj || this.utilityService.ShouldLoadAllProjects()
    ).subscribe({
      next: (data) => {
        this.projects = data;
      },
      error: () => { },
      complete: () => {
        // Set multiProject based on singleSelect input
        // When singleSelect=true (like in KPI), use single-select mode
        // When singleSelect=false (like in action items), use multi-select mode with checkboxes
        this.multiProject = !this.singleSelect;

        this.projects.forEach(x => {
          const c: ProjectModelNew = {
            proj_id: x.proJ_ID,
            proj_nm: x.proJ_NM,
            portfolio_id: 0
          };
          this.projectList.push(c);
        });

        this.projectList.sort((a, b) =>
          a.proj_nm > b.proj_nm ? 1 : a.proj_nm < b.proj_nm ? -1 : 0
        );
        
        this.filteredProjectList = [...this.projectList];
        this.projectSearchText = '';

        // Handle project selection based on multiProject mode
        if (this.multiProject) {
          // Multi-select mode
          if (this.projinput && this.projinput.length > 0) {
            this.projArray = this.projinput;
          } else if (this.projectList.length > 0) {
            // Select all by default
            this.projArray = this.projectList.map(x => x.proj_id);
            this.projArray.unshift('-1'); // Add '-1' to mark "All" as selected
          }
        } else {
          // Single-select mode (for KPI when allproj=false)
          if (this.projinput && this.projinput.length > 0) {
            this.projectId = this.projinput[0];
          } else if (this.projectList.length > 0) {
            // Auto-select first project
            this.projectId = this.projectList[0].proj_id;
          }
        }
        
        // Detect changes after modifying multiProject and projectList
        this.cdref.detectChanges();

        setTimeout(() => {
          if (this.multiProject && this.projectList.length > 1) {
            // Only select all checkboxes if multiple projects in multi-select mode
            if (this.allProjectsSelected && this.projectSelect) {
              this.allProjectsSelected.select();
              this.projectSelect.options.forEach((item) => item.select());
              this.cdref.detectChanges();
            }
          }
          // Always emit changes to notify parent component
          // Mark data as loaded after first initialization
          this.dataLoaded = true;
          this.emitChanges();
        }, 100);
      }
    });
  }

  emitChanges(): void {
    // Filter out -1 markers before emitting (they're just for UI "All" checkbox)
    const actualPortfolios = this.portArray.filter(id => id !== -1);
    const actualProducts = this.prodArray.filter(id => id !== -1);
    
    let actualProjects: string[];
    if (this.multiProject) {
      // Multi-select mode: filter out '-1' from array
      actualProjects = this.projArray.filter(id => id !== '-1');
    } else {
      // Single-select mode: emit single projectId as array
      actualProjects = this.projectId ? [this.projectId] : [];
    }
    
    this.sharedService.selectedPortfolios = actualPortfolios;
    this.sharedService.selectedProjects = actualProjects;
    this.projectsSelected.emit(actualProjects);
    this.sharedService.selectedProducts = actualProducts;
    this.prodSelected.emit(actualProducts);
  }

  filterProjects(): void {
    const searchText = this.projectSearchText.toLowerCase().trim();
    if (!searchText) {
      this.filteredProjectList = [...this.projectList];
    } else {
      this.filteredProjectList = this.projectList.filter(proj =>
        proj.proj_nm?.toLowerCase().includes(searchText)
      );
    }
  }

  clearProjectSearch(event: Event): void {
    event.stopPropagation();
    this.projectSearchText = '';
    this.filterProjects();
  }

  getProjectName(projectId: string | undefined): string {
    if (!projectId) return '';
    const project = this.projectList.find(p => p.proj_id === projectId);
    return project ? project.proj_nm : '';
  }

  getSelectedProjectNames(): string {
    if (!this.projArray || this.projArray.length === 0) return '';
    
    const names: string[] = [];
    
    // Check if 'All' is selected and add it first
    if (this.projArray.includes('-1')) {
      names.push('All');
    }
    
    // Get project names for selected IDs (excluding 'All' option)
    const actualProjects = this.projArray.filter(id => id !== '-1');
    
    const projectNames = actualProjects
      .map(id => {
        const project = this.projectList.find(p => p.proj_id === id);
        return project ? project.proj_nm : null;
      })
      .filter(name => name !== null) as string[];
    
    names.push(...projectNames);
    
    // Join with commas
    return names.join(', ');
  }
}
