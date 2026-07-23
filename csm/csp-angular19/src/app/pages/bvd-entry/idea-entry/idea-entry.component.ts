import { Component, OnInit, Output, EventEmitter, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, ActivatedRoute } from '@angular/router';
import { AppsService } from '../../../services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { BvdEntryService } from '../services/bvd-entry.service';
import { Idea, IdeaStatus, IdeaImprovementType, PotentialSolutionCategory } from '../../../models/bvd-entry/idea-model';
import { EmployeeSearchComponent } from '../../../components/employee-search/employee-search.component';

@Component({
  selector: 'app-idea-entry',
  templateUrl: './idea-entry.component.html',
  styleUrls: ['./idea-entry.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    EmployeeSearchComponent
  ]
})
export class IdeaEntryComponent implements OnInit {
  private _appService = inject(AppsService);
  private _util = inject(MyUtility);
  public _bvdEntry = inject(BvdEntryService);
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _cdr = inject(ChangeDetectorRef);

  @Output() setStep: EventEmitter<number> = new EventEmitter<number>();
  @ViewChild('appEmployeeSearch') appEmployeeSearch: any;

  idea = new Idea();
  status: IdeaStatus[] = [];
  improvementS_TYPE: IdeaImprovementType[] = [];
  categories: PotentialSolutionCategory[] = [];
  customerList: any[] = [];
  projects: any[] = [];
  serviceAreaList: any[] = [];
  processAreaList: any[] = [];
  processList: any[] = [];
  portfolioList: any[] = [];
  projectList: any[] = [];
  similarIdeas: any[] = [];
  employees: any[] = [];
  
  customerId: string = '';
  selectedCust: string = '';
  selectedPortfolio: string = '';
  projectId: string = '';
  ideaId: number = 0;
  empId: string = '';
  identifieD_DATE: Date | null = null;
  
  loading = false;

  // Helper method for template
  get isPremierCustomer(): boolean {
    return this.customerId ? this._util.IsPremier(this.customerId) : false;
  }

  ngOnInit() {
    this.empId = localStorage.getItem('empid') || '';
    
    // Set default identified date to today for new ideas
    this.identifieD_DATE = new Date();
    
    // Get route parameters
    this._activatedRoute.queryParams.subscribe(params => {
      this.customerId = params['customerId'] || params['customerid'] || '';
      this.projectId = params['projectId'] || params['projid'] || '';
      // Accept both 'ideaId' (lowercase) and 'Ideaid' (from View Idea navigation)
      this.ideaId = Number(params['ideaId']) || Number(params['Ideaid']) || 0;
      
      if (this.ideaId > 0) {
        // If data was already pre-loaded into service (from getIdeasDetailsById), use it
        if (this._bvdEntry.bvdidea && this._bvdEntry.bvdidea.id === this.ideaId) {
          this.idea = this._bvdEntry.bvdidea;
          if (this.idea.cusT_ID) this.customerId = this.idea.cusT_ID;
          if (this.idea.projecT_ID) this.projectId = this.idea.projecT_ID;
          if (this.idea.identifieD_DATE) this.identifieD_DATE = new Date(this.idea.identifieD_DATE);
          if (this.idea.portfoliO_ID > 0) {
            this.selectedPortfolio = this.idea.portfoliO_ID.toString();
            this.getPortfolioList().then(() => this.portfolio_OnChange());
          }
          this.getRequiredData(this.projectId);
          if (this.idea.servicE_AREA_ID > 0) this.getProcessAreas(this.idea.servicE_AREA_ID);
          if (this.idea.procesS_AREA_ID > 0) this.getProcesses(this.idea.procesS_AREA_ID);
          this.getSimilarIdeas();
        } else {
          this.fillData(this.ideaId);
        }
      }
    });

    this.getIdeaStatus();
    this.getIdeaImprovementAndCategoryList();
    this.getCustomerList();
  }

  getIdeaStatus() {
    this._bvdEntry.getIdeaStatus().subscribe({
      next: (data) => {
        this.status = data;
        if (this.status && this.status.length > 0) {
        }
        
        // Set default status to Draft (ID: 1) if not already set
        if (!this.idea.ideA_STATUS_ID || this.idea.ideA_STATUS_ID == 0) {
          this.idea.ideA_STATUS_ID = 1;
        }
      },
      error: (err: any) => {
        console.error('Error loading idea status:', err);
        this._util.serviceError(err);
      }
    });
  }

  getSimilarIdeas() {
    if (!this.idea.description || this.idea.description.trim().length === 0) {
      this.similarIdeas = [];
      return;
    }

    this.idea.cusT_ID = this.customerId;
    this.idea.projecT_ID = this.projectId;
    
    // Use setTimeout to debounce similar to legacy
    setTimeout(() => {
      this._bvdEntry.getSimilarIdeas(this.idea).subscribe({
        next: (data) => {
          this.similarIdeas = data;
        },
        error: (err: any) => {
          console.error('Error loading similar ideas:', err);
          this._util.serviceError(err);
        }
      });
    }, 500);
  }

  fillData(ideaId: number) {
    this.loading = true;
    this._bvdEntry.getIdeaById(ideaId).subscribe({
      next: async (data) => {
        this.idea = data;
        this.customerId = data.cusT_ID;
        this.projectId = data.projecT_ID;
        
        if (data.portfoliO_ID > 0) {
          this.selectedPortfolio = data.portfoliO_ID.toString();
          await this.getPortfolioList();
          this.portfolio_OnChange();
        }

        if (data.identifieD_DATE) {
          this.identifieD_DATE = new Date(data.identifieD_DATE);
        }

        this.getRequiredData(this.projectId);
        
        if (data.servicE_AREA_ID > 0) {
          this.getProcessAreas(data.servicE_AREA_ID);
        }
        
        if (data.procesS_AREA_ID > 0) {
          this.getProcesses(data.procesS_AREA_ID);
        }

        this.getSimilarIdeas();
        this.loading = false;
      },
      error: (err: any) => {
        this._util.serviceError(err);
        this.loading = false;
      }
    });
  }

  async getPortfolioList() {
    if (!this.customerId) return;

    this._appService.GetPortfolioList().subscribe({
      next: (data: any) => {
        this.portfolioList = data;
      },
      error: (err: any) => {
        console.error('Error loading portfolios:', err);
        this.portfolioList = [];
      }
    });
  }

  portfolio_OnChange() {
    if (!this.selectedPortfolio) return;
    
    this._bvdEntry.getprojectsNameForAPortfolioNew(Number(this.selectedPortfolio)).subscribe({
      next: (data: any) => {
        this.projectList = data;
      },
      error: (err: any) => {
        console.error('Error loading projects:', err);
        this.projectList = [];
      }
    });
  }

  getCustomerList() {
    if (!this.empId) return;

    this._appService.GetCustomerList(this.empId, false).subscribe({
      next: (data) => {
        
        // Don't filter if customerId is empty - show all customers
        if (this.customerId) {
          this.customerList = data.filter(x => x.cusT_ID == this.customerId);
        } else {
          this.customerList = data;
        }

        // Force change detection
        this._cdr.detectChanges();

        if (this.customerList.length > 0) {
          // If customerId is already set, use it
          if (this.customerId) {
            this.selectedCust = this.customerId;
          } else if (this.customerList.length === 1) {
            // If only one customer, auto-select it
            this.selectedCust = this.customerList[0].cusT_ID;
            this.customerId = this.selectedCust;
          }
          
          // Load projects for selected customer
          if (this.customerId || this.selectedCust) {
            this.getProjects();
          }
        }
      },
      error: (err: any) => {
        console.error('Error loading customers:', err);
        this._util.serviceError(err);
      }
    });
  }

  getProjects() {
    // Use customerId if selectedCust is not set
    const custId = this.selectedCust || this.customerId;
    if (!custId) return;

    this._appService.getAllProjectsForCustomer(custId).subscribe({
      next: (data) => {
        
        this.projects = data;
        
        // Force change detection
        this._cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading projects:', err);
        this._util.serviceError(err);
      }
    });
  }

  Service_GetServiceAreaProjectMapping(projId: string) {
    if (!projId) return;

    this._appService.getServiceAreaProjectMapping(projId).subscribe({
      next: (data) => {
        this.serviceAreaList = data;
      },
      error: (err: any) => {
        console.error('Error loading service areas:', err);
        this.serviceAreaList = [];
      }
    });
  }

  getRequiredData(projId: string) {
    if (projId) {
      this.getEmpIds(projId);
      this.Service_GetServiceAreaProjectMapping(projId);
    }
  }

  getIdeaImprovementAndCategoryList() {
    this._bvdEntry.getIdeaImprovementAndCategoryList().subscribe({
      next: (data) => {
        this.improvementS_TYPE = data.improvements;
        this.categories = data.categories;
      },
      error: (err: any) => this._util.serviceError(err)
    });
  }

  getProcessAreas(serviceAreaId: number) {
    if (!serviceAreaId) return;

    this._appService.GetProcessAreaByServiceAreaIdNew(serviceAreaId).subscribe({
      next: (data) => {
        this.processAreaList = data;
      },
      error: (err: any) => {
        console.error('Error loading process areas:', err);
        this.processAreaList = [];
      }
    });
  }

  getProcesses(processAreaId: number) {
    if (!processAreaId) return;

    this._appService.GetProcessByProcessArea(processAreaId).subscribe({
      next: (data) => {
        this.processList = data;
      },
      error: (err: any) => {
        console.error('Error loading processes:', err);
        this.processList = [];
      }
    });
  }

  getEmpIds(projid: string) {
    if (!projid) return;

    this._appService.getProjectResourceByProjId(projid).subscribe({
      next: (data) => {
        // Store employees for employee search component
        this.employees = data;
        this._cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading project resources:', err);
      }
    });
  }

  employeeSearch_onChange(event: any) {
    this.idea.identifieD_BY = event;
  }

  submitForm() {
    if (!this.idea.description || this.idea.description.length < 10) {
      (this._util as any).showWarning('Please enter at least 10 characters in Problem Description');
      return;
    }

    if (!this.idea.potentiaL_SOLUTION_DESCRIPTION) {
      (this._util as any).showWarning('Please enter values for all the required fields');
      return;
    }

    if (!this.customerId || !this.projectId) {
      (this._util as any).showWarning('Please choose customer and project');
      return;
    }

    this.idea.cusT_ID = this.customerId;
    this.idea.projecT_ID = this.projectId;
    this.idea.identifieD_DATE = this.identifieD_DATE ? this.identifieD_DATE.toISOString() : '';

    if (this.ideaId > 0) {
      this.updateIdeaComment();
    } else {
      // Mark as submitted and save
      this.idea.issubmitted = true;
      this.saveIdea();
    }
  }

  saveForm() {
    // Validate form before saving
    if (!this.idea.description || this.idea.description.length < 10) {
      (this._util as any).showWarning('Please enter at least 10 characters in Problem Description');
      return;
    }

    if (!this.idea.potentiaL_SOLUTION_DESCRIPTION) {
      (this._util as any).showWarning('Please enter values for all the required fields');
      return;
    }

    if (!this.customerId || !this.projectId) {
      (this._util as any).showWarning('Please choose customer and project');
      return;
    }

    this.idea.cusT_ID = this.customerId;
    this.idea.projecT_ID = this.projectId;
    this.idea.identifieD_DATE = this.identifieD_DATE ? this.identifieD_DATE.toISOString() : '';
    this.idea.issubmitted = false; // Save without submitting
    
    this.loading = true;
    this._bvdEntry.saveIdeaDetails(this.idea).subscribe({
      next: (data) => {
        this.idea = data;
        this.ideaId = data.id;
        this._bvdEntry.ideA_ID = data.id;
        this._bvdEntry.projecT_ID = this.projectId;
        this._bvdEntry.bvdidea = data;
        
        (this._util as any).showSuccess('Data saved successfully');
        this.loading = false;
      },
      error: (err: any) => {
        (this._util as any).showError('There is an error in getting data from Server');
        this._util.serviceError(err);
        this.loading = false;
      }
    });
  }

  saveIdea() {
    this.loading = true;
    this._bvdEntry.saveIdeaDetails(this.idea).subscribe({
      next: (data) => {
        this.idea = data;
        this.ideaId = data.id;
        this._bvdEntry.ideA_ID = data.id;
        this._bvdEntry.projecT_ID = this.projectId;
        this._bvdEntry.bvdidea = data;
        // Don't set isIdeaSubmitted here - it should only be set when final submission happens
        // this._bvdEntry.isIdeaSubmitted = true;
        
        (this._util as any).showSuccess('Data saved successfully');
        
        
        // Navigate to next step (Benefits) - available for all customers
        this.setStep.emit(2);
        
        this.loading = false;
      },
      error: (err: any) => {
        (this._util as any).showError('There is an error in getting data from Server');
        this._util.serviceError(err);
        this.loading = false;
      }
    });
  }

  updateIdeaComment() {
    this.loading = true;
    this._bvdEntry.saveIdeaDetails(this.idea).subscribe({
      next: (data) => {
        (this._util as any).showSuccess('Data Updated Successfully');
        
        // Navigate to next step (Benefits) - available for all customers
        this.setStep.emit(2);
        
        this.loading = false;
      },
      error: (err: any) => {
        (this._util as any).showError('There is an error in getting data from Server');
        this._util.serviceError(err);
        this.loading = false;
      }
    });
  }

  onBack() {
    
    // Check navigation source to determine where to go back
    const navigationSource = window.localStorage.getItem('ideaNavigationSource');
    
    // Clear the flags
    window.localStorage.removeItem('isFromAddNewIdea');
    window.localStorage.removeItem('ideaNavigationSource');
    
    if (navigationSource === 'dashboard') {
      // Navigate back to BVD Dashboard
      if (this._util.IsPremier(this._bvdEntry.customerid.toString())) {
        this._router.navigate(['/serviceleveldashboard/cust', this._bvdEntry.customerid, this._bvdEntry.reset || 'false']);
      } else {
        this._router.navigate(['/newdashboard/cust', this._bvdEntry.customerid, this._bvdEntry.reset || 'false']);
      }
    } else {
      // Navigate back to Ideas List View (default or when from listview)
      if (this._util.IsPremier(this._bvdEntry.customerid.toString())) {
        this._router.navigate(['/serviceleveldashboard/cust', this._bvdEntry.customerid, this._bvdEntry.reset || '0', 'listview']);
      } else {
        this._router.navigate(['/newdashboard/cust', this._bvdEntry.customerid, this._bvdEntry.reset || '0', 'listview']);
      }
    }
  }

  // Handle service area change
  onServiceAreaChange(serviceAreaId: number) {
    this.idea.servicE_AREA_ID = serviceAreaId;
    this.idea.procesS_AREA_ID = 0;
    this.idea.procesS_ID = 0;
    this.processAreaList = [];
    this.processList = [];
    this.getProcessAreas(serviceAreaId);
  }

  // Handle process area change
  onProcessAreaChange(processAreaId: number) {
    this.idea.procesS_AREA_ID = processAreaId;
    this.idea.procesS_ID = 0;
    this.processList = [];
    this.getProcesses(processAreaId);
  }

  // Handle description change
  onDescriptionChange() {
    // Trigger similar ideas search whenever description changes
    if (this.idea.description && this.idea.description.trim().length > 0) {
      this.getSimilarIdeas();
    } else {
      this.similarIdeas = [];
    }
  }

  // Handle customer change
  onCustomerChange() {
    this.customerId = this.selectedCust;
    this.projectId = '';
    this.projects = [];
    
    // Load projects for the selected customer
    this.getProjects();
  }

  // TrackBy functions for performance
  trackByCustomerId(index: number, item: any): string {
    return item.cusT_ID;
  }

  trackByProjectId(index: number, item: any): string {
    return item.proJ_ID;  // Uppercase J and ID (from legacy code)
  }
}
