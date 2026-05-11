import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';
import { ProjectsModel } from '../../models/projects-model';

// CRISP Models - defined inline to avoid module resolution issues
export interface CrispProjectSummaryModel {
  projecT_ID: string;
  projecT_NAME: string;
  score: number;
  categories: CrispCategoryScoreModel[];
  validations: CrispValidationModel[];
}

export interface CrispCategoryScoreModel {
  categorY_ID: number;
  categorY_NAME: string;
  score: number;
}

export interface CrispValidationModel {
  categorY_NAME: string;
  criteriA_ID: number;
  criteriA_NAME: string;
  validatioN_NAME: string;
  eligible: number;
  score: number;
}

@Component({
  selector: 'app-crisp-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatExpansionModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatSnackBarModule,
    MatTooltipModule,
    NavbarNewComponent
  ],
  templateUrl: './crisp-report.component.html',
  styleUrl: './crisp-report.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class CrispReportComponent implements OnInit {
  // Modern Angular 19 dependency injection
  private readonly _appService = inject(AppsService);
  readonly _util = inject(MyUtility); // Make public for template access
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  // Helper: toast notification
  private showToast(message: string, type: 'success' | 'warn' | 'error', duration = 3000): void {
    this.snackBar.open(message, '✕', {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [`${type}-snackbar`]
    });
  }

  // Route parameters
  input_customerid: string = '';
  input_projectid: string[] = [];
  selectedProject: string = '';
  
  // Filters
  month: string = this._util.Month();
  year: number = this._util.Year();
  allproj: boolean = false;
  generateResults: boolean = false;
  
  // Data
  projNames: ProjectsModel[] = [];
  summary: CrispProjectSummaryModel[] = [];
  data: CrispProjectSummaryModel[] = [];
  panelExpand: boolean[] = [];
  
  // UI state
  _loading: boolean = false;
  
  // Customer info
  custid: string = '';
  selectedCustomer: any;

  ngOnInit(): void {
    
    const role = localStorage.getItem('role');
    if (role === '2' || role === '3' || role === '4') { // BUHead, PMO, Quality
      this.allproj = true;
    }

    // Get route parameters
    this.route.params.subscribe(params => {
      this.input_customerid = params['custid'] || '';
      this.custid = this.input_customerid;
      
      this.selectedProject = params['projid'] || '';
      if (this.selectedProject) {
        this.input_projectid.push(this.selectedProject);
        this.generateResults = true;
      }
      
      if (params['month']) {
        this.month = params['month'];
      }
      
      if (params['year']) {
        this.year = +params['year'];
      }
    });

    this.getAllProjectsFromCustomer();
  }

  getAllProjectsFromCustomer(): void {
    if (!this.input_customerid) return;
    
    this._appService.GetCustomerProjectsName(this.input_customerid, this.allproj).subscribe({
      next: (data: ProjectsModel[]) => {
        this.projNames = data;
        if (this.projNames && this.projNames.length > 0 && this.generateResults) {
          this.ApplyFilter();
        }
      },
      error: (error: any) => {
        this._util.serviceError(error);
        this.showToast('Something went wrong', 'error', 4000);
      }
    });
  }

  service_getCrispProjectSummary(projectIds: string[], month: string, year: number): void {
    this._loading = true;
    this.summary = [];
    this.data = [];

    this._appService.GetCrispProjectSummary(projectIds, month, year).subscribe({
      next: (data: CrispProjectSummaryModel[]) => {
        this.summary = data;
        this._loading = false;
        
        this.summary.forEach(x => {
          this.service_getProjectCrispDetails(x.projecT_ID, this.month, this.year);
          this.panelExpand.push(false);
        });
      },
      error: (error: any) => {
        this._loading = false;
        this._util.serviceError(error);
        this.showToast('Something went wrong', 'error', 4000);
      }
    });
  }

  service_getProjectCrispDetails(projectId: string, month: string, year: number): void {
    if (!projectId) return;

    this._appService.GetCrispDetailsNew(projectId, month, year).subscribe({
      next: (data: CrispProjectSummaryModel[]) => {
        if (data && data.length > 0) {
          this.data.push(data[0]);
        }
      },
      error: (error: any) => {
        this._util.serviceError(error);
        this.showToast('Something went wrong', 'error', 4000);
      }
    });
  }

  getCategoryDetails(projId: string): any[] {
    const detail = this.data.find(x => x.projecT_ID === projId);
    if (!detail) return [];
    return detail.validations || [];
  }

  ApplyFilter(): void {
    this._loading = true;
    this.panelExpand = [];
    this.service_getCrispProjectSummary(this.input_projectid, this.month, this.year);
  }

  Refresh(): void {
    this._loading = true;
    this.panelExpand = [];
    
    this._appService.ProcessCrispScoresForProject(
      this.custid,
      this.input_projectid,
      this.month,
      this.year
    ).subscribe({
      next: () => {
        this.service_getCrispProjectSummary(this.input_projectid, this.month, this.year);
      },
      error: (error: any) => {
        this._loading = false;
        this._util.serviceError(error);
        this.showToast('Something went wrong', 'error', 4000);
      }
    });
  }

  Reset(): void {
    this.month = this._util.Month();
    this.year = this._util.Year();
    this.input_projectid = [];
    this.panelExpand = [];
    this.summary = [];
  }

  navigate(proj: any, val: any): void {
    let url = '';
    
    switch (val.criteriA_ID) {
      case 1:
      case 2:
        url = `/successgoal/goals/${this.custid}/${proj.projecT_ID}/${this.month}/${this.year}`;
        break;
      case 3:
        url = `/layout/risk/${this.custid}/${proj.projecT_ID}`;
        break;
      case 4:
      case 8:
        url = `/layout/issues/${this.custid}`;
        break;
      case 5:
      case 6:
        url = `/layout/ideas/${this.custid}`;
        break;
      case 7:
        this._appService.GetProjectCsatURL(proj.projecT_ID, this.month, this.year).subscribe({
          next: (csatUrl: string) => {
            if (csatUrl) {
              window.open(csatUrl, '_blank');
            }
          }
        });
        return;
      case 9:
        url = `/layout/checklistfindings/${this.custid}`;
        break;
      case 10:
      case 11:
        url = `/layout/mandatorytrainingreport/${this.custid}/${proj.projecT_ID}/${this.year}/${this.month}`;
        break;
    }

    if (url) {
      window.open(url, '_blank');
    }
  }

  goBack(): void {
    this.router.navigate(['/newdashboard/custm']);
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/CustomerLogo.png';
  }

  getStatusLabel(score: number): string {
    if (score >= 98) return 'Under Control';
    if (score >= 90) return 'Need Focus';
    return 'Need Immediate Attention';
  }

  getStatusColor(score: number): string {
    if (score >= 98) return 'darkgreen';
    if (score >= 90) return 'orange';
    return 'red';
  }
}
