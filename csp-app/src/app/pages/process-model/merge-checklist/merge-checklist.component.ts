import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AppsService } from '../../../Services/apps.service'
import { Router } from '@angular/router';
import { AccessControl } from '../../../Shared/accessControl';
import { myUtility } from '../../../Shared/myUtility';
import { ChecklistModel, PM_MATURITYLEVEL_MAPPING, AuditCheckListWeightage } from './../../../models/checklist-model';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import {MatDialog } from '@angular/material';
import { PreviewPopupComponent } from '../process-checklist-mapping/preview-popup/preview-popup.component';


@Component({
  selector: 'app-merge-checklist',
  templateUrl: './merge-checklist.component.html',
  styleUrls: ['./merge-checklist.component.scss']
})
export class MergeChecklistComponent implements OnInit {
  isShowCreateChecklist = true;
  checklistForm: FormGroup;
  checklists: any;
  previewChecklistsData: any[] = [];
  filteredChecklistValues: any;
  masterChecklists: any;
  _loading: boolean = false;
  showPreviewGrid: boolean = false;
  newChecklist: ChecklistModel = new ChecklistModel();
  effectivE_FROM: Date = new Date();
  isSaved: boolean = true;
  maturityLevel: PM_MATURITYLEVEL_MAPPING[] = [];
  weightage: AuditCheckListWeightage[] = [];
  
  @ViewChild('checklistSearchInput') checklistSearchInput: ElementRef;
  @ViewChild(PreviewPopupComponent) previewComponent: PreviewPopupComponent;
  constructor(private _router: Router, public _access: AccessControl,
    private _appService: AppsService, private _util: myUtility, private form: FormBuilder, public dialog: MatDialog) {
    // this.checklistForm = this.form.group({
    //   selectedChecklists: [[], Validators.required],
    //   checklistName: ['', [Validators.required, Validators.pattern('[^<|>]+')]]
    // });
  }

  ngOnInit() {
    var empId = localStorage.getItem('empid');
    this.getAllChecklistsData();
  }

  selectedChecklists = new FormControl();
  checklistName = new FormControl('', [Validators.required, Validators.pattern('[^<|>]+')]);


  getAllChecklistsData(includeMerged: boolean = true) {
    this._loading = true;
    this.checklists = [];
    this._appService.getAllChecklists(includeMerged).subscribe(data => {
      this.checklists = data;
      this.masterChecklists = data;
      this._loading = false;
    }, error => {
      this._loading = false;
      this._util.serviceError(error);
    });

  }

  resetChecklistFilterValue(opened: boolean) {
    this.checklistSearchInput.nativeElement.value = '';
    this.applyFilterForChecklist(this.checklistSearchInput.nativeElement.value);
  }

  applyFilterForChecklist(value: string) {

    let filteredChecklist = [];
    if (this.masterChecklists != null && this.masterChecklists.length > 0 && this.masterChecklists != undefined) {
      filteredChecklist = this.masterChecklists.filter(item => item.title.toLowerCase().includes(value.toLowerCase()));
    }
    this.checklists = filteredChecklist;
  }

  // selectChecklistsData() {

  //   //if (this.checklistForm.valid) {
  //   // } else {
  //   //   console.log('Please fill in all required fields');
  //   // }
  // }

  previewChecklist() {
    this._loading = true;
    this._appService.getMultiChecklistPreview(this.selectedChecklists.value).subscribe(data => {
      this.previewChecklistsData = data;
      this.createNewChecklist();
    }, error => {
      this._loading = false;
      this._util.serviceError(error);
    });
  }
  
  createNewChecklist() {
    this._loading = true;
    this._appService.createNewMultiChecklist(this.selectedChecklists.value, this.newChecklist.title).subscribe(data => {
      this.showPreviewGrid = true;
      this._loading = false;
    }, error => {
      this._loading = false;
      this._util.serviceError(error);
    });
  }

  clearSelections() {
    this.previewChecklistsData.forEach(checklist => {
      checklist.questionS_BY_SERVICE_AREA.forEach(serviceTower => {
        serviceTower.questionS_BY_PROCESS_AREA.forEach(processArea => {
          processArea.questionS_BY_PROCESS.forEach(process => {
            process.questions.forEach(question => {
              question.selected = false;
            });
          });
        });
      });
    });
  }
  saveMergeChecklist() {

    const specialCharPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
    const numberPattern = /^[0-9\s]+$/;

    if (this.newChecklist.title == undefined || this.newChecklist.title.trim() == "") {
      alert('Please enter title');
      return;
    }
    if (this.newChecklist.description == undefined || this.newChecklist.description.trim() == "") {
      alert('Please enter description');
      return;
    }
    if (this.newChecklist.version == undefined || this.newChecklist.version == 0) {
      alert('Please enter version');
      return;
    }
    if (isNaN(this.newChecklist.version)) {
      alert('Please enter valid version');
      return;
    }
    if (this.newChecklist.version.toString().length > 11) {
      alert('Please enter a version with less than 10 digits');
      return;
    }
    if (this.newChecklist.effectivE_FROM == undefined) {
      alert('Please enter effective date');
      return;
    }
    if (this.newChecklist.maturitY_LEVEL) {

      if (this.newChecklist.procesS_MODEL_ID == undefined || this.newChecklist.procesS_MODEL_ID == 0) {
        alert('Please select a process model');
        return;
      }

      if (this.maturityLevel.length == 0) {
        alert("Maturity Level scores are not defined for the selected Process Model. Please define the Maturity Level scores before proceeding further.");
        return;
      }
    }

    if (this.newChecklist.correctivE_ACTION_TRACKING) {
      if (isNaN(this.newChecklist.findingstypE_ID) || this.newChecklist.findingstypE_ID == null) {
        alert('Please select findings type');
        return;
      }
    }

    if (isNaN(this.newChecklist.statuS_LIST_ID) || this.newChecklist.statuS_LIST_ID == null) {
      alert('Please choose a status list');
      return;
    }

    if (this.newChecklist.iS_WEIGHTAGE_APPLICABLE) {
      if (this.weightage.length == this.weightage.filter(x => x.iS_CHECKED == false).length) {
        alert('Please choose the weightage.');
        return;
      }

    }

    if ((specialCharPattern.test(this.newChecklist.title)) || numberPattern.test(this.newChecklist.title)) {
      alert('Please enter alphanumeric or numeric values along with special characters for title');
      return;
    }
    if ((specialCharPattern.test(this.newChecklist.description)) || numberPattern.test(this.newChecklist.description)) {
      alert('Please enter alphanumeric or numeric values along with special characters for description');
      return;
    }
    this.newChecklist.createD_DATE = new Date().toDateString();
    this.newChecklist.updateD_DATE = new Date().toDateString();
    this.newChecklist.effectivE_FROM = this._util.setLocaleDate(this.newChecklist.effectivE_FROM).toDateString();

    if (this.newChecklist.id == 0 || this.newChecklist.id == undefined) {
      this.service_addChecklist(this.newChecklist);
    }

    
   const selectedQuestions = [];
    this.previewChecklistsData.forEach(checklist => {
      checklist.questionS_BY_SERVICE_AREA.forEach(serviceTower => {
        serviceTower.questionS_BY_PROCESS_AREA.forEach(processArea => {
          processArea.questionS_BY_PROCESS.forEach(process => {
            const selected = process.questions.filter(q => q.selected);
            selectedQuestions.push(...selected);
          });
        });
      });
    });

  }
  service_addChecklist(newChecklist: ChecklistModel) {
    this.isSaved = false;
    this._appService.addChecklist(newChecklist).subscribe(data => {
      if (data.id > 0) {
        this.isSaved = true;
        if (newChecklist.iS_WEIGHTAGE_APPLICABLE) {
          this.newChecklist.id = data.id;
          this.UpdateWeightageScores();
        }
        alert('Checklist added successfully');
        this.newChecklist = new ChecklistModel();
      }
    }, error => { this._util.serviceError(error); this.isSaved = true });
  }

  UpdateWeightageScores() {
    if (this.newChecklist.id == 0 || this.newChecklist.id == null) {
      alert("Please update weightage after checklist created.");
      return;
    }

    this._appService.UpdateWeightageForChecklist(this.weightage, this.newChecklist.id).subscribe(data => {
      this.weightage = data;
    },
      (error) => {
        this._util.serviceError(error);
      });
  }

  


}
