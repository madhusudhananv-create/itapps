import { Component, ElementRef, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';

import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { ChecklistModel, PM_MATURITYLEVEL_MAPPING, AuditCheckListWeightage } from '../../../models/checklist.model';
import { SetupChecklistNewComponent } from '../setup-checklist-new/setup-checklist-new.component';
import { PreviewPopupComponent } from '../process-checklist-mapping/preview-popup/preview-popup.component';

@Component({
  selector: 'app-merge-checklist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCardModule,
    SetupChecklistNewComponent,
    PreviewPopupComponent
  ],
  templateUrl: './merge-checklist.component.html',
  styleUrls: ['./merge-checklist.component.scss']
})
export class MergeChecklistComponent implements OnInit {
  isShowCreateChecklist: boolean = true;
  isShowChecklistGrid: boolean = false;
  checklists: any[] = [];
  previewChecklistsData: any[] = [];
  filteredChecklistValues: any;
  masterChecklists: any[] = [];
  _loading: boolean = false;
  showPreviewGrid: boolean = false;
  newChecklist: ChecklistModel = new ChecklistModel();
  effectivE_FROM: Date = new Date();
  isSaved: boolean = true;
  maturityLevel: PM_MATURITYLEVEL_MAPPING[] = [];
  weightage: AuditCheckListWeightage[] = [];
  checklistModel: ChecklistModel = new ChecklistModel();
  _callSave: boolean = false;

  @ViewChild('checklistSearchInput') checklistSearchInput!: ElementRef;
  @ViewChild(PreviewPopupComponent) previewComponent!: PreviewPopupComponent;
  @Output() checklistCreated = new EventEmitter<void>();

  selectedChecklists = new FormControl<number[]>([], Validators.required);
  checklistName = new FormControl('', [Validators.required, Validators.pattern('[^<|>]+')]);

  constructor(
    private _appService: AppsService,
    public _util: MyUtility,
    public _access: AccessControl
  ) {}

  ngOnInit() {
    const empId = localStorage.getItem('empid');
    this.getAllChecklistsData();
  }

  onCheckboxChange(type: string, data: any, parent: any = null, grandparent: any = null) {
    const isChecked = this.getCheckboxValue(type, data);
    this.setChildrenCheckboxes(type, data, isChecked);
  
    if (parent || grandparent) {
      this.updateParentCheckboxes(parent, grandparent);
    }
  }

  setChildrenCheckboxes(type: string, data: any, isChecked: boolean) {
    switch (type) {
      case 'serviceTower':
        data.questionS_BY_PROCESS_AREA.forEach((pa: any) => {
          pa.iS_PROCESS_AREA_SELECTED = isChecked;
          pa.questionS_BY_PROCESS.forEach((p: any) => {
            p.iS_PROCESS_SELECTED = isChecked;
            p.questions.forEach((q: any) => {
              q.iS_CHECKED = isChecked;
            });
          });
        });
        break;
      case 'processArea':
        data.questionS_BY_PROCESS.forEach((p: any) => {
          p.iS_PROCESS_SELECTED = isChecked;
          p.questions.forEach((q: any) => {
            q.iS_CHECKED = isChecked;
          });
        });
        break;
      case 'process':
        data.questions.forEach((question: any) => {
          question.iS_CHECKED = isChecked;
        });
        break;
    }
  }

  updateParentCheckboxes(parent: any = null, grandparent: any = null) {
    this.previewChecklistsData.forEach(checklist => {
      checklist.questionS_BY_SERVICE_AREA.forEach((sa: any) => {
        sa.questionS_BY_PROCESS_AREA.forEach((pa: any) => {
          pa.iS_PROCESS_AREA_SELECTED = pa.questionS_BY_PROCESS.some((p: any) => p.iS_PROCESS_SELECTED);
          pa.questionS_BY_PROCESS.forEach((p: any) => {
            p.iS_PROCESS_SELECTED = p.questions.some((q: any) => q.iS_CHECKED);
          });
        });
        sa.iS_SERVICE_TOWER_SELECTED = sa.questionS_BY_PROCESS_AREA.some((pa: any) => pa.iS_PROCESS_AREA_SELECTED);
      });
      checklist.iS_SERVICE_TOWER_SELECTED = checklist.questionS_BY_SERVICE_AREA.some((sa: any) => sa.iS_SERVICE_TOWER_SELECTED);
    });
  }

  getCheckboxValue(item: string, level: any): boolean {
    switch (item) {
      case 'serviceTower': return level.iS_SERVICE_TOWER_SELECTED;
      case 'processArea': return level.iS_PROCESS_AREA_SELECTED;
      case 'process': return level.iS_PROCESS_SELECTED;
      case 'question': return level.iS_CHECKED;
      default: return false;
    }
  }

  getAllChecklistsData(includeMerged: boolean = true) {
    this._loading = true;
    this.checklists = [];
    this._appService.getAllChecklists(includeMerged).subscribe({
      next: (data) => {
        this.checklists = data;
        this.masterChecklists = data;
        this._loading = false;
      },
      error: (error) => {
        this._loading = false;
        this._util.serviceError(error);
      }
    });
  }

  resetChecklistFilterValue(opened: boolean) {
    if (this.checklistSearchInput) {
      this.checklistSearchInput.nativeElement.value = '';
      this.applyFilterForChecklist(this.checklistSearchInput.nativeElement.value);
    }
  }

  applyFilterForChecklist(value: string) {
    let filteredChecklist: any[] = [];
    if (this.masterChecklists != null && this.masterChecklists.length > 0) {
      const selectedIds = this.selectedChecklists.value || [];
      
      filteredChecklist = this.masterChecklists.filter(item => {
        // Always include selected items
        const isSelected = selectedIds.includes(item.id);
        // Include items that match the search
        const matchesSearch = item.title.toLowerCase().includes(value.toLowerCase());
        
        return isSelected || matchesSearch;
      });
    }
    this.checklists = filteredChecklist;
  }

  previewChecklist() {
    this._loading = true;
    const selectedIds = this.selectedChecklists.value || [];
    this._appService.getMultiChecklistPreview(selectedIds).subscribe({
      next: (data) => {
        this.previewChecklistsData = data;
        this._loading = false;
      },
      error: (error) => {
        this._loading = false;
        this._util.serviceError(error);
      }
    });
  }

  createNewChecklist() {
    if (!this.selectedChecklists.value || this.selectedChecklists.value.length === 0) {
      this._util.showWarningPopup(
        'Please select at least one checklist.',
        'No Checklist Selected'
      );
      return;
    }

    if (this.selectedChecklists.value.length < 2) {
      this._util.showWarningPopup(
        'Please select a minimum of 2 checklists to continue.',
        'Unable to Merge'
      );
      return;
    }

    this._loading = true;
    this.isShowChecklistGrid = true;
    const selectedIds = this.selectedChecklists.value || [];
    this._appService.createNewMultiChecklist(selectedIds, this.newChecklist.title).subscribe({
      next: (data) => {
        this.showPreviewGrid = true;
        this._loading = false;
        this.checklistModel = data;
        this.previewChecklist();
      },
      error: (error) => {
        this._loading = false;
        // Check if error message is about minimum checklists
        const errorMessage = error?.error?.message || error?.error || error?.message || '';
        if (errorMessage.includes('minimum') || errorMessage.includes('2 checklists')) {
          this._util.showWarningPopup(
            'Please select a minimum of 2 checklists to continue.',
            'Unable to Merge'
          );
        } else if (errorMessage.includes('applicability type') || 
                   errorMessage.includes('Weightage applicable') || 
                   errorMessage.includes('Maturity applicable')) {
          this._util.showWarningPopup(
            errorMessage,
            'Unable to Merge'
          );
        } else {
          this._util.serviceError(error);
        }
      }
    });
  }

  clearSelections() {
    this.previewChecklistsData.forEach(checklist => {
      checklist.questionS_BY_SERVICE_AREA.forEach((serviceTower: any) => {
        serviceTower.questionS_BY_PROCESS_AREA.forEach((processArea: any) => {
          processArea.questionS_BY_PROCESS.forEach((process: any) => {
            process.questions.forEach((question: any) => {
              question.iS_CHECKED = false;
            });
          });
        });
      });
    });
  }

  cancel_OnClick() {
    this._loading = false;
    this.showPreviewGrid = false;
    this.isShowChecklistGrid = false;
    this.selectedChecklists.reset();
    this.previewChecklistsData = [];
  }

  saveMergeChecklist() {
    this._callSave = true;
    this._loading = true;
  }

  project_onChange($event: any) {
    const obj: any = JSON.parse($event);
    this._callSave = false;
    if (obj != undefined && obj != null && obj > 0) {
      this.saveMultiChecklist(obj);
    } else {
      // Reset loading state if validation failed
      this._loading = false;
    }
  }

  saveMultiChecklist(checklistId: number) {
    const selectedQuestions: any[] = [];
    this.previewChecklistsData.forEach(checklist => {
      checklist.questionS_BY_SERVICE_AREA.forEach((serviceTower: any) => {
        if (serviceTower.iS_SERVICE_TOWER_SELECTED) {
          serviceTower.questionS_BY_PROCESS_AREA.forEach((processArea: any) => {
            if (processArea.iS_PROCESS_AREA_SELECTED) {
              processArea.questionS_BY_PROCESS.forEach((process: any) => {
                if (process.iS_PROCESS_SELECTED) {
                  const selected = process.questions.filter((q: any) => q.iS_CHECKED);
                  selectedQuestions.push(...selected);
                }
              });
            }
          });
        }
      });
    });
  
    this._appService.saveNewMultiChecklist(this.previewChecklistsData, checklistId).subscribe({
      next: (data) => {
        this._loading = true;
        this.isSaved = true;
        this.getAllChecklistsData();
        this.showPreviewGrid = false;
        this.checklistCreated.emit();
        this._loading = false;
        this._util.showSuccess('Merged checklist saved successfully');
      },
      error: (error) => {
        this._loading = false;
        this._util.serviceError(error);
      }
    });
  }

  service_addChecklist(newChecklist: ChecklistModel) {
    this.isSaved = false;
    this._appService.addChecklist(newChecklist).subscribe({
      next: (data) => {
        if (data.id > 0) {
          this.isSaved = true;
          if (newChecklist.iS_WEIGHTAGE_APPLICABLE) {
            this.newChecklist.id = data.id;
            this.UpdateWeightageScores();
          }
          this.newChecklist = new ChecklistModel();
        }
      },
      error: (error) => {
        this._util.serviceError(error);
        this.isSaved = true;
      }
    });
  }

  UpdateWeightageScores() {
    if (this.newChecklist.id == 0 || this.newChecklist.id == null) {
      this._util.showWarningPopup(
        'Please update weightage after checklist created.',
        'Checklist Not Created'
      );
      return;
    }

    this._appService.UpdateWeightageForChecklist(this.weightage, this.newChecklist.id).subscribe({
      next: (data) => {
        this.weightage = data;
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }
}
