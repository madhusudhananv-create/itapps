import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { AppsService } from '../../../core/services/apps.service';
import { UtilityService } from '../../../core/services/utility.service';

@Component({
  selector: 'app-dashboard-itops',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatProgressBarModule
  ],
  templateUrl: './dashboard-itops.component.html',
  styleUrls: ['./dashboard-itops.component.scss']
})
export class DashboardItopsComponent implements OnInit {
  
  // Filter properties
  selectedAccount: string = '';
  selectedProject: string = '';
  selectedAudits: string[] = []; // Changed to array for multiple selection
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Dropdown data
  accounts: any[] = [];
  projects: any[] = [];
  audits: any[] = [];
  allAuditsSelected: boolean = false;
  auditDetailsMap: Map<string, any> = new Map(); // Store full audit details for each audit ID

  // Dashboard data
  domainMaturityData: any[] = [];
  parameterScoresData: any[] = [];
  filteredParameterScoresData: any[] = [];
  selectedDomainForParameters: string = '';
  showParameterScores: boolean = false; // Control visibility of parameter scores table
  overallEstate: any = null;
  showDashboard: boolean = false;
  isLoading: boolean = false;
  checklistData: any[] = [];

  constructor(
    private router: Router,
    private location: Location,
    private _appService: AppsService,
    private _utility: UtilityService
  ) {}

  ngOnInit(): void {
    console.log('Dashboard ITOps ngOnInit called');
    this.loadCustomers();
  }

  /**
   * Load customers using existing API
   */
  loadCustomers(): void {
    console.log('loadCustomers() called');
    const empId = localStorage.getItem("empid") || '';
    console.log('Employee ID:', empId);
    
    this._appService.GetCustomerList(empId, false).subscribe({
      next: (data) => {
        console.log('Customers loaded:', data);
        this.accounts = data.map((customer: any) => ({
          id: customer.cusT_ID,
          name: customer.cusT_NM
        }));
        console.log('Mapped accounts:', this.accounts);
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this._utility.serviceError(error);
      }
    });
  }

  /**
   * Load projects when customer is selected
   */
  loadProjects(): void {
    console.log('loadProjects() called, selectedAccount:', this.selectedAccount);
    if (!this.selectedAccount) {
      this.projects = [];
      this.selectedProject = '';
      console.log('No account selected, projects cleared');
      return;
    }

    console.log('Fetching projects for account:', this.selectedAccount);
    
    // Try primary API: getAllProjectsForCustomer
    this._appService.getAllProjectsForCustomer(this.selectedAccount).subscribe({
      next: (data) => {
        console.log('getAllProjectsForCustomer response:', data);
        
        if (data && data.length > 0) {
          // Log first project to see actual structure
          console.log('First project structure:', data[0]);
          console.log('Available keys:', Object.keys(data[0]));
          
          // Try to find the correct property names
          const firstProj = data[0];
          console.log('Testing property variations:');
          console.log('proJ_ID:', firstProj.proJ_ID);
          console.log('proj_NM:', firstProj.proj_NM);
          console.log('PROJ_ID:', firstProj.PROJ_ID);
          console.log('PROJ_NM:', firstProj.PROJ_NM);
          console.log('projID:', firstProj.projID);
          console.log('projNM:', firstProj.projNM);
          console.log('projId:', firstProj.projId);
          console.log('projName:', firstProj.projName);
          
          // Map the projects to the format needed for the dropdown
          this.projects = data.map((project: any) => ({
            id: project.proJ_ID,
            name: project.proJ_NM
          }));
          console.log('Mapped projects:', this.projects);
        } else {
          // Fallback: Try getCustomerProjectsName API
          console.log('No projects from primary API, trying fallback API...');
          this.loadProjectsFallback();
        }
      },
      error: (error) => {
        console.error('Error loading projects (trying fallback):', error);
        // Try fallback API
        this.loadProjectsFallback();
      }
    });
  }

  /**
   * Fallback method to load projects using alternative API
   */
  private loadProjectsFallback(): void {
    this._appService.getCustomerProjectsName(this.selectedAccount, true).subscribe({
      next: (data) => {
        console.log('getCustomerProjectsName response:', data);
        
        if (data && data.length > 0) {
          this.projects = data.map((project: any) => ({
            id: project.proJ_ID || project.projecT_ID || project.projid,
            name: project.proJ_NM || project.projecT_NAME || project.projname
          }));
          console.log('Mapped projects (fallback):', this.projects);
        } else {
          console.warn('No projects found for selected account in any API');
          this.projects = [];
        }
      },
      error: (error) => {
        console.error('Error loading projects (fallback failed):', error);
        this.projects = [];
        this._utility.serviceError(error);
      }
    });
  }

  /**
   * Handle account change - reload projects
   */
  onAccountChange(): void {
    console.log('Account changed to:', this.selectedAccount);
    this.selectedProject = '';
    this.audits = [];
    this.selectedAudits = [];
    this.loadProjects();
  }

  /**
   * Handle project change - reload audits
   */
  onProjectChange(): void {
    console.log('Project changed to:', this.selectedProject);
    this.selectedAudits = [];
    this.loadAudits();
  }

  /**
   * Load audits/assessments when project is selected
   */
  loadAudits(): void {
    console.log('loadAudits() called, selectedAccount:', this.selectedAccount, 'selectedProject:', this.selectedProject);
    
    if (!this.selectedAccount || !this.selectedProject) {
      this.audits = [];
      this.selectedAudits = [];
      console.log('No account or project selected, audits cleared');
      return;
    }

    console.log('Fetching audits for account:', this.selectedAccount, 'project:', this.selectedProject);
    
    this._appService.getPlannedAudits(this.selectedAccount, this.selectedProject).subscribe({
      next: (data) => {
        console.log('Planned audits loaded:', data);
        
        // Log first audit to see structure
        if (data && data.length > 0) {
          console.log('First audit structure:', data[0]);
          console.log('Available keys:', Object.keys(data[0]));
          console.log('Service Area IDs field:', data[0].servicE_AREA_IDS, data[0].serviceAreaIds, data[0].SERVICE_AREA_IDS);
        }
        
        // Clear previous audit details
        this.auditDetailsMap.clear();
        
        // Map the audits to the format needed for the dropdown
        this.audits = data.map((audit: any) => {
          const auditId = audit.audiT_ID || audit.auditId || audit.id;
          
          // Try multiple possible field names for service area IDs
          // NOTE: servicE_AREA_ID is an ARRAY, not a string
          let serviceAreaIds = audit.servicE_AREA_ID || 
                               audit.serviceAreaId || 
                               audit.SERVICE_AREA_ID ||
                               audit.servicE_AREA_IDS ||
                               audit.serviceAreaIds || 
                               [];
          
          // If it's an array, keep it as array; if string, split it
          if (typeof serviceAreaIds === 'string') {
            serviceAreaIds = serviceAreaIds ? serviceAreaIds.split(',').map((id: string) => id.trim()) : [];
          }
          
          console.log(`Audit ${auditId}: serviceAreaIds =`, serviceAreaIds);
          
          // Store full audit details including service area IDs
          this.auditDetailsMap.set(auditId, {
            id: auditId,
            name: audit.description || audit.auditName || audit.name,
            serviceAreaIds: serviceAreaIds, // Store as array
            status: audit.statuS || audit.status,
            fullData: audit // Store complete audit data
          });
          
          return {
            id: auditId,
            name: audit.description || audit.auditName || audit.name
          };
        });
        
        console.log('Mapped audits:', this.audits);
        console.log('Audit details map:', this.auditDetailsMap);
        
        // If no audits found, log a warning
        if (this.audits.length === 0) {
          console.warn('No audits found for selected account and project');
        }
      },
      error: (error) => {
        console.error('Error loading audits:', error);
        this.audits = [];
        this._utility.serviceError(error);
      }
    });
  }

  /**
   * Toggle all audits selection
   */
  toggleAllAudits(): void {
    console.log('Toggle all audits, current state:', this.allAuditsSelected);
    if (this.allAuditsSelected) {
      // Select all
      this.selectedAudits = this.audits.map((audit: any) => audit.id);
    } else {
      // Deselect all
      this.selectedAudits = [];
    }
    console.log('Selected audits:', this.selectedAudits);
  }

  /**
   * Update "All" checkbox based on individual selections
   */
  updateAllAuditsCheckbox(): void {
    this.allAuditsSelected = this.selectedAudits.length === this.audits.length;
    console.log('All selected:', this.allAuditsSelected, 'Count:', this.selectedAudits.length);
  }

  /**
   * Apply filters and load dashboard data
   */
  applyFilters(): void {
    if (!this.selectedAudits || this.selectedAudits.length === 0) {
      console.log('No audits selected');
      alert('Please select at least one audit/assessment');
      return;
    }

    console.log('Applying filters with audits:', this.selectedAudits);
    this.isLoading = true;
    this.showDashboard = false;

    // Load dashboard data for the first selected audit
    this.loadDashboardData();
  }

  /**
   * Load dashboard data based on selected audits
   */
  loadDashboardData(): void {
    if (this.selectedAudits.length === 0) {
      return;
    }

    const firstAuditId = this.selectedAudits[0];
    const auditDetails = this.auditDetailsMap.get(firstAuditId);
    
    if (!auditDetails) {
      console.error('Audit details not found for ID:', firstAuditId);
      this.isLoading = false;
      return;
    }

    console.log('Loading dashboard data for audit:', auditDetails);

    // Get service area IDs - should be an array
    let serviceAreaIds = auditDetails.serviceAreaIds;
    
    // Ensure it's an array
    if (!Array.isArray(serviceAreaIds)) {
      serviceAreaIds = [];
      console.warn('Service area IDs is not an array. Using empty array.');
    }
    
    // Convert to numbers if they're strings
    const serviceAreaIdsAsNumbers = serviceAreaIds.map((id: any) => {
      const numId = typeof id === 'string' ? parseInt(id, 10) : id;
      return isNaN(numId) ? id : numId;
    });
    
    console.log('Using service area IDs:', serviceAreaIdsAsNumbers);

    // Prepare data for API call
    const requestData = {
      "audiT_ID": firstAuditId,
      "servicE_AREA_IDS": serviceAreaIdsAsNumbers, // Pass as array of numbers
      "customeR_ID": this.selectedAccount,
      "projecT_ID": this.selectedProject
    };

    console.log('Fetching checklist data with:', requestData);

    // Fetch checklist data
    this._appService.getCheckListDataForProjNew(requestData).subscribe({
      next: (data) => {
        console.log('Checklist data loaded:', data);
        this.checklistData = data;
        
        if (data && data.length > 0) {
          // Process the checklist data to generate maturity scores
          this.processChecklistData(data);
          this.showDashboard = true;
        } else {
          console.warn('No checklist data found for this audit');
          alert('No checklist data available for the selected audit. Please ensure the assessment has been executed.');
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading checklist data:', error);
        this._utility.serviceError(error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Process checklist data to generate domain maturity and parameter scores
   */
  processChecklistData(checklists: any[]): void {
    console.log('Processing checklist data...', checklists);
    
    // Log first checklist structure to understand the data
    if (checklists && checklists.length > 0) {
      console.log('First checklist structure:', checklists[0]);
      console.log('First checklist keys:', Object.keys(checklists[0]));
    }
    
    this.domainMaturityData = [];
    this.parameterScoresData = [];
    
    let srNo = 1;
    
    // Process each checklist (each represents a domain/technology)
    checklists.forEach((checklist: any) => {
      // Try multiple possible field names for checklist name
      const checklistName = checklist.checklistT_NAME ||
                           checklist.checklistname || 
                           checklist.checklistName || 
                           checklist.checklistnm ||
                           checklist.checklistNM ||
                           checklist.name ||
                           checklist.title ||
                           'Unknown Domain';
      
      console.log('Processing checklist:', checklistName);
      
      const sections = checklist.checklistsections || 
                      checklist.sections || 
                      checklist.checklistSections ||
                      checklist.checkpointS_BY_SERVICE_AREA ||
                      checklist.checkpoints ||
                      [];
      
      console.log('Sections found:', sections.length);
      console.log('Section data:', sections);
      
      let totalQuestions = 0;
      let totalScore = 0;
      let maxPossibleScore = 0;
      let parameterSrNo = 1;
      
      // Process each section (categories/parameters)
      sections.forEach((section: any) => {
        const sectionName = section.sectionname || section.sectionName || 'Unknown Section';
        const questions = section.questions || [];
        
        let sectionScore = 0;
        let sectionMaxScore = 0;
        
        // Calculate scores for this section
        questions.forEach((question: any) => {
          const answer = question.answer || question.answeR_TEXT || '';
          const score = this.getScoreFromAnswer(answer);
          const maxScore = 5; // Assuming max score is 5 per question
          
          sectionScore += score;
          sectionMaxScore += maxScore;
          totalQuestions++;
        });
        
        totalScore += sectionScore;
        maxPossibleScore += sectionMaxScore;
        
        // Add to parameter scores table if there are questions
        if (questions.length > 0) {
          const avgScore = questions.length > 0 ? sectionScore / questions.length : 0;
          const percentScore = sectionMaxScore > 0 ? Math.round((sectionScore / sectionMaxScore) * 100) : 0;
          
          this.parameterScoresData.push({
            srNo: parameterSrNo++,
            category: checklistName,
            parameter: sectionName,
            yourScore: avgScore.toFixed(2),
            target: 5,
            gap: (5 - avgScore).toFixed(2),
            percentScore: percentScore,
            recommendation: this.getRecommendation(percentScore)
          });
        }
      });
      
      // Calculate domain maturity
      const averageScore = totalQuestions > 0 ? totalScore / totalQuestions : 0;
      const maturityPercent = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
      const maturityLevel = this.getMaturityLevel(averageScore);
      
      this.domainMaturityData.push({
        srNo: srNo++,
        domain: checklistName,
        noOfParameters: totalQuestions,
        sumOfScores: totalScore,
        maxPossible: maxPossibleScore,
        averageScore: averageScore.toFixed(2),
        maturityPercent: maturityPercent,
        maturityLevel: maturityLevel
      });
    });
    
    console.log('Domain maturity data:', this.domainMaturityData);
    console.log('Parameter scores data:', this.parameterScoresData);
    
    // If no parameter scores found (sections were empty), add dummy data for testing
    if (this.parameterScoresData.length === 0 && this.domainMaturityData.length > 0) {
      console.warn('No sections/parameters found in checklist data. Adding dummy data for testing...');
      this.addDummyParameterData();
    }
    
    // Initialize - don't show parameters by default, wait for domain click
    this.filteredParameterScoresData = [];
    this.selectedDomainForParameters = '';
    this.showParameterScores = false;
  }

  /**
   * Add dummy parameter data for testing when real data has no sections
   */
  addDummyParameterData(): void {
    // Use the actual checklist names from domainMaturityData
    this.domainMaturityData.forEach((domain: any) => {
      const domainName = domain.domain;
      
      // Add dummy parameters for each domain
      const dummyParams = [
        { category: 'Patch Management', params: ['Patch Compliance Rate', 'Mean Time to Patch (MTTP)', 'Failed Patch Deployment Rate'], scores: [4, 3, 2] },
        { category: 'Security and Hardening', params: ['CIS Benchmark Compliance Score', 'Endpoint Protection Coverage', 'BitLocker Encryption Coverage', 'LAPS Deployment Rate'], scores: [4, 5, 3, 2] },
        { category: 'Identity and Access', params: ['Stale Account Ratio', 'MFA Enforcement Coverage', 'GPO Compliance Rate'], scores: [1, 2, 3] },
        { category: 'Backup and Recovery', params: ['Backup Success Rate', 'Recovery Time Objective'], scores: [3, 4] },
        { category: 'Monitoring and Alerting', params: ['Alert Response Time', 'System Uptime', 'Monitoring Coverage'], scores: [2, 3, 4] }
      ];
      
      let paramSrNo = this.parameterScoresData.length + 1;
      
      dummyParams.forEach((paramGroup: any) => {
        paramGroup.scores.forEach((score: number, idx: number) => {
          const percentScore = (score / 5) * 100;
          
          this.parameterScoresData.push({
            srNo: paramSrNo++,
            category: domainName,
            parameter: paramGroup.params[idx] || `${paramGroup.category} - Parameter ${idx + 1}`,
            yourScore: score,
            target: 5,
            gap: 5 - score,
            percentScore: Math.round(percentScore),
            recommendation: this.getRecommendation(percentScore)
          });
        });
      });
    });
    
    console.log('Dummy parameter data added:', this.parameterScoresData);
  }

  /**
   * Get numeric score from answer text
   */
  getScoreFromAnswer(answer: string): number {
    if (!answer) return 0;
    
    const answerLower = answer.toLowerCase().trim();
    
    // Map common answer patterns to scores
    if (answerLower.includes('optimized') || answerLower.includes('excellent') || answerLower === '5') return 5;
    if (answerLower.includes('managed') || answerLower.includes('good') || answerLower === '4') return 4;
    if (answerLower.includes('defined') || answerLower.includes('satisfactory') || answerLower === '3') return 3;
    if (answerLower.includes('repeatable') || answerLower.includes('fair') || answerLower === '2') return 2;
    if (answerLower.includes('initial') || answerLower.includes('poor') || answerLower === '1') return 1;
    
    // Try to parse as number
    const numScore = parseFloat(answer);
    if (!isNaN(numScore) && numScore >= 0 && numScore <= 5) {
      return numScore;
    }
    
    return 0;
  }

  /**
   * Get maturity level based on average score
   */
  getMaturityLevel(avgScore: number): string {
    if (avgScore >= 4.5) return '5 - Optimizing';
    if (avgScore >= 3.5) return '4 - Managed';
    if (avgScore >= 2.5) return '3 - Defined';
    if (avgScore >= 1.5) return '2 - Repeatable';
    return '1 - Initial';
  }

  /**
   * Get recommendation based on percent score
   */
  getRecommendation(percentScore: number): string {
    if (percentScore >= 90) return 'Optimized';
    if (percentScore >= 75) return 'Well Managed';
    if (percentScore >= 60) return 'Foundation Established';
    if (percentScore >= 40) return 'Needs Work';
    return 'Critical Gap';
  }

  /**
   * Load Windows service tower data
   */
  loadWindowsData(): void {
    this.domainMaturityData = [
      {
        srNo: 1,
        domain: 'Windows',
        noOfParameters: 17,
        sumOfScores: 48,
        maxPossible: 85,
        averageScore: 2.82,
        maturityPercent: 56,
        maturityLevel: '3 - Defined'
      }
    ];

    this.parameterScoresData = [
      { srNo: 1, category: 'Patch Management', parameter: 'Patch Compliance Rate', yourScore: 4, target: 5, gap: 1, percentScore: 80, recommendation: 'Well Managed' },
      { srNo: 2, category: 'Patch Management', parameter: 'Mean Time to Patch (MTTP)', yourScore: 3, target: 5, gap: 2, percentScore: 60, recommendation: 'Foundation Established' },
      { srNo: 3, category: 'Patch Management', parameter: 'Failed Patch Deployment Rate', yourScore: 2, target: 5, gap: 3, percentScore: 40, recommendation: 'Needs Work' },
      { srNo: 4, category: 'Security and Hardening', parameter: 'CIS Benchmark Compliance Score', yourScore: 4, target: 5, gap: 1, percentScore: 80, recommendation: 'Well Managed' },
      { srNo: 5, category: 'Security and Hardening', parameter: 'Endpoint Protection Coverage', yourScore: 5, target: 5, gap: 0, percentScore: 100, recommendation: 'Optimized' },
      { srNo: 6, category: 'Security and Hardening', parameter: 'BitLocker Encryption Coverage', yourScore: 3, target: 5, gap: 2, percentScore: 60, recommendation: 'Foundation Established' },
      { srNo: 7, category: 'Security and Hardening', parameter: 'LAPS Deployment Rate', yourScore: 2, target: 5, gap: 3, percentScore: 40, recommendation: 'Needs Work' },
      { srNo: 8, category: 'Identity and Access', parameter: 'Stale Account Ratio', yourScore: 1, target: 5, gap: 4, percentScore: 20, recommendation: 'Critical Gap' },
      { srNo: 9, category: 'Identity and Access', parameter: 'MFA Enforcement Coverage', yourScore: 2, target: 5, gap: 3, percentScore: 40, recommendation: 'Needs Work' },
      { srNo: 10, category: 'Identity and Access', parameter: 'Service Compliance Rate', yourScore: 3, target: 5, gap: 2, percentScore: 60, recommendation: 'Foundation Established' },
      { srNo: 11, category: 'Performance and Availability', parameter: 'System Uptime and Availability', yourScore: 4, target: 5, gap: 1, percentScore: 80, recommendation: 'Well Managed' },
      { srNo: 12, category: 'Performance and Availability', parameter: 'Event Log Monitoring Coverage', yourScore: 4, target: 5, gap: 1, percentScore: 80, recommendation: 'Well Managed' },
      { srNo: 13, category: 'Lifecycle Management', parameter: 'EOL OS Exposure Rate', yourScore: 3, target: 5, gap: 2, percentScore: 60, recommendation: 'Foundation Established' },
      { srNo: 14, category: 'Lifecycle Management', parameter: 'Golden Image Currency', yourScore: 2, target: 5, gap: 3, percentScore: 40, recommendation: 'Needs Work' },
      { srNo: 15, category: 'Operational Practices', parameter: 'Automated Provisioning Coverage', yourScore: 1, target: 5, gap: 4, percentScore: 20, recommendation: 'Critical Gap' },
      { srNo: 16, category: 'Operational Practices', parameter: 'Backup Success Rate', yourScore: 2, target: 5, gap: 3, percentScore: 40, recommendation: 'Needs Work' },
      { srNo: 17, category: 'Operational Practices', parameter: 'Configuration Drift Detection', yourScore: 3, target: 5, gap: 2, percentScore: 60, recommendation: 'Foundation Established' }
    ];

    this.overallEstate = {
      totalParameters: 287,
      totalScores: 1056,
      maxPossible: 1435,
      averageScore: 3.68,
      maturityPercent: 74,
      maturityLevel: '4 - Managed'
    };
  }

  /**
   * Load Linux service tower data
   */
  loadLinuxData(): void {
    this.domainMaturityData = [
      {
        srNo: 2,
        domain: 'Linux',
        noOfParameters: 14,
        sumOfScores: 53,
        maxPossible: 70,
        averageScore: 3.79,
        maturityPercent: 76,
        maturityLevel: '4 - Managed'
      }
    ];

    this.parameterScoresData = [
      { srNo: 1, category: 'Patch and Vulnerability Management', parameter: 'CVE Remediation Rate by Severity', yourScore: 4, target: 5, gap: 1, percentScore: 80, recommendation: 'Well Managed' },
      { srNo: 2, category: 'Patch and Vulnerability Management', parameter: 'Supported Kernel Version Coverage', yourScore: 5, target: 5, gap: 0, percentScore: 100, recommendation: 'Optimized' },
      { srNo: 3, category: 'Patch and Vulnerability Management', parameter: 'Fresh Evidence Compliance', yourScore: 4, target: 5, gap: 1, percentScore: 80, recommendation: 'Well Managed' },
      { srNo: 4, category: 'Security and Hardening', parameter: 'CIS Linux Benchmark Score', yourScore: 4, target: 5, gap: 1, percentScore: 80, recommendation: 'Well Managed' },
      { srNo: 5, category: 'Security and Hardening', parameter: 'SELinux and AppArmor Enforcement', yourScore: 4, target: 5, gap: 1, percentScore: 80, recommendation: 'Well Managed' },
      { srNo: 6, category: 'Security and Hardening', parameter: 'Firewall Policy Hygiene', yourScore: 4, target: 5, gap: 1, percentScore: 80, recommendation: 'Well Managed' },
      { srNo: 7, category: 'Security and Hardening', parameter: 'Centralized Audit Logging (auditd)', yourScore: 4, target: 5, gap: 1, percentScore: 80, recommendation: 'Well Managed' }
    ];

    this.overallEstate = {
      totalParameters: 287,
      totalScores: 1056,
      maxPossible: 1435,
      averageScore: 3.68,
      maturityPercent: 74,
      maturityLevel: '4 - Managed'
    };
  }

  /**
   * Load VMware service tower data
   */
  loadVMwareData(): void {
    this.domainMaturityData = [
      {
        srNo: 3,
        domain: 'VMware',
        noOfParameters: 17,
        sumOfScores: 47,
        maxPossible: 85,
        averageScore: 2.76,
        maturityPercent: 55,
        maturityLevel: '3 - Defined'
      }
    ];

    this.parameterScoresData = [];
    
    this.overallEstate = {
      totalParameters: 287,
      totalScores: 1056,
      maxPossible: 1435,
      averageScore: 3.68,
      maturityPercent: 74,
      maturityLevel: '4 - Managed'
    };
  }

  /**
   * Load default data
   */
  loadDefaultData(): void {
    this.domainMaturityData = [];
    this.parameterScoresData = [];
    this.overallEstate = null;
  }

  /**
   * Reset filters
   */
  resetFilters(): void {
    this.selectedAccount = '';
    this.selectedProject = '';
    this.selectedAudits = [];
    this.allAuditsSelected = false;
    this.audits = [];
    this.projects = [];
    this.startDate = null;
    this.endDate = null;
    this.showDashboard = false;
    console.log('Filters reset');
  }

  /**
   * Navigate back to checklist execution
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Get maturity level color class
   */
  getMaturityLevelClass(level: string): string {
    if (level.includes('Managed') || level.includes('4')) return 'maturity-managed';
    if (level.includes('Defined') || level.includes('3')) return 'maturity-defined';
    if (level.includes('Developing') || level.includes('2')) return 'maturity-developing';
    return 'maturity-initial';
  }

  /**
   * Get recommendation color class
   */
  getRecommendationClass(recommendation: string): string {
    if (recommendation.includes('Optimized')) return 'rec-optimized';
    if (recommendation.includes('Well Managed')) return 'rec-well-managed';
    if (recommendation.includes('Foundation')) return 'rec-foundation';
    if (recommendation.includes('Needs Work')) return 'rec-needs-work';
    if (recommendation.includes('Critical')) return 'rec-critical';
    return '';
  }

  /**
   * Get the display name of the first selected audit
   */
  get selectedAuditName(): string {
    if (this.selectedAudits.length === 0) {
      return '';
    }
    const firstAuditId = this.selectedAudits[0];
    const audit = this.audits.find((a: any) => a.id === firstAuditId);
    return audit ? audit.name : '';
  }

  /**
   * Filter parameter scores by domain (when domain name is clicked)
   */
  filterParametersByDomain(domainName: string): void {
    console.log('Filtering parameters by domain:', domainName);
    this.selectedDomainForParameters = domainName;
    
    if (domainName && domainName !== 'Unknown Domain') {
      this.filteredParameterScoresData = this.parameterScoresData.filter(
        (param: any) => param.category === domainName
      );
      console.log('Filtered parameters:', this.filteredParameterScoresData.length);
    } else {
      this.filteredParameterScoresData = [...this.parameterScoresData];
    }
    
    // Show the parameter scores table
    this.showParameterScores = true;
    
    // Scroll to parameter scores section
    setTimeout(() => {
      const element = document.querySelector('.parameters-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  /**
   * Clear domain filter and hide parameter table
   */
  clearDomainFilter(): void {
    this.selectedDomainForParameters = '';
    this.filteredParameterScoresData = [];
    this.showParameterScores = false;
  }
}
