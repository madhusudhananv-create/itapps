import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatStepper } from '@angular/material';
import { AppsService } from '../../Services/apps.service';
import { ActivatedRoute } from '@angular/router';
import { CssProjectSelectionListModel } from 'src/app/models/css-project-selection-list-model';

@Component({
  selector: 'app-csat-configuration',
  templateUrl: './csat-configuration.component.html',
  styleUrls: ['./csat-configuration.component.scss']
})
export class CsatConfigurationComponent implements OnInit {

  csatList: CssProjectSelectionListModel[] = [];
  configurationData: any = {}; 
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  step1Form: FormGroup; 
  batchCycles: any;
  selectedBatchCycle = '';
  batchId: number;
  rejectionReasons: string[] = [];
  allSpocs: any[] = [];
  allRespondents: any[] = [];
  step1ProjectList: any[] = []; 
  validationData: any[] = [];
  dpId: string = localStorage.getItem('empid');
  bulkReasonProject = '';

  projectSelection = new SelectionModel<any>(true, []);

  constructor(
    private _formBuilder: FormBuilder,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private _appservice: AppsService,
    private route: ActivatedRoute
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.step1Form = this._formBuilder.group({ valid: [''] });
    this.bindMasterData();
  }

  bindMasterData() {
    this._appservice.getActiveCurrentBatch().subscribe(data => {
      this.batchCycles = data;
      this.selectedBatchCycle = this.batchCycles.batch_name;
      this.batchId = this.batchCycles.batch_id;

      this._appservice.getCSATListforDP(localStorage.getItem('empid'), this.batchId).subscribe(csatData => {
        this.csatList = csatData;
        this.loadConfigurationData(); 
        this.loadProjects(); 
      });
    });
  }

  loadConfigurationData() {
    this.configurationData = {
      rejectionReasons: ["Project covered in another project", "Just started", "Project in transition phase", "Account getting closed", "ZIF only project", "Project created for invoicing"],
      allSpocs: [
        { "name": "John Doe", "email": "john.doe@gavs.com" },
        { "name": "Jane Smith", "email": "jane.smith@gavs.com" }
      ],
      allRespondents: []
    };
    this.rejectionReasons = this.configurationData.rejectionReasons;
    this.allSpocs = this.configurationData.allSpocs;
  }

  // --- STEP 1: PROJECT SELECTION LOGIC ---

  loadProjects() {
    this.step1ProjectList = [];
    this.projectSelection.clear();

    this.csatList.forEach(dbRow => {
      const isSelectedInDb = (dbRow.iS_SELECTED === true);
      const newProj = {
        custId: dbRow.cusT_ID,
        projId: dbRow.proJ_ID,
        account: dbRow.cusT_NM,
        accountHeadcount: dbRow.accounT_HEAD_COUNT, 
        name: dbRow.proJ_NM,
        headcount: dbRow.projecT_HEAD_COUNT,
        projectStatus: dbRow.proJ_STATUS,
        executionType: dbRow.executioN_TYPE,
        engagementType: dbRow.engagemenT_TYPE,
        sqlSpoc: dbRow.csaT_SPOC,
        sqlRespondentEmail: dbRow.respondenT_MAIL,
        sqlPredictedScore: dbRow.predicteD_SCORE,
        sqlPredictedReason: dbRow.predicteD_REASON,
        chosen: dbRow.iS_SELECTED ? 'yes' : 'no',
        reasonNotChosen: '',
        isValid: true
      };

      if (isSelectedInDb) {
        newProj.chosen = 'yes';
        this.projectSelection.select(newProj);
      } else {
        newProj.chosen = 'no';
        if (dbRow.reason) {
          newProj.reasonNotChosen = dbRow.reason;
        }
      }

      this.step1ProjectList.push(newProj);
    });
  }

  isAllProjectsSelected() {
    return this.projectSelection.selected.length === this.step1ProjectList.length;
  }

  masterToggleProjects() {
    if (this.isAllProjectsSelected()) {
      this.projectSelection.clear();
      this.step1ProjectList.forEach(p => p.chosen = 'no');
    } else {
      this.step1ProjectList.forEach(p => {
        this.projectSelection.select(p);
        p.chosen = 'yes';
        p.reasonNotChosen = '';
        p.isValid = true;
      });
    }
  }

  toggleProjectSelection(proj: any) {
    this.projectSelection.toggle(proj);
    const isSelected = this.projectSelection.isSelected(proj);
    proj.chosen = isSelected ? 'yes' : 'no';

    if (isSelected) {
      proj.reasonNotChosen = '';
      proj.isValid = true;
    } else {
      proj.isValid = !!proj.reasonNotChosen; 
    }
  }

  clearStep1() {
    this.projectSelection.clear();
    this.step1ProjectList.forEach(proj => {
      proj.reasonNotChosen = '';
      proj.chosen = 'no';
      proj.isValid = true;
    });
    this.bulkReasonProject = '';
  }

  applyBulkReasonProject() {
    if (!this.bulkReasonProject) return;
    this.step1ProjectList.forEach(proj => {
      if (!this.projectSelection.isSelected(proj)) {
        proj.reasonNotChosen = this.bulkReasonProject;
        proj.isValid = true;
      }
    });
  }

  goForwardStep1(stepper: MatStepper) {
    let isValid = true;
    if (this.projectSelection.selected.length === 0) {
      alert("Please select at least one project to proceed.");
      return;
    }
    this.step1ProjectList.forEach(proj => {
      const isSelected = this.projectSelection.isSelected(proj);

      proj.isValid = true;

      if (!isSelected) {
        if (!proj.reasonNotChosen && proj.accountHeadcount >= 10) {
          proj.isValid = false;
          isValid = false;
        }
      }
    });

    if (!isValid) {
      alert("Please provide a reason for all unselected projects.");
      return;
    }
    const projectsToSave = this.step1ProjectList.filter(proj =>
      this.projectSelection.isSelected(proj) || (!this.projectSelection.isSelected(proj) && proj.reasonNotChosen)
    );

    const saveCSATData = projectsToSave.map(proj => {
      const isSelected = this.projectSelection.isSelected(proj);

      return {
        ID: 0,
        BATCH_ID: this.batchId,
        CUST_ID: proj.custId,
        PROJ_ID: proj.projId,
        DP_ID: this.dpId,
        IS_SELECTED: isSelected,
        REASON: isSelected ? null : proj.reasonNotChosen,
        ISACTIVE: true
      };
    });

    this._appservice.saveCSATListForDP(saveCSATData, this.dpId, this.batchId).subscribe((response) => {
      alert('Project CSAT Selection saved successfully');
      this.loadValidationData();
      stepper.next();
    },
      (error) => {
        console.error('Error saving project selection', error);
      }
    );
  }
  // --- STEP 2: VALIDATION LOGIC  ---

loadValidationData() {
    const selectedProjectIds = this.step1ProjectList
      .filter(p => this.projectSelection.isSelected(p))
      .map(p => p.id);
    if (!selectedProjectIds || selectedProjectIds.length === 0) {
      this.validationData = [];
      return;
    }

    this._appservice.getCSATContactListForDP(this.dpId, this.batchId).subscribe(
      (data: any[]) => {
        this.validationData = data.map(row => {         
          if (!selectedProjectIds.includes(row.proJ_ID)) return null;
          const originalProject = this.step1ProjectList.find(p => p.id === row.proJ_ID);

          return {
            id: row.id || 0, 
            projectId: row.proJ_ID,
            project: row.proJ_NM || row.projecT_NAME, 
            respondentName: row.displaY_NAME || row.contacT_NAME,
            role: row.role, 
            emailId: row.emaiL_ID,
            predictedScore: row.predicteD_SCORE,
            reasonPrediction: row.predicteD_REASON,
            csatSpoc: row.spoc,
            csatSpocEmail: '',
            executionType: row.executioN_TYPE || (originalProject ? originalProject.executionType : ''),
            engagementType: row.engagemenT_TYPE || (originalProject ? originalProject.engagementType : ''),
            remarks: row.remarks || row.comments, 
            isEditing: false,
            isValid: true
          };
        })
        .filter(item => item !== null); 
      },
      (error) => {
        console.error('Error fetching validation list', error);
      }
    );
  }

  
  editRow(row: any) { row.isEditing = true; row.isValid = true; }

  saveRow(row: any) {
    if (!row.respondentName || !row.predictedScore || !row.csatSpoc) {
      row.isValid = false;
      return;
    }
    row.isValid = true;
    row.isEditing = false;
  }

  deleteRow(index: number) {
    const rowToDelete = this.validationData[index];
    this.validationData.splice(index, 1);

    const projectInStep1 = this.step1ProjectList.find(p => p.id === rowToDelete.projectId);
    if (projectInStep1) {
      this.projectSelection.deselect(projectInStep1);
      projectInStep1.chosen = 'no';
    }
  }
  getFilteredRespondents(val: string): any[] {
    const filterValue = (typeof val === 'string' ? val : val['name'] || '').toLowerCase();
    return this.allRespondents.filter(r => r.name.toLowerCase().includes(filterValue));
  }

  onRespondentSelected(row: any, event: any) {
    const selectedResp = event.option.value;
    row.respondentName = selectedResp.name;
    row.role = selectedResp.role;
    row.emailId = selectedResp.email;
  }

  displayRespondentFn(respondent: any): string { return respondent && respondent.name ? respondent.name : respondent; }

  getFilteredSpocs(val: string): any[] {
    const filterValue = (typeof val === 'string' ? val : val['name'] || '').toLowerCase();
    return this.allSpocs.filter(spoc => spoc.name.toLowerCase().includes(filterValue));
  }

  onSpocSelected(row: any, event: any) {
    const selectedSpoc = event.option.value;
    row.csatSpoc = selectedSpoc.name;
    row.csatSpocEmail = selectedSpoc.email;
  }

  displaySpocFn(spoc: any): string { return spoc && spoc.name ? spoc.name : spoc; }
}