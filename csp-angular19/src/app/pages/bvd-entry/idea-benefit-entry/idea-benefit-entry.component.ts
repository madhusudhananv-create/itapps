import { Component, OnInit, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BvdEntryService } from '../services/bvd-entry.service';
import { MyUtility } from '../../../shared/my-utility';
import enumBenefit, { IdeaBenefitSummary } from '../../../models/bvd-entry/idea-benefit-summary-model';
import { BenefitDetailsQuantitative, Benefits } from '../../../models/bvd-entry/benefit-details-quantitative-model';
import { Idea, IdeaImprovementType, PotentialSolutionCategory } from '../../../models/bvd-entry/idea-model';
import { AppsService } from '../../../services/apps.service';

export class BenefitViewDetails {
  ideA_BENEFIT_SUMMARY: IdeaBenefitSummary = new IdeaBenefitSummary();
  benefiT_DETAILS_QUANTITATIVE_VM: BenefitDetailsQuantitative = new BenefitDetailsQuantitative();
  benefiT_DETAILS_QUALITATIVE: any = {};
  isExpand: boolean = false;
  hidden?: boolean = false;
}

@Component({
  selector: 'app-idea-benefit-entry',
  templateUrl: './idea-benefit-entry.component.html',
  styleUrls: ['./idea-benefit-entry.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ]
})
export class IdeaBenefitEntryComponent implements OnInit {
  public _bvdService = inject(BvdEntryService);
  private _util = inject(MyUtility);
  private _appService = inject(AppsService);

  benefitsArray: Benefits[] = [];
  benefitPillars: any[] = [];
  type: any[] = [];
  beneficiary: any[] = [];
  benefitType: any[] = [];
  categories: any[] = [];
  isSubmitted: boolean = false;
  allBenefits: BenefitViewDetails[] = [];
  benefitViewDetails = new BenefitViewDetails();
  hidematAccordion: boolean = false;
  potentialCategories: PotentialSolutionCategory[] = [];
  improvementS_TYPE: IdeaImprovementType[] = [];
  processList: any[] = [];
  processAreaList: any[] = [];
  serviceAreaList: any[] = [];
  ideaIdentified: any = [];

  @Input() idea = new Idea();
  @Input() projectId: string = '';
  @Output() setStep: EventEmitter<number> = new EventEmitter<number>();

  ngOnInit() {
    
    this.ideaIdentified = this.idea.identifieD_BY;
    this.getIdeaImprovementAndCategoryList();
    
    // Load service area data based on project ID
    const projId = this.projectId || this._bvdService.projecT_ID;
    if (projId) {
      this.Service_GetServiceAreaProjectMapping(projId);
    }
    
    if (this._bvdService.bvdidea && this._bvdService.bvdidea != null && this._bvdService.bvdidea.id > 0) {
      this.fillData(this._bvdService.bvdidea);
      this.idea = this._bvdService.bvdidea;
    }

    this.benefitPillars = (this._util as any).enumSelector(enumBenefit.BENEFIT_PILLAR);
    this.type = (this._util as any).enumSelector(enumBenefit.TYPE);
    this.beneficiary = (this._util as any).enumSelector(enumBenefit.BENEFICIARY);
    this.benefitType = (this._util as any).enumSelector(enumBenefit.BENEFIT_TYPE);
    
    if (this._bvdService.bvdbenefit && this._bvdService.bvdbenefit != null && this._bvdService.bvdbenefit.length > 0)
      this.allBenefits = this._bvdService.bvdbenefit as any;
    else
      this.allBenefits.push(this.createNewRec());
      
  }

  ngOnChanges() {
    if (this._bvdService.bvdidea != null)
      this.fillData(this._bvdService.bvdidea);
  }

  getApplicableBenefits(benefit: BenefitViewDetails) {
    const categoriesArray: number[] = [];
    categoriesArray.push(benefit.ideA_BENEFIT_SUMMARY.categorY_ID);
    this._bvdService.getApplicableBenefits(categoriesArray).subscribe({
      next: (data) => {
        benefit.benefiT_DETAILS_QUANTITATIVE_VM.benefitS_ARRAY = data;
      },
      error: (err: any) => (this._util as any).serviceError(err)
    });
  }

  createNewRec(): BenefitViewDetails {
    const newRec = new BenefitViewDetails();
    newRec.ideA_BENEFIT_SUMMARY = new IdeaBenefitSummary();
    newRec.benefiT_DETAILS_QUALITATIVE = { benefiT_TITLE: '', benefiT_DESCRIPTION: '' };
    newRec.benefiT_DETAILS_QUANTITATIVE_VM = new BenefitDetailsQuantitative();
    newRec.isExpand = true;
    return newRec;
  }

  createNewBenefit() {
    if (this._bvdService.isIdeaSubmitted)
      return;
    this.allBenefits.forEach(x => x.isExpand = false);
    this.allBenefits.unshift(this.createNewRec());
  }

  btnsaveBenefits() {
    this.submitForm(0);
  }

  submitForm(flag: number) {
    
    if (this._bvdService.isIdeaSubmitted) {
      this.setNextStep();
      return;
    }
    
    if (this.allBenefits == undefined || this.allBenefits.length == 0) {
      (this._util as any).showWarning("Please Add Benefits");
      return;
    }

    if (this.idea.ideA_IMPROVEMENT_TYPE_ID == 0 || this.idea.ideA_IMPROVEMENT_TYPE_ID == undefined) {
      (this._util as any).showWarning("Please choose Improvement Type");
      return;
    }

    if (this.idea.servicE_AREA_ID == 0 || this.idea.servicE_AREA_ID == undefined) {
      (this._util as any).showWarning("Please choose Service Tower");
      return;
    }

    for (let benefit of this.allBenefits) {
      if (!benefit.ideA_BENEFIT_SUMMARY.benefiT_PILLAR_ID || benefit.ideA_BENEFIT_SUMMARY.benefiT_PILLAR_ID == null) {
        (this._util as any).showWarning('Please choose Benefit pillar');
        return;
      }

      if (!benefit.ideA_BENEFIT_SUMMARY.typE_ID || benefit.ideA_BENEFIT_SUMMARY.typE_ID == null) {
        (this._util as any).showWarning('Please choose a type');
        return;
      }

      if (!benefit.ideA_BENEFIT_SUMMARY.beneficiarY_ID || benefit.ideA_BENEFIT_SUMMARY.beneficiarY_ID == null) {
        (this._util as any).showWarning('Please choose a beneficiary type');
        return;
      }

      if (!benefit.ideA_BENEFIT_SUMMARY.benefiT_TYPE_ID || benefit.ideA_BENEFIT_SUMMARY.benefiT_TYPE_ID == null) {
        (this._util as any).showWarning('Please choose a benefit type');
        return;
      }

      if (!benefit.ideA_BENEFIT_SUMMARY.categorY_ID || benefit.ideA_BENEFIT_SUMMARY.categorY_ID == null) {
        (this._util as any).showWarning('Please choose a category');
        return;
      }

      if (benefit.ideA_BENEFIT_SUMMARY.benefiT_TYPE_ID == enumBenefit.BENEFIT_TYPE.Quantitative) {
        if (!this.validateIfAnyOneUOMisEntered(benefit)) {
          (this._util as any).showWarning('Please enter valid values for any one benefit. Enter values for current state, future state, net benefits as per UoM');
          return;
        }

        if (this.checkIfAnyUnFilledUOM(benefit)) {
          (this._util as any).showWarning('There are unfilled values. Enter values for current state, future state, net benefits as per UoM');
          return;
        }

        // Check string length for quantitative values (only if values are not null)
        const arr = benefit.benefiT_DETAILS_QUANTITATIVE_VM.benefitS_ARRAY[0];
        if ((arr.currenT_STATE_MONTH != null && arr.currenT_STATE_MONTH.toString().length > 8) ||
          (arr.currenT_STATE_YEAR != null && arr.currenT_STATE_YEAR.toString().length > 8) ||
          (arr.futurE_STATE_MONTH != null && arr.futurE_STATE_MONTH.toString().length > 8) ||
          (arr.futurE_STATE_YEAR != null && arr.futurE_STATE_YEAR.toString().length > 8) ||
          (arr.neT_BENEFITS_MONTH != null && arr.neT_BENEFITS_MONTH.toString().length > 8) ||
          (arr.neT_BENEFITS_YEAR != null && arr.neT_BENEFITS_YEAR.toString().length > 8)) {
          (this._util as any).showWarning('Please enter values less than 8 digit for current state, future state, net benefits as per UoM');
          return;
        }
      }
      else if (benefit.ideA_BENEFIT_SUMMARY.benefiT_TYPE_ID == enumBenefit.BENEFIT_TYPE.Qualitative) {
        if (!benefit.benefiT_DETAILS_QUALITATIVE.benefiT_TITLE || benefit.benefiT_DETAILS_QUALITATIVE.benefiT_TITLE == null ||
          benefit.benefiT_DETAILS_QUALITATIVE.benefiT_TITLE.trim().length == 0) {
          (this._util as any).showWarning('Please enter benefit title for qualitative benefit');
          return;
        }
      }

      benefit.ideA_BENEFIT_SUMMARY.ideA_ID = this._bvdService.ideA_ID;
    }
    
    this.updateIdea();
    this.saveBenefit(this.allBenefits, 'Submit', -1, flag);
  }

  clearData() {
    this.allBenefits = [];
    this.allBenefits.push(this.createNewRec());
  }

  deleteForm(benefit: BenefitViewDetails, index: number) {
    this.allBenefits.splice(index, 1);
    this.deleteIdeaBenefit(benefit, 'delete', index);
  }

  deleteIdeaBenefit(benefit: BenefitViewDetails, status: string, index: number) {
    this._bvdService.deleteIdeaBenefit(benefit).subscribe({
      next: (data) => {
        if (status == 'delete') {
          (this._util as any).showSuccess("Benefit Removed Successfully");
        }
      },
      error: (err: any) => (this._util as any).serviceError(err)
    });
  }

  saveBenefit(benefits: any[], status: string, index: number, flag: number) {
    this.isSubmitted = true;
    this._bvdService.saveIdeaBenefits(benefits).subscribe({
      next: (data) => {
        if (status == 'Save') {
          this.allBenefits[index] = data[0];
        }
        else
          this.allBenefits = data;

        this.isSubmitted = false;
        this.allBenefits.forEach(b => b.isExpand = true);
        this._bvdService.bvdbenefit = this.allBenefits;

        if (status == 'Submit' && flag == 1) {
          this.setNextStep();
        } else {
        }
      },
      error: (err: any) => {
        (this._util as any).serviceError(err);
        this.isSubmitted = false;
      }
    });
  }

  validateIfAnyOneUOMisEntered(benefit: BenefitViewDetails): boolean {
    let count = 0;
    let isValid;
    const arr = ['currenT_STATE', 'futurE_STATE', 'neT_BENEFITS'];
    
    for (const b of benefit.benefiT_DETAILS_QUANTITATIVE_VM.benefitS_ARRAY) {
      isValid = true;
      for (const v of arr) {
        const monthKey = `${v}_MONTH` as keyof Benefits;
        const yearKey = `${v}_YEAR` as keyof Benefits;
        
        if ((!benefit.ideA_BENEFIT_SUMMARY.iS_ONETIME && (b as any)[monthKey] == null) || 
            (!benefit.ideA_BENEFIT_SUMMARY.iS_ONETIME && isNaN(parseFloat((b as any)[monthKey]))) ||
            (b as any)[yearKey] == null || isNaN(parseFloat((b as any)[yearKey]))) {
          isValid = false;
          break;
        }
      }
      if (isValid)
        count++;
    }
    return count > 0;
  }

  checkIfAnyUnFilledUOM(benefit: BenefitViewDetails): boolean {
    const arr = ['currenT_STATE', 'futurE_STATE', 'neT_BENEFITS'];
    let isValue;
    
    for (const b of benefit.benefiT_DETAILS_QUANTITATIVE_VM.benefitS_ARRAY) {
      isValue = false;

      if ((!benefit.ideA_BENEFIT_SUMMARY.iS_ONETIME && this.isValidNumber(b.currenT_STATE_MONTH)) || 
          this.isValidNumber(b.currenT_STATE_YEAR) ||
          (!benefit.ideA_BENEFIT_SUMMARY.iS_ONETIME && this.isValidNumber(b.futurE_STATE_MONTH)) || 
          this.isValidNumber(b.futurE_STATE_YEAR) ||
          (!benefit.ideA_BENEFIT_SUMMARY.iS_ONETIME && this.isValidNumber(b.neT_BENEFITS_MONTH)) || 
          this.isValidNumber(b.neT_BENEFITS_YEAR)) {
        isValue = true;
      }

      if (isValue) {
        if ((!benefit.ideA_BENEFIT_SUMMARY.iS_ONETIME && (b.currenT_STATE_MONTH == null || !this.isValidNumber(b.currenT_STATE_MONTH))) ||
            (b.currenT_STATE_YEAR == null || !this.isValidNumber(b.currenT_STATE_YEAR)) ||
            (!benefit.ideA_BENEFIT_SUMMARY.iS_ONETIME && (b.futurE_STATE_MONTH == null || !this.isValidNumber(b.futurE_STATE_MONTH))) ||
            (b.futurE_STATE_YEAR == null || !this.isValidNumber(b.futurE_STATE_YEAR)) ||
            (!benefit.ideA_BENEFIT_SUMMARY.iS_ONETIME && (b.neT_BENEFITS_MONTH == null || !this.isValidNumber(b.neT_BENEFITS_MONTH))) ||
            (b.neT_BENEFITS_YEAR == null || !this.isValidNumber(b.neT_BENEFITS_YEAR)))
          return true;
      }
    }
    return false;
  }

  ngOnDestroy() {
  }

  setNextStep() {
    console.trace('Stack trace for setNextStep call:');
    this.setStep.emit(3);
  }

  isValidNumber(val: any): boolean {
    return !isNaN(parseFloat(val));
  }

  getCategoryByBenefitPillar(benefitSummary: IdeaBenefitSummary) {
    if (!benefitSummary.benefiT_PILLAR_ID || benefitSummary.benefiT_PILLAR_ID == 0 || 
        !benefitSummary.benefiT_TYPE_ID || benefitSummary.benefiT_TYPE_ID == 0)
      return;
      
    this._bvdService.getCategoryByBenefitPillar(benefitSummary.benefiT_PILLAR_ID, benefitSummary.benefiT_TYPE_ID).subscribe({
      next: (data) => {
        benefitSummary.categories = data;
      },
      error: (err: any) => (this._util as any).serviceError(err)
    });
  }

  setBack() {
    console.trace('Stack trace for setBack call:');
    this.setStep.emit(1);
  }

  getIdeaImprovementAndCategoryList() {
    this._bvdService.getIdeaImprovementAndCategoryList().subscribe({
      next: (data) => {
        this.improvementS_TYPE = data.improvements;
        this.potentialCategories = data.categories;
        
        if (this.improvementS_TYPE && this.improvementS_TYPE.length > 0) {
        }
        
        if (this.potentialCategories && this.potentialCategories.length > 0) {
        }
      },
      error: (err: any) => {
        console.error('Error loading improvement types and categories:', err);
        (this._util as any).serviceError(err);
      }
    });
  }

  Service_GetServiceAreaProjectMapping(projId: string) {
    if (!projId || projId == null || projId == undefined)
      return;

    this._appService.getServiceAreaProjectMapping(projId).subscribe({
      next: (data: any) => {
        this.serviceAreaList = data;
        if (this.serviceAreaList && this.serviceAreaList.length > 0) {
        }
        
        // Load process area if service area is already selected
        if (this.idea.servicE_AREA_ID) {
          this.getProcessAreas(this.idea.servicE_AREA_ID);
        }
      },
      error: (err: any) => {
        console.error('Error loading service areas:', err);
        (this._util as any).serviceError(err);
        this.serviceAreaList = [];
      }
    });
  }

  getProcessAreas(serviceAreaId: number) {
    if (serviceAreaId == null || serviceAreaId == undefined)
      return;
      
    this._appService.GetProcessAreaByServiceAreaIdNew(serviceAreaId).subscribe({
      next: (data: any) => {
        this.processAreaList = data;
        if (this.processAreaList && this.processAreaList.length > 0) {
        }
        
        // Load processes if process area is already selected
        if (this.idea.procesS_AREA_ID) {
          this.getProcesses(this.idea.procesS_AREA_ID);
        }
      },
      error: (err: any) => {
        console.error('Error loading process areas:', err);
        (this._util as any).serviceError(err);
        this.processAreaList = [];
      }
    });
  }

  getProcesses(processAreaId: number) {
    if (processAreaId == null || processAreaId == undefined)
      return;

    this._appService.GetProcessByProcessArea(processAreaId).subscribe({
      next: (data: any) => {
        this.processList = data;
        if (this.processList && this.processList.length > 0) {
        }
      },
      error: (err: any) => {
        console.error('Error loading processes:', err);
        (this._util as any).serviceError(err);
        this.processList = [];
      }
    });
  }

  async fillData(idea: Idea) {
    try {
      if (this.projectId || idea.projecT_ID) {
        const projId = this.projectId || idea.projecT_ID;
        this.Service_GetServiceAreaProjectMapping(projId);
      }
    } catch (error) {
      console.error('Error in fillData:', error);
      (this._util as any).showError('There is an error in getting data from Server.');
      return;
    }
  }

  updateIdea() {
    this.idea.identifieD_BY = this.ideaIdentified;
    this._bvdService.saveIdeaDetails(this.idea).subscribe({
      next: (idea) => {
        this.idea = idea;
        this._bvdService.bvdidea = idea;
      },
      error: (error: any) => {
        (this._util as any).serviceError(error);
        this.isSubmitted = false;
      }
    });
  }
}
