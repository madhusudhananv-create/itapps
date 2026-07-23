/**
 * Sidebar Component - Migrated from legacy Angular 6
 * Modernized as standalone component for Angular 19
 * Preserves exact UI/UX and styles from legacy version
 */

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { environment } from '../../../../environments/environment';
import { UtilityService } from '../../../core/services/utility.service';

export interface ClientProject {
  client_ID: string;
  client_NM: string;
  client_RAG: 'green' | 'orange' | 'red';
  projects: Project[];
}

export interface Project {
  proJ_ID: string;
  proJ_NM: string;
  proJ_RAG: 'green' | 'orange' | 'red';
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    MatFormFieldModule, 
    MatSelectModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  // Modern dependency injection
  private router = inject(Router);
  private http = inject(HttpClient);
  public utilityService = inject(UtilityService);

  // Reactive state with Signals
  receivedData = signal<ClientProject[]>([]);
  selectedData = signal<any>(null);
  
  // Component state
  webapiuri = environment.webapiuri;
  canEdit: boolean = false;
  token: string = '';
  empid: string = '';
  displayname: string = '';
  projectid: string = '';

  // Edit state for client RAG
  editCustIndex: number | null = null;
  editCustId: string | null = null;

  // Edit state for project RAG
  editProjIndex: number | null = null;
  editProjId: string | null = null;

  ngOnInit(): void {
    // Load user session data
    this.canEdit = localStorage.getItem('canedit') === 'true';
    this.empid = localStorage.getItem('empid') || '';
    this.displayname = localStorage.getItem('displayname') || '';
    this.token = localStorage.getItem('token') || '';
    
    // Validate login
    this.utilityService.validateLogin();
    
    // Load projects
    this.loadProjects(this.empid);
  }

  /**
   * Load projects for the user
   */
  loadProjects(empId: string): void {
    const apiUri = `${this.webapiuri}GetProjects?EmpId=${empId}&ProjectId=`;
    
    this.http.get<ClientProject[]>(apiUri).subscribe({
      next: (data) => {
        this.receivedData.set(data);
      },
      error: (error) => {
        console.error('Error loading projects:', error);
      }
    });
  }

  /**
   * Handle project click
   */
  onProjectClick(clientId: string, projId: string): void {
    const clients = this.receivedData();
    for (const client of clients) {
      if (client.client_ID === clientId) {
        const project = client.projects.find(p => p.proJ_ID === projId);
        if (project) {
          this.selectedData.set({ 
            type: 'project', 
            project: project, 
            client: client 
          });
          // Navigate to project detail
          this.router.navigate(['/project', projId]);
        }
      }
    }
  }

  /**
   * Handle client click
   */
  onClientClick(clientId: string): void {
    const clients = this.receivedData();
    const client = clients.find(c => c.client_ID === clientId);
    if (client && client.projects.length > 0) {
      this.selectedData.set({ 
        type: 'client', 
        project: client.projects[0], 
        client: client 
      });
    }
  }

  /**
   * Check if user can edit
   */
  isEditAllowed(): boolean {
    return this.canEdit;
  }

  /**
   * Start editing client RAG
   */
  editCustomer(index: number, id: string): void {
    this.editCustIndex = index;
    this.editCustId = id;
  }

  /**
   * Check if client is in edit mode
   */
  isClientReadonly(index: number, id: string): boolean {
    return this.editCustIndex !== index || this.editCustId !== id;
  }

  /**
   * Save client RAG update
   */
  saveCustomer(client: ClientProject, ragValue: 'green' | 'orange' | 'red'): void {
    client.client_RAG = ragValue;
    this.updateClientRag(client, ragValue);
    this.editCustIndex = null;
    this.editCustId = null;
  }

  /**
   * Cancel client RAG edit
   */
  cancelCustomerEdit(): void {
    this.editCustIndex = null;
    this.editCustId = null;
  }

  /**
   * Start editing project RAG
   */
  editProject(index: number, id: string): void {
    this.editProjIndex = index;
    this.editProjId = id;
  }

  /**
   * Check if project is in edit mode
   */
  isProjectReadonly(index: number, id: string): boolean {
    return this.editProjIndex !== index || this.editProjId !== id;
  }

  /**
   * Save project RAG update
   */
  saveProject(project: Project, ragValue: 'green' | 'orange' | 'red'): void {
    project.proJ_RAG = ragValue;
    this.updateProjectRag(project, ragValue);
    this.editProjIndex = null;
    this.editProjId = null;
  }

  /**
   * Cancel project RAG edit
   */
  cancelProjectEdit(): void {
    this.editProjIndex = null;
    this.editProjId = null;
  }

  /**
   * Update client RAG status via API
   */
  private updateClientRag(client: ClientProject, ragValue: string): void {
    const apiUri = `${this.webapiuri}UpdateClientRAG`;
    const body = {
      clientId: client.client_ID,
      ragStatus: ragValue
    };

    this.http.post(apiUri, body).subscribe({
      next: () => {
      },
      error: (error) => {
        console.error('Error updating client RAG:', error);
      }
    });
  }

  /**
   * Update project RAG status via API
   */
  private updateProjectRag(project: Project, ragValue: string): void {
    const apiUri = `${this.webapiuri}UpdateProjectRAG`;
    const body = {
      projectId: project.proJ_ID,
      ragStatus: ragValue
    };

    this.http.post(apiUri, body).subscribe({
      next: () => {
      },
      error: (error) => {
        console.error('Error updating project RAG:', error);
      }
    });
  }
}
