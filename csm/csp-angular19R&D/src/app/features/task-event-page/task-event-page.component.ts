import { Component, OnInit, ViewChild, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subscription } from 'rxjs';
import { TasksEventsDetails } from '../../models/tasks-events-details.model';
import { AppsService } from '../../core/services/apps.service';
import { SharedService } from '../../shared/shared.service';
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';
import { PortfolioProjectSelectorComponent } from '../../shared/components/portfolio-project-selector/portfolio-project-selector.component';
import { TableFilterComponent } from '../../shared/components/table-filter/table-filter.component';

@Component({
  selector: 'app-task-event',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatSidenavModule,
    NavbarNewComponent,
    PortfolioProjectSelectorComponent,
    TableFilterComponent
  ],
  templateUrl: './task-event-page.component.html',
  styleUrls: ['./task-event-page.component.scss'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1, overflow: 'hidden' }),
        animate('300ms ease-in', style({ height: 0, opacity: 0 }))
      ])
    ])
  ]
})
export class TaskEventPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private appsService = inject(AppsService);
  public sharedService = inject(SharedService);
  
  private sub: Subscription = new Subscription();

  constructor() {
  }

  selectedCust: string = '';
  input: TasksEventsDetails[] = [];
  tempObject: any;
  portfolio: string[] = [];
  displayedColumns: string[] = ['index', 'description', 'projectName', 'taskType', 'priority', 'taskCategory', 'dueDate', 'status'];
  dataSource = new MatTableDataSource<TasksEventsDetails>();
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  tempData1: TasksEventsDetails[] = [];
  tempData: TasksEventsDetails[] = [];
  
  @ViewChild(MatSort) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  projNames: any[] = [];
  allproj: boolean = false;
  selectedProject: string = "All Projects";
  projects: string[] = [];
  toggletext: string = "Hide";
  selectedOption: string = "1";
  AllChecked: boolean = false;
  PastDueChecked: boolean = true;
  DueClosureChecked: boolean = true;
  period: string = 'TM';
  periodTitle: string = '';
  bShowFilter: boolean = false;
  filteredData: TasksEventsDetails[] = [];
  filterCriteria: any = null;
  loading: boolean = false;
  readonlymode: boolean = true;

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.input);
    
    this.sub = this.route.params.subscribe(params => {
      this.selectedCust = params['custid'];
      if (params['period'] != undefined && params['period'] != null)
        this.period = params['period'];
      this.getPeriodTitle();
      if (params['projid'] != undefined) {
        this.sharedService.selectedProjects.push(params['projid']);
      }
    });
    
    const role = localStorage.getItem('role');
    
    // Check if role is BUHeadIMS (3), PMO (4), or Quality (5)
    if (role == '3' || role == '4' || role == '5')
      this.allproj = true;

    this.GetTasksEventsDetails(this.selectedCust);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  getPeriodTitle(): void {
    switch (this.period) {
      case 'TM': 
        this.periodTitle = 'Events & Tasks Due This Month'; 
        break;
      case 'TW': 
        this.periodTitle = 'Events & Tasks Due This Week'; 
        break;
      case 'NM': 
        this.periodTitle = 'Events & Tasks Due Next Month'; 
        break;
      case 'NW': 
        this.periodTitle = 'Events & Tasks Due Next Week'; 
        break;
      case 'OD': 
        this.periodTitle = 'Over Due Events & Tasks'; 
        break;
      default: 
        this.periodTitle = 'Over All Events & Tasks'; 
        break;
    }
  }

  GetTasksEventsDetails(custid: string): void {
    if (!custid) {
      console.error('TaskEventPage: Customer ID is required');
      return;
    }

    this.loading = true;
    
    this.appsService.getTasksEventsDetails(custid, this.allproj, this.period).subscribe({
      next: (data: TasksEventsDetails[]) => {
        this.input = data || [];
        this.loading = false;
        this.RefreshTableForProject(this.input);
        
        if (this.input.length === 0) {
          this.bShowFilter = false;
        }

        this.projects = this.input
          .map(x => x.projectName)
          .filter((x, i, a) => a.indexOf(x) === i)
          .sort();
        
        if (!this.projects.includes("All Projects")) {
          this.projects.unshift("All Projects");
        }
      },
      error: (error: any) => {
        console.error('TaskEventPage: Error loading tasks/events:', error);
        this.loading = false;
        this.input = [];
      }
    });
  }

  uncheckOthers(): void {
    this.PastDueChecked = false;
    this.DueClosureChecked = false;
  }

  getAllProjectsForCustomer(): void {
    this.appsService.getCustomerProjectsName(this.selectedCust, this.allproj).subscribe({
      next: (data: any[]) => {
        this.projNames = data;
      },
      error: (error: any) => {
        console.error('Error getting customer projects:', error);
      }
    });
  }

  filterData(projectId: any, allchecked: boolean, pastDue: boolean, dueforClosure: boolean): void {
    // Start with all data
    this.filteredData = [...this.input];
    
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Apply project filter from portfolio-project-selector
    if (this.sharedService.selectedProjects && this.sharedService.selectedProjects.length > 0) {
      this.filteredData = this.filteredData.filter(x => 
        this.sharedService.selectedProjects.includes(x.projectID)
      );
    }

    // Apply status filter (All, Past Due, Due for Closure)
    if (allchecked) {
      // Show all - no filtering
    } else {
      // Filter out closed/occurred tasks
      this.filteredData = this.filteredData.filter(x => 
        x.status !== 'Occured' && x.status !== 'Closed'
      );

      if (pastDue && dueforClosure) {
        // Show both past due and due for closure
      } else if (!pastDue && !dueforClosure) {
        this.filteredData = [];
      } else if (pastDue) {
        this.filteredData = this.filteredData.filter(x => 
          new Date(x.dueDate) < currentDate
        );
      } else if (dueforClosure) {
        this.filteredData = this.filteredData.filter(x => 
          new Date(x.dueDate) >= currentDate
        );
      }
    }

    // Apply advanced table filter criteria if present
    if (this.filterCriteria && this.filterCriteria.length > 0) {
      this.filteredData = this.applyTableFilterCriteria(this.filteredData, this.filterCriteria);
    }

    this.RefreshTableForProject(this.filteredData);
  }

  applyTableFilterCriteria(data: TasksEventsDetails[], criteria: any[]): TasksEventsDetails[] {
    let filtered = [...data];
    
    criteria.forEach(criterion => {
      if (criterion.value && criterion.value.length > 0) {
        filtered = filtered.filter(item => {
          const fieldValue = (item as any)[criterion.field];
          if (Array.isArray(criterion.value)) {
            return criterion.value.includes(fieldValue);
          } else {
            return fieldValue === criterion.value;
          }
        });
      }
    });
    
    return filtered;
  }

  showFilteredRows(): void {
    this.filterData(this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
  }

  levelmode: boolean = false;
  impactmode: boolean = false;
  EditAllowed = true;
  editmode: boolean = false;
  dataUpdate: any;

  EnableLevel(): void {
    this.levelmode = true;
  }
  
  DisableLevel(): void {
    this.levelmode = false;
  }
  
  EnableImpact(): void {
    this.impactmode = true;
  }
  
  DisableImpact(): void {
    this.impactmode = false;
  }

  Project_OnClick(): void {
    this.filterData(this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
  }

  RefreshTableForProject(data: TasksEventsDetails[]): void {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ToggleFilter_onClick(): void {
    this.bShowFilter = !this.bShowFilter;
    this.toggletext = this.bShowFilter ? "Hide" : "Show";
  }

  Filter_onChange(event: any): void {
    // event contains the filtered data and criteria from table-filter component
    if (event.data) {
      // If table-filter returns filtered data directly
      this.filteredData = event.data;
      this.RefreshTableForProject(this.filteredData);
    } else if (event.criteria) {
      // If table-filter returns criteria to apply
      this.filterCriteria = event.criteria;
      this.filterData(this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
    }
  }

  showAll(event: any): void {
    // Reset filters and show all data
    this.filterCriteria = null;
    this.sharedService.selectedProjects = [];
    this.sharedService.selectedPortfolios = [];
    this.AllChecked = false;
    this.PastDueChecked = true;
    this.DueClosureChecked = true;
    this.filterData(this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
  }

  projectSelected(event: any): void {
    this.filterData(this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
  }

  isOverdue(dueDate: any): boolean {
    if (!dueDate) return false;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < currentDate;
  }
}
