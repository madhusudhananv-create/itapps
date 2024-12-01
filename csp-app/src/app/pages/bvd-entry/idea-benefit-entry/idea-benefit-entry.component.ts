import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { BvdEntryService } from '../services/bvd-entry.service';
import { myUtility } from '../../../Shared/myUtility';
import enumBenefit, { IdeaBenefitSummary } from '../../../models/bvd-entry/idea-benefit-summary-model';
import { BenefitDetailsQuantitative, Benefits } from '../../../models/bvd-entry/benefit-details-quantitative-model';
import { BenefitDetailsQualitative } from '../../../models/bvd-entry/benefit-details-qualitative-model';

import { ProcessModelNew, ProcessAreaModelNew, ServiceAreaModelNew } from '../../../models/audit-checklist-based-model';
import { Idea, IdeaStatus, IdeaImprovementType, PotentialSolutionCategory } from '../../../models/bvd-entry/idea-model';
import { AppsService } from '../../../Services/apps.service';
import { Input } from '@angular/core';
import { ideaUpdate } from '../ideas-list-view/ideas-list-view.component';

@Component({
  selector: 'app-idea-benefit-entry',
  templateUrl: './idea-benefit-entry.component.html',
  styleUrls: ['./idea-benefit-entry.component.scss', '../bvd-entry-shared-css.scss']
})
export class IdeaBenefitEntryComponent implements OnInit {
  benefitsArray: Benefits[] = [];
  benefitPillars = [];
  type = [];
  beneficiary = [];
  benefitType = [];
  categories = [];
  isSubmitted: boolean = false;
  allBenefits: BenefitViewDetails[] = [];
  benefitViewDetails = new BenefitViewDetails();
  @Output() setStep: EventEmitter<number> = new EventEmitter<number>();
  hidematAccordion: boolean = false;
  potentialCategories: PotentialSolutionCategory[] = [];
  improvementS_TYPE: IdeaImprovementType[] = [];
  processList: ProcessModelNew[] = [];
  processAreaList: ProcessAreaModelNew[] = [];
  serviceAreaList: any[] = [];
  ideaIdentified: any = [];

  @Input('idea') idea = new Idea();
  @Input('projectId') projectId: string;

  constructor(public _bvdService: BvdEntryService, private _util: myUtility, private _appService: AppsService,) {
  }

  ngOnInit() {
    this.ideaIdentified = this.idea.identifieD_BY;
    this.getIdeaImprovementAndCategoryList();
    if (this._bvdService.bvdidea && this._bvdService.bvdidea != null && this._bvdService.bvdidea.id > 0) {
      this.fillData(this._bvdService.bvdidea)
      this.idea = this._bvdService.bvdidea;
    }

    this.benefitPillars = this._util.enumSelector(enumBenefit.BENEFIT_PILLAR);
    this.type = this._util.enumSelector(enumBenefit.TYPE);
    this.beneficiary = this._util.enumSelector(enumBenefit.BENEFICIARY);
    this.benefitType = this._util.enumSelector(enumBenefit.BENEFIT_TYPE);
    if (this._bvdService.bvdbenefit && this._bvdService.bvdbenefit != null && this._bvdService.bvdbenefit.length > 0)
      this.allBenefits = this._bvdService.bvdbenefit;
    else
      this.allBenefits.push(this.createNewRec());
  }

  ngOnChanges() {
    if (this._bvdService.bvdidea != null)
      this.fillData(this._bvdService.bvdidea)
  }


  getApplicableBenefits(benefit) {
    var categoriesArray = [];
    categoriesArray.push(benefit.ideA_BENEFIT_SUMMARY.categorY_ID);
    this._bvdService.getApplicableBenefits(categoriesArray).subscribe(data => {
      benefit.benefiT_DETAILS_QUANTITATIVE_VM.benefitS_ARRAY = data;
    }, (err) => { this._util.serviceError(err) })
  }

  createNewRec() {
    var newRec = new BenefitViewDetails();
    newRec.ideA_BENEFIT_SUMMARY = new IdeaBenefitSummary();
    newRec.benefiT_DETAILS_QUALITATIVE = new BenefitDetailsQualitative();
    newRec.benefiT_DETAILS_QUANTITATIVE_VM = new BenefitDetailsQuantitative();
    newRec.isExpand = true;
    return newRec;
  }

  createNewBenefit() {
    if (this._bvdService.isIdeaSubmitted)
      return;
    this.allBenefits.forEach(x => x.isExpand = false);
    this.allBenefits.unshift(this.createNewRec())
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
      alert("Please Add Benefits");
      return;
    }

    if (this.idea.ideA_IMPROVEMENT_TYPE_ID == 0 || this.idea.ideA_IMPROVEMENT_TYPE_ID == undefined) {
      alert("Please choose Improvement Type");
      return;
    }

    if (this.idea.servicE_AREA_ID == 0 || this.idea.servicE_AREA_ID == undefined) {
      alert("Please choose Service Tower");
      return;
    }

    for (let benefit of this.allBenefits) {
      if (!benefit.ideA_BENEFIT_SUMMARY.benefiT_PILLAR_ID || benefit.ideA_BENEFIT_SUMMARY.benefiT_PILLAR_ID == null) {
        alert('Please choose Benefit pillar');
        return;
      }

      if (!benefit.ideA_BENEFIT_SUMMARY.typE_ID || benefit.ideA_BENEFIT_SUMMARY.typE_ID == null) {
        alert('Please choose a type');
        return;
      }

      if (!benefit.ideA_BENEFIT_SUMMARY.beneficiarY_ID || benefit.ideA_BENEFIT_SUMMARY.beneficiarY_ID == null) {
        alert('Please choose a beneficiary type');
        return;
      }

      if (!benefit.ideA_BENEFIT_SUMMARY.benefiT_TYPE_ID || benefit.ideA_BENEFIT_SUMMARY.benefiT_TYPE_ID == null) {
        alert('Please choose a benefit type');
        return;
      }

      if (!benefit.ideA_BENEFIT_SUMMARY.categorY_ID || benefit.ideA_BENEFIT_SUMMARY.categorY_ID == null) {
        alert('Please choose a category');
        return;
      }

      if (benefit.ideA_BENEFIT_SUMMARY.benefiT_TYPE_ID == enumBenefit.BENEFIT_TYPE.Quantitative) {
        if (!this.validateIfAnyOneUOMisEntered(benefit)) {
          alert('Please enter valid values for any one benefit. Enter values for current state, future state, net benefits as per UoM');
          return;
        }

        if (this.checkIfAnyUnFilledUOM(benefit)) {
          alert('There are unfilled values. Enter values for current state, future state, net benefits as per UoM');
          return;
        }

        if (benefit.benefiT_DETAILS_QUANTITATIVE_VM.benefitS_ARRAY[0].currenT_STATE_MONTH.toString().length > 8 ||
          benefit.benefiT_DETAILS_QUANTITATIVE_VM.benefitS_ARRAY[0].currenT_STATE_YEAR.toString().length > 8 ||
          benefit.benefiT_DETAILS_QUANTITATIVE_VM.benefitS_ARRAY[0].futurE_STATE_MONTH.toString().length > 8 ||
          benefit.benefiT_DETAILS_QUANTITATIVE_VM.benefitS_ARRAY[0].futurE_STATE_YEAR.toString().length > 8 ||
          benefit.benefiT_DETAILS_QUANTITATIVE_VM.benefitS_ARRAY[0].neT_BENEFITS_MONTH.toString().length > 8 ||
          benefit.benefiT_DETAILS_QUANTITATIVE_VM.benefitS_ARRAY[0].neT_BENEFITS_YEAR.toString().length > 8) {
          alert('Please enter values less than 8 digit for current state, future state, net benefits as per UoM');
          return;
        }
      }
      else if (benefit.ideA_BENEFIT_SUMMARY.benefiT_TYPE_ID == enumBenefit.BENEFIT_TYPE.Qualitative) {
        if (!benefit.benefiT_DETAILS_QUALITATIVE.benefiT_TITLE || benefit.benefiT_DETAILS_QUALITATIVE.benefiT_TITLE == null ||
          benefit.benefiT_DETAILS_QUALITATIVE.benefiT_TITLE.trim().length == 0) {
          alert('Please enter benefit title for qualitative benefit');
          return;
        }
      }

      benefit.ideA_BENEFIT_SUMMARY.ideA_ID = this._bvdService.ideA_ID
    }
    this.updateIdea();
    this.saveBenefit(this.allBenefits, 'Submit', -1, flag);
  }

  clearData() {
    this.allBenefits = [];
    this.allBenefits.push(this.createNewRec());
  }

  deleteForm(benefit: BenefitViewDetails, index) {
    //let benefits = [];
    //benefits.push(benefit);
    this.allBenefits.splice(index, 1)
    this.deleteIdeaBenefit(benefit, 'delete', index);
    // benefits.forEach((item)=> item.hidden = !item.hidden);
    // if(index)
    //   index.hidden = false;

  }

  deleteIdeaBenefit(benefit, status, index) {
    this._bvdService.deleteIdeaBenefit(benefit).subscribe(data => {
      if (status == 'delete') {
        // this.allBenefits[index] = data[0];
        // this._bvdService.bvdbenefit = this.allBenefits;
        alert("Benefit Removed Successfully");
      }

    }, (err) => { this._util.serviceError(err) })
  }
  // saveForm(benefit: BenefitViewDetails, index) {

  //   if (!benefit.ideA_BENEFIT_SUMMARY.benefiT_PILLAR_ID || benefit.ideA_BENEFIT_SUMMARY.benefiT_PILLAR_ID == null) {
  //     alert('Please choose Benefit pillar');
  //     return;
  //   }

  //   if (!benefit.ideA_BENEFIT_SUMMARY.typE_ID || benefit.ideA_BENEFIT_SUMMARY.typE_ID == null) {
  //     alert('Please choose a type');
  //     return;
  //   }

  //   if (!benefit.ideA_BENEFIT_SUMMARY.beneficiarY_ID || benefit.ideA_BENEFIT_SUMMARY.beneficiarY_ID == null) {
  //     alert('Please choose a beneficiary type');
  //     return;
  //   }

  //   if (!benefit.ideA_BENEFIT_SUMMARY.benefiT_TYPE_ID || benefit.ideA_BENEFIT_SUMMARY.benefiT_TYPE_ID == null) {
  //     alert('Please choose a benefit type');
  //     return;
  //   }

  //   if (!benefit.ideA_BENEFIT_SUMMARY.categorY_ID || benefit.ideA_BENEFIT_SUMMARY.categorY_ID == null) {
  //     alert('Please choose a category');
  //     return;
  //   }

  //   benefit.ideA_BENEFIT_SUMMARY.ideA_ID = this._bvdService.ideA_ID;
  //   // if (benefit.ideA_BENEFIT_SUMMARY.benefiT_TYPE_ID == enumBenefit.BENEFIT_TYPE.Qualitative)
  //   //   benefit.benefiT_DETAILS_QUANTITATIVE_VM = null;
  //   // else
  //   //   benefit.benefiT_DETAILS_QUALITATIVE = null;

  //   let benefits = [];
  //   benefits.push(benefit);
  //   this.saveBenefit(benefits, 'Save', index);
  // }

  saveBenefit(benefits: any[], status, index, flag) {
    this.isSubmitted = true;
    this._bvdService.saveIdeaBenefits(benefits).subscribe(data => {
      if (status == 'Save') {
        this.allBenefits[index] = data[0];
      }
      else
        this.allBenefits = data;

      this.isSubmitted = false;
      this.allBenefits.forEach(b => b.isExpand = true);
      this._bvdService.bvdbenefit = this.allBenefits;

      if (status == 'Submit' && flag == 1)
        this.setNextStep();
    }, (err) => { this._util.serviceError(err); this.isSubmitted = false; })
  }

  validateIfAnyOneUOMisEntered(benefit) {
    let count = 0;
    let isValid;
    let arr = ['currenT_STATE', 'futurE_STATE', 'neT_BENEFITS'];
    for (var b of benefit.benefiT_DETAILS_QUANTITATIVE_VM.benefitS_ARRAY) {
      isValid = true;
      for (var v of arr) {
        if ((!benefit.ideA_BENEFIT_SUMMARY.iS_ONETIME && b[`${v}_MONTH`] == null) || (!benefit.ideA_BENEFIT_SUMMARY.iS_ONETIME && isNaN(parseFloat(b[`${v}_MONTH`])))
          || b[`${v}_YEAR`] == null || isNaN(parseFloat(b[`${v}_YEAR`]))) {
          isValid = false;
          break;
        }
      }
      if (isValid)
        count++;
    }
    return count > 0 ? true : false;
  }

  checkIfAnyUnFilledUOM(benefit) {
    let arr = ['currenT_STATE', 'futurE_STATE', 'neT_BENEFITS'];
    let isValue;
    for (var b of benefit.benefiT_DETAILS_QUANTITATIVE_VM.benefitS_ARRAY) {
      isValue = false;
      // if ((!benefit.ideA_BENEFIT_SUMMARY.iS_ONETIME && b.currenT_STATE_MONTH != null && b.currenT_STATE_MONTH.trim().length > 0) || (b.currenT_STATE_YEAR != null && b.currenT_STATE_YEAR.trim().length > 0)
      //   || (!benefit.ideA_BENEFIT_SUMMARY.iS_ONETIME && b.futurE_STATE_MONTH != null && b.futurE_STATE_MONTH.trim().length > 0) || (b.futurE_STATE_YEAR != null && b.futurE_STATE_YEAR.trim().length > 0)
      //   || (!benefit.ideA_BENEFIT_SUMMARY.iS_ONETIME && b.neT_BENEFITS_MONTH != null && b.neT_BENEFITS_MONTH.trim().length > 0) || (b.neT_BENEFITS_YEAR != null && b.neT_BENEFITS_YEAR.trim().length > 0)) {
      //   isValue = true;
      // }

      if ((!benefit.ideA_BENEFIT_SUMMARY.iS_ONETIME && this.isValidNumber(b.currenT_STATE_MONTH)) || this.isValidNumber(b.currenT_STATE_YEAR)
        || (!benefit.ideA_BENEFIT_SUMMARY.iS_ONETIME && this.isValidNumber(b.futurE_STATE_MONTH)) || this.isValidNumber(b.futurE_STATE_YEAR)
        || (!benefit.ideA_BENEFIT_SUMMARY.iS_ONETIME && this.isValidNumber(b.neT_BENEFITS_MONTH)) || this.isValidNumber(b.neT_BENEFITS_YEAR)) {
        isValue = true;
      }

      if (isValue) {
        if ((!benefit.ideA_BENEFIT_SUMMARY.iS_ONETIME && (b.currenT_STATE_MONTH == null || !this.isValidNumber(b.currenT_STATE_MONTH))) ||
          (b.currenT_STATE_YEAR == null || !this.isValidNumber(b.currenT_STATE_YEAR))
          || (!benefit.ideA_BENEFIT_SUMMARY.iS_ONETIME && (b.futurE_STATE_MONTH == null || !this.isValidNumber(b.futurE_STATE_MONTH))) ||
          (b.futurE_STATE_YEAR == null || !this.isValidNumber(b.futurE_STATE_YEAR))
          || (!benefit.ideA_BENEFIT_SUMMARY.iS_ONETIME && (b.neT_BENEFITS_MONTH == null || !this.isValidNumber(b.neT_BENEFITS_MONTH))) ||
          (b.neT_BENEFITS_YEAR == null || !this.isValidNumber(b.neT_BENEFITS_YEAR)))
          return true;
      }


    }
    return false;
  }

  ngOnDestroy() {
    console.log("idea-benefit- entry destroyed")
  }


  setNextStep() {
    this.setStep.emit(2);
  }

  isValidNumber(val) {
    return !isNaN(parseFloat(val));
  }

  getCategoryByBenefitPillar(benefitSummary) {
    if (!benefitSummary.benefiT_PILLAR_ID || benefitSummary.benefiT_PILLAR_ID == 0 || !benefitSummary.benefiT_TYPE_ID || benefitSummary.benefiT_TYPE_ID == 0)
      return
    this._bvdService.getCategoryByBenefitPillar(benefitSummary.benefiT_PILLAR_ID, benefitSummary.benefiT_TYPE_ID).subscribe(data => {
      benefitSummary.categories = data;
    }, (err) => { this._util.serviceError(err) })
  }

  setBack() {
    this.setStep.emit(0);
  }
  getIdeaImprovementAndCategoryList() {
    this._bvdService.getIdeaImprovementAndCategoryList().subscribe(data => {
      this.improvementS_TYPE = data.improvements;
      this.potentialCategories = data.categories;
    }, (err) => { this._util.serviceError(err) })
  }

  Service_GetServiceAreaProjectMapping(projId) {
    if (!projId || projId == null || projId == undefined)
      return;

    this._appService.getServiceAreasForProject(projId).subscribe(data => {
      this.serviceAreaList = data;

    }, error => { this._util.serviceError(error); });
  }

  getProcessAreas(serviceAreaId) {
    if (serviceAreaId == null || serviceAreaId == undefined)
      return;
    this._appService.GetProcessAreaByServiceAreaIdNew(serviceAreaId).subscribe(
      (data) => {
        this.processAreaList = data;
      },
      (error) => { this._util.serviceError(error) }
    )
  }

  getProcesses(processAreaId) {
    if (processAreaId == null || processAreaId == undefined)
      return;

    this._appService.GetProcessByProcessArea(processAreaId).subscribe(data => {
      this.processList = data;
    }, error => { this._util.serviceError(error); });
  }
  async fillData(idea: Idea) {

    try {
      if (idea.projecT_ID != undefined)
        this.serviceAreaList = await this._appService.getServiceAreasForProject(idea.projecT_ID).toPromise();
      if (idea.servicE_AREA_ID)
        this.processAreaList = await this._appService.GetProcessAreaByServiceAreaIdNew(idea.servicE_AREA_ID).toPromise();
      if (idea.procesS_AREA_ID)
        this.processList = await this._appService.GetProcessByProcessArea(idea.procesS_AREA_ID).toPromise();

    } catch (error) {
      alert('There is an error in getting data from Server.')
      return;
    }

  }

  updateIdea() {
    this.idea.identifieD_BY = this.ideaIdentified;
    this._bvdService.saveIdeaDetails(this.idea).subscribe(idea => {
      this.idea = idea;
      this._bvdService.bvdidea = idea;
    }, error => { this._util.serviceError(error); this.isSubmitted = false; })
  }

}
export class BenefitViewDetails {
  ideA_BENEFIT_SUMMARY: IdeaBenefitSummary;
  benefiT_DETAILS_QUANTITATIVE_VM: BenefitDetailsQuantitative;
  benefiT_DETAILS_QUALITATIVE: BenefitDetailsQualitative;
  isExpand: boolean;
}
